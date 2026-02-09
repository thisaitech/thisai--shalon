'use client';

import Image from 'next/image';
import Link from 'next/link';
import CustomerContainer from '@/components/layout/CustomerContainer';

export default function WelcomePage() {
  return (
    <div className="min-h-screen pb-28">
      <CustomerContainer className="pt-10 flex flex-col min-h-[calc(100vh-7rem)]">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative w-full max-w-[360px]">
            <div className="absolute -inset-6 bg-gradient-to-b from-primary/10 via-lilac/10 to-transparent rounded-[42px] blur-2xl" />
            <div className="relative rounded-[42px] bg-white/92 border border-white/70 shadow-glow overflow-hidden">
              <div className="relative h-72 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80"
                  alt="Salon artist"
                  fill
                  className="object-cover"
                  priority
                  sizes="360px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex justify-center gap-3 -mt-12">
                  {[
                    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=240&q=80',
                    'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=240&q=80',
                    'https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?auto=format&fit=crop&w=240&q=80'
                  ].map((src) => (
                    <div
                      key={src}
                      className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white shadow-soft"
                    >
                      <Image src={src} alt="Look preview" fill className="object-cover" sizes="56px" />
                    </div>
                  ))}
                </div>
                <h1 className="mt-6 text-3xl font-semibold text-ink">
                  Beauty Made Simple
                  <br />
                  Wellness Made Essential
                </h1>
                <p className="mt-3 text-sm text-charcoal/70">
                  Transform your look, transform your life. Your ultimate glow-up awaits.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="h-2 w-2 rounded-full bg-primary/25" />
                  <span className="h-2 w-2 rounded-full bg-primary/25" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center rounded-2xl bg-primary text-white px-6 py-4 text-sm font-semibold shadow-glow focus-ring"
          >
            Get Started
          </Link>
          <Link href="/" className="block text-center text-xs text-primary font-medium">
            Skip for now
          </Link>
        </div>
      </CustomerContainer>
    </div>
  );
}

