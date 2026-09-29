// Imports researched games (codes posted on Discord/X rather than in the
// Roblox description) from a folder of JSON files, one per game.
//
//   node scripts/import-research.mjs <folder> [--dry-run]
//
// New games are added with add-game.mjs first. Codes go in as manual and
// approved, so the scraper never removes them; retire them with
// review.mjs expire. Games whose file says hasCodes:false are skipped.

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { ROOT, loadGames, saveGame } from '../lib/store.mjs';

const [dir] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const DRY = process.argv.includes('--dry-run');
if (!dir) { console.error('usage: node scripts/import-research.mjs <folder> [--dry-run]'); process.exit(1); }

const now = new Date().toISOString();
const byPlace = () => new Map(loadGames().map(g => [g.placeId, g]));

for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json')).sort()) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (!r.hasCodes || !r.codes?.length) { console.log(`skip ${r.slug}: ${r.hasCodes ? 'no working codes right now' : r.why || 'no code system'}`); continue; }
  let g = byPlace().get(r.placeId);
  if (!g) {
    if (DRY) { console.log(`would add ${r.name} (${r.codes.length} codes)`); continue; }
    execFileSync(process.execPath, ['scripts/add-game.mjs', String(r.placeId), `--slug=${r.slug}`, `--name=${r.name}`], { cwd: ROOT, stdio: 'inherit' });
    g = byPlace().get(r.placeId);
  }
  const have = new Set([...g.codes, ...g.expired].map(c => c.code.toLowerCase()));
  const added = [];
  for (const c of r.codes) {
    if (have.has(c.code.toLowerCase())) continue;
    g.codes.push({ code: c.code, reward: c.reward || null, status: 'active', firstSeen: now, lastSeen: now, source: 'manual', sources: c.sources ?? [], approved: true, approvedAt: now });
    have.add(c.code.toLowerCase());
    added.push(c.code);
  }
  for (const code of r.recentlyExpired ?? []) {
    if (have.has(code.toLowerCase())) continue;
    g.expired.push({ code, reward: null, removed: null, approved: true, reason: 'expired' });
    have.add(code.toLowerCase());
  }
  g.redeem = r.redeem;
  g.notes = r.notes;
  if (r.faq?.length) g.faq = r.faq;
  if (r.aliases?.length) g.aliases = r.aliases;
  if (r.codeChannels) g.codeChannels = r.codeChannels;
  g.draft = false;
  if (added.length) g.lastChanged = now;
  if (DRY) console.log(`would update ${g.slug}: +${added.length} codes`);
  else { saveGame(g); console.log(`${g.slug}: +${added.length} codes (${added.join(', ')})`); }
}
