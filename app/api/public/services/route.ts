import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { defaultBusinessHours } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type RawService = {
  id?: string;
  name?: string;
  description?: string;
  price?: number | string;
  duration?: number | string;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeService(item: RawService, fallbackId: string) {
  return {
    id: item.id || fallbackId,
    name: item.name || 'Service',
    description: item.description || '',
    price: Number(item.price || 0),
    duration: Number(item.duration || 30),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

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

    const salonData = salonDoc.data() || {};

    // Get services from subcollection
    const servicesSnapshot = await db
      .collection('salons')
      .doc(salonId)
      .collection('services')
      .orderBy('createdAt', 'asc')
      .get();

    let services = servicesSnapshot.docs.map((doc) =>
      normalizeService(doc.data() as RawService, doc.id)
    );

    return NextResponse.json({
      salon: {
        id: salonDoc.id,
        name: salonData?.name || 'Salon',
        location: salonData?.location || 'Location unavailable',
        phone: salonData?.phone || '',
        image:
          salonData?.image ||
          salonData?.coverUrl ||
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
        tags: Array.isArray(salonData?.tags) ? salonData.tags : [],
        rating: Number(salonData?.rating || 4.8),
        distance: typeof salonData?.distance === 'string' ? salonData.distance : '',
        businessHours: salonData?.businessHours || defaultBusinessHours
      },
      services
    });
  } catch (error) {
    console.error('Error fetching public services:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
