// Folds one scrape of a game's description into its data file.
//
//   mergeScrape(game, detected, now) -> { changed, added, expired, restored, pending }
//
// Rules:
//   - A brand-new code goes in with approved:false unless the game has
//     autoApprove. It is not shown on the site until approved.
//   - A description code that disappears moves to expired with today's date.
//     An unapproved one that disappears was never shown, so it is just dropped.
//   - A code that comes back after expiring is restored with its old approval.
//   - Manual codes (source:"manual") are never touched here.
//   - lastChecked moves on every run; lastChanged only when the public list
//     (approved working codes + expired) changes.

const same = (a, b) => a.toLowerCase() === b.toLowerCase();

export function publicSignature(g) {
  const live = g.codes.filter(c => c.approved && c.status === 'active').map(c => `${c.code}|${c.reward ?? ''}`).sort();
  const gone = g.expired.map(c => c.code).sort();
  return JSON.stringify([live, gone]);
}

export function mergeScrape(game, detected, now = new Date().toISOString()) {
  const before = publicSignature(game);
  const today = now.slice(0, 10);
  const report = { added: [], expired: [], restored: [], pending: [] };

  for (const d of detected) {
    const hit = game.codes.find(c => same(c.code, d.code));
    if (hit) {
      if (hit.source === 'manual') continue;
      hit.lastSeen = now;
      // the developer changed the casing: the description is the authority
      if (hit.code !== d.code) hit.code = d.code;
      if (!hit.reward && d.reward) hit.reward = d.reward;
      if (!hit.approved && d.context) hit.context = d.context;
      continue;
    }
    const old = game.expired.findIndex(c => same(c.code, d.code));
    if (old !== -1) {
      const [e] = game.expired.splice(old, 1);
      game.codes.push({
        code: d.code, reward: e.reward || d.reward || null, status: 'active',
        firstSeen: e.firstSeen ?? now, lastSeen: now, source: 'description',
        approved: e.approved !== false,
      });
      report.restored.push(d.code);
      continue;
    }
    const approved = game.autoApprove === true;
    game.codes.push({
      code: d.code, reward: d.reward ?? null, status: 'active',
      firstSeen: now, lastSeen: now, source: 'description', approved,
      ...(approved ? { approvedAt: now } : { context: d.context ?? null }),
    });
    report.added.push(d.code);
  }

  const keep = [];
  for (const c of game.codes) {
    const stillListed = detected.some(d => same(d.code, c.code));
    if (c.source !== 'description' || stillListed) { keep.push(c); continue; }
    if (c.approved) {
      game.expired.unshift({
        code: c.code, reward: c.reward ?? null, removed: today,
        firstSeen: c.firstSeen, approved: true, reason: 'no longer listed by the game',
      });
      report.expired.push(c.code);
    }
    // unapproved and gone: never shown, nothing to record
  }
  game.codes = keep;

  report.pending = game.codes.filter(c => !c.approved && !c.rejected).map(c => c.code);
  game.lastChecked = now;
  report.changed = publicSignature(game) !== before;
  if (report.changed) game.lastChanged = now;
  return report;
}
