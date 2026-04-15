import type { Metadata } from "next";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Detailed terms of service for RobloxCodesHQ covering acceptable use, limitations, ads, analytics, and user responsibilities.",
  alternates: { canonical: "/terms-of-service" },
  openGraph: {
    title: `Terms of Service | ${siteName}`,
    description: "Rules and conditions for using RobloxCodes 2026.",
    type: "website",
    url: "/terms-of-service",
  },
};

export default function TermsPage() {
  const brandName = "RobloxCodesHQ";
  const contactEmail = "legal@robloxcodeshq.example";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-zinc-500">Last updated: 2026-04-15</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-white">Agreement and scope</h2>
            <p className="mt-2">
              These Terms of Service govern your use of {brandName}. By
              accessing or using our website, you agree to these terms. If you do
              not agree, please stop using the site.
            </p>
            <p className="mt-2">
              {brandName} provides Roblox-related informational content,
              including game code listings, redemption guides, and editorial tips.
              We are not affiliated with Roblox Corporation, and trademarks remain
              the property of their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Acceptable use</h2>
            <p className="mt-2">
              You agree to use this site lawfully, respectfully, and in a way
              that does not harm service availability for others. You must not
              attempt to exploit, reverse engineer, scrape in abusive volumes,
              disrupt, or interfere with our infrastructure, analytics systems, or
              ad delivery.
            </p>
            <p className="mt-2">
              You may not use automated tools to generate excessive traffic,
              harvest data for spam, or bypass access controls. You also agree not
              to post malicious code, impersonate others, or submit false reports
              intended to mislead our editorial team.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Content accuracy and updates</h2>
            <p className="mt-2">
              We work to keep content accurate and timely, but Roblox game codes,
              rewards, and redemption methods can change without notice. A code
              may expire between the time we verify it and the time you try it.
            </p>
            <p className="mt-2">
              Content on {brandName} is provided for general informational use and
              should not be treated as a guaranteed or permanent offer. You are
              responsible for verifying details directly in-game.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Advertising, Google AdSense, and cookies
            </h2>
            <p className="mt-2">
              To support operations, {brandName} may display advertisements from
              third-party partners, including Google AdSense. Ad partners may use
              cookies or similar technologies to serve and measure ads and, where
              allowed, personalize ad experiences.
            </p>
            <p className="mt-2">
              By using this site, you acknowledge that third-party advertising
              technologies may be active. You can manage cookies through browser
              settings, though some site and ad features may function differently
              if cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Analytics and service health</h2>
            <p className="mt-2">
              We use analytics and performance tracking to keep {brandName} fast,
              stable, and useful. This includes measuring page performance,
              engagement trends, and technical errors. These systems help us
              prioritize fixes, improve editorial coverage, and maintain a better
              user experience.
            </p>
            <p className="mt-2">
              Use of analytics does not mean we guarantee uninterrupted service.
              Planned maintenance, third-party outages, and unexpected technical
              issues may affect access from time to time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Data retention and rights</h2>
            <p className="mt-2">
              Operational logs, analytics summaries, and support communications
              may be retained for limited periods to maintain security, prevent
              abuse, and improve service quality. Retention periods vary by data
              type and legal requirements.
            </p>
            <p className="mt-2">
              Depending on your location, you may have rights to request access,
              correction, deletion, or objection regarding personal data processed
              through the site. For privacy requests, contact{" "}
              <span className="font-semibold text-blue-200">{contactEmail}</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Intellectual property</h2>
            <p className="mt-2">
              The {brandName} brand, site design, and original written content
              are protected by applicable intellectual property laws. You may not
              copy, republish, or commercially redistribute substantial portions
              of our original content without permission.
            </p>
            <p className="mt-2">
              References to Roblox games, logos, and trademarks are for
              informational purposes and remain the property of their respective
              owners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Limitations of liability</h2>
            <p className="mt-2">
              {brandName} is provided on an &quot;as is&quot; and &quot;as
              available&quot; basis. We do not guarantee uninterrupted access,
              complete accuracy, or that all listed codes will remain active at
              the time of use.
            </p>
            <p className="mt-2">
              To the maximum extent permitted by law, we are not liable for
              indirect, incidental, or consequential losses arising from site use,
              reliance on content, third-party links, or ad interactions. Your use
              of the site is at your own discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Changes to these terms</h2>
            <p className="mt-2">
              We may revise these Terms of Service when our site features,
              business operations, or legal requirements change. Updates are
              effective when posted on this page with a new &quot;Last
              updated&quot; date.
            </p>
            <p className="mt-2">
              Continued use of {brandName} after updates means you accept the
              revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Contact</h2>
            <p className="mt-2">
              Questions about these terms, acceptable use, or legal notices can
              be sent to:
            </p>
            <p className="mt-2 rounded-xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 font-semibold text-blue-100">
              {brandName} Legal Team · {contactEmail}
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
