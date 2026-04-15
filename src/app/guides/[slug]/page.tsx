import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { getGuideBySlug, guides } from "@/data/guides";
import { getSiteUrl, siteName } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide not found" };

  return {
    title: guide.seoTitle,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: `${guide.seoTitle} | ${siteName}`,
      description: guide.metaDescription,
      type: "article",
      url: `/guides/${guide.slug}`,
      publishedTime: guide.updatedIso,
      modifiedTime: guide.updatedIso,
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.seoTitle} | ${siteName}`,
      description: guide.metaDescription,
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const base = getSiteUrl();
  const pageUrl = `${base}/guides/${guide.slug}`;

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.seoTitle,
          dateModified: guide.updatedIso,
          datePublished: guide.updatedIso,
          description: guide.metaDescription,
          author: { "@type": "Organization", name: siteName },
          publisher: { "@type": "Organization", name: siteName },
          mainEntityOfPage: pageUrl,
          inLanguage: "en-US",
        }}
      />

      <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300/90">
            Roblox guide
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
            {guide.intro}
          </p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Last updated: {guide.updatedIso}
          </p>
        </header>

        <div className="mt-8 space-y-10">
          {guide.sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-2xl border border-white/10 bg-[#0a101b] p-6 sm:p-8"
            >
              <h2 className="text-2xl font-black tracking-tight text-white">
                {section.heading}
              </h2>

              {(section.content ?? []).map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base"
                >
                  {paragraph}
                </p>
              ))}

              {section.subSections?.map((sub) => (
                <div key={sub.heading} className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                  <h3 className="text-lg font-extrabold text-blue-100">
                    {sub.heading}
                  </h3>
                  {sub.content.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
