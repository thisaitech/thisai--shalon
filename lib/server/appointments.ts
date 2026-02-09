import { getAdminDb } from '@/lib/firebase/admin';
import { sendBookingConfirmation, sendNewBookingAlert } from '@/lib/resend';
import {
  defaultBusinessHours,
  isOverlapping,
  isWithinBusinessHours
} from '@/lib/utils';

export type PaymentInfo =
  | {
      method: 'razorpay';
      status: 'paid';
      provider: 'razorpay';
      orderId: string;
      paymentId: string;
    }
  | {
      method: 'upi';
      status: 'pending';
      provider: 'manual';
      referenceId?: string;
    }
  | {
      method: 'cash';
      status: 'unpaid';
      provider: 'manual';
    };

function isIndexError(error: unknown) {
  const err = error as { code?: unknown; message?: unknown };
  const message = String(err?.message ?? '');
  return (
    err?.code === 9 || // FAILED_PRECONDITION (gRPC)
    message.toLowerCase().includes('requires an index') ||
    message.toLowerCase().includes('failed_precondition')
  );
}

async function listActiveAppointmentsForSalonDate({
  salonId,
  date
}: {
  salonId: string;
  date: string;
}) {
  const adminDb = getAdminDb();

  // Fast path (may require composite indexes depending on project settings).
  try {
    const snapshot = await adminDb
      .collection('appointments')
      .where('salonId', '==', salonId)
      .where('date', '==', date)
      .where('status', 'in', ['pending', 'confirmed'])
      .get();

    return snapshot.docs.map((doc) => doc.data() as { time: string; duration: number; status?: string });
  } catch (error) {
    if (!isIndexError(error)) throw error;
  }

  // Fallback 1: remove the `in` filter and filter in memory.
  try {
    const snapshot = await adminDb
      .collection('appointments')
      .where('salonId', '==', salonId)
      .where('date', '==', date)
      .get();

    return snapshot.docs
      .map((doc) => doc.data() as { time: string; duration: number; status?: string })
      .filter((item) => ['pending', 'confirmed'].includes(String(item.status ?? '')));
  } catch (error) {
    if (!isIndexError(error)) throw error;
  }

  // Fallback 2: query by salon only (no composite index needed), then filter.
  const snapshot = await adminDb
    .collection('appointments')
    .where('salonId', '==', salonId)
    .get();

  return snapshot.docs
    .map((doc) => doc.data() as { time: string; duration: number; status?: string; date?: string })
    .filter((item) => item.date === date)
    .filter((item) => ['pending', 'confirmed'].includes(String(item.status ?? '')));
}

export async function getBookedTimesForSalonDate({
  salonId,
  date
}: {
  salonId: string;
  date: string;
}) {
  const items = await listActiveAppointmentsForSalonDate({ salonId, date });
  return items.map((item) => item.time).filter(Boolean);
}

export async function createAppointment({
  salonId,
  serviceId,
  serviceName,
  serviceDuration,
  price,
  date,
  time,
  customerEmail,
  customerId,
  status = 'pending',
  payment
}: {
  salonId: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  price: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerEmail?: string | null;
  customerId?: string | null;
  status?: 'pending' | 'confirmed';
  payment?: PaymentInfo;
}) {
  const adminDb = getAdminDb();

  const duration = Number(serviceDuration);
  const priceValue = price ? Number(price) : 0;
  if (!salonId || !serviceId || !date || !time || !duration) {
    throw new Error('Missing booking details');
  }

  const salonDoc = await adminDb.collection('salons').doc(salonId).get();
  const salonData = salonDoc.exists ? salonDoc.data() : null;
  const businessHours = salonData?.businessHours ?? defaultBusinessHours;

  const selectedDate = new Date(`${date}T00:00:00`);
  if (!isWithinBusinessHours(selectedDate, time, businessHours, duration)) {
    throw new Error('Outside business hours');
  }

  const existing = await listActiveAppointmentsForSalonDate({ salonId, date });
  const hasOverlap = existing.some((item) => isOverlapping(time, duration, item.time, item.duration));

  if (hasOverlap) {
    const conflict = new Error('Selected time is no longer available');
    (conflict as Error & { status?: number }).status = 409;
    throw conflict;
  }

  const appointmentRef = await adminDb.collection('appointments').add({
    salonId,
    serviceId,
    serviceName,
    duration,
    price: priceValue,
    date,
    time,
    status,
    payment: payment ?? null,
    customerEmail: customerEmail ?? null,
    customerId: customerId ?? null,
    createdAt: new Date().toISOString()
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  if (customerEmail) {
    await sendBookingConfirmation({
      to: customerEmail,
      appointment: {
        serviceName,
        date,
        time,
        price: priceValue,
        salonName: salonData?.name ?? 'Lumiére Salon',
        salonAddress: salonData?.location
      }
    });
  }

  if (salonData?.ownerEmail) {
    await sendNewBookingAlert({
      to: salonData.ownerEmail,
      appointment: {
        serviceName,
        date,
        time,
        price: priceValue,
        salonName: salonData?.name ?? 'Lumiére Salon'
      },
      acceptUrl: `${appUrl}/dashboard/admin?appointment=${appointmentRef.id}&action=accept`,
      rejectUrl: `${appUrl}/dashboard/admin?appointment=${appointmentRef.id}&action=reject`
    });
  }

  return { id: appointmentRef.id };
}
