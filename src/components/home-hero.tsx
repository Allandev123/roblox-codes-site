import Link from "next/link";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-red-600/25 blur-[100px] motion-safe:animate-pulse-slow"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-24 h-[380px] w-[380px] rounded-full bg-blue-600/20 blur-[100px] motion-safe:animate-pulse-slow animation-delay-1"
        aria-hidden
      />
      <div className="animate-section-in relative mx-auto max-w-6xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-200/90 shadow-[0_0_24px_rgba(59,130,246,0.25)]">
          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
          Live-style layout · verify codes in-game
        </div>
        <h1 className="animate-fade-up mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl sm:leading-[1.05] md:text-7xl">
          <span className="block bg-gradient-to-r from-red-400 via-white to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(239,68,68,0.35)]">
            Free Roblox Codes 2026 (Updated Daily)
          </span>
        </h1>
        <p className="animate-fade-up animation-delay-1 mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Grab boosts, cash, and items fast — browse trending hits on the home
          page or jump to the full library with search on the Codes hub.
        </p>
        <div className="animate-fade-up animation-delay-2 mt-8 flex flex-wrap gap-3">
          <Link
            href="/codes"
            className="btn-glow-red inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white"
          >
            View all Roblox codes
          </Link>
          <Link
            href="#trending"
            className="btn-outline-neon inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-zinc-100 hover:border-red-400/35 hover:bg-red-950/25"
          >
            Trending picks
          </Link>
          <Link
            href="/guides"
            className="btn-outline-neon inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-zinc-100 hover:border-blue-400/35 hover:bg-blue-950/25"
          >
            Read guides
          </Link>
          <a
            href="https://www.roblox.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glow-blue inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white"
          >
            Open Roblox
          </a>
        </div>
      </div>
    </section>
  );
}
