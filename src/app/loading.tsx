export default function HomeLoading() {
  return (
    <main className="flex flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="skeleton-shimmer h-44 rounded-3xl border border-white/5" />
        <div className="skeleton-shimmer h-28 rounded-2xl border border-white/5" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="skeleton-shimmer h-64 rounded-2xl border border-white/5"
              aria-hidden
            />
          ))}
        </div>
      </div>
    </main>
  );
}
