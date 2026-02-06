import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/60 bg-white/70">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm">
        <div>
          <p className="font-display text-base text-primary">Lumiére Unisex Studio</p>
          <p className="mt-1 text-xs text-charcoal/60">
            Indian bridal · groom glow · unisex beauty rituals.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-charcoal/60">
          <Link href="/booking" className="focus-ring rounded-md px-1">
            Booking
          </Link>
          <Link href="/favorites" className="focus-ring rounded-md px-1">
            Saved
          </Link>
          <Link href="/messages" className="focus-ring rounded-md px-1">
            Messages
          </Link>
        </div>
      </div>
    </footer>
  );
}
