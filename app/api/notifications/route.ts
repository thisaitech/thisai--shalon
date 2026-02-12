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

function normalizeNotificationType(type: string) {
  if (['booking', 'payment', 'message', 'cancellation', 'confirmation', 'reminder'].includes(type)) {
    return type;
  }
  // Customer-contact actions from owner calendar map to a reminder notification.
  if (type === 'email' || type === 'sms') {
    return 'reminder';
  }
  return 'reminder';
}

function buildNotificationContent({
  type,
  customerName,
  serviceName,
  status
}: {
  type: string;
  customerName?: string;
  serviceName?: string;
  status?: string;
}) {
  const name = customerName || 'Customer';
  const service = serviceName || 'service';

  if (type === 'payment') {
    return {
      title: 'Payment Update',
      message: `${name} payment status updated for ${service}.`
    };
  }
  if (type === 'cancellation') {
    return {
      title: 'Booking Cancelled',
      message: `${name} cancelled ${service}.`
    };
  }
  if (type === 'confirmation') {
    return {
      title: 'Booking Confirmed',
      message: `${name} booking confirmed for ${service}.`
    };
  }
  if (type === 'booking') {
    return {
      title: 'New Booking',
      message: `${name} requested ${service}.`
    };
  }

  return {
    title: 'Reminder Sent',
    message: `Reminder sent to ${name} for ${service}${status ? ` (${status})` : ''}.`
  };
}

// POST /api/notifications — owner: send notification to client
export async function POST(req: NextRequest) {
  try {
    const salonId = await getOwnerSalonId(req);
    const db = getAdminDb();
    const body = await req.json();
    
    const {
      appointmentId,
      type,
      customerEmail,
      customerPhone,
      customerName,
      customerId,
      serviceName,
      date,
      time,
      status,
      title,
      message
    } = body;
    
    if (!appointmentId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedType = normalizeNotificationType(String(type));
    const content = buildNotificationContent({
      type: normalizedType,
      customerName,
      serviceName,
      status
    });
    const timestamp = new Date().toISOString();

    const notificationRef = await db.collection('notifications').add({
      salonId,
      appointmentId,
      type: normalizedType,
      recipientUserId: customerId || null,
      recipientEmail: customerEmail,
      recipientPhone: customerPhone,
      customerName,
      serviceName,
      date,
      time,
      status,
      title: typeof title === 'string' && title.trim() ? title.trim() : content.title,
      message:
        typeof message === 'string' && message.trim() ? message.trim() : content.message,
      channel: type === 'email' || type === 'sms' ? type : 'system',
      sentAt: timestamp,
      createdAt: timestamp,
      read: false
    });

    // TODO: Integrate with actual SMS/Email service (Twilio, SendGrid, etc.)
    // For now, we'll just log and return success
    
    console.log(`[Notification] ${String(type).toUpperCase()} sent for appointment ${appointmentId}`);
    console.log(`  Customer: ${customerName || customerEmail}`);
    console.log(`  Service: ${serviceName}`);
    console.log(`  Date: ${date} at ${time}`);
    console.log(`  Status: ${status}`);

    return NextResponse.json({
      success: true, 
      message: `${normalizedType} notification queued successfully`,
      notificationId: notificationRef.id
    });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// GET /api/notifications — owner: get notification history
export async function GET(req: NextRequest) {
  try {
    const salonId = await getOwnerSalonId(req);
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');

    let snapshot;
    try {
      let query = db.collection('notifications').where('salonId', '==', salonId);
      if (appointmentId) {
        query = query.where('appointmentId', '==', appointmentId);
      }
      snapshot = await query.orderBy('createdAt', 'desc').get();
    } catch {
      let query = db.collection('notifications').where('salonId', '==', salonId);
      if (appointmentId) {
        query = query.where('appointmentId', '==', appointmentId);
      }
      snapshot = await query.get();
    }

    const notifications = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Record<string, unknown>))
      .sort((a, b) =>
        String(b.createdAt || b.sentAt || '').localeCompare(String(a.createdAt || a.sentAt || ''))
      );

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
