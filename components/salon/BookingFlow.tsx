'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Clock, Star, CheckCircle2, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import AvailabilityGrid from '@/components/salon/AvailabilityGrid';
import Button from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { formatCurrency, formatDate, formatTime, toDateKey } from '@/lib/utils';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import type { Salon, Service } from '@/lib/data';
import { serviceImages } from '@/lib/service-images';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function InlineCalendar({
  selected,
  onChange
}: {
  selected: Date | null;
  onChange: (date: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <div className="bg-white/90 rounded-3xl p-5 shadow-soft border border-white/70">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} className="text-charcoal" />
        </button>
        <h4 className="text-sm font-semibold text-ink">
          {MONTHS[viewMonth]} {viewYear}
        </h4>
        <button
          type="button"
          onClick={nextMonth}
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors"
        >
          <ChevronRight size={18} className="text-charcoal" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-charcoal/50 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(viewYear, viewMonth, day);
          const isPast = date < today;
          const isSelected = selected ? isSameDay(selected, date) : false;
          const isToday = isSameDay(today, date);

          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => onChange(date)}
              className={`
                h-10 w-full rounded-xl text-sm font-medium transition-all
                ${isPast ? 'text-charcoal/25 cursor-not-allowed' : 'hover:bg-primary/10 text-charcoal'}
                ${isSelected ? 'bg-primary text-white shadow-glow hover:bg-primary' : ''}
                ${isToday && !isSelected ? 'ring-2 ring-primary/30 ring-inset' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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

  /* ─── Step 1: Service Selection ─── */
  if (step === 1) {
    return (
      <div className="space-y-5 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display text-ink">Choose Service</h2>
            <p className="text-xs text-charcoal/60 mt-0.5">{salon.services.length} services available</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Bridal', 'Grooming', 'Hair', 'Skin'].map((tag, i) => (
            <button
              key={tag}
              type="button"
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                i === 0
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-white/80 text-charcoal/70 border border-white/70 shadow-soft hover:border-primary/30'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-3">
          {salon.services.map((service) => {
            const img = serviceImages[service.id] ?? salon.image;
            const isSelected = selectedService?.id === service.id;
            const discount = Math.floor(Math.random() * 15) + 10; // Visual only

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  setSelectedService(service);
                  setStep(2);
                }}
                className={`
                  group relative text-left rounded-2xl overflow-hidden bg-white border transition-all
                  hover:-translate-y-0.5 hover:shadow-glow focus-ring active:scale-[0.98]
                  ${isSelected ? 'border-primary/40 shadow-glow ring-2 ring-primary/15' : 'border-white/70 shadow-soft'}
                `}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={img}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 220px"
                  />
                  {/* Discount badge */}
                  <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                    {discount}%
                  </span>
                  {/* Duration badge */}
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-charcoal/80 text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                    <Clock size={10} />
                    {service.duration}m
                  </span>
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 size={28} className="text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/50 font-medium">
                    {service.description.split(',')[0]}
                  </p>
                  <p className="text-sm font-semibold text-ink leading-tight line-clamp-2 min-h-[36px]">
                    {service.name}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-charcoal/70 font-medium">4.{Math.floor(Math.random() * 5) + 5}</span>
                    <span className="text-[10px] text-charcoal/40">({Math.floor(Math.random() * 300) + 100})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-primary">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                    <span className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─── Step 2: Date & Time ─── */
  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header with back */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="h-9 w-9 rounded-full bg-white/90 shadow-soft border border-white/70 flex items-center justify-center hover:bg-white transition-colors focus-ring"
        >
          <ArrowLeft size={16} className="text-charcoal" />
        </button>
        <div>
          <h2 className="text-xl font-display text-ink">Select Date & Time</h2>
          <p className="text-xs text-charcoal/60 mt-0.5">
            {selectedService?.name} &middot; {selectedService?.duration} min
          </p>
        </div>
      </div>

      {/* Selected service summary card */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/90 border border-white/70 shadow-soft">
        <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0">
          <Image
            src={serviceImages[selectedService?.id ?? ''] ?? salon.image}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink truncate">{selectedService?.name}</p>
          <p className="text-xs text-charcoal/60">{selectedService?.duration} min</p>
        </div>
        <p className="text-sm font-bold text-primary shrink-0">
          {formatCurrency(selectedService?.price ?? 0)}
        </p>
      </div>

      {/* Calendar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-primary" />
          <h3 className="font-display text-base text-ink">Choose a Date</h3>
        </div>
        <InlineCalendar
          selected={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            setSelectedTime(null);
          }}
        />
      </div>

      {/* Time Slots */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-primary" />
          <h3 className="font-display text-base text-ink">Pick a Time</h3>
        </div>
        <AvailabilityGrid
          date={selectedDate}
          businessHours={salon.businessHours}
          serviceDuration={selectedService?.duration ?? 30}
          selectedTime={selectedTime}
          bookedTimes={bookedTimes}
          loading={availabilityLoading}
          onSelect={(time) => {
            setSelectedTime(time);
          }}
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {/* Payment CTA - Desktop */}
      {summary ? (
        <div className="hidden md:block rounded-3xl bg-white/92 shadow-soft border border-white/70 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-charcoal/60">Ready to pay</p>
              <p className="mt-1 text-lg font-semibold text-ink">{summary.service}</p>
              <p className="mt-1 text-sm text-charcoal/60">
                {summary.date} &middot; {summary.time}
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
          Select a date and time to continue.
        </div>
      )}

      {/* Payment CTA - Mobile */}
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
                    {summary.date} &middot; {summary.time}
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
