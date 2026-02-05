'use client';

import { useEffect, useState } from 'react';
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
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Skeleton from '@/components/ui/skeleton';
import type { BusinessHours } from '@/lib/utils';
import { defaultBusinessHours } from '@/lib/utils';

const dayLabels: Array<keyof BusinessHours> = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

type ServiceForm = {
  name: string;
  price: number;
  duration: number;
};

export default function AdminSettingsPage() {
  const [salonId, setSalonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultBusinessHours);
  const [services, setServices] = useState<ServiceForm[]>([]);
  const [newService, setNewService] = useState<ServiceForm>({
    name: '',
    price: 0,
    duration: 45
  });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      const q = query(collection(db, 'salons'), where('ownerId', '==', user.uid));
      const unsubSalon = onSnapshot(q, (snapshot) => {
        const docSnap = snapshot.docs[0];
        if (!docSnap) {
          setLoading(false);
          return;
        }
        setSalonId(docSnap.id);
        const data = docSnap.data();
        setBusinessHours(data.businessHours || defaultBusinessHours);
        setServices(data.services || []);
        setLoading(false);
      });
      return () => unsubSalon();
    });

    return () => unsubAuth();
  }, []);

  const handleHoursChange = (day: keyof BusinessHours, field: 'open' | 'close', value: string) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = async () => {
    if (!salonId) return;
    setStatus(null);
    await updateDoc(doc(db, 'salons', salonId), {
      businessHours,
      services
    });
    setStatus('Saved changes.');
  };

  const addService = () => {
    if (!newService.name.trim()) return;
    setServices((prev) => [...prev, newService]);
    setNewService({ name: '', price: 0, duration: 45 });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Settings</p>
        <h1 className="text-3xl font-display text-primary">Business hours & services</h1>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-lg text-primary">Business hours</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {dayLabels.map((day) => (
            <div key={day} className="rounded-2xl border border-white/60 bg-white/70 p-4">
              <p className="text-sm font-medium capitalize">{day}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`${day}-open`}>Open</Label>
                  <Input
                    id={`${day}-open`}
                    value={businessHours[day].open}
                    onChange={(event) => handleHoursChange(day, 'open', event.target.value)}
                    type="time"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${day}-close`}>Close</Label>
                  <Input
                    id={`${day}-close`}
                    value={businessHours[day].close}
                    onChange={(event) => handleHoursChange(day, 'close', event.target.value)}
                    type="time"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-lg text-primary">Services</h2>
        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={`${service.name}-${index}`} className="flex flex-col md:flex-row gap-3">
              <Input value={service.name} readOnly />
              <Input value={service.price} readOnly type="number" />
              <Input value={service.duration} readOnly type="number" />
            </div>
          ))}
          {!services.length ? (
            <p className="text-sm text-charcoal/60">Add your first signature service.</p>
          ) : null}
        </div>
        <div className="border-t border-white/60 pt-4 space-y-3">
          <p className="text-sm font-medium">Add a new service</p>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Service name"
              value={newService.name}
              onChange={(event) =>
                setNewService((prev) => ({ ...prev, name: event.target.value }))
              }
            />
            <Input
              type="number"
              placeholder="Price"
              value={newService.price}
              onChange={(event) =>
                setNewService((prev) => ({
                  ...prev,
                  price: Number(event.target.value)
                }))
              }
            />
            <Input
              type="number"
              placeholder="Duration (min)"
              value={newService.duration}
              onChange={(event) =>
                setNewService((prev) => ({
                  ...prev,
                  duration: Number(event.target.value)
                }))
              }
            />
          </div>
          <Button variant="secondary" onClick={addService}>
            Add service
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>Save changes</Button>
        {status ? <p className="text-sm text-accent">{status}</p> : null}
      </div>
    </div>
  );
}
