import Link from 'next/link';

export default function BookingConfirmationPage() {
  return (
    <div className="confetti min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="glass-panel rounded-3xl p-10 max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Confirmed</p>
        <h1 className="mt-4 text-3xl font-display text-gradient">Your appointment is confirmed!</h1>
        <p className="mt-3 text-sm text-charcoal/70">
          We saved your spot. A confirmation email is on its way.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/appointments"
            className="min-h-[48px] rounded-2xl bg-gradient-to-r from-primary via-lilac to-accent text-white px-6 py-3 text-sm font-medium focus-ring shadow-glow"
          >
            View my appointments
          </Link>
          <Link
            href="/salons"
            className="min-h-[48px] rounded-2xl border border-primary/20 px-6 py-3 text-sm font-medium focus-ring"
          >
            Book another service
          </Link>
        </div>
      </div>
    </div>
  );
}
