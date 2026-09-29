// Finds promo codes in a Roblox game description.
//
//   detectCodes(description) -> [{ code, reward|null }]
//
// Descriptions are free text written by developers, so this is deliberately
// conservative: a token only counts when the text around it says it is a code
// (a "code:" label, "use code X", a quoted word after "code", or a list under a
// CODES header). Everything it finds still goes through the approval queue
// unless a game is flagged autoApprove, so a miss is cheaper than a false hit.

const STOP = new Set(`
  a an and are as at be by for from here in is it of on or our the this that these those to up us we with you your
  all also any below above more next new now free get got use using enter redeem type claim just only soon some
  code codes coded update updates updated like likes liked favorite favourite favorites group groups join discord
  community server servers twitter youtube x social socials game games play player players
  visit visits reward rewards gift gifts boost boosts luck cash coins gems item items limited time link links
  today week weekly daily hour hours minute minutes will can need click tap button menu shop store settings
  thanks thank thx please support subscribe follow check out every each first second third last latest
  expired expire expires active working valid invalid none tba tbd
`.trim().split(/\s+/));

// Words that turn "code" into something other than a label: "next code at 1M
// likes", "code in the community server".
const AFTER_CODE_NOISE = /^(at|@|in|on|when|after|every|drops?|coming|releases?|soon|are|is|will|for|from|by|to)\b/i;

