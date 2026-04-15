"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchRobloxGameByPlaceId } from "@/lib/roblox-game-api";
import { safeImage } from "@/lib/safe-image";
import {
  SUPABASE_BROWSER_CONFIG_HELP,
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser";

function slugify(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base.length > 0 ? base.slice(0, 96) : "game";
}

export function AddGameForm() {
  const router = useRouter();
  const [placeId, setPlaceId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [players, setPlayers] = useState("");
  const [image, setImage] = useState("");
  const [banner, setBanner] = useState("");

  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleFetchGameData() {
    setFetchError(null);
    setSaveSuccess(false);
    const id = Number(placeId.trim());
    if (!Number.isFinite(id) || id <= 0 || !Number.isInteger(id)) {
      setFetchError("Enter a valid numeric place_id.");
      return;
    }

    setFetchLoading(true);
    try {
      const result = await fetchRobloxGameByPlaceId(id);
      if (!result.ok) {
        setFetchError(result.error);
        return;
      }

      const { title: t, description: d, players: p, image: img, banner: b } =
        result.data;
      setTitle(t);
      setDescription(d);
      setPlayers(p);
      setImage(img);
      setBanner(b);
    } finally {
      setFetchLoading(false);
    }
  }

  async function handleSaveGame() {
    setSaveError(null);
    setSaveSuccess(false);
    const id = Number(placeId.trim());
    if (!Number.isFinite(id) || id <= 0) {
      setSaveError("Enter a valid place_id before saving.");
      return;
    }
    if (!title.trim()) {
      setSaveError("Fetch game data first or enter a title.");
      return;
    }

    setSaveLoading(true);
    try {
      if (!isSupabaseBrowserConfigured()) {
        setSaveError(SUPABASE_BROWSER_CONFIG_HELP);
        return;
      }
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setSaveError(SUPABASE_BROWSER_CONFIG_HELP);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaveError("You must be signed in to save a game.");
        router.replace("/admin/login");
        return;
      }

      const trimmedTitle = title.trim();
      const baseSlug = slugify(trimmedTitle);
      let finalSlug = baseSlug;

      for (let n = 0; n < 50; n += 1) {
        const candidate = n === 0 ? baseSlug : `${baseSlug}-${n}`;
        const { data: clash } = await supabase
          .from("games")
          .select("id")
          .eq("slug", candidate)
          .maybeSingle();
        if (!clash) {
          finalSlug = candidate;
          break;
        }
        if (n === 49) {
          setSaveError("Could not generate a unique slug.");
          return;
        }
      }

      const iconUrl = safeImage(image);
      const bannerUrl = safeImage(banner.trim() || image);

      const { error } = await supabase.from("games").insert({
        title: trimmedTitle,
        description: description.trim(),
        image: iconUrl,
        banner_image: bannerUrl,
        players: players.trim(),
        place_id: id,
        slug: finalSlug,
      });

      if (error) {
        setSaveError(error.message);
        return;
      }

      setSaveSuccess(true);
      router.refresh();
    } catch {
      setSaveError("Save failed unexpectedly.");
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300/90">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
          Add game
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Pull live metadata from Roblox using only{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-200">
            place_id
          </code>
          , then save to Supabase.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-[#0a0e16]/80 p-6 shadow-inner shadow-black/30 sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Roblox lookup
        </h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="place-id" className="text-xs font-semibold text-zinc-500">
              place_id
            </label>
            <input
              id="place-id"
              type="text"
              inputMode="numeric"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="e.g. 2753915549"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white outline-none ring-blue-500/25 focus:border-blue-500/40 focus:ring-2"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleFetchGameData()}
            disabled={fetchLoading}
            className="shrink-0 rounded-xl border border-blue-500/40 bg-blue-600/25 px-6 py-3 text-sm font-bold text-blue-100 transition hover:bg-blue-600/35 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fetchLoading ? "Fetching…" : "Fetch game data"}
          </button>
        </div>
        {fetchError ? (
          <p className="mt-4 text-sm text-red-300" role="alert">
            {fetchError}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0a0e16]/80 p-6 sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Auto-filled fields
        </h2>
        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="field-title" className="text-xs font-semibold text-zinc-500">
              title
            </label>
            <input
              id="field-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-red-500/20 focus:border-red-500/40 focus:ring-2"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="field-desc" className="text-xs font-semibold text-zinc-500">
              description
            </label>
            <textarea
              id="field-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-red-500/20 focus:border-red-500/40 focus:ring-2"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="field-players" className="text-xs font-semibold text-zinc-500">
              players
            </label>
            <input
              id="field-players"
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-red-500/20 focus:border-red-500/40 focus:ring-2"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="field-image" className="text-xs font-semibold text-zinc-500">
              image (Roblox icon URL)
            </label>
            <input
              id="field-image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs text-white outline-none ring-red-500/20 focus:border-red-500/40 focus:ring-2"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="field-banner" className="text-xs font-semibold text-zinc-500">
              banner_image (wide game thumbnail)
            </label>
            <input
              id="field-banner"
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs text-white outline-none ring-red-500/20 focus:border-red-500/40 focus:ring-2"
            />
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8">
          {saveError ? (
            <p className="mb-4 text-sm text-red-300" role="alert">
              {saveError}
            </p>
          ) : null}
          {saveSuccess ? (
            <p className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
              Game saved. Slug was generated from the title. You can add another
              place_id or refresh the homepage.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void handleSaveGame()}
            disabled={saveLoading}
            className="btn-glow-red w-full rounded-xl py-3.5 text-sm font-bold text-white transition enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
          >
            {saveLoading ? "Saving…" : "Save game"}
          </button>
        </div>
      </section>
    </div>
  );
}
