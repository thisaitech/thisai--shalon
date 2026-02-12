import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { defaultBusinessHours } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection('salons').get();

    const salons = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() || {};
        const hasSubcollectionServices = !(
          await db.collection('salons').doc(doc.id).collection('services').limit(1).get()
        ).empty;

        return {
          id: doc.id,
          name: data.name || 'Salon',
          location: data.location || 'Location unavailable',
          image:
            data.image ||
            data.coverUrl ||
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
          rating: Number(data.rating || 4.8),
          distance: typeof data.distance === 'string' ? data.distance : '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          businessHours: data.businessHours || defaultBusinessHours,
          hasServices: hasSubcollectionServices
        };
      })
    );

    return NextResponse.json({ salons });
  } catch (error) {
    console.error('Error fetching public salons:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
