import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

type NotificationType =
  | 'booking'
  | 'confirmation'
  | 'cancellation'
  | 'payment'
  | 'reminder'
  | 'message';

type CustomerNotification = {
  id: string;
  appointmentId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: string;
  date?: string;
  time?: string;
  serviceName?: string;
  salonName?: string;
  salonLocation?: string;
  servicePrice?: number;
  paymentStatus?: string | null;
  createdAt: string;
  source: 'appointments' | 'notifications';
};

function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function verifyCustomer(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) throw new Error('Unauthorized');
  return getAdminAuth().verifyIdToken(token);
}

function normalizeTypeFromStatus(status: string): NotificationType {
  if (status === 'confirmed' || status === 'completed') return 'confirmation';
  if (status === 'canceled') return 'cancellation';
  if (status === 'delayed') return 'reminder';
  return 'booking';
}

function normalizeType(value: unknown, status: string): NotificationType {
  const raw = String(value || '').toLowerCase();
  if (
    raw === 'booking' ||
    raw === 'confirmation' ||
    raw === 'cancellation' ||
    raw === 'payment' ||
    raw === 'reminder' ||
    raw === 'message'
  ) {
    return raw;
  }
  return normalizeTypeFromStatus(status);
}

function defaultTitle(type: NotificationType, status: string) {
  if (type === 'confirmation') {
    return status === 'completed' ? 'Appointment Completed' : 'Appointment Confirmed';
  }
  if (type === 'cancellation') return 'Appointment Canceled';
  if (type === 'payment') return 'Payment Update';
  if (type === 'message') return 'Message from Salon';
  if (type === 'reminder') return 'Schedule Update';
  return 'Booking Pending';
}

function toIso(value: unknown) {
  const asString = String(value || '').trim();
  return asString || new Date(0).toISOString();
}

function mapAppointmentNotification({
  id,
  data,
  salon
}: {
  id: string;
  data: Record<string, unknown>;
  salon?: { name: string; location: string };
}): CustomerNotification {
  const status = String(data.status || 'pending');
  const type = normalizeTypeFromStatus(status);
  const payment =
    data.payment && typeof data.payment === 'object'
      ? (data.payment as Record<string, unknown>)
      : undefined;
  const paymentStatus =
    (typeof payment?.status === 'string' && payment.status) ||
    (typeof data.paymentStatus === 'string' ? data.paymentStatus : null);
  const price = Number(data.servicePrice || data.price || 0);

  let message = 'Your booking is waiting for salon confirmation.';
  if (status === 'confirmed') message = 'Salon confirmed your appointment.';
  if (status === 'completed') message = 'Your appointment is completed.';
  if (status === 'canceled') message = 'Salon canceled this appointment.';
  if (status === 'delayed') message = 'Salon updated your appointment schedule.';

  return {
    id: `apt-${id}`,
    appointmentId: id,
    type,
    title: defaultTitle(type, status),
    message,
    status,
    date: typeof data.date === 'string' ? data.date : undefined,
    time: typeof data.time === 'string' ? data.time : undefined,
    serviceName: typeof data.serviceName === 'string' ? data.serviceName : undefined,
    salonName:
      (typeof data.salonName === 'string' && data.salonName) || salon?.name || 'Salon',
    salonLocation:
      (typeof data.salonLocation === 'string' && data.salonLocation) ||
      salon?.location ||
      'Location unavailable',
    servicePrice: Number.isFinite(price) ? price : 0,
    paymentStatus: paymentStatus ? String(paymentStatus) : null,
    createdAt: toIso(data.updatedAt || data.createdAt),
    source: 'appointments'
  };
}

function mapStoredNotification({
  id,
  data
}: {
  id: string;
  data: Record<string, unknown>;
}): CustomerNotification {
  const status = String(data.status || 'pending');
  const type = normalizeType(data.type, status);
  const price = Number(data.servicePrice || data.price || 0);
  return {
    id: `notif-${id}`,
    appointmentId: String(data.appointmentId || ''),
    type,
    title:
      (typeof data.title === 'string' && data.title.trim()) ||
      defaultTitle(type, status),
    message:
      (typeof data.message === 'string' && data.message.trim()) ||
      'Appointment update available.',
    status,
    date: typeof data.date === 'string' ? data.date : undefined,
    time: typeof data.time === 'string' ? data.time : undefined,
    serviceName: typeof data.serviceName === 'string' ? data.serviceName : undefined,
    salonName: typeof data.salonName === 'string' ? data.salonName : undefined,
    salonLocation: typeof data.salonLocation === 'string' ? data.salonLocation : undefined,
    servicePrice: Number.isFinite(price) ? price : undefined,
    paymentStatus:
      typeof data.paymentStatus === 'string' ? data.paymentStatus : null,
    createdAt: toIso(data.createdAt || data.sentAt),
    source: 'notifications'
  };
}

