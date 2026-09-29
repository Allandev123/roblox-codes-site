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

// A magazine-style post row: picture, kicker, title, short intro, byline.
function postRow({ href, img, kicker, title, text, meta, lazy = true }) {
  return `<li><a class="post" href="${href}">
    ${img ? `<img src="${esc(small(img))}" alt="" width="480" height="270"${lazy ? ' loading="lazy"' : ''} decoding="async">` : '<span class="card-blank" aria-hidden="true"></span>'}
    <span class="post-text">
      <span class="kicker">${esc(kicker)}</span>
      <h3>${esc(title)}</h3>
      <span class="post-sum">${esc(text)}</span>
      <span class="post-meta">${meta}</span>
    </span>
  </a></li>`;
}
const firstSentence = t => clipText((t ?? '').split('\n')[0].match(/^.*?[.!?](\s|$)/)?.[0] ?? t ?? '', 170);
const clipText = (t, n) => (t.length <= n ? t.trim() : t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');

// the 480px copy the build makes of every card picture
const small = u => (/^\/img\/.*\.webp$/.test(u ?? '') ? u.replace(/\.webp$/, '-480.webp') : u);

// Home page FAQ. Answers are HTML (they link to other pages).
export const HOME_FAQ = (site, games) => [
  { q: 'Is this site safe to use?', a: `Yes. The site only lists codes, and you type them into the game yourself. It never asks for your Roblox password, there's nothing to download, and there are no sign-ups. If any site asks for your password or a "verification" to give you a code, it's a scam. <a href="/guides/free-robux-codes-scams/">How to spot those scams</a>.` },
  { q: 'How do I redeem a Roblox code?', a: `Open the game, find its Codes button (often a gift, a shop tab or a settings menu), type the code and press Redeem. Every game hides the box somewhere different, so each game page has its own steps, many with my screenshots. <a href="/guides/how-to-redeem/">The full redeem guide</a>.` },
  { q: "Why isn't a code working for me?", a: `Usually it's a typo, the wrong capital letters, a code you already used, or a game that needs you to reach a level or join its group first. Tap Copy to avoid typos. <a href="/guides/roblox-code-not-working/">Every reason and how to fix it</a>. If a listed code is really dead, <a href="/contact/">tell me</a> and I'll move it to expired.` },
  { q: 'How often are the codes updated?', a: `A program reads each game's Roblox page every 3 hours, and I approve every new code by hand before it shows up. Codes that games only post on Discord or X, I add and recheck myself. Codes a game stops listing move to that page's expired list with the date. <a href="/how-we-check-codes/">How I check codes</a>.` },
  { q: 'Are there codes for free Robux?', a: `No. Game codes give items inside that one game, like gems, boosts, spins or pets. Robux only comes from Roblox itself, by buying it or with Roblox gift cards. Any site offering "free Robux codes" is a scam.` },
  { q: 'Do the codes work on phone, tablet and console?', a: `Yes. A game's codes work wherever you can play that game: PC, Mac, phone, tablet or console. The code box is in the same place on every device, you just tap instead of click. On a phone, press and hold the box to paste.` },
  { q: 'Can you add a game I play?', a: `Probably! I cover ${games} games right now and add more every week, as long as the game has working codes. <a href="/contact/">Send me its name or Roblox link</a>.` },
  { q: 'Who runs this site?', a: `Me, <a href="/author/${esc(site.author.slug)}/">${esc(site.author.name)}</a>. I've played Roblox since ${esc(site.author.robloxSince)}, make Roblox videos on <a href="${esc(site.author.youtube)}" rel="noopener">YouTube</a>, and I'm making my own game. It's an independent fan site, not made by or connected to Roblox. <a href="/about/">More about the site</a>.` },
];

export function homeBody({ site, views, guides = [], posts = [], lastCheck }) {
  const a = site.author;
  const byPlayers = [...views].sort((x, y) => (y.g.stats?.playing ?? 0) - (x.g.stats?.playing ?? 0));
  // "Latest": newest game pages, with a guide or blog post every few rows
  const articles = [...posts, ...guides].sort((x, y) => (y.updated ?? '').localeCompare(x.updated ?? ''));
  const feed = [];
  views.slice(0, 12).forEach((v, i) => {
    feed.push({
      href: v.path, img: v.thumb ?? v.iconLg, kicker: 'Roblox codes', title: v.h1,
      text: firstSentence(v.g.notes),
      meta: `${esc(a.name)} · ${dateShort(v.g.lastChanged)} · ${plural(v.live.length, 'working code')}`,
    });
    const art = (i % 4 === 2) && articles.shift();
    if (art) feed.push({ href: art.path, img: art.cover, kicker: art.section === 'blog' ? 'Devlog' : 'Guide', title: art.title, text: art.summary, meta: `${esc(a.name)} · ${art.minutes} min read` });
  });
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
    <label for="q" class="sr-only">Search games or codes</label>
    <div class="field">${ICONS.search}<input id="q" name="q" type="search" placeholder="Search games or codes..." autocomplete="off" enterkeyhint="search" aria-describedby="games-count" aria-keyshortcuts="/" role="combobox" aria-expanded="false" aria-controls="q-list" aria-autocomplete="list">
      <div class="suggest" id="q-pop" hidden></div>
    </div>
    <p class="count" id="games-count"></p>
  </form>
</section>

<section id="mine" class="sec" hidden aria-labelledby="mine-h">
  <div class="sec-head"><h2 id="mine-h">Your games</h2></div>
  <ul class="mine"></ul>
</section>

<div class="mag">
  <section class="mag-main" aria-labelledby="latest-h">
    <div class="sec-head"><h2 id="latest-h">Latest</h2><a class="aside" href="#games">All ${views.length} games</a></div>
    <ul class="posts">
${feed.map((x, i) => postRow({ ...x, lazy: i > 1 })).join('\n')}
    </ul>
  </section>
  <aside class="mag-side" aria-label="More">
    <section class="side-box" aria-labelledby="ru-h">
      <h2 id="ru-h">Recently updated</h2>
      <ul class="side-list">
${views.slice(0, 10).map(v => `        <li><a href="${v.path}"><b>${esc(v.g.name)} Codes (${esc(v.month)})</b><span>Updated ${dateShort(v.g.lastChanged)} · ${plural(v.live.length, 'code')}</span></a></li>`).join('\n')}
      </ul>
    </section>
    <section class="side-box" aria-labelledby="pop-h">
      <h2 id="pop-h">Most played</h2>
      <ol class="side-pop">
${byPlayers.slice(0, 8).map(v => `        <li><a href="${v.path}"><img src="${v.icon}" alt="" width="36" height="36" loading="lazy"><span><b>${esc(v.g.name)}</b><span>${compact(v.g.stats?.playing ?? 0)} playing now</span></span></a></li>`).join('\n')}
      </ol>
    </section>
    ${guides.length ? `<section class="side-box" aria-labelledby="sg-h">
      <h2 id="sg-h">Guides</h2>
      <ul class="side-list">
${guides.slice(0, 5).map(gd => `        <li><a href="${gd.path}"><b>${esc(gd.short ?? gd.title)}</b><span>${gd.minutes} min read</span></a></li>`).join('\n')}
      </ul>
      <a class="side-more" href="/guides/">All guides</a>
    </section>` : ''}
  </aside>
</div>

<section id="newest" class="sec" aria-labelledby="newest-h">
  <div class="sec-head"><h2 id="newest-h">Newest codes</h2>${site.hasUpdates ? '<a class="aside" href="/updates/">All code updates</a>' : ''}</div>
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

<section id="faq" class="sec" aria-labelledby="faq-h">
  <p class="faq-kicker">FAQ</p>
  <h2 id="faq-h">Common questions</h2>
  <p class="faq-sub">Everything people ask about Roblox codes and this site.</p>
  <div class="faq-list">
${HOME_FAQ(site, views.length).map((f, i) => `    <details class="faq"${i === 0 ? ' open' : ''}><summary><h3>${esc(f.q)}</h3><span class="faq-icon" aria-hidden="true"></span></summary><p>${f.a}</p></details>`).join('\n')}
  </div>
</section>

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
    <p class="code-meta"><span class="reward">${c.reward ? esc(c.reward) : 'Reward not stated by the developer'}</span></p>
    <p class="code-sub">${c.where ? `${esc(c.where)} · ` : ''}added ${dateShort(c.firstSeen)}</p>
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
    return `${lists} one working code right now: <strong>${esc(c.code)}</strong>.${c.reward ? ` Reward: ${esc(c.reward.replace(/\.$/, ''))}.` : ''}`;
  }
  return `${lists} ${numberWord(n)} working codes right now.${top ? ` Start with <strong>${esc(top.code)}</strong>. Reward: ${esc(top.reward.replace(/\.$/, ''))}.` : ''}`;
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
  <p class="note">${g.codesNote ? esc(g.codesNote) : `${source}. Capital letters matter, so tap Copy.`}</p>
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
  ${(g.redeemShots ?? []).map(x => `<figure class="shot"><img src="/img/${esc(x.file)}" alt="${esc(x.caption)}" width="1280" height="720" loading="lazy" decoding="async"><figcaption>${esc(x.caption)} My screenshot${g.checkedInGame ? `, ${dateLong(g.checkedInGame)}` : ''}.</figcaption></figure>`).join('')}
  ${g.redeemImage ? `<figure class="shot"><img src="/img/${esc(g.redeemImage)}" alt="${esc(g.redeemCaption ?? `The code box in ${g.name}`)}" width="1280" height="720" loading="lazy" decoding="async"><figcaption>${esc(g.redeemCaption ?? `The code box in ${g.name}.`)} My screenshot${g.checkedInGame ? `, ${dateLong(g.checkedInGame)}` : ''}.</figcaption></figure>` : ''}
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
  <p>Hi, I'm ${esc(a.firstName)}. I've played Roblox since ${esc(a.robloxSince)}, when my favourite game was Lumber Tycoon 2. In 2018 I started my YouTube channel, <a href="${esc(a.youtube)}" rel="me noopener">${esc(a.name)}</a>, which now has ${esc(a.youtubeSubscribers)} subscribers and more than ${Math.floor(a.youtubeVideos / 10) * 10} videos. Most of them are about BedWars — ranked solo queue from Bronze to Nightmare, kit guides and win streaks — and lately Rivals.</p>
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

// ---------------------------------------------------------------- code updates

export function updatesBody({ site, list }) {
  const codes = arr => arr.slice(0, 8).map(c => `<code>${esc(c.code)}</code>`).join(' ') + (arr.length > 8 ? ` and ${arr.length - 8} more` : '');
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Updates</li></ol></nav>
<header class="index-head">
<h1>Code updates</h1>
<p class="dek">What changed, day by day: new codes that games released, and codes that stopped working. It's the quickest way to see what's new since you last checked.</p>
</header>
${list.map(({ day, rows }) => {
    const added = rows.reduce((n, r) => n + r.added.length, 0), gone = rows.reduce((n, r) => n + r.expired.length, 0);
    return `<section class="sec" aria-labelledby="d-${day}">
  <div class="sec-head"><h2 id="d-${day}">${dateLong(day)}</h2><span class="aside">${[added ? `${added} new` : '', gone ? `${gone} expired` : ''].filter(Boolean).join(' · ')}</span></div>
  <ul class="ruled updates">
${rows.map(r => `    <li><a href="${r.v.path}"><img src="${r.v.icon}" alt="" width="40" height="40" loading="lazy"><span class="u-text"><b>${esc(r.v.g.name)}</b>${r.added.length ? `<span class="u-line"><span class="u-new">${plural(r.added.length, 'new code')}</span> ${codes(r.added)}</span>` : ''}${r.expired.length ? `<span class="u-line"><span class="u-old">${r.expired.length} expired</span> ${codes(r.expired)}</span>` : ''}</span></a></li>`).join('\n')}
  </ul>
</section>`;
  }).join('\n')}`;
}

// ---------------------------------------------------------------- guides and blog

// A picture card for an article (guide or blog post)
export function articleCard(gd, { lazy = true, date = false } = {}) {
  return `<li><a class="card" href="${gd.path}">
    ${gd.cover ? `<img src="${esc(small(gd.cover))}" srcset="${esc(small(gd.cover))} 480w, ${esc(gd.cover)} 960w" sizes="(min-width: 720px) 340px, 100vw" alt="" width="640" height="360"${lazy ? ' loading="lazy"' : ''} decoding="async">` : '<span class="card-blank" aria-hidden="true"></span>'}
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
${posts.map((p, i) => articleCard(p, { lazy: i > 2 })).join('\n')}
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
${more.map(o => articleCard(o, {})).join('\n')}
  </ul>
</section>` : ''}`;
}
