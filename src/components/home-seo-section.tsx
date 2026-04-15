import Link from "next/link";

const redeemSteps = [
  "Open Roblox and launch the game you want rewards in.",
  "Look for a Codes, Shop, or Settings button — many games hide redeem under Twitter or Gift icons.",
  "Type or paste the code exactly as shown (same spelling and capitalization).",
  "Submit and check your inventory, currency, or boosts — rewards usually arrive instantly.",
];

export function HomeSeoSection() {
  return (
    <section
      id="roblox-codes-guide"
      aria-labelledby="seo-heading"
      className="relative border-t border-white/5 bg-[#04060a] px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="animate-section-in relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] transition-shadow duration-300 hover:shadow-[0_0_40px_-12px_rgba(239,68,68,0.15),0_0_48px_-16px_rgba(59,130,246,0.12)] sm:p-10 md:p-12">
          <div
            className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-red-600/10 blur-3xl"
            aria-hidden
          />

          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300/80">
              Guide · 2026
            </p>
            <h2
              id="seo-heading"
              className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl"
            >
              <span className="bg-gradient-to-r from-red-300 via-white to-blue-300 bg-clip-text text-transparent">
                All Working Roblox Codes (2026)
              </span>
            </h2>

            <div className="mt-8 space-y-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
              <p>
                <strong className="font-semibold text-zinc-200">
                  Roblox codes
                </strong>{" "}
                are free text keys developers publish for their experiences.
                Redeem them in-game for boosts, currency, cosmetics, or
                limited-time items. Codes expire or cap out quickly, so it
                helps to use a trusted list that stays current — like the games
                above and our full{" "}
                <Link
                  href="/codes"
                  className="font-semibold text-blue-300 underline decoration-blue-500/40 underline-offset-2 transition hover:text-blue-200"
                >
                  codes directory
                </Link>
                .
              </p>
              <p>
                Big communities often ship the most codes — think hits such as{" "}
                <strong className="text-zinc-200">Blox Fruits</strong>,{" "}
                <strong className="text-zinc-200">Anime Fighters</strong>, and{" "}
                <strong className="text-zinc-200">Pet Simulator 99</strong>.
                Whether you chase fruit powers, anime-style battles, or pet
                hatching, redeeming the right key at the right time keeps your
                account stocked without spending Robux.
              </p>
            </div>

            <div className="mt-12 rounded-2xl border border-white/10 bg-black/30 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white sm:text-xl">
                How to Redeem Codes
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Flow varies slightly by game, but this pattern covers most
                experiences — from Blox Fruits and Anime Fighters to Pet
                Simulator 99-style collectors.
              </p>
              <ol className="mt-6 list-none space-y-4">
                {redeemSteps.map((text, i) => (
                  <li
                    key={text}
                    className="flex gap-4 border-l-2 border-blue-500/30 pl-4 sm:gap-5 sm:pl-5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-600/80 to-blue-600/80 text-sm font-black text-white shadow-lg shadow-red-500/20">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-sm leading-relaxed text-zinc-300 sm:text-base">
                      {text}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-8 rounded-xl border border-amber-500/20 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">
                <span className="font-semibold text-amber-200">Tip:</span> If a
                code fails, double-check spelling, region, and whether the
                developer retired it — then try another code from the same game
                page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
