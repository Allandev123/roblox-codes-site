"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  SUPABASE_BROWSER_CONFIG_HELP,
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser";

type GameRecord = {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  image: string | null;
  banner_image: string | null;
  players: string | null;
  place_id: number | null;
};

type CodeRecord = {
  id: string;
  code: string | null;
  description: string | null;
  status: string | null;
};

const VALID_STATUSES = ["active", "expired"] as const;
type CodeStatus = (typeof VALID_STATUSES)[number];

function normalizeStatus(value: string): CodeStatus {
  const v = value.trim().toLowerCase();
  if (v === "expired" || v === "inactive" || v === "disabled") {
    return "expired";
  }
  return "active";
}

function dispatchAdminToast(
  message: string,
  variant: "success" | "error" = "success",
) {
  window.dispatchEvent(
    new CustomEvent("site:toast", { detail: { message, variant } }),
  );
}

type CodeEdit = {
  code: string;
  description: string;
  status: CodeStatus;
};

function editsFromRows(rows: CodeRecord[]): Record<string, CodeEdit> {
  const out: Record<string, CodeEdit> = {};
  for (const r of rows) {
    const id = String(r.id);
    out[id] = {
      code: r.code ?? "",
      description: r.description ?? "",
      status: normalizeStatus(r.status ?? "active"),
    };
  }
  return out;
}

function parseBulkLine(line: string): {
  code: string;
  description: string;
  status: CodeStatus;
} | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const parts = trimmed.split("|").map((part) => part.trim());
  const [code, description = "", statusRaw = "active"] = parts;
  if (!code) return null;
  return {
    code,
    description,
    status: normalizeStatus(statusRaw),
  };
}

function errorMessage(cause: unknown): string {
  if (cause instanceof Error) return cause.message;
  return "Unexpected error";
}

