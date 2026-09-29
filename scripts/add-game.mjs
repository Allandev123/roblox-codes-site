// Adds a game to the site as a draft.
//
//   node scripts/add-game.mjs <roblox game url | placeId> [--slug=x] [--name="X"] [--auto-approve]
//
// Resolves the universe, pulls name/description/stats, downloads the icon and
// thumbnail as WebP, and runs the first code scrape. The new file is a draft
// until it has approved codes, real redeem steps and a notes paragraph — see
// draftReason() in lib/store.mjs.

import fs from 'fs';
import path from 'path';
import { universeOf, gameDetails, iconUrls, thumbUrl, saveWebp } from '../lib/roblox.mjs';
import { detectCodes } from '../lib/detect.mjs';
import { mergeScrape } from '../lib/merge.mjs';
import { IMAGES_DIR, gameFile, saveGame, cleanName, slugify, loadGames } from '../lib/store.mjs';

const args = process.argv.slice(2);
const flag = n => args.find(a => a.startsWith(`--${n}=`))?.split('=').slice(1).join('=');
const input = args.find(a => !a.startsWith('--'));
const die = m => { console.error(`FAILED: ${m}`); process.exit(1); };
if (!input) die('usage: node scripts/add-game.mjs <roblox game url | placeId> [--slug=x] [--name="X"] [--auto-approve]');

const placeId = Number(input.match(/games\/(\d+)/)?.[1] ?? (/^\d+$/.test(input) ? input : NaN));
if (!placeId) die(`no place id in "${input}"`);

const universeId = await universeOf(placeId);
const existing = loadGames().find(g => g.universeId === universeId);
if (existing) die(`already tracked as data/games/${existing.slug}.json`);

const g = (await gameDetails([universeId])).get(universeId);
if (!g) die(`no details for universe ${universeId}`);

const name = flag('name') ?? cleanName(g.name);
const slug = flag('slug') ?? slugify(name);
if (!slug) die('could not make a slug; pass --slug=');
if (fs.existsSync(gameFile(slug))) die(`data/games/${slug}.json already exists; pass --slug=`);

fs.mkdirSync(IMAGES_DIR, { recursive: true });
const icon = (await iconUrls([universeId])).get(universeId);
if (icon) await saveWebp(icon, path.join(IMAGES_DIR, `${slug}-icon.webp`), { width: 256, height: 256 });
else console.log('  !! no icon available yet');
const thumb = await thumbUrl(universeId);
if (thumb) await saveWebp(thumb, path.join(IMAGES_DIR, `${slug}-thumb.webp`), { width: 768, height: 432 });
else console.log('  !! no thumbnail available yet');

const now = new Date().toISOString();
const game = {
  slug,
  name,
  robloxName: g.name,
  placeId,
  universeId,
  gameUrl: `https://www.roblox.com${g.canonicalUrlPath ?? `/games/${placeId}`}`,
  creator: g.creator?.name ?? null,
  genre: g.genre_l1 ?? null,
  subgenre: g.genre_l2 ?? null,
  icon: icon ? `${slug}-icon.webp` : null,
  thumb: thumb ? `${slug}-thumb.webp` : null,
  autoApprove: args.includes('--auto-approve'),
  draft: false,
  redeem: [
    `Launch ${name} on Roblox.`,
    'TODO: where the Codes button is in this game.',
    'Type or paste a code and press Redeem.',
  ],
  notes: 'TODO: a hand-written paragraph about the game and what its codes give.',
  codes: [],
  expired: [],
  stats: { playing: g.playing, visits: g.visits, favorites: g.favoritedCount ?? null, updated: g.updated, created: g.created },
  added: now,
  lastChecked: now,
  lastChanged: now,
};

const detected = detectCodes(g.description);
const report = mergeScrape(game, detected, now);
saveGame(game);

console.log(`added ${name}  ->  data/games/${slug}.json`);
console.log(`  place ${placeId}, universe ${universeId}, ${g.playing.toLocaleString('en-US')} playing`);
console.log(`  icon ${icon ? 'saved' : 'missing'}, thumbnail ${thumb ? 'saved' : 'missing'}`);
console.log(`  codes found in description: ${detected.length ? detected.map(c => c.code + (c.reward ? ` (${c.reward})` : '')).join(', ') : 'none'}`);
if (report.pending.length) console.log(`  ${report.pending.length} waiting for approval: node scripts/review.mjs ${slug}`);
console.log('\nnext: write "redeem" and "notes" in the file, approve the codes, then node publish.mjs');
