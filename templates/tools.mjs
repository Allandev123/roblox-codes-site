import { esc, dateShort, fmtNum } from './helpers.mjs';
import { adSlot } from './layout.mjs';

// DevEx and Ad Credit calculator (/devex-calculator/). Rates come from data/devex.json and
// exchange rates from the European Central Bank (fetched by build.mjs). The two calculators
// copy the look of Roblox's own DevEx portal and Ads Manager screens. app.js does the maths;
// the HTML starts with the same numbers, so it reads fine without JavaScript.

const two = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd = n => '$' + two(n);
// $38 rather than $38.00 in sentences
const usdShort = n => '$' + (Number.isInteger(Math.round(n * 100) / 100) ? Math.round(n).toLocaleString('en-US') : two(n));
const PRESETS = [[30000, '30K'], [100000, '100K'], [500000, '500K'], [1000000, '1M'], [10000000, '10M']];

// The Robux symbol: a hexagon with a rounded square inside
const RBX = '<svg class="rbx-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.6 20.2 7.3v9.4L12 21.4 3.8 16.7V7.3z"/><rect x="9" y="9" width="6" height="6" rx="1.2"/></svg>';
const INFO = '<svg class="rbx-info-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 11v6M12 7.5v.01" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>';

// Answers are HTML; the FAQPage JSON-LD strips the tags.
export const DEVEX_FAQ = d => {
  const r = d.rates, s = r.standard.usd;
  return [
    { q: 'How much is 1,000 Robux worth in real money?', a: `${usdShort(1000 * s)} with DevEx at the standard rate. Robux earned at the U.S. 18+ rate are worth ${usdShort(1000 * r.us18.usd)} per 1,000, and old Robux from before ${esc(d.oldRateBefore)} are worth ${usdShort(1000 * r.old.usd)}.` },
    { q: 'How much are 10,000, 100,000 and 1 million Robux worth?', a: `At the standard rate: 10,000 Robux is ${usdShort(10000 * s)}, 100,000 Robux is ${usdShort(100000 * s)}, and 1,000,000 Robux is ${usdShort(1000000 * s)}. You can only cash out from ${fmtNum(d.minimum)} Robux, so 10,000 isn't enough on its own.` },
    { q: 'What is the minimum for DevEx?', a: `${fmtNum(d.minimum)} Earned Robux, which is ${usdShort(d.minimum * s)} at the standard rate. The calculator above tells you how many more you need.` },
    { q: 'In what order does DevEx pay the rates?', a: `U.S. 18+ Robux go first, then Robux from before ${esc(d.oldRateBefore)} at the old $${r.old.usd}, and only then Robux at $${s}. The DevEx portal says so right under the payout breakdown. Spending Robux on Roblox doesn't use up the old balance first.` },
    { q: 'Who can use DevEx?', a: `Anyone 13 or older with at least ${fmtNum(d.minimum)} Earned Robux, a verified email, a DevEx portal account and a tax form on file (a W-9 in the U.S., a W-8 everywhere else). Your account also has to follow Roblox's Terms of Use.` },
    { q: 'How long does DevEx take?', a: `Roblox reviews every request: about 10 business days the first time and about 5 after that. You can have one completed request per calendar month, and you can't cancel a request once it's sent.` },
    { q: 'What is the U.S. 18+ rate?', a: `A higher rate, $${r.us18.usd} per Robux, for Robux from game passes, developer products, subscriptions and private servers bought by U.S. players who verified they're 18 or older, in eligible games. Everything else you earn gets the standard $${s}.` },
    { q: 'Can I cash out Robux I bought?', a: `No. Only Earned Robux count: sales of passes, developer products, subscriptions, private servers and avatar items, plus Creator Rewards. Robux you bought, got from a gift card or a transfer, or made by trading items don't count.` },
    { q: 'How many Robux is 1 Ad Credit?', a: `About ${Math.round(1 / s)} Robux at the standard rate, or about ${Math.round(1 / r.us18.usd)} Robux earned at the U.S. 18+ rate. 1 Ad Credit pays for $1 of ads.` },
    { q: 'How do Ad Credits work?', a: `1 Ad Credit pays for $1 of ads in Roblox's Ads Manager. You can buy credits with Robux from age 13, or with a card from age 18. U.S. 18+ Robux convert first at $${r.us18.usd}, every other Earned Robux at $${s}, and the smallest conversion is 1 credit.` },
    { q: 'DevEx or Ad Credits: which is better?', a: `For new Robux they're worth the same: 10,000 Robux is ${usdShort(10000 * s)} from DevEx or ${Math.round(10000 * s)} Ad Credits. Old Robux are different, because Ads Manager converts them at $${s} while DevEx pays $${r.old.usd}. When I put in the same 30,000 Robux, most of them from before ${esc(d.oldRateBefore.replace(/^(\w+) \d+, /, '$1 '))}, the DevEx portal offered me $105.72 and Ads Manager offered 114.60 Ad Credits. So if you'd pay for ads for your game anyway, convert. If not, cash out.` },
    { q: 'Can I turn Ad Credits back into Robux?', a: `No. Converting is permanent, and Ad Credits can only be spent on ads in Ads Manager. Credits a campaign doesn't spend go back to your account when it ends.` },
  ];
};

