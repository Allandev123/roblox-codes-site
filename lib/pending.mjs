// PENDING.md: the codes the scraper found that are not on the site yet.

import fs from 'fs';
import path from 'path';
import { ROOT, isPublished } from './store.mjs';

export function pendingCodes(games) {
  const out = [];
  for (const g of games) for (const c of g.codes) {
    if (!c.approved && !c.rejected) out.push({ game: g, code: c });
  }
  return out;
}

export function writePendingMd(games) {
  const p = pendingCodes(games);
  const md = ['# Codes waiting for approval', ''];
  if (!p.length) md.push('Nothing waiting.');
  else md.push(
    `${p.length} code(s) found by the scraper that are not on the site yet. Approve or reject them with:`, '',
    '```', 'node scripts/review.mjs', '```', '',
    '| Game | Code | Reward | First seen | Description line |', '|---|---|---|---|---|',
    ...p.map(({ game: g, code: c }) =>
      `| ${g.name}${isPublished(g) ? '' : ' (draft)'} | \`${c.code}\` | ${c.reward ?? ''} | ${c.firstSeen.slice(0, 16).replace('T', ' ')} UTC | ${(c.context ?? '').replace(/\|/g, '/')} |`),
  );
  md.push('');
  fs.writeFileSync(path.join(ROOT, 'PENDING.md'), md.join('\n'));
  return p;
}
