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
import { homeBody, gameBody, staticBody, notFoundBody, authorBody, authorPath, guidesIndexBody, guideBody, blogIndexBody, updatesBody } from './templates/pages.mjs';
import { parseFrontMatter, renderMarkdown } from './lib/markdown.mjs';
import { about, method, contact, privacy, terms } from './templates/content.mjs';
import { esc, monthYear, shortMonthYear, plural, clip } from './templates/helpers.mjs';

const t0 = Date.now();
const DIST = path.join(ROOT, 'dist');
const CACHE = path.join(ROOT, '.cache');
const site = loadSettings();
const NOW = Date.now();
const DAY = 864e5;

// empty it rather than delete it, so a shell or server sitting in dist/ can't block the build
fs.mkdirSync(DIST, { recursive: true });
for (const e of fs.readdirSync(DIST)) fs.rmSync(path.join(DIST, e), { recursive: true, force: true });
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
for (const font of fs.readdirSync(path.join(ROOT, 'static', 'fonts')).filter(x => x.endsWith('.woff2'))) copy(path.join(ROOT, 'static', 'fonts', font), `fonts/${font}`);

// Favicons from the logo mark.
const MARK = (fg, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="${bg}"/><g transform="translate(4 4.5)" fill="none" stroke="${fg}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8c-2-4-6-4-6-1.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z"/></g></svg>`;
const mark = MARK('#ffffff', '#b4461a');
write('favicon.svg', mark);
write('favicon-32.png', await sharp(Buffer.from(mark), { density: 300 }).resize(32, 32).png().toBuffer());
write('apple-touch-icon.png', await sharp(Buffer.from(MARK('#ffffff', '#b4461a').replace('rx="9"', 'rx="0"')), { density: 600 }).resize(180, 180).png().toBuffer());
write('favicon.ico', await sharp(Buffer.from(mark), { density: 300 }).resize(32, 32).png().toBuffer());
write('logo-512.png', await sharp(Buffer.from(mark), { density: 1200 }).resize(512, 512).png().toBuffer());

// ---------------------------------------------------------------- games

// Codes that were already there when the site launched aren't "new" to anyone.
const LAUNCH = Date.parse(site.launchDate ?? '1970-01-01');
const isFresh = (c, window) => Date.parse(c.firstSeen) > LAUNCH && NOW - Date.parse(c.firstSeen) < window;

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
    icon: g.icon ? `/img/${g.icon.replace(/.webp$/, '-128.webp')}` : '/logo-512.png',
    iconLg: g.icon ? `/img/${g.icon}` : '/logo-512.png',
    thumb: g.thumb ? `/img/${g.thumb}` : null,
    og: `/og/${g.slug}.jpg`,
    h1,
    month,
    isNew: c => isFresh(c, (site.newCodeDays ?? 3) * DAY),
    recentNew: live.filter(c => isFresh(c, (site.newCodeDays ?? 3) * DAY)).length,
    // newest code on the page; the browser compares it with the last visit
    latest: live.reduce((m, c) => ((c.approvedAt ?? c.firstSeen) > m ? (c.approvedAt ?? c.firstSeen) : m), ''),
  });
}
// newest code changes first, everywhere
views.sort((a, b) => Date.parse(b.g.lastChanged) - Date.parse(a.g.lastChanged) || b.live.length - a.live.length);

// Code updates, by day: codes added or retired after a game got its page. The
// codes a game already had on the day it was added are its starting list, not news.
const updateDays = (() => {
  const days = new Map();
  const at = (day, v) => {
    if (!days.has(day)) days.set(day, new Map());
    const m = days.get(day);
    if (!m.has(v)) m.set(v, { v, added: [], expired: [] });
    return m.get(v);
  };
  for (const v of views) {
    const start = (v.g.added ?? '').slice(0, 10);
    for (const c of v.live) {
      const day = (c.approvedAt ?? c.firstSeen).slice(0, 10);
      if (day > start) at(day, v).added.push(c);
    }
    for (const e of v.g.expired ?? []) if (e.approved !== false && e.removed && e.removed.slice(0, 10) > start) at(e.removed.slice(0, 10), v).expired.push(e);
  }
  return [...days].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 30)
    .map(([day, m]) => ({ day, rows: [...m.values()].sort((a, b) => (b.v.g.stats?.playing ?? 0) - (a.v.g.stats?.playing ?? 0)) }));
})();
site.hasUpdates = updateDays.length > 0;

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
  const topCode = v.live.find(c => c.reward);
  const top = topCode?.reward.replace(/[.!]+$/, '');
  const lead = `${plural(n, `working ${v.g.name} code`)} for ${v.month}`;
  const parts = [
    n === 1 && top ? `${lead}: ${topCode.code} gives ${top}.` : `${lead}${top ? `, including ${top}` : ''}.`,
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

// The person behind the site: bylines, the Article author, the author page.
const AUTHOR = site.author;
const PERSON = {
  '@type': 'Person', name: AUTHOR.name, url: site.url + authorPath(site),
  image: `${site.url}/img/${AUTHOR.image}`,
  sameAs: [AUTHOR.youtube, AUTHOR.roblox],
};
const ORG = { '@type': 'Organization', name: site.siteName, url: site.url + '/', logo: { '@type': 'ImageObject', url: `${site.url}/logo-512.png`, width: 512, height: 512 } };

// images: copy only what published pages use, plus a 128px icon for cards
for (const v of views) {
  for (const f of [v.g.icon, v.g.thumb, v.g.redeemImage, ...(v.g.redeemShots ?? []).map(x => x.file)]) {
    if (f) copy(path.join(IMAGES_DIR, f), `img/${f}`);
  }
  if (v.g.icon) write(v.icon.slice(1), await sharp(path.join(IMAGES_DIR, v.g.icon)).resize(128, 128).webp({ quality: 80 }).toBuffer());
}

// author avatar, full size for the author page and 64px for bylines
copy(path.join(IMAGES_DIR, AUTHOR.image), `img/${AUTHOR.image}`);
write(`img/${AUTHOR.image.replace(/.webp$/, '-64.webp')}`, await sharp(path.join(IMAGES_DIR, AUTHOR.image)).resize(64, 64).webp({ quality: 85 }).toBuffer());

// OG images, cached on disk by their inputs so local rebuilds stay fast
fs.mkdirSync(path.join(CACHE, 'og'), { recursive: true });
async function og(key, opts, rel) {
  const bg = opts.background && fs.existsSync(opts.background) ? fs.statSync(opts.background).mtimeMs : 0;
  const id = hash(JSON.stringify({ ...opts, bg, v: 6 }));
  const cached = path.join(CACHE, 'og', `${key}-${id}.jpg`);
  if (!fs.existsSync(cached)) {
    for (const old of fs.readdirSync(path.join(CACHE, 'og')).filter(f => f.startsWith(`${key}-`))) fs.rmSync(path.join(CACHE, 'og', old));
    await ogImage({ ...opts, out: cached });
  }
  copy(cached, rel);
}

// ---------------------------------------------------------------- guides (loaded before game pages, which link to them)

// Articles: code guides in data/guides (/guides/...) and dev-blog posts in
// data/blog (/blog/...). Same Markdown format; pictures live in data/images/guides.
const GUIDE_IMAGES = path.join(IMAGES_DIR, 'guides');
if (fs.existsSync(GUIDE_IMAGES)) for (const f of fs.readdirSync(GUIDE_IMAGES)) copy(path.join(GUIDE_IMAGES, f), `img/guides/${f}`);
const thumbOf = new Map(views.map(v => [v.g.slug, v.thumb]));
function loadArticles(section) {
  const dir = path.join(ROOT, 'data', section);
  return (fs.existsSync(dir) ? fs.readdirSync(dir) : [])
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8'));
      const r = renderMarkdown(body);
      const slug = f.replace(/\.md$/, '');
      const list = k => (meta[k] ?? '').split(',').map(s => s.trim()).filter(Boolean);
      const games = list('games');
      return {
        slug, section, path: `/${section}/${slug}/`, ...meta,
        updated: meta.updated ?? meta.published, published: meta.published,
        games, order: Number(meta.order ?? 99),
        // card picture: the article's own image, else the first game's thumbnail
        cover: meta.image ? `/img/guides/${meta.image}` : thumbOf.get(meta.cover ?? games[0]) ?? null,
        onGamePages: meta.onGamePages === 'true', draft: meta.draft === 'true',
        html: r.html, headings: r.headings, words: r.words, minutes: Math.max(2, Math.round(r.words / 220)),
      };
    })
    .filter(gd => !gd.draft && gd.title && gd.description && gd.published)
    // scheduled: an article with a future "published" date stays hidden until that day
    .filter(gd => Date.parse(gd.published) <= NOW);
}
const guides = loadArticles('guides').sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
const posts = loadArticles('blog').sort((a, b) => a.order - b.order || a.published.localeCompare(b.published)); // devlogs read in order: 1, 2, 3...
const gameGuides = guides.filter(gd => gd.onGamePages).slice(0, 3);
site.hasGuides = guides.length > 0;
site.hasBlog = posts.length > 0;

const lastCheck = all.reduce((m, g) => (g.lastChecked > m ? g.lastChecked : m), '');
const totalCodes = views.reduce((n, v) => n + v.live.length, 0);
const pages = []; // { path, lastmod }

for (const v of views) {
  const g = v.g;
  await og(g.slug, {
    background: g.thumb ? path.join(IMAGES_DIR, g.thumb) : null,
    title: g.name, kicker: 'CODES',
    sub: `${plural(v.live.length, 'working code')} · ${v.month}`,
  }, `og/${g.slug}.jpg`);

  const url = site.url + v.path;
  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: v.h1,
      description: gameDescription(v),
      image: [`${site.url}${v.og}`],
      datePublished: g.published ?? g.added,
      dateModified: g.lastChanged,
      author: PERSON, publisher: ORG,
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
    ads: true,
    body: gameBody({ site, v, related: related(v), guides: gameGuides, total: views.length }),
  }));
  pages.push({ path: v.path, lastmod: g.lastChanged });
}

// ---------------------------------------------------------------- home

await og('default', { background: null, title: 'Working Roblox codes, checked every few hours', kicker: 'CODES', sub: `${plural(views.length, 'game')} · updated all day` }, 'og/default.jpg');
const homeLastmod = views[0]?.g.lastChanged ?? new Date().toISOString();
write('index.html', layout({
  site, assets, path: '/',
  title: `${site.siteName} - Working Roblox Codes, Checked Every Few Hours`.length <= 60
    ? `${site.siteName} - Working Roblox Codes, Checked Every Few Hours` : `${site.siteName} - Working Roblox Codes`,
  description: clip(`Working codes for ${views.length} Roblox games, read from each game's official page every few hours and approved by hand, with rewards and redeem steps.`, 155),
  preload: views.slice(0, 1).map(v => v.icon),
  jsonld: [{
    '@context': 'https://schema.org', '@type': 'WebSite', name: site.siteName, url: site.url + '/',
    description: site.description,
    publisher: ORG,
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
  }],
  ads: true,
  nav: 'games',
  body: homeBody({ site, views, guides, posts, lastCheck: lastCheck || new Date().toISOString(), totalCodes }),
}));
pages.unshift({ path: '/', lastmod: homeLastmod });

