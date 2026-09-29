(() => {
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  // theme toggle; the saved choice is applied by the inline script in <head>
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) toggle.addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('theme', next);
  });

  // "2 hours ago" from <time datetime>; the server text is an absolute date
  const units = [['year', 31536e6], ['month', 2592e6], ['week', 6048e5], ['day', 864e5], ['hour', 36e5], ['minute', 6e4]];
  const ago = (iso, short) => {
    const ms = Date.now() - Date.parse(iso);
    if (!(ms >= 0)) return null;
    if (ms < 6e4) return 'just now';
    for (const [u, n] of units) if (ms >= n) {
      const v = Math.floor(ms / n);
      return short ? `${v}${u === 'month' ? 'mo' : u[0]} ago` : `${v} ${u}${v > 1 ? 's' : ''} ago`;
    }
    return 'just now';
  };
  const tick = () => document.querySelectorAll('time[data-ago]').forEach(t => {
    const s = ago(t.dateTime, t.dataset.ago === 'short');
    if (s) t.textContent = s;
  });
  tick();
  setInterval(tick, 60000);

  // copy buttons
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
  document.addEventListener('click', async e => {
    const b = e.target.closest('.copy');
    if (!b) return;
    if (!(await copyText(b.dataset.code))) return;
    const label = b.querySelector('span');
    b.classList.add('done');
    label.textContent = 'Copied!';
    clearTimeout(b._t);
    b._t = setTimeout(() => { b.classList.remove('done'); label.textContent = 'Copy'; }, 1800);
  });

  // home search: filters the grid in place, and reads ?q= for the SearchAction
  const input = document.getElementById('q');
  if (input) {
    const cards = [...document.querySelectorAll('#games .card')];
    const empty = document.getElementById('no-results');
    const recent = document.getElementById('recent');
    const norm = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();
    const run = () => {
      const q = norm(input.value);
      let shown = 0;
      for (const c of cards) {
        const hit = !q || c.dataset.name.includes(q);
        c.hidden = !hit;
        if (hit) shown++;
      }
      if (recent) recent.hidden = !!q;
      empty.classList.toggle('show', shown === 0);
    };
    input.addEventListener('input', run);
    const q = new URLSearchParams(location.search).get('q');
    if (q) { input.value = q; run(); }
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement !== input && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
  }
})();
