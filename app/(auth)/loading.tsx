export default function Loading() {
  return (
    <div className="min-h-[85vh] px-6 py-12 flex items-center justify-center">
      <div className="max-w-5xl w-full grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-center animate-fade-up">
        <div className="rounded-3xl bg-white/75 border border-white/70 shadow-soft p-8 space-y-4">
          <div className="h-4 w-24 rounded-2xl bg-muted/60 shimmer animate-shimmer" />
          <div className="h-10 w-2/3 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
          <div className="h-4 w-3/4 rounded-2xl bg-muted/60 shimmer animate-shimmer" />
          <div className="grid gap-3 pt-2">
            <div className="h-14 rounded-3xl bg-muted/70 shimmer animate-shimmer" />
            <div className="h-14 rounded-3xl bg-muted/70 shimmer animate-shimmer" />
          </div>
          <div className="h-44 w-full rounded-3xl bg-muted/70 shimmer animate-shimmer" />
        </div>

        <div className="rounded-3xl bg-white/75 border border-white/70 shadow-soft p-10 w-full max-w-md mx-auto space-y-4">
          <div className="h-8 w-2/3 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
          <div className="h-4 w-3/4 rounded-2xl bg-muted/60 shimmer animate-shimmer" />
          <div className="space-y-3 pt-2">
            <div className="h-12 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
            <div className="h-12 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
            <div className="h-12 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
          </div>
          <div className="h-12 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