// ---------------------------------------------------------------- guide and blog pages

const byslug = new Map(views.map(v => [v.g.slug, v]));
const SECTIONS = {
  guides: { name: 'Guides', kicker: 'GUIDE', list: guides },
  blog: { name: 'Blog', kicker: 'DEVLOG', list: posts },
};
for (const [key, sec] of Object.entries(SECTIONS)) {
  for (const gd of sec.list) {
    const url = site.url + gd.path;
    const cover = gd.image ? path.join(GUIDE_IMAGES, gd.image) : gd.cover ? path.join(IMAGES_DIR, gd.cover.replace(/^\/img\//, '')) : null;
    await og(`${key === 'blog' ? 'blog' : 'guide'}-${gd.slug}`, { background: cover, title: gd.short ?? gd.title, kicker: sec.kicker, sub: `By ${AUTHOR.name} · ${gd.minutes} min read` }, `og/${key === 'blog' ? 'blog' : 'guide'}-${gd.slug}.jpg`);
    const ogUrl = `${site.url}/og/${key === 'blog' ? 'blog' : 'guide'}-${gd.slug}.jpg`;
    const related = sec.list.filter(o => o !== gd);
    write(`${key}/${gd.slug}/index.html`, layout({
      site, assets, path: gd.path,
      title: gd.seoTitle ?? gd.title, description: gd.description,
      ogImage: ogUrl, ogType: 'article',
      preload: gd.image ? [`/img/guides/${gd.image}`] : [],
      jsonld: [
        {
          '@context': 'https://schema.org', '@type': key === 'blog' ? 'BlogPosting' : 'Article',
          headline: gd.title, description: gd.description,
          image: [gd.image ? `${site.url}/img/guides/${gd.image}` : ogUrl],
          datePublished: gd.published, dateModified: gd.updated,
          author: PERSON, publisher: ORG,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        },
        {
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: site.url + '/' },
            { '@type': 'ListItem', position: 2, name: sec.name, item: `${site.url}/${key}/` },
            { '@type': 'ListItem', position: 3, name: gd.short ?? gd.title, item: url },
          ],
        },
      ],
      ads: true,
      nav: key,
      body: guideBody({
        site, gd, section: sec.name,
        games: gd.games.map(s => byslug.get(s)).filter(Boolean).slice(0, 6),
        // same series first, then the rest
        more: [...related.filter(o => o.series && o.series === gd.series), ...related.filter(o => !o.series || o.series !== gd.series)].slice(0, 3),
      }),
    }));
    pages.push({ path: gd.path, lastmod: new Date(gd.updated).toISOString() });
  }
}
if (guides.length) {
  write('guides/index.html', layout({
    site, assets, path: '/guides/',
    title: `Roblox Codes Guides - ${site.siteName}`,
    description: clip(`Guides to Roblox game codes: how to redeem them on every device, why codes fail and how to avoid scams, plus guides to +1 Nose to Escape.`, 155),
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Roblox codes guides', url: site.url + '/guides/',
      hasPart: guides.map(gd => ({ '@type': 'Article', headline: gd.title, url: site.url + gd.path })),
    }],
    nav: 'guides',
    body: guidesIndexBody({ site, guides }),
  }));
  pages.push({ path: '/guides/', lastmod: new Date(guides.map(g => g.updated).sort().pop()).toISOString() });
}
if (posts.length) {
  write('blog/index.html', layout({
    site, assets, path: '/blog/',
    title: `Dev Blog: Making +1 Nose to Escape - ${site.siteName}`,
    description: clip(`${AUTHOR.name}'s dev blog about making the Roblox game +1 Nose to Escape: what I built, what testing changed, and how the thumbnail and trailer were made.`, 155),
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'Blog', name: `${site.siteName} dev blog`, url: site.url + '/blog/',
      author: PERSON,
      blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: site.url + p.path, datePublished: p.published })),
    }],
    nav: 'blog',
    body: blogIndexBody({ site, posts }),
  }));
  pages.push({ path: '/blog/', lastmod: new Date(posts.map(g => g.updated).sort().pop()).toISOString() });
}

