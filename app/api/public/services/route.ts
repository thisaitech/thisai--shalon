import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

// GET /api/public/services?salonId=xxx — public: get services for a salon (no auth required)
export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get('salonId');

    if (!salonId) {
      return NextResponse.json({ error: 'salonId is required' }, { status: 400 });
    }

    // Get salon details
    const salonDoc = await db.collection('salons').doc(salonId).get();
    if (!salonDoc.exists) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    const salonData = salonDoc.data();

    // Get services from subcollection
    const servicesSnapshot = await db
      .collection('salons')
      .doc(salonId)
      .collection('services')
      .orderBy('createdAt', 'asc')
      .get();

    let services = servicesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    // If no services in subcollection, fallback to salon doc's services array
    if (services.length === 0 && salonData?.services && Array.isArray(salonData.services)) {
      services = salonData.services;
    }

    return NextResponse.json({
      salon: {
        id: salonDoc.id,
        name: salonData?.name,
        location: salonData?.location,
        phone: salonData?.phone,
        businessHours: salonData?.businessHours
      },
      services
    });
  } catch (error) {
    console.error('Error fetching public services:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
