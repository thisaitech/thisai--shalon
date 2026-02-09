export default function Loading() {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto w-full max-w-[440px] px-5 pt-10 space-y-7 animate-fade-up">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
          <div className="h-11 w-11 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
        </div>

        <div className="rounded-[32px] overflow-hidden bg-white/75 border border-white/70 shadow-soft">
          <div className="h-44 bg-muted/70 shimmer animate-shimmer" />
          <div className="p-5 space-y-4">
            <div className="h-5 w-2/3 rounded-2xl bg-muted/70 shimmer animate-shimmer" />
            <div className="h-4 w-1/2 rounded-2xl bg-muted/60 shimmer animate-shimmer" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="h-20 rounded-3xl bg-muted/70 shimmer animate-shimmer" />
              <div className="h-20 rounded-3xl bg-muted/70 shimmer animate-shimmer" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-4 w-40 rounded-2xl bg-muted/60 shimmer animate-shimmer" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 rounded-3xl bg-white/75 border border-white/70 shadow-soft overflow-hidden"
              >
                <div className="h-24 bg-muted/70 shimmer animate-shimmer" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 rounded-2xl bg-muted/60 shimmer animate-shimmer" />
                  <div className="h-4 w-1/2 rounded-2xl bg-muted/60 shimmer animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

