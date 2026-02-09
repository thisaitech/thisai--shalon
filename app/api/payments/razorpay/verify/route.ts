import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAppointment } from '@/lib/server/appointments';

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Razorpay is not configured. Set RAZORPAY_KEY_SECRET.' },
        { status: 500 }
      );
    }

    const body = (await req.json()) as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      booking: {
        salonId: string;
        serviceId: string;
        serviceName: string;
        serviceDuration: number;
        price: number;
        date: string;
        time: string;
        customerEmail?: string | null;
        customerId?: string | null;
      };
    };

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const result = await createAppointment({
      salonId: booking.salonId,
      serviceId: booking.serviceId,
      serviceName: booking.serviceName,
      serviceDuration: booking.serviceDuration,
      price: booking.price,
      date: booking.date,
      time: booking.time,
      customerEmail: booking.customerEmail,
      customerId: booking.customerId,
      status: 'confirmed',
      payment: {
        method: 'razorpay',
        status: 'paid',
        provider: 'razorpay',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      }
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
