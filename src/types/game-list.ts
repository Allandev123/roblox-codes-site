/** Minimal fields for catalog / home cards (Supabase or static `Game`). */
export type GameListItem = {
  /** Supabase `games.id` when present (UUID), for loading related `codes` rows. */
  id?: string | null;
  slug: string;
  title: string;
  /** Used by /codes search when listing DB-backed games. */
  description?: string | null;
  /** Same URL as `image` (kept for compatibility with older components). */
  cardImage: string;
  /** `games.image` — Roblox icon URL from the database. */
  image: string;
  playingLabel: string;
  codeCount: number;
  /** Roblox experience `place_id` (no `universe_id` stored in DB). */
  placeId: number | null;
};
