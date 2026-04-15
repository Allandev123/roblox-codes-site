import { games, type Game } from "@/data/games";
import type { GameListItem } from "@/types/game-list";

export function getGames(): Game[] {
  return games;
}

export function toGameListItem(game: Game): GameListItem {
  const icon = game.cardImage;
  return {
    slug: game.slug,
    title: game.title,
    description: game.description?.trim() || null,
    image: icon,
    cardImage: icon,
    playingLabel: game.playingLabel,
    codeCount: game.codes.length,
    placeId: game.robloxPlaceId,
  };
}

export function getGameBySlug(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}

export function getAllSlugs(): string[] {
  return games.map((g) => g.slug);
}

export function getRobloxGameUrl(game: Pick<Game, "robloxPlaceId" | "title">): string {
  const path =
    game.title
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "game";
  return `https://www.roblox.com/games/${game.robloxPlaceId}/${path}`;
}

export function getCodeCount(game: Game): number {
  return game.codes.length;
}

