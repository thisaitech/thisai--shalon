'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Carousel({
  children,
  autoPlay = true,
  interval = 5000,
  className
}: {
  children: React.ReactNode;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}) {
  const slides = useMemo(() => React.Children.toArray(children), [children]);
  const [index, setIndex] = useState(0);
  const total = slides.length;

  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, total]);

  const goTo = (nextIndex: number) => {
    const value = (nextIndex + total) % total;
    setIndex(value);
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, slideIndex) => (
          <div key={slideIndex} className="min-w-full px-1">
            {slide}
          </div>
        ))}
      </div>
      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 shadow-soft flex items-center justify-center focus-ring"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 shadow-soft flex items-center justify-center focus-ring"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => goTo(dotIndex)}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-all',
                  dotIndex === index ? 'bg-primary' : 'bg-primary/30'
                )}
                aria-label={`Go to slide ${dotIndex + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
