/** One row for the homepage “Latest codes” grid (from Supabase `codes` + `games`). */
export type LatestCodeHome = {
  id: string;
  code: string;
  gameTitle: string;
  gameSlug: string;
};
