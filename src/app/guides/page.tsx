import Link from "next/link";
import type { Metadata } from "next";
import { guides } from "@/data/guides";
import { getSiteUrl, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Roblox strategy guides, code redemption tutorials, and practical tips for popular games.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: `Roblox Guides | ${siteName}`,
    description:
      "Roblox strategy guides and redemption tutorials with practical, player-focused advice.",
    url: "/guides",
    type: "website",
  },
};

export default function GuidesPage() {
  const base = getSiteUrl();
  const pageUrl = `${base}/guides`;

  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-white/10 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300/90">
            Content hub
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
            <span className="bg-gradient-to-r from-red-400 via-white to-blue-400 bg-clip-text text-transparent">
              Roblox guides
            </span>
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Actionable guides with real context: how redemption systems work,
            game-specific strategy tips, and common mistakes to avoid.
          </p>
        </div>
      </header>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <ul className="grid gap-6 md:grid-cols-2">
            {guides.map((guide, index) => (
              <li
                key={guide.slug}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index * 70, 280)}ms` }}
              >
                <Link
                  href={`/guides/${guide.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-red-400/40 hover:shadow-[0_0_32px_rgba(239,68,68,0.2)]"
                >
                  <h2 className="text-2xl font-black leading-snug text-white transition group-hover:text-red-100">
                    {guide.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {guide.intro}
                  </p>
                  <span className="mt-5 text-sm font-bold text-blue-300 transition group-hover:text-blue-200">
                    Read full guide →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Roblox Guides",
            url: pageUrl,
            description:
              "Roblox strategy and code redemption guides for popular games.",
            hasPart: guides.map((guide) => ({
              "@type": "Article",
              headline: guide.title,
              url: `${base}/guides/${guide.slug}`,
              dateModified: guide.updatedIso,
            })),
          }),
        }}
      />
    </main>
  );
}