const LINK = /https?:|www\.|\.com\b|\.gg\b|\/|\\/i;
const BULLET = /^[\s\-–—•·*▪▫►▶➢➤→>~|+]+/u;
// Emoji and pictographs, which decorate almost every header line.
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}\u{1F1E6}-\u{1F1FF}]/gu;
const QUOTES = /["'“”‘’`«»「」]/;
const Q = `["'“”‘’\`«»「」]`;

const TOKEN_RE = /^[A-Za-z0-9][A-Za-z0-9_!]{1,29}$/;
// Quoted codes can carry a little punctuation ("$1.2M"), since the quotes make
// the boundary unambiguous.
const QUOTED_TOKEN_RE = /^[A-Za-z0-9$][A-Za-z0-9_!$.#\-]{1,29}$/;

// Quoted and listed tokens are already marked as codes by their context, so
// only words that are never codes are rejected there.
const HARD_STOP = new Set('a an and the for to in at of on or is are code codes here below above tba tbd none soon'.split(' '));

export function isCodeLike(tok, { quoted = false, listed = false } = {}) {
  if (!tok) return false;
  if (tok.length < 3 || tok.length > 30) return false;
  if (LINK.test(tok)) return false;
  if (!(quoted ? QUOTED_TOKEN_RE : TOKEN_RE).test(tok)) return false;
  if (!/[A-Za-z]/.test(tok)) return false; // pure numbers are like counts, not codes
  if ((quoted || listed ? HARD_STOP : STOP).has(tok.toLowerCase())) return false;
  // "1.4M", "200K", "10x" are milestones and multipliers, not codes
  if (/^\d+(\.\d+)?[kmbx]$/i.test(tok)) return false;
  return true;
}

const clean = s => s.replace(EMOJI, ' ').replace(/\s+/g, ' ').trim();

function tidyReward(r) {
  if (!r) return null;
  r = clean(r)
    .replace(/^(for|to (get|receive|claim|unlock|earn)|gives?|=|-|–|—|:|→|->)\s*/i, '')
    .replace(/\s*(,|;)?\s*(next|new|more)\s+codes?\b.*$/i, '')
    .replace(/[!.\s]+$/, '')
    .replace(/^(a|an|some|the)\s+/i, '')
    .trim();
  if (!r || r.length < 3) return null;
  if (r.length > 90) r = r.slice(0, 87).replace(/\s+\S*$/, '') + '…';
  return r[0].toUpperCase() + r.slice(1);
}

// "X for 4 hours of 2x luck", "X - 500 gems", "X = free pet"
function rewardAfter(rest) {
  const m = rest.match(/^\s*(?:,\s*)?(?:(?:for|to (?:get|receive|claim|unlock|earn))\s+|gives?\s+|[=\-–—:→]\s*|->\s*|(?=\+\s*\S))([^\n!?]*?)(?:[!?]|\.(?!\d)|$)/i);
  return m ? tidyReward(m[1]) : null;
}

// context is the description line the code came from, shown in review.mjs
let context = '';
function add(out, code, reward) {
  const hit = out.find(c => c.code.toLowerCase() === code.toLowerCase());
  if (hit) { if (!hit.reward && reward) hit.reward = reward; return; }
  out.push({ code, reward: reward ?? null, context });
}

// One header-list item: "CODE", "- CODE", "CODE - reward", "CODE = reward"
function listItem(line) {
  let s = clean(line).replace(BULLET, '').trim();
  if (!s) return null;
  let quoted = false;
  const q = s.match(new RegExp(`^${Q}([^"'“”‘’\`«»「」]{3,30})${Q}(.*)$`));
  let tok, rest;
  if (q) { tok = q[1]; rest = q[2]; quoted = true; }
  else {
    const m = s.match(/^([^\s:=,|–—]+)(.*)$/);
    if (!m) return null;
    [, tok, rest] = m;
  }
  if (!isCodeLike(tok, { quoted, listed: true })) return null;
  // a sentence, not a code line
  if (!/^\s*([=\-–—:→(]|->|$)/.test(rest)) return null;
  let reward = null;
  const r = rest.match(/^\s*(?:[=\-–—:→]|->)\s*(.+)$/) || rest.match(/^\s*\((.+)\)\s*$/);
  if (r) reward = tidyReward(r[1]);
  return { code: tok, reward };
}

// "RELEASE, UPDATE1 | GOLD & SEAL" -> tokens (unquoted or quoted)
function splitList(s) {
  return s.split(/\s*(?:,|\||&|\/| and |;|\s{2,}|\s+\+\s+)\s*/i).map(x => x.trim()).filter(Boolean);
}

export function detectCodes(description) {
  const out = [];
  if (!description) return out;
  const lines = description.replace(/\r/g, '').split('\n');

  for (let i = 0; i < lines.length; i++) {
    // links never hold codes, and their slashes would split into fake list items
    const raw = lines[i].replace(/(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:gg|com|net|io|me)\/\S*/gi, ' ');
    const line = clean(raw);
    if (!line || !/\bcodes?\b|\bredeem\b/i.test(line)) continue;
    context = line.slice(0, 160);

    // 1. Quoted tokens on a line that talks about codes: use code "X" / 'X'
    for (const m of raw.matchAll(new RegExp(`\\b(?:codes?|redeem)\\b[^\\n]*?${Q}([^"'“”‘’\`«»「」\\n]{3,30})${Q}`, 'gi'))) {
      // every quoted token on the line after the word, not just the first
      const tail = raw.slice(m.index);
      const found = [];
      for (const q of tail.matchAll(new RegExp(`${Q}([^"'“”‘’\`«»「」\\n]{3,30})${Q}([^"'“”‘’\`«»「」\\n]*)`, 'g'))) {
        const tok = q[1].trim();
        if (!isCodeLike(tok, { quoted: true })) continue;
        found.push({ tok, between: q[2], reward: rewardAfter(q[2]) });
      }
      // 'A' & 'B' for 2x luck: the reward belongs to both
      for (let k = found.length - 2; k >= 0; k--) {
        if (!found[k].reward && /^\s*(&|and|,|\+)\s*$/i.test(found[k].between)) found[k].reward = found[k + 1].reward;
      }
      for (const f of found) add(out, f.tok, f.reward);
      break;
    }

    // 2. Labelled: "CODES: A, B", "NEW CODE : X +4 MORE", "Code：Welcome", "use this code: X"
    const lab = line.match(/\b(?:codes?|redeem codes?)\s*(?:[:：=]|->|→|-(?=\s))\s*(.+)$/i);
    if (lab && !QUOTES.test(lab[1].slice(0, 1))) {
      const body = lab[1].replace(/\s*\+\s*\d+\s+more\b.*$/i, '');
      const parts = splitList(body);
      // single code followed by a reward: "CODE: X - 500 gems" / "X for 2x luck"
      const first = parts[0]?.match(/^(\S+)(.*)$/);
      if (parts.length === 1 && first) {
        const tok = first[1].replace(/[!.,]+$/, '');
        if (isCodeLike(tok)) add(out, tok, rewardAfter(first[2]));
      } else {
        // "Use RETRO, FREETIX, or NEW": a comma list after a label is a list of
        // codes, so common words in it still count
        for (const p of parts) {
          const words = p.replace(/^(?:use|or|and|try)\s+/i, '');
          const tok = words.split(/\s+/)[0].replace(/[!.,]+$/, '').replace(/^["'“”]|["'“”]$/g, '');
          if (isCodeLike(tok, { listed: true })) add(out, tok, rewardAfter(words.slice(tok.length)));
        }
      }
    }

    // 3. Inline: "use code X for …", "enter code X", "new code X"
    for (const m of line.matchAll(/\b(?:use|enter|redeem|type|try|new|claim)\s+(?:the\s+|this\s+|our\s+|my\s+)?(?:promo\s+|secret\s+|new\s+)?codes?\s+(?!:)([^\s,!?.:：]+)([^\n]*)/gi)) {
      const tok = m[1];
      if (AFTER_CODE_NOISE.test(tok) || QUOTES.test(tok[0])) continue;
      if (isCodeLike(tok)) add(out, tok, rewardAfter(m[2]));
    }

    // 4. Header line followed by a list: "🎁 CODES:" / "🌟NEW CODE🌟" / "Active codes"
    const header = line.replace(/[^A-Za-z ]/g, ' ').replace(/\s+/g, ' ').trim();
    if (/^(?:(?:new|active|current|working|all|free|latest)\s+)*(?:promo\s+)?codes?(?:\s+(?:list|below))?$/i.test(header) &&
        !/[:：]\s*\S/.test(line.replace(/^.*?codes?/i, ''))) {
      let blank = 0;
      let got = 0;
      for (let j = i + 1; j < lines.length && j < i + 40; j++) {
        const l = clean(lines[j]);
        if (!l) { if (got || ++blank > 1) break; continue; }
        const item = listItem(lines[j]);
        if (!item) {
          // a single line holding a comma list: "A, B, C"
          const parts = splitList(l);
          if (!got && parts.length > 1 && parts.every(p => isCodeLike(p.replace(/^["'“”]|["'“”]$/g, ''), { quoted: true }))) {
            for (const p of parts) add(out, p.replace(/^["'“”]|["'“”]$/g, ''), null);
            got += parts.length;
          }
          break;
        }
        context = `${line.slice(0, 60)} … ${l.slice(0, 90)}`;
        add(out, item.code, item.reward);
        got++;
      }
    }
  }
  return out;
}
