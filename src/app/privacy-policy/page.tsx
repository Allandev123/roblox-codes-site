import type { Metadata } from "next";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Detailed privacy policy for RobloxCodesHQ covering analytics, cookies, Google AdSense, data retention, and user rights.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    title: `Privacy Policy | ${siteName}`,
    description: "How we collect, use, and protect data on RobloxCodes 2026.",
    type: "website",
    url: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  const brandName = "RobloxCodesHQ";
  const contactEmail = "privacy@robloxcodeshq.example";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-zinc-500">Last updated: 2026-04-15</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-white">Overview</h2>
            <p className="mt-2">
              This Privacy Policy explains how {brandName} collects, uses, and
              protects information when you visit our website and read our Roblox
              code pages, guides, and related content. We designed this policy to
              be clear and practical, not filled with unnecessary legal language.
              Our goal is to be transparent about what data is used, why it is
              used, and what choices you have.
            </p>
            <p className="mt-2">
              By using {brandName}, you agree to the practices described here. If
              you do not agree, please stop using the site. We may update this
              policy as our services evolve, and we will update the date at the
              top when changes are made.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Information we collect</h2>
            <p className="mt-2">
              We collect a limited set of data to run the site responsibly and to
              improve content quality. This may include technical information such
              as your browser type, device type, operating system, language
              settings, referral source, pages viewed, and approximate region.
            </p>
            <p className="mt-2">
              If you contact us by email, we may collect your name (if provided),
              email address, and the content of your message. We only collect
              what is needed to respond, investigate reported issues, and maintain
              support records.
            </p>
            <p className="mt-2">
              We do not request sensitive data such as passwords, payment details,
              or identity documents through this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Advertising and cookies</h2>
            <p className="mt-2">
              {brandName} may display ads through third-party advertising
              partners, including Google AdSense. Google and its partners may use
              cookies and similar technologies to show ads, measure ad
              performance, and personalize advertising based on your visits to
              this and other websites.
            </p>
            <p className="mt-2">
              Cookies may also be used for core site functions, fraud prevention,
              frequency capping, and reporting. You can manage or disable cookies
              in your browser settings. Keep in mind that disabling cookies may
              affect how parts of the site or ad-supported features behave.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Analytics and performance tracking
            </h2>
            <p className="mt-2">
              We use analytics and performance tracking to understand how visitors
              use {brandName}. This may include page views, click behavior, load
              times, session trends, and high-level traffic patterns. These
              insights help us improve site speed, identify broken pages, and make
              our guides more useful.
            </p>
            <p className="mt-2">
              Analytics data is generally processed in aggregated form and is not
              used by us to identify individual users directly. We do not sell
              personal data, and we do not use analytics for invasive profiling.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">How we use information</h2>
            <p className="mt-2">
              We use collected information to operate, secure, and improve
              {brandName}; publish and maintain accurate content; respond to
              support requests; detect abuse; and comply with legal obligations.
              We may also use data to measure ad performance and maintain fair
              advertising practices.
            </p>
            <p className="mt-2">
              We do not use your contact details for unrelated bulk marketing
              without consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Data retention</h2>
            <p className="mt-2">
              We keep data only for as long as needed for the purposes described
              in this policy. Technical logs and analytics records are retained
              for limited periods based on operational and security needs. Contact
              messages may be retained to help us handle follow-up requests and
              maintain support history.
            </p>
            <p className="mt-2">
              When data is no longer required, we delete or anonymize it where
              practical, unless retention is required for legal, security, or
              dispute-resolution reasons.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">User rights and choices</h2>
            <p className="mt-2">
              Depending on your location, you may have rights to request access
              to your personal information, correction of inaccurate information,
              deletion of eligible data, or restriction of certain processing.
              You may also object to specific data uses where applicable.
            </p>
            <p className="mt-2">
              To make a request, contact us at{" "}
              <span className="font-semibold text-blue-200">{contactEmail}</span>.
              We may need to verify your request before completing it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Children&apos;s privacy</h2>
            <p className="mt-2">
              {brandName} is intended for a general audience and does not
              knowingly collect personal information from children under 13. If
              you believe a child has submitted personal data to us, please email{" "}
              <span className="font-semibold text-blue-200">{contactEmail}</span>{" "}
              and we will review and remove the information where appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Contact us</h2>
            <p className="mt-2">
              If you have questions about this policy, cookie usage, analytics,
              or your data rights, contact:
            </p>
            <p className="mt-2 rounded-xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 font-semibold text-blue-100">
              {brandName} Privacy Team · {contactEmail}
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
