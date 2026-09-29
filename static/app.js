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
    const run = () => {
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
      main.classList.toggle('searching', qt.length > 0);
      empty.hidden = !(qt.length && !shown);
      count.innerHTML = !qt.length ? countText : didYouMean ? 'Did you mean one of these?' : `${shown} of ${idx.length} games`;
      clearTimeout(st);
      if (qt.length) st = setTimeout(() => say(shown ? `${shown} game${shown === 1 ? '' : 's'} found` : 'No games found'), 400);
    };
    input.addEventListener('input', run);
    input.addEventListener('keydown', e => { if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; run(); } });
    input.form.addEventListener('submit', e => {
      e.preventDefault();
      const vis = idx.filter(x => !x.li.hidden);
      if (input.value.trim() && vis.length === 1) location.href = vis[0].a.href;
      else { input.blur(); $('#games').scrollIntoView({ block: 'start' }); }
    });
    $('#clear-q')?.addEventListener('click', () => { input.value = ''; run(); input.focus(); });
    const q = new URLSearchParams(location.search).get('q');
    if (q) { input.value = q; run(); }
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
    if (location.hash === '#q') setTimeout(() => input.focus(), 0);
  }
})();
