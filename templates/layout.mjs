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
<script>gtag('js',new Date());gtag('config','${esc(id)}');</script>`;
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

export function layout({ site, assets, title, description, path, body, jsonld = [], ogImage, ogType = 'website', noindex = false, preload = [], ads = false }) {
  const guidesNav = site.hasGuides ? '<a href="/guides/">Guides</a>' : '';
  const url = site.url + path;
  const og = ogImage ?? `${site.url}/og/default.jpg`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="#f6f7f9" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0a0e0e" media="(prefers-color-scheme: dark)">
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
<link rel="preload" href="/fonts/jakarta-latin.woff2" as="font" type="font/woff2" crossorigin>
${preload.map(p => `<link rel="preload" href="${esc(p)}" as="image" fetchpriority="high">`).join('\n')}
<link rel="stylesheet" href="${assets.css}">
${THEME_BOOT}
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
${consentDefaults(site)}
${analytics(site.analyticsId)}
${ads ? adsense(site.adsense?.client) : ''}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="logo" href="/" aria-label="${esc(site.siteName)} home">${ICONS.logo()}<span>RBXCodes<b>HQ</b></span></a>
    <nav aria-label="Main">
      <a href="/#games" class="hide-sm">All games</a>
      ${guidesNav}
      <a href="/about/" class="hide-sm">About</a>
      <button class="theme-toggle" type="button" aria-label="Switch light or dark theme">${ICONS.moon}${ICONS.sun}</button>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <nav aria-label="Footer">
      <a href="/">Home</a>
      ${guidesNav}
      <a href="/how-we-check-codes/">How I check codes</a>
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
    </nav>
    <p>${esc(site.siteName)} is a fan site and is not affiliated with Roblox Corporation.</p>
    <p>© ${new Date().getUTCFullYear()} ${esc(site.siteName)}</p>
  </div>
</footer>
<script src="${assets.js}" defer></script>
</body>
</html>
`;
}
