"use client";

import Link from "next/link";
import { useMemo } from "react";
import { GameCard } from "@/components/game-card";
import type { GameListItem } from "@/types/game-list";

const TRENDING_COUNT = 6;

type Props = {
  games: GameListItem[];
  fetchError?: string | null;
  /** Dev-only: show setup hint when `NEXT_PUBLIC_SUPABASE_*` are missing (never in production). */
  showSupabaseEnvHint?: boolean;
};

export function TrendingGames({
  games,
  fetchError,
  showSupabaseEnvHint = false,
}: Props) {
  const trending = useMemo(
    () => games.slice(0, TRENDING_COUNT),
    [games],
  );

  return (
    <section
      id="trending"
      className="scroll-mt-24 border-t border-white/5 px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="animate-section-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              <span className="bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
                Popular Games
              </span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Popular picks players are redeeming right now. Open any game for
              full code lists, redemption steps, and fresh update timestamps.
            </p>
            {fetchError ? (
              <p
                className="mt-4 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200"
                role="alert"
              >
                {fetchError}
              </p>
            ) : null}
          </div>
          <Link
            href="/codes"
            className="btn-outline-neon inline-flex shrink-0 items-center justify-center rounded-xl border border-blue-400/35 bg-blue-600/15 px-5 py-2.5 text-sm font-bold text-blue-100 shadow-[0_0_24px_rgba(59,130,246,0.2)] hover:border-blue-300/55 hover:bg-blue-600/25"
          >
            View all Roblox game codes →
          </Link>
        </div>

        {trending.length === 0 && !fetchError && showSupabaseEnvHint ? (
          <p className="mt-10 rounded-2xl border border-amber-500/25 bg-amber-950/20 p-8 text-center text-sm text-amber-100/90">
            Supabase env is not set. Copy{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-200">
              .env.example
            </code>{" "}
            to{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-200">
              .env.local
            </code>
            , add{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-200">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-200">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            from the Supabase dashboard, save the file — the dev server will restart — then refresh.
          </p>
        ) : null}

        {trending.length === 0 && !fetchError && !showSupabaseEnvHint ? (
          <p className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-zinc-400">
            No games. Add rows to the{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
              games
            </code>{" "}
            table in Supabase or use the admin add-game flow.
          </p>
        ) : null}

        {trending.length > 0 ? (
          <ul className="animate-section-in animate-section-in-delay-1 mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((game, index) => (
              <li
                key={game.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
              >
                <GameCard game={game} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
