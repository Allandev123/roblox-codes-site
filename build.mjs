// data/*.json -> dist/
//
//   node build.mjs
//
// Plain HTML, one folder per page so every URL ends in a slash. Games that
// aren't ready (no approved codes, or missing redeem steps / notes) are left
// out entirely: no page, no sitemap entry, no card. See draftReason().

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { ROOT, IMAGES_DIR, loadGames, settings as loadSettings, liveCodes, draftReason } from './lib/store.mjs';
import { ogImage } from './lib/og.mjs';
import { layout } from './templates/layout.mjs';
import { homeBody, gameBody, staticBody, notFoundBody } from './templates/pages.mjs';
import { about, contact, privacy } from './templates/content.mjs';
import { esc, monthYear, shortMonthYear, plural, clip } from './templates/helpers.mjs';

const t0 = Date.now();
const DIST = path.join(ROOT, 'dist');
const CACHE = path.join(ROOT, '.cache');
const site = loadSettings();
const NOW = Date.now();
const DAY = 864e5;

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
const write = (rel, content) => {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
};
const copy = (from, rel) => {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.copyFileSync(from, f);
};
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);

// ---------------------------------------------------------------- assets

// Fingerprinted names, so vercel.json can cache them for a year.
const assets = {};
for (const [key, file] of [['css', 'style.css'], ['js', 'app.js']]) {
  const src = fs.readFileSync(path.join(ROOT, 'static', file));
  const [base, ext] = file.split('.');
  assets[key] = `/assets/${base}.${hash(src)}.${ext}`;
  write(assets[key], src);
}
copy(path.join(ROOT, 'static', 'fonts', 'jakarta-latin.woff2'), 'fonts/jakarta-latin.woff2');

// Favicons from the logo mark.
const MARK = (fg, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="${bg}"/><path d="M9 9H23A2 2 0 0 1 25 11V13.2A2.8 2.8 0 0 0 25 18.8V21A2 2 0 0 1 23 23H9A2 2 0 0 1 7 21V18.8A2.8 2.8 0 0 0 7 13.2V11A2 2 0 0 1 9 9Z" fill="${fg}"/><path d="M19.5 10.5V21.5" stroke="${bg}" stroke-width="1.6" stroke-dasharray="1.8 1.8"/><path d="M11 13.5h5M11 16h5M11 18.5h3" stroke="${bg}" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const mark = MARK('#ffffff', '#0f766e');
write('favicon.svg', mark);
write('favicon-32.png', await sharp(Buffer.from(mark), { density: 300 }).resize(32, 32).png().toBuffer());
write('apple-touch-icon.png', await sharp(Buffer.from(MARK('#ffffff', '#0f766e').replace('rx="9"', 'rx="0"')), { density: 600 }).resize(180, 180).png().toBuffer());
write('favicon.ico', await sharp(Buffer.from(mark), { density: 300 }).resize(32, 32).png().toBuffer());
write('logo-512.png', await sharp(Buffer.from(mark), { density: 1200 }).resize(512, 512).png().toBuffer());

// ---------------------------------------------------------------- games

const all = loadGames();
const drafts = [];
const views = [];
for (const g of all) {
  const why = draftReason(g);
  if (why) { drafts.push(`${g.slug}: ${why}`); continue; }
  const live = liveCodes(g).sort((a, b) => Date.parse(b.firstSeen) - Date.parse(a.firstSeen));
  const month = monthYear(g.lastChanged);
  const h1 = `${g.name} Codes (${month})`;
  views.push({
    g, live,
    path: `/${g.slug}-codes/`,
    icon: g.icon ? `/img/${g.icon}` : '/logo-512.png',
    thumb: g.thumb ? `/img/${g.thumb}` : null,
    og: `/og/${g.slug}.png`,
    h1,
    month,
    isNew: c => NOW - Date.parse(c.firstSeen) < (site.newCodeDays ?? 3) * DAY,
    recentNew: live.filter(c => NOW - Date.parse(c.firstSeen) < 7 * DAY).length,
  });
}
// newest code changes first, everywhere
views.sort((a, b) => Date.parse(b.g.lastChanged) - Date.parse(a.g.lastChanged) || b.live.length - a.live.length);

// <title>: 60 characters at most, dropping the least useful parts first
function gameTitle(v) {
  const n = v.g.name;
  for (const t of [`${n} Codes (${v.month}) - ${site.siteName}`, `${n} Codes (${shortMonthYear(v.g.lastChanged)}) - ${site.siteName}`,
    `${n} Codes (${v.month})`, `${n} Codes (${shortMonthYear(v.g.lastChanged)})`, `${n} Codes`]) {
    if (t.length <= 60) return t;
  }
  return clip(`${n} Codes`, 60);
}

// meta description: how many codes and the best reward, 155 characters at most
function gameDescription(v) {
  const n = v.live.length;
  const top = v.live.find(c => c.reward)?.reward;
  const lead = `${plural(n, `working ${v.g.name} code`)} for ${v.month}`;
  const parts = [
    `${lead}${top ? `, including ${top.replace(/[.!]+$/, '')}` : ''}.`,
    'Checked every few hours, with rewards and how to redeem.',
  ];
  let d = parts.join(' ');
  if (d.length > 155) d = parts[0].length <= 155 ? parts[0] : `${lead}. Checked every few hours.`;
  return clip(d, 155);
}

// 6 related games: same genre first, then the most played
function related(v) {
  const others = views.filter(o => o !== v);
  const score = o => (o.g.subgenre && o.g.subgenre === v.g.subgenre ? 2 : 0) + (o.g.genre && o.g.genre === v.g.genre ? 1 : 0);
  return others
    .sort((a, b) => score(b) - score(a) || (b.g.stats?.playing ?? 0) - (a.g.stats?.playing ?? 0))
    .slice(0, site.relatedCount ?? 6);
}

const ORG = { '@type': 'Organization', name: site.siteName, url: site.url + '/', logo: { '@type': 'ImageObject', url: `${site.url}/logo-512.png`, width: 512, height: 512 } };

// images: copy only what published pages use
for (const v of views) {
  for (const f of [v.g.icon, v.g.thumb]) {
    if (f) copy(path.join(IMAGES_DIR, f), `img/${f}`);
  }
}

// OG images, cached on disk by their inputs so local rebuilds stay fast
fs.mkdirSync(path.join(CACHE, 'og'), { recursive: true });
async function og(key, opts, rel) {
  const bg = opts.background && fs.existsSync(opts.background) ? fs.statSync(opts.background).mtimeMs : 0;
  const id = hash(JSON.stringify({ ...opts, bg, v: 3 }));
  const cached = path.join(CACHE, 'og', `${key}-${id}.png`);
  if (!fs.existsSync(cached)) {
    for (const old of fs.readdirSync(path.join(CACHE, 'og')).filter(f => f.startsWith(`${key}-`))) fs.rmSync(path.join(CACHE, 'og', old));
    await ogImage({ ...opts, out: cached });
  }
  copy(cached, rel);
}

const lastCheck = all.reduce((m, g) => (g.lastChecked > m ? g.lastChecked : m), '');
const totalCodes = views.reduce((n, v) => n + v.live.length, 0);
const pages = []; // { path, lastmod }

for (const v of views) {
  const g = v.g;
  await og(g.slug, {
    background: g.thumb ? path.join(IMAGES_DIR, g.thumb) : null,
    title: g.name, kicker: 'CODES',
    sub: `${plural(v.live.length, 'working code')} · ${v.month}`,
  }, `og/${g.slug}.png`);

  const url = site.url + v.path;
  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: v.h1,
      description: gameDescription(v),
      image: [`${site.url}${v.og}`],
      datePublished: g.published ?? g.added,
      dateModified: g.lastChanged,
      author: ORG, publisher: ORG,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      about: { '@type': 'VideoGame', name: g.name, url: g.gameUrl, gamePlatform: 'Roblox' },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.url + '/' },
        { '@type': 'ListItem', position: 2, name: `${g.name} Codes`, item: url },
      ],
    },
  ];
  write(`${g.slug}-codes/index.html`, layout({
    site, assets, path: v.path,
    title: gameTitle(v),
    description: gameDescription(v),
    ogImage: site.url + v.og, ogType: 'article',
    jsonld,
    body: gameBody({ site, v, related: related(v) }),
  }));
  pages.push({ path: v.path, lastmod: g.lastChanged });
}

