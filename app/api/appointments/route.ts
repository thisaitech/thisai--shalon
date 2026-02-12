import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import {
  createAppointment,
  getBookedTimesForSalonDate,
  type PaymentInfo
} from '@/lib/server/appointments';

function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

type AppointmentDoc = Record<string, unknown> & {
  salonId?: string;
  payment?: Record<string, unknown>;
  paymentMethod?: string;
  paymentStatus?: string;
  price?: number | string;
};

async function queryCustomerAppointmentsByField({
  field,
  value
}: {
  field: 'customerId' | 'customerEmail';
  value: string;
}) {
  const db = getAdminDb();
  try {
    const snapshot = await db
      .collection('appointments')
      .where(field, '==', value)
      .orderBy('date', 'desc')
      .orderBy('time', 'desc')
      .get();
    return snapshot.docs;
  } catch {
    const snapshot = await db.collection('appointments').where(field, '==', value).get();
    return snapshot.docs;
  }
}

async function loadSalonMap(salonIds: string[]) {
  const db = getAdminDb();
  const ids = Array.from(new Set(salonIds.filter(Boolean)));
  const entries = await Promise.all(
    ids.map(async (id) => {
      const salonDoc = await db.collection('salons').doc(id).get();
      if (!salonDoc.exists) return null;
      const data = salonDoc.data() || {};
      return [
        id,
        {
          name: typeof data.name === 'string' ? data.name : 'Salon',
          location:
            typeof data.location === 'string' ? data.location : 'Location unavailable'
        }
      ] as const;
    })
  );

  const salons = new Map<string, { name: string; location: string }>();
  for (const entry of entries) {
    if (!entry) continue;
    salons.set(entry[0], entry[1]);
  }
  return salons;
}

function normalizeAppointment({
  id,
  data,
  salonsById
}: {
  id: string;
  data: AppointmentDoc;
  salonsById: Map<string, { name: string; location: string }>;
}) {
  const salonId = typeof data.salonId === 'string' ? data.salonId : '';
  const salon = salonsById.get(salonId);
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

  return {
    id,
    ...data,
    salonId,
    salonName:
      (typeof data.salonName === 'string' && data.salonName) || salon?.name || 'Salon',
    salonLocation:
      (typeof data.salonLocation === 'string' && data.salonLocation) ||
      salon?.location ||
      'Location unavailable',
    price: normalizedPrice,
    servicePrice: normalizedPrice,
    paymentMethod,
    paymentStatus
  };
}

// GET /api/appointments — get appointments for a customer or salon
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get('salonId');
    const date = searchParams.get('date');
    const customerEmail = searchParams.get('customerEmail');
    const customerId = searchParams.get('customerId');
    const appointmentId = searchParams.get('appointmentId');

    // Get booked times for salon/date (public endpoint)
    if (salonId && date) {
      const bookedTimes = await getBookedTimesForSalonDate({ salonId, date });
      return NextResponse.json({ bookedTimes });
    }

    // Get appointments by appointmentId
    if (appointmentId) {
      const db = getAdminDb();
      const doc = await db.collection('appointments').doc(appointmentId).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }
      const data = doc.data() as AppointmentDoc;
      const salonsById = await loadSalonMap([
        typeof data?.salonId === 'string' ? data.salonId : ''
      ]);
      return NextResponse.json({
        appointment: normalizeAppointment({ id: doc.id, data, salonsById })
      });
    }

    // Get customer appointments (requires auth)
    if (customerEmail || customerId) {
      const docMap = new Map<string, any>();
      if (customerId) {
        const byCustomerId = await queryCustomerAppointmentsByField({
          field: 'customerId',
          value: customerId
        });
        byCustomerId.forEach((doc) => docMap.set(doc.id, doc));
      }
      if (customerEmail) {
        const byCustomerEmail = await queryCustomerAppointmentsByField({
          field: 'customerEmail',
          value: customerEmail
        });
        byCustomerEmail.forEach((doc) => docMap.set(doc.id, doc));
      }

      const docs = Array.from(docMap.values()).sort((a, b) => {
        const aDate = String(a.data().date || '');
        const bDate = String(b.data().date || '');
        const aTime = String(a.data().time || '');
        const bTime = String(b.data().time || '');
        return bDate.localeCompare(aDate) || bTime.localeCompare(aTime);
      });

      const salonsById = await loadSalonMap(
        docs.map((doc) => {
          const data = doc.data() as AppointmentDoc;
          return typeof data.salonId === 'string' ? data.salonId : '';
        })
      );

      const appointments = docs.map((doc) =>
        normalizeAppointment({
          id: doc.id,
          data: doc.data() as AppointmentDoc,
          salonsById
        })
      );
      return NextResponse.json({ appointments });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/appointments — create a new appointment
export async function POST(req: NextRequest) {
  try {
    const adminReady = Boolean(
      process.env.FIREBASE_ADMIN_PROJECT_ID &&
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
        process.env.FIREBASE_ADMIN_PRIVATE_KEY
    );
    if (!adminReady) {
      return NextResponse.json(
        {
          error: 'Server booking is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local.'
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
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
      paymentMethod,
      paymentReferenceId,
      notes
    } = body;

    if (!salonId || !serviceId || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let payment: PaymentInfo | undefined = undefined;
    if (paymentMethod === 'cash') {
      payment = { method: 'cash', status: 'unpaid', provider: 'manual' };
    } else if (paymentMethod === 'upi') {
      payment = {
        method: 'upi',
        status: 'pending',
        provider: 'manual',
        referenceId: typeof paymentReferenceId === 'string' ? paymentReferenceId : undefined
      };
    }

    const result = await createAppointment({
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
      status: 'pending',
      payment,
      notes
    });

    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error('Error creating appointment:', error);
    const status = (error as Error & { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: (error as Error).message || 'Server error' },
      { status }
    );
  }
}

// PATCH /api/appointments — update appointment status (owner only)
export async function PATCH(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const db = getAdminDb();
    const body = await req.json();
    
    const { appointmentId, status, delayDate, delayReason } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 });
    }

    // Get the appointment
    const aptDoc = await db.collection('appointments').doc(appointmentId).get();
    if (!aptDoc.exists) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const aptData = aptDoc.data();

    // Verify owner owns this salon
    const salonSnapshot = await db
      .collection('salons')
      .where('ownerId', '==', decoded.uid)
      .where('__name__', '==', aptData?.salonId)
      .get();

    if (salonSnapshot.empty) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (delayDate) {
      updates.date = delayDate;
    }

    if (delayReason) {
      updates.delayReason = delayReason;
    }

    await db.collection('appointments').doc(appointmentId).update(updates);

    return NextResponse.json({ success: true, id: appointmentId });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Server error' },
      { status: 500 }
    );
  }
}
