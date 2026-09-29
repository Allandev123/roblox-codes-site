// IndexNow: tells Bing, Yandex, Seznam and Naver which URLs changed. (Google
// does not take part; Search Console covers it.) Ownership is proven by
// /<key>.txt, which build.mjs writes from data/settings.json. publish.mjs
// decides which pages changed from the game data, so a "last checked" bump
// alone never triggers a submission.

export async function submit(site, paths) {
  const host = new URL(site.url).host;
  const body = { host, key: site.indexnow.key, keyLocation: `${site.url}/${site.indexnow.key}.txt`, urlList: paths.map(p => site.url + p) };
  try {
    const r = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body),
    });
    // 200 accepted, 202 accepted while the key is being validated
    return { ok: r.status === 200 || r.status === 202, status: String(r.status) };
  } catch (e) {
    return { ok: false, status: e.message };
  }
}
