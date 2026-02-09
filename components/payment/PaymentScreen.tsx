'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles
} from 'lucide-react';
import CustomerContainer from '@/components/layout/CustomerContainer';
import Button from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import { cn, formatCurrency, formatDate, formatTime } from '@/lib/utils';
import type { Service } from '@/lib/data';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';

type PaymentMethod = 'razorpay' | 'upi' | 'cash';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export default function PaymentScreen({
  salonId,
  salonName,
  salonLocation,
  salonImage,
  service,
  serviceImage,
  date,
  time
}: {
  salonId: string;
  salonName: string;
  salonLocation: string;
  salonImage: string;
  service: Service;
  serviceImage: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}) {
  const [method, setMethod] = useState<PaymentMethod>('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const [contactEmail, setContactEmail] = useState('');
  const [upiRef, setUpiRef] = useState('');

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? '');
      setUserId(user?.uid ?? '');
      setContactEmail((current) => current || user?.email || '');
    });
    return () => unsub();
  }, []);

  const summary = useMemo(() => {
    const d = new Date(`${date}T00:00:00`);
    return {
      date: formatDate(d),
      time: formatTime(time),
      total: formatCurrency(service.price),
      amountPaise: Math.round(service.price * 100)
    };
  }, [date, service.price, time]);

  const upiLink = useMemo(() => {
    const upiId = process.env.NEXT_PUBLIC_SALON_UPI_ID || 'kissmesalon@upi';
    const name = encodeURIComponent(salonName);
    const note = encodeURIComponent(`${service.name} • ${date} ${time}`);
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${name}&am=${service.price}&cu=INR&tn=${note}`;
  }, [date, salonName, service.name, service.price, time]);

  const createManualAppointment = async (paymentMethod: 'upi' | 'cash') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId,
          serviceId: service.id,
          serviceName: service.name,
          serviceDuration: service.duration,
          price: service.price,
          date,
          time,
          customerEmail: contactEmail || userEmail || null,
          customerId: userId || null,
          paymentMethod,
          paymentReferenceId: paymentMethod === 'upi' ? upiRef : undefined
        })
      });

      const text = await response.text();
      if (!response.ok) {
        let message = 'Unable to create booking';
        try {
          const data = JSON.parse(text) as { error?: string };
          message = data.error || message;
        } catch {
          if (text) message = text;
        }
        throw new Error(message);
      }

      window.location.href = `/booking-confirmation?status=pending&method=${paymentMethod}`;
    } catch (err) {
      setError((err as Error).message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  const payWithRazorpay = async () => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) {
      setError('Razorpay is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!window.Razorpay) {
        throw new Error('Razorpay failed to load.');
      }

      const orderRes = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: summary.amountPaise,
          currency: 'INR',
          receipt: `bk_${Date.now()}`,
          notes: {
            salonId,
            serviceId: service.id,
            date,
            time
          }
        })
      });

      const orderText = await orderRes.text();
      if (!orderRes.ok) {
        let message = 'Unable to start payment';
        try {
          const data = JSON.parse(orderText) as { error?: string };
          message = data.error || message;
        } catch {
          if (orderText) message = orderText;
        }
        throw new Error(message);
      }

      const order = JSON.parse(orderText) as { orderId: string; amount: number; currency: string };
      const options = {
        key,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: salonName,
        description: `${service.name} • ${summary.date} • ${summary.time}`,
        image: salonImage,
        theme: { color: '#6C5CE7' },
        prefill: {
          email: contactEmail || userEmail || undefined
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              booking: {
                salonId,
                serviceId: service.id,
                serviceName: service.name,
                serviceDuration: service.duration,
                price: service.price,
                date,
                time,
                customerEmail: contactEmail || userEmail || null,
                customerId: userId || null
              }
            })
          });

          const verifyText = await verifyRes.text();
          if (!verifyRes.ok) {
            let message = 'Payment verified, but booking failed.';
            try {
              const data = JSON.parse(verifyText) as { error?: string };
              message = data.error || message;
            } catch {
              if (verifyText) message = verifyText;
            }
            setError(message);
            setLoading(false);
            return;
          }

          window.location.href = '/booking-confirmation?status=confirmed&method=razorpay';
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError((err as Error).message || 'Unable to open Razorpay.');
      setLoading(false);
    }
  };

  const methods: Array<{
    id: PaymentMethod;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    {
      id: 'razorpay',
      title: 'Pay Online',
      subtitle: 'UPI, cards, wallets',
      icon: CreditCard,
      badge: 'Recommended'
    },
    {
      id: 'upi',
      title: 'UPI Transfer',
      subtitle: 'Pay via any UPI app',
      icon: QrCode
    },
    {
      id: 'cash',
      title: 'Pay at Salon',
      subtitle: 'Cash or UPI at counter',
      icon: Banknote
    }
  ];

  return (
    <div className="min-h-screen pb-32">
      <CustomerContainer className="pt-6 space-y-5">
        <header className="flex items-start justify-between">
          <Link
            href={`/booking?salon=${salonId}&service=${service.id}`}
            className="h-10 w-10 rounded-full bg-white/90 shadow-soft border border-white/70 flex items-center justify-center focus-ring"
            aria-label="Back"
          >
            <ArrowLeft size={18} className="text-ink" />
          </Link>
          <div className="text-center">
            <p className="text-xs text-charcoal/60">Checkout</p>
            <h1 className="text-xl font-semibold text-ink">Payment</h1>
          </div>
          <div className="h-10 w-10" aria-hidden="true" />
        </header>

        <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 overflow-hidden">
          <div className="relative h-40">
            <Image
              src={serviceImage}
              alt={service.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 440px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
            <div className="absolute inset-x-5 bottom-4 text-white">
              <p className="text-xs opacity-90">You’re booking</p>
              <p className="mt-1 text-lg font-semibold">{service.name}</p>
              <p className="mt-1 text-xs opacity-80 inline-flex items-center gap-2">
                <MapPin size={12} className="opacity-90" />
                {salonLocation}
              </p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal/65">Date</span>
              <span className="font-medium text-ink">{summary.date}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal/65">Time</span>
              <span className="font-medium text-ink">{summary.time}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal/65">Duration</span>
              <span className="font-medium text-ink">{service.duration} min</span>
            </div>
            <div className="h-px w-full bg-muted/70" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal/65">Total</span>
              <span className="text-lg font-semibold text-primary">{summary.total}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Choose a payment method</p>
              <p className="mt-1 text-xs text-charcoal/60">
                Seamless checkout with premium security and instant updates.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary">
              <ShieldCheck size={13} />
              Secure
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {methods.map(({ id, title, subtitle, icon: Icon, badge }) => {
              const active = method === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={cn(
                    'w-full text-left rounded-3xl border p-4 transition-all focus-ring',
                    active
                      ? 'border-primary/40 bg-gradient-to-br from-primary/10 via-lilac/10 to-sky/10 shadow-glow'
                      : 'border-white/70 bg-white/85 shadow-soft hover:-translate-y-0.5 hover:shadow-glow'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{title}</p>
                        <p className="mt-0.5 text-xs text-charcoal/60">{subtitle}</p>
                      </div>
                    </div>
                    {badge ? (
                      <span className="rounded-full bg-primary text-white px-2.5 py-1 text-[10px] font-medium shadow-glow">
                        {badge}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email for confirmation</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Input id="note" value={`${service.name}`} readOnly />
              </div>
            </div>

            {method === 'upi' ? (
              <div className="rounded-3xl border border-white/70 bg-white/85 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Pay via UPI</p>
                    <p className="mt-1 text-xs text-charcoal/60">
                      Tap to open your UPI app. Add reference ID to speed up verification.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary">
                    <Smartphone size={13} />
                    UPI
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      window.location.href = upiLink;
                    }}
                    className="w-full"
                    disabled={loading}
                  >
                    Open UPI app
                  </Button>
                  <Button
                    type="button"
                    onClick={() => createManualAppointment('upi')}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                        Saving...
                      </span>
                    ) : (
                      'I’ve paid — Save booking'
                    )}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upiRef">UPI reference (optional)</Label>
                  <Input
                    id="upiRef"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    placeholder="e.g. UTR / Transaction ID"
                  />
                </div>
              </div>
            ) : null}

            {method === 'cash' ? (
              <div className="rounded-3xl border border-white/70 bg-white/85 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Pay at salon</p>
                    <p className="mt-1 text-xs text-charcoal/60">
                      Reserve your slot now. Pay by cash or UPI at the counter.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary">
                    <Sparkles size={13} />
                    Easy
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => createManualAppointment('cash')}
                  className="w-full justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                      Reserving...
                    </span>
                  ) : (
                    'Reserve & pay at salon'
                  )}
                </Button>
              </div>
            ) : null}

            {method === 'razorpay' ? (
              <div className="rounded-3xl border border-white/70 bg-white/85 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Pay online with Razorpay</p>
                    <p className="mt-1 text-xs text-charcoal/60">
                      Choose UPI, cards or wallets. Booking gets confirmed instantly.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary">
                    <Smartphone size={13} />
                    UPI ready
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={payWithRazorpay}
                  className="w-full justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                      Opening checkout...
                    </span>
                  ) : (
                    `Pay ${summary.total}`
                  )}
                </Button>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <p className="text-[11px] text-charcoal/55">
              By continuing you agree to our reschedule policy. Need help? Message us from the
              Messages tab.
            </p>
          </div>
        </div>
      </CustomerContainer>
    </div>
  );
}
