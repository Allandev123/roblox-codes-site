import { cache } from "react";
import { ROBLOX_DEFAULT_GAME_ICON } from "@/lib/roblox-image-defaults";

type UniverseResponse = {
  universeId?: number;
};

type MultigetThumbnailsResponse = {
  data?: Array<{
    thumbnails?: Array<{
      imageUrl?: string;
      state?: string;
    }>;
  }>;
};

type LegacyThumbnailsResponse = {
  data?: Array<{
    thumbnails?: Array<{
      imageUrl?: string;
      state?: string;
    }>;
  }>;
};

function pickFirstThumbUrl(
  json: MultigetThumbnailsResponse | LegacyThumbnailsResponse,
): string | null {
  const entry = json.data?.[0];
  const thumb = entry?.thumbnails?.[0];
  const url = thumb?.imageUrl;
  if (
    typeof url === "string" &&
    url.length > 0 &&
    url.startsWith("https://") &&
    (!thumb?.state || thumb.state === "Completed")
  ) {
    return url;
  }
  return null;
}

async function fetchUniverseId(placeId: number): Promise<number | null> {
  const res = await fetch(
    `https://apis.roblox.com/universes/v1/places/${placeId}/universe`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as UniverseResponse;
  const id = json.universeId;
  if (typeof id !== "number" || !Number.isFinite(id) || id <= 0) return null;
  return id;
}

async function fetchWideFromMultiget(
  universeId: number,
): Promise<string | null> {
  const params = new URLSearchParams({
    universeIds: String(universeId),
    size: "768x432",
    format: "Png",
  });
  const res = await fetch(
    `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?${params.toString()}`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as MultigetThumbnailsResponse;
  return pickFirstThumbUrl(json);
}

async function fetchWideFromLegacyThumbnails(
  universeId: number,
): Promise<string | null> {
  const params = new URLSearchParams({
    universeIds: String(universeId),
    size: "768x432",
    format: "Webp",
    type: "GameThumbnail",
  });
  const res = await fetch(
    `https://thumbnails.roblox.com/v1/games/thumbnails?${params.toString()}`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as LegacyThumbnailsResponse;
  return pickFirstThumbUrl(json);
}

/**
 * Wide game hero image (768×432) from Roblox: universe from place_id, then multiget thumbnails.
 */
export async function fetchRobloxHeroBannerUrl(
  placeId: number,
): Promise<string> {
  if (!Number.isFinite(placeId) || placeId <= 0) {
    return ROBLOX_DEFAULT_GAME_ICON;
  }
  try {
    const universeId = await fetchUniverseId(placeId);
    if (universeId == null) return ROBLOX_DEFAULT_GAME_ICON;

    const fromMultiget = await fetchWideFromMultiget(universeId);
    if (fromMultiget) return fromMultiget;

    const fromLegacy = await fetchWideFromLegacyThumbnails(universeId);
    if (fromLegacy) return fromLegacy;

    return ROBLOX_DEFAULT_GAME_ICON;
  } catch {
    return ROBLOX_DEFAULT_GAME_ICON;
  }
}

/** Dedupes Roblox fetches between `generateMetadata` and the page render. */
export const getHeroBannerUrlForPlaceId = cache(
  async (placeId: number): Promise<string> => {
    return fetchRobloxHeroBannerUrl(placeId);
  },
);
