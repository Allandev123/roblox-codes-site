// Finds games worth adding: popular right now and listing codes in their
// description. Ranked by concurrent players, biggest first.
//
//   node scripts/discover.mjs [--min=1000] [--all]
//
// --all also lists games that mention codes without any detectable in the
// description (candidates for manual codes). Writes data/candidates.json.

import fs from 'fs';
import { topGames, gameDetails, getJson } from '../lib/roblox.mjs';
import { detectCodes } from '../lib/detect.mjs';

const args = process.argv.slice(2);
const MIN = Number(args.find(a => a.startsWith('--min='))?.split('=')[1] ?? 1000);
const ALL = args.includes('--all');

const QUERIES = ['codes', 'simulator', 'tycoon', 'tower defense', 'anime', 'rng', 'obby', 'fishing', 'pets', 'incremental',
  'clicker', 'fighting', 'racing', 'horror', 'survival', 'roleplay', 'battlegrounds', 'shooter', 'idle', 'merge'];

const pool = new Map();
for (const g of await topGames()) pool.set(g.universeId, g.playerCount ?? 0);
for (const q of QUERIES) {
  try {
    const j = await getJson(`https://apis.roblox.com/search-api/omni-search?searchQuery=${encodeURIComponent(q)}&sessionId=rbxcodeshq&pageType=all`);
    for (const grp of j.searchResults ?? []) for (const c of grp.contents ?? []) {
      if (c.universeId && !pool.has(c.universeId)) pool.set(c.universeId, c.playerCount ?? 0);
    }
  } catch (e) { console.error(`search "${q}" failed: ${e.message}`); }
}

const tracked = new Set(fs.readdirSync('data/games').filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(`data/games/${f}`, 'utf8')).universeId));

const details = await gameDetails([...pool.keys()]);
const rows = [];
for (const [id, g] of details) {
  if (g.playing < MIN) continue;
  const codes = detectCodes(g.description);
  const mentions = /\bcodes?\b/i.test(g.description);
  if (!codes.length && !(ALL && mentions)) continue;
  rows.push({ universeId: id, placeId: g.rootPlaceId, name: g.name, playing: g.playing, genre: g.genre_l1,
    codes: codes.map(c => c.code), tracked: tracked.has(id), url: `https://www.roblox.com${g.canonicalUrlPath ?? `/games/${g.rootPlaceId}`}` });
}
rows.sort((a, b) => b.playing - a.playing);
fs.writeFileSync('data/candidates.json', JSON.stringify(rows, null, 1));

console.log(`${pool.size} games scanned, ${rows.length} with codes and ${MIN}+ players\n`);
for (const r of rows) {
  console.log(`${r.tracked ? '*' : ' '} ${String(r.playing).padStart(7)}  ${r.name.slice(0, 44).padEnd(44)} ${r.codes.join(', ').slice(0, 60) || '(mentions codes)'}`);
  if (!r.tracked) console.log(`           node scripts/add-game.mjs ${r.url}`);
}
console.log('\n* = already tracked');
