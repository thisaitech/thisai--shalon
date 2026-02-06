'use client';

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Crown, Sparkles, Star, X } from 'lucide-react';
import Button from '@/components/ui/button';

export default function PromoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white/95 p-8 shadow-glow border border-white/60">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="text-primary" size={22} />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-display">
                        Luxe welcome drop
                      </Dialog.Title>
                      <p className="text-sm text-charcoal/70">Save 20% on your first glow session.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Bridal Trial', note: 'HD glam preview', icon: Crown },
                    { label: 'Signature Glow', note: 'Skin + hair reset', icon: Sparkles },
                    { label: 'Style Refresh', note: 'Unisex cut + finish', icon: Star }
                  ].map(({ label, note, icon: Icon }) => (
                    <div key={label} className="card-surface p-4 text-sm">
                      <div className="icon-orb mb-3">
                        <Icon size={18} />
                      </div>
                      <p className="font-medium text-primary">{label}</p>
                      <p className="text-xs text-charcoal/60">{note}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-gradient-to-r from-primary via-lilac to-accent text-white p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/70">Promo</p>
                  <p className="text-2xl font-display mt-1">LUMI20</p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1" onClick={() => setOpen(false)}>
                    Apply offer
                  </Button>
                  <button
                    className="flex-1 rounded-2xl border border-primary/20 px-4 py-3 text-sm font-medium text-primary"
                    onClick={() => setOpen(false)}
                  >
                    Maybe later
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
