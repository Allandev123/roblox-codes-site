// Build, check, and (with --push) commit, push and ping IndexNow.
//
//   node publish.mjs            build + checks only
//   node publish.mjs --push     also commit data/, push (Vercel deploys), ping IndexNow
//   node publish.mjs --push -m "message"
//
// Refuses to push if any check fails: broken internal links, missing images,
// duplicate or over-long titles and descriptions, invalid JSON-LD, a page
// without exactly one H1 or a canonical, a published game page with zero
// codes, or a sitemap that lists something that isn't a page.

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { ROOT, settings as loadSettings, loadGames, isPublished, liveCodes } from './lib/store.mjs';
import { submit } from './lib/indexnow.mjs';

const args = process.argv.slice(2);
const PUSH = args.includes('--push');
const msgArg = args.indexOf('-m') !== -1 ? args[args.indexOf('-m') + 1] : null;
const DIST = path.join(ROOT, 'dist');
const site = loadSettings();

let step = 0;
const head = m => console.log(`\n[${++step}] ${m}`);
const ok = m => console.log(`    ok  ${m}`);
const failures = [];
const fail = (m, list = []) => { failures.push(m); console.log(`    !!  ${m}`); for (const l of list.slice(0, 8)) console.log(`          ${l}`); if (list.length > 8) console.log(`          … and ${list.length - 8} more`); };
const run = (cmd, argv) => execFileSync(cmd, argv, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

head('Tests');
try { run(process.execPath, ['--test']); ok('detector and merge tests pass'); }
catch (e) { fail('tests failed', (e.stdout || '').split('\n').filter(l => /✖|not ok/.test(l))); }

head('Build');
try { ok(run(process.execPath, ['build.mjs']).trim().split('\n')[0]); }
catch (e) { console.error(e.stderr || e.message); process.exit(1); }

head('Check the output');
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
})(DIST);
const rel = f => '/' + path.relative(DIST, f).replace(/\\/g, '/');

// Case-sensitive existence: Windows says dist/Foo exists when only dist/foo
// does, and Vercel would 404 it.
const dirCache = new Map();
const entries = d => { if (!dirCache.has(d)) { try { dirCache.set(d, new Set(fs.readdirSync(d))); } catch { dirCache.set(d, new Set()); } } return dirCache.get(d); };
function exists(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const segs = clean.split('/').filter(Boolean);
  if (clean.endsWith('/') || !segs.length) segs.push('index.html');
  let d = DIST;
  for (const s of segs) { if (!entries(d).has(s)) return false; d = path.join(d, s); }
  return true;
}

const titles = new Map(), descs = new Map();
const gamePages = new Set(loadGames().map(g => `/${g.slug}-codes/index.html`));
const broken = [], missingImg = [], badTitle = [], badDesc = [], badH1 = [], noCanon = [], badLd = [], noCodes = [];
for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  const r = rel(f);
  const is404 = r === '/404.html';
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const decoded = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  if (!title || decoded(title).length > 60) badTitle.push(`${r} (${decoded(title).length}) ${title}`);
  if (!desc || decoded(desc).length > 155) badDesc.push(`${r} (${decoded(desc).length})`);
  if (!is404) {
    titles.set(title, [...(titles.get(title) ?? []), r]);
    descs.set(desc, [...(descs.get(desc) ?? []), r]);
    if (!/<link rel="canonical" href="https:\/\/[^"]+\/"/.test(html)) noCanon.push(r);
  }
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) badH1.push(`${r} has ${h1s}`);

  for (const m of html.matchAll(/<a\b[^>]*href="(\/[^"]*)"/g)) if (!exists(m[1])) broken.push(`${r} -> ${m[1]}`);
  // /_vercel/ is served by Vercel itself (Web Analytics), not from dist/
  for (const m of html.matchAll(/<(?:img|link|script)\b[^>]*(?:src|href)="(\/[^"]*)"/g)) if (!m[1].startsWith('/_vercel/') && !exists(m[1])) missingImg.push(`${r} -> ${m[1]}`);
  const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  if (og && og.startsWith(site.url) && !exists(og.slice(site.url.length))) missingImg.push(`${r} -> ${og}`);

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      if (j['@context'] !== 'https://schema.org' || !j['@type']) throw new Error('missing @context/@type');
      if (j['@type'] === 'Article' && (!j.headline || !j.dateModified || isNaN(Date.parse(j.dateModified)))) throw new Error('Article without headline/dateModified');
      if (j['@type'] === 'BreadcrumbList' && !j.itemListElement?.every(i => i.item?.startsWith(site.url))) throw new Error('bad breadcrumb');
    } catch (e) { badLd.push(`${r}: ${e.message}`); }
  }
  if (gamePages.has(r) && !/<li class="code-row">/.test(html)) noCodes.push(r);
}

