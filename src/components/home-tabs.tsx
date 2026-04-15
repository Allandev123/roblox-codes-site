"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CopyCodeButton } from "@/components/copy-code-button";
import type { LatestCodeHome } from "@/types/latest-code-home";

type TabId = "codes" | "faq";

type Props = {
  latestCodes: LatestCodeHome[];
};

const FAQ_ITEMS = [
  {
    q: "How to redeem Roblox codes?",
    a: "Launch the game in Roblox, find the Codes, Settings, or Shop menu (often behind a Twitter or gift icon), paste the code exactly as shown, and confirm. Rewards usually appear right away in your inventory or balance.",
  },
  {
    q: "Do codes expire?",
    a: "Yes. Developers set limits, expiry dates, or max redemptions. If a code stops working, it may have expired or hit its cap—try another from the list and check the game’s official social channels.",
  },
  {
    q: "How often are codes updated?",
    a: "We refresh listings as new codes appear. Big live-ops games drop codes around updates and events. Bookmark your favorite game page and revisit after patches for the best chance at fresh drops.",
  },
  {
    q: "Are these codes safe?",
    a: "Codes are text rewards from the game’s own redeem system—pasting them in the official in-game redeem box is normal. Never share your Roblox password or download sketchy “generators”; real codes are free and typed in-game only.",
  },
] as const;

export function HomeTabs({ latestCodes }: Props) {
  const [tab, setTab] = useState<TabId>("codes");
  const tabListId = useId();

  return (
    <section
      className="relative w-full overflow-hidden border-t border-red-500/20 bg-gradient-to-b from-red-950/55 via-[#140508] to-red-950/40"
      aria-labelledby="home-tabs-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(239,68,68,0.35),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-red-600/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-rose-600/15 blur-3xl"
        aria-hidden
      />

      <div className="animate-section-in relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-200/70">
            Quick access
          </p>
          <h2
            id="home-tabs-heading"
            className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl"
          >
            <span className="bg-gradient-to-r from-red-200 via-white to-red-100 bg-clip-text text-transparent">
              Latest &amp; help
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
            Fresh codes from our database, or answers to common questions—all
            in one place.
          </p>
        </div>

        <div
          className="mx-auto mt-10 flex max-w-md justify-center rounded-2xl border border-white/10 bg-black/25 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:mt-12"
          role="tablist"
          aria-label="Homepage sections"
          id={tabListId}
        >
          <button
            type="button"
            role="tab"
            id={`${tabListId}-codes`}
            aria-selected={tab === "codes"}
            aria-controls={`${tabListId}-codes-panel`}
            tabIndex={tab === "codes" ? 0 : -1}
            onClick={() => setTab("codes")}
            className={`relative flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-[250ms] ease-out sm:px-6 sm:text-base ${
              tab === "codes"
                ? "bg-gradient-to-r from-red-600/90 to-rose-700/90 text-white shadow-[0_0_24px_rgba(239,68,68,0.35),0_0_20px_rgba(244,114,182,0.2)]"
                : "text-zinc-400 hover:scale-[1.02] hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            Latest Codes
          </button>
          <button
            type="button"
            role="tab"
            id={`${tabListId}-faq`}
            aria-selected={tab === "faq"}
            aria-controls={`${tabListId}-faq-panel`}
            tabIndex={tab === "faq" ? 0 : -1}
            onClick={() => setTab("faq")}
            className={`relative flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-[250ms] ease-out sm:px-6 sm:text-base ${
              tab === "faq"
                ? "bg-gradient-to-r from-red-600/90 to-rose-700/90 text-white shadow-[0_0_24px_rgba(239,68,68,0.35),0_0_20px_rgba(244,114,182,0.2)]"
                : "text-zinc-400 hover:scale-[1.02] hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            FAQ
          </button>
        </div>

        <div className="mt-10 sm:mt-12">
          {tab === "codes" ? (
            <div
              id={`${tabListId}-codes-panel`}
              role="tabpanel"
              aria-labelledby={`${tabListId}-codes`}
              className="animate-fade-up"
            >
              {latestCodes.length === 0 ? (
                <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-10 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl">
                  <p className="text-sm text-zinc-300">
                    No codes in the database yet. Add games and codes in
                    Supabase, or use the admin flow—then they will show up here
                    automatically.
                  </p>
                  <Link
                    href="/codes"
                    className="btn-outline-neon mt-5 inline-flex items-center justify-center rounded-xl border border-blue-400/35 bg-blue-600/20 px-5 py-2.5 text-sm font-bold text-blue-100 hover:bg-blue-600/30"
                  >
                    Browse all games →
                  </Link>
                </div>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {latestCodes.map((item, index) => (
                    <li
                      key={item.id}
                      className="animate-fade-up"
                      style={{
                        animationDelay: `${Math.min(index * 70, 350)}ms`,
                      }}
                    >
                      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-[250ms] ease-out hover:z-[1] hover:scale-[1.03] hover:border-[rgba(255,100,140,0.4)] hover:shadow-[0_0_25px_rgba(255,60,120,0.22),0_16px_48px_-16px_rgba(239,68,68,0.2)] active:scale-[0.99]">
                        <div
                          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent opacity-0 transition group-hover:opacity-100"
                          aria-hidden
                        />
                        <div className="relative flex flex-1 flex-col gap-4 p-5 sm:p-6">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                              Game
                            </p>
                            <Link
                              href={`/codes/${item.gameSlug}`}
                              className="mt-1 line-clamp-2 text-lg font-bold text-white transition hover:text-red-200 hover:underline"
                            >
                              {item.gameTitle}
                            </Link>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-200 ring-1 ring-emerald-500/40">
                              Active
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                              Code
                            </p>
                            <p className="mt-1.5 break-all rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 font-mono text-base font-bold tracking-wide text-red-100 sm:text-lg">
                              {item.code}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                              Description
                            </p>
                            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-zinc-300">
                              {item.description}
                            </p>
                          </div>
                          <div className="mt-auto pt-1">
                            <CopyCodeButton code={item.code} variant="game" />
                          </div>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div
              id={`${tabListId}-faq-panel`}
              role="tabpanel"
              aria-labelledby={`${tabListId}-faq`}
              className="mx-auto max-w-3xl animate-fade-up space-y-3"
            >
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.q}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-[250ms] ease-out open:border-red-400/35 open:bg-white/[0.08] open:shadow-[0_0_20px_rgba(255,60,120,0.12)]"
                >
                  <summary className="relative flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-left text-sm font-bold text-white transition marker:content-none sm:px-6 sm:py-5 sm:text-base [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1 pr-2">{item.q}</span>
                    <span
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition duration-300 group-open:rotate-180"
                      aria-hidden
                    >
                      <ChevronIcon />
                    </span>
                  </summary>
                  <div className="border-t border-white/10 px-5 pb-5 pt-1 text-sm leading-relaxed text-zinc-300 sm:px-6 sm:pb-6 sm:text-base">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
