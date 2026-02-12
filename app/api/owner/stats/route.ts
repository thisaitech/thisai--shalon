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

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isDateKey(value: string | null): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

type AppointmentRow = Record<string, unknown> & {
  id: string;
  date?: string;
  time?: string;
  status?: string;
  duration?: number | string;
  price?: number | string;
  customerEmail?: string;
  customerId?: string;
  payment?: Record<string, unknown>;
};

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isCanceled(status: unknown) {
  return String(status || '').toLowerCase() === 'canceled';
}

function isPaidOrCompleted(item: AppointmentRow) {
  const paymentStatus =
    item.payment && typeof item.payment === 'object'
      ? String((item.payment as Record<string, unknown>).status || '')
      : '';
  const status = String(item.status || '');
  return paymentStatus === 'paid' || status === 'completed';
}

// GET /api/owner/stats — owner: get dashboard stats
export async function GET(req: NextRequest) {
  try {
    const salonId = await getOwnerSalonId(req);
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const todayKey = isDateKey(dateParam) ? dateParam : toDateKey(new Date());
    const [year, month] = todayKey.split('-').map(Number);
    const firstDayOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDayOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(
      new Date(year, month, 0).getDate()
    ).padStart(2, '0')}`;

    const allSnapshot = await db
      .collection('appointments')
      .where('salonId', '==', salonId)
      .get();
    const allAppointments = allSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as AppointmentRow
    );

    const activeAppointments = allAppointments.filter((item) => !isCanceled(item.status));
    const todayAppointments = activeAppointments.filter((item) => item.date === todayKey);
    const monthlyAppointments = activeAppointments.filter((item) => {
      const date = typeof item.date === 'string' ? item.date : '';
      return date >= firstDayOfMonth && date <= lastDayOfMonth;
    });
    const upcomingPendingAppointments = activeAppointments.filter((item) => {
      const date = typeof item.date === 'string' ? item.date : '';
      return item.status === 'pending' && date >= todayKey;
    });

    const todayCount = todayAppointments.length;
    const todayRevenue = todayAppointments.reduce((sum, item) => sum + toNumber(item.price), 0);
    const ownerEarningsToday = todayAppointments
      .filter(isPaidOrCompleted)
      .reduce((sum, item) => sum + toNumber(item.price), 0);
    const avgDuration =
      todayAppointments.length > 0
        ? Math.round(
            todayAppointments.reduce((sum, item) => sum + toNumber(item.duration), 0) /
              todayAppointments.length
          )
        : 0;

    const completedThisMonth = monthlyAppointments.filter(
      (item) => item.status === 'completed'
    ).length;
    const confirmedThisMonth = monthlyAppointments.filter(
      (item) => item.status === 'confirmed'
    ).length;
    const pendingThisMonth = monthlyAppointments.filter((item) => item.status === 'pending').length;
    const monthlyBookedValue = monthlyAppointments.reduce(
      (sum, item) => sum + toNumber(item.price),
      0
    );
    const monthlyEarnings = monthlyAppointments
      .filter(isPaidOrCompleted)
      .reduce((sum, item) => sum + toNumber(item.price), 0);

    const pendingAppointments = upcomingPendingAppointments.length;
    const pendingToday = todayAppointments.filter((item) => item.status === 'pending').length;
    const pendingValue = upcomingPendingAppointments.reduce(
      (sum, item) => sum + toNumber(item.price),
      0
    );

    const customerCounts = new Map<string, number>();
    for (const item of activeAppointments) {
      const key = item.customerEmail || item.customerId;
      if (key) customerCounts.set(key, (customerCounts.get(key) || 0) + 1);
    }
    const totalCustomers = customerCounts.size;
    const returningCustomers = Array.from(customerCounts.values()).filter((c) => c > 1).length;
    const returningPct = totalCustomers > 0
      ? Math.round((returningCustomers / totalCustomers) * 100)
      : 0;

    const upcoming = todayAppointments
      .filter((item) => ['pending', 'confirmed'].includes(String(item.status || '')))
      .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));

    return NextResponse.json({
      stats: {
        todayAppointments: todayCount,
        todayRevenue,
        ownerEarnings: monthlyEarnings,
        ownerEarningsToday,
        avgDuration: avgDuration ? `${avgDuration}m` : '0m',
        returningPct: `${returningPct}%`,
        totalCustomers,
        pendingAppointments,
        pendingToday,
        pendingValue,
        completedThisMonth,
        confirmedThisMonth,
        pendingThisMonth,
        monthlyRevenue: monthlyBookedValue,
        monthlyEarnings
      },
      upcoming: upcoming.map((item) => ({
        id: item.id,
        serviceName: item.serviceName,
        time: item.time,
        customerEmail: item.customerEmail,
        customerPhone: item.customerPhone,
        customerName: item.customerName,
        status: item.status,
        price: toNumber(item.price),
        paymentStatus:
          item.payment && typeof item.payment === 'object'
            ? (item.payment as Record<string, unknown>).status
            : null
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
