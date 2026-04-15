import Link from "next/link";
import { guides } from "@/data/guides";

export function LatestGuides() {
  const latest = guides.slice(0, 3);

  return (
    <section className="border-t border-white/10 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              <span className="bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
                Latest guides
              </span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Helpful walkthroughs and strategy articles that add real context
              beyond raw code lists.
            </p>
          </div>
          <Link
            href="/guides"
            className="btn-outline-neon inline-flex rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-zinc-100"
          >
            View all guides →
          </Link>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((guide, index) => (
            <li key={guide.slug} className="animate-fade-up" style={{ animationDelay: `${Math.min(index * 80, 300)}ms` }}>
              <Link
                href={`/guides/${guide.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.85)] transition-all duration-300 hover:-translate-y-1 hover:border-red-400/40 hover:shadow-[0_0_28px_rgba(239,68,68,0.2),0_0_20px_rgba(59,130,246,0.14)]"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Guide
                </span>
                <h3 className="mt-3 text-xl font-black leading-snug text-white transition group-hover:text-red-100">
                  {guide.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                  {guide.intro}
                </p>
                <span className="mt-5 text-sm font-bold text-blue-300 transition group-hover:text-blue-200">
                  Read guide →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
