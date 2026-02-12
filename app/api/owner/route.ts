import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';

type ApiError = Error & { status?: number };

function withStatus(message: string, status: number): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
}

function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function verifyOwner(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) throw withStatus('Unauthorized', 401);
  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    throw withStatus('Unauthorized', 401);
  }
}

function asTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

// GET /api/owner — get owner profile + salon details
export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyOwner(req);
    const uid = decoded.uid;
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
    const err = error as ApiError;
    return NextResponse.json({ error: err.message || 'Failed to load owner data' }, { status: err.status || 500 });
  }
}

// PUT /api/owner — update salon details
export async function PUT(req: NextRequest) {
  try {
    const decoded = await verifyOwner(req);
    const uid = decoded.uid;
    const db = getAdminDb();
    const body = await req.json();

    const payload = {
      name: asTrimmedString(body.name),
      location: asTrimmedString(body.location),
      ownerEmail: asTrimmedString(body.ownerEmail) || decoded.email || '',
      phone: asTrimmedString(body.phone),
      description: asTrimmedString(body.description),
      website: asTrimmedString(body.website),
      instagram: asTrimmedString(body.instagram),
      facebook: asTrimmedString(body.facebook),
      businessHours: body.businessHours ?? null
    };

    const salonSnapshot = await db.collection('salons').where('ownerId', '==', uid).limit(1).get();

    if (salonSnapshot.empty) {
      if (!payload.name || !payload.location) {
        return NextResponse.json(
          { error: 'Salon name and location are required to create your studio.' },
          { status: 400 }
        );
      }

      // Create salon document for this owner
      const newSalonRef = await db.collection('salons').add({
        ownerId: uid,
        name: payload.name,
        location: payload.location,
        ownerEmail: payload.ownerEmail,
        phone: payload.phone,
        description: payload.description,
        website: payload.website,
        instagram: payload.instagram,
        facebook: payload.facebook,
        businessHours: payload.businessHours,
        status: 'active',
        rating: 0,
        totalReviews: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      const newDoc = await newSalonRef.get();
      return NextResponse.json({ created: true, salon: { id: newDoc.id, ...newDoc.data() } });
    }

    const salonDoc = salonSnapshot.docs[0];
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.name !== undefined) updates.name = payload.name;
    if (body.location !== undefined) updates.location = payload.location;
    if (body.ownerEmail !== undefined) updates.ownerEmail = payload.ownerEmail;
    if (body.phone !== undefined) updates.phone = payload.phone;
    if (body.description !== undefined) updates.description = payload.description;
    if (body.website !== undefined) updates.website = payload.website;
    if (body.instagram !== undefined) updates.instagram = payload.instagram;
    if (body.facebook !== undefined) updates.facebook = payload.facebook;
    if (body.businessHours !== undefined) updates.businessHours = payload.businessHours;

    await salonDoc.ref.update(updates);
    const updated = await salonDoc.ref.get();
    return NextResponse.json({ created: false, salon: { id: updated.id, ...updated.data() } });
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json({ error: err.message || 'Failed to save studio' }, { status: err.status || 500 });
  }
}
