import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';

type ApiError = Error & { status?: number };

function withStatus(message: string, status: number): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
}

type AppointmentRecord = Record<string, unknown> & {
  price?: number | string;
  payment?: Record<string, unknown>;
  paymentMethod?: string;
  paymentStatus?: string;
};

type NormalizedAppointment = Record<string, unknown> & {
  id: string;
  salonId: string;
  date?: string;
  time?: string;
  price: number;
  servicePrice: number;
  paymentMethod: string | null;
  paymentStatus: string | null;
};

function normalizeAppointment({
  id,
  data
}: {
  id: string;
  data: AppointmentRecord;
}): NormalizedAppointment {
  const payment =
    data.payment && typeof data.payment === 'object'
      ? (data.payment as Record<string, unknown>)
      : undefined;
  const paymentMethod =
    (typeof payment?.method === 'string' && payment.method) ||
    (typeof data.paymentMethod === 'string' ? data.paymentMethod : null);
  const paymentStatus =
    (typeof payment?.status === 'string' && payment.status) ||
    (typeof data.paymentStatus === 'string' ? data.paymentStatus : null);
  const normalizedPrice = Number(data.price || 0);
  const salonId = typeof data.salonId === 'string' ? data.salonId : '';

  return {
    id,
    ...data,
    salonId,
    price: normalizedPrice,
    servicePrice: normalizedPrice,
    paymentMethod,
    paymentStatus
  } as NormalizedAppointment;
}

function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function getOwnerSalonId(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) throw withStatus('Unauthorized', 401);
  const decoded = await getAdminAuth().verifyIdToken(token);
  const db = getAdminDb();
  const snapshot = await db.collection('salons').where('ownerId', '==', decoded.uid).limit(1).get();
  if (snapshot.empty) throw withStatus('No salon found for this owner', 404);
  return snapshot.docs[0].id;
}

// GET /api/owner/appointments?date=YYYY-MM-DD — owner: get appointments for a specific date
// GET /api/owner/appointments?customerEmail=xxx — owner: get appointments for a specific customer
// GET /api/owner/appointments?appointmentId=xxx — owner: get one appointment by id
export async function GET(req: NextRequest) {
  try {
    const salonId = await getOwnerSalonId(req);
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const customerEmail = searchParams.get('customerEmail');
    const appointmentId = searchParams.get('appointmentId');

    let appointments;

    if (appointmentId) {
      const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
      if (!appointmentDoc.exists) {
        throw withStatus('Appointment not found', 404);
      }

      const appointment = normalizeAppointment({
        id: appointmentDoc.id,
        data: appointmentDoc.data() as AppointmentRecord
      });
      if (appointment.salonId !== salonId) {
        throw withStatus('Unauthorized', 403);
      }

      appointments = [appointment];
    } else if (customerEmail) {
      // Filter by customer email for customer history
      const snapshot = await db
        .collection('appointments')
        .where('salonId', '==', salonId)
        .where('customerEmail', '==', customerEmail)
        .orderBy('date', 'desc')
        .orderBy('time', 'desc')
        .get();
      appointments = snapshot.docs.map((doc) =>
        normalizeAppointment({ id: doc.id, data: doc.data() as AppointmentRecord })
      );
    } else if (date) {
      // Filter by date
      try {
        const snapshot = await db
          .collection('appointments')
          .where('salonId', '==', salonId)
          .where('date', '==', date)
          .orderBy('time', 'asc')
          .get();
        appointments = snapshot.docs.map((doc) =>
          normalizeAppointment({ id: doc.id, data: doc.data() as AppointmentRecord })
        );
      } catch {
        // Fallback if no composite index
        const snapshot = await db
          .collection('appointments')
          .where('salonId', '==', salonId)
          .get();
        appointments = snapshot.docs
          .map((doc) =>
            normalizeAppointment({ id: doc.id, data: doc.data() as AppointmentRecord })
          )
          .filter((d) => d.date === date)
          .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
      }
    } else {
      // Get all appointments
      const snapshot = await db
        .collection('appointments')
        .where('salonId', '==', salonId)
        .orderBy('date', 'desc')
        .orderBy('time', 'desc')
        .get();
      appointments = snapshot.docs.map((doc) =>
        normalizeAppointment({ id: doc.id, data: doc.data() as AppointmentRecord })
      );
    }

    // Sort by date and time (newest first for customer history)
    if (!customerEmail && !appointmentId && !date) {
      (appointments as Record<string, unknown>[]).sort((a, b) =>
        String(b.date || '').localeCompare(String(a.date || '')) ||
        String(b.time || '').localeCompare(String(a.time || ''))
      );
    }

    return NextResponse.json({ appointments });
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
