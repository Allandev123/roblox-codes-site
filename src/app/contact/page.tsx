import type { Metadata } from "next";
import { ContactPageContent } from "@/components/contact-page-content";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact RobloxCodes 2026 for corrections, partnership requests, and support inquiries.",
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
  return <ContactPageContent />;
}
