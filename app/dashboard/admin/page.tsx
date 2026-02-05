'use client';

import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Skeleton from '@/components/ui/skeleton';
import { formatTime } from '@/lib/utils';

type Appointment = {
  id: string;
  serviceName: string;
  time: string;
  status: string;
  customerEmail?: string | null;
};

export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    let unsubscribeAppointments = () => {};
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const salonQuery = query(
        collection(db, 'salons'),
        where('ownerId', '==', user.uid)
      );

      const unsubSalon = onSnapshot(salonQuery, (snapshot) => {
        const salonDoc = snapshot.docs[0];
        if (!salonDoc) {
          setLoading(false);
          return;
        }
        const id = salonDoc.id;
        setSalonId(id);

        const appointmentQuery = query(
          collection(db, 'appointments'),
          where('salonId', '==', id),
          where('date', '==', todayKey)
        );

        unsubscribeAppointments();
        unsubscribeAppointments = onSnapshot(appointmentQuery, (apptSnapshot) => {
          const data = apptSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Appointment, 'id'>)
          }));
          setAppointments(data);
          setLoading(false);
        });
      });

      return () => {
        unsubSalon();
        unsubscribeAppointments();
      };
    });

    return () => {
      unsubAuth();
      unsubscribeAppointments();
    };
  }, [todayKey]);

  const updateStatus = async (appointmentId: string, status: string) => {
    if (!salonId) return;
    await updateDoc(doc(db, 'appointments', appointmentId), { status });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Admin</p>
        <h1 className="text-3xl font-display text-primary">Today&apos;s appointments</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="font-display text-lg">No appointments yet.</p>
          <p className="text-sm text-charcoal/60">Your chair awaits.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="glass rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div>
                <p className="font-medium">{appointment.serviceName}</p>
                <p className="text-sm text-charcoal/70">{formatTime(appointment.time)}</p>
                {appointment.customerEmail ? (
                  <p className="text-xs text-charcoal/50">{appointment.customerEmail}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={
                    appointment.status === 'confirmed'
                      ? 'bg-accent/30 text-charcoal'
                      : appointment.status === 'pending'
                        ? 'bg-highlight/30 text-primary'
                        : 'bg-charcoal/10 text-charcoal'
                  }
                >
                  {appointment.status}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => updateStatus(appointment.id, 'confirmed')}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => updateStatus(appointment.id, 'canceled')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
