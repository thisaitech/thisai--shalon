'use client';

import { useEffect, useState } from 'react';
import OwnerSubnav from '@/components/layout/OwnerSubnav';
import Skeleton from '@/components/ui/skeleton';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';
import { defaultBusinessHours, type BusinessHours, type DayKey } from '@/lib/utils';

const DAY_ORDER: DayKey[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
};

type SalonInfo = {
  name: string;
  location: string;
  ownerEmail: string;
  phone: string;
};

export default function OwnerSettingsPage() {
  const { user, loading: authLoading, fetchWithAuth } = useOwnerAuth();
  const [salonInfo, setSalonInfo] = useState<SalonInfo>({ name: '', location: '', ownerEmail: '', phone: '' });
  const [hours, setHours] = useState<BusinessHours>(defaultBusinessHours);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    const load = async () => {
      try {
        const res = await fetchWithAuth('/api/owner');
        if (res.ok) {
          const data = await res.json();
          if (data.salon) {
            setSalonInfo({
              name: data.salon.name || '',
              location: data.salon.location || '',
              ownerEmail: data.salon.ownerEmail || user.email || '',
              phone: data.salon.phone || ''
            });
            if (data.salon.businessHours) {
              setHours(data.salon.businessHours);
            }
          } else {
            setSalonInfo((prev) => ({ ...prev, ownerEmail: user.email || '' }));
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, user, fetchWithAuth]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetchWithAuth('/api/owner', {
        method: 'PUT',
        body: JSON.stringify({ ...salonInfo, businessHours: hours })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const updateHour = (day: DayKey, field: 'open' | 'close', value: string) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const isLoading = authLoading || loading;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Settings</p>
        <h1 className="text-3xl font-display text-primary">Business preferences</h1>
      </div>

      <OwnerSubnav />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-60" />
        </div>
      ) : (
        <>
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-display text-primary">Salon details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="s-name">Salon name</Label>
                <Input
                  id="s-name"
                  value={salonInfo.name}
                  onChange={(e) => setSalonInfo({ ...salonInfo, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-loc">Location</Label>
                <Input
                  id="s-loc"
                  value={salonInfo.location}
                  onChange={(e) => setSalonInfo({ ...salonInfo, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-email">Owner email</Label>
                <Input
                  id="s-email"
                  type="email"
                  value={salonInfo.ownerEmail}
                  onChange={(e) => setSalonInfo({ ...salonInfo, ownerEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-phone">Phone</Label>
                <Input
                  id="s-phone"
                  value={salonInfo.phone}
                  onChange={(e) => setSalonInfo({ ...salonInfo, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-display text-primary">Business hours</h2>
            <div className="space-y-3">
              {DAY_ORDER.map((day) => (
                <div key={day} className="card-surface p-4 flex items-center justify-between gap-4">
                  <span className="font-medium text-primary w-28">{DAY_LABELS[day]}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={hours[day].open}
                      onChange={(e) => updateHour(day, 'open', e.target.value)}
                      className="text-sm bg-white/80 rounded-lg px-2 py-1.5 border border-white/70"
                    />
                    <span className="text-charcoal/50">-</span>
                    <input
                      type="time"
                      value={hours[day].close}
                      onChange={(e) => updateHour(day, 'close', e.target.value)}
                      className="text-sm bg-white/80 rounded-lg px-2 py-1.5 border border-white/70"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                  Saving...
                </span>
              ) : 'Save changes'}
            </Button>
            {saved && <span className="text-sm text-green-600">Saved successfully!</span>}
          </div>
        </>
      )}
    </div>
  );
}
