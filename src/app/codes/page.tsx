import type { Metadata } from "next";
import { GameBrowse } from "@/components/game-browse";
import { JsonLd } from "@/components/json-ld";
import { games as staticGames } from "@/data/games";
import { getGames, isSupabaseCatalogOnly } from "@/lib/api";
import { toGameListItem } from "@/lib/games";
import { enrichGameListItemsWithPlaceIcons } from "@/lib/roblox-place-gameicons";
import { getSiteUrl, siteName } from "@/lib/site";
import type { GameListItem } from "@/types/game-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Codes",
  description:
    "Search every supported Roblox game and open dedicated code pages with copy buttons.",
  alternates: { canonical: "/codes" },
};

export default async function CodesPage() {
  const { data: dbGamesRaw } = await getGames();
  const dbGames = Array.isArray(dbGamesRaw) ? dbGamesRaw : [];
  const onlySupabase = isSupabaseCatalogOnly();
  const fromStaticRaw: GameListItem[] = onlySupabase
    ? []
    : staticGames
        .filter((g) => !dbGames.some((d) => d.slug === g.slug))
        .map((g) => toGameListItem(g));
  const fromStatic = await enrichGameListItemsWithPlaceIcons(fromStaticRaw);
  const merged: GameListItem[] = [...dbGames, ...fromStatic];

  const base = getSiteUrl();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${base}/codes#webpage`,
        url: `${base}/codes`,
        name: `All game codes | ${siteName}`,
        description:
          "Directory of Roblox games with redeem codes, search, and links to individual code pages.",
        isPartOf: { "@id": `${base}/#website` },
        inLanguage: "en-US",
      },
      {
        "@type": "ItemList",
        name: "Roblox games with code pages",
        numberOfItems: merged.length,
        itemListElement: merged.map((game, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: game.title,
          url: `${base}/codes/${game.slug}`,
          description: `${game.codeCount} codes for ${game.title}.`,
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <main className="flex flex-1 flex-col">
        <header className="relative overflow-hidden border-b border-white/10 px-4 py-12 sm:px-6 sm:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 80% at 0% 0%, rgba(239,68,68,0.2), transparent), radial-gradient(ellipse 60% 70% at 100% 0%, rgba(59,130,246,0.18), transparent)",
            }}
          />
          <div className="relative mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300/90">
              Library
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              <span className="bg-gradient-to-r from-red-400 via-white to-blue-400 bg-clip-text text-transparent">
                All Roblox game codes
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Filter by name, then open any card for banners, play links, and
              redeem-ready copy buttons.
            </p>
          </div>
        </header>
        {merged.length === 0 ? (
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
            <p
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-sm text-zinc-400"
              role="status"
            >
              No games.
            </p>
          </div>
        ) : (
          <GameBrowse
            games={merged}
            sectionId="games"
            title="Every game"
            description="Search the full catalog. Each card routes to its own code page."
            searchInputId="codes-game-search"
          />
        )}
      </main>
    </>
  );
}
