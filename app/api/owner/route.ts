import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';

function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function verifyOwner(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) throw new Error('Unauthorized');
  const decoded = await getAdminAuth().verifyIdToken(token);
  return decoded.uid;
}

// GET /api/owner — get owner profile + salon details
export async function GET(req: NextRequest) {
  try {
    const uid = await verifyOwner(req);
    const db = getAdminDb();

    const salonSnapshot = await db.collection('salons').where('ownerId', '==', uid).limit(1).get();
    if (salonSnapshot.empty) {
      return NextResponse.json({ salon: null, owner: { uid } });
    }

    const salonDoc = salonSnapshot.docs[0];
    return NextResponse.json({
      salon: { id: salonDoc.id, ...salonDoc.data() },
      owner: { uid }
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}

// PUT /api/owner — update salon details
export async function PUT(req: NextRequest) {
  try {
    const uid = await verifyOwner(req);
    const db = getAdminDb();
    const body = await req.json();

    const salonSnapshot = await db.collection('salons').where('ownerId', '==', uid).limit(1).get();

    if (salonSnapshot.empty) {
      // Create salon document for this owner
      const newSalonRef = await db.collection('salons').add({
        ownerId: uid,
        name: body.name || '',
        location: body.location || '',
        ownerEmail: body.ownerEmail || '',
        phone: body.phone || '',
        businessHours: body.businessHours || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      const newDoc = await newSalonRef.get();
      return NextResponse.json({ salon: { id: newDoc.id, ...newDoc.data() } });
    }

    const salonDoc = salonSnapshot.docs[0];
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.location !== undefined) updates.location = body.location;
    if (body.ownerEmail !== undefined) updates.ownerEmail = body.ownerEmail;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.businessHours !== undefined) updates.businessHours = body.businessHours;

    await salonDoc.ref.update(updates);
    const updated = await salonDoc.ref.get();
    return NextResponse.json({ salon: { id: updated.id, ...updated.data() } });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
