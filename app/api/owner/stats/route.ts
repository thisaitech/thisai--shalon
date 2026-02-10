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

// GET /api/owner/stats — owner: get dashboard stats
export async function GET(req: NextRequest) {
  try {
    const salonId = await getOwnerSalonId(req);
    const db = getAdminDb();
    const todayKey = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

    // Get today's appointments
    let todayAppointments;
    try {
      const snapshot = await db
        .collection('appointments')
        .where('salonId', '==', salonId)
        .where('date', '==', todayKey)
        .get();
      todayAppointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch {
      const snapshot = await db
        .collection('appointments')
        .where('salonId', '==', salonId)
        .get();
      todayAppointments = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Record<string, unknown>))
        .filter((d) => d.date === todayKey);
    }

    // Get this month's appointments for monthly stats
    let monthlyAppointments;
    try {
      const snapshot = await db
        .collection('appointments')
        .where('salonId', '==', salonId)
        .where('date', '>=', firstDayOfMonth)
        .get();
      monthlyAppointments = snapshot.docs.map((doc) => doc.data());
    } catch {
      const snapshot = await db
        .collection('appointments')
        .where('salonId', '==', salonId)
        .get();
      monthlyAppointments = snapshot.docs
        .map((doc) => doc.data() as Record<string, unknown>)
        .filter((d) => d.date && d.date >= firstDayOfMonth);
    }

    // Get all appointments for this salon for stats
    const allSnapshot = await db
      .collection('appointments')
      .where('salonId', '==', salonId)
      .get();
    const allAppointments = allSnapshot.docs.map((doc) => doc.data());

    // Calculate today's stats
    const todayCount = todayAppointments.length;
    const todayRevenue = todayAppointments.reduce(
      (sum: number, a: Record<string, unknown>) => sum + Number(a.price || 0), 0
    );
    const avgDuration = todayAppointments.length > 0
      ? Math.round(todayAppointments.reduce(
          (sum: number, a: Record<string, unknown>) => sum + Number(a.duration || 0), 0
        ) / todayAppointments.length)
      : 0;

    // Calculate monthly stats
    const completedThisMonth = (monthlyAppointments as Record<string, unknown>[])
      .filter((a) => a.status === 'completed').length;
    const monthlyRevenue = (monthlyAppointments as Record<string, unknown>[])
      .reduce((sum: number, a) => sum + Number(a.price || 0), 0);

    // Calculate pending appointments
    const pendingAppointments = (todayAppointments as Record<string, unknown>[])
      .filter((a) => a.status === 'pending').length;

    // Calculate returning clients %
    const customerCounts = new Map<string, number>();
    for (const a of allAppointments) {
      const key = a.customerEmail || a.customerId;
      if (key) customerCounts.set(key, (customerCounts.get(key) || 0) + 1);
    }
    const totalCustomers = customerCounts.size;
    const returningCustomers = Array.from(customerCounts.values()).filter((c) => c > 1).length;
    const returningPct = totalCustomers > 0
      ? Math.round((returningCustomers / totalCustomers) * 100)
      : 0;

    // Upcoming appointments (today, status pending/confirmed, sorted by time)
    const upcoming = (todayAppointments as Record<string, unknown>[])
      .filter((a) => ['pending', 'confirmed'].includes(String(a.status || '')))
      .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));

    return NextResponse.json({
      stats: {
        todayAppointments: todayCount,
        todayRevenue,
        avgDuration: avgDuration ? `${avgDuration}m` : '0m',
        returningPct: `${returningPct}%`,
        totalCustomers,
        pendingAppointments,
        completedThisMonth,
        monthlyRevenue
      },
      upcoming: upcoming.map((a) => ({
        id: a.id,
        serviceName: a.serviceName,
        time: a.time,
        customerEmail: a.customerEmail,
        customerPhone: a.customerPhone,
        customerName: a.customerName,
        status: a.status,
        price: a.price
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
