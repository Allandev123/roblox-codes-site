import { ROBLOX_DEFAULT_GAME_ICON } from "@/lib/roblox-image-defaults";

export type GameCode = {
  code: string;
  reward: string;
  description?: string;
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
        reward: "3x Luck (30 min)",
        description: "Best used before opening event eggs or lucky blocks.",
      },
      {
        code: "HATCHDAY",
        reward: "250 Coins",
        description: "Great for early progression and shop refreshes.",
      },
      {
        code: "UPDATE2026",
        reward: "Mystery Egg",
        description: "Claim after patch releases for bonus hatch value.",
      },
    ],
  },
  {
    slug: "blox-fruits",
    title: "Blox Fruits",
    description:
      "Sea battles and fruit powers — placeholder rewards for layout preview only.",
    cardImage: ROBLOX_DEFAULT_GAME_ICON,
    bannerImage: ROBLOX_DEFAULT_GAME_ICON,
    robloxPlaceId: 2753915549,
    playingLabel: "89.2K",
    lastUpdated: "April 14, 2026",
    lastUpdatedIso: "2026-04-14",
    codes: [
      {
        code: "SEAEVENT",
        reward: "2x EXP (20 min)",
        description: "Pair this boost with quests for faster level gains.",
      },
      {
        code: "FRUITROLL",
        reward: "Stat Reset",
        description: "Useful when switching from grind to PvP builds.",
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
        reward: "Gems x500",
        description: "Spend these gems during limited banner rotations.",
      },
      {
        code: "RAIDREADY",
        reward: "Raid Token",
        description: "Save for high-value raid stages and new units.",
      },
      {
        code: "PATCHNOTE",
        reward: "2x Gold (15 min)",
        description: "Activate before long farm sessions for better returns.",
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
        reward: "$12,500",
        description: "Ideal for early vehicle upgrades and utility gear.",
      },
      {
        code: "NITRO",
        reward: "Vehicle Skin",
        description: "Cosmetic unlock with no gameplay requirement.",
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
        reward: "Crate Key",
        description: "Open event crates for a chance at stronger towers.",
      },
      {
        code: "TOWERUP",
        reward: "$8,000",
        description: "Use this cash to stabilize your mid-game loadout.",
      },
      {
        code: "SKIPTICKET",
        reward: "Skip x1",
        description: "Helpful for bypassing slow early waves in farming runs.",
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
        reward: "Gems x300",
        description: "Small gem boost for rerolls and utility purchases.",
      },
      {
        code: "KINGLEGACY",
        reward: "Stat Refund",
        description: "Reset safely when moving to a new fruit build.",
      },
    ],
  },
];
