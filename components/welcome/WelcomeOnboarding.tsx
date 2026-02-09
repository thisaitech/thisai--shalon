'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Heart,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import CustomerContainer from '@/components/layout/CustomerContainer';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COOKIE_KEY = 'lumiere_onboarded';

type Slide = {
  kicker: string;
  title: string;
  description: string;
  image: string;
  collage?: string[];
  bullets?: Array<{ icon: React.ElementType; label: string }>;
};

const slides: Slide[] = [
  {
    kicker: 'KissMe Salon',
    title: 'Beauty made simple.\nWellness made essential.',
    description: 'Transform your look, transform your life — your glow-up awaits.',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80',
    collage: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=240&q=80',
      'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=240&q=80',
      'https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?auto=format&fit=crop&w=240&q=80'
    ]
  },
  {
    kicker: 'Book In Seconds',
    title: 'Offers, looks,\nand instant slots.',
    description: 'Scroll like an app. Tap a service. Reserve your perfect time.',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80',
    bullets: [
      { icon: Sparkles, label: 'Trending looks' },
      { icon: CalendarCheck, label: 'Fast booking' },
      { icon: Heart, label: 'Save favorites' }
    ]
  },
  {
    kicker: 'Stay Connected',
    title: 'Messages,\nupdates, and profile sync.',
    description: 'Everything stays in one place — bookings, receipts, and reminders.',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80',
    bullets: [
      { icon: MessageCircle, label: 'Chat support' },
      { icon: CalendarCheck, label: 'Reschedule easily' },
      { icon: Sparkles, label: 'Premium experience' }
    ]
  }
];

function markOnboarded() {
  // 1 year
  document.cookie = `${COOKIE_KEY}=1; path=/; max-age=31536000; samesite=lax`;
}

export default function WelcomeOnboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const isLast = index === total - 1;

  const active = slides[index];

  const dots = useMemo(() => Array.from({ length: total }), [total]);

  const goNext = () => {
    if (isLast) {
      markOnboarded();
      router.push('/login');
      return;
    }
    setIndex((current) => Math.min(total - 1, current + 1));
  };

  const goBack = () => setIndex((current) => Math.max(0, current - 1));

  const skip = () => {
    markOnboarded();
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      <CustomerContainer className="pt-10 pb-10 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col justify-center">
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-b from-primary/12 via-lilac/10 to-sky/10 rounded-[46px] blur-2xl" />
            <div className="relative rounded-[46px] bg-white/88 border border-white/70 shadow-glow overflow-hidden">
              <div className="relative h-72">
                <Image
                  src={active.image}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 92vw, 440px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/92 via-white/30 to-transparent" />
              </div>

              <div className="p-7 -mt-14">
                {active.collage?.length ? (
                  <div className="flex justify-center gap-3">
                    {active.collage.map((src) => (
                      <div
                        key={src}
                        className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white shadow-soft bg-white"
                      >
                        <Image src={src} alt="" fill className="object-cover" sizes="56px" />
                      </div>
                    ))}
                  </div>
                ) : null}

                <p className="mt-6 text-xs uppercase tracking-[0.35em] text-primary/70 text-center">
                  {active.kicker}
                </p>
                <h1 className="mt-3 text-[28px] leading-[1.12] font-semibold text-ink text-center whitespace-pre-line">
                  {active.title}
                </h1>
                <p className="mt-3 text-sm text-charcoal/70 text-center">{active.description}</p>

                {active.bullets?.length ? (
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    {active.bullets.map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="rounded-3xl bg-white/85 border border-white/70 shadow-soft px-3 py-3 text-center"
                      >
                        <div className="mx-auto h-10 w-10 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                          <Icon size={18} />
                        </div>
                        <p className="mt-2 text-[11px] font-medium text-ink leading-snug">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 flex items-center justify-center gap-2">
                  {dots.map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      type="button"
                      onClick={() => setIndex(dotIndex)}
                      className={cn(
                        'h-2.5 rounded-full transition-all',
                        dotIndex === index ? 'w-8 bg-primary shadow-soft' : 'w-2.5 bg-primary/20'
                      )}
                      aria-label={`Go to slide ${dotIndex + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute left-4 top-4">
              <button
                type="button"
                onClick={goBack}
                disabled={index === 0}
                className={cn(
                  'h-11 w-11 rounded-2xl bg-white/90 border border-white/70 shadow-soft grid place-items-center focus-ring transition-opacity',
                  index === 0 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'
                )}
                aria-label="Back"
              >
                <ArrowLeft size={18} className="text-ink" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-4">
          <Button
            type="button"
            onClick={goNext}
            className="w-full justify-center py-4 rounded-2xl shadow-glow"
          >
            <span className="inline-flex items-center gap-2">
              {isLast ? 'Get Started' : 'Next'}
              <ArrowRight size={18} />
            </span>
          </Button>

          <button
            type="button"
            onClick={skip}
            className="w-full text-center text-xs text-primary font-medium"
          >
            Skip for now
          </button>
        </div>
      </CustomerContainer>
    </div>
  );
}

