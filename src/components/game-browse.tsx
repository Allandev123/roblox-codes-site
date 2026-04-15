"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { GameCard } from "@/components/game-card";
import type { GameListItem } from "@/types/game-list";

type Props = {
  games: GameListItem[];
  sectionId?: string;
  title: string;
  description: string;
  searchInputId?: string;
};

export function GameBrowse({
  games,
  sectionId = "game-grid",
  title,
  description,
  searchInputId = "game-search",
}: Props) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(() => {
    if (!deferred) return games;
    return games.filter((g) => {
      const title = (g.title ?? "").toLowerCase();
      const desc = (g.description ?? "").toLowerCase();
      const slug = (g.slug ?? "").toLowerCase().replace(/-/g, " ");
      return (
        title.includes(deferred) ||
        desc.includes(deferred) ||
        slug.includes(deferred)
      );
    });
  }, [games, deferred]);

  return (
    <section
      id={sectionId}
      className="scroll-mt-24 border-t border-white/5 bg-[#05070c]/80 px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="animate-section-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              <span className="bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
                {title}
              </span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">{description}</p>
          </div>
        </div>

        <div className="animate-section-in animate-section-in-delay-1 relative mt-8">
          <label htmlFor={searchInputId} className="sr-only">
            Search games
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-500">
            <SearchIcon />
          </div>
          <input
            id={searchInputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by game name…"
            autoComplete="off"
            className="w-full rounded-2xl border border-white/10 bg-[#0c1220] py-4 pl-12 pr-4 text-sm font-medium text-white shadow-[inset_0_0_0_1px_rgba(59,130,246,0.08)] outline-none ring-blue-500/30 transition placeholder:text-zinc-600 focus:border-blue-500/40 focus:ring-2"
          />
        </div>

        {filtered.length === 0 ? (
          <p
            className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-zinc-400"
            role="status"
          >
            No games match &ldquo;{query}&rdquo;. Try another name.
          </p>
        ) : (
          <ul className="animate-section-in animate-section-in-delay-2 mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((game, index) => (
              <li
                key={game.slug || `game-${index}`}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
              >
                <GameCard game={game} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
