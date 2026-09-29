import { esc, ago, plural, fmtNum, compact, dateLong, dateShort, numberWord, searchKey, ICONS } from './helpers.mjs';
import { adSlot } from './layout.mjs';

export const authorPath = site => `/author/${site.author.slug}/`;
const avatar64 = site => `/img/${site.author.image.replace(/\.webp$/, '-64.webp')}`;
export const byName = (a, b) => a.g.name.localeCompare(b.g.name, 'en', { sensitivity: 'base', ignorePunctuation: true });

// ---------------------------------------------------------------- lists

// One row in a game list (home A-Z, related games, author page, 404).
export function gameRow(v, { lazy = true } = {}) {
  const alias = v.g.aliases?.length ? ` data-alias="${esc(v.g.aliases.join(' ').toLowerCase())}"` : '';
  return `<li><a href="${v.path}" data-name="${esc(searchKey(v.g.name.replace(/\+/g, ' plus ')))}" data-latest="${v.latest}"${alias}>
  <img src="${v.icon}" alt="" width="40" height="40"${lazy ? ' loading="lazy" decoding="async"' : ''}>
  <span class="name">${esc(v.g.name)}${v.recentNew ? '<span class="tag">new</span>' : ''}</span>
  <span class="n">${plural(v.live.length, 'code')}</span>
</a></li>`;
}

function updateRow(v) {
  const sub = v.recentNew
    ? `<strong>${v.recentNew} new</strong> ${v.recentNew === 1 ? 'code' : 'codes'} · ${ago(v.g.lastChanged, true)}`
    : `${plural(v.live.length, 'working code')} · updated ${ago(v.g.lastChanged, true)}`;
  return `<li><a href="${v.path}">
  <img src="${v.icon}" alt="" width="48" height="48">
  <span class="t"><b>${esc(v.g.name)}</b><span class="sub">${sub}</span></span>
  ${ICONS.chev}
</a></li>`;
}

export function guideRow(gd) {
  return `<li><a href="${gd.path}"><h3>${esc(gd.title)}</h3><p>${esc(gd.summary)}</p></a></li>`;
}

// ---------------------------------------------------------------- home

// A game tile for the home grid: big icon, name, code count.
function gameTile(v, { lazy = true } = {}) {
  const alias = v.g.aliases?.length ? ` data-alias="${esc(v.g.aliases.join(' ').toLowerCase())}"` : '';
  return `<li><a class="tile" href="${v.path}" data-name="${esc(searchKey(v.g.name.replace(/\+/g, ' plus ')))}" data-latest="${v.latest}"${alias}>
  <img src="${v.iconLg}" alt="" width="160" height="160"${lazy ? ' loading="lazy" decoding="async"' : ''}>
  <span class="name">${esc(v.g.name)}</span>
  <span class="n">${plural(v.live.length, 'code')}${v.recentNew ? ' <span class="tag">new</span>' : ''}</span>
</a></li>`;
}

