import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';

function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function verifyUser(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) throw new Error('Unauthorized');
  const decoded = await getAdminAuth().verifyIdToken(token);
  return decoded.uid;
}

// GET /api/wishlist — get user's wishlist
export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    const db = getAdminDb();

    const snapshot = await db
      .collection('wishlist')
      .where('userId', '==', uid)
      .orderBy('addedAt', 'desc')
      .get();

    const wishlist = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/wishlist — add item to wishlist
export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    const db = getAdminDb();
    const body = await req.json();

    const { salonId, salonName, salonLocation, salonRating, serviceId, serviceName, servicePrice, serviceDuration } = body;

    if (!salonId || !serviceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already in wishlist
    const existing = await db
      .collection('wishlist')
      .where('userId', '==', uid)
      .where('serviceId', '==', serviceId)
      .get();

    if (!existing.empty) {
      return NextResponse.json({ error: 'Item already in wishlist' }, { status: 400 });
    }

    const wishlistRef = await db.collection('wishlist').add({
      userId: uid,
      salonId,
      salonName,
      salonLocation,
      salonRating,
      serviceId,
      serviceName,
      servicePrice,
      serviceDuration,
      addedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      id: wishlistRef.id,
      message: 'Added to wishlist' 
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
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
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
