import type { CodeRowStatus } from "@/lib/code-status";
import { ROBLOX_DEFAULT_GAME_ICON } from "@/lib/roblox-image-defaults";

export type GameCode = {
  /** Optional DB row id when loaded from Supabase (for stable React keys). */
  id?: string;
  code: string;
  /** What the code grants — maps to DB `description`. */
  description: string;
  status: CodeRowStatus;
};

export type Game = {
  slug: string;
  title: string;
  description: string;
  cardImage: string;
  bannerImage: string;
  robloxPlaceId: number;
  /** Display-only concurrent players label */
  playingLabel: string;
  /** Shown on game page (display) */
  lastUpdated: string;
  /** ISO date for structured data */
  lastUpdatedIso: string;
  codes: GameCode[];
};

export const games: Game[] = [
  {
    slug: "pet-simulator-99",
    title: "Pet Simulator 99",
    description:
      "Hatch pets, trade rares, and stack boosts. These sample codes show how your live list could look.",
    cardImage: ROBLOX_DEFAULT_GAME_ICON,
    bannerImage: ROBLOX_DEFAULT_GAME_ICON,
    robloxPlaceId: 8737899170,
    playingLabel: "142K",
    lastUpdated: "April 15, 2026",
    lastUpdatedIso: "2026-04-15",
    codes: [
      {
        code: "PS99BOOST",
        description: "3x Luck (30 min) — best used before opening event eggs.",
        status: "active",
      },
      {
        code: "HATCHDAY",
        description: "250 Coins — great for early progression and shop refreshes.",
        status: "active",
      },
      {
        code: "OLDDROP",
        description: "Legacy weekend bonus (no longer redeemable).",
        status: "expired",
      },
    ],
  },
  {
    slug: "blox-fruits",
    title: "Blox Fruits",
    description:
      "Sea battles and fruit powers — placeholder entries for layout preview only.",
    cardImage: ROBLOX_DEFAULT_GAME_ICON,
    bannerImage: ROBLOX_DEFAULT_GAME_ICON,
    robloxPlaceId: 2753915549,
    playingLabel: "89.2K",
    lastUpdated: "April 14, 2026",
    lastUpdatedIso: "2026-04-14",
    codes: [
      {
        code: "SEAEVENT",
        description: "2x EXP (20 min) — pair with quests for faster levels.",
        status: "active",
      },
      {
        code: "FRUITROLL",
        description: "Stat Reset — useful when switching from grind to PvP builds.",
        status: "active",
      },
    ],
  },
  {
    slug: "anime-adventures",
    title: "Anime Adventures",
    description:
      "Tower defense meets anime heroes — demo codes, verify before redeeming.",
    cardImage: ROBLOX_DEFAULT_GAME_ICON,
    bannerImage: ROBLOX_DEFAULT_GAME_ICON,
    robloxPlaceId: 3183406628,
    playingLabel: "41K",
    lastUpdated: "April 12, 2026",
    lastUpdatedIso: "2026-04-12",
    codes: [
      {
        code: "SUMMONS",
        description: "Gems x500 — spend during limited banner rotations.",
        status: "active",
      },
      {
        code: "RAIDREADY",
        description: "Raid Token — save for high-value raid stages.",
        status: "active",
      },
      {
        code: "PATCHNOTE",
        description: "2x Gold (15 min) — activate before long farm sessions.",
        status: "active",
      },
    ],
  },
  {
    slug: "jailbreak",
    title: "Jailbreak",
    description:
      "Cops vs robbers open world — sample cash and vehicle codes for UI.",
    cardImage: ROBLOX_DEFAULT_GAME_ICON,
    bannerImage: ROBLOX_DEFAULT_GAME_ICON,
    robloxPlaceId: 606849621,
    playingLabel: "18.5K",
    lastUpdated: "April 10, 2026",
    lastUpdatedIso: "2026-04-10",
    codes: [
      {
        code: "SPRING2026",
        description: "$12,500 — ideal for early vehicle upgrades.",
        status: "active",
      },
      {
        code: "NITRO",
        description: "Vehicle Skin — cosmetic unlock.",
        status: "active",
      },
    ],
  },
  {
    slug: "tower-defense-simulator",
    title: "Tower Defense Simulator",
    description:
      "Waves, towers, and crates — illustrative code rows for your future CMS.",
    cardImage: ROBLOX_DEFAULT_GAME_ICON,
    bannerImage: ROBLOX_DEFAULT_GAME_ICON,
    robloxPlaceId: 5780309044,
    playingLabel: "22.1K",
    lastUpdated: "April 8, 2026",
    lastUpdatedIso: "2026-04-08",
    codes: [
      {
        code: "WAVEBONUS",
        description: "Crate Key — open event crates for stronger towers.",
        status: "active",
      },
      {
        code: "TOWERUP",
        description: "$8,000 — stabilize your mid-game loadout.",
        status: "active",
      },
      {
        code: "SKIPTICKET",
        description: "Skip x1 — bypass slow early waves in farming runs.",
        status: "active",
      },
    ],
  },
  {
    slug: "king-legacy",
    title: "King Legacy",
    description:
      "Sail, fight, and awaken fruits — demo entries for a premium code layout.",
    cardImage: ROBLOX_DEFAULT_GAME_ICON,
    bannerImage: ROBLOX_DEFAULT_GAME_ICON,
    robloxPlaceId: 4520747061,
    playingLabel: "9.8K",
    lastUpdated: "April 5, 2026",
    lastUpdatedIso: "2026-04-05",
    codes: [
      {
        code: "UPDATE!",
        description: "Gems x300 — small boost for rerolls and utility.",
        status: "active",
      },
      {
        code: "KINGLEGACY",
        description: "Stat Refund — reset when moving to a new fruit build.",
        status: "active",
      },
    ],
  },
];
