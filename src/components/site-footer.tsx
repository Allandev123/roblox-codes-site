import Link from "next/link";
import { siteName } from "@/lib/site";

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/contact", label: "Contact" },
] as const;

const contentLinks = [
  { href: "/guides", label: "Guides" },
  { href: "/codes", label: "All Codes" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-[#05070c]/90">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:grid-cols-2 sm:px-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-200">
            {siteName}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
            Reliable Roblox code updates, practical game guides, and safe
            redemption tips in one place.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              Content
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {contentLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-zinc-300 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              Legal
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-zinc-300 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 sm:px-6">
        <p className="mx-auto max-w-6xl text-xs text-zinc-500">
          © {new Date().getFullYear()} {siteName}. Roblox is a trademark of
          Roblox Corporation. This site is not affiliated with Roblox.
        </p>
      </div>
    </footer>
  );
}
