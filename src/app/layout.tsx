import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteToast } from "@/components/site-toast";
import { getSiteUrl, siteDescription, siteName, withFaviconCacheBust } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Free Roblox Codes 2026 – Updated Daily (Working Codes)",
    template: "%s | RobloxCodesHQ",
  },
  description:
    "Get the latest working Roblox codes for 2026. Updated daily with new rewards, free items, and exclusive in-game bonuses across top Roblox games.",
  keywords: [
    "Roblox",
    "codes",
    "2026",
    "free codes",
    "game codes",
    "Roblox games",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  icons: {
    icon: [
      {
        url: withFaviconCacheBust("/favicon.ico"),
        sizes: "any",
      },
      {
        url: withFaviconCacheBust("/favicon-32x32.png"),
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: withFaviconCacheBust("/favicon-16x16.png"),
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcut: withFaviconCacheBust("/favicon.ico"),
    apple: withFaviconCacheBust("/apple-touch-icon.png"),
  },
  manifest: withFaviconCacheBust("/site.webmanifest"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#05070c] font-sans text-zinc-100">
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage: `
              radial-gradient(ellipse 90% 55% at 10% -10%, rgba(239, 68, 68, 0.22), transparent 55%),
              radial-gradient(ellipse 80% 50% at 90% 0%, rgba(59, 130, 246, 0.2), transparent 50%),
              radial-gradient(ellipse 60% 40% at 50% 100%, rgba(30, 64, 175, 0.12), transparent 45%)
            `,
          }}
        />
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <SiteToast />
      </body>
    </html>
  );
}
