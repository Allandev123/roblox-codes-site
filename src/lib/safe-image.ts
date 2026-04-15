const DEFAULT_THUMB = "https://tr.rbxcdn.com/default-thumbnail.png";

function isDisallowedImageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "via.placeholder.com" || host.endsWith(".via.placeholder.com");
  } catch {
    return true;
  }
}

/**
 * Missing, non-https, or known placeholder URLs fall back to Roblox default.
 */
export function safeImage(url?: string | null): string {
  const s = typeof url === "string" ? url.trim() : "";
  if (!s || !s.startsWith("https://") || isDisallowedImageUrl(s)) {
    return DEFAULT_THUMB;
  }
  return s;
}
