"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  SUPABASE_BROWSER_CONFIG_HELP,
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isSupabaseBrowserConfigured()) {
        setError(SUPABASE_BROWSER_CONFIG_HELP);
        return;
      }
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError(SUPABASE_BROWSER_CONFIG_HELP);
        return;
      }
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signError) {
        setError(signError.message);
        return;
      }
      router.replace("/admin/add-game");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-[#0a0e16]/90 p-8 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)] backdrop-blur-xl"
    >
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Admin login
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Sign in with your Supabase Auth email and password.
        </p>
      </div>

      {error ? (
        <p
          className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          required
          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-blue-500/30 transition focus:border-blue-500/40 focus:ring-2"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="admin-password" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required
          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-blue-500/30 transition focus:border-blue-500/40 focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-glow-red w-full rounded-xl py-3 text-sm font-bold text-white transition enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
