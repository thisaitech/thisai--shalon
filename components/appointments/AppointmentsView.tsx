'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import Skeleton from '@/components/ui/skeleton';
import Badge from '@/components/ui/badge';
import { formatDate, formatTime } from '@/lib/utils';

type Appointment = {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  salonId: string;
};

export default function AppointmentsView({ title }: { title: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      const q = query(collection(db, 'appointments'), where('customerId', '==', user.uid));
      unsubscribeSnapshot();
      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Appointment, 'id'>)
          }));
          data.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
          setAppointments(data);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Appointments</p>
        <h1 className="text-3xl font-display text-primary">{title}</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-6 text-sm text-red-600" role="alert">
          {error}
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="font-display text-lg text-primary">No appointments yet.</p>
          <p className="text-sm text-charcoal/60">Your chair awaits.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <p className="font-medium">{appointment.serviceName}</p>
                <p className="text-sm text-charcoal/70">
                  {formatDate(new Date(`${appointment.date}T00:00:00`))} · {formatTime(appointment.time)}
                </p>
              </div>
              <Badge
                className={
                  appointment.status === 'confirmed'
                    ? 'bg-accent/30 text-primary'
                    : 'bg-highlight/20 text-primary'
                }
              >
                {appointment.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
