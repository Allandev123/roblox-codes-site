/**
 * Public Supabase credentials for @supabase/ssr (server + browser).
 * Next.js injects `NEXT_PUBLIC_*` at build time for the client bundle; in dev it reads
 * from `.env.local` then `.env` (see https://nextjs.org/docs/app/building-your-application/configuring/environment-variables).
 */
export function getSupabasePublicUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
}

export function getSupabasePublicAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
}

/** True when either public var is unset or whitespace-only. */
export function isSupabasePublicEnvMissing(): boolean {
  return !getSupabasePublicUrl() || !getSupabasePublicAnonKey();
}

/** True when both `NEXT_PUBLIC_SUPABASE_*` values are non-empty (after trim). */
export function isSupabasePublicConfigured(): boolean {
  return !isSupabasePublicEnvMissing();
}
