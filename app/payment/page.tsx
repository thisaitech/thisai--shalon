'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PaymentScreen from '@/components/payment/PaymentScreen';
import Spinner from '@/components/ui/spinner';
import type { Service } from '@/lib/data';
import { serviceImages } from '@/lib/service-images';
import { buildApiUrl } from '@/lib/api/client';

type PublicSalonPayload = {
  id?: string;
  name?: string;
  location?: string;
  image?: string;
};

type PaymentPayload = {
  salonId: string;
  salonName: string;
  salonLocation: string;
  salonImage: string;
  service: Service;
  serviceImage: string;
  date: string;
  time: string;
};

const FALLBACK_SALON_IMAGE =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const salonParam = searchParams.get('salon') || '';
  const serviceId = searchParams.get('service') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

  const [payload, setPayload] = useState<PaymentPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const salonId = salonParam;
      if (!salonId || !serviceId || !date || !time) {
        setError('Missing booking details. Please select your service and time again.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          buildApiUrl(`/api/public/services?salonId=${encodeURIComponent(salonId)}`),
          { cache: 'no-store' }
        );
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          salon?: PublicSalonPayload;
          services?: Service[];
        };

        if (!res.ok) {
          throw new Error(data.error || 'Unable to load payment details');
        }

        const services = Array.isArray(data.services) ? data.services : [];
        const service = services.find((item) => item.id === serviceId);
        if (!service) {
          throw new Error('Selected service not found for this salon');
        }

        if (!cancelled) {
          setPayload({
            salonId,
            salonName: data.salon?.name || 'Salon',
            salonLocation: data.salon?.location || 'Location unavailable',
            salonImage: data.salon?.image || FALLBACK_SALON_IMAGE,
            service,
            serviceImage:
              serviceImages[service.id] ?? data.salon?.image ?? FALLBACK_SALON_IMAGE,
            date,
            time
          });
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setPayload(null);
          setError((err as Error).message || 'Unable to load payment details');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [date, salonParam, serviceId, time]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-charcoal/70">
        <Spinner className="h-5 w-5" />
        <span>Loading payment details...</span>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
          <p className="text-sm text-red-700">
            {error || 'Unable to open checkout for this booking.'}
          </p>
          <Link
            href={salonParam ? `/booking?salon=${encodeURIComponent(salonParam)}` : '/booking'}
            className="inline-flex mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-white"
          >
            Back to booking
          </Link>
        </div>
      </div>
    );
  }

  return <PaymentScreen {...payload} />;
}
