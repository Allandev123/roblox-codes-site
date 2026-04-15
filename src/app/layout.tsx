import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
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
      </body>
    </html>
  );
}
