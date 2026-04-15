/** One row for the homepage “Latest codes” grid (from Supabase `codes` + `games`). */
export type LatestCodeHome = {
  id: string;
  code: string;
  /** Maps to DB `codes.description` (what the code grants). */
  description: string;
  status: "active" | "expired";
  gameTitle: string;
  gameSlug: string;
};