const input = ({ id, value, pre = RBX, mode = 'numeric', label }) => `<div class="rbx-input">${pre}<input id="${id}" type="text" inputmode="${mode}" autocomplete="off" spellcheck="false" value="${value}"${label ? ` aria-label="${label}"` : ''}></div>`;
// one row of a breakdown box: rate name on the left, Robux and money on the right
const row = ({ key, name, rate, money, robux, note = '', prefix }) => `<div class="rbx-row" data-row="${key}"${robux ? '' : ' hidden'}>
      <div class="rbx-row-l"><b>${name}</b><span>Earned at ${rate}</span>${note ? `<small>${INFO}${note}</small>` : ''}</div>
      <div class="rbx-row-r"><span>${RBX}<span id="${prefix}-r-${key}">${fmtNum(robux)}</span></span><b id="${prefix}-v-${key}">${money}</b></div>
    </div>`;

export function devexBody({ site, d }) {
  const r = d.rates;
  const start = d.minimum; // DevEx opens on the minimum...
  const ac = d.minimum; // ...and so does the Ad Credit converter, like the screenshots
  const rateData = Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.usd]));
  const oldMonth = d.oldRateBefore.replace(/^(\w+) \d+, /, '$1 ');
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">DevEx calculator</li></ol></nav>
<header class="tool-head">
  <h1>Roblox DevEx &amp; Ad Credit Calculator</h1>
  <p>Robux to real money with DevEx, or to Ad Credits for Ads Manager. Roblox's rates, checked ${dateShort(d.checked)}: $${r.standard.usd} per Robux, $${r.us18.usd} for U.S. 18+ Robux.</p>
</header>

<div id="calc" class="tool-grid" data-rates="${esc(JSON.stringify(rateData))}" data-min="${d.minimum}">
<section class="rbx" id="devex" aria-labelledby="devex-h">
  <div class="rbx-head"><h2 id="devex-h">DevEx calculator</h2><p>Cash out Earned Robux for US dollars.</p></div>
  <div class="rbx-pair">
    <div><label for="dx-robux">Robux amount</label>${input({ id: 'dx-robux', value: fmtNum(start) })}</div>
    <span class="rbx-or" aria-hidden="true">-or-</span>
    <div><label for="dx-usd">US dollar amount</label>${input({ id: 'dx-usd', value: two(start * r.standard.usd), pre: '<span class="rbx-pre">$</span>', mode: 'decimal' })}</div>
  </div>
  <p class="rbx-msg" id="dx-status" aria-live="polite"></p>
  <div class="rbx-chips" role="group" aria-label="Quick amounts">${PRESETS.map(([n, l]) => `<button type="button" class="rbx-chip" data-robux="${n}">${l}</button>`).join('')}</div>
  <details class="rbx-bal">
    <summary>Your balance by rate <span>optional</span></summary>
    <p>The DevEx portal shows these when you type an amount. Old rate means Robux from before ${esc(oldMonth)}. Leave both at 0 and everything counts as $${r.standard.usd}.</p>
    <div class="rbx-pair rbx-pair-even">
      <div><label for="dx-b-us18">U.S. 18+ rate, $${r.us18.usd}</label>${input({ id: 'dx-b-us18', value: '0' })}</div>
      <div><label for="dx-b-old">Old rate, $${r.old.usd}</label>${input({ id: 'dx-b-old', value: '0' })}</div>
    </div>
  </details>
  <p class="rbx-sub">You will get:</p>
  <div class="rbx-box">
    ${row({ key: 'us18', name: 'US 18+ rate', rate: `$${r.us18.usd}`, money: usd(0), robux: 0, prefix: 'dx' })}
    ${row({ key: 'old', name: 'Old rate', rate: `$${r.old.usd}`, money: usd(0), robux: 0, prefix: 'dx', note: `This rate will be cashed out before $${r.standard.usd} rate` })}
    ${row({ key: 'standard', name: 'Standard rate', rate: `$${r.standard.usd}`, money: usd(start * r.standard.usd), robux: start, prefix: 'dx' })}
    <div class="rbx-total">
      <b>Total</b>
      <div class="rbx-row-r"><span>${RBX}<span id="dx-r-total">${fmtNum(start)}</span></span><output id="dx-total" for="dx-robux">${usd(start * r.standard.usd)}</output></div>
    </div>
  </div>
  <div class="rbx-note">${INFO}<p>DevEx requests pay out at the US 18+ rate first, then Robux from before ${esc(d.oldRateBefore)} at $${r.old.usd}, then $${r.standard.usd}. Roblox shows the exact amount in the DevEx portal.</p></div>
