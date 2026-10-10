import { esc, ICONS } from './helpers.mjs';

// The saved theme is applied before first paint so the page never flashes.
const THEME_BOOT = `<script>try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}</script>`;

// Consent mode v2: storage is denied by default for the EEA, UK and
// Switzerland until Google's consent message (set up in AdSense > Privacy &
// messaging) records a choice. Everywhere else it runs as normal. Until then
// the site's own cookie banner (app.js) can grant analytics only; a saved "yes"
// is re-applied here, before the analytics tag runs.
const EEA = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','GB','CH'];
function consentDefaults(site) {
  if (!site.analyticsId && !site.adsense?.client) return '';
  return `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:${JSON.stringify(EEA)}});try{if(localStorage.getItem('consent')==='granted')gtag('consent','update',{analytics_storage:'granted'})}catch(e){}</script>`;
}

function analytics(id) {
  if (!id) return '';
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(id)}"></script>
<script>gtag('js',new Date());gtag('config','${esc(id)}',{allow_google_signals:false,allow_ad_personalization_signals:false});</script>`;
}

function adsense(client) {
  if (!client) return '';
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(client)}" crossorigin="anonymous"></script>`;
}

// One ad slot with its space reserved (see .ad-slot in style.css). Renders
// nothing until AdSense is configured in data/settings.json.
export function adSlot(site, name) {
  const client = site.adsense?.client;
  const slot = site.adsense?.slots?.[name];
  if (!client || !slot) return '';
  return `<div class="ad-slot"><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(client)}" data-ad-slot="${esc(slot)}" data-ad-format="auto" data-full-width-responsive="true"${site.adsense?.childTreatment ? ` data-tag-for-age-treatment="${Number(site.adsense.childTreatment)}"` : ''}></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
}


export function layout({ site, assets, title, description, path, body, jsonld = [], ogImage, ogType = 'website', noindex = false, preload = [], ads = false, nav = '', modified }) {
  // publish / last-change dates, from the page's structured data when it has them
  const published = jsonld.map(o => o.datePublished).find(Boolean);
  modified ??= jsonld.map(o => o.dateModified).find(Boolean);
  const url = site.url + path;
  const og = ogImage ?? `${site.url}/og/default.jpg`;
  const a = site.author;
  const cur = key => (nav === key ? ' aria-current="page"' : '');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="#faf6ee" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1b1815" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${ogType}">
${published ? `<meta property="article:published_time" content="${esc(published)}">
` : ''}${modified ? `<meta property="article:modified_time" content="${esc(modified)}">
` : ''}
<meta property="og:site_name" content="${esc(site.siteName)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/fraunces-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/jakarta-latin.woff2" as="font" type="font/woff2" crossorigin>
${preload.map(p => `<link rel="preload" href="${esc(p)}" as="image" fetchpriority="high">`).join('\n')}
<link rel="stylesheet" href="${assets.css}">
${THEME_BOOT}
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
${consentDefaults(site)}
${analytics(site.analyticsId)}
${site.vercelAnalytics ? '<script defer src="/_vercel/insights/script.js"></script>' : ''}
${ads ? adsense(site.adsense?.client) : ''}
</head>
<body id="top">
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <div class="wrap">
    <a class="brand" href="/" aria-label="${esc(site.siteName)} home"><img class="mark" src="/logo-64.png" alt="${esc(site.siteName)} logo" width="32" height="32"><span>RBXCodes<b>HQ</b></span></a>
    <nav class="nav" aria-label="Main">
      <div class="nav-links" id="nav-links">
        <a href="/#games"${cur('games')}>Games</a>
        ${site.hasGuides ? `<a href="/guides/"${cur('guides')}>Guides</a>` : ''}
        <a href="/tools/"${cur('tools')}>Tools</a>
        ${site.hasUpdates ? `<a href="/updates/"${cur('updates')}>Updates</a>` : ''}
        ${site.hasBlog ? `<a href="/blog/"${cur('blog')}>Blog</a>` : ''}
        <a href="/about/"${cur('about')}>About</a>
        <a href="/contact/"${cur('contact')}>Contact</a>
      </div>
      <a class="nav-search" href="/#q" aria-label="Search games and codes">${ICONS.search}</a><button class="theme-toggle" type="button" aria-label="Dark theme" aria-pressed="false">${ICONS.moon}${ICONS.sun}</button>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-links"><span class="bars" aria-hidden="true"></span>Menu</button>
    </nav>
  </div>
</header>
<main id="main" class="wrap">
${body}
</main>
<p id="live" class="sr-only" role="status" aria-live="polite"></p>
<footer class="foot">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="brand" href="/"><img class="mark" src="/logo-64.png" alt="${esc(site.siteName)} logo" width="32" height="32" loading="lazy"><span>RBXCodes<b>HQ</b></span></a>
      <p class="foot-tag">Working Roblox codes, checked every 3 hours</p>
      <p>Free codes for ${site.gameCount ?? 'your favourite'} Roblox games, with where to type them and what they give. Made by <a href="/author/${esc(a.slug)}/">${esc(a.name)}</a>, a Roblox player since ${esc(a.robloxSince)}.</p>
      <p class="foot-social">
        <a href="${esc(a.youtube)}" rel="noopener" target="_blank" aria-label="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15V9l5.9 3z"/></svg></a>
        ${a.roblox ? `<a href="${esc(a.roblox)}" rel="noopener" target="_blank" aria-label="Roblox profile"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.2 1 1 18.8 18.8 23 23 5.2zm8.3 14.5-5-1.2 1.2-5 5 1.2z"/></svg></a>` : ''}
        ${a.discord ? `<a href="${esc(a.discord)}" rel="noopener" target="_blank" aria-label="Discord"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.3a18 18 0 0 0-5.6 0L8.6 3a19.6 19.6 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18.1a19.8 19.8 0 0 0 6 3l1.3-2a12.8 12.8 0 0 1-2-1l.5-.4a14 14 0 0 0 12.2 0l.5.4-2 1 1.3 2a19.7 19.7 0 0 0 6-3c.5-5.2-.8-9.7-3.6-13.7zM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4z"/></svg></a>` : ''}
        <a href="/contact/" aria-label="Email"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg></a>
      </p>
    </div>
    <nav class="foot-col" aria-labelledby="fc-games"><h2 id="fc-games">Popular codes</h2>
      ${(site.footerGames ?? []).map(g => `<a href="${g.path}">${esc(g.name)} codes</a>`).join('\n      ')}
      <a href="/#games">All games</a>
    </nav>
    <nav class="foot-col" aria-labelledby="fc-read"><h2 id="fc-read">Guides and news</h2>
      ${site.hasGuides ? '<a href="/guides/">All guides</a>' : ''}
      <a href="/guides/how-to-redeem-roblox-codes/">How to redeem codes</a>
      <a href="/guides/roblox-code-not-working/">Code not working?</a>
      ${site.hasBlog ? '<a href="/blog/">Blog</a>' : ''}
      ${site.hasUpdates ? '<a href="/updates/">Code updates</a>' : ''}
      <a href="/tools/devex-calculator/">DevEx calculator</a>
    </nav>
    <nav class="foot-col" aria-labelledby="fc-site"><h2 id="fc-site">Site</h2>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
      <a href="/how-we-check-codes/">How I check codes</a>
      <a href="/author/${esc(a.slug)}/">About the author</a>
    </nav>
  </div>
  <div class="wrap foot-bar">
    <p>© ${new Date().getFullYear()} ${esc(site.siteName)}. A fan site, not made by or connected to Roblox Corporation.</p>
    <nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/disclaimer/">Disclaimer</a>${site.analyticsId ? '<button type="button" class="cookie-open">Cookie settings</button>' : ''}<a href="#top">Back to top ↑</a></nav>
  </div>
</footer>
<a class="to-top" href="#top" aria-label="Back to top" hidden><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></a>
<script src="${assets.js}" defer></script>
</body>
</html>
`;
}
