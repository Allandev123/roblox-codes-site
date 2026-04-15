import type { PostgrestError } from "@supabase/supabase-js";
import type { Game, GameCode } from "@/data/games";
import type { LatestCodeHome } from "@/types/latest-code-home";
import type { GameListItem } from "@/types/game-list";
import { getGameBySlug as getStaticGameBySlug } from "@/lib/games";
import { ROBLOX_DEFAULT_GAME_ICON } from "@/lib/roblox-image-defaults";
import {
  enrichGameWithPlaceIcons,
  fetchPlaceGameIconUrls,
} from "@/lib/roblox-place-gameicons";
import { createSupabaseServerClient } from "./supabase/server";

export type { LatestCodeHome } from "@/types/latest-code-home";

const SHOULD_LOG_GAMES_FETCH =
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_SUPABASE_GAMES === "1";

/** Logs project URL + raw `DATA` / `ERROR` for `from("games").select("*")` (dev always; prod with DEBUG_*). */
const LOG_SUPABASE_GAMES_QUERY =
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_SUPABASE_GAMES === "1" ||
  process.env.DEBUG_SUPABASE_QUERY === "1";

/** When `1`, `/codes` and game detail skip static `src/data/games` fallback (Supabase-only). */
export function isSupabaseCatalogOnly(): boolean {
  return process.env.NEXT_PUBLIC_SUPABASE_ONLY_CATALOG === "1";
}

function logGamesFetch(
  label: string,
  info: {
    rawCount: number;
    mappedCount: number;
    skippedRows: number;
    error: PostgrestError | Error | null;
    sampleSlugs: string[];
  },
) {
  if (!SHOULD_LOG_GAMES_FETCH) return;

  const { rawCount, mappedCount, skippedRows, error, sampleSlugs } = info;

  if (error) {
    const pe = error as PostgrestError;
    console.warn(`[getGames/${label}] Supabase error:`, error.message, {
      code: "code" in pe ? pe.code : undefined,
      details: "details" in pe ? pe.details : undefined,
      hint: "hint" in pe ? pe.hint : undefined,
    });
    return;
  }

  console.log(`[getGames/${label}]`, {
    rawCount,
    mappedCount,
    skippedRows,
    sampleSlugs: sampleSlugs.slice(0, 5),
  });

  if (rawCount === 0) {
    console.log(
      "[getGames/hint] Empty table, or RLS is blocking SELECT for role `anon`. " +
        "Run `supabase/games-public-select.sql` in the SQL editor (see file comments).",
    );
  } else if (mappedCount === 0 && rawCount > 0) {
    console.warn(
      "[getGames/hint] Rows returned but none mapped — check `title` and `slug` columns (non-empty strings).",
    );
  }
}

/**
 * Shape of a row in `public.games`.
 * Use snake_case to match typical Postgres columns; map to `GameListItem` in `getGames`.
 */
export interface GameRow {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  /** Primary art URL from DB (thumbnail fallback). */
  image?: string | null;
  card_image?: string | null;
  banner_image?: string | null;
  /** Roblox place id (preferred over `roblox_place_id` if both exist). */
  place_id?: number | null;
  roblox_place_id?: number | null;
  /** Online players label (e.g. from admin save). */
  players?: string | null;
  playing_label?: string | null;
  last_updated?: string | null;
  last_updated_iso?: string | null;
  /** JSON array of codes, or omit and use `code_count` */
  codes?: unknown;
  code_count?: number | null;
}

export type FetchAllGamesResult = {
  data: GameRow[];
  error: PostgrestError | Error | null;
};

/** Row shape for `public.codes` (expects `game_id` → `games.id`). */
export interface CodeRow {
  id?: string;
  game_id?: string | null;
  code?: string | null;
  reward?: string | null;
  description?: string | null;
}

export type GetCodesResult = {
  data: CodeRow[];
  error: PostgrestError | Error | null;
};

