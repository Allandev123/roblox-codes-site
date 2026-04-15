/**
 * SEO-oriented copy for /codes/[slug] — dynamic paragraphs using the game title.
 */

export function formatGameCodesLastUpdated(isoDate: string): string {
  const raw = isoDate.trim();
  const d = raw.includes("T")
    ? new Date(raw)
    : new Date(`${raw}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** ~180–230 words — intro block below the hero. */
export function getGameCodesIntroParagraphs(title: string): string[] {
  return [
    `Looking for the latest ${title} codes? You are in the right place. Here you will find active and working codes we monitor and refresh daily, so you can redeem free rewards, boosts, currency, and exclusive in-game items before they disappear. Whether you are catching up after a break or stacking bonuses during a busy week, this page is built to save you time.`,
    `Roblox experiences like ${title} often release promotional codes during updates, milestones, collaborations, and holiday campaigns. Developers use codes to thank players, celebrate follower counts, or hype a new patch. We track official drops and community reports so you can tell what still redeems in-game versus what belongs in the archive.`,
    `When you redeem, copy each code exactly as written—spacing and capitalization matter. Open ${title}, find the Codes or redeem area your experience uses (often under Settings, Shop, Twitter, or a gift icon), paste the string, and confirm. Rewards should land in your inventory, currency, or boosts right away. Bookmark this hub and check back after major updates; new codes frequently appear within hours of a release. Play fair, skip shady generators, and enjoy the freebies.`,
  ];
}

/** ~260–340 words — “About {game}” depth section. */
export function getGameAboutParagraphs(
  title: string,
  description?: string | null,
): string[] {
  const desc = description?.trim();
  const p1 = desc
    ? `${desc} This Roblox experience keeps evolving with live updates, community feedback, and seasonal beats—so ${title} stays interesting whether you play casually or push the leaderboard.`
    : `${title} is a Roblox experience built around progression, social play, and regular live updates. Like many top games on the platform, it rewards players who log in often, complete objectives, and explore new content as developers ship patches, balance tweaks, and limited-time modes.`;

  return [
    p1,
    `In a typical session you launch ${title} from Roblox with one click, then use in-game menus to manage your character, inventory, and rewards. Progress usually follows the rules the developers publish: quests, currencies, boosts, cosmetics, or seasonal ladders—depending on how the experience is structured. Servers may rotate events or double-reward windows, so redeeming codes at the right moment can multiply value when a bonus weekend lines up with a fresh drop.`,
    `Players rely on ${title} codes because they are free, intended for public use, and often bundle high-impact items. A single code might grant currency to skip a grind, a timed boost for farming, or a cosmetic that used to be paid-only. Codes also help returning players close the gap after a long break without spending Robux. That is why bookmarking a trusted codes page matters: you get signal, not rumor, and you avoid scams that ask for your password or “verification” downloads.`,
    `Treat codes as part of your routine: check after patches, read patch notes when the studio posts them, and redeem soon after a new string appears—many promotions expire quickly or hit redemption caps. Staying consistent means you will rarely miss the best drops, and you will always know what still works inside ${title}.`,
  ];
}

export type GameCodesFaqItem = { question: string; answer: string };

export function getGameCodesFaq(title: string): GameCodesFaqItem[] {
  return [
    {
      question: `What are ${title} codes?`,
      answer: `${title} codes are short text strings the game’s developers publish so players can redeem free rewards inside Roblox. They usually grant currency, boosts, cosmetics, or bundles. You enter them in the in-game redeem area; legitimate codes never require your Roblox password.`,
    },
    {
      question: `How do I get new ${title} codes?`,
      answer: `Follow the developers on social platforms they link from the game page, join their official Discord or community server when available, and watch for patch notes after updates. We also refresh this page when new codes appear so you can copy them in one place.`,
    },
    {
      question: `Why are ${title} codes not working?`,
      answer: `A code may have expired, hit a redemption limit, been typed incorrectly, or only worked in a specific region or time window. Some codes also require a minimum account age or progress. Double-check spelling, try again after restarting the experience, and compare with the archived list on this page if the reward no longer applies.`,
    },
    {
      question: `How often are ${title} codes updated?`,
      answer: `We check this page daily and update it whenever new codes surface or old ones stop redeeming. Major game updates and holidays are the most common times for fresh drops, so those days are worth an extra visit.`,
    },
  ];
}
