"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SUPABASE_BROWSER_CONFIG_HELP,
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser";
import { LoginForm } from "@/app/admin/login/login-form";

function EnvMissingNotice() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-500/35 bg-amber-950/30 px-6 py-5 text-center shadow-lg shadow-amber-900/20">
      <p className="text-sm font-semibold text-amber-100" role="alert">
        {SUPABASE_BROWSER_CONFIG_HELP}
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

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
      if (user) {
        router.replace("/admin/games");
        return;
      }
      setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!isSupabaseBrowserConfigured()) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[#05070c] px-4 py-16">
        <EnvMissingNotice />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[#05070c] px-4 py-16">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 20% 0%, rgba(239,68,68,0.2), transparent), radial-gradient(ellipse 50% 40% at 80% 10%, rgba(59,130,246,0.18), transparent)",
        }}
      />
      {checking ? (
        <p className="text-sm font-medium text-zinc-400">Checking session…</p>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
