/** Matches Supabase `codes.status` (admin CMS uses lowercase). */
export type CodeRowStatus = "active" | "expired";

export function normalizeCodeStatus(value: unknown): CodeRowStatus {
  if (typeof value !== "string") return "active";
  const v = value.trim().toLowerCase();
  if (v === "expired" || v === "inactive" || v === "disabled") {
    return "expired";
  }
  return "active";
}

export function isCodeExpired(status: CodeRowStatus): boolean {
  return status === "expired";
}
