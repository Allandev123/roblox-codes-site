import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabasePublicAnonKey,
  getSupabasePublicUrl,
} from "@/lib/env/supabase-public";

/**
 * Server-side client for public reads. Uses only `NEXT_PUBLIC_SUPABASE_URL` and
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Returns `null` if unset or if client creation fails.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const url = getSupabasePublicUrl();
  const key = getSupabasePublicAnonKey();
  if (!url || !key) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* ignore when called from a Server Component without mutable cookies */
          }
        },
      },
    });
  } catch {
    return null;
  }
}
