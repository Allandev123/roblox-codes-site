import Image from "next/image";
import Link from "next/link";
import type { GameListItem } from "@/types/game-list";

type Props = {
  game: GameListItem;
};

export function GameCard({ game }: Props) {
  const title = game.title?.trim() || "Game";
  const slug = game.slug?.trim() || "";
  const codes =
    typeof game.codeCount === "number" && Number.isFinite(game.codeCount)
      ? Math.max(0, Math.floor(game.codeCount))
      : 0;
  const players = game.playingLabel?.trim() || "—";

  return (
    <Link
      href={`/codes/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-all duration-[250ms] ease-out will-change-transform hover:z-[1] hover:scale-[1.03] hover:border-[rgba(255,100,140,0.45)] hover:shadow-[0_0_25px_rgba(255,60,120,0.25),0_16px_40px_-12px_rgba(0,0,0,0.5)] active:scale-[0.99]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={game.image}
          alt={`${title} artwork`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[400ms] ease-out will-change-transform group-hover:scale-110"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/40 to-transparent opacity-90 transition-opacity duration-[400ms] ease-out group-hover:opacity-100"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 transition-opacity duration-[400ms] ease-out group-hover:opacity-100"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h2 className="text-lg font-bold tracking-tight text-white drop-shadow-md transition duration-300 group-hover:text-red-100 sm:text-xl">
            {title}
          </h2>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-3 border-t border-white/5 px-4 py-4">
        <dl className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          <div className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1 text-red-200 ring-1 ring-red-500/25 transition group-hover:bg-red-500/15">
            <CodeIcon className="text-red-400" />
            <dt className="sr-only">Codes</dt>
            <dd>{codes} codes</dd>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-2.5 py-1 text-blue-200 ring-1 ring-blue-500/25 transition group-hover:bg-blue-500/15">
            <UsersIcon className="text-blue-400" />
            <dt className="sr-only">Players</dt>
            <dd>{players} playing</dd>
          </div>
        </dl>
        <span className="text-xs font-bold text-blue-300/80 transition group-hover:text-blue-200">
          View codes →
        </span>
      </div>
    </Link>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
