import { esc, ago, plural, fmtNum, compact, dateLong, searchKey, ICONS } from './helpers.mjs';
import { adSlot } from './layout.mjs';

// ---------------------------------------------------------------- cards

export function gameCard(v, { lazy = true } = {}) {
  return `<a class="card" href="${v.path}" data-name="${esc(searchKey(`${v.g.name} ${v.g.slug.replace(/-/g, ' ')}`))}">
  <img src="${v.icon}" alt="" width="60" height="60"${lazy ? ' loading="lazy" decoding="async"' : ''}>
  <div class="meta">
    <h3>${esc(v.g.name)} Codes</h3>
    <p><span class="count">${plural(v.live.length, 'working code')}</span> · updated ${ago(v.g.lastChanged, true)}</p>
  </div>
</a>`;
}

function recentCard(v) {
  const badge = v.recentNew > 0 ? `${plural(v.recentNew, 'new code')}` : 'Codes updated';
  return `<a class="card" href="${v.path}">
  <div class="top">
    <img src="${v.icon}" alt="" width="48" height="48">
    <div class="meta"><h3>${esc(v.g.name)}</h3><p><span class="count">${plural(v.live.length, 'working code')}</span></p></div>
  </div>
  <span class="badge${v.recentNew > 0 ? ' new' : ''}">${badge} · ${ago(v.g.lastChanged, true)}</span>
</a>`;
}

// ---------------------------------------------------------------- home

export function homeBody({ site, views, lastCheck, totalCodes }) {
  const recent = views.slice(0, 8);
  return `<div class="wrap">
  <section class="hero">
    <h1>Working Roblox codes, checked every few hours</h1>
    <p>Every code here comes from the game's own Roblox page or its developers, and gets re-checked all day. New codes show up within hours.</p>
    <form class="search" role="search" action="/" onsubmit="return false">
      ${ICONS.search}
      <label for="q" class="sr-only">Search a game</label>
      <input id="q" name="q" type="search" placeholder="Search a game..." autocomplete="off" enterkeyhint="search">
    </form>
    <p class="stat-line"><span class="dot"></span>${plural(totalCodes, 'working code')} across ${plural(views.length, 'game')} · last check ${ago(lastCheck)}</p>
  </section>

  <section class="section" id="recent" aria-labelledby="recent-h">
    <div class="section-head"><h2 id="recent-h">Just updated</h2><span>Newest code changes</span></div>
    <div class="rail">
${recent.map(recentCard).join('\n')}
    </div>
  </section>

  <section class="section" id="games" aria-labelledby="games-h">
    <div class="section-head"><h2 id="games-h">All games</h2><span>${plural(views.length, 'game')}</span></div>
    <div class="grid">
${views.map((v, i) => gameCard(v, { lazy: i > 5 })).join('\n')}
    </div>
    <p class="empty" id="no-results">No game matches that search yet. We add new games every week.</p>
  </section>

  <section class="section prose" aria-labelledby="how-h">
    <h2 id="how-h">How we keep codes fresh</h2>
    <p>Most Roblox developers announce their codes on the game's own page. We read those pages every few hours, so a new code usually appears here the same day it goes live. Every new code is checked by a person before it goes on the site, and a code that the game stops listing moves to that page's expired list with the date it disappeared.</p>
    <p>Each game page shows when it was last checked, what every code gives, and exactly where the code box is in that game.</p>
  </section>
</div>`;
}

// ---------------------------------------------------------------- game

function codeRow(c, isNew) {
  return `<li class="code-row">
  <div class="info">
    <code>${esc(c.code)}</code>${isNew ? '<span class="badge new">New</span>' : ''}
    <span class="reward">${c.reward ? esc(c.reward) : 'Reward not stated by the developer'}</span>
  </div>
  <button class="copy" type="button" data-code="${esc(c.code)}" aria-label="Copy code ${esc(c.code)}">${ICONS.check}<span>Copy</span></button>
</li>`;
}

