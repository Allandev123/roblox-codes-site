// ==UserScript==
// @name         RBXCodesHQ - Request Indexing
// @namespace    https://www.robloxcodeshq.com/
// @version      1.1.0
// @description  Goes through robloxcodeshq.com's sitemap in Search Console URL Inspection and clicks "Request indexing" for pages that aren't on Google yet, up to the daily limit.
// @author       AllanIsGreasy
// @match        https://search.google.com/search-console*
// @match        https://search.google.com/u/*/search-console*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @connect      www.robloxcodeshq.com
// @run-at       document-idle
// @noframes
// ==/UserScript==

// How to use: open Search Console on the robloxcodeshq.com property (English language),
// press Start in the panel at the bottom right, and keep the tab in front until it says it's done.
// Search Console reloads the page for every inspection, so every step is saved and the script
// carries on by itself after each reload.

(function () {
  'use strict';

  // ---- Settings ----
  const SITE = 'https://www.robloxcodeshq.com';
  const SITEMAP = SITE + '/sitemap.xml';
  const DAILY_CAP = 12; // Google allows roughly 10-12 requests a day per property
  const RETRY_AFTER_DAYS = 14; // ask again if a page still isn't on Google after this long
  const PRIORITY = [
    // done first, in this order
    '/99-nights-in-the-forest-codes/',
    '/grow-a-garden-codes/',
    '/steal-a-brainrot-codes/',
    '/blox-fruits-codes/',
    '/rivals-codes/',
    '/dress-to-impress-codes/',
    '/fisch-codes/',
    '/blade-ball-codes/',
    '/doors-codes/',
    '/about/',
  ];
  const LAST = ['/contact/', '/terms/', '/disclaimer/', '/privacy/']; // done after everything else

  // ---- Small helpers ----
  const PAGE_ID = Math.random().toString(36).slice(2); // changes on every page load
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a));
  const today = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD, local time
  const daysSince = (d) => Math.round((new Date(today()) - new Date(d)) / 864e5);
  const short = (url) => url.replace(SITE, '') || '/';
  const norm = (u) => (u || '').trim().replace(/\/+$/, '').toLowerCase();
  const bodyText = () => document.body.innerText;
  const visible = (el) =>
    !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';

  class Stopped extends Error {}
  class Fatal extends Error {}
  let stopRequested = false;
  let busy = false;
  let lastBeat = 0;

  // Called in every wait: honours Stop and tells a reloaded page that a run is in progress.
  function tick() {
    if (stopRequested) throw new Stopped('Stopped');
    if (Date.now() - lastBeat > 5000) {
      lastBeat = Date.now();
      GM_setValue('heartbeat', lastBeat);
    }
  }

  async function waitFor(fn, ms, what) {
    const end = Date.now() + ms;
    for (;;) {
      tick();
      const v = fn();
      if (v) return v;
      if (Date.now() > end) throw new Error('timed out waiting for ' + what);
      await sleep(500);
    }
  }

  // ---- Saved state (Tampermonkey keeps it between page loads) ----
  // history: url -> { s: 'requested' | 'indexed' | 'rejected' | 'failed', t: 'YYYY-MM-DD' }
  const history = () => GM_getValue('history', {});
  function remember(url, s) {
    const h = history();
    h[url] = { s, t: today() };
    GM_setValue('history', h);
  }
  function due(url, h) {
    const e = h[url];
    if (!e) return true;
    if (e.s === 'indexed') return false;
    return daysSince(e.t) >= (e.s === 'failed' ? 1 : RETRY_AFTER_DAYS);
  }
  function getDay() {
    const d = GM_getValue('day', null);
    return d && d.date === today() ? d : { date: today(), count: 0, quotaHit: false };
  }
  const setDay = (d) => GM_setValue('day', d);
  // job: the page being worked on right now, so a reload can carry on from the same step
  const getJob = () => GM_getValue('job', null);
  const saveJob = (job) => GM_setValue('job', job);

  // ---- Sitemap ----
  function fetchText(url) {
    return new Promise((resolve, reject) =>
      GM_xmlhttpRequest({
        method: 'GET',
        url: url + '?t=' + Date.now(),
        timeout: 20000,
        onload: (r) =>
          r.status === 200 ? resolve(r.responseText) : reject(new Fatal('sitemap returned HTTP ' + r.status)),
        onerror: () => reject(new Fatal('could not load the sitemap')),
        ontimeout: () => reject(new Fatal('the sitemap timed out')),
      })
    );
  }

  async function loadSitemap() {
    const xml = await fetchText(SITEMAP);
    const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
    const rank = (u) => {
      const p = new URL(u).pathname;
      if (PRIORITY.includes(p)) return PRIORITY.indexOf(p);
      return LAST.includes(p) ? 2000 : 1000;
    };
    return urls.sort((a, b) => rank(a) - rank(b));
  }

  // ---- Reading and clicking the Search Console page ----
  const findInspectBox = () =>
    [...document.querySelectorAll('input[aria-label^="Inspect any URL"]')].find(visible);

  // Finds a visible, enabled control by its exact label text.
  function findControl(re, root = document.body) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (!re.test(n.nodeValue.trim())) continue;
      const p = n.parentElement;
      if (!visible(p) || p.closest('[aria-disabled="true"], [disabled]')) continue;
      return p.closest('[role="button"], button, a') || p;
    }
    return null;
  }
  const findRequestButton = () => findControl(/^request indexing$/i);

  function pageShowsUrl(url) {
    const box = findInspectBox();
    if (box && norm(box.value) === norm(url)) return true;
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (norm(n.nodeValue) !== norm(url)) continue;
      const p = n.parentElement;
      if (visible(p) && !p.closest('[role="listbox"]')) return true;
    }
    return false;
  }

  function click(el) {
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    const o = { bubbles: true, cancelable: true, button: 0, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    el.dispatchEvent(new PointerEvent('pointerdown', o));
    el.dispatchEvent(new MouseEvent('mousedown', o));
    el.dispatchEvent(new PointerEvent('pointerup', o));
    el.dispatchEvent(new MouseEvent('mouseup', o));
    el.dispatchEvent(new MouseEvent('click', o));
  }

  function press(el, keyName, code) {
    for (const type of ['keydown', 'keypress', 'keyup']) {
      const ev = new KeyboardEvent(type, { key: keyName, code: keyName, keyCode: code, which: code, bubbles: true, cancelable: true });
      if (ev.keyCode !== code) {
        try {
          Object.defineProperty(ev, 'keyCode', { get: () => code });
          Object.defineProperty(ev, 'which', { get: () => code });
        } catch (e) {}
      }
      el.dispatchEvent(ev);
    }
  }

  function typeUrl(box, url) {
    box.focus();
    click(box);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(box, url);
    box.dispatchEvent(new Event('input', { bubbles: true }));
    press(box, 'Enter', 13);
  }

  // We never touch the robot check. The script waits for you to do it.
  const captchaShowing = () =>
    [...document.querySelectorAll('iframe[src*="recaptcha"]')].some(
      (f) => visible(f) && !/size=invisible/.test(f.src) && f.getBoundingClientRect().height > 50
    );

  const visibleDialogs = () =>
    [...document.querySelectorAll('[role="dialog"], [role="alertdialog"]')].filter(visible);

  function outcome(job) {
    for (const d of visibleDialogs()) {
      const t = d.innerText;
      if (/quota/i.test(t)) return { kind: 'quota', d, text: t };
      if (/indexing requested|priority crawl queue/i.test(t)) return { kind: 'requested', d, text: t };
      if (/rejected|went wrong|error/i.test(t)) return { kind: 'rejected', d, text: t };
    }
    const t = bodyText();
    if (/quota exceeded/i.test(t)) return { kind: 'quota', text: '' };
    if (!job.hadRequestedText && /indexing requested/i.test(t)) return { kind: 'requested', text: '' };
    return null;
  }

  async function closePopup(d) {
    const b = findControl(/^(got it|ok|dismiss|close|done)$/i, d || document.body);
    if (b) click(b);
    else press(document.activeElement || document.body, 'Escape', 27);
    if (d) {
      try {
        await waitFor(() => !visible(d), 8000, 'the popup to close');
      } catch (e) {
        if (e instanceof Stopped) throw e;
      }
    }
  }

  // ---- One page: inspect it, then request indexing if it isn't on Google ----
  async function inspect(job) {
    for (;;) {
      if (!job.typed) {
        if (job.tries >= 3) throw new Error('could not open the inspection');
        const box = await waitFor(findInspectBox, 20000, 'the "Inspect any URL" box');
        const alreadyHere = location.pathname.includes('/inspect') && norm(box.value) === norm(job.url);
        Object.assign(job, { typed: true, tries: job.tries + 1, page: alreadyHere ? 'here' : PAGE_ID, before: location.href });
        saveJob(job); // saved before Enter, because Enter reloads the page
        if (!alreadyHere) typeUrl(box, job.url);
      }
      setStatus('Inspecting ' + short(job.url) + ' ...');
      const t0 = Date.now();
      let hinted = false;
      while (Date.now() - t0 < 60000) {
        tick();
        const moved = job.page !== PAGE_ID || location.href !== job.before;
        if (moved && location.pathname.includes('/inspect')) {
          if (pageShowsUrl(job.url) || Date.now() - t0 > 15000) {
            if (bodyText().includes('URL is on Google')) return 'indexed';
            if (findRequestButton()) {
              await sleep(1500); // let the verdict text finish rendering
              return bodyText().includes('URL is on Google') ? 'indexed' : 'ready';
            }
          }
        } else if (!hinted && Date.now() - t0 > 10000) {
          hinted = true;
          setStatus('Press Enter in the "Inspect any URL" box at the top.');
        }
        await sleep(500);
      }
      log('  no result for ' + short(job.url) + ', trying again');
      job.typed = false;
      saveJob(job);
    }
  }

  async function processJob(job) {
    // The page reloaded while we waited for Google's answer: start this page over.
    if (job.step === 'requesting' && job.page !== PAGE_ID) Object.assign(job, { step: 'inspect', typed: false });

    if (job.step === 'inspect') {
      const v = await inspect(job);
      if (v === 'indexed') return { kind: 'indexed' };
      const btn = findRequestButton();
      if (!btn) throw new Error('the "Request indexing" button disappeared');
      Object.assign(job, {
        step: 'requesting', page: PAGE_ID, at: Date.now(),
        hadRequestedText: /indexing requested/i.test(bodyText()),
      });
      saveJob(job);
      click(btn);
    }

    const testing = 'Google is testing ' + short(job.url) + ' (1-2 min) ...';
    setStatus(testing);
    let reclicked = false;
    for (;;) {
      tick();
      if (captchaShowing()) {
        setStatus('Google wants a "not a robot" check. Do it yourself, then the script carries on.');
        await waitFor(() => !captchaShowing(), 15 * 60000, 'the robot check');
        setStatus(testing);
      }
      const o = outcome(job);
      if (o) {
        await closePopup(o.d);
        return { kind: o.kind, text: o.text.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 2).join(' - ') };
      }
      const age = Date.now() - job.at;
      const working = visibleDialogs().length > 0 || /testing if live url/i.test(bodyText());
      if (!working && age > 20000) {
        const b = findRequestButton();
        if (reclicked || !b) throw new Error('clicking "Request indexing" did nothing');
        reclicked = true;
        job.at = Date.now();
        click(b);
      }
      if (age > 4 * 60000) throw new Error('no answer from Google after 4 minutes');
      await sleep(1000);
    }
  }

  // ---- Main loop ----
  async function run(resuming) {
    if (busy) return;
    busy = true;
    stopRequested = false;
    lastBeat = 0;
    setButtons();
    try {
      tick();
      const box = await waitFor(findInspectBox, 20000, 'Search Console to load').catch(() => null);
      if (!box || !/robloxcodeshq\.com/i.test(box.getAttribute('aria-label') || ''))
        throw new Fatal('Open the robloxcodeshq.com property in Search Console first (in English).');

      // A fresh Start begins the current page again from the top.
      const old = getJob();
      if (old && !resuming) saveJob(Object.assign(old, { step: 'inspect', typed: false, tries: 0 }));

      const urls = await loadSitemap();
      if (!resuming) log(urls.filter((u) => due(u, history())).length + ' pages waiting');

      for (;;) {
        tick();
        let job = getJob();
        if (!job) {
          const day = getDay();
          if (day.quotaHit) {
            setStatus("Google's daily limit is used up. Press Start again tomorrow.");
            break;
          }
          if (day.count >= DAILY_CAP) {
            setStatus('Done for today (' + day.count + '/' + DAILY_CAP + '). Press Start again tomorrow.');
            break;
          }
          const h = history();
          const url = urls.find((u) => due(u, h));
          if (!url) {
            setStatus('Every page is handled. Start again in a few days to catch new ones.');
            break;
          }
          job = { url, step: 'inspect', typed: false, tries: 0 };
          saveJob(job);
        }
        refreshCounts(urls);

        let r;
        try {
          r = await processJob(job);
          GM_setValue('fails', 0);
        } catch (e) {
          if (e instanceof Stopped || e instanceof Fatal) throw e;
          saveJob(null);
          remember(job.url, 'failed'); // tried again tomorrow
          log('! ' + short(job.url) + ': ' + e.message);
          const fails = GM_getValue('fails', 0) + 1;
          GM_setValue('fails', fails);
          if (fails >= 3) {
            GM_setValue('fails', 0);
            throw new Fatal('3 pages failed in a row, so it stopped. Press "Copy debug" and send it to Claude.');
          }
          continue;
        }

        saveJob(null);
        const day = getDay();
        if (r.kind === 'indexed') {
          remember(job.url, 'indexed');
          log('= ' + short(job.url) + ' is already on Google');
        } else if (r.kind === 'requested') {
          remember(job.url, 'requested');
          day.count++;
          setDay(day);
          log('+ ' + short(job.url) + ' requested');
        } else if (r.kind === 'rejected') {
          remember(job.url, 'rejected');
          log('x ' + short(job.url) + ': ' + r.text);
        } else if (r.kind === 'quota') {
          day.quotaHit = true;
          setDay(day);
          log("Google's daily limit reached");
          continue; // the loop top stops; this page goes first tomorrow
        }
        refreshCounts(urls);
        await sleep(r.kind === 'indexed' ? rand(1500, 3000) : rand(4000, 9000));
      }
    } catch (e) {
      if (e instanceof Stopped) {
        saveJob(null);
        setStatus('Stopped.');
      } else {
        setStatus((e instanceof Fatal ? '' : 'Error: ') + e.message);
      }
    } finally {
      busy = false;
      GM_setValue('heartbeat', 0);
      setButtons();
      refreshCounts();
    }
  }

  // ---- Debug info (small text, safe to paste to Claude) ----
  function debugInfo() {
    const box = findInspectBox();
    const btn = findRequestButton();
    const verdicts = (bodyText().match(/URL is [^\n]{0,40}/g) || []).slice(0, 3);
    return JSON.stringify(
      {
        version: '1.1.0',
        path: location.pathname,
        job: getJob(),
        day: getDay(),
        heartbeatAgeSec: Math.round((Date.now() - GM_getValue('heartbeat', 0)) / 1000),
        inspectBox: box ? { label: box.getAttribute('aria-label'), value: box.value } : null,
        requestButton: btn ? { tag: btn.tagName, role: btn.getAttribute('role'), text: btn.textContent.trim().slice(0, 40) } : null,
        verdicts,
        dialogs: visibleDialogs().map((d) => d.innerText.trim().slice(0, 120)),
        captcha: captchaShowing(),
        status: statusEl.textContent,
        log: GM_getValue('log', []).slice(0, 15),
      },
      null,
      1
    );
  }

  // ---- Panel ----
  let statusEl, countsEl, logEl, startBtn, stopBtn, bodyEl;

  function el(tag, text, style) {
    const e = document.createElement(tag);
    if (text) e.textContent = text;
    Object.assign(e.style, style || {});
    return e;
  }

  function btn(label, bg, onClick) {
    const b = el('button', label, {
      background: bg, color: '#fff', border: '0', borderRadius: '6px', padding: '6px 10px',
      cursor: 'pointer', font: 'inherit', fontWeight: 'bold',
    });
    b.addEventListener('click', onClick);
    return b;
  }

  function buildPanel() {
    const panel = el('div', '', {
      position: 'fixed', right: '16px', bottom: '16px', zIndex: '2147483647', width: '340px',
      background: '#1f1f1f', color: '#eee', font: '13px/1.4 Arial, sans-serif', borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,.45)', padding: '12px',
    });
    const title = el('div', 'RBXCodesHQ - Request indexing  [-]', { fontWeight: 'bold', cursor: 'pointer' });
    bodyEl = el('div', '', { marginTop: '6px' });
    title.addEventListener('click', () => {
      const hidden = bodyEl.style.display === 'none';
      bodyEl.style.display = hidden ? '' : 'none';
      title.textContent = 'RBXCodesHQ - Request indexing  ' + (hidden ? '[-]' : '[+]');
    });

    statusEl = el('div', 'Ready. Press Start.', { marginBottom: '4px' });
    countsEl = el('div', '', { color: '#aaa', marginBottom: '8px' });
    const row = el('div', '', { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' });
    startBtn = btn('Start', '#1a73e8', () => run(false));
    stopBtn = btn('Stop', '#555', () => {
      stopRequested = true;
      setStatus('Stopping ...');
    });
    const resetBtn = btn('Reset', '#555', () => {
      if (busy) return;
      if (!confirm("Forget which pages were already requested? (Today's count stays.)")) return;
      GM_setValue('history', {});
      saveJob(null);
      log('History cleared');
      refreshCounts();
    });
    const debugBtn = btn('Copy debug', '#555', () => {
      GM_setClipboard(debugInfo(), 'text');
      log('Debug info copied');
    });
    row.append(startBtn, stopBtn, resetBtn, debugBtn);
    logEl = el('div', '', {
      maxHeight: '150px', overflowY: 'auto', fontFamily: 'Consolas, monospace', fontSize: '12px', color: '#ccc',
    });

    bodyEl.append(statusEl, countsEl, row, logEl);
    panel.append(title, bodyEl);
    document.body.append(panel);
    for (const line of GM_getValue('log', [])) logEl.append(el('div', line));
    setButtons();
    refreshCounts();
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  // The log is saved too, so it survives the reloads.
  function log(text) {
    const time = new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
    const line = time + '  ' + text;
    GM_setValue('log', [line, ...GM_getValue('log', [])].slice(0, 40));
    logEl.prepend(el('div', line));
    while (logEl.childNodes.length > 40) logEl.lastChild.remove();
  }

  function refreshCounts(urls) {
    const hist = history();
    const h = Object.values(hist);
    const day = getDay();
    countsEl.textContent =
      'Today: ' + day.count + '/' + DAILY_CAP + (day.quotaHit ? ' (limit hit)' : '') +
      ' | Requested: ' + h.filter((x) => x.s === 'requested').length +
      ' | On Google: ' + h.filter((x) => x.s === 'indexed').length +
      (urls ? ' | Left: ' + urls.filter((u) => due(u, hist)).length : '');
  }

  function setButtons() {
    startBtn.disabled = busy;
    stopBtn.disabled = !busy;
    startBtn.style.opacity = busy ? '0.5' : '1';
    stopBtn.style.opacity = busy ? '1' : '0.5';
  }

  buildPanel();

  // A run was going when the page reloaded: carry on.
  if (Date.now() - GM_getValue('heartbeat', 0) < 2 * 60000) {
    setStatus('Carrying on ...');
    setTimeout(() => run(true), 1500);
  }
})();