// ---------------------------------------------------------------- home

await og('default', { background: null, title: 'Working Roblox codes, checked every few hours', kicker: 'CODES', sub: `${plural(views.length, 'game')} · updated all day` }, 'og/default.png');
const homeLastmod = views[0]?.g.lastChanged ?? new Date().toISOString();
write('index.html', layout({
  site, assets, path: '/',
  title: `${site.siteName} - Working Roblox Codes, Checked Every Few Hours`.length <= 60
    ? `${site.siteName} - Working Roblox Codes, Checked Every Few Hours` : `${site.siteName} - Working Roblox Codes`,
  description: clip(`Working codes for ${views.length} Roblox games, checked against each game's official page every few hours. Rewards, redeem steps and expired codes for every game.`, 155),
  preload: views.slice(0, 1).map(v => v.icon),
  jsonld: [{
    '@context': 'https://schema.org', '@type': 'WebSite', name: site.siteName, url: site.url + '/',
    description: site.description,
    publisher: ORG,
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
  }],
  body: homeBody({ site, views, lastCheck: lastCheck || new Date().toISOString(), totalCodes }),
}));
pages.unshift({ path: '/', lastmod: homeLastmod });

// ---------------------------------------------------------------- static pages

const STATIC_LASTMOD = '2026-09-29T00:00:00Z';
for (const [slug, h1, title, description, html] of [
  ['about', `About ${site.siteName}`, `About ${site.siteName}`, `How ${site.siteName} finds, checks and expires Roblox codes: official game pages read every few hours, and every new code reviewed by a person.`, about(site)],
  ['contact', 'Contact', `Contact - ${site.siteName}`, `Report a code that doesn't work, a missing reward, or a Roblox game you want ${site.siteName} to cover.`, contact(site)],
  ['privacy', 'Privacy Policy', `Privacy Policy - ${site.siteName}`, `What ${site.siteName} collects, how Google Analytics and AdSense cookies are used, and how to opt out.`, privacy(site, site.privacyUpdated)],
]) {
  write(`${slug}/index.html`, layout({ site, assets, path: `/${slug}/`, title, description, body: staticBody(h1, html) }));
  pages.push({ path: `/${slug}/`, lastmod: STATIC_LASTMOD });
}

write('404.html', layout({
  site, assets, path: '/404/', noindex: true,
  title: `Page not found - ${site.siteName}`, description: 'This page does not exist.',
  body: notFoundBody(views),
}));

// ---------------------------------------------------------------- crawl files

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${esc(site.url + p.path)}</loc><lastmod>${p.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
if (site.indexnow?.key) write(`${site.indexnow.key}.txt`, site.indexnow.key);
if (site.adsense?.client) write('ads.txt', `google.com, ${site.adsense.client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`);

// ---------------------------------------------------------------- report

console.log(`built ${pages.length} pages (${views.length} games, ${totalCodes} codes) in ${Date.now() - t0} ms`);
if (drafts.length) console.log(`${drafts.length} draft(s) not published:\n  ${drafts.join('\n  ')}`);
