import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

type ApiError = Error & { status?: number };

type Role = 'owner' | 'customer';

type AppointmentRecord = Record<string, unknown> & {
  salonId?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  serviceName?: string;
  salonName?: string;
  salonLocation?: string;
  date?: string;
  time?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type MessageRecord = Record<string, unknown> & {
  sender?: string;
  text?: string;
  read?: boolean;
  createdAt?: string;
  timestamp?: string;
};

function withStatus(message: string, status: number): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
}

function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function toIso(value: unknown) {
  const text = String(value || '').trim();
  return text || new Date(0).toISOString();
}

function appointmentDateTimeIso(data: AppointmentRecord) {
  const date = typeof data.date === 'string' ? data.date : '';
  const time = typeof data.time === 'string' ? data.time : '';
  if (!date) return new Date(0).toISOString();
  const isoCandidate = `${date}T${time || '00:00'}`;
  const parsed = new Date(isoCandidate);
  if (Number.isNaN(parsed.getTime())) return new Date(0).toISOString();
  return parsed.toISOString();
}

async function verifyRequestUser(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) throw withStatus('Unauthorized', 401);
  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    throw withStatus('Unauthorized', 401);
  }
}

async function getOwnerSalonId(uid: string) {
  const db = getAdminDb();
  const snapshot = await db
    .collection('salons')
    .where('ownerId', '==', uid)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
}

async function getAppointmentOrThrow(appointmentId: string) {
  const db = getAdminDb();
  const doc = await db.collection('appointments').doc(appointmentId).get();
  if (!doc.exists) throw withStatus('Appointment not found', 404);
  return {
    id: doc.id,
    data: (doc.data() || {}) as AppointmentRecord
  };
}

function isCustomerActor({
  uid,
  email,
  appointment
}: {
  uid: string;
  email: string;
  appointment: AppointmentRecord;
}) {
  const appointmentCustomerId =
    typeof appointment.customerId === 'string' ? appointment.customerId : '';
  const appointmentCustomerEmail =
    typeof appointment.customerEmail === 'string'
      ? appointment.customerEmail.toLowerCase()
      : '';
  return (
    uid === appointmentCustomerId || (email.length > 0 && email === appointmentCustomerEmail)
  );
}

async function resolveActorForAppointment({
  req,
  appointmentId
}: {
  req: NextRequest;
  appointmentId: string;
}) {
  const decoded = await verifyRequestUser(req);
  const appointment = await getAppointmentOrThrow(appointmentId);
  const userEmail = String(decoded.email || '').toLowerCase();

  if (
    isCustomerActor({
      uid: decoded.uid,
      email: userEmail,
      appointment: appointment.data
    })
  ) {
    return {
      role: 'customer' as const,
      decoded,
      appointment
    };
  }

  const ownerSalonId = await getOwnerSalonId(decoded.uid);
  if (
    ownerSalonId &&
    typeof appointment.data.salonId === 'string' &&
    appointment.data.salonId === ownerSalonId
  ) {
    return {
      role: 'owner' as const,
      decoded,
      appointment
    };
  }

  throw withStatus('Unauthorized', 403);
}

function mapMessageDoc({
  id,
  data
}: {
  id: string;
  data: MessageRecord;
}) {
  const sender = data.sender === 'owner' ? 'owner' : 'customer';
  return {
    id,
    appointmentId:
      typeof data.appointmentId === 'string' ? data.appointmentId : '',
    sender,
    text: typeof data.text === 'string' ? data.text : '',
    read: Boolean(data.read),
    createdAt: toIso(data.createdAt || data.timestamp),
    timestamp: toIso(data.timestamp || data.createdAt)
  };
}

