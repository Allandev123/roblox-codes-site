"use client";

import Link from "next/link";
import { useState } from "react";

type FAQItem = {
  q: string;
  a: string;
};

const faqItems: FAQItem[] = [
  {
    q: "How fast do you reply?",
    a: "We usually respond within 2-3 business days. Reports with clear details (game name, code, status) are prioritized.",
  },
  {
    q: "What should I include in a code correction report?",
    a: "Include game title, code text, what happened in-game, and if possible a screenshot or short context note.",
  },
  {
    q: "Can I request a new game to be added?",
    a: "Yes. Send the Roblox game name and place ID. We review demand and update coverage based on quality and popularity.",
  },
];

export function ContactPageContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [reportCode, setReportCode] = useState("");

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 40% 34% at 6% 0%, rgba(239,68,68,0.24), transparent), radial-gradient(ellipse 38% 32% at 90% 8%, rgba(59,130,246,0.2), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.35) 0.7px, transparent 0.7px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative mx-auto w-full max-w-5xl space-y-8">
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl sm:p-10">
          <div
            className="pointer-events-none absolute -left-10 -top-14 h-52 w-52 rounded-full bg-red-500/20 blur-3xl motion-safe:animate-pulse-slow"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-10 top-2 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl motion-safe:animate-pulse-slow"
            aria-hidden
          />
          <div className="relative">
            <span className="inline-flex rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-semibold tracking-wide text-zinc-200">
              ⚡ Fast responses • Community driven
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">
              <span className="bg-gradient-to-r from-red-300 via-fuchsia-200 to-blue-300 bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              Need help, found a broken code, or want to contribute? Let&apos;s
              talk.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <article className="animate-fade-up relative overflow-hidden rounded-2xl border border-red-400/35 bg-gradient-to-br from-red-950/30 via-white/[0.04] to-transparent p-6 shadow-[0_0_35px_rgba(239,68,68,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_45px_rgba(239,68,68,0.28)] sm:p-8">
            <h2 className="text-2xl font-semibold text-white">Contact via Email</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Best for partnerships, legal requests, deep bug reports, or
              anything that needs detailed context.
            </p>
            <p className="mt-4 rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-medium text-zinc-200">
              contact@robloxcodes2026.example
            </p>
            <a
              href="mailto:contact@robloxcodes2026.example"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(239,68,68,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
            >
              Send Message
            </a>
          </article>

          <div className="grid gap-6">
            <article className="animate-fade-up rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 md:translate-y-3">
              <h3 className="text-xl font-semibold text-white">Discord</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Community-first channel for quick updates and announcements.
              </p>
              <a
                href="https://discord.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              >
                Open Discord
              </a>
            </article>

            <article className="animate-fade-up rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20 md:-translate-x-2">
              <h3 className="text-xl font-semibold text-white">Report Issue</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Expired codes, wrong descriptions, or broken links.
              </p>
              <a
                href="mailto:contact@robloxcodes2026.example?subject=Issue%20Report"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              >
                Report Now
              </a>
            </article>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MiniSignal
            icon="⚡"
            title="Fast updates"
            text="Critical code fixes are prioritized quickly."
          />
          <MiniSignal
            icon="🎮"
            title="Community driven"
            text="Player feedback directly shapes what gets updated."
          />
          <MiniSignal
            icon="🔒"
            title="Reliable info"
            text="We verify against in-game behavior whenever possible."
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur md:p-8">
          <h2 className="text-2xl font-semibold text-white">Found a broken code?</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Paste the code string below. This field is UI-only but helps you
            draft a clean report before sending it.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={reportCode}
              onChange={(e) => setReportCode(e.target.value)}
              placeholder="Example: SPRING2026"
              className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none ring-red-500/20 focus:border-red-500/40 focus:ring-2"
            />
            <a
              href="mailto:contact@robloxcodes2026.example?subject=Broken%20Code%20Report"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
            >
              Report code
            </a>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Tip: include the game title and what happened in-game (invalid,
            expired, already used, etc.).
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur md:p-8">
          <h2 className="text-2xl font-semibold text-white">FAQ</h2>
          <div className="mt-5 space-y-3">
            {faqItems.map((item, index) => {
              const open = openFaq === index;
              return (
                <article key={item.q} className="space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq((prev) => (prev === index ? null : index))
                    }
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
                      open
                        ? "bg-black/50 ring-1 ring-red-400/35"
                        : "bg-black/35 ring-1 ring-white/10 hover:bg-black/45"
                    }`}
                  >
                    <span className="font-semibold text-white">{item.q}</span>
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    >
                      ▾
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-4 rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                        <p className="text-sm leading-relaxed text-zinc-300">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-red-400/30 bg-gradient-to-r from-red-950/40 to-blue-950/30 p-6 shadow-[0_0_32px_rgba(239,68,68,0.18)] md:p-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20 text-red-200 ring-1 ring-red-400/35">
              !
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">
                What to include in your message
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-300" />
                  <span>Game name and code text (exact spelling).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-300" />
                  <span>Issue type: expired, invalid, typo, or missing update.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-300" />
                  <span>Any extra context that helps us verify quickly.</span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-zinc-400">
                Looking for legal pages? See{" "}
                <Link href="/disclaimer" className="font-semibold text-blue-300 hover:text-blue-200">
                  Disclaimer
                </Link>
                ,{" "}
                <Link href="/privacy-policy" className="font-semibold text-blue-300 hover:text-blue-200">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms-of-service" className="font-semibold text-blue-300 hover:text-blue-200">
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MiniSignal({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.06]">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-base">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{text}</p>
    </article>
  );
}
