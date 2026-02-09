import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { createAppointment, type PaymentInfo } from '@/lib/server/appointments';

export async function GET(req: NextRequest) {
  try {
    const adminReady = Boolean(
      process.env.FIREBASE_ADMIN_PROJECT_ID &&
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
        process.env.FIREBASE_ADMIN_PRIVATE_KEY
    );
    if (!adminReady) {
      return NextResponse.json(
        { bookedTimes: [], warning: 'Admin SDK not configured' },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get('salonId');
    const date = searchParams.get('date');

    if (!salonId || !date) {
      return NextResponse.json({ error: 'Missing salonId or date' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const snapshot = await adminDb
      .collection('appointments')
      .where('salonId', '==', salonId)
      .where('date', '==', date)
      .where('status', 'in', ['pending', 'confirmed'])
      .get();

    const bookedTimes = snapshot.docs.map((doc) => doc.data().time as string);

    return NextResponse.json({ bookedTimes });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Server error' },
      { status: 500 }
    );
  }
}

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
          error:
            'Server booking is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local.'
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
      paymentMethod,
      paymentReferenceId
    } = body;

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
      status: 'pending',
      payment
    });

    return NextResponse.json({ id: result.id });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: (error as Error).message || 'Server error' },
      { status }
    );
  }
}