async function getMessagesForAppointment(appointmentId: string) {
  const db = getAdminDb();
  try {
    const snapshot = await db
      .collection('messages')
      .where('appointmentId', '==', appointmentId)
      .orderBy('createdAt', 'asc')
      .get();
    return snapshot.docs.map((doc) =>
      mapMessageDoc({
        id: doc.id,
        data: (doc.data() || {}) as MessageRecord
      })
    );
  } catch {
    const snapshot = await db
      .collection('messages')
      .where('appointmentId', '==', appointmentId)
      .get();
    return snapshot.docs
      .map((doc) =>
        mapMessageDoc({
          id: doc.id,
          data: (doc.data() || {}) as MessageRecord
        })
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}

async function markIncomingMessagesRead({
  appointmentId,
  viewerRole
}: {
  appointmentId: string;
  viewerRole: Role;
}) {
  const incomingSender = viewerRole === 'owner' ? 'customer' : 'owner';
  const db = getAdminDb();
  let docs = [] as FirebaseFirestore.QueryDocumentSnapshot[];

  try {
    const snapshot = await db
      .collection('messages')
      .where('appointmentId', '==', appointmentId)
      .where('sender', '==', incomingSender)
      .where('read', '==', false)
      .get();
    docs = snapshot.docs;
  } catch {
    const snapshot = await db
      .collection('messages')
      .where('appointmentId', '==', appointmentId)
      .where('sender', '==', incomingSender)
      .get();
    docs = snapshot.docs.filter((doc) => !Boolean(doc.data().read));
  }

  if (docs.length === 0) return;
  const batch = db.batch();
  const now = new Date().toISOString();
  docs.forEach((doc) => {
    batch.update(doc.ref, { read: true, readAt: now });
  });
  await batch.commit();
}

async function queryAppointmentsByField({
  field,
  value
}: {
  field: string;
  value: string;
}) {
  const db = getAdminDb();
  try {
    const snapshot = await db
      .collection('appointments')
      .where(field, '==', value)
      .orderBy('updatedAt', 'desc')
      .get();
    return snapshot.docs;
  } catch {
    const snapshot = await db
      .collection('appointments')
      .where(field, '==', value)
      .get();
    return snapshot.docs;
  }
}

async function loadSalonMap(salonIds: string[]) {
  const db = getAdminDb();
  const uniqueIds = Array.from(new Set(salonIds.filter(Boolean)));
  const entries = await Promise.all(
    uniqueIds.map(async (salonId) => {
      const doc = await db.collection('salons').doc(salonId).get();
      if (!doc.exists) return null;
      const data = doc.data() || {};
      return [
        salonId,
        {
          name: typeof data.name === 'string' ? data.name : 'Salon',
          location:
            typeof data.location === 'string'
              ? data.location
              : 'Location unavailable'
        }
      ] as const;
    })
  );

  const map = new Map<string, { name: string; location: string }>();
  entries.forEach((entry) => {
    if (!entry) return;
    map.set(entry[0], entry[1]);
  });
  return map;
}

async function getLatestMessageByAppointmentId(appointmentId: string) {
  const db = getAdminDb();
  try {
    const snapshot = await db
      .collection('messages')
      .where('appointmentId', '==', appointmentId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return mapMessageDoc({
      id: snapshot.docs[0].id,
      data: (snapshot.docs[0].data() || {}) as MessageRecord
    });
  } catch {
    const snapshot = await db
      .collection('messages')
      .where('appointmentId', '==', appointmentId)
      .get();
    if (snapshot.empty) return null;
    const sorted = snapshot.docs
      .map((doc) =>
        mapMessageDoc({
          id: doc.id,
          data: (doc.data() || {}) as MessageRecord
        })
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted[0] || null;
  }
}

async function getUnreadCount({
  appointmentId,
  viewerRole
}: {
  appointmentId: string;
  viewerRole: Role;
}) {
  const incomingSender = viewerRole === 'owner' ? 'customer' : 'owner';
  const db = getAdminDb();
  try {
    const snapshot = await db
      .collection('messages')
      .where('appointmentId', '==', appointmentId)
      .where('sender', '==', incomingSender)
      .where('read', '==', false)
      .get();
    return snapshot.size;
  } catch {
    const snapshot = await db
      .collection('messages')
      .where('appointmentId', '==', appointmentId)
      .where('sender', '==', incomingSender)
      .get();
    return snapshot.docs.filter((doc) => !Boolean(doc.data().read)).length;
  }
}

async function getActorRoleForThreads(req: NextRequest, roleParam: string | null) {
  const decoded = await verifyRequestUser(req);
  const ownerSalonId = await getOwnerSalonId(decoded.uid);

  if (roleParam === 'owner') {
    if (!ownerSalonId) throw withStatus('Owner access required', 403);
    return { role: 'owner' as const, decoded, ownerSalonId };
  }

  if (roleParam === 'customer') {
    return { role: 'customer' as const, decoded, ownerSalonId };
  }

  if (ownerSalonId) {
    return { role: 'owner' as const, decoded, ownerSalonId };
  }

  return { role: 'customer' as const, decoded, ownerSalonId };
}

async function getThreads({
  req,
  roleParam
}: {
  req: NextRequest;
  roleParam: string | null;
}) {
  const { role, decoded, ownerSalonId } = await getActorRoleForThreads(req, roleParam);
  const appointmentMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  const email = String(decoded.email || '').trim();

  if (role === 'owner') {
    if (!ownerSalonId) throw withStatus('No salon found for this owner', 404);
    const docs = await queryAppointmentsByField({
      field: 'salonId',
      value: ownerSalonId
    });
    docs.forEach((doc) => appointmentMap.set(doc.id, doc));
  } else {
    const byCustomerId = await queryAppointmentsByField({
      field: 'customerId',
      value: decoded.uid
    });
    byCustomerId.forEach((doc) => appointmentMap.set(doc.id, doc));

    if (email) {
      const byCustomerEmail = await queryAppointmentsByField({
        field: 'customerEmail',
        value: email
      });
      byCustomerEmail.forEach((doc) => appointmentMap.set(doc.id, doc));
    }
  }

  const appointmentDocs = Array.from(appointmentMap.values());
  const salonMap = await loadSalonMap(
    appointmentDocs.map((doc) => {
      const data = doc.data() as AppointmentRecord;
      return typeof data.salonId === 'string' ? data.salonId : '';
    })
  );

  const threads = await Promise.all(
    appointmentDocs.map(async (doc) => {
      const data = (doc.data() || {}) as AppointmentRecord;
      const salonId = typeof data.salonId === 'string' ? data.salonId : '';
      const salon = salonMap.get(salonId);
      const latest = await getLatestMessageByAppointmentId(doc.id);
      const unreadCount = await getUnreadCount({
        appointmentId: doc.id,
        viewerRole: role
      });

      return {
        appointmentId: doc.id,
        serviceName:
          typeof data.serviceName === 'string' ? data.serviceName : 'Service',
        date: typeof data.date === 'string' ? data.date : '',
        time: typeof data.time === 'string' ? data.time : '',
        status: typeof data.status === 'string' ? data.status : 'pending',
        salonName:
          (typeof data.salonName === 'string' && data.salonName) ||
          salon?.name ||
          'Salon',
        salonLocation:
          (typeof data.salonLocation === 'string' && data.salonLocation) ||
          salon?.location ||
          'Location unavailable',
        customerName: typeof data.customerName === 'string' ? data.customerName : '',
        customerEmail:
          typeof data.customerEmail === 'string' ? data.customerEmail : '',
        lastMessageText: latest?.text || '',
        lastMessageAt:
          latest?.createdAt ||
          toIso(data.updatedAt || data.createdAt || appointmentDateTimeIso(data)),
        lastSender: latest?.sender || null,
        unreadCount
      };
    })
  );

  threads.sort((a, b) => String(b.lastMessageAt).localeCompare(String(a.lastMessageAt)));
  return { role, threads };
}

// POST /api/messages — owner + customer: send message for an appointment thread
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const appointmentId = String(body.appointmentId || '').trim();
    const text = String(body.text || '').trim();

    if (!appointmentId || !text) {
      return NextResponse.json(
        { error: 'appointmentId and text are required' },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Message is too long (max 2000 chars)' },
        { status: 400 }
      );
    }

    const actor = await resolveActorForAppointment({
      req,
      appointmentId
    });

    const timestamp = new Date().toISOString();
    const payload = {
      appointmentId,
      salonId:
        typeof actor.appointment.data.salonId === 'string'
          ? actor.appointment.data.salonId
          : null,
      sender: actor.role,
      senderId: actor.decoded.uid,
      senderEmail: actor.decoded.email || null,
      text,
      read: false,
      timestamp,
      createdAt: timestamp
    };

    const db = getAdminDb();
    const ref = await db.collection('messages').add(payload);

    return NextResponse.json({
      message: {
        id: ref.id,
        ...payload
      }
    });
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      { error: err.message || 'Unable to send message' },
      { status: err.status || 500 }
    );
  }
}

// GET /api/messages?appointmentId=xxx — owner + customer: get thread messages
// GET /api/messages?mode=threads&role=customer|owner — list conversation threads
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');
    const mode = searchParams.get('mode');
    const roleParam = searchParams.get('role');

    if (mode === 'threads') {
      const result = await getThreads({ req, roleParam });
      return NextResponse.json(result);
    }

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointmentId or mode=threads is required' },
        { status: 400 }
      );
    }

    const actor = await resolveActorForAppointment({
      req,
      appointmentId
    });
    const messages = await getMessagesForAppointment(appointmentId);
    await markIncomingMessagesRead({
      appointmentId,
      viewerRole: actor.role
    });

    const normalizedMessages = messages.map((message) => {
      if (message.sender === actor.role) return message;
      return {
        ...message,
        read: true
      };
    });

    return NextResponse.json({
      role: actor.role,
      messages: normalizedMessages
    });
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      { error: err.message || 'Unable to load messages' },
      { status: err.status || 500 }
    );
  }
}
