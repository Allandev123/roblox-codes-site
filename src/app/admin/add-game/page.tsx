"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddGameForm } from "@/app/admin/add-game/add-game-form";
import {
  SUPABASE_BROWSER_CONFIG_HELP,
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser";

function EnvMissingNotice() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-500/35 bg-amber-950/30 px-6 py-5 text-center shadow-lg shadow-amber-900/20">
      <p className="text-sm font-semibold text-amber-100" role="alert">
        {SUPABASE_BROWSER_CONFIG_HELP}
      </p>
    </div>
  );
}

export default function AdminAddGamePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      return;
    }

    let cancelled = false;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      if (!user) {
        router.replace("/admin/login");
        setChecking(false);
        setAuthorized(false);
        return;
      }
      setAuthorized(true);
      setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!isSupabaseBrowserConfigured()) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#05070c] px-4 py-16">
        <EnvMissingNotice />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#05070c] px-4 py-12 sm:px-6 sm:py-16">
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 40% at 10% 0%, rgba(239,68,68,0.15), transparent), radial-gradient(ellipse 45% 40% at 90% 20%, rgba(59,130,246,0.12), transparent)",
        }}
      />
      {checking ? (
        <p className="mx-auto max-w-2xl text-center text-sm font-medium text-zinc-400">
          Checking session…
        </p>
      ) : authorized ? (
        <AddGameForm />
      ) : (
        <p className="mx-auto max-w-2xl text-center text-sm text-zinc-500">
          Redirecting to login…
        </p>
      )}
    </div>
  );
}
