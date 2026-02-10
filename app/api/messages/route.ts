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

// POST /api/messages — owner: send a message to customer
export async function POST(req: NextRequest) {
  try {
    await getOwnerSalonId(req);
    const db = getAdminDb();
    const body = await req.json();
    
    const { appointmentId, sender, text } = body;
    
    if (!appointmentId || !sender || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const messageRef = await db.collection('messages').add({
      appointmentId,
      sender, // 'owner' or 'customer'
      text,
      timestamp: new Date().toISOString(),
      read: false,
      createdAt: new Date().toISOString()
    });

    // TODO: Send push notification to recipient

    return NextResponse.json({ 
      success: true, 
      messageId: messageRef.id 
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// GET /api/messages?appointmentId=xxx — get messages for an appointment
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');
    
    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId is required' }, { status: 400 });
    }

    const db = getAdminDb();
    const snapshot = await db
      .collection('messages')
      .where('appointmentId', '==', appointmentId)
      .orderBy('timestamp', 'asc')
      .get();

    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
