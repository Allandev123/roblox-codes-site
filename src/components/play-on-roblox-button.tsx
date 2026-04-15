import { getRobloxGameUrl } from "@/lib/games";
import type { Game } from "@/data/games";

type Props = {
  game: Pick<Game, "robloxPlaceId" | "title">;
  className?: string;
  size?: "md" | "lg";
};

export function PlayOnRobloxButton({
  game,
  className = "",
  size = "md",
}: Props) {
  const href = getRobloxGameUrl(game);
  const isLg = size === "lg";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-glow-blue group/play inline-flex items-center justify-center gap-3 rounded-2xl font-bold text-white shadow-lg ${
        isLg ? "px-8 py-4 text-base" : "px-6 py-3.5 text-sm"
      } ${className}`}
    >
      <span
        className={`flex items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20 transition group-hover/play:bg-white/25 ${
          isLg ? "h-11 w-11 text-xl" : "h-8 w-8 text-lg"
        }`}
        aria-hidden
      >
        ▶
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-200/90">
          Launch
        </span>
        <span>Play on Roblox</span>
      </span>
    </a>
  );
}