function parseCodesLength(codes: unknown): number {
  if (Array.isArray(codes)) return codes.length;
  if (typeof codes === "string") {
    try {
      const parsed = JSON.parse(codes) as unknown;
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }
  return 0;
}

function stringField(v: unknown): string | null {
  if (typeof v === "string") {
    const t = v.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    return String(v);
  }
  return null;
}

function parsePositiveInteger(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) {
    return Math.trunc(v);
  }
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return undefined;
    const n = Number(t);
    if (Number.isFinite(n) && n > 0 && n === Math.floor(n)) return n;
  }
  return undefined;
}

function placeIdFromRow(row: GameRow): number | null {
  const raw = row.place_id ?? row.roblox_place_id;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.trunc(raw);
  }
  return null;
}

function slugFromTitle(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const s = base.slice(0, 96);
  return s.length > 0 ? s : "game";
}

/** Maps a PostgREST row to {@link GameRow}; returns null if there is no usable title. */
function normalizeGameRow(row: unknown): GameRow | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;

  const title = stringField(r.title);
  if (!title) return null;

  const slug = stringField(r.slug) ?? slugFromTitle(title);

  const idRaw = r.id;
  const id =
    typeof idRaw === "string" && idRaw.length > 0
      ? idRaw
      : typeof idRaw === "number" && Number.isFinite(idRaw)
        ? String(idRaw)
        : "";

  return {
    id,
    slug,
    title,
    description:
      typeof r.description === "string" || r.description === null
        ? (r.description as string | null)
        : undefined,
    image: typeof r.image === "string" ? r.image : undefined,
    card_image: typeof r.card_image === "string" ? r.card_image : undefined,
    banner_image: typeof r.banner_image === "string" ? r.banner_image : undefined,
    place_id: parsePositiveInteger(r.place_id),
    roblox_place_id: parsePositiveInteger(r.roblox_place_id),
    players: typeof r.players === "string" ? r.players : undefined,
    playing_label: typeof r.playing_label === "string" ? r.playing_label : undefined,
    last_updated: typeof r.last_updated === "string" ? r.last_updated : undefined,
    last_updated_iso:
      typeof r.last_updated_iso === "string" ? r.last_updated_iso : undefined,
    codes: r.codes,
    code_count: typeof r.code_count === "number" ? r.code_count : undefined,
  };
}

function rowToGameListItem(
  row: GameRow,
  codeCountFromCodesTable: number | undefined,
  resolvedIconUrl: string,
): GameListItem {
  const fromColumn =
    typeof row.code_count === "number" && row.code_count >= 0
      ? row.code_count
      : 0;
  const fromJson = parseCodesLength(row.codes);
  const fromRelation =
    typeof codeCountFromCodesTable === "number" && codeCountFromCodesTable >= 0
      ? codeCountFromCodesTable
      : 0;
  const codeCount = Math.max(fromColumn, fromJson, fromRelation);

  const playingLabel =
    row.players?.trim() || row.playing_label?.trim() || null;

  const placeId = placeIdFromRow(row);

  const desc =
    typeof row.description === "string" ? row.description.trim() : "";

  return {
    id: row.id && row.id.length > 0 ? row.id : null,
    slug: row.slug.trim(),
    title: row.title.trim(),
    description: desc.length > 0 ? desc : null,
    image: resolvedIconUrl,
    cardImage: resolvedIconUrl,
    playingLabel: playingLabel && playingLabel.length > 0 ? playingLabel : "—",
    codeCount,
    placeId,
  };
}

/**
 * Loads every row from the `games` table (`select *`).
 * Never throws: missing env → empty list; network/DB errors → error field only.
 */