function notificationKey(item: CustomerNotification) {
  if (!item.appointmentId) return item.id;
  return `${item.appointmentId}:${item.type}:${item.status}:${item.date || ''}:${item.time || ''}`;
}

function pickNewer(current: CustomerNotification, next: CustomerNotification) {
  return next.createdAt.localeCompare(current.createdAt) > 0 ? next : current;
}

function getErrorStatus(message: string) {
  const text = message.toLowerCase();
  if (
    text.includes('unauthorized') ||
    text.includes('id token') ||
    text.includes('auth')
  ) {
    return 401;
  }
  return 500;
}

async function queryDocsByField({
  collection,
  field,
  value
}: {
  collection: string;
  field: string;
  value: string;
}) {
  const db = getAdminDb();
  try {
    const snapshot = await db
      .collection(collection)
      .where(field, '==', value)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs;
  } catch {
    const snapshot = await db.collection(collection).where(field, '==', value).get();
    return snapshot.docs;
  }
}

async function queryAppointmentDocsByField({
  field,
  value
}: {
  field: string;
  value: string;
}) {
  const db = getAdminDb();
  try {
    const snapshot = await db
      .collection('appointments')
      .where(field, '==', value)
      .orderBy('updatedAt', 'desc')
      .get();
    return snapshot.docs;
  } catch {
    const snapshot = await db.collection('appointments').where(field, '==', value).get();
    return snapshot.docs;
  }
}

// GET /api/customer/notifications — customer: booking and confirmation updates
export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyCustomer(req);
    const uid = decoded.uid;
    const email = decoded.email || '';

    const appointmentDocMap = new Map<string, any>();
    const byCustomerId = await queryAppointmentDocsByField({
      field: 'customerId',
      value: uid
    });
    byCustomerId.forEach((doc) => appointmentDocMap.set(doc.id, doc));

    if (email) {
      const byCustomerEmail = await queryAppointmentDocsByField({
        field: 'customerEmail',
        value: email
      });
      byCustomerEmail.forEach((doc) => appointmentDocMap.set(doc.id, doc));
    }

    const appointmentDocs = Array.from(appointmentDocMap.values());
    const salonIds = Array.from(
      new Set(
        appointmentDocs
          .map((doc) => {
            const data = doc.data() as Record<string, unknown>;
            return typeof data.salonId === 'string' ? data.salonId : '';
          })
          .filter(Boolean)
      )
    );

    const db = getAdminDb();
    const salonEntries = await Promise.all(
      salonIds.map(async (salonId) => {
        const doc = await db.collection('salons').doc(salonId).get();
        if (!doc.exists) return null;
        const data = doc.data() || {};
        return [
          salonId,
          {
            name: typeof data.name === 'string' ? data.name : 'Salon',
            location:
              typeof data.location === 'string' ? data.location : 'Location unavailable'
          }
        ] as const;
      })
    );
    const salonsById = new Map<string, { name: string; location: string }>();
    salonEntries.forEach((entry) => {
      if (!entry) return;
      salonsById.set(entry[0], entry[1]);
    });

    const appointmentNotifications = appointmentDocs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const salonId = typeof data.salonId === 'string' ? data.salonId : '';
      return mapAppointmentNotification({
        id: doc.id,
        data,
        salon: salonsById.get(salonId)
      });
    });

    const storedNotificationDocMap = new Map<string, any>();
    const byRecipientUserId = await queryDocsByField({
      collection: 'notifications',
      field: 'recipientUserId',
      value: uid
    });
    byRecipientUserId.forEach((doc) => storedNotificationDocMap.set(doc.id, doc));

    if (email) {
      const byRecipientEmail = await queryDocsByField({
        collection: 'notifications',
        field: 'recipientEmail',
        value: email
      });
      byRecipientEmail.forEach((doc) => storedNotificationDocMap.set(doc.id, doc));
    }

    const storedNotifications = Array.from(storedNotificationDocMap.values()).map((doc) =>
      mapStoredNotification({
        id: doc.id,
        data: doc.data() as Record<string, unknown>
      })
    );

    const merged = new Map<string, CustomerNotification>();
    [...appointmentNotifications, ...storedNotifications].forEach((item) => {
      const key = notificationKey(item);
      const existing = merged.get(key);
      if (!existing) {
        merged.set(key, item);
        return;
      }
      merged.set(key, pickNewer(existing, item));
    });

    const notifications = Array.from(merged.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    const message = (error as Error).message || 'Unable to load notifications';
    return NextResponse.json(
      { error: message },
      { status: getErrorStatus(message) }
    );
  }
}