// ---------------------------------------------------------------- code updates
{
  const list = updateDays;
  if (list.length) {
    write('updates/index.html', layout({
      site, assets, path: '/updates/',
      title: `Roblox Code Updates: New and Expired Codes - ${site.siteName}`.length <= 60
        ? `Roblox Code Updates: New and Expired Codes - ${site.siteName}` : 'Roblox Code Updates: New and Expired Codes',
      description: clip(`Every Roblox code added to or removed from ${site.siteName}, day by day, across ${views.length} games. See what's new since your last visit.`, 155),
      jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Roblox code updates', url: site.url + '/updates/', dateModified: list[0].day }],
      nav: 'updates',
      body: updatesBody({ site, list }),
    }));
    pages.push({ path: '/updates/', lastmod: new Date(list[0].day).toISOString() });
  }
}

// ---------------------------------------------------------------- static pages

const STATIC_LASTMOD = '2026-09-29T00:00:00Z';
for (const [slug, h1, title, description, html] of [
  ['about', `About ${site.siteName}`, `About ${site.siteName}`, `How ${site.siteName} finds, checks and expires Roblox codes: official game pages read every few hours, and every new code reviewed by a person.`, about(site)],
  ['how-we-check-codes', 'How I check codes', `How I Check Roblox Codes - ${site.siteName}`, `Exactly how ${site.siteName} finds Roblox codes, approves each one by hand, and what "working" and "no longer listed" mean on this site.`, method(site)],
  ['contact', 'Contact', `Contact - ${site.siteName}`, `Report a code that doesn't work, a missing reward, or a Roblox game you want ${site.siteName} to cover.`, contact(site)],
  ['terms', 'Terms of Use', `Terms of Use - ${site.siteName}`, `The terms for using ${site.siteName}: codes are controlled by each game's developers, how to stay safe from scams, and trademarks.`, terms(site, site.privacyUpdated)],
  ['privacy', 'Privacy Policy', `Privacy Policy - ${site.siteName}`, `What ${site.siteName} collects, how Google Analytics and AdSense cookies are used, and how to opt out.`, privacy(site, site.privacyUpdated)],
]) {
  write(`${slug}/index.html`, layout({ site, assets, path: `/${slug}/`, title, description, nav: slug, body: staticBody(h1, html) }));
  pages.push({ path: `/${slug}/`, lastmod: STATIC_LASTMOD });
}

// author page
{
  const p = authorPath(site);
  write(`${p.slice(1)}index.html`, layout({
    site, assets, path: p,
    title: `${AUTHOR.name} - ${site.siteName}`,
    description: clip(`${AUTHOR.name} runs ${site.siteName}: a Roblox player since ${AUTHOR.robloxSince} and YouTube creator who approves every code and writes the redeem guides.`, 155),
    ogType: 'profile',
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'ProfilePage',
      dateModified: STATIC_LASTMOD,
      mainEntity: { ...PERSON, description: `Roblox player since ${AUTHOR.robloxSince} and YouTube creator. Runs ${site.siteName}.` },
    }],
    body: authorBody({ site, views }),
  }));
  pages.push({ path: p, lastmod: STATIC_LASTMOD });
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
