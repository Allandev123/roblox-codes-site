// Re-checks every tracked game's Roblox description for codes.
//
//   node scripts/scrape.mjs [slug ...] [--dry-run] [--images]
//
// Fetches descriptions in batches of 50, runs the detector, and folds the
// result into each data/games/<slug>.json (see lib/merge.mjs for the rules).
// Writes PENDING.md with every code waiting for approval. --images also
// re-downloads icons and thumbnails, for when a game changes its artwork.
//
// In GitHub Actions it also writes a step summary and sets outputs:
//   changed=<games whose public list changed>  pending=<codes waiting>  added=<new this run>

import fs from 'fs';
import path from 'path';
import { gameDetails, gameVotes, iconUrls, thumbUrl, saveWebp } from '../lib/roblox.mjs';
import { detectCodes } from '../lib/detect.mjs';
import { mergeScrape } from '../lib/merge.mjs';
import { IMAGES_DIR, loadGames, saveGame, isPublished } from '../lib/store.mjs';
import { writePendingMd } from '../lib/pending.mjs';

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const IMAGES = args.includes('--images');
const only = args.filter(a => !a.startsWith('--'));

const games = loadGames().filter(g => !only.length || only.includes(g.slug));
if (!games.length) { console.log('no games to check'); process.exit(0); }

const details = await gameDetails(games.map(g => g.universeId));
const votes = await gameVotes(games.map(g => g.universeId)).catch(() => new Map()); // likes are nice to have, never block a scrape
const now = new Date().toISOString();
const lines = [];
let changed = 0, failed = 0, added = 0;
const pendingAll = [];

for (const g of games) {
  const d = details.get(g.universeId);
  // A missing or blank description is an API hiccup far more often than a
  // developer wiping their page. Skipping keeps a glitch from expiring every code.
  if (!d || typeof d.description !== 'string' || !d.description.trim()) {
    lines.push(`!! ${g.slug}: no description returned, skipped`);
    failed++;
    continue;
  }
  const hadDescriptionCodes = g.codes.some(c => c.source === 'description' && c.approved);
  const found = detectCodes(d.description);
  const r = mergeScrape(g, found, now);

  g.robloxName = d.name;
  const vt = votes.get(g.universeId);
  g.stats = { ...g.stats, playing: d.playing, visits: d.visits, favorites: d.favoritedCount ?? g.stats?.favorites ?? null, updated: d.updated, created: d.created ?? g.stats?.created, maxPlayers: d.maxPlayers ?? g.stats?.maxPlayers, ...(vt ? { upVotes: vt.upVotes, downVotes: vt.downVotes } : {}) };

  if (IMAGES) {
    const icon = (await iconUrls([g.universeId])).get(g.universeId);
    if (icon) { await saveWebp(icon, path.join(IMAGES_DIR, `${g.slug}-icon.webp`), { width: 256, height: 256 }); g.icon = `${g.slug}-icon.webp`; }
    const thumb = await thumbUrl(g.universeId);
    if (thumb) { await saveWebp(thumb, path.join(IMAGES_DIR, `${g.slug}-thumb.webp`), { width: 768, height: 432 }); g.thumb = `${g.slug}-thumb.webp`; }
  }

  if (!DRY) saveGame(g);
  if (r.changed) changed++;
  added += r.added.length;

  const bits = [];
  if (r.added.length) bits.push(`new: ${r.added.join(', ')}`);
  if (r.restored.length) bits.push(`back: ${r.restored.join(', ')}`);
  if (r.expired.length) bits.push(`no longer listed: ${r.expired.join(', ')}`);
  if (hadDescriptionCodes && !found.length) bits.push('WARNING: every description code vanished — check the page by hand');
  lines.push(`${r.changed ? '*' : ' '} ${g.slug.padEnd(34)} ${found.length} in description${bits.length ? ' — ' + bits.join('; ') : ''}`);

  for (const c of g.codes.filter(c => !c.approved && !c.rejected)) {
    pendingAll.push({ slug: g.slug, name: g.name, code: c.code, reward: c.reward, firstSeen: c.firstSeen, live: isPublished(g) });
  }
}

console.log(lines.join('\n'));
console.log(`\nchecked ${games.length - failed}/${games.length} games, ${changed} changed, ${pendingAll.length} code(s) waiting for approval${DRY ? ' (dry run, nothing written)' : ''}`);

// The approval list, committed with the data so it is visible on GitHub.
if (!DRY) writePendingMd(loadGames());

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Scrape ${now}\n\n\`\`\`\n${lines.join('\n')}\n\`\`\`\n\n${pendingAll.length} code(s) waiting for approval.\n`);
}
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\npending=${pendingAll.length}\nadded=${added}\n`);
}
if (failed === games.length) process.exit(1);
