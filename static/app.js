(() => {
  const root = document.documentElement;
  const $ = s => document.querySelector(s);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  // one polite live region for copy and search announcements
  const live = $('#live');
  const say = t => { if (!live) return; live.textContent = ''; setTimeout(() => { live.textContent = t; }, 50); };

  // ---------------------------------------------------------------- theme
  const toggle = $('.theme-toggle');
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : mq.matches);
  const sync = () => {
    const dark = isDark();
    toggle?.setAttribute('aria-pressed', String(dark));
    if (root.dataset.theme) document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.content = dark ? '#1b1815' : '#faf6ee'; m.removeAttribute('media'); });
  };
  toggle?.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('theme', next);
    sync();
  });
  sync();
  mq.addEventListener?.('change', sync);

  // ---------------------------------------------------------------- phone menu
  const menuBtn = $('.menu-toggle');
  const links = $('#nav-links');
  const setMenu = open => { menuBtn.setAttribute('aria-expanded', String(open)); links.classList.toggle('open', open); };
  menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && links?.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener('click', e => { if (links?.classList.contains('open') && !e.target.closest('.nav')) setMenu(false); });

  // ---------------------------------------------------------------- back to top
  // shows once you've scrolled a couple of screens down
  const toTop = $('.to-top');
  if (toTop) {
    toTop.hidden = false;
    const show = () => toTop.classList.toggle('show', scrollY > innerHeight * 1.5);
    addEventListener('scroll', show, { passive: true });
    show();
    toTop.addEventListener('click', e => {
      e.preventDefault();
      scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      ($('.brand') ?? document.body).focus?.({ preventScroll: true });
    });
  }

  // ---------------------------------------------------------------- times
  // "2 hours ago" from <time datetime>; the HTML holds an absolute date
  const UNITS = [['year', 31536e6, 'yr'], ['month', 2592e6, 'mo'], ['week', 6048e5, 'wk'], ['day', 864e5, 'day'], ['hour', 36e5, 'hr'], ['minute', 6e4, 'min']];
  const ago = (iso, short) => {
    const ms = Date.now() - Date.parse(iso);
    if (!(ms >= 0)) return null;
    if (ms < 6e4) return 'just now';
    for (const [u, n, s] of UNITS) if (ms >= n) {
      const v = Math.floor(ms / n);
      return short ? `${v} ${s}${s === 'day' && v > 1 ? 's' : ''} ago` : `${v} ${u}${v > 1 ? 's' : ''} ago`;
    }
    return 'just now';
  };
  const tick = () => document.querySelectorAll('time[data-ago]').forEach(t => { const s = ago(t.dateTime, t.dataset.ago === 'short'); if (s) t.textContent = s; });
  tick();
  setInterval(tick, 60000);

  // ---------------------------------------------------------------- copy
  const copyText = async text => {
    try { await navigator.clipboard.writeText(text); return true; } catch {}
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    ta.remove();
    return ok;
  };
  // remember which codes were copied on this page, so a returning player sees them
  const KEY = 'copied:' + location.pathname;
  const onPage = new Set([...document.querySelectorAll('.copy')].map(b => b.dataset.code));
  let copied = [];
  try { copied = JSON.parse(store.get(KEY) || '[]').filter(c => onPage.has(c)); } catch {}
  const markWas = b => {
    b.closest('li').classList.add('was');
    b.querySelector('span').textContent = 'Copied';
    b.setAttribute('aria-label', `Copied. Copy code ${b.dataset.code} again`);
  };
  document.querySelectorAll('.copy').forEach(b => { if (copied.includes(b.dataset.code)) markWas(b); });

  document.addEventListener('click', async e => {
    const chip = e.target.closest('.codes .code');
    const b = e.target.closest('.copy') || chip?.closest('li').querySelector('.copy');
    if (!b) return;
    const row = b.closest('li');
    const label = b.querySelector('span');
    const code = b.dataset.code;
    if (!(await copyText(code))) {
      const r = document.createRange();
      r.selectNodeContents(row.querySelector('.code'));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      label.textContent = 'Hold to copy';
      say('Copy failed. Press and hold the code to copy it.');
      return;
    }
    b.classList.add('done');
    row.classList.add('done');
    label.textContent = 'Copied!';
    say(`Copied ${code}`);
    if (!copied.includes(code)) { copied.push(code); store.set(KEY, JSON.stringify(copied)); }
    clearTimeout(b._t);
    b._t = setTimeout(() => { b.classList.remove('done'); row.classList.remove('done'); markWas(b); }, 1600);
  });

  // ---------------------------------------------------------------- your games
  // Game pages remember themselves; the home page lists them with a "new" tag
  // when codes were added since the last visit.
  const codes = $('.codes[data-latest]');
  let mine = {};
  try { mine = JSON.parse(store.get('rbx:games') || '{}'); } catch {}
  if (codes) {
    const head = $('.post-head');
    mine[location.pathname] = {
      n: head?.querySelector('h1')?.textContent.replace(/ Codes \(.*$/, '') ?? '',
      i: head?.querySelector('img')?.getAttribute('src') ?? '',
      l: codes.dataset.latest, t: Date.now(),
    };
    const keep = Object.entries(mine).sort((a, b) => b[1].t - a[1].t).slice(0, 8);
    store.set('rbx:games', JSON.stringify(Object.fromEntries(keep)));
  }
  const mineSec = $('#mine');
  if (mineSec) {
    const latest = new Map([...document.querySelectorAll('#games a[href]')].map(a => [a.getAttribute('href'), a]));
    const items = Object.entries(mine).filter(([p]) => latest.has(p)).sort((a, b) => b[1].t - a[1].t).slice(0, 6);
    if (items.length) {
      const ul = mineSec.querySelector('ul');
      for (const [p, m] of items) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = p;
        const img = document.createElement('img');
        img.src = latest.get(p).querySelector('img').src; img.alt = ''; img.width = 30; img.height = 30;
        a.append(img, document.createTextNode(latest.get(p).querySelector('.name').firstChild.textContent));
        if (m.l && (latest.get(p).dataset.latest || '') > m.l) {
          const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = 'new'; a.append(tag);
        }
        li.append(a); ul.append(li);
      }
      mineSec.hidden = false;
      mineSec.querySelector('.mine-clear')?.addEventListener('click', () => { store.set('rbx:games', '{}'); mineSec.hidden = true; });
    }
  }

  // ---------------------------------------------------------------- search
  const q404 = $('#q404');
  if (q404) q404.value = decodeURIComponent(location.pathname).replace(/-codes\/?$/, '').replace(/[\/_-]+/g, ' ').trim();

  const input = $('#q');
  if (input) {
    const main = $('main');
    const links = [...document.querySelectorAll('#games .tiles a')];
    const count = $('#games-count');
    const countText = count.innerHTML;
    const empty = $('#no-results');
    // the box at the top of All games filters the same grid, without hiding the sections above
    const gq = $('#games-q'), aside = $('#games-aside');
    const STOP = new Set(['code', 'codes', 'roblox', 'game', 'the', 'a', 'an', 'for', 'new', 'free', 'working']);
    const norm = s => s.toLowerCase().normalize('NFKD').replace(/\+/g, ' plus ').replace(/[^a-z0-9]+/g, ' ').trim();
    const toks = s => norm(s).split(' ').filter(w => w && !STOP.has(w));
    const lev = (a, b) => {
      const d = [...Array(b.length + 1).keys()];
      for (let i = 1; i <= a.length; i++) {
        let p = d[0]; d[0] = i;
        for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] !== b[j - 1])); p = t; }
      }
      return d[b.length];
    };
    const idx = links.map(a => {
      const w = a.dataset.name.split(' ').filter(Boolean);
      return { a, li: a.parentElement, w, flat: w.join(''), ini: w.filter(x => !/^\d+$/.test(x) && x !== 'plus').map(x => x[0]).join(''), al: (a.dataset.alias || '').split(' ').filter(Boolean) };
    });
    // exact-ish match: every typed word is the start of a name word, or the
    // whole query matches the joined name, the initials (tds, bgs) or an alias
    const hit = (e, qt, qflat) => qt.every(t => e.w.some(w => w.startsWith(t)) || e.flat.includes(t)) || e.ini === qflat || e.al.includes(qflat) || (qflat.length > 2 && e.flat.includes(qflat));
    // typo match: each typed word within 1-2 edits of some name word
    // "blox spin" -> blockspin, "rol a fishrman" -> roll a fisherman
    const tol = n => (n > 7 ? 2 : 1);
    const fuzzy = (e, qt, qflat) =>
      (qflat.length > 3 && lev(qflat, e.flat.slice(0, qflat.length + 1)) <= tol(qflat.length)) ||
      qt.every(t => t.length >= 3 && e.w.some(w => lev(t, w.slice(0, t.length + 1)) <= tol(t.length)));
    let st;
    const run = (fromGrid = false) => {
      const raw = input.value;
      const qt = toks(raw);
      const qflat = qt.join('');
      let shown = 0, didYouMean = false;
      if (!qt.length) idx.forEach(e => { e.li.hidden = false; });
      else {
        idx.forEach(e => { e.li.hidden = !hit(e, qt, qflat); if (!e.li.hidden) shown++; });
        if (!shown) {
          idx.forEach(e => { e.li.hidden = !fuzzy(e, qt, qflat); if (!e.li.hidden) shown++; });
          didYouMean = shown > 0;
        }
      }
      main.classList.toggle('searching', qt.length > 0 && !fromGrid);
      empty.hidden = !(qt.length && !shown);
      count.innerHTML = !qt.length ? countText : didYouMean ? 'Did you mean one of these?' : `${shown} of ${idx.length} games`;
      if (aside) aside.textContent = !qt.length ? 'Most played first' : didYouMean ? 'Did you mean one of these?' : `${shown} of ${idx.length} games`;
      clearTimeout(st);
      if (qt.length) st = setTimeout(() => say(shown ? `${shown} game${shown === 1 ? '' : 's'} found` : 'No games found'), 400);
    };
    // ---- live dropdown: popular games when empty, matching games and codes while typing
    const pop = $('#q-pop');
    let data = null, loading = null, opts = [], active = -1;
    const load = () => loading ??= fetch('/search.json').then(r => r.json()).then(d => {
      d.games.forEach(g => {
        const w = norm(g.n).split(' ').filter(Boolean);
        Object.assign(g, { w, flat: w.join(''), ini: w.filter(x => !/^\d+$/.test(x) && x !== 'plus').map(x => x[0]).join(''), al: g.al.split(' ').filter(Boolean) });
      });
      d.codes.forEach(c => { c.low = c.k.toLowerCase(); });
      data = d;
    }).catch(() => { loading = null; });
    const h = t => t.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
    const GAME = '<svg class="s-kind" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M7 10v4M5 12h4M15 11h.01M18 13h.01"/></svg>';
    const GIFT = '<svg class="s-kind" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8c-2-4-6-4-6-1.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z"/></svg>';
    const setOpen = open => { pop.hidden = !open; input.setAttribute('aria-expanded', String(open)); if (!open) { active = -1; input.removeAttribute('aria-activedescendant'); } };
    const mark = i => {
      opts.forEach((o, j) => o.setAttribute('aria-selected', String(j === i)));
      active = i;
      if (i >= 0) { input.setAttribute('aria-activedescendant', opts[i].id); opts[i].scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
    };
    const drawPop = () => {
      if (!pop) return;
      if (!data) { load()?.then(() => { if (document.activeElement === input) drawPop(); }); return; }
      const qt = toks(input.value), qflat = qt.join(''), raw = input.value.trim().toLowerCase();
      if (!qt.length && !raw) {
        pop.innerHTML = `<p class="s-head"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 17 6-6 4 4 8-8M15 7h6v6"/></svg>Popular</p><div class="s-chips" id="q-list" role="listbox" aria-label="Popular games">${data.popular.map((g, i) => `<a class="s-chip" id="q-o${i}" role="option" aria-selected="false" href="${g.p}">${h(g.n)}</a>`).join('')}</div>`;
      } else {
        let games = data.games.filter(g => qt.length && hit(g, qt, qflat));
        let fuzzyHit = false;
        if (!games.length && qt.length) { games = data.games.filter(g => fuzzy(g, qt, qflat)); fuzzyHit = games.length > 0; }
        // names that start with the query first, then the most played
        games.sort((a, b) => (b.flat.startsWith(qflat) - a.flat.startsWith(qflat)) || b.pl - a.pl);
        const codes = raw.length >= 2 ? data.codes.filter(c => c.low.includes(raw.replace(/\s+/g, ''))).sort((a, b) => b.low.startsWith(raw) - a.low.startsWith(raw)).slice(0, 5) : [];
        const gl = games.slice(0, codes.length ? 5 : 8);
        let i = 0;
        const row = (href, img, title, sub, icon) => `<a class="s-row" id="q-o${i++}" role="option" aria-selected="false" href="${href}"><img src="${img}" alt="" width="40" height="40"><span class="s-text"><b>${title}</b><span>${sub}</span></span>${icon}</a>`;
        pop.innerHTML = (gl.length || codes.length)
          ? `<div id="q-list" role="listbox" aria-label="Search results">${fuzzyHit ? '<p class="s-head">Did you mean</p>' : ''}${gl.map(g => row(g.p, g.i, h(g.n), `${g.c} code${g.c === 1 ? '' : 's'}${g.g ? ' · ' + h(g.g) : ''}`, GAME)).join('')}${codes.map(c => row(c.p, c.i, `<code>${h(c.k)}</code>`, h(c.r || c.n) + (c.r ? ' · ' + h(c.n) : ''), GIFT)).join('')}</div>`
          : `<p class="s-none">No games or codes match "${h(input.value.trim())}". Try fewer letters.</p>`;
      }
      opts = [...pop.querySelectorAll('[role=option]')];
      active = -1;
      setOpen(true);
    };
    input.addEventListener('input', () => { if (gq) gq.value = input.value; run(); drawPop(); });
    gq?.addEventListener('input', () => { input.value = gq.value; run(true); });
    gq?.addEventListener('keydown', e => { if (e.key === 'Escape' && gq.value) { e.preventDefault(); gq.value = input.value = ''; run(true); } });
    input.addEventListener('focus', () => { load(); drawPop(); });
    input.addEventListener('pointerdown', () => { if (pop?.hidden && document.activeElement === input) drawPop(); });
    input.addEventListener('keydown', e => {
      const open = pop && !pop.hidden;
      if (e.key === 'ArrowDown' && opts.length) { e.preventDefault(); if (!open) drawPop(); mark(Math.min(active + 1, opts.length - 1)); }
      else if (e.key === 'ArrowUp' && open) { e.preventDefault(); mark(Math.max(active - 1, -1)); }
      else if (e.key === 'Enter' && open && active >= 0) { e.preventDefault(); location.href = opts[active].href; }
      else if (e.key === 'Escape') {
        if (open) { e.preventDefault(); setOpen(false); }
        else if (input.value) { e.preventDefault(); input.value = ''; run(); }
      }
    });
    document.addEventListener('pointerdown', e => { if (pop && !pop.hidden && !e.target.closest('.search .field')) setOpen(false); });
    input.addEventListener('blur', () => setTimeout(() => { if (!input.form.contains(document.activeElement)) setOpen(false); }, 150));
    addEventListener('hashchange', () => { if (location.hash === '#q') { input.scrollIntoView({ block: 'center' }); input.focus(); } });

    input.form.addEventListener('submit', e => {
      e.preventDefault();
      if (pop && !pop.hidden && opts.length && input.value.trim()) { location.href = opts[0].href; return; }
      const vis = idx.filter(x => !x.li.hidden);
      if (input.value.trim() && vis.length === 1) location.href = vis[0].a.href;
      else { input.blur(); $('#games').scrollIntoView({ block: 'start' }); }
    });
    $('#clear-q')?.addEventListener('click', () => { input.value = ''; if (gq) gq.value = ''; run(); input.focus(); });
    const q = new URLSearchParams(location.search).get('q');
    if (q) { input.value = q; if (gq) gq.value = q; run(); }
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
    if (location.hash === '#q') setTimeout(() => input.focus(), 0);
  }

  // ---------------------------------------------------------------- DevEx calculator
  // /devex-calculator/. The rates come from the page (data/devex.json), so they only
  // live in one place. Like Roblox's own screens: type in either box of a pair and the
  // other follows, and Robux are split across rates in the order Roblox uses them.
  const calc = $('#calc');
  if (calc) {
    const R = JSON.parse(calc.dataset.rates);
    const MIN = Number(calc.dataset.min);
    const whole = el => Number(el.value.replace(/\D/g, '')) || 0; // Robux: digits only, so "30.000" and "30,000" both work
    const money = el => { const n = parseFloat(el.value.replace(/[^0-9.]/g, '')); return n > 0 ? n : 0; };
    const int = n => Math.round(n).toLocaleString('en-US');
    const two = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const cents = n => Math.round(n * 100) / 100; // each row is rounded to the cent, like the DevEx portal
    const robuxFor = (amount, rate) => Math.ceil(+(amount / rate).toFixed(6)); // toFixed: 114 / 0.0038 is 30000.000000000004
    const set = (id, text) => { const el = $('#' + id); if (el) el.textContent = text; };
    const msg = (el, text, kind = '') => { el.textContent = text; el.className = 'rbx-msg' + (kind ? ' ' + kind : ''); };

    // Robux -> buckets in order; each bucket is capped by your balance at that rate, the last one isn't
    const split = (robux, order, caps) => {
      let left = robux;
      return order.map((k, i) => { const take = i === order.length - 1 ? left : Math.min(left, caps[k] || 0); left -= take; return [k, take]; });
    };
    // money -> Robux, filling the same buckets in the same order
    const need = (amount, order, caps) => {
      let left = amount, robux = 0;
      order.forEach((k, i) => {
        if (left <= 0) return;
        const cap = i === order.length - 1 ? Infinity : caps[k] || 0;
        if (left <= cap * R[k]) { robux += robuxFor(left, R[k]); left = 0; } else { robux += cap; left -= cap * R[k]; }
      });
      return robux;
    };
    // fill a breakdown box; a rate with no Robux is hidden, like on Roblox
    const fill = (box, prefix, parts, robux, fmt) => {
      let total = 0;
      for (const [k, n] of parts) {
        const v = cents(n * R[k]);
        total += v;
        set(`${prefix}-r-${k}`, int(n));
        set(`${prefix}-v-${k}`, fmt(v));
        box.querySelector(`[data-row="${k}"]`).hidden = !n && !(k === 'standard' && !robux);
      }
      set(`${prefix}-r-total`, int(robux));
      return total;
    };

    // DevEx: U.S. 18+ first, then the old rate, then standard
    const devexBox = $('#devex');
    const dxR = $('#dx-robux'), dxU = $('#dx-usd');
    let dxFrom = 'robux';
    const devex = () => {
      const caps = { us18: whole($('#dx-b-us18')), old: whole($('#dx-b-old')) };
      const order = ['us18', 'old', 'standard'];
      const robux = dxFrom === 'robux' ? whole(dxR) : need(money(dxU), order, caps);
      const total = fill(devexBox, 'dx', split(robux, order, caps), robux, v => '$' + two(v));
      if (dxFrom === 'robux') dxU.value = robux ? two(total) : ''; else dxR.value = robux ? int(robux) : '';
      set('dx-total', '$' + two(total));
      if (!robux) msg($('#dx-status'), '');
      else if (robux < MIN) msg($('#dx-status'), `You need ${int(MIN - robux)} more Robux to cash out. The minimum is ${int(MIN)}.`, 'err');
      else msg($('#dx-status'), `Enough to cash out. The minimum is ${int(MIN)} Earned Robux.`, 'ok');
    };
    dxR.addEventListener('input', () => { dxFrom = 'robux'; devex(); });
    dxU.addEventListener('input', () => { dxFrom = 'usd'; devex(); });
    ['#dx-b-us18', '#dx-b-old'].forEach(s => $(s).addEventListener('input', devex));
    devexBox.querySelectorAll('[data-robux]').forEach(b => b.addEventListener('click', () => { dxR.value = int(+b.dataset.robux); dxFrom = 'robux'; devex(); }));

    // Ad Credits: U.S. 18+ first, then everything else at the standard rate (old Robux too)
    const adBox = $('#ad-credits');
    const acR = $('#ac-robux'), acC = $('#ac-credits');
    let acFrom = 'robux';
    const adCredits = () => {
      const caps = { us18: whole($('#ac-b-us18')) };
      const order = ['us18', 'standard'];
      const robux = acFrom === 'robux' ? whole(acR) : need(money(acC), order, caps);
      const total = fill(adBox, 'ac', split(robux, order, caps), robux, two);
      if (acFrom === 'robux') acC.value = robux ? two(total) : ''; else acR.value = robux ? int(robux) : '';
      set('ac-total', `${two(total)} Ad Credit`);
      const tooSmall = robux && total < 1;
      msg($('#ac-status'), tooSmall ? `The smallest conversion is 1 Ad Credit, about ${Math.round(1 / R.standard)} Robux at the standard rate.` : '', tooSmall ? 'err' : '');
    };
    acR.addEventListener('input', () => { acFrom = 'robux'; adCredits(); });
    acC.addEventListener('input', () => { acFrom = 'credits'; adCredits(); });
    $('#ac-b-us18').addEventListener('input', adCredits);

    // tidy the number once you leave a box: 30000 -> 30,000
    calc.querySelectorAll('.rbx-input input').forEach(el => el.addEventListener('blur', () => {
      if (el.value.trim()) el.value = el.inputMode === 'numeric' ? int(whole(el)) : two(money(el));
    }));
    devex();
    adCredits();
  }

  // ---------------------------------------------------------------- cookie banner
  // Analytics cookies are off by default for visitors in Europe (consent mode in
  // the page head). This asks once; the choice is kept on this device.
  if (typeof window.gtag === 'function') {
    const inEurope = (() => { try { return /^Europe\//.test(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch { return false; } })();
    const open = () => {
      if ($('.cookies')) return;
      const box = document.createElement('div');
      box.className = 'cookies';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-labelledby', 'cookies-h');
      const on = store.get('consent') === 'granted';
      box.innerHTML = '<div class="cookies-top"><span class="cookies-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01M16 15.5v.01M12 12v.01M11 17v.01M7 14v.01"/></svg></span>'
        + '<div><h2 id="cookies-h">Cookie preferences</h2><p>I use cookies to see which pages people read. No ads, nothing personal. <a href="/privacy/#cookies">Learn more about cookies</a></p></div>'
        + '<button type="button" class="cookies-x" aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>'
        + '<div class="cookies-opts" hidden>'
        + '<label class="cookies-row"><span><b>Necessary</b><small>Remembers your theme and this choice. Always on.</small></span><input type="checkbox" checked disabled></label>'
        + '<label class="cookies-row"><span><b>Analytics</b><small>Google Analytics: which pages are read, no names.</small></span><input type="checkbox" class="cookies-ga"' + (on ? ' checked' : '') + '></label>'
        + '</div>'
        + '<div class="cookies-btns"><button type="button" class="btn cookies-more">Options</button><button type="button" class="btn cookies-yes">Accept all</button></div>';
      const pick = v => {
        store.set('consent', v);
        window.gtag('consent', 'update', { analytics_storage: v });
        box.remove();
      };
      const opts = box.querySelector('.cookies-opts');
      const more = box.querySelector('.cookies-more');
      more.addEventListener('click', () => {
        if (opts.hidden) { opts.hidden = false; more.textContent = 'Save choice'; return; }
        pick(box.querySelector('.cookies-ga').checked ? 'granted' : 'denied');
      });
      box.querySelector('.cookies-yes').addEventListener('click', () => pick('granted'));
      // closing without a choice counts as "no"
      box.querySelector('.cookies-x').addEventListener('click', () => pick('denied'));
      document.body.append(box);
    };
    if (inEurope && !store.get('consent')) open();
    document.querySelectorAll('.cookie-open').forEach(b => b.addEventListener('click', open));
  }
})();
