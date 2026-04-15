import { HomeHero } from "@/components/home-hero";
import { HomeSeoSection } from "@/components/home-seo-section";
import { JsonLd } from "@/components/json-ld";
import { HomeTabs } from "@/components/home-tabs";
import { TrendingGames } from "@/components/trending-games";
import { getGames, getLatestCodesForHome } from "@/lib/api";
import { isSupabasePublicEnvMissing } from "@/lib/env/supabase-public";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";
import type { PostgrestError } from "@supabase/supabase-js";
import type { LatestCodeHome } from "@/types/latest-code-home";
import type { GameListItem } from "@/types/game-list";

export const dynamic = "force-dynamic";

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
        <TrendingGames
          games={games}
          fetchError={fetchErrorMessage}
          showSupabaseEnvHint={showSupabaseEnvHint}
        />
        <HomeTabs latestCodes={latestCodes} />
        <HomeSeoSection />
      </div>
    </>
  );
}
