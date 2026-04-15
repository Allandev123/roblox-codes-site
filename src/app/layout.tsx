import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteToast } from "@/components/site-toast";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";
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
    default: `${siteName} — Free Roblox codes`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
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
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
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