export default function AdminGameDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const gameId = params?.id ?? "";

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savingGame, setSavingGame] = useState(false);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [game, setGame] = useState<GameRecord | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [players, setPlayers] = useState("");

  const [codes, setCodes] = useState<CodeRecord[]>([]);
  /** Controlled draft per code row (synced from server on load; source of truth for Save). */
  const [codeEdits, setCodeEdits] = useState<Record<string, CodeEdit>>({});
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState<CodeStatus>("active");
  const [addingCode, setAddingCode] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [busyCodeId, setBusyCodeId] = useState<string | null>(null);

  async function ensureAuthorized() {
    if (!isSupabaseBrowserConfigured()) {
      setError(SUPABASE_BROWSER_CONFIG_HELP);
      return null;
    }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError(SUPABASE_BROWSER_CONFIG_HELP);
      return null;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/admin/login");
      return null;
    }
    return supabase;
  }

  async function loadGame() {
    setError(null);
    setLoading(true);
    try {
      const supabase = await ensureAuthorized();
      if (!supabase) return;
      const { data, error: fetchError } = await supabase
        .from("games")
        .select("id, title, slug, description, image, banner_image, players, place_id")
        .eq("id", gameId)
        .maybeSingle();
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      if (!data) {
        setError("Game not found.");
        return;
      }
      const row = data as GameRecord;
      setGame(row);
      setTitle(row.title ?? "");
      setDescription(row.description ?? "");
      setImage(row.image ?? "");
      setBannerImage(row.banner_image ?? "");
      setPlayers(row.players ?? "");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setChecking(false);
      setLoading(false);
    }
  }

  async function loadCodes() {
    setLoadingCodes(true);
    try {
      const supabase = await ensureAuthorized();
      if (!supabase) return;
      const { data, error: fetchError } = await supabase
        .from("codes")
        .select("id, code, description, status")
        .eq("game_id", gameId)
        .order("id", { ascending: false });
      if (fetchError) {
        setError(fetchError.message);
        dispatchAdminToast(fetchError.message, "error");
        return;
      }
      const rows = (data as CodeRecord[]) ?? [];
      setCodes(rows);
      setCodeEdits(editsFromRows(rows));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoadingCodes(false);
    }
  }

  useEffect(() => {
    if (!gameId) return;
    void (async () => {
      await loadGame();
      await loadCodes();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  async function handleSaveGame() {
    setSavingGame(true);
    setError(null);
    setNotice(null);
    try {
      const supabase = await ensureAuthorized();
      if (!supabase) return;
      const { error: updateError } = await supabase
        .from("games")
        .update({
          title: title.trim(),
          description: description.trim(),
          image: image.trim(),
          banner_image: bannerImage.trim(),
          players: players.trim(),
        })
        .eq("id", gameId);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setNotice("Game updated.");
      await loadGame();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSavingGame(false);
    }
  }

  async function handleAddCode() {
    setAddingCode(true);
    setError(null);
    setNotice(null);
    try {
      const codeValue = newCode.trim();
      if (!codeValue) {
        setError("Code is required.");
        return;
      }
      const supabase = await ensureAuthorized();
      if (!supabase) return;

      const { error: insertError } = await supabase.from("codes").insert({
        game_id: gameId,
        code: codeValue,
        description: newDescription.trim(),
        status: newStatus,
      });
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setNewCode("");
      setNewDescription("");
      setNewStatus("active");
      setNotice("Code added.");
      dispatchAdminToast("Code added", "success");
      await loadCodes();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setAddingCode(false);
    }
  }

  async function handleBulkInsert() {
    setBulkSaving(true);
    setError(null);
    setNotice(null);
    try {
      const parsed = bulkInput
        .split("\n")
        .map(parseBulkLine)
        .filter((row): row is NonNullable<typeof row> => row != null);

      if (parsed.length === 0) {
        setError("No valid rows found. Use: CODE | DESCRIPTION | STATUS");
        return;
      }

      const supabase = await ensureAuthorized();
      if (!supabase) return;
      const payload = parsed.map((row) => ({
        game_id: gameId,
        code: row.code,
        description: row.description,
        status: row.status,
      }));
      const { error: insertError } = await supabase.from("codes").insert(payload);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setBulkInput("");
      setNotice(`Inserted ${payload.length} codes.`);
      dispatchAdminToast(`Inserted ${payload.length} codes`, "success");
      await loadCodes();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBulkSaving(false);
    }
  }

  async function handleDeleteCode(codeId: string) {
    const confirmed = window.confirm("Delete this code?");
    if (!confirmed) return;
    const id = String(codeId).trim();
    if (!id) {
      setError("Invalid code id.");
      dispatchAdminToast("Invalid code id", "error");
      return;
    }
    setBusyCodeId(id);
    setError(null);
    setNotice(null);
    try {
      const supabase = await ensureAuthorized();
      if (!supabase) return;
      const { data, error: deleteError } = await supabase
        .from("codes")
        .delete()
        .eq("id", id)
        .select("id");
      if (deleteError) {
        setError(deleteError.message);
        dispatchAdminToast(deleteError.message, "error");
        return;
      }
      const deleted = Array.isArray(data) ? data.length : 0;
      if (deleted === 0) {
        const msg =
          "Delete had no effect (0 rows). Check that the id is correct and RLS allows DELETE on codes.";
        setError(msg);
        dispatchAdminToast(msg, "error");
        await loadCodes();
        return;
      }
      setCodes((prev) => prev.filter((code) => String(code.id) !== id));
      setCodeEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setNotice("Code deleted.");
      dispatchAdminToast("Code deleted", "success");
      await loadCodes();
    } catch (cause) {
      const msg = errorMessage(cause);
      setError(msg);
      dispatchAdminToast(msg, "error");
    } finally {
      setBusyCodeId(null);
    }
  }

  function updateCodeEditField(
    codeId: string,
    field: keyof CodeEdit,
    value: string,
  ) {
    setCodeEdits((prev) => {
      const current = prev[codeId] ?? {
        code: "",
        description: "",
        status: "active" as CodeStatus,
      };
      const nextVal =
        field === "status" ? normalizeStatus(value) : value;
      return {
        ...prev,
        [codeId]: { ...current, [field]: nextVal },
      };
    });
  }

  async function handleUpdateCode(codeId: string) {
    const id = String(codeId).trim();
    if (!id) {
      setError("Invalid code id.");
      dispatchAdminToast("Invalid code id", "error");
      return;
    }
    const draft = codeEdits[id];
    if (!draft) {
      setError("No draft data for this row. Try refreshing codes.");
      dispatchAdminToast("Refresh codes and try again", "error");
      return;
    }
    const code = draft.code.trim();
    if (!code) {
      setError("Code cannot be empty.");
      dispatchAdminToast("Code cannot be empty", "error");
      return;
    }
    const description = draft.description.trim();
    const status = normalizeStatus(draft.status);

    setBusyCodeId(id);
    setError(null);
    setNotice(null);
    try {
      const supabase = await ensureAuthorized();
      if (!supabase) return;
      const { data, error: updateError } = await supabase
        .from("codes")
        .update({
          code,
          description,
          status,
        })
        .eq("id", id)
        .select("id");
      if (updateError) {
        setError(updateError.message);
        dispatchAdminToast(updateError.message, "error");
        return;
      }
      const updated = Array.isArray(data) ? data.length : 0;
      if (updated === 0) {
        const msg =
          "Update had no effect (0 rows). Check RLS policies and that this code id exists.";
        setError(msg);
        dispatchAdminToast(msg, "error");
        await loadCodes();
        return;
      }
      setNotice("Code updated.");
      dispatchAdminToast("Code saved", "success");
      await loadCodes();
    } catch (cause) {
      const msg = errorMessage(cause);
      setError(msg);
      dispatchAdminToast(msg, "error");
    } finally {
      setBusyCodeId(null);
    }
  }

  const codeCountLabel = useMemo(() => `${codes.length} codes`, [codes.length]);

  if (!isSupabaseBrowserConfigured()) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#05070c] px-4 py-16 sm:px-6">
        <p className="mx-auto max-w-3xl rounded-2xl border border-amber-500/35 bg-amber-950/30 p-6 text-sm text-amber-100">
          {SUPABASE_BROWSER_CONFIG_HELP}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#05070c] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300/90">
              Admin CMS
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Edit game
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Update game fields and manage all related codes from one page.
            </p>
          </div>
          <Link
            href="/admin/games"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
          >
            Back to games
          </Link>
        </header>

        {error ? (
          <p
            className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-xl border border-emerald-500/35 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-200">
            {notice}
          </p>
        ) : null}

        {checking || loading ? (
          <p className="text-sm text-zinc-400">Loading game...</p>
        ) : game ? (
          <>
            <section className="rounded-2xl border border-white/10 bg-[#0a0e16]/85 p-6 sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-white">Game details</h2>
                <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                  {codeCountLabel}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-blue-500/25 focus:border-blue-500/40 focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Players
                  </label>
                  <input
                    value={players}
                    onChange={(e) => setPlayers(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-blue-500/25 focus:border-blue-500/40 focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Place ID
                  </label>
                  <input
                    value={String(game.place_id ?? "")}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-blue-500/25 focus:border-blue-500/40 focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Image URL
                  </label>
                  <input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs text-white outline-none ring-blue-500/25 focus:border-blue-500/40 focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Banner URL
                  </label>
                  <input
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs text-white outline-none ring-blue-500/25 focus:border-blue-500/40 focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Slug (read-only)
                  </label>
                  <input
                    value={game.slug ?? ""}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-zinc-400"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => void handleSaveGame()}
                  disabled={savingGame}
                  className="rounded-xl border border-blue-500/40 bg-blue-600/25 px-5 py-2.5 text-sm font-bold text-blue-100 transition hover:bg-blue-600/35 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingGame ? "Saving..." : "Save game changes"}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#0a0e16]/85 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white">Add code</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Code"
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-emerald-500/25 focus:border-emerald-500/40 focus:ring-2"
                />
                <input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description"
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-emerald-500/25 focus:border-emerald-500/40 focus:ring-2 sm:col-span-2"
                />
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(normalizeStatus(e.target.value))}
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-emerald-500/25 focus:border-emerald-500/40 focus:ring-2"
                >
                  {VALID_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => void handleAddCode()}
                disabled={addingCode}
                className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-600/20 px-5 py-2.5 text-sm font-bold text-emerald-100 transition hover:bg-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addingCode ? "Adding..." : "Add code"}
              </button>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#0a0e16]/85 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white">Bulk add codes</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Format per line:{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
                  CODE | DESCRIPTION | STATUS
                </code>
              </p>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={8}
                placeholder={"SPRING2026 | Bonus coins | active\nOLD_EVENT | Legacy reward | expired"}
                className="mt-4 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs text-white outline-none ring-fuchsia-500/25 focus:border-fuchsia-500/40 focus:ring-2"
              />
              <button
                type="button"
                onClick={() => void handleBulkInsert()}
                disabled={bulkSaving}
                className="mt-4 rounded-xl border border-fuchsia-500/40 bg-fuchsia-600/20 px-5 py-2.5 text-sm font-bold text-fuchsia-100 transition hover:bg-fuchsia-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bulkSaving ? "Importing..." : "Bulk insert codes"}
              </button>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#0a0e16]/85 p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Code management</h2>
                <button
                  type="button"
                  onClick={() => void loadCodes()}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/10"
                >
                  Refresh codes
                </button>
              </div>

              {loadingCodes ? (
                <p className="text-sm text-zinc-400">Loading codes...</p>
              ) : (
                <div className="space-y-3">
                  {codes.map((code) => {
                    const codeId = String(code.id);
                    const edit =
                      codeEdits[codeId] ??
                      ({
                        code: code.code ?? "",
                        description: code.description ?? "",
                        status: normalizeStatus(code.status ?? "active"),
                      } satisfies CodeEdit);
                    return (
                      <CodeEditorRow
                        key={codeId}
                        codeId={codeId}
                        edit={edit}
                        busy={busyCodeId === codeId}
                        onFieldChange={updateCodeEditField}
                        onSave={() => void handleUpdateCode(codeId)}
                        onDelete={() => void handleDeleteCode(codeId)}
                      />
                    );
                  })}
                  {codes.length === 0 ? (
                    <p className="text-sm text-zinc-500">No codes for this game yet.</p>
                  ) : null}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CodeStatus }) {
  const isExpired = status === "expired";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ring-1 ${
        isExpired
          ? "bg-red-500/15 text-red-200 ring-red-500/35"
          : "bg-emerald-500/15 text-emerald-200 ring-emerald-500/35"
      }`}
    >
      {isExpired ? "EXPIRED" : "ACTIVE"}
    </span>
  );
}

function CodeEditorRow({
  codeId,
  edit,
  busy,
  onFieldChange,
  onSave,
  onDelete,
}: {
  codeId: string;
  edit: CodeEdit;
  busy: boolean;
  onFieldChange: (id: string, field: keyof CodeEdit, value: string) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20 hover:bg-black/35">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] text-zinc-500">
          id: <span className="text-zinc-400">{codeId}</span>
        </p>
        <StatusBadge status={edit.status} />
      </div>
      <div className="grid gap-3 sm:grid-cols-5">
        <input
          value={edit.code}
          onChange={(e) => onFieldChange(codeId, "code", e.target.value)}
          aria-label="Code"
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-blue-500/25 focus:border-blue-500/40 focus:ring-2"
        />
        <input
          value={edit.description}
          onChange={(e) =>
            onFieldChange(codeId, "description", e.target.value)
          }
          aria-label="Description"
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-blue-500/25 focus:border-blue-500/40 focus:ring-2 sm:col-span-2"
        />
        <select
          value={edit.status}
          onChange={(e) => onFieldChange(codeId, "status", e.target.value)}
          aria-label="Status"
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-blue-500/25 focus:border-blue-500/40 focus:ring-2"
        >
          {VALID_STATUSES.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onSave}
            className="flex-1 rounded-lg border border-blue-500/40 bg-blue-600/20 px-3 py-2 text-xs font-bold text-blue-100 transition hover:bg-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="flex-1 rounded-lg border border-red-500/35 bg-red-600/20 px-3 py-2 text-xs font-bold text-red-100 transition hover:bg-red-600/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
