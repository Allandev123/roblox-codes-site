// The approval queue.
//
//   node scripts/review.mjs                        go through every waiting code, one key each
//   node scripts/review.mjs <slug>                 only that game
//   node scripts/review.mjs list                   print the queue and exit
//   node scripts/review.mjs approve <slug> [CODE ...]   approve (all waiting for the game if no codes)
//   node scripts/review.mjs reject <slug> CODE ...
//   node scripts/review.mjs reward <slug> CODE "new reward text"
//   node scripts/review.mjs add <slug> CODE "reward"    add a code by hand (source: manual, approved)
//   node scripts/review.mjs expire <slug> CODE          move a code to expired by hand
//
// A rejected code stays in the file with rejected:true so the next scrape
// does not queue it again; it is dropped once it leaves the description.

import readline from 'readline';
import { loadGames, saveGame } from '../lib/store.mjs';
import { pendingCodes, writePendingMd } from '../lib/pending.mjs';

const [cmd, slug, ...rest] = process.argv.slice(2);
const now = new Date().toISOString();
const games = loadGames();
const die = m => { console.error(`FAILED: ${m}`); process.exit(1); };
const find = s => games.find(g => g.slug === s) ?? die(`no game "${s}"`);
const codeIn = (g, code) => g.codes.find(c => c.code.toLowerCase() === code.toLowerCase());

function approve(g, c, reward) {
  if (reward !== undefined) c.reward = reward || null;
  c.approved = true;
  c.approvedAt = now;
  delete c.rejected;
  delete c.context;
  g.lastChanged = now;
}
function reject(g, c) {
  c.approved = false;
  c.rejected = true;
}
function done() {
  for (const g of games) saveGame(g);
  const left = writePendingMd(games);
  console.log(`\nsaved. ${left.length} code(s) still waiting. Run node publish.mjs to put approvals live.`);
}

const commands = {
  list() {
    const p = pendingCodes(games);
    if (!p.length) return console.log('nothing waiting');
    for (const { game: g, code: c } of p) {
      console.log(`${g.slug.padEnd(32)} ${c.code.padEnd(28)} ${c.reward ?? '-'}`);
      if (c.context) console.log(`${''.padEnd(32)} "${c.context}"`);
    }
  },
  approve() {
    const g = find(slug);
    const targets = rest.length ? rest.map(x => codeIn(g, x) ?? die(`no code ${x} in ${g.slug}`)) : g.codes.filter(c => !c.approved && !c.rejected);
    for (const c of targets) { approve(g, c); console.log(`approved ${g.slug} ${c.code}`); }
    done();
  },
  reject() {
    const g = find(slug);
    if (!rest.length) die('name the code(s) to reject');
    for (const x of rest) { const c = codeIn(g, x) ?? die(`no code ${x}`); reject(g, c); console.log(`rejected ${g.slug} ${c.code}`); }
    done();
  },
  reward() {
    const g = find(slug);
    const [code, text] = rest;
    const c = codeIn(g, code ?? '') ?? die(`no code ${code}`);
    c.reward = text || null;
    if (c.approved) g.lastChanged = now;
    console.log(`${g.slug} ${c.code} reward: ${c.reward}`);
    done();
  },
  add() {
    const g = find(slug);
    const [code, reward] = rest;
    if (!code) die('usage: add <slug> CODE "reward"');
    if (codeIn(g, code)) die(`${code} is already in ${g.slug}`);
    g.expired = g.expired.filter(e => e.code.toLowerCase() !== code.toLowerCase());
    g.codes.push({ code, reward: reward || null, status: 'active', firstSeen: now, lastSeen: now, source: 'manual', approved: true, approvedAt: now });
    g.lastChanged = now;
    console.log(`added ${g.slug} ${code} (manual)`);
    done();
  },
  expire() {
    const g = find(slug);
    for (const x of rest) {
      const c = codeIn(g, x) ?? die(`no code ${x}`);
      g.codes = g.codes.filter(k => k !== c);
      if (c.approved) g.expired.unshift({ code: c.code, reward: c.reward ?? null, removed: now.slice(0, 10), firstSeen: c.firstSeen, approved: true, reason: c.source === 'manual' ? 'expired' : 'no longer listed by the game' });
      g.lastChanged = now;
      console.log(`expired ${g.slug} ${c.code}`);
    }
    done();
  },
};

if (cmd && commands[cmd]) {
  commands[cmd]();
} else {
  // interactive pass: `review.mjs` or `review.mjs <slug>`
  const filter = cmd;
  const queue = pendingCodes(games).filter(p => !filter || p.game.slug === filter);
  if (!queue.length) { console.log('nothing waiting'); process.exit(0); }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = q => new Promise(r => rl.question(q, r));
  console.log(`${queue.length} code(s) to review.  a = approve   e = edit reward + approve   r = reject   s = skip   q = save and quit\n`);
  for (const { game: g, code: c } of queue) {
    console.log(`${g.name}  (${g.slug})`);
    console.log(`  code:   ${c.code}`);
    console.log(`  reward: ${c.reward ?? '(none found)'}`);
    if (c.context) console.log(`  line:   "${c.context}"`);
    let k = '';
    while (!['a', 'e', 'r', 's', 'q'].includes(k)) k = (await ask('  [a/e/r/s/q] ')).trim().toLowerCase();
    if (k === 'q') break;
    if (k === 'a') approve(g, c);
    if (k === 'e') approve(g, c, (await ask('  reward: ')).trim());
    if (k === 'r') reject(g, c);
    console.log('');
  }
  rl.close();
  done();
}
