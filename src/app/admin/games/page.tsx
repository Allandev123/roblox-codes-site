"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SUPABASE_BROWSER_CONFIG_HELP,
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser";

type GameRow = {
  id: string;
  title: string | null;
  slug: string | null;
  players: string | null;
  place_id: number | null;
};

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export default function AdminGamesPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<GameRow[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadGames() {
    setError(null);
    setLoading(true);
    try {
      if (!isSupabaseBrowserConfigured()) {
        setError(SUPABASE_BROWSER_CONFIG_HELP);
        return;
      }
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError(SUPABASE_BROWSER_CONFIG_HELP);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data, error: selectError } = await supabase
        .from("games")
        .select("id, title, slug, players, place_id")
        .order("title", { ascending: true });

      if (selectError) {
        setError(selectError.message);
        return;
      }
      setGames((data as GameRow[]) ?? []);
    } catch (cause) {
      setError(formatError(cause));
    } finally {
      setChecking(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return games;
    return games.filter((game) => {
      const title = (game.title ?? "").toLowerCase();
      const slug = (game.slug ?? "").toLowerCase();
      return title.includes(q) || slug.includes(q);
    });
  }, [games, query]);

  async function handleDeleteGame(gameId: string) {
    const confirmed = window.confirm(
      "Delete this game? If codes reference this game, Supabase may block deletion.",
    );
    if (!confirmed) return;
    setDeletingId(gameId);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError(SUPABASE_BROWSER_CONFIG_HELP);
        return;
      }

      const { error: deleteError } = await supabase
        .from("games")
        .delete()
        .eq("id", gameId);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      setGames((prev) => prev.filter((game) => game.id !== gameId));
    } catch (cause) {
      setError(formatError(cause));
    } finally {
      setDeletingId(null);
    }
  }

  if (!isSupabaseBrowserConfigured()) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#05070c] px-4 py-16 sm:px-6">
        <p className="mx-auto max-w-3xl rounded-2xl border border-amber-500/35 bg-amber-950/30 p-6 text-sm text-amber-100">
          {SUPABASE_BROWSER_CONFIG_HELP}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#05070c] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300/90">
              Admin CMS
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Games
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Manage games and open each game to edit codes, status, and bulk
              imports.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/add-game"
              className="rounded-xl border border-blue-500/40 bg-blue-600/20 px-4 py-2.5 text-sm font-bold text-blue-100 transition hover:bg-blue-600/30"
            >
              Add game
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#0a0e16]/85 p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or slug..."
              className="w-full max-w-sm rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-blue-500/25 focus:border-blue-500/40 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => void loadGames()}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            >
              Refresh
            </button>
          </div>

          {error ? (
            <p
              className="mb-4 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {checking || loading ? (
            <p className="text-sm text-zinc-400">Loading games...</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-zinc-300">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Slug</th>
                    <th className="px-4 py-3 font-semibold">Players</th>
                    <th className="px-4 py-3 font-semibold">Place ID</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGames.map((game) => (
                    <tr
                      key={game.id}
                      className="border-t border-white/10 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3 text-zinc-100">
                        {game.title ?? "(untitled)"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                        {game.slug ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {game.players ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {game.place_id ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/games/${game.id}`}
                            className="rounded-lg border border-blue-500/40 bg-blue-600/20 px-3 py-1.5 text-xs font-bold text-blue-100 transition hover:bg-blue-600/30"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleDeleteGame(game.id)}
                            disabled={deletingId === game.id}
                            className="rounded-lg border border-red-500/35 bg-red-600/20 px-3 py-1.5 text-xs font-bold text-red-100 transition hover:bg-red-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === game.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredGames.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-5 text-center text-zinc-500"
                        colSpan={5}
                      >
                        No games found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
