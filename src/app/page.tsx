import { HomeHero } from "@/components/home-hero";
import { HomeSeoSection } from "@/components/home-seo-section";
import { JsonLd } from "@/components/json-ld";
import { HomeTabs } from "@/components/home-tabs";
import { LatestGuides } from "@/components/latest-guides";
import { TrendingGames } from "@/components/trending-games";
import Link from "next/link";
import { getGames, getLatestCodesForHome } from "@/lib/api";
import { isSupabasePublicEnvMissing } from "@/lib/env/supabase-public";
import {
  getSiteUrl,
  siteDescription,
  siteName,
  withFaviconCacheBust,
} from "@/lib/site";
import type { Metadata } from "next";
import type { PostgrestError } from "@supabase/supabase-js";
import type { LatestCodeHome } from "@/types/latest-code-home";
import type { GameListItem } from "@/types/game-list";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Free Roblox Codes 2026 – Updated Daily (Working Codes)",
  description:
    "Get the latest working Roblox codes for 2026. Updated daily with new rewards, free items, and exclusive in-game bonuses across top Roblox games.",
  alternates: { canonical: "https://www.robloxcodeshq.com/" },
  openGraph: {
    title: "Free Roblox Codes 2026 – Updated Daily (Working Codes)",
    description:
      "Get the latest working Roblox codes for 2026. Updated daily with new rewards, free items, and exclusive in-game bonuses across top Roblox games.",
    type: "website",
    url: "https://www.robloxcodeshq.com/",
  },
};

const TRENDING_FOR_SCHEMA = 6;

function formatFetchError(error: PostgrestError | Error): string {
  return error.message;
}

export default async function Home() {
  let games: GameListItem[] = [];
  let fetchErrorMessage: string | null = null;

  let latestCodes: LatestCodeHome[] = [];

  try {
    const [result, codesResult] = await Promise.all([
      getGames(),
      getLatestCodesForHome(6),
    ]);
    games = result.data ?? [];
    latestCodes = codesResult;
    fetchErrorMessage = result.error ? formatFetchError(result.error) : null;
  } catch {
    games = [];
    fetchErrorMessage =
      "Games could not be loaded right now. Please try again later.";
  }

  const trending = games.slice(0, TRENDING_FOR_SCHEMA);
  const base = getSiteUrl();
  const showSupabaseEnvHint =
    isSupabasePublicEnvMissing() && process.env.NODE_ENV !== "production";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: siteName,
        description: siteDescription,
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        name: "RobloxCodesHQ",
        url: "https://www.robloxcodeshq.com",
        logo: `${base}${withFaviconCacheBust("/favicon.ico")}`,
      },
      ...(trending.length > 0
        ? [
            {
              "@type": "ItemList",
              name: "Trending Roblox games",
              numberOfItems: trending.length,
              itemListElement: trending.map((game, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: game.title,
                url: `${base}/codes/${game.slug}`,
                description: `${game.codeCount} codes listed for ${game.title}.`,
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="flex flex-1 flex-col">
        <HomeHero />
        <section className="px-4 pb-6 sm:px-6 sm:pb-8">
          <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-sm leading-relaxed text-zinc-300 sm:px-6 sm:text-base">
            <p>
              {siteName} is a content-first Roblox resource with current code
              lists, redemption help, and game-specific tips. We focus on useful
              context, clear update signals, and safe in-game redemption
              practices.
            </p>
          </div>
        </section>
        <section className="px-4 pb-6 sm:px-6 sm:pb-8">
          <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-gradient-to-r from-red-950/30 via-white/[0.03] to-blue-950/25 px-5 py-5 shadow-[0_0_28px_rgba(239,68,68,0.12)] backdrop-blur sm:px-6">
            <h2 className="text-xl font-black text-white sm:text-2xl">
              About AllanIsGreasy
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              I&apos;ve played Roblox since 2015 and spent 4+ years creating
              content on YouTube and stream platforms. RobloxCodesHQ is my answer
              to messy, outdated code sites: clean pages, fast updates, and
              trusted code tracking for games like Blox Fruits, Pet Simulator 99,
              and 99 Nights in the Forest.
            </p>
            <Link
              href="/about"
              className="mt-4 inline-flex rounded-xl border border-blue-400/35 bg-blue-600/20 px-4 py-2 text-sm font-bold text-blue-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600/30"
            >
              Learn more →
            </Link>
          </div>
        </section>
        <TrendingGames
          games={games}
          fetchError={fetchErrorMessage}
          showSupabaseEnvHint={showSupabaseEnvHint}
        />
        <LatestGuides />
        <HomeTabs latestCodes={latestCodes} />
        <HomeSeoSection />
      </div>
    </>
  );
}
