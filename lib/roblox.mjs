// Thin client for the public Roblox web APIs. No key needed.
//
// Politeness rules: at most 50 ids per batch call, a pause between calls, and
// exponential backoff when Roblox answers 429 or a 5xx.

import sharp from 'sharp';

const DELAY_MS = 400;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let last = 0;

export async function getJson(url, { tries = 6 } = {}) {
  for (let attempt = 0; attempt < tries; attempt++) {
    const wait = last + DELAY_MS - Date.now();
    if (wait > 0) await sleep(wait);
    last = Date.now();
    let r;
    try {
      r = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'rbxcodeshq-bot/1.0 (+https://robloxcodeshq.com/about/)' } });
    } catch (e) {
      if (attempt === tries - 1) throw e;
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    if (r.status === 429 || r.status >= 500) {
      const retryAfter = Number(r.headers.get('retry-after')) || 0;
      await sleep(Math.max(retryAfter * 1000, 1500 * 2 ** attempt));
      continue;
    }
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.json();
  }
  throw new Error(`gave up after ${tries} tries: ${url}`);
}

const chunks = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

export async function universeOf(placeId) {
  const j = await getJson(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
  if (!j.universeId) throw new Error(`no universe for place ${placeId}`);
  return j.universeId;
}

// name, description, playing, visits, updated … keyed by universe id
export async function gameDetails(universeIds) {
  const out = new Map();
  for (const batch of chunks([...new Set(universeIds)], 50)) {
    const j = await getJson(`https://games.roblox.com/v1/games?universeIds=${batch.join(',')}`);
    for (const g of j.data ?? []) out.set(g.id, g);
  }
  return out;
}

// thumbs up / down per universe id
export async function gameVotes(universeIds) {
  const out = new Map();
  for (const batch of chunks([...new Set(universeIds)], 50)) {
    const j = await getJson(`https://games.roblox.com/v1/games/votes?universeIds=${batch.join(',')}`);
    for (const v of j.data ?? []) out.set(v.id, v);
  }
  return out;
}

export async function iconUrls(universeIds, size = '512x512') {
  const out = new Map();
  for (const batch of chunks(universeIds, 50)) {
    const j = await getJson(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${batch.join(',')}&size=${size}&format=Png&isCircular=false`);
    for (const t of j.data ?? []) if (t.state === 'Completed') out.set(t.targetId, t.imageUrl);
  }
  return out;
}

export async function thumbUrl(universeId) {
  const j = await getJson(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=768x432&format=Png&countPerUniverse=1`);
  const t = j.data?.[0]?.thumbnails?.find(x => x.state === 'Completed');
  return t?.imageUrl ?? null;
}

// Downloads a Roblox CDN image and stores it as WebP. The CDN urls expire, so
// the site never hotlinks them.
export async function saveWebp(url, file, { width, height, quality = 80 } = {}) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} downloading ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  let img = sharp(buf);
  if (width || height) img = img.resize(width, height, { fit: 'cover' });
  await img.webp({ quality }).toFile(file);
}

// Places sorted by concurrent players, from the public discover sorts.
export async function topGames(sortIds = ['top-playing-now', 'top-trending', 'up-and-coming', 'fun-with-friends']) {
  const seen = new Map();
  for (const sortId of sortIds) {
    let token = '';
    for (let page = 0; page < 8; page++) {
      const url = `https://apis.roblox.com/explore-api/v1/get-sort-content?sessionId=rbxcodeshq&sortId=${sortId}&device=computer&country=all${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`;
      let j;
      try { j = await getJson(url); } catch { break; }
      for (const g of j.games ?? []) if (!seen.has(g.universeId)) seen.set(g.universeId, g);
      token = j.nextPageToken;
      if (!token) break;
    }
  }
  return [...seen.values()];
}
