import { CopyCodeButton } from "@/components/copy-code-button";

type Props = {
  code: string;
  reward: string;
  index: number;
};

export function GameCodeCard({ code, reward, index }: Props) {
  const safeCode = code?.trim() || "—";
  const safeReward = reward?.trim() || "—";

  return (
    <article
      className="group animate-fade-up relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#121a28] via-[#0c1018] to-[#0a1628] shadow-[0_4px_40px_-12px_rgba(0,0,0,0.85)] transition-all duration-[250ms] ease-out will-change-transform hover:z-[1] hover:scale-[1.03] hover:border-[rgba(255,100,140,0.4)] hover:shadow-[0_0_25px_rgba(255,60,120,0.25),0_0_0_1px_rgba(239,68,68,0.2),0_20px_50px_-20px_rgba(239,68,68,0.2)] active:scale-[0.99]"
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-red-500 via-fuchsia-500 to-blue-500 opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-red-600/10 blur-3xl transition duration-700 group-hover:bg-red-500/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl transition duration-700 group-hover:bg-blue-500/15"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 p-5 pl-6 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6 sm:p-6 sm:pl-7">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-300/95 ring-1 ring-blue-400/25">
              Redeem code
            </span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Click copy below
            </span>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Code
            </p>
            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 shadow-inner shadow-black/40 ring-1 ring-inset ring-white/[0.04] backdrop-blur-sm">
              <p className="break-all font-mono text-xl font-bold tracking-[0.08em] text-red-100 sm:text-2xl">
                {safeCode}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Reward
            </p>
            <p className="inline-flex max-w-full items-center rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold leading-snug text-blue-100">
              {safeReward}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col justify-end sm:justify-center sm:border-l sm:border-white/5 sm:pl-6">
          <CopyCodeButton code={safeCode} variant="game" />
        </div>
      </div>
    </article>
  );
}

/** Alias for layouts that expect a `CodeCard` name. */
export { GameCodeCard as CodeCard };