export async function fetchAllGames(): Promise<FetchAllGamesResult> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      if (LOG_SUPABASE_GAMES_QUERY) {
        console.log(
          "NEXT_PUBLIC_SUPABASE_URL:",
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(undefined)",
        );
        console.log("DATA:", null);
        console.log(
          "ERROR:",
          "Supabase server client is null — check NEXT_PUBLIC_SUPABASE_* in .env.local and restart `npm run dev`.",
        );
      } else if (SHOULD_LOG_GAMES_FETCH) {
        console.log(
          "[fetchAllGames] no Supabase client (missing env or cookies error)",
        );
      }
      return { data: [], error: null };
    }

    const { data, error } = await supabase.from("games").select("*");

    if (LOG_SUPABASE_GAMES_QUERY) {
      console.log(
        "NEXT_PUBLIC_SUPABASE_URL:",
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(undefined)",
      );
      console.log("DATA:", data);
      console.log("ERROR:", error);
      if (!error && Array.isArray(data) && data.length === 0) {
        console.warn(
          "[Supabase] DATA is [] and ERROR is null — empty `games` table, RLS hiding all rows, or NEXT_PUBLIC_SUPABASE_URL points at a different project than where your data lives. Compare this URL to Supabase Dashboard → Settings → API.",
        );
      }
      if (error) {
        const pe = error as PostgrestError;
        console.error("[Supabase] Full PostgREST error:", {
          message: pe.message,
          code: pe.code,
          details: pe.details,
          hint: pe.hint,
        });
      }
    }

    const rows = Array.isArray(data) ? data : [];
    if (SHOULD_LOG_GAMES_FETCH && !LOG_SUPABASE_GAMES_QUERY) {
      console.log("[fetchAllGames] supabase.from(\"games\").select(\"*\")", {
        dataIsArray: Array.isArray(data),
        rowCount: rows.length,
        error: error
          ? { message: error.message, code: error.code, details: error.details }
          : null,
      });
    }

    if (error) {
      return { data: [], error };
    }

    return { data: rows as GameRow[], error: null };
  } catch (cause) {
    const err =
      cause instanceof Error ? cause : new Error(String(cause));
    return { data: [], error: err };
  }
}

/**
 * Loads `codes` rows for many games in one query; returns counts per `game_id`.
 * Never throws; missing client or missing `codes` table → empty map.
 */
async function fetchCodeCountsByGameIds(
  gameIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const ids = gameIds.filter((id) => id.length > 0);
  if (ids.length === 0) return counts;

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return counts;

    const { data, error } = await supabase
      .from("codes")
      .select("game_id")
      .in("game_id", ids);

    if (SHOULD_LOG_GAMES_FETCH) {
      console.log("codes (batch game_id rows):", data, error);
    }

    if (error) return counts;

    const rows = Array.isArray(data) ? data : [];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const gid = (row as { game_id?: unknown }).game_id;
      if (gid == null) continue;
      const key = String(gid);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  } catch {
    /* table may not exist yet */
  }

  return counts;
}

/**
 * All codes for one game (`game_id` matches `games.id`).
 * Never throws; returns `[]` when unset or on error.
 */
export async function getCodesByGameId(gameId: string): Promise<GetCodesResult> {
  if (!gameId || !gameId.trim()) {
    return { data: [], error: null };
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from("codes")
      .select("*")
      .eq("game_id", gameId);

    if (SHOULD_LOG_GAMES_FETCH) {
      console.log("codes:", data, error);
    }

    if (error) {
      return { data: [], error };
    }

    const rows = Array.isArray(data) ? data : [];
    return { data: rows as CodeRow[], error: null };
  } catch (cause) {
    const err =
      cause instanceof Error ? cause : new Error(String(cause));
    return { data: [], error: err };
  }
}

function mapCodeRowToGameCode(row: unknown): GameCode | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const code = stringField(r.code);
  if (!code) return null;
  const reward =
    stringField(r.reward) ??
    stringField(
      typeof r.description === "string" ? r.description : undefined,
    ) ??
    "Reward";
  return { code, reward };
}