function faq(v) {
  const g = v.g;
  const n = v.live.length;
  const caseSensitive = v.live.some(c => /[a-z]/.test(c.code) && /[A-Z]/.test(c.code)) || v.live.some(c => /^[a-z0-9]+$/.test(c.code) && /[a-z]/.test(c.code));
  const newPlayer = v.live.some(c => /new player/i.test(c.reward ?? ''));
  const items = [
    [`Are these ${g.name} codes still working?`,
      `${n === 1 ? 'The code above was' : `All ${n} codes above were`} listed as active by the developers of ${esc(g.name)} when we last checked, on ${dateLong(g.lastChecked)}. We re-check every few hours, and any code the game stops listing moves to the expired list below.`],
    [`Why is my ${g.name} code not working?`,
      `Type the code exactly as shown, or use the Copy button${caseSensitive ? ' — some of these codes use lowercase letters, and the code box may treat case as different' : ''}. Most codes work once per account${newPlayer ? ', and at least one of these is only for new players' : ''}. If a code still fails, it has probably just expired; it will drop off this page at the next check.`],
    [`When do new ${g.name} codes come out?`,
      `Developers usually release new codes with updates or when the game hits a like or visit milestone. The last change to this list was on ${dateLong(g.lastChanged)}. Check back after the next update, since new codes appear here within hours.`],
    ...(g.faq ?? []).map(f => [f.q, esc(f.a)]),
  ];
  return items.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${a}</p>`).join('\n');
}

export function gameBody({ site, v, related }) {
  const g = v.g;
  const fromDesc = v.live.filter(c => c.source === 'description').length;
  const manual = v.live.length - fromDesc;
  const sourceBits = [];
  if (fromDesc) sourceBits.push(`${fromDesc === v.live.length ? 'All' : fromDesc} from the official Roblox game page`);
  if (manual) sourceBits.push(`${manual === v.live.length ? 'All' : manual} from the developers' official channels`);
  const stats = g.stats ?? {};

  return `<div class="wrap narrow">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › ${esc(g.name)} codes</nav>
  <header class="game-head">
    <img src="${v.icon}" alt="${esc(g.name)} icon" width="72" height="72">
    <div>
      <h1>${esc(v.h1)}</h1>
      <p class="status">✅ <strong>${plural(v.live.length, 'working code')}</strong> · Last checked ${ago(g.lastChecked)}</p>
    </div>
  </header>

  <section aria-label="Working codes">
    <ul class="codes">
${v.live.map(c => codeRow(c, v.isNew(c))).join('\n')}
    </ul>
    <p class="source-note">${sourceBits.join('; ')}. Codes can be case-sensitive, so the Copy button is the safest way to enter them.</p>
  </section>

  ${adSlot(site, 'afterCodes')}

  <section class="block" aria-labelledby="redeem-h">
    <h2 id="redeem-h">How to redeem ${esc(g.name)} codes</h2>
    <div class="panel">
      <ol class="steps">
${g.redeem.map(s => `        <li>${esc(s)}</li>`).join('\n')}
      </ol>
    </div>
  </section>

  <section class="block about-game" aria-labelledby="about-h">
    <h2 id="about-h">About ${esc(g.name)}</h2>
    <div class="panel">
      ${v.thumb ? `<img src="${v.thumb}" alt="${esc(g.name)} on Roblox" width="768" height="432" loading="lazy" decoding="async">` : ''}
      ${g.notes.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join('\n      ')}
      <ul class="facts">
        ${g.creator ? `<li>By <strong>${esc(g.creator)}</strong></li>` : ''}
        ${g.subgenre || g.genre ? `<li>Genre <strong>${esc(g.subgenre || g.genre)}</strong></li>` : ''}
        ${stats.playing ? `<li><strong>${fmtNum(stats.playing)}</strong> playing at last check</li>` : ''}
        ${stats.visits ? `<li><strong>${compact(stats.visits)}</strong> visits</li>` : ''}
      </ul>
      <a class="btn" href="${esc(g.gameUrl)}" rel="noopener" target="_blank">${ICONS.play} Play on Roblox</a>
    </div>
  </section>

  ${adSlot(site, 'inContent')}

  ${g.expired.length ? `<section class="block" aria-labelledby="expired-h">
    <h2 id="expired-h" class="sr-only">Expired ${esc(g.name)} codes</h2>
    <details class="expired">
      <summary>Expired codes (${g.expired.length})</summary>
      <ul>
${g.expired.slice(0, 60).map(e => `        <li><code>${esc(e.code)}</code><span>${e.reason === 'expired' ? 'Expired' : 'No longer listed by the game'} · ${dateLong(e.removed)}</span></li>`).join('\n')}
      </ul>
    </details>
  </section>` : ''}

  <section class="block faq" aria-labelledby="faq-h">
    <h2 id="faq-h">${esc(g.name)} codes FAQ</h2>
    <div class="panel">
${faq(v)}
    </div>
  </section>

  <section class="block" aria-labelledby="more-h">
    <h2 id="more-h">More codes</h2>
    <div class="grid">
${related.map(r => gameCard(r)).join('\n')}
    </div>
  </section>

  ${adSlot(site, 'bottom')}
</div>`;
}

// ---------------------------------------------------------------- static pages

export const staticBody = (h1, html) => `<div class="wrap narrow"><article class="prose"><h1>${esc(h1)}</h1>
${html}
</article></div>`;

export function notFoundBody(views) {
  return `<div class="wrap narrow">
  <h1>That page isn't here</h1>
  <p>The game may have been renamed, or the link is wrong. Search from the <a href="/">home page</a>, or try one of these:</p>
  <div class="grid">
${views.slice(0, 6).map(v => gameCard(v)).join('\n')}
  </div>
</div>`;
}
