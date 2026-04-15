import type { MetadataRoute } from "next";
import { guides } from "@/data/guides";
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
    {
      url: `${base}/guides`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${base}/privacy-policy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${base}/terms-of-service`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${base}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    ...guides.map((guide) => ({
      url: `${base}/guides/${guide.slug}`,
      lastModified: new Date(guide.updatedIso),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...getGames().map((game) => ({
      url: `${base}/codes/${game.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
