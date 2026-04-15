import type { Metadata } from "next";
import { siteName } from "@/lib/site";

type DisclaimerSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const sections: DisclaimerSection[] = [
  {
    title: "General Disclaimer",
    paragraphs: [
      `${siteName} is an informational platform built to help players discover Roblox game codes, guides, and updates in one clean place.`,
      "All content is provided in good faith for general use. We work hard to keep pages useful and current, but we cannot guarantee that every item remains valid at all times.",
    ],
  },
  {
    title: "Code Validity and Accuracy",
    paragraphs: [
      "Codes can expire, be disabled, or change without notice by game developers. A code that worked earlier may stop working later, even on the same day.",
      "Our team and community signals help us improve update speed, but final validation always happens in the game itself.",
    ],
    bullets: [
      "Always redeem codes in official in-game input fields",
      "Check each game page for last updated context",
      "Treat older entries as informational unless confirmed active",
    ],
  },
  {
    title: "Third-Party Links and Services",
    paragraphs: [
      "Some pages include links to third-party websites and Roblox game pages. We do not control external websites, their policies, or their availability.",
      "When you leave this site, your activity is governed by the destination platform's own terms and privacy rules.",
    ],
  },
  {
    title: "Roblox Disclaimer (IMPORTANT)",
    paragraphs: [
      `${siteName} is independent and is not owned, operated, or endorsed by Roblox Corporation.`,
      "Roblox names, logos, game titles, and related marks are property of their respective owners and are used only for identification and informational purposes.",
    ],
    bullets: [
      "We do not sell Robux",
      "We do not provide account generation or exploit tools",
      "We never ask for Roblox account passwords",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "By using this website, you agree that use is at your own discretion. We are not responsible for losses or issues caused by expired codes, third-party actions, or temporary outages.",
      "To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages related to use of this site.",
    ],
  },
  {
    title: "User Content",
    paragraphs: [
      "If you submit feedback, suggestions, or corrections, you confirm that your submission does not violate any rights or contain harmful material.",
      "We may review and use submitted information to improve site quality, moderation, and content coverage.",
    ],
  },
  {
    title: "Security and Data",
    paragraphs: [
      "We take reasonable security measures, but no internet service can be guaranteed to be risk-free. Users should practice normal web safety habits and avoid sharing sensitive account details.",
      "Please report suspicious behavior or misleading content through our contact channel so we can review quickly.",
    ],
  },
  {
    title: "Advertising Disclaimer",
    paragraphs: [
      "This website may display third-party advertisements, including Google AdSense. Ads can use cookies and related technologies to support ad delivery and measurement.",
      "Ad content and claims are provided by advertisers. We do not independently verify every claim made in third-party creatives.",
    ],
  },
  {
    title: "No Professional Advice",
    paragraphs: [
      "Content on this site is not legal, financial, investment, cybersecurity, or professional advisory guidance.",
      "Any decisions you make based on website content are your own responsibility.",
    ],
  },
  {
    title: "Changes to This Disclaimer",
    paragraphs: [
      "We may update this page as platform features, policies, or legal requirements evolve.",
      "Continued use of the site after updates means you accept the revised disclaimer.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important information about website limitations, third-party links, Roblox affiliation, and advertising disclosures.",
  alternates: { canonical: "/disclaimer" },
  openGraph: {
    title: `Disclaimer | ${siteName}`,
    description:
      "Important information about the limitations and use of this website.",
    type: "website",
    url: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 45% 35% at 8% 0%, rgba(239,68,68,0.2), transparent), radial-gradient(ellipse 42% 32% at 92% 12%, rgba(59,130,246,0.16), transparent)",
        }}
      />
      <div className="relative mx-auto w-full max-w-5xl space-y-8">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300/85">
            Transparency
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            <span className="bg-gradient-to-r from-red-300 via-white to-blue-300 bg-clip-text text-transparent">
              Disclaimer
            </span>
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Important information about the limitations and use of this website.
            Please read these notes before relying on code listings, game links,
            or external resources.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Last updated: 2026
          </p>
        </section>

        <section className="grid gap-6">
          {sections.map((section, index) => (
            <article
              key={section.title}
              className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8"
              style={{ animationDelay: `${Math.min(index * 55, 440)}ms` }}
            >
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-relaxed text-zinc-400 sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300 sm:text-base"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
