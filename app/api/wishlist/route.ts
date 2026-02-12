import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';

type ApiError = Error & { status?: number };

function withStatus(message: string, status: number): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
}

function isFirestoreIndexError(error: unknown) {
  const message = (error as Error)?.message || '';
  return (
    message.includes('FAILED_PRECONDITION') ||
    message.includes('requires an index')
  );
}

function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function verifyUser(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) throw withStatus('Unauthorized', 401);
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw withStatus('Unauthorized', 401);
  }
}

async function getWishlistDocsByUser(uid: string) {
  const db = getAdminDb();
  try {
    const snapshot = await db
      .collection('wishlist')
      .where('userId', '==', uid)
      .orderBy('addedAt', 'desc')
      .get();
    return snapshot.docs;
  } catch (error) {
    if (!isFirestoreIndexError(error)) throw error;

    // Fallback path when composite index is not created yet.
    const snapshot = await db.collection('wishlist').where('userId', '==', uid).get();
    return snapshot.docs.sort((a, b) =>
      String(b.data().addedAt || '').localeCompare(String(a.data().addedAt || ''))
    );
  }
}

async function findExistingWishlistItem({
  uid,
  salonId,
  serviceId
}: {
  uid: string;
  salonId: string;
  serviceId: string;
}) {
  const db = getAdminDb();
  try {
    const snapshot = await db
      .collection('wishlist')
      .where('userId', '==', uid)
      .where('salonId', '==', salonId)
      .where('serviceId', '==', serviceId)
      .limit(1)
      .get();
    return snapshot.docs[0] || null;
  } catch (error) {
    if (!isFirestoreIndexError(error)) throw error;

    const snapshot = await db.collection('wishlist').where('userId', '==', uid).get();
    return (
      snapshot.docs.find(
        (doc) =>
          String(doc.data().salonId || '') === salonId &&
          String(doc.data().serviceId || '') === serviceId
      ) || null
    );
  }
}

// GET /api/wishlist — get user's wishlist
export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    const docs = await getWishlistDocsByUser(uid);
    const wishlist = docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    const err = error as ApiError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

// POST /api/wishlist — add item to wishlist
export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    const db = getAdminDb();
    const body = await req.json();

    const {
      salonId,
      salonName,
      salonLocation,
      salonRating,
      serviceId,
      serviceName,
      servicePrice,
      serviceDuration
    } = body;

    if (!salonId || !serviceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already in wishlist
    const existing = await findExistingWishlistItem({
      uid,
      salonId: String(salonId),
      serviceId: String(serviceId)
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadySaved: true,
        id: existing.id,
        message: 'Already in wishlist'
      });
    }

    let resolvedSalonName = typeof salonName === 'string' ? salonName : '';
    let resolvedSalonLocation = typeof salonLocation === 'string' ? salonLocation : '';
    let resolvedSalonRating = Number(salonRating || 0);
    let resolvedServiceName = typeof serviceName === 'string' ? serviceName : '';
    let resolvedServicePrice = Number(servicePrice || 0);
    let resolvedServiceDuration = Number(serviceDuration || 0);

    const salonDoc = await db.collection('salons').doc(String(salonId)).get();
    const salonData = salonDoc.exists ? salonDoc.data() || {} : {};

    if (!resolvedSalonName) {
      resolvedSalonName =
        typeof salonData.name === 'string' ? salonData.name : 'Salon';
    }
    if (!resolvedSalonLocation) {
      resolvedSalonLocation =
        typeof salonData.location === 'string'
          ? salonData.location
          : 'Location unavailable';
    }
    if (!resolvedSalonRating || !Number.isFinite(resolvedSalonRating)) {
      resolvedSalonRating = Number(salonData.rating || 4.8);
    }

    const serviceDoc = await db
      .collection('salons')
      .doc(String(salonId))
      .collection('services')
      .doc(String(serviceId))
      .get();
    const serviceData = serviceDoc.exists ? serviceDoc.data() || {} : {};

    if (!resolvedServiceName) {
      resolvedServiceName =
        typeof serviceData.name === 'string'
          ? serviceData.name
          : typeof serviceId === 'string'
            ? serviceId
            : 'Service';
    }
    if (!resolvedServicePrice || !Number.isFinite(resolvedServicePrice)) {
      resolvedServicePrice = Number(serviceData.price || 0);
    }
    if (!resolvedServiceDuration || !Number.isFinite(resolvedServiceDuration)) {
      resolvedServiceDuration = Number(serviceData.duration || 30);
    }

    const wishlistRef = await db.collection('wishlist').add({
      userId: uid,
      salonId,
      salonName: resolvedSalonName,
      salonLocation: resolvedSalonLocation,
      salonRating: resolvedSalonRating,
      serviceId,
      serviceName: resolvedServiceName,
      servicePrice: resolvedServicePrice,
      serviceDuration: resolvedServiceDuration,
      addedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      id: wishlistRef.id,
      message: 'Added to wishlist' 
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    const err = error as ApiError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

// DELETE /api/wishlist?id=xxx — remove item from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
    }

    const doc = await db.collection('wishlist').doc(itemId).get();
    if (!doc.exists || doc.data()?.userId !== uid) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await db.collection('wishlist').doc(itemId).delete();

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    const err = error as ApiError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
