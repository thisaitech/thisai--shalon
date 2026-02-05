export default function Loading() {
  return (
    <div className="px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-10 w-1/2 rounded-2xl bg-muted shimmer animate-shimmer" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-48 rounded-2xl bg-white/70 border border-white/40 shadow-soft shimmer animate-shimmer"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
