import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import {
  defaultBusinessHours,
  isOverlapping,
  isWithinBusinessHours
} from '@/lib/utils';
import { sendBookingConfirmation, sendNewBookingAlert } from '@/lib/resend';

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

    const adminDb = getAdminDb();
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
      customerId
    } = body;

    const duration = Number(serviceDuration);
    const priceValue = price ? Number(price) : 0;

    if (!salonId || !serviceId || !date || !time || !duration) {
      return NextResponse.json({ error: 'Missing booking details' }, { status: 400 });
    }

    const salonDoc = await adminDb.collection('salons').doc(salonId).get();
    const salonData = salonDoc.exists ? salonDoc.data() : null;
    const businessHours = salonData?.businessHours ?? defaultBusinessHours;

    const selectedDate = new Date(`${date}T00:00:00`);
    if (!isWithinBusinessHours(selectedDate, time, businessHours, duration)) {
      return NextResponse.json(
        { error: 'Outside business hours' },
        { status: 400 }
      );
    }

    const existing = await adminDb
      .collection('appointments')
      .where('salonId', '==', salonId)
      .where('date', '==', date)
      .where('status', 'in', ['pending', 'confirmed'])
      .get();

    const hasOverlap = existing.docs.some((doc) => {
      const data = doc.data();
      return isOverlapping(time, duration, data.time, data.duration);
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'Selected time is no longer available' },
        { status: 409 }
      );
    }

    const appointmentRef = await adminDb.collection('appointments').add({
      salonId,
      serviceId,
      serviceName,
      duration,
      price: priceValue,
      date,
      time,
      status: 'pending',
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

    return NextResponse.json({ id: appointmentRef.id });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Server error' },
      { status: 500 }
    );
  }
}
