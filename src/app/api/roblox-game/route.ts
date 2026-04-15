import { NextRequest, NextResponse } from "next/server";
import type { RobloxGamePayload } from "@/lib/roblox-game-api";
import { ROBLOX_DEFAULT_GAME_ICON } from "@/lib/roblox-image-defaults";

export const dynamic = "force-dynamic";

type UniverseResponse = {
  universeId?: number;
};

type GameEntry = {
  name?: string;
  description?: string;
  playing?: number;
};

type GamesApiResponse = {
  data?: GameEntry[];
};

type IconsApiResponse = {
  data?: Array<{
    imageUrl?: string;
    state?: string;
  }>;
};

type GameThumbnailsApiResponse = {
  data?: Array<{
    thumbnails?: Array<{
      imageUrl?: string;
      state?: string;
    }>;
  }>;
};

function formatPlayers(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function pickIconUrl(json: IconsApiResponse): string | null {
  const entry = json.data?.[0];
  const url = entry?.imageUrl;
  if (
    typeof url === "string" &&
    url.length > 0 &&
    (!entry?.state || entry.state === "Completed")
  ) {
    return url;
  }
  return null;
}

function pickBannerUrl(json: GameThumbnailsApiResponse): string | null {
  const entry = json.data?.[0];
  const thumb = entry?.thumbnails?.[0];
  const url = thumb?.imageUrl;
  if (
    typeof url === "string" &&
    url.length > 0 &&
    (!thumb?.state || thumb.state === "Completed")
  ) {
    return url;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("placeId");
  const placeId = Number(raw);
  if (
    raw === null ||
    raw.trim() === "" ||
    !Number.isFinite(placeId) ||
    placeId <= 0 ||
    !Number.isInteger(placeId)
  ) {
    return NextResponse.json(
      { error: "Invalid or missing placeId query parameter." },
      { status: 400 },
    );
  }

  try {
    const universeRes = await fetch(
      `https://apis.roblox.com/universes/v1/places/${placeId}/universe`,
      { method: "GET" },
    );

    if (!universeRes.ok) {
      return NextResponse.json(
        { error: "Could not resolve universe for this place_id." },
        { status: 502 },
      );
    }

    const universeJson = (await universeRes.json()) as UniverseResponse;
    const universeId = universeJson.universeId;
    if (typeof universeId !== "number" || !Number.isFinite(universeId)) {
      return NextResponse.json(
        { error: "Roblox returned no universe id." },
        { status: 502 },
      );
    }

    const iconParams = new URLSearchParams({
      universeIds: String(universeId),
      size: "512x512",
      format: "Png",
      isCircular: "false",
    });

    const wideParams = new URLSearchParams({
      universeIds: String(universeId),
      size: "768x432",
      format: "Webp",
      type: "GameThumbnail",
    });

    const [gamesRes, iconsRes, wideRes] = await Promise.all([
      fetch(
        `https://games.roblox.com/v1/games?universeIds=${universeId}`,
        { method: "GET" },
      ),
      fetch(
        `https://thumbnails.roblox.com/v1/games/icons?${iconParams.toString()}`,
        { method: "GET" },
      ),
      fetch(
        `https://thumbnails.roblox.com/v1/games/thumbnails?${wideParams.toString()}`,
        { method: "GET" },
      ),
    ]);

    let title = "";
    let description = "";
    let players = "—";
    let image = "";
    let banner = "";

    if (gamesRes.ok) {
      const gamesJson = (await gamesRes.json()) as GamesApiResponse;
      const entry = gamesJson.data?.[0];
      if (typeof entry?.name === "string" && entry.name.trim().length > 0) {
        title = entry.name.trim();
      }
      description =
        typeof entry?.description === "string" ? entry.description.trim() : "";
      players = formatPlayers(entry?.playing);
    }

    if (iconsRes.ok) {
      const iconsJson = (await iconsRes.json()) as IconsApiResponse;
      const url = pickIconUrl(iconsJson);
      if (url) image = url;
    }

    if (wideRes.ok) {
      const wideJson = (await wideRes.json()) as GameThumbnailsApiResponse;
      const url = pickBannerUrl(wideJson);
      if (url) banner = url;
    }

    if (!image) {
      image = ROBLOX_DEFAULT_GAME_ICON;
    }
    if (!banner) {
      banner = image;
    }

    if (!title) {
      return NextResponse.json(
        { error: "Roblox returned no game details for this universe." },
        { status: 404 },
      );
    }

    const payload: RobloxGamePayload = {
      title,
      description,
      players,
      image,
      banner,
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Failed to load Roblox game data." },
      { status: 500 },
    );
  }
}
