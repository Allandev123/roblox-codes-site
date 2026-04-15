import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About AllanIsGreasy – RobloxCodesHQ",
  description:
    "Meet AllanIsGreasy, a Roblox veteran since 2015 and creator of RobloxCodesHQ, your trusted source for working Roblox codes.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About AllanIsGreasy – RobloxCodesHQ",
    description:
      "Meet AllanIsGreasy, a Roblox veteran since 2015 and creator of RobloxCodesHQ, your trusted source for working Roblox codes.",
    type: "website",
    url: "/about",
  },
};

const stats = [
  { label: "Playing since", value: "2015" },
  { label: "Content creation", value: "4+ Years" },
  { label: "Identity", value: "Roblox Veteran" },
  { label: "Builder role", value: "Code Database Builder" },
] as const;

const missionBullets = [
  "Track working codes faster than outdated list sites.",
  "Keep game pages clean, readable, and actually useful.",
  "Focus on major Roblox titles and event-heavy updates.",
  "Build the most trusted Roblox code hub on the platform.",
] as const;

export default function AboutPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 48% 36% at 8% 0%, rgba(239,68,68,0.22), transparent), radial-gradient(ellipse 45% 34% at 92% 8%, rgba(59,130,246,0.18), transparent)",
        }}
      />

      <div className="relative mx-auto w-full max-w-5xl space-y-8">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300/80">
            Creator story
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            <span className="bg-gradient-to-r from-red-300 via-white to-blue-300 bg-clip-text text-transparent">
              About AllanIsGreasy
            </span>
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            RobloxCodesHQ exists to make finding working codes easy, trustworthy,
            and fast. No clutter, no outdated junk pages, just useful updates for
            real players.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur md:p-8">
          <h2 className="text-2xl font-semibold text-white">Who am I</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
            <p>
              I&apos;m Allan, also known as{" "}
              <strong className="text-zinc-100">AllanIsGreasy</strong>. I&apos;ve
              been playing Roblox since 2015 and have spent years learning how
              game update cycles, events, and code drops actually work.
            </p>
            <p>
              Over the last 4+ years I&apos;ve built experience through YouTube
              and streaming, which gave me a direct line to what players actually
              need: reliable pages, fast edits, and no messy filler content.
            </p>
            <p>
              RobloxCodesHQ was built because most code sites felt outdated or
              overloaded. The goal here is simple: become the #1 place for Roblox
              codes, especially for games like Blox Fruits, Pet Simulator 99, and
              99 Nights in the Forest.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, i) => (
            <article
              key={item.label}
              className="animate-fade-up rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_0_28px_rgba(239,68,68,0.14)]"
              style={{ animationDelay: `${Math.min(i * 70, 280)}ms` }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-black text-white">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur md:p-8">
          <h2 className="text-2xl font-semibold text-white">Mission</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            I&apos;m building RobloxCodesHQ as a long-term platform focused on
            speed, trust, and consistency.
          </p>
          <ul className="mt-5 space-y-3">
            {missionBullets.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-zinc-300 sm:text-base">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-200 ring-1 ring-blue-400/35">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-red-400/30 bg-gradient-to-r from-red-950/40 to-blue-950/30 p-6 shadow-[0_0_34px_rgba(239,68,68,0.18)] md:p-8">
          <h2 className="text-2xl font-semibold text-white">YouTube & Community</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            I share updates, gameplay context, and community-focused content as
            AllanIsGreasy. If you want to follow the journey and stay close to
            upcoming drops, jump in below.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://www.youtube.com/@AllanIsGreasy/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_22px_rgba(239,68,68,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
            >
              Follow on YouTube
            </a>
            <Link
              href="/codes"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-zinc-100 transition-all duration-300 hover:bg-white/10"
            >
              Explore working codes
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