</section>

<section class="rbx" id="ad-credits" aria-labelledby="ac-h">
  <div class="rbx-head"><h2 id="ac-h">Ad Credit converter</h2><p>Turn Robux into Ad Credits for Ads Manager.</p></div>
  <div class="rbx-pair">
    <div><label for="ac-robux">Robux amount</label>${input({ id: 'ac-robux', value: fmtNum(ac) })}</div>
    <span class="rbx-or" aria-hidden="true">-or-</span>
    <div><label for="ac-credits">Ad Credit amount</label>${input({ id: 'ac-credits', value: two(ac * r.standard.usd), pre: '', mode: 'decimal' })}</div>
  </div>
  <p class="rbx-msg" id="ac-status" aria-live="polite"></p>
  <details class="rbx-bal">
    <summary>Your U.S. 18+ Robux <span>optional</span></summary>
    <p>Ads Manager converts these first and shows how many you have. Every other Earned Robux converts at $${r.standard.usd}, even old ones.</p>
    <div><label for="ac-b-us18">U.S. 18+ rate, $${r.us18.usd}</label>${input({ id: 'ac-b-us18', value: '0' })}</div>
  </details>
  <div class="rbx-box">
    <div class="rbx-row" data-row="us18" hidden>
      <div class="rbx-row-l"><b>US 18+ rate</b><span>Earned at ${r.us18.usd}</span></div>
      <div class="rbx-row-r"><span class="rbx-dim"><span id="ac-v-us18">0.00</span> Ad Credit</span><span>${RBX}<span id="ac-r-us18">0</span></span></div>
    </div>
    <div class="rbx-row" data-row="standard">
      <div class="rbx-row-l"><b>Standard rate</b><span>Earned at ${r.standard.usd}</span></div>
      <div class="rbx-row-r"><span class="rbx-dim"><span id="ac-v-standard">${two(ac * r.standard.usd)}</span> Ad Credit</span><span>${RBX}<span id="ac-r-standard">${fmtNum(ac)}</span></span></div>
    </div>
    <div class="rbx-total">
      <b>Total</b>
      <div class="rbx-row-r"><output id="ac-total" for="ac-robux">${two(ac * r.standard.usd)} Ad Credit</output><span>${RBX}<span id="ac-r-total">${fmtNum(ac)}</span></span></div>
    </div>
  </div>
  <div class="rbx-note rbx-note-grey">${INFO}<p>Robux to Ad Credit conversion will use 18+ rates first.</p></div>
  <div class="rbx-final"><b>Your Ad Credit purchase is final</b><p>Ad Credits can't be turned back into Robux and only pay for ads in Ads Manager. Credits a campaign doesn't spend go back to your account when it ends.</p></div>
</section>
</div>
<p class="note calc-note">Estimates from Roblox's published rates. Roblox rounds a little differently and decides which rate each Robux gets; the DevEx portal and Ads Manager show the exact amount before you confirm.</p>

<div class="tool-more">
<section class="sec" aria-labelledby="rates-h">
  <h2 id="rates-h">Current DevEx rates</h2>
  <p class="note">From Roblox's <a href="${esc(d.sources.devex)}" rel="noopener" target="_blank">Developer Exchange page</a> and the DevEx portal, checked ${dateShort(d.checked)}. DevEx pays them in this order.</p>
  <div class="table-wrap rates-table"><table>
    <thead><tr><th>Rate</th><th>What it's for</th><th>1,000 Robux</th><th>${fmtNum(d.minimum)} Robux</th></tr></thead>
    <tbody>
${['us18', 'old', 'standard'].map(k => `      <tr><td><b>${esc(r[k].name)}</b><br>$${r[k].usd} each</td><td>${esc(r[k].for)}</td><td>${usd(1000 * r[k].usd)}</td><td>${usd(d.minimum * r[k].usd)}</td></tr>`).join('\n')}
    </tbody>
  </table></div>
</section>

<section id="devex-faq" class="sec tool-faq" aria-labelledby="faq-h">
  <h2 id="faq-h">Questions</h2>
  <div class="faq-list">
${DEVEX_FAQ(d).map((f, i) => `    <details class="faq"${i === 0 ? ' open' : ''}><summary><h3>${esc(f.q)}</h3><span class="faq-icon" aria-hidden="true"></span></summary><p>${f.a}</p></details>`).join('\n')}
  </div>
  <p class="note">An independent fan site, not made by or connected to Roblox. If a rate is out of date, <a href="/contact/">tell me</a>. Full rules: Roblox's <a href="${esc(d.sources.devex)}" rel="noopener" target="_blank">DevEx</a> and <a href="${esc(d.sources.ads)}" rel="noopener" target="_blank">Ads Manager</a> docs.</p>
</section>
</div>
${adSlot(site, 'bottom')}`;
}
