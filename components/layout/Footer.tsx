import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/50 bg-white/60">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm">
        <div>
          <p className="font-display text-base text-primary">Lumiére Unisex Studio</p>
          <p className="mt-1 text-xs text-charcoal/60">
            Indian bridal · unisex beauty · appointment-first.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-charcoal/60">
          <Link href="/salons" className="focus-ring rounded-md px-1">Services</Link>
          <Link href="/appointments" className="focus-ring rounded-md px-1">Appointments</Link>
          <Link href="/help" className="focus-ring rounded-md px-1">Help</Link>
        </div>
      </div>
    </footer>
  );
}
