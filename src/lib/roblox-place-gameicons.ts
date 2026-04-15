import type { Game } from "@/data/games";
import { ROBLOX_DEFAULT_GAME_ICON } from "@/lib/roblox-image-defaults";
import type { GameListItem } from "@/types/game-list";

type GameIconEntry = {
  targetId?: number;
  imageUrl?: string;
  state?: string;
};

type GameIconsResponse = {
  data?: GameIconEntry[];
};

const BATCH_SIZE = 100;

/**
 * Fetches Roblox place game icons in parallel (one HTTP request per batch of place IDs).
 */
export async function fetchPlaceGameIconUrls(
  placeIds: number[],
): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const unique = [
    ...new Set(
      placeIds.filter(
        (id) => typeof id === "number" && Number.isFinite(id) && id > 0,
      ),
    ),
  ];
  if (unique.length === 0) return map;

  const chunks: number[][] = [];
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    chunks.push(unique.slice(i, i + BATCH_SIZE));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      const params = new URLSearchParams({
        placeIds: chunk.join(","),
        size: "512x512",
        format: "Png",
      });
      const url = `https://thumbnails.roblox.com/v1/places/gameicons?${params.toString()}`;
      try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return;
        const json = (await res.json()) as GameIconsResponse;
        for (const entry of json.data ?? []) {
          const pid = entry.targetId;
          const imageUrl = entry.imageUrl;
          if (
            typeof pid === "number" &&
            Number.isFinite(pid) &&
            typeof imageUrl === "string" &&
            imageUrl.length > 0 &&
            (!entry.state || entry.state === "Completed")
          ) {
            map.set(pid, imageUrl);
          }
        }
      } catch {
        /* network / parse */
      }
    }),
  );

  return map;
}

function iconForPlaceId(
  placeId: number | null | undefined,
  iconMap: Map<number, string>,
): string {
  if (typeof placeId === "number" && placeId > 0) {
    const fromApi = iconMap.get(placeId);
    if (fromApi) return fromApi;
  }
  return ROBLOX_DEFAULT_GAME_ICON;
}

/**
 * Sets `image` / `cardImage` from Roblox place game icons (parallel batch fetch).
 */
export async function enrichGameListItemsWithPlaceIcons(
  items: GameListItem[],
): Promise<GameListItem[]> {
  if (items.length === 0) return items;
  const ids = items
    .map((g) => g.placeId)
    .filter((id): id is number => typeof id === "number" && id > 0);
  const iconMap = await fetchPlaceGameIconUrls(ids);
  return items.map((g) => {
    const url = iconForPlaceId(g.placeId, iconMap);
    return { ...g, image: url, cardImage: url };
  });
}

/**
 * Overrides `cardImage` / `bannerImage` with the place game icon when `robloxPlaceId` is set.
 */
export async function enrichGameWithPlaceIcons(game: Game): Promise<Game> {
  const pid = game.robloxPlaceId;
  if (typeof pid !== "number" || !Number.isFinite(pid) || pid <= 0) {
    return {
      ...game,
      cardImage: ROBLOX_DEFAULT_GAME_ICON,
      bannerImage: ROBLOX_DEFAULT_GAME_ICON,
    };
  }
  const iconMap = await fetchPlaceGameIconUrls([pid]);
  const card = iconForPlaceId(pid, iconMap);
  return { ...game, cardImage: card, bannerImage: card };
}
