export default function GuideLoading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="skeleton-shimmer h-60 rounded-3xl border border-white/5" />
      <div className="mt-8 space-y-8">
        {[0, 1, 2].map((item) => (
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