export function homeBody({ site, views, guides = [], posts = [], lastCheck }) {
  const a = site.author;
  const byPlayers = [...views].sort((x, y) => (y.g.stats?.playing ?? 0) - (x.g.stats?.playing ?? 0));
  const recent = views.slice(0, 6);
  const total = views.reduce((n, v) => n + v.live.length, 0);
  // newest codes across every game, one line each, biggest games first on a tie
  const playing = v => v.g.stats?.playing ?? 0;
  const newest = views.flatMap(v => v.live.map(c => ({ v, c })))
    .sort((x, y) => (y.c.firstSeen > x.c.firstSeen ? 1 : y.c.firstSeen < x.c.firstSeen ? -1 : playing(y.v) - playing(x.v)))
    .filter((x, i, all) => all.slice(0, i).filter(y => y.v === x.v).length < 2)
    .slice(0, 10);
  return `<section class="hub-head">
  <h1>Roblox Codes</h1>
  <p class="sub">${total} working codes for ${views.length} games · checked ${ago(lastCheck)}</p>
  <form class="search" role="search" action="/" method="get">
    <label for="q" class="sr-only">Search a game</label>
    <div class="field">${ICONS.search}<input id="q" name="q" type="search" placeholder="Search a game..." autocomplete="off" enterkeyhint="search" aria-describedby="games-count" aria-keyshortcuts="/"></div>
    <p class="count" id="games-count"></p>
  </form>
</section>

<section id="mine" class="sec" hidden aria-labelledby="mine-h">
  <div class="sec-head"><h2 id="mine-h">Your games</h2></div>
  <ul class="mine"></ul>
</section>

<section id="recent" class="sec" aria-labelledby="recent-h">
  <div class="sec-head"><h2 id="recent-h">Just updated</h2></div>
  <ul class="tiles small">
${recent.map(v => gameTile(v, { lazy: false }).replace('class="tile"', 'class="tile" data-skip')).join('\n')}
  </ul>
</section>

<section id="newest" class="sec" aria-labelledby="newest-h">
  <div class="sec-head"><h2 id="newest-h">Newest codes</h2><span class="aside">Tap a code to copy it</span></div>
  <ul class="feed codes">
${newest.map(({ v, c }) => `    <li>
      <a class="feed-game" href="${v.path}"><img src="${v.icon}" alt="" width="40" height="40" loading="lazy">${esc(v.g.name)}</a>
      <code class="code">${esc(c.code)}</code>
      <span class="feed-reward">${c.reward ? esc(c.reward) : 'Reward not stated'}</span>
      <button class="copy" type="button" data-code="${esc(c.code)}" aria-label="Copy code ${esc(c.code)} for ${esc(v.g.name)}">${ICONS.check}<span>Copy</span></button>
    </li>`).join('\n')}
  </ul>
</section>

<section id="games" class="sec" aria-labelledby="games-h">
  <div class="sec-head"><h2 id="games-h">All games</h2><span class="aside">Most played first</span></div>
  <ul class="tiles all">
${byPlayers.map((v, i) => gameTile(v, { lazy: i > 11 })).join('\n')}
  </ul>
  <div class="empty" id="no-results" hidden>
    <p>That game isn't on the site yet. <a href="/contact/">Tell me which one</a> and I'll look for its codes.</p>
    <button type="button" class="btn" id="clear-q">Clear search</button>
  </div>
</section>

${guides.length ? `<section id="guides" class="sec" aria-labelledby="guides-h">
  <div class="sec-head"><h2 id="guides-h">Help with codes</h2><a class="aside" href="/guides/">All guides</a></div>
  <ul class="guide-cards">
${guides.slice(0, 4).map(gd => `    <li><a href="${gd.path}"><b>${esc(gd.short ?? gd.title)}</b><span>${esc(gd.summary)}</span></a></li>`).join('\n')}
  </ul>
</section>` : ''}

${posts.length ? `<section id="blog" class="sec" aria-labelledby="blog-h">
  <div class="sec-head"><h2 id="blog-h">From my dev blog</h2><a class="aside" href="/blog/">All posts</a></div>
  <ul class="cards">
${posts.slice(0, 3).map(p => articleCard(p, { date: true })).join('\n')}
  </ul>
</section>` : ''}

<section id="how" class="sec run-by">
  <img src="/img/${esc(a.image)}" alt="" width="56" height="56" loading="lazy">
  <p>Run by <a href="/author/${esc(a.slug)}/">${esc(a.name)}</a>, a Roblox YouTuber who's also making a game, <a href="/guides/plus-1-nose-to-escape/">+1 Nose to Escape</a>. A program reads each game's Roblox page every 3 hours and I approve every new code by hand. Nobody needs your password, and free Robux codes don't exist. <a href="/how-we-check-codes/">How I check codes</a></p>
</section>`;
}

// ---------------------------------------------------------------- game

