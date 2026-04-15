import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublicAnonKey,
  getSupabasePublicUrl,
  isSupabasePublicConfigured,
} from "@/lib/env/supabase-public";

/**
 * Shown when NEXT_PUBLIC_* vars are unset (e.g. local dev or Vercel without env).
 * Local: add them to `.env.local` (dev server reloads when that file changes if you use `npm run dev`).
 * Vercel: Project → Settings → Environment Variables, then redeploy.
 */
export const SUPABASE_BROWSER_CONFIG_HELP =
  "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
  "to .env.local for localhost (or Vercel env for production), then restart or redeploy.";

/** True when both public env vars are non-empty (after trim). */
export function isSupabaseBrowserConfigured(): boolean {
  return isSupabasePublicConfigured();
}

/**
 * Browser-only client. Uses **only** `NEXT_PUBLIC_SUPABASE_URL` and
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same names on Vercel). Returns `null` if either
 * is missing — do not throw; show {@link SUPABASE_BROWSER_CONFIG_HELP} in the UI.
 */
export function createSupabaseBrowserClient(): SupabaseClient | null {
  const url = getSupabasePublicUrl();
  const key = getSupabasePublicAnonKey();
  if (!url || !key) {
    return null;
  }
  return createBrowserClient(url, key);
}
