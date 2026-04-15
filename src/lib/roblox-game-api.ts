/** JSON body for successful `GET /api/roblox-game?placeId=`. */
export type RobloxGamePayload = {
  title: string;
  description: string;
  players: string;
  /** Square game icon (`games/icons`). */
  image: string;
  /** Wide game thumbnail (`games/thumbnails`); falls back to `image`. */
  banner: string;
};

export type RobloxGameFetchResult =
  | { ok: true; data: RobloxGamePayload }
  | { ok: false; error: string };

/** Same-origin proxy; avoids calling Roblox from the browser (CORS). */
export function robloxGameApiUrl(placeId: number): string {
  return `/api/roblox-game?placeId=${encodeURIComponent(String(placeId))}`;
}

/**
 * `GET /api/roblox-game?placeId=…` — parses JSON and normalizes fields for forms / cards.
 */
export async function fetchRobloxGameByPlaceId(
  placeId: number,
): Promise<RobloxGameFetchResult> {
  let res: Response;
  try {
    res = await fetch(robloxGameApiUrl(placeId));
  } catch {
    return { ok: false, error: "Network error while loading game data." };
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return {
      ok: false,
      error: res.ok
        ? "Invalid response from server."
        : `Request failed (${res.status}).`,
    };
  }

  if (!res.ok) {
    const err =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Request failed (${res.status}).`;
    return { ok: false, error: err };
  }

  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as RobloxGamePayload).title !== "string" ||
    !(body as RobloxGamePayload).title.trim()
  ) {
    return { ok: false, error: "Could not load game data." };
  }

  const raw = body as RobloxGamePayload;
  const image = typeof raw.image === "string" ? raw.image.trim() : "";
  const banner =
    typeof raw.banner === "string" && raw.banner.trim().length > 0
      ? raw.banner.trim()
      : image;

  const data: RobloxGamePayload = {
    title: raw.title.trim(),
    description:
      typeof raw.description === "string" ? raw.description : "",
    players:
      typeof raw.players === "string" && raw.players.length > 0
        ? raw.players
        : "—",
    image,
    banner,
  };

  return { ok: true, data };
}
