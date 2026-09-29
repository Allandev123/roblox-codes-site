// Reading and writing data/. Game files are the source of truth for the site.

import fs from 'fs';
import path from 'path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
export const GAMES_DIR = path.join(ROOT, 'data', 'games');
export const IMAGES_DIR = path.join(ROOT, 'data', 'images');

export const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));
// Stable, diff-friendly output: two-space indent and a trailing newline.
export const writeJson = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n');

export const settings = () => readJson(path.join(ROOT, 'data', 'settings.json'));

export function loadGames() {
  return fs.readdirSync(GAMES_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => readJson(path.join(GAMES_DIR, f)));
}

export const gameFile = slug => path.join(GAMES_DIR, `${slug}.json`);
export const saveGame = g => writeJson(gameFile(g.slug), g);

// "[🍁PT2] Bubble Gum Simulator 🫧" -> "Bubble Gum Simulator"
export function cleanName(raw) {
  return raw
    .replace(/\[[^\]]*\]|\([^)]*\)|【[^】]*】/g, ' ')
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, ' ')
    .replace(/\b(UPD(ATE)?|NEW|EVENT|RELEASE|BETA|ALPHA)\b!?/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-–|:!]+|[\s\-–|:]+$/g, '')
    .trim();
}

export const slugify = s => s.toLowerCase()
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/&/g, ' and ')
  .replace(/\+/g, ' plus ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

// A game page goes live only when it has at least one approved working code
// and the hand-written parts exist. Everything else stays a draft.
export const liveCodes = g => g.codes.filter(c => c.approved && c.status === 'active');
export function draftReason(g) {
  if (g.draft) return 'marked draft';
  if (!liveCodes(g).length) return 'no approved working codes';
  if (!g.notes || g.notes.length < 200) return 'notes missing or under 200 characters';
  if (!Array.isArray(g.redeem) || g.redeem.length < 3) return 'redeem steps missing';
  if (g.redeem.some(s => /TODO/.test(s)) || /TODO/.test(g.notes)) return 'TODO left in redeem steps or notes';
  return null;
}
export const isPublished = g => !draftReason(g);
