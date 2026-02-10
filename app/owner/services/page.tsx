'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import OwnerSubnav from '@/components/layout/OwnerSubnav';
import Skeleton from '@/components/ui/skeleton';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';
import { formatCurrency } from '@/lib/utils';

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
};

type FormData = {
  name: string;
  description: string;
  price: string;
  duration: string;
};

const emptyForm: FormData = { name: '', description: '', price: '', duration: '' };

export default function OwnerServicesPage() {
  const { user, loading: authLoading, fetchWithAuth } = useOwnerAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async () => {
    try {
      const res = await fetchWithAuth('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    loadServices();
  }, [authLoading, user]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (service: Service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || '',
      price: String(service.price),
      duration: String(service.duration)
    });
    setShowForm(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration) {
      setError('Name, price, and duration are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const res = await fetchWithAuth(`/api/services?id=${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
        if (!res.ok) throw new Error('Failed to update');
      } else {
        const res = await fetchWithAuth('/api/services', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        if (!res.ok) throw new Error('Failed to add');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadServices();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await fetchWithAuth(`/api/services?id=${id}`, { method: 'DELETE' });
      await loadServices();
    } catch {
      // ignore
    }
  };

  const isLoading = authLoading || loading;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Services</p>
        <h1 className="text-3xl font-display text-primary">Menu & pricing</h1>
      </div>

      <OwnerSubnav />

      {showForm && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display text-primary">
              {editingId ? 'Edit service' : 'Add new service'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-charcoal/50 hover:text-charcoal">
              <X size={20} />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="svc-name">Service name</Label>
              <Input
                id="svc-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Precision Cut"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-desc">Description</Label>
              <Input
                id="svc-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-price">Price (INR)</Label>
              <Input
                id="svc-price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-dur">Duration (minutes)</Label>
              <Input
                id="svc-dur"
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 60"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                  Saving...
                </span>
              ) : editingId ? 'Update service' : 'Add service'}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : services.length === 0 ? (
          <p className="text-sm text-charcoal/60 py-4 text-center">No services yet. Add your first service.</p>
        ) : (
          services.map((service) => (
            <div key={service.id} className="card-surface p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">{service.name}</p>
                <p className="text-sm text-charcoal/70">{service.duration} min</p>
                {service.description && (
                  <p className="text-xs text-charcoal/50 mt-1">{service.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="pill bg-accent/30 text-primary">{formatCurrency(service.price)}</span>
                <button onClick={() => openEdit(service)} className="text-charcoal/50 hover:text-primary">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(service.id)} className="text-charcoal/50 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
        {!showForm && (
          <button onClick={openAdd} className="pill bg-white/90 text-primary w-full flex items-center justify-center gap-2">
            <Plus size={16} />
            Add new service
          </button>
        )}
      </div>
    </div>
  );
}
