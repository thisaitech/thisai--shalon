import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';

function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function getOwnerSalonId(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) throw new Error('Unauthorized');
  const decoded = await getAdminAuth().verifyIdToken(token);
  const db = getAdminDb();
  const snapshot = await db.collection('salons').where('ownerId', '==', decoded.uid).limit(1).get();
  if (snapshot.empty) throw new Error('No salon found for this owner');
  return snapshot.docs[0].id;
}

// GET /api/services?salonId=xxx — public: get services for a salon
// GET /api/services (with auth header) — owner: get own salon's services
export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    let salonId = searchParams.get('salonId');

    if (!salonId) {
      // Try owner auth
      salonId = await getOwnerSalonId(req);
    }

    const snapshot = await db
      .collection('salons')
      .doc(salonId)
      .collection('services')
      .orderBy('createdAt', 'asc')
      .get();

    const services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ services, salonId });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/services — owner: add a service
export async function POST(req: NextRequest) {
  try {
    const salonId = await getOwnerSalonId(req);
    const db = getAdminDb();
    const body = await req.json();

    const { name, description, price, duration } = body;
    if (!name || !price || !duration) {
      return NextResponse.json({ error: 'name, price, duration are required' }, { status: 400 });
    }

    const serviceRef = await db.collection('salons').doc(salonId).collection('services').add({
      name,
      description: description || '',
      price: Number(price),
      duration: Number(duration),
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ id: serviceRef.id, name, description, price: Number(price), duration: Number(duration) });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// PUT /api/services?id=xxx — owner: update a service
export async function PUT(req: NextRequest) {
  try {
    const salonId = await getOwnerSalonId(req);
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('id');
    if (!serviceId) {
      return NextResponse.json({ error: 'Missing service id' }, { status: 400 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.duration !== undefined) updates.duration = Number(body.duration);

    await db.collection('salons').doc(salonId).collection('services').doc(serviceId).update(updates);

    const updated = await db.collection('salons').doc(salonId).collection('services').doc(serviceId).get();
    return NextResponse.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/services?id=xxx — owner: delete a service
export async function DELETE(req: NextRequest) {
  try {
    const salonId = await getOwnerSalonId(req);
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('id');
    if (!serviceId) {
      return NextResponse.json({ error: 'Missing service id' }, { status: 400 });
    }

    await db.collection('salons').doc(salonId).collection('services').doc(serviceId).delete();
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
