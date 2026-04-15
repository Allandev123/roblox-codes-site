import type { MetadataRoute } from "next";
import { getGames } from "@/lib/games";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: base,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/codes`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.95,
    },
    ...getGames().map((game) => ({
      url: `${base}/codes/${game.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