function dbRowToGame(
  row: GameRow,
  codes: GameCode[],
  resolvedCardImage: string,
): Game {
  const fromBanner = row.banner_image?.trim();
  const cardUrl = resolvedCardImage;
  const bannerUrl =
    fromBanner?.startsWith("https://thumbnails.roblox.com/") === true
      ? fromBanner
      : cardUrl;

  const placeIdRaw = row.place_id ?? row.roblox_place_id;
  const robloxPlaceId =
    typeof placeIdRaw === "number" && Number.isFinite(placeIdRaw)
      ? placeIdRaw
      : 0;

  const playingLabel =
    row.players?.trim() || row.playing_label?.trim() || "—";

  const desc =
    typeof row.description === "string" && row.description.trim().length > 0
      ? row.description.trim()
      : "";

  const lastIso =
    typeof row.last_updated_iso === "string" && row.last_updated_iso.length > 0
      ? row.last_updated_iso
      : new Date().toISOString().slice(0, 10);

  const lastHuman =
    typeof row.last_updated === "string" && row.last_updated.length > 0
      ? row.last_updated
      : "Recently";

  return {
    slug: row.slug.trim(),
    title: row.title.trim(),
    description: desc,
    cardImage: cardUrl,
    bannerImage: bannerUrl,
    robloxPlaceId,
    playingLabel,
    lastUpdated: lastHuman,
    lastUpdatedIso: lastIso,
    codes: Array.isArray(codes) ? codes : [],
  };
}

/**
 * Prefer Supabase `games` + `codes` for this slug; otherwise static catalog.
 */
export async function getGameWithCodesBySlug(
  slug: string,
): Promise<Game | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("slug", trimmed)
        .maybeSingle();

      if (LOG_SUPABASE_GAMES_QUERY) {
        console.log(
          `[Supabase] single game slug="${trimmed}" NEXT_PUBLIC_SUPABASE_URL:`,
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(undefined)",
        );
        console.log("DATA:", data);
        console.log("ERROR:", error);
        if (error) {
          const pe = error as PostgrestError;
          console.error("[Supabase] game-by-slug PostgREST error:", {
            message: pe.message,
            code: pe.code,
            details: pe.details,
            hint: pe.hint,
          });
        }
      } else if (SHOULD_LOG_GAMES_FETCH) {
        console.log("game by slug:", data, error);
      }

      if (!error && data) {
        const normalized = normalizeGameRow(data);
        if (normalized) {
          const gameId = normalized.id?.trim() ?? "";
          const codesRes = await getCodesByGameId(gameId);
          const gameCodes: GameCode[] = [];
          const rawCodes = Array.isArray(codesRes.data) ? codesRes.data : [];
          for (const c of rawCodes) {
            const mapped = mapCodeRowToGameCode(c);
            if (mapped) gameCodes.push(mapped);
          }
          if (SHOULD_LOG_GAMES_FETCH) {
            console.log("codes for page:", gameCodes);
          }
          const pid = placeIdFromRow(normalized);
          const iconMap = await fetchPlaceGameIconUrls(
            pid != null ? [pid] : [],
          );
          const resolvedCard =
            pid != null
              ? (iconMap.get(pid) ?? ROBLOX_DEFAULT_GAME_ICON)
              : ROBLOX_DEFAULT_GAME_ICON;
          return dbRowToGame(normalized, gameCodes, resolvedCard);
        }
      }
    }
  } catch {
    if (isSupabaseCatalogOnly()) return null;
  }

  if (isSupabaseCatalogOnly()) {
    return null;
  }

  const staticGame = getStaticGameBySlug(trimmed);
  if (staticGame) {
    return enrichGameWithPlaceIcons(staticGame);
  }
  return null;
}

export type GetGamesResult = {
  data: GameListItem[];
  error: PostgrestError | Error | null;
};

/**
 * Fetches all games from Supabase and maps them for list/card UI.
 * Never throws: always returns `data` as an array (possibly empty).
 */
