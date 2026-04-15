import Link from "next/link";
import { siteName } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/codes", label: "Codes" },
  { href: "/guides", label: "Guides" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060a12]/72 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#060a12]/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-3 font-bold tracking-tight text-white"
          aria-label={`${siteName} home`}
        >
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400/80 via-fuchsia-400/75 to-purple-500/80 p-[1px] shadow-[0_0_14px_rgba(236,72,153,0.22),0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300 ease-out group-hover:scale-[1.04] group-hover:shadow-[0_0_22px_rgba(236,72,153,0.32),0_0_28px_rgba(168,85,247,0.3)]">
            <span
              className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-pink-500/35 via-fuchsia-500/25 to-purple-500/30 blur-md transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden
            />
            <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] bg-[#080d16]">
              <img
                src="/favicon-32x32.png"
                alt={`${siteName} logo`}
                width={32}
                height={32}
                className="h-8 w-8 object-cover"
              />
            </span>
          </span>
          <span className="hidden text-sm uppercase tracking-widest text-zinc-300 sm:inline sm:text-base">
            {siteName}
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-400 transition-all duration-300 hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