function codeRow(c, isNew) {
  return `<li class="code-row">
  <div class="code-main">
    <code class="code">${esc(c.code)}</code>${isNew ? '<span class="tag">new<span class="sr-only"> code</span></span>' : ''}
    <p class="code-meta"><span class="reward">${c.reward ? esc(c.reward) : 'Reward not stated by the developer'}</span>${c.where ? `<span class="where"> · ${esc(c.where)}</span>` : ''}<span class="added"> · added ${dateShort(c.firstSeen)}</span></p>
  </div>
  <button class="copy" type="button" data-code="${esc(c.code)}" aria-label="Copy code ${esc(c.code)}">${ICONS.check}<span>Copy</span></button>
</li>`;
}

function dek(v) {
  const n = v.live.length;
  const lists = v.live.every(c => c.source === 'manual') ? 'The developers have posted' : 'The game lists';
  const top = v.live.find(c => c.reward);
  if (n === 1) {
    const c = v.live[0];
    return `${lists} one working code right now: <strong>${esc(c.code)}</strong>${c.reward ? `, for ${esc(c.reward)}` : ''}.`;
  }
  return `${lists} ${numberWord(n)} working codes right now.${top ? ` Start with <strong>${esc(top.code)}</strong> for ${esc(top.reward)}.` : ''}`;
}

