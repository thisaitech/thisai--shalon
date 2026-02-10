import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';

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
  return snapshot.docs[0].id;
}

// GET /api/owner/appointments?date=YYYY-MM-DD — owner: get appointments for a specific date
// GET /api/owner/appointments?customerEmail=xxx — owner: get appointments for a specific customer
export async function GET(req: NextRequest) {
  try {
    const salonId = await getOwnerSalonId(req);
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const customerEmail = searchParams.get('customerEmail');

    let appointments;

    if (customerEmail) {
      // Filter by customer email for customer history
      const snapshot = await db
        .collection('appointments')
        .where('salonId', '==', salonId)
        .where('customerEmail', '==', customerEmail)
        .orderBy('date', 'desc')
        .orderBy('time', 'desc')
        .get();
      appointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else if (date) {
      // Filter by date
      try {
        const snapshot = await db
          .collection('appointments')
          .where('salonId', '==', salonId)
          .where('date', '==', date)
          .orderBy('time', 'asc')
          .get();
        appointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch {
        // Fallback if no composite index
        const snapshot = await db
          .collection('appointments')
          .where('salonId', '==', salonId)
          .get();
        appointments = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Record<string, unknown>))
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
      appointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    // Sort by date and time (newest first for customer history)
    if (!customerEmail) {
      (appointments as Record<string, unknown>[]).sort((a, b) =>
        String(b.date || '').localeCompare(String(a.date || '')) ||
        String(b.time || '').localeCompare(String(a.time || ''))
      );
    }

    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