export async function getGames(): Promise<GetGamesResult> {
  try {
    const { data, error } = await fetchAllGames();

    if (LOG_SUPABASE_GAMES_QUERY) {
      console.log("getGames raw rows:", data, "error:", error);
    } else if (SHOULD_LOG_GAMES_FETCH) {
      console.log("getGames raw:", data, error);
    }

    if (error) {
      logGamesFetch("after-fetch", {
        rawCount: 0,
        mappedCount: 0,
        skippedRows: 0,
        error,
        sampleSlugs: [],
      });
      return { data: [], error };
    }

    const rows = Array.isArray(data) ? data : [];
    const normalizedRows: GameRow[] = [];
    let skippedRows = 0;

    for (const row of rows) {
      try {
        const normalized = normalizeGameRow(row);
        if (!normalized) {
          skippedRows += 1;
          continue;
        }
        normalizedRows.push(normalized);
      } catch {
        skippedRows += 1;
      }
    }

    const gameIds = normalizedRows
      .map((r) => r.id?.trim())
      .filter((id): id is string => Boolean(id && id.length > 0));

    const codeCounts = await fetchCodeCountsByGameIds(gameIds);

    const placeIds = normalizedRows
      .map((r) => placeIdFromRow(r))
      .filter((id): id is number => id != null);
    const iconMap = await fetchPlaceGameIconUrls(placeIds);

    const list: GameListItem[] = [];
    for (const normalized of normalizedRows) {
      const gid = normalized.id?.trim() ?? "";
      const countFromCodes =
        gid.length > 0 ? (codeCounts.get(gid) ?? 0) : undefined;
      const pid = placeIdFromRow(normalized);
      const resolved =
        pid != null
          ? (iconMap.get(pid) ?? ROBLOX_DEFAULT_GAME_ICON)
          : ROBLOX_DEFAULT_GAME_ICON;
      list.push(rowToGameListItem(normalized, countFromCodes, resolved));
    }

    if (LOG_SUPABASE_GAMES_QUERY || SHOULD_LOG_GAMES_FETCH) {
      console.log("games:", list);
    }

    logGamesFetch("mapped", {
      rawCount: rows.length,
      mappedCount: list.length,
      skippedRows,
      error: null,
      sampleSlugs: list.map((g) => g.slug),
    });

    return { data: list, error: null };
  } catch (cause) {
    const err =
      cause instanceof Error ? cause : new Error(String(cause));
    return { data: [], error: err };
  }
}

type CodeRowWithGame = {
  id?: unknown;
  code?: unknown;
  games?: unknown;
};

function gamesJoinRow(
  raw: unknown,
): { title?: unknown; slug?: unknown } | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    const first = raw[0];
    return first && typeof first === "object"
      ? (first as { title?: unknown; slug?: unknown })
      : null;
  }
  if (typeof raw === "object") {
    return raw as { title?: unknown; slug?: unknown };
  }
  return null;
}

/**
 * Newest `codes` rows with parent game title/slug for the homepage grid.
 * Orders by `created_at` when present; otherwise by `id` descending.
 */
export async function getLatestCodesForHome(
  limit = 6,
): Promise<LatestCodeHome[]> {
  const max = Math.min(6, Math.max(4, limit));
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];

    const selectCols = "id, code, reward, games!inner(title, slug)";

    let res = await supabase
      .from("codes")
      .select(selectCols)
      .order("created_at", { ascending: false })
      .limit(max);

    if (res.error) {
      res = await supabase
        .from("codes")
        .select(selectCols)
        .order("id", { ascending: false })
        .limit(max);
    }

    if (res.error || !Array.isArray(res.data)) {
      return [];
    }

    const out: LatestCodeHome[] = [];
    for (const row of res.data as CodeRowWithGame[]) {
      const id = row.id != null ? String(row.id) : "";
      const code =
        typeof row.code === "string" ? row.code.trim() : "";
      const g = gamesJoinRow(row.games);
      const gameTitle =
        typeof g?.title === "string" ? g.title.trim() : "";
      const gameSlug =
        typeof g?.slug === "string" ? g.slug.trim() : "";
      if (!code || !gameTitle || !gameSlug) continue;
      out.push({
        id: id.length > 0 ? id : `${gameSlug}-${code}`,
        code,
        gameTitle,
        gameSlug,
      });
    }
    return out;
  } catch {
    return [];
  }
}