export function gameBody({ site, v, related, guides = [], total }) {
  const g = v.g;
  const a = site.author;
  const fromDesc = v.live.filter(c => c.source === 'description').length;
  const manual = v.live.length - fromDesc;
  const one = v.live.length === 1;
  const source = [
    fromDesc ? `${one ? 'From' : fromDesc === v.live.length ? 'All from' : `${fromDesc} from`} the game's Roblox page` : '',
    manual ? `${manual === v.live.length ? (one ? 'Posted' : 'All posted') : `${manual} posted`} outside Roblox, so each one is checked against at least two up-to-date sources` : '',
  ].filter(Boolean).join('; ');
  const stats = g.stats ?? {};
  const notWorking = guides.find(gd => gd.slug === 'roblox-code-not-working');

  return `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">${esc(g.name)} codes</li></ol></nav>
<header>
  <div class="post-head">
    <h1>${esc(v.h1)}</h1>
    <img src="${v.iconLg}" alt="" width="80" height="80">
  </div>
  <p class="dek">${dek(v)}</p>
  <p class="byline"><img src="${avatar64(site)}" alt="" width="36" height="36"><span>By <a href="${authorPath(site)}" rel="author">${esc(a.name)}</a> · ${v.live.every(c => c.source === 'manual') ? `codes updated ${ago(g.lastChanged)}` : `checked ${ago(g.lastChecked)}`} · <a href="/how-we-check-codes/">how I check</a></span></p>
</header>

<section class="sec" aria-labelledby="codes-h">
  <div class="sec-head"><h2 id="codes-h">Working codes</h2><span class="aside">${plural(v.live.length, 'code')}</span></div>
  <ul class="ruled codes" data-latest="${v.latest}">
${v.live.map(c => codeRow(c, v.isNew(c))).join('\n')}
  </ul>
  <p class="note">${source}. Capital letters matter, so tap Copy.</p>
${g.codeChannels ? `  <p class="note">Where new codes appear: ${esc(g.codeChannels.replace(/\.$/, '').replace(/^The /, 'the '))}.</p>
` : ''}${g.requirement ? `  <p class="req"><strong>Before you redeem:</strong> ${esc(g.requirement)}</p>
` : ''}  <div class="next-step">
    <a class="btn" href="${esc(g.gameUrl)}" rel="noopener" target="_blank">${ICONS.play} Open ${esc(g.name)}<span class="sr-only"> on Roblox (opens in a new tab)</span></a>
    <a class="jump" href="#redeem-h">How to redeem</a>
  </div>
</section>

<section class="sec" aria-labelledby="redeem-h">
  <h2 id="redeem-h">How to redeem ${esc(g.name)} codes</h2>
  <ol class="steps">
${g.redeem.map(s => `    <li>${esc(s)}</li>`).join('\n')}
  </ol>
  <p class="tip">On a phone, tap the game's code box, then press and hold and choose Paste.${notWorking ? ` Code not working? <a href="${notWorking.path}">Here's why</a>.` : ''}${g.checkedInGame ? ` I checked these steps in-game on ${dateLong(g.checkedInGame)}.` : ''}</p>
</section>

${g.faq?.length ? `<section class="sec" aria-labelledby="faq-h">
  <h2 id="faq-h">${esc(g.name)} codes FAQ</h2>
${g.faq.map(f => `  <div class="qa"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('\n')}
</section>` : ''}

${adSlot(site, 'afterRedeem')}

<section class="sec" aria-labelledby="about-h">
  <h2 id="about-h">About ${esc(g.name)}</h2>
  ${v.thumb ? `<figure class="shot"><img src="${v.thumb}" alt="${esc(g.name)} on Roblox" width="768" height="432" loading="lazy" decoding="async"><figcaption>Image: ${esc(g.name)}${g.creator ? ` by ${esc(g.creator)}` : ''} on Roblox</figcaption></figure>` : ''}
  ${g.notes.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join('\n  ')}
  <dl class="facts">
    ${g.creator ? `<div><dt>Made by</dt><dd>${esc(g.creator)}</dd></div>` : ''}
    ${g.subgenre || g.genre ? `<div><dt>Type of game</dt><dd>${esc(g.subgenre || g.genre)}</dd></div>` : ''}
    ${stats.playing ? `<div><dt>Playing at last check</dt><dd>${fmtNum(stats.playing)}</dd></div>` : ''}
    ${stats.visits ? `<div><dt>Visits</dt><dd>${compact(stats.visits)}</dd></div>` : ''}
  </dl>
  <a class="btn" href="${esc(g.gameUrl)}" rel="noopener" target="_blank">Play ${esc(g.name)} on Roblox ${ICONS.ext}<span class="sr-only"> (opens in a new tab)</span></a>
</section>

${g.expired.length ? `<section class="sec">
  <details class="expired">
    <summary><h2>Expired codes</h2><span class="aside">${g.expired.length}</span>${ICONS.down}</summary>
    <ul>
${g.expired.slice(0, 60).map(e => `      <li><code>${esc(e.code)}</code><span>${e.reason === 'expired' ? 'Expired' : 'No longer listed by the game'}${e.removed ? ` · ${dateShort(e.removed)}` : ''}</span></li>`).join('\n')}
    </ul>
  </details>
</section>` : ''}

${v.live.length >= 3 ? adSlot(site, 'inContent') : ''}

${guides.length ? `<section class="sec" aria-labelledby="help-h">
  <h2 id="help-h">Helpful guides</h2>
  <ul class="ruled guides">
${guides.map(gd => `    <li><a href="${gd.path}"><h3>${esc(gd.title)}</h3></a></li>`).join('\n')}
  </ul>
</section>` : ''}

<section class="sec" aria-labelledby="more-h">
  <h2 id="more-h">More games with codes</h2>
  <ul class="ruled games">
${related.map(r => gameRow(r)).join('\n')}
  </ul>
  <a class="more-link" href="/#games">See all ${total} games</a>
</section>

${adSlot(site, 'bottom')}`;
}

// ---------------------------------------------------------------- static pages

export const staticBody = (h1, html) => `<article class="prose"><h1>${esc(h1)}</h1>
${html}
</article>`;

export function notFoundBody(views) {
  const popular = [...views].sort((a, b) => (b.g.stats?.playing ?? 0) - (a.g.stats?.playing ?? 0)).slice(0, 6);
  return `<h1>That page isn't here</h1>
<p class="dek">The game may have been renamed, or the link is wrong. Search for it:</p>
<form class="search" role="search" action="/" method="get">
  <label for="q404" class="sr-only">Search a game</label>
  <div class="field">${ICONS.search}<input id="q404" name="q" type="search" placeholder="Type a game name" autocomplete="off" enterkeyhint="search"></div>
</form>
<section class="sec" aria-labelledby="pop-h">
  <h2 id="pop-h">Popular games</h2>
  <ul class="ruled games">
${popular.map(v => gameRow(v)).join('\n')}
  </ul>
  <a class="more-link" href="/#games">See all ${views.length} games</a>
</section>`;
}

