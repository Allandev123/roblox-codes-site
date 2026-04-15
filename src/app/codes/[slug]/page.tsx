import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameCodeCard } from "@/components/game-code-card";
import { JsonLd } from "@/components/json-ld";
import { PlayOnRobloxButton } from "@/components/play-on-roblox-button";
import { getGameWithCodesBySlug } from "@/lib/api";
import { getAllSlugs } from "@/lib/games";
import {
  getGameAboutParagraphs,
  getGameCodesFaq,
  getGameCodesIntroParagraphs,
  formatGameCodesLastUpdated,
} from "@/lib/game-codes-page-copy";
import { getHeroBannerUrlForPlaceId } from "@/lib/roblox-wide-banner";
import { safeImage } from "@/lib/safe-image";
import { getSiteUrl, siteName } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameWithCodesBySlug(slug);
  if (!game) {
    return { title: "Game not found" };
  }
  const allCodes = game.codes ?? [];
  const activeCount = allCodes.filter((c) => c.status !== "expired").length;
  const expiredCount = allCodes.filter((c) => c.status === "expired").length;
  const title = `${game.title} Codes (2026)`;
  const description = `Working ${game.title} Roblox codes for 2026. ${activeCount} active${expiredCount > 0 ? `, ${expiredCount} archived (expired)` : ""} — play link and instant copy. Confirm in-game before redeeming.`;
  const ogImage =
    game.robloxPlaceId > 0
      ? await getHeroBannerUrlForPlaceId(game.robloxPlaceId)
      : safeImage(
          game.bannerImage?.trim() ||
            game.cardImage?.trim() ||
            undefined,
        );

  return {
    title,
    description,
    alternates: {
      canonical: `/codes/${game.slug}`,
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1600,
          height: 900,
          alt: `${game.title} banner`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function GameCodesPage({ params }: PageProps) {
  const { slug } = await params;
  const game = await getGameWithCodesBySlug(slug);
  if (!game) notFound();

  const base = getSiteUrl();
  const pageUrl = `${base}/codes/${game.slug}`;
  const allCodes = game.codes ?? [];
  const activeCodes = allCodes.filter((c) => c.status !== "expired");
  const expiredCodes = allCodes.filter((c) => c.status === "expired");
  const activeCount = activeCodes.length;
  const expiredCount = expiredCodes.length;
  const count = allCodes.length;
  const heroUrl =
    game.robloxPlaceId > 0
      ? await getHeroBannerUrlForPlaceId(game.robloxPlaceId)
      : safeImage(
          game.bannerImage?.trim() ||
            game.cardImage?.trim() ||
            undefined,
        );
  const cardRaw =
    game.cardImage?.trim() ||
    game.bannerImage?.trim() ||
    heroUrl;
  const schemaImage = heroUrl;
  const dateModified =
    game.lastUpdatedIso?.trim() ||
    new Date().toISOString().slice(0, 10);
  const introParagraphs = getGameCodesIntroParagraphs(game.title);
  const aboutParagraphs = getGameAboutParagraphs(game.title, game.description);
  const faqItems = getGameCodesFaq(game.title);
  const lastUpdatedLabel = formatGameCodesLastUpdated(dateModified);

  const redeemSteps = [
    `Open ${game.title} in Roblox and wait until your profile has loaded.`,
    "Find the in-game Codes, Gift, Shop, or Settings icon.",
    "Copy a code from this page and paste it exactly as shown.",
    "Press Redeem and confirm your items in inventory, currency, or boosts.",
  ];
  const tips = [
    "Redeem new codes immediately after updates, since many expire quickly.",
    "Avoid unofficial generators; valid codes are always redeemed in-game for free.",
    "Stack boosts from codes during long farming sessions for better value.",
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: base,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Codes",
            item: `${base}/codes`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: game.title,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${game.title} Codes (2026)`,
        description:
          introParagraphs[0] ??
          game.description ??
          `Working ${game.title} Roblox codes and redemption help.`,
        isPartOf: { "@id": `${base}/#website` },
        breadcrumb: { "@id": `${pageUrl}/#breadcrumb` },
        inLanguage: "en-US",
        dateModified,
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}/#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "VideoGame",
        name: game.title,
        description: game.description ?? "",
        url: pageUrl,
        image: schemaImage,
        dateModified,
        gamePlatform: ["Roblox", "https://www.roblox.com/"],
        applicationCategory: "GameApplication",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <article className="relative flex flex-1 flex-col">
        <div className="relative isolate h-[min(52vh,420px)] w-full min-h-[240px] overflow-hidden sm:h-[min(48vh,480px)] md:min-h-[320px]">
          <div
            aria-hidden
            className="absolute inset-0 scale-[1.12] bg-cover bg-center bg-no-repeat [transform:translateZ(0)]"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.9)), url(${JSON.stringify(heroUrl)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px)",
            }}
          />
          <div className="absolute inset-0 bg-black/60" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/50"
            aria-hidden
          />
        </div>

        <div className="animate-section-in relative z-10 -mt-16 px-4 sm:-mt-24 sm:px-6">
          <div className="relative mx-auto max-w-6xl">
            <div
              className="pointer-events-none absolute left-1/2 top-[42%] h-[min(520px,70vh)] w-[min(920px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.28)_0%,rgba(244,114,182,0.14)_38%,rgba(59,130,246,0.16)_58%,transparent_72%)] blur-3xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080c14]/95 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-xl ring-1 ring-white/[0.06] transition-[box-shadow,border-color] duration-[400ms] ease-out hover:border-white/15 hover:shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85),0_0_48px_-12px_rgba(239,68,68,0.18),0_0_40px_-8px_rgba(59,130,246,0.12)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

              <div className="grid gap-8 p-6 md:grid-cols-[220px_1fr] md:gap-10 md:p-10">
                <div className="mx-auto w-full max-w-[220px] md:mx-0 md:max-w-none">
                  <div className="group/card relative aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_0_0_2px_rgba(239,68,68,0.35),0_0_48px_-8px_rgba(239,68,68,0.35),0_20px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                    <Image
                      src={safeImage(cardRaw)}
                      alt={`${game.title} cover art`}
                      fill
                      className="object-cover transition-transform duration-[400ms] ease-out will-change-transform group-hover/card:scale-110"
                      sizes="(max-width: 768px) 220px, 220px"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-[400ms] group-hover/card:opacity-90"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 transition-opacity duration-[400ms] ease-out group-hover/card:opacity-100"
                      aria-hidden
                    />
                  </div>
                </div>

                <div className="flex min-w-0 flex-col justify-center gap-5">
                  <nav aria-label="Breadcrumb">
                    <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
                      <li>
                        <Link
                          href="/"
                          className="transition hover:text-white hover:underline"
                        >
                          Home
                        </Link>
                      </li>
                      <li className="text-zinc-600" aria-hidden>
                        /
                      </li>
                      <li>
                        <Link
                          href="/codes"
                          className="transition hover:text-white hover:underline"
                        >
                          Codes
                        </Link>
                      </li>
                      <li className="text-zinc-600" aria-hidden>
                        /
                      </li>
                      <li className="truncate text-zinc-200">{game.title}</li>
                    </ol>
                  </nav>

                  <div>
                    <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                      <span className="bg-gradient-to-r from-red-300 via-white to-blue-300 bg-clip-text text-transparent">
                        {game.title}
                      </span>{" "}
                      <span className="text-zinc-300">Codes</span>
                    </h1>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center rounded-lg bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-200 ring-1 ring-emerald-500/30">
                        {activeCount} active
                      </span>
                      {expiredCount > 0 ? (
                        <span className="inline-flex items-center rounded-lg bg-red-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-200 ring-1 ring-red-500/30">
                          {expiredCount} expired
                        </span>
                      ) : null}
                      <span className="inline-flex items-center rounded-lg bg-zinc-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-400 ring-1 ring-white/10">
                        {count} total
                      </span>
                      <span className="inline-flex items-center rounded-lg bg-blue-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-200 ring-1 ring-blue-500/30">
                        {game.playingLabel} playing
                      </span>
                    </div>
                  </div>

                  {game.description?.trim() ? (
                    <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                      {game.description}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <PlayOnRobloxButton game={game} size="lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-section-in animate-section-in-delay-1 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
          <section
            aria-label={`Introduction to ${game.title} codes`}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-inner shadow-black/20 sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Last updated: {lastUpdatedLabel} (checked daily)
            </p>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
              {introParagraphs.map((p, i) => (
                <p key={`intro-${game.slug}-${i}`}>{p}</p>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="codes-heading"
            className="relative"
          >
            <div className="pointer-events-none absolute -left-4 top-0 h-24 w-32 rounded-full bg-red-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-4 top-24 h-28 w-40 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative mb-10 flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="codes-heading"
                  className="text-2xl font-black tracking-tight text-white sm:text-4xl"
                >
                  <span className="bg-gradient-to-r from-red-400 via-orange-200 to-blue-400 bg-clip-text text-transparent">
                    Active codes
                  </span>
                </h2>
                <p className="mt-2 max-w-xl text-sm text-zinc-400">
                  Copy a code, open Roblox, then paste in the game&apos;s redeem
                  window. Cards glow on hover like a live ops dashboard.
                </p>
              </div>
              <p className="shrink-0 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Secure context required for clipboard
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {activeCodes.length === 0 ? (
                <p className="col-span-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-8 text-center text-sm text-zinc-400">
                  No active codes right now. Check archived entries below or
                  come back after an update.
                </p>
              ) : (
                activeCodes.map((row, index) => (
                  <GameCodeCard
                    key={row.id ?? `${row.code}-${index}`}
                    code={row.code}
                    description={row.description}
                    status={row.status}
                    index={index}
                  />
                ))
              )}
            </div>

            {expiredCodes.length > 0 ? (
              <details className="group mt-10 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-zinc-200 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>
                    Expired codes{" "}
                    <span className="font-mono text-zinc-500">
                      ({expiredCodes.length})
                    </span>
                  </span>
                  <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-200 ring-1 ring-red-500/35">
                    Archived
                  </span>
                </summary>
                <p className="mt-2 text-xs text-zinc-500">
                  These are kept for reference only — they will not redeem in
                  game.
                </p>
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  {expiredCodes.map((row, index) => (
                    <GameCodeCard
                      key={row.id ?? `exp-${row.code}-${index}`}
                      code={row.code}
                      description={row.description}
                      status={row.status}
                      index={index}
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </section>

          <section
            aria-labelledby="about-heading"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
          >
            <h2
              id="about-heading"
              className="text-2xl font-black tracking-tight text-white sm:text-3xl"
            >
              About {game.title}
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
              {aboutParagraphs.map((p, i) => (
                <p key={`about-${game.slug}-${i}`}>{p}</p>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="faq-heading"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
          >
            <h2
              id="faq-heading"
              className="text-2xl font-black tracking-tight text-white sm:text-3xl"
            >
              Frequently Asked Questions
            </h2>
            <dl className="mt-6 space-y-6">
              {faqItems.map((item) => (
                <div
                  key={item.question}
                  className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0"
                >
                  <dt className="text-base font-bold text-white">
                    {item.question}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-zinc-300 sm:text-base">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            aria-labelledby="more-codes-heading"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
          >
            <h2
              id="more-codes-heading"
              className="text-2xl font-black tracking-tight text-white sm:text-3xl"
            >
              How to get more {game.title} codes
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
              <p>
                <strong className="text-zinc-200">Follow the developers.</strong>{" "}
                Watch the studio&apos;s official Roblox group, X (Twitter),
                YouTube, or TikTok—creators usually announce codes alongside
                trailers and patch notes. Turn on notifications for posts so you
                do not miss a limited drop.
              </p>
              <p>
                <strong className="text-zinc-200">Join Discord.</strong> When the
                team runs an official Discord server, join it for patch
                announcements, bug-report channels, and sometimes code
                giveaways. Stick to linked servers from the game page so you stay
                safe from impersonators.
              </p>
              <p>
                <strong className="text-zinc-200">Bookmark this page.</strong> We
                refresh this list when new codes appear or old ones expire, so
                keeping this tab saved is the fastest way to copy working strings
                without digging through feeds.
              </p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <h2 className="text-xl font-black text-white">
                How to redeem codes
              </h2>
              <ol className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-300">
                {redeemSteps.map((step) => (
                  <li key={step} className="flex gap-2">
                    <span className="mt-[0.15rem] text-red-300">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <h2 className="text-xl font-black text-white">Tips &amp; tricks</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-300">
                {tips.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="mt-[0.15rem] text-blue-300">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <footer className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-white/[0.01] px-5 py-6 text-center text-sm text-zinc-400 shadow-inner shadow-black/20 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Last updated: {lastUpdatedLabel} (checked daily)
            </p>
            <p className="mt-3">
              Looking for more Roblox codes?{" "}
              <Link
                href="/codes"
                className="font-bold text-blue-300 underline-offset-2 transition hover:text-blue-200 hover:underline"
              >
                Browse all games
              </Link>{" "}
              → <span className="font-mono text-zinc-500">/codes</span>
            </p>
          </footer>
        </div>
      </article>
    </>
  );
}
