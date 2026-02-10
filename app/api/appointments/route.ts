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

// GET /api/appointments — get appointments for a customer or salon
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get('salonId');
    const date = searchParams.get('date');
    const customerEmail = searchParams.get('customerEmail');
    const appointmentId = searchParams.get('appointmentId');

    const adminReady = Boolean(
      process.env.FIREBASE_ADMIN_PROJECT_ID &&
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
        process.env.FIREBASE_ADMIN_PRIVATE_KEY
    );

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
      return NextResponse.json({ appointment: { id: doc.id, ...doc.data() } });
    }

    // Get customer appointments (requires auth)
    if (customerEmail) {
      const db = getAdminDb();
      const snapshot = await db
        .collection('appointments')
        .where('customerEmail', '==', customerEmail)
        .orderBy('date', 'desc')
        .orderBy('time', 'desc')
        .get();
      
      const appointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