// ---------------------------------------------------------------- author

export function authorBody({ site, views }) {
  const a = site.author;
  return `<article class="prose">
  <header class="author-head">
    <img src="/img/${esc(a.image)}" alt="${esc(a.name)}'s Roblox avatar" width="96" height="96">
    <div>
      <h1>${esc(a.name)}</h1>
      <p>Runs ${esc(site.siteName)} · Roblox player since ${esc(a.robloxSince)} · YouTube creator</p>
    </div>
  </header>
  <p>Hi, I'm ${esc(a.firstName)}. I've played Roblox since ${esc(a.robloxSince)}, and I make Roblox videos on my YouTube channel, <a href="${esc(a.youtube)}" rel="me noopener">${esc(a.name)}</a>, which has ${esc(a.youtubeSubscribers)} subscribers and more than ${Math.floor(a.youtubeVideos / 10) * 10} videos. Most of them are about BedWars — ranked solo queue from Bronze to Nightmare, kit guides and win streaks — plus Rivals and Blade Ball.</p>
  <p>I started ${esc(site.siteName)} because I got tired of code lists full of dead codes. So this site does one thing: it lists the codes a game's developers are giving out right now, what each one gives, and where the code box is in that game.</p>

  <h2>What I do on this site</h2>
  <ul>
    <li>Approve every new code before it appears. A program reads each game's Roblox page every 3 hours, but nothing goes live until I've read the developer's post and confirmed it's a real code.</li>
    <li>Write the redeem steps for each game — where its Codes button actually is — and the short guide about the game.</li>
    <li>Fix mistakes. If a code or a step is wrong, <a href="/contact/">tell me</a> and I'll correct it, usually the same day.</li>
  </ul>
  <p>The whole process is on <a href="/how-we-check-codes/">How I check codes</a>.</p>

  <h2>The game I'm making</h2>
  <p>I'm also building my own Roblox game, <a href="/guides/plus-1-nose-to-escape/">+1 Nose to Escape</a>, where you grow a Pinocchio nose and stretch it across lava. It's in testing now. I've written guides for it with the real numbers from the game, and its codes will be on this site first.</p>

  <h2>Find me elsewhere</h2>
  <ul>
    <li>YouTube: <a href="${esc(a.youtube)}" rel="me noopener">${esc(a.youtube.replace('https://www.', ''))}</a></li>
    <li>Roblox: <a href="${esc(a.roblox)}" rel="me noopener">${esc(a.name)}</a></li>
    <li>My Roblox group: <a href="https://www.roblox.com/communities/16078632" rel="noopener">Group insane</a></li>
  </ul>

  <h2>Games I cover</h2>
</article>
<ul class="ruled games cols">
${[...views].sort(byName).map(v => gameRow(v)).join('\n')}
</ul>`;
}

// ---------------------------------------------------------------- guides and blog

// A picture card for an article (guide or blog post)
export function articleCard(gd, { lazy = true, date = false } = {}) {
  return `<li><a class="card" href="${gd.path}">
    ${gd.cover ? `<img src="${esc(gd.cover)}" alt="" width="640" height="360"${lazy ? ' loading="lazy"' : ''} decoding="async">` : '<span class="card-blank" aria-hidden="true"></span>'}
    <span class="card-text">
      ${gd.series ? `<span class="kicker">${esc(gd.series)}</span>` : ''}
      <h3>${esc(gd.title)}</h3>
      <span class="card-sum">${esc(gd.summary)}</span>
      <span class="card-meta">${date ? `${dateLong(gd.published)} · ` : ''}${gd.minutes} min read</span>
    </span>
  </a></li>`;
}

