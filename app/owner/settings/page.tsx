'use client';

import { useEffect, useState } from 'react';
import { Store, MapPin, Mail, Phone, Clock, Globe, Image, Save, Check } from 'lucide-react';
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
  description: string;
  website: string;
  instagram: string;
  facebook: string;
};

type Salon = {
  id: string;
  name: string;
  location: string;
  ownerEmail: string;
  phone: string;
  description?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  businessHours?: BusinessHours;
  logoUrl?: string;
  coverUrl?: string;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
};

export default function OwnerSettingsPage() {
  const { user, loading: authLoading, fetchWithAuth } = useOwnerAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [salonInfo, setSalonInfo] = useState<SalonInfo>({
    name: '',
    location: '',
    ownerEmail: '',
    phone: '',
    description: '',
    website: '',
    instagram: '',
    facebook: ''
  });
  const [hours, setHours] = useState<BusinessHours>(defaultBusinessHours);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'hours' | 'social' | 'premium'>('details');

  useEffect(() => {
    if (authLoading || !user) return;
    const load = async () => {
      try {
        const res = await fetchWithAuth('/api/owner');
        if (res.ok) {
          const data = await res.json();
          if (data.salon) {
            setSalon({ ...data.salon, id: data.salon.id || '' });
            setSalonInfo({
              name: data.salon.name || '',
              location: data.salon.location || '',
              ownerEmail: data.salon.ownerEmail || user.email || '',
              phone: data.salon.phone || '',
              description: data.salon.description || '',
              website: data.salon.website || '',
              instagram: data.salon.instagram || '',
              facebook: data.salon.facebook || ''
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
    setSaveMessage(null);
    setSaveError(null);

    if (!salonInfo.name.trim() || !salonInfo.location.trim()) {
      setSaveError('Salon name and location are required.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetchWithAuth('/api/owner', {
        method: 'PUT',
        body: JSON.stringify({ ...salonInfo, businessHours: hours })
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        created?: boolean;
        salon?: Salon;
      };

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save studio details.');
      }

      if (data.salon) {
        const nextSalon = { ...data.salon, id: data.salon.id || '' };
        setSalon(nextSalon);
        setSalonInfo({
          name: nextSalon.name || '',
          location: nextSalon.location || '',
          ownerEmail: nextSalon.ownerEmail || user?.email || '',
          phone: nextSalon.phone || '',
          description: nextSalon.description || '',
          website: nextSalon.website || '',
          instagram: nextSalon.instagram || '',
          facebook: nextSalon.facebook || ''
        });
        if (nextSalon.businessHours) {
          setHours(nextSalon.businessHours);
        }
      }

      setSaved(true);
      setSaveMessage(data.created ? 'Studio created successfully!' : 'Saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSaveError((error as Error).message || 'Failed to save studio details.');
    } finally {
      setSaving(false);
    }
  };

  const updateHour = (day: DayKey, field: 'open' | 'close', value: string) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const isLoading = authLoading || loading;
  const isOwner = !isLoading && salon !== null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Settings</p>
        <h1 className="text-3xl font-display text-primary">
          {salon ? 'Business Management' : 'Create Your Studio'}
        </h1>
        <p className="text-sm text-charcoal/60 mt-1">
          {salon
            ? 'Manage your salon profile and settings'
            : 'Set up your salon profile so customers can discover and book your studio.'}
        </p>
      </div>

      <OwnerSubnav />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-charcoal/10 pb-4">
        {[
          { id: 'details', label: 'Salon Details', icon: Store },
          { id: 'hours', label: 'Business Hours', icon: Clock },
          { id: 'social', label: 'Social Media', icon: Globe },
          { id: 'premium', label: 'Premium Features', icon: Image }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white' 
                : 'bg-white/80 text-primary hover:bg-primary/10'
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-60" />
        </div>
      ) : (
        <>
          {/* Salon Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-display text-primary flex items-center gap-2">
                  <Store size={20} />
                  Basic Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="s-name">Salon Name *</Label>
                    <Input
                      id="s-name"
                      value={salonInfo.name}
                      onChange={(e) => setSalonInfo({ ...salonInfo, name: e.target.value })}
                      placeholder="Your Salon Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s-loc">Location *</Label>
                    <Input
                      id="s-loc"
                      value={salonInfo.location}
                      onChange={(e) => setSalonInfo({ ...salonInfo, location: e.target.value })}
                      placeholder="Full address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s-email">Owner Email *</Label>
                    <Input
                      id="s-email"
                      type="email"
                      value={salonInfo.ownerEmail}
                      onChange={(e) => setSalonInfo({ ...salonInfo, ownerEmail: e.target.value })}
                      placeholder="owner@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s-phone">Phone *</Label>
                    <Input
                      id="s-phone"
                      value={salonInfo.phone}
                      onChange={(e) => setSalonInfo({ ...salonInfo, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="s-desc">Description</Label>
                    <textarea
                      id="s-desc"
                      value={salonInfo.description}
                      onChange={(e) => setSalonInfo({ ...salonInfo, description: e.target.value })}
                      placeholder="Tell customers about your salon..."
                      className="w-full min-h-[100px] bg-white/80 rounded-xl px-4 py-3 text-sm border border-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Salon Stats */}
              {isOwner && salon && (
                <div className="glass rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-display text-primary">Your Salon at a Glance</h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="card-surface p-4 text-center">
                      <p className="text-2xl font-display text-primary">{salon.rating || '—'}</p>
                      <p className="text-xs text-charcoal/50 uppercase tracking-wider">Rating</p>
                    </div>
                    <div className="card-surface p-4 text-center">
                      <p className="text-2xl font-display text-primary">{salon.totalReviews || 0}</p>
                      <p className="text-xs text-charcoal/50 uppercase tracking-wider">Reviews</p>
                    </div>
                    <div className="card-surface p-4 text-center">
                      <p className="text-2xl font-display text-primary">
                        {salon.createdAt ? new Date(salon.createdAt).toLocaleDateString() : '—'}
                      </p>
                      <p className="text-xs text-charcoal/50 uppercase tracking-wider">Member Since</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Business Hours Tab */}
          {activeTab === 'hours' && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-display text-primary flex items-center gap-2">
                <Clock size={20} />
                Business Hours
              </h2>
              <p className="text-sm text-charcoal/60">Set your regular operating hours. Customers can only book within these times.</p>
              <div className="space-y-3">
                {DAY_ORDER.map((day) => (
                  <div key={day} className="card-surface p-4 flex items-center justify-between gap-4">
                    <span className="font-medium text-primary w-28">{DAY_LABELS[day]}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={hours[day].open}
                        onChange={(e) => updateHour(day, 'open', e.target.value)}
                        className="text-sm bg-white/80 rounded-xl px-3 py-2 border border-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="text-charcoal/50">-</span>
                      <input
                        type="time"
                        value={hours[day].close}
                        onChange={(e) => updateHour(day, 'close', e.target.value)}
                        className="text-sm bg-white/80 rounded-xl px-3 py-2 border border-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <label className="flex items-center gap-2 ml-4">
                        <input
                          type="checkbox"
                          checked={hours[day].closed || false}
                          onChange={(e) => setHours((prev) => ({ 
                            ...prev, 
                            [day]: { ...prev[day], closed: e.target.checked }
                          }))}
                          className="rounded border-white/70"
                        />
                        <span className="text-sm text-charcoal/60">Closed</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-display text-primary flex items-center gap-2">
                <Globe size={20} />
                Social Media Links
              </h2>
              <p className="text-sm text-charcoal/60">Connect your social media profiles to help customers find you.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="s-website">Website</Label>
                  <Input
                    id="s-website"
                    value={salonInfo.website}
                    onChange={(e) => setSalonInfo({ ...salonInfo, website: e.target.value })}
                    placeholder="https://yoursalon.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-instagram">Instagram</Label>
                  <Input
                    id="s-instagram"
                    value={salonInfo.instagram}
                    onChange={(e) => setSalonInfo({ ...salonInfo, instagram: e.target.value })}
                    placeholder="@yoursalon"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="s-facebook">Facebook</Label>
                  <Input
                    id="s-facebook"
                    value={salonInfo.facebook}
                    onChange={(e) => setSalonInfo({ ...salonInfo, facebook: e.target.value })}
                    placeholder="https://facebook.com/yoursalon"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Premium Features Tab */}
          {activeTab === 'premium' && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-display text-primary flex items-center gap-2">
                <Image size={20} />
                Premium Features
              </h2>
              <p className="text-sm text-charcoal/60">Upgrade your salon profile to attract more customers.</p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="card-surface p-4 space-y-3 border-2 border-accent/30">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-primary">Logo</h3>
                    <span className="text-xs bg-accent/20 text-primary px-2 py-1 rounded-full">Free</span>
                  </div>
                  {salon?.logoUrl ? (
                    <div className="relative">
                      <img src={salon.logoUrl} alt="Salon Logo" className="w-20 h-20 rounded-xl object-cover" />
                      <Button variant="ghost" className="absolute -top-2 -right-2 p-1">
                        <Save size={14} />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-white/60 flex items-center justify-center">
                      <Image size={24} className="text-charcoal/30" />
                    </div>
                  )}
                  <Button variant="secondary" className="w-full">Upload Logo</Button>
                </div>

                <div className="card-surface p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-primary">Cover Photo</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Pro</span>
                  </div>
                  {salon?.coverUrl ? (
                    <div className="relative">
                      <img src={salon.coverUrl} alt="Cover" className="w-full h-20 rounded-xl object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-20 rounded-xl bg-white/60 flex items-center justify-center">
                      <Image size={24} className="text-charcoal/30" />
                    </div>
                  )}
                  <Button variant="secondary" className="w-full">Upgrade to Add Cover</Button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center gap-4 pt-4 border-t border-charcoal/10">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save size={16} />
                  {salon ? 'Save Changes' : 'Create Studio'}
                </>
              )}
            </Button>
            {saved && (
              <span className="flex items-center gap-2 text-green-600">
                <Check size={16} />
                {saveMessage || 'Saved successfully!'}
              </span>
            )}
            {saveError && <span className="text-sm text-red-600">{saveError}</span>}
          </div>
        </>
      )}
    </div>
  );
}
