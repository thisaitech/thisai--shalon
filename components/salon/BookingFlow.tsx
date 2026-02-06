'use client';

import { useEffect, useMemo, useState } from 'react';
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

const steps = ['Service', 'Time', 'Confirm'];

export default function BookingFlow({ salon }: { salon: Salon }) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId: salon.id,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          serviceDuration: selectedService.duration,
          price: selectedService.price,
          date: toDateKey(selectedDate),
          time: selectedTime,
          customerEmail: userEmail,
          customerId: userId
        })
      });
      if (!response.ok) {
        const text = await response.text();
        let message = 'Unable to book appointment';
        try {
          const data = JSON.parse(text);
          message = data.error || message;
        } catch {
          if (text) message = text;
        }
        throw new Error(message);
      }
      window.location.href = '/booking-confirmation';
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StepProgress steps={steps} current={step} />
      <div className="space-y-4">
        <h2 className="text-2xl font-display text-primary">Reserve your zen moment</h2>
        <p className="text-sm text-charcoal/70">Your glow-up awaits.</p>
      </div>
      <div className="grid gap-4">
        {salon.services.map((service) => (
          <ServiceItem
            key={service.id}
            name={service.name}
            description={service.description}
            price={service.price}
            duration={service.duration}
            selected={selectedService?.id === service.id}
            onSelect={() => {
              setSelectedService(service);
              setStep(2);
            }}
          />
        ))}
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
            onSelect={(time) => {
              setSelectedTime(time);
              setStep(3);
            }}
          />
        </div>
      </div>
      <div className="rounded-2xl border border-white/50 bg-white/80 p-5 space-y-4">
        <h3 className="font-display text-lg text-primary">Confirm</h3>
        {summary ? (
          <div className="space-y-2 text-sm text-charcoal/70">
            <p><strong>Service:</strong> {summary.service}</p>
            <p><strong>Date:</strong> {summary.date}</p>
            <p><strong>Time:</strong> {summary.time}</p>
            <p><strong>Total:</strong> {formatCurrency(summary.price)}</p>
          </div>
        ) : (
          <p className="text-sm text-charcoal/60">Select a service and time to continue.</p>
        )}
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          onClick={handleConfirm}
          disabled={!summary || loading}
          className="w-full justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4 border-white/40 border-t-white" />
              Confirming...
            </span>
          ) : (
            'Confirm booking'
          )}
        </Button>
      </div>
    </div>
  );
}
