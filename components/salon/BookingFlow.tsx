'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/ui/calendar';
import AvailabilityGrid from '@/components/salon/AvailabilityGrid';
import ServiceItem from '@/components/salon/ServiceItem';
import Button from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { StepProgress } from '@/components/ui/progress';
import { formatCurrency, formatDate, formatTime, toDateKey } from '@/lib/utils';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import type { Salon, Service } from '@/lib/data';
import { serviceImages } from '@/lib/service-images';

const steps = ['Service', 'Time', 'Payment'];

export default function BookingFlow({
  salon,
  initialServiceId
}: {
  salon: Salon;
  initialServiceId?: string;
}) {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialServiceId) return;
    setSelectedService((current) => {
      if (current) return current;
      return salon.services.find((service) => service.id === initialServiceId) ?? null;
    });
    setStep((current) => (current === 1 ? 2 : current));
  }, [initialServiceId, salon.services]);

  useEffect(() => {
    if (!auth) {
      setUserEmail(null);
      setUserId(null);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
      setUserId(user?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const controller = new AbortController();
    const fetchBooked = async () => {
      setAvailabilityLoading(true);
      try {
        const dateKey = toDateKey(selectedDate);
        const response = await fetch(
          `/api/appointments?salonId=${salon.id}&date=${dateKey}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error('Failed to load availability');
        }
        const text = await response.text();
        let data: { bookedTimes?: string[] } = {};
        try {
          data = JSON.parse(text) as { bookedTimes?: string[] };
        } catch {
          data = {};
        }
        setBookedTimes(data.bookedTimes || []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setBookedTimes([]);
        }
      } finally {
        setAvailabilityLoading(false);
      }
    };
    fetchBooked();
    return () => controller.abort();
  }, [selectedDate, salon.id]);

  const summary = useMemo(() => {
    if (!selectedService || !selectedDate || !selectedTime) return null;
    return {
      date: formatDate(selectedDate),
      time: formatTime(selectedTime),
      price: selectedService.price,
      service: selectedService.name
    };
  }, [selectedDate, selectedService, selectedTime]);

  const continueToPayment = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        salon: salon.id,
        service: selectedService.id,
        date: toDateKey(selectedDate),
        time: selectedTime
      });
      router.push(`/payment?${qs.toString()}`);
    } catch (err) {
      setError((err as Error).message || 'Unable to continue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <StepProgress steps={steps} current={step} />
      <div className="space-y-4">
        <h2 className="text-2xl font-display text-primary">Reserve your glow session</h2>
        <p className="text-sm text-charcoal/80">
          Bridal, groom, and unisex beauty rituals tailored to your schedule.
        </p>
      </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-primary">Choose a service</h3>
          <span className="pill bg-white/90">Step 1</span>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 items-stretch auto-rows-fr">
          {salon.services.map((service) => (
            <ServiceItem
              key={service.id}
              name={service.name}
              description={service.description}
              price={service.price}
              duration={service.duration}
              image={serviceImages[service.id] ?? salon.image}
              selected={selectedService?.id === service.id}
              onSelect={() => {
                setSelectedService(service);
                setStep(2);
              }}
            />
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <h3 className="font-display text-lg">Choose a date</h3>
          <Calendar selected={selectedDate} onChange={(date) => {
            setSelectedDate(date);
            setSelectedTime(null);
            setStep(2);
          }} />
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-lg">Pick a time</h3>
          <AvailabilityGrid
            date={selectedDate}
            businessHours={salon.businessHours}
            serviceDuration={selectedService?.duration ?? 30}
            selectedTime={selectedTime}
            bookedTimes={bookedTimes}
            loading={availabilityLoading}
            onSelect={(time) => {
              setSelectedTime(time);
              setStep(3);
            }}
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {summary ? (
        <div className="hidden md:block rounded-3xl bg-white/92 shadow-soft border border-white/70 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-charcoal/60">Ready to pay</p>
              <p className="mt-1 text-lg font-semibold text-ink">{summary.service}</p>
              <p className="mt-1 text-sm text-charcoal/60">
                {summary.date} · {summary.time}
              </p>
            </div>
            <p className="text-lg font-semibold text-primary">{formatCurrency(summary.price)}</p>
          </div>
          <Button
            onClick={continueToPayment}
            disabled={loading}
            className="mt-5 w-full justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                Loading...
              </span>
            ) : (
              'Continue to payment'
            )}
          </Button>
        </div>
      ) : (
        <div className="hidden md:block rounded-3xl bg-white/70 border border-white/70 p-6 text-sm text-charcoal/60">
          Select a service and time to continue to payment.
        </div>
      )}

      {summary ? (
        <div className="fixed bottom-24 left-0 right-0 z-30 md:hidden">
          <div className="mx-auto w-full max-w-[440px] px-5">
            <div className="rounded-3xl bg-white/92 shadow-glow border border-white/70 p-4 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-charcoal/60">Your booking</p>
                  <p className="mt-0.5 text-sm font-semibold text-ink truncate">
                    {summary.service}
                  </p>
                  <p className="mt-1 text-[11px] text-charcoal/60">
                    {summary.date} · {summary.time}
                  </p>
                </div>
                <p className="text-sm font-semibold text-primary">
                  {formatCurrency(summary.price)}
                </p>
              </div>
              <Button
                onClick={continueToPayment}
                disabled={loading}
                className="mt-3 w-full justify-center"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                    Loading...
                  </span>
                ) : (
                  'Continue to payment'
                )}
              </Button>
              {!userEmail ? (
                <p className="mt-2 text-[11px] text-charcoal/55">
                  Tip: log in to keep bookings synced in your profile.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
