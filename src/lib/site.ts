export const siteName = "RobloxCodes 2026";

export const siteDescription =
  "Free Roblox codes, redemption help, and practical game guides for popular Roblox experiences.";

const DEFAULT_SITE = "http://localhost:3000";

/**
 * Canonical site URL for metadata / JSON-LD. Never throws (invalid env → default).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return DEFAULT_SITE;
  }
  try {
    const withProtocol =
      raw.startsWith("http://") || raw.startsWith("https://")
        ? raw
        : `https://${raw}`;
    const u = new URL(withProtocol);
    return `${u.protocol}//${u.host}`.replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE;
  }
}
