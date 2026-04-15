import Link from "next/link";
import { siteName } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/codes", label: "Codes" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070c]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-bold tracking-tight text-white"
        >
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-blue-600 text-sm font-black text-white shadow-[0_0_24px_rgba(239,68,68,0.45),0_0_28px_rgba(59,130,246,0.35)] transition duration-300 group-hover:scale-105 group-hover:shadow-[0_0_32px_rgba(239,68,68,0.55),0_0_36px_rgba(59,130,246,0.45)]">
            <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.35),transparent)] opacity-0 transition duration-500 group-hover:translate-x-full group-hover:opacity-100" />
            R
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
              className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-400 transition duration-300 hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