broken.length ? fail(`${broken.length} broken internal link(s)`, broken) : ok('internal links resolve');
missingImg.length ? fail(`${missingImg.length} missing image/asset(s)`, missingImg) : ok('images and assets present');
badTitle.length ? fail('titles missing or over 60 characters', badTitle) : ok('titles ≤ 60 characters');
badDesc.length ? fail('meta descriptions missing or over 155 characters', badDesc) : ok('descriptions ≤ 155 characters');
const dupT = [...titles].filter(([, v]) => v.length > 1).map(([k, v]) => `${k}: ${v.join(', ')}`);
const dupD = [...descs].filter(([, v]) => v.length > 1).map(([k, v]) => `${k.slice(0, 50)}…: ${v.join(', ')}`);
dupT.length ? fail('duplicate titles', dupT) : ok('titles unique');
dupD.length ? fail('duplicate descriptions', dupD) : ok('descriptions unique');
badH1.length ? fail('pages without exactly one H1', badH1) : ok('one H1 per page');
noCanon.length ? fail('pages without a canonical', noCanon) : ok('canonical on every page');
badLd.length ? fail('invalid JSON-LD', badLd) : ok('JSON-LD valid');
noCodes.length ? fail('published game pages with zero codes', noCodes) : ok('every game page has codes');

{
  const games = loadGames();
  const live = games.filter(isPublished);
  const wrong = live.filter(g => !liveCodes(g).length).map(g => g.slug);
  const pagesMissing = live.filter(g => !exists(`/${g.slug}-codes/`)).map(g => g.slug);
  const draftsBuilt = games.filter(g => !isPublished(g) && exists(`/${g.slug}-codes/`)).map(g => g.slug);
  (wrong.length || pagesMissing.length || draftsBuilt.length)
    ? fail('game data and pages disagree', [...wrong.map(s => `${s}: published with no codes`), ...pagesMissing.map(s => `${s}: no page`), ...draftsBuilt.map(s => `${s}: draft has a page`)])
    : ok(`${live.length} games live, ${games.length - live.length} drafts`);

  const sm = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].slice(site.url.length));
  const lastmods = [...sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m => m[1]);
  const badLoc = locs.filter(l => !exists(l));
  const expected = pages.map(rel).filter(r => r !== '/404.html').map(r => r.replace(/index\.html$/, ''));
  const unlisted = expected.filter(p => !locs.includes(p));
  const badMod = lastmods.filter(d => isNaN(Date.parse(d)));
  (badLoc.length || unlisted.length || badMod.length || lastmods.length !== locs.length)
    ? fail('sitemap problems', [...badLoc.map(l => `not a page: ${l}`), ...unlisted.map(p => `not in sitemap: ${p}`), ...badMod.map(d => `bad lastmod: ${d}`)])
    : ok(`sitemap lists all ${locs.length} pages with lastmod`);
  if (!fs.existsSync(path.join(DIST, 'robots.txt')) || !/Sitemap: https:\/\//.test(fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8'))) fail('robots.txt missing or without Sitemap line');
  else ok('robots.txt points to the sitemap');
}

if (failures.length) {
  console.log(`\nFAILED: ${failures.length} check(s). Nothing was pushed.`);
  process.exit(1);
}
console.log('\nall checks passed');
if (!PUSH) { console.log('dry run — pass --push to commit, push and ping IndexNow'); process.exit(0); }

head('Commit and push');
const indexnowOn = site.indexnow?.enabled && site.indexnow?.key;
run('git', ['add', '-A']);
const staged = run('git', ['diff', '--cached', '--name-only']).trim();
if (!staged) ok('nothing to commit');
else {
  run('git', ['commit', '-m', msgArg ?? `Update codes ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`]);
  ok(`committed ${staged.split('\n').length} file(s)`);
}
// the scraper commits every few hours, so take its commits first
try { run('git', ['pull', '--rebase', '--autostash']); }
catch (e) {
  try { run('git', ['rebase', '--abort']); } catch {}
  console.error('FAILED: could not rebase onto the latest remote data (a scrape changed the same file). Run: git pull --rebase, fix the conflict, then publish again.');
  process.exit(1);
}

// Pages whose public code list changed relative to what is live now: a new
// page, or a game whose lastChanged moved. The home page lists them all, so it
// goes with any change.
const changed = [];
for (const g of loadGames().filter(isPublished)) {
  let before = null;
  try { before = JSON.parse(run('git', ['show', `@{u}:data/games/${g.slug}.json`])); } catch {}
  if (!before || !isPublished(before) || before.lastChanged !== g.lastChanged) changed.push(`/${g.slug}-codes/`);
}
if (changed.length) changed.unshift('/');

run('git', ['push']);
ok('pushed — Vercel deploys in about a minute');

if (indexnowOn) {
  head('IndexNow');
  if (!changed.length) ok('no page changed its codes; nothing to submit');
  else {
    // give Vercel a head start so engines fetch the new version
    await new Promise(r => setTimeout(r, 75_000));
    const r = await submit(site, changed);
    r.ok ? ok(`${changed.length} changed page(s) submitted (${r.status})`) : console.log(`    !!  IndexNow answered ${r.status}`);
  }
}
