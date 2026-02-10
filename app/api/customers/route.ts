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

// GET /api/customers — owner: get customers who have booked at this salon
export async function GET(req: NextRequest) {
  try {
    const salonId = await getOwnerSalonId(req);
    const db = getAdminDb();

    const appointmentsSnapshot = await db
      .collection('appointments')
      .where('salonId', '==', salonId)
      .orderBy('date', 'desc')
      .get();

    // Aggregate customer data from appointments
    const customerMap = new Map<string, {
      email: string;
      customerId: string | null;
      customerPhone?: string;
      customerName?: string;
      visits: number;
      lastDate: string;
      lastService: string;
      totalSpent: number;
      firstDate: string;
      averageSpend: number;
      appointments: Array<{
        id: string;
        date: string;
        time: string;
        serviceName: string;
        price: number;
        status: string;
      }>;
    }>();

    for (const doc of appointmentsSnapshot.docs) {
      const data = doc.data();
      const key = data.customerEmail || data.customerId || 'anonymous';
      if (key === 'anonymous') continue;

      const existing = customerMap.get(key);
      const appointmentInfo = {
        id: doc.id,
        date: data.date || '',
        time: data.time || '',
        serviceName: data.serviceName || '',
        price: Number(data.price || 0),
        status: data.status || 'pending'
      };

      if (existing) {
        existing.visits += 1;
        existing.totalSpent += Number(data.price || 0);
        existing.averageSpend = existing.totalSpent / existing.visits;
        existing.appointments.push(appointmentInfo);
        
        if (data.date && data.date > existing.lastDate) {
          existing.lastDate = data.date;
          existing.lastService = data.serviceName || '';
        }
        if (data.date && (!existing.firstDate || data.date < existing.firstDate)) {
          existing.firstDate = data.date;
        }
      } else {
        customerMap.set(key, {
          email: data.customerEmail || '',
          customerId: data.customerId || null,
          customerPhone: data.customerPhone,
          customerName: data.customerName,
          visits: 1,
          lastDate: data.date || '',
          lastService: data.serviceName || '',
          totalSpent: Number(data.price || 0),
          firstDate: data.date || '',
          averageSpend: Number(data.price || 0),
          appointments: [appointmentInfo]
        });
      }
    }

    const customers = Array.from(customerMap.values()).sort((a, b) =>
      b.lastDate.localeCompare(a.lastDate)
    );

    return NextResponse.json({ customers });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
