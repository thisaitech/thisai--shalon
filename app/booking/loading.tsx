export default function Loading() {
  return (
    <div className="min-h-screen pb-36">
      <div className="mx-auto w-full max-w-[440px] px-5 pt-6 space-y-5 animate-fade-up">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-full bg-muted/70 shimmer animate-shimmer" />
          <div className="space-y-2 text-center">
            <div className="h-3 w-20 rounded-full bg-muted/60 shimmer animate-shimmer mx-auto" />
            <div className="h-5 w-28 rounded-full bg-muted/70 shimmer animate-shimmer mx-auto" />
            <div className="h-3 w-24 rounded-full bg-muted/60 shimmer animate-shimmer mx-auto" />
          </div>
          <div className="h-10 w-10" aria-hidden="true" />
        </div>

        <div className="rounded-3xl bg-white/80 shadow-soft border border-white/70 p-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-muted/70 shimmer animate-shimmer" />
            <div className="h-3 w-20 rounded-full bg-muted/60 shimmer animate-shimmer" />
            <div className="h-3 w-3 rounded-full bg-muted/60 shimmer animate-shimmer" />
            <div className="h-3 w-20 rounded-full bg-muted/60 shimmer animate-shimmer" />
            <div className="h-3 w-3 rounded-full bg-muted/60 shimmer animate-shimmer" />
            <div className="h-3 w-20 rounded-full bg-muted/60 shimmer animate-shimmer" />
          </div>

          <div className="space-y-2">
            <div className="h-7 w-56 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
            <div className="h-4 w-72 rounded-2xl bg-muted/60 shimmer animate-shimmer" />
          </div>

          <div className="flex items-center justify-between">
            <div className="h-5 w-36 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
            <div className="h-9 w-20 rounded-full bg-muted/60 shimmer animate-shimmer" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[168px] rounded-[28px] bg-white/70 border border-white/70 shadow-soft overflow-hidden"
              >
                <div className="h-full w-full bg-gradient-to-r from-muted/60 via-white/80 to-muted/60 bg-[length:200%_100%] animate-shimmer" />
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="h-72 rounded-3xl bg-white/70 border border-white/70 shadow-soft overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-muted/60 via-white/80 to-muted/60 bg-[length:200%_100%] animate-shimmer" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-12 rounded-2xl bg-muted/70 shimmer animate-shimmer"
                />
              ))}
            </div>
          </div>

          <div className="h-12 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

