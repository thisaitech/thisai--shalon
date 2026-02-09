export default function Loading() {
  return (
    <div className="min-h-screen pb-32">
      <div className="mx-auto w-full max-w-[440px] px-5 pt-6 space-y-5 animate-fade-up">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-full bg-muted/70 shimmer animate-shimmer" />
          <div className="space-y-2 text-center">
            <div className="h-3 w-20 rounded-full bg-muted/60 shimmer animate-shimmer mx-auto" />
            <div className="h-5 w-28 rounded-full bg-muted/70 shimmer animate-shimmer mx-auto" />
          </div>
          <div className="h-10 w-10" aria-hidden="true" />
        </div>

        <div className="flex items-center gap-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-muted/60 shimmer animate-shimmer" />
              <div className="h-3 w-16 rounded-full bg-muted/60 shimmer animate-shimmer" />
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white/75 border border-white/70 shadow-soft overflow-hidden">
          <div className="h-40 bg-muted/70 shimmer animate-shimmer" />
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="h-4 w-20 rounded-full bg-muted/60 shimmer animate-shimmer" />
                <div className="h-4 w-32 rounded-full bg-muted/70 shimmer animate-shimmer" />
              </div>
            ))}
            <div className="h-px w-full bg-muted/70" />
            <div className="flex items-center justify-between">
              <div className="h-4 w-16 rounded-full bg-muted/60 shimmer animate-shimmer" />
              <div className="h-6 w-24 rounded-full bg-muted/70 shimmer animate-shimmer" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white/75 border border-white/70 shadow-soft p-5 space-y-4">
          <div className="h-5 w-48 rounded-full bg-muted/70 shimmer animate-shimmer" />
          <div className="h-4 w-64 rounded-full bg-muted/60 shimmer animate-shimmer" />

          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[78px] rounded-3xl bg-white/70 border border-white/70 shadow-soft overflow-hidden"
              >
                <div className="h-full w-full bg-gradient-to-r from-muted/60 via-white/80 to-muted/60 bg-[length:200%_100%] animate-shimmer" />
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="h-12 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
            <div className="h-12 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
          </div>
          <div className="h-12 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

