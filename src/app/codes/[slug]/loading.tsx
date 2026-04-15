export default function GameCodesLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div
        className="skeleton-hero skeleton-shimmer relative isolate h-[min(52vh,420px)] w-full min-h-[240px] overflow-hidden sm:h-[min(48vh,480px)] md:min-h-[320px]"
        aria-hidden
      />
      <div className="relative z-10 -mt-16 px-4 sm:-mt-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#080c14]/90 p-6 backdrop-blur-md sm:p-8 md:p-10">
            <div className="grid gap-8 md:grid-cols-[220px_1fr] md:gap-10">
              <div className="mx-auto w-full max-w-[220px] md:mx-0">
                <div className="skeleton-shimmer aspect-[3/4] w-full rounded-2xl" />
              </div>
              <div className="flex min-w-0 flex-col justify-center gap-4">
                <div className="skeleton-shimmer h-3 w-40 rounded-full" />
                <div className="skeleton-shimmer h-9 w-full max-w-md rounded-lg" />
                <div className="skeleton-shimmer h-4 w-full max-w-lg rounded-md" />
                <div className="skeleton-shimmer h-4 w-full max-w-md rounded-md" />
                <div className="skeleton-shimmer mt-2 h-12 w-48 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton-shimmer h-44 rounded-2xl border border-white/5 sm:h-48"
            aria-hidden
          />
        ))}
      </div>

      <p className="mx-auto mt-10 px-4 text-center text-sm font-medium text-zinc-500">
        Loading game…
      </p>
    </div>
  );
}