export function guidesIndexBody({ site, guides }) {
  const groups = new Map();
  for (const gd of guides) {
    const k = gd.series ?? 'Getting codes to work';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(gd);
  }
  let n = 0;
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Guides</li></ol></nav>
<header class="index-head">
<h1>Guides</h1>
<p class="dek">Practical guides for getting Roblox codes to work, plus guides to +1 Nose to Escape, the game I'm making. By <a href="${authorPath(site)}" rel="author">${esc(site.author.name)}</a>.</p>
</header>
${[...groups].map(([name, list]) => `<section class="sec" aria-label="${esc(name)}">
  <div class="sec-head"><h2>${esc(name)}</h2><span class="aside">${plural(list.length, 'guide')}</span></div>
  <ul class="cards">
${list.map(gd => articleCard({ ...gd, series: null }, { lazy: n++ > 2 })).join('\n')}
  </ul>
</section>`).join('\n')}`;
}

export function blogIndexBody({ site, posts }) {
  const a = site.author;
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Blog</li></ol></nav>
<header class="index-head">
<h1>Dev blog</h1>
<p class="dek">I'm making a Roblox game called +1 Nose to Escape. This is where I write about building it: what I tried, what testing changed, and how the thumbnail and trailer got made.</p>
</header>
<div class="run-by sec">
  <img src="/img/${esc(a.image)}" alt="" width="56" height="56">
  <p>Written by <a href="${authorPath(site)}" rel="author">${esc(a.name)}</a>, who plays Roblox, makes YouTube videos about it, and is now building a game. For how the game plays, see the <a href="/guides/plus-1-nose-to-escape/">+1 Nose to Escape guides</a>.</p>
</div>
<ul class="cards sec">
${posts.map((p, i) => articleCard(p, { lazy: i > 2, date: true })).join('\n')}
</ul>`;
}

export function guideBody({ site, gd, games, more, section = 'Guides' }) {
  const toc = gd.headings.filter(h => h.level === 2);
  const base = section === 'Blog' ? '/blog/' : '/guides/';
  const when = section === 'Blog'
    ? `${dateLong(gd.published)}${gd.updated !== gd.published ? ` · updated ${dateShort(gd.updated)}` : ''}`
    : `updated ${dateShort(gd.updated)}`;
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="${base}">${section}</a></li><li aria-current="page">${esc(gd.short ?? gd.title)}</li></ol></nav>
<article class="prose">
  ${gd.series ? `<p class="kicker">${esc(gd.series)}</p>` : ''}
  <h1>${esc(gd.title)}</h1>
  <p class="byline"><img src="${avatar64(site)}" alt="" width="36" height="36"><span>By <a href="${authorPath(site)}" rel="author">${esc(site.author.name)}</a> · ${when} · ${gd.minutes} min read</span></p>
  ${gd.image ? `<figure class="shot lead"><img src="/img/guides/${esc(gd.image)}" alt="${esc(gd.imageAlt ?? '')}" width="1280" height="720" decoding="async" fetchpriority="high"></figure>` : ''}
  ${toc.length >= 4 ? `<nav class="toc" aria-label="On this page"><p>On this page</p><ol>${toc.map(h => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')}</ol></nav>` : ''}
${gd.html}
</article>
${adSlot(site, 'bottom')}
${games.length ? `<section class="sec" aria-labelledby="games-h">
  <h2 id="games-h">Games in this guide</h2>
  <ul class="ruled games">
${games.map(v => gameRow(v)).join('\n')}
  </ul>
</section>` : ''}
${more.length ? `<section class="sec" aria-labelledby="more-guides-h">
  <h2 id="more-guides-h">${section === 'Blog' ? 'More from the blog' : 'More guides'}</h2>
  <ul class="cards">
${more.map(o => articleCard(o, { date: section === 'Blog' })).join('\n')}
  </ul>
</section>` : ''}`;
}
