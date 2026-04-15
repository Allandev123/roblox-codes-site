import type { Metadata } from "next";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact RobloxCodes 2026 for corrections, partnership requests, and content feedback.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact | ${siteName}`,
    description:
      "Get in touch with RobloxCodes 2026 for updates, corrections, and support.",
    type: "website",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Contact
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
          For code corrections, broken links, partnership requests, or general
          feedback, contact us at:
        </p>
        <p className="mt-3 rounded-xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 font-semibold text-blue-100">
          contact@robloxcodes2026.example
        </p>
        <p className="mt-5 text-sm leading-relaxed text-zinc-400">
          We typically respond within 2-3 business days. If you are reporting an
          expired or invalid code, include the game name and exact code string so
          we can verify it faster.
        </p>
      </article>
    </main>
  );
}
