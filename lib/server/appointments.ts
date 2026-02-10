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

async function listActiveAppointmentsForSalonDate({
  salonId,
  date
}: {
  salonId: string;
  date: string;
}) {
  const adminDb = getAdminDb();

  // Query by salonId only (no composite index needed)
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
  customerName,
  customerPhone,
  status = 'pending',
  payment,
  notes
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
  customerName?: string | null;
  customerPhone?: string | null;
  status?: 'pending' | 'confirmed';
  payment?: PaymentInfo;
  notes?: string | null;
}) {
  const adminDb = getAdminDb();

  const duration = Math.max(1, Number(serviceDuration) || 30);
  const priceValue = price ? Number(price) : 0;
  if (!salonId || !serviceId || !date || !time) {
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
  const durationNum = Math.max(1, Number(duration) || 30); // Default to 30 min, min 1
  const hasOverlap = existing.some((item) => {
    const existingDuration = Math.max(1, Number(item.duration) || 30);
    return isOverlapping(time, durationNum, item.time, existingDuration);
  });

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
    customerName: customerName ?? null,
    customerPhone: customerPhone ?? null,
    notes: notes ?? null,
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
