import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import { sendBookingConfirmation } from '@/lib/resend';

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
  return { salonId: snapshot.docs[0].id, salonData: snapshot.docs[0].data() };
}

// PATCH /api/appointments/status — owner: update appointment status
export async function PATCH(req: NextRequest) {
  try {
    const { salonId, salonData } = await getOwnerSalonId(req);
    const db = getAdminDb();
    const body = await req.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json({ error: 'appointmentId and status are required' }, { status: 400 });
    }

    if (!['confirmed', 'canceled', 'completed', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const appointmentData = appointmentDoc.data()!;
    if (appointmentData.salonId !== salonId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await appointmentRef.update({
      status,
      updatedAt: new Date().toISOString()
    });

    // Send confirmation email to customer when confirmed
    if (status === 'confirmed' && appointmentData.customerEmail) {
      try {
        await sendBookingConfirmation({
          to: appointmentData.customerEmail,
          appointment: {
            serviceName: appointmentData.serviceName || '',
            date: appointmentData.date || '',
            time: appointmentData.time || '',
            price: Number(appointmentData.price || 0),
            salonName: salonData?.name || 'Salon',
            salonAddress: salonData?.location
          }
        });
      } catch {
        // Email sending is best-effort
      }
    }

    return NextResponse.json({ id: appointmentId, status });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
