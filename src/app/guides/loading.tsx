export default function GuidesLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="skeleton-shimmer h-8 w-44 rounded-lg" />
      <div className="skeleton-shimmer mt-4 h-12 w-full max-w-xl rounded-xl" />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="skeleton-shimmer h-56 rounded-2xl border border-white/5"
            aria-hidden
          />
        ))}
      </div>
    </main>
  );
}
