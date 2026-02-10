import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';

function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

// GET /api/notifications — fetch notifications for current user
export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const db = getAdminDb();

    const snapshot = await db
      .collection('notifications')
      .where('userId', '==', decoded.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications — create a notification
export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await getAdminAuth().verifyIdToken(token);
    const db = getAdminDb();
    const body = await req.json();

    const { userId, title, message, type, appointmentId } = body;
    if (!userId || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ref = await db.collection('notifications').add({
      userId,
      title,
      message,
      type: type || 'info',
      appointmentId: appointmentId || null,
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ id: ref.id });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications — mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const db = getAdminDb();
    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      const snapshot = await db
        .collection('notifications')
        .where('userId', '==', decoded.uid)
        .where('read', '==', false)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
      return NextResponse.json({ updated: snapshot.size });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId required' }, { status: 400 });
    }

    const ref = db.collection('notifications').doc(notificationId);
    const doc = await ref.get();
    if (!doc.exists || doc.data()?.userId !== decoded.uid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await ref.update({ read: true });
    return NextResponse.json({ id: notificationId, read: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Server error' },
      { status: 500 }
    );
  }
}
