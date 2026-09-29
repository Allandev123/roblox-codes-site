import { esc, ICONS } from './helpers.mjs';

// The saved theme is applied before first paint so the page never flashes.
const THEME_BOOT = `<script>try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}</script>`;

// Consent mode v2: storage is denied by default for the EEA, UK and
// Switzerland until Google's consent message (set up in AdSense > Privacy &
// messaging) records a choice. Everywhere else it runs as normal.
const EEA = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','GB','CH'];
function consentDefaults(site) {
  if (!site.analyticsId && !site.adsense?.client) return '';
  return `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:${JSON.stringify(EEA)}});</script>`;
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


export function layout({ site, assets, title, description, path, body, jsonld = [], ogImage, ogType = 'website', noindex = false, preload = [], ads = false, nav = '' }) {
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
${ads ? adsense(site.adsense?.client) : ''}
</head>
<body id="top">
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <div class="wrap">
    <a class="brand" href="/" aria-label="${esc(site.siteName)} home"><img class="mark" src="/logo-64.png" alt="" width="32" height="32"><span>RBXCodes<b>HQ</b></span></a>
    <nav class="nav" aria-label="Main">
      <div class="nav-links" id="nav-links">
        <a href="/#games"${cur('games')}>Games</a>
        ${site.hasGuides ? `<a href="/guides/"${cur('guides')}>Guides</a>` : ''}
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
  <div class="wrap">
    <p class="sig"><img src="/img/${esc(a.image.replace(/\.webp$/, '-64.webp'))}" alt="" width="44" height="44" loading="lazy">
      <span>Made by <a href="/author/${esc(a.slug)}/">${esc(a.firstName)}</a>, a Roblox player since ${esc(a.robloxSince)}. Say hi on <a href="${esc(a.youtube)}" rel="noopener">YouTube</a>.</span></p>
    <nav aria-label="Footer">
      <a href="/#games">All games</a>
      ${site.hasGuides ? '<a href="/guides/">Guides</a>' : ''}
      ${site.hasUpdates ? '<a href="/updates/">Code updates</a>' : ''}
      ${site.hasBlog ? '<a href="/blog/">Dev blog</a>' : ''}
      <a href="/how-we-check-codes/">How I check codes</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
    </nav>
    <p class="fine">${esc(site.siteName)} is a fan site. It isn't made by, or connected to, Roblox Corporation.</p>
  </div>
</footer>
<a class="to-top" href="#top" aria-label="Back to top" hidden><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></a>
<script src="${assets.js}" defer></script>
</body>
</html>
`;
}
