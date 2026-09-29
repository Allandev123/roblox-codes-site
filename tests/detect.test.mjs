// node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { detectCodes } from '../lib/detect.mjs';
import { mergeScrape } from '../lib/merge.mjs';

const codes = d => detectCodes(d).map(c => c.code);
const one = d => detectCodes(d)[0];

test('inline "use code X for reward"', () => {
  assert.deepEqual(one('Use code 2MILLION for a free Mercenary Pursuit skin!'), { code: '2MILLION', reward: 'Free Mercenary Pursuit skin', context: 'Use code 2MILLION for a free Mercenary Pursuit skin!' });
  assert.equal(one('Use code W7C28D for $500 free cash if you\'re a new player!').reward, '$500 free cash if you\'re a new player');
});

test('quoted codes keep their case and share a reward', () => {
  const r = detectCodes("❤️  Use codes 'FallPart2' & 'Wayfarer' for 4 Hours of 2x Luck & 2x Hatch Speed!");
  assert.deepEqual(r.map(c => c.code), ['FallPart2', 'Wayfarer']);
  assert.ok(r.every(c => c.reward === '4 Hours of 2x Luck & 2x Hatch Speed'));
  assert.deepEqual(codes('🎁 Use code "release" for Free Boost in-game!'), ['release']);
});

test('labelled lists on one line', () => {
  assert.deepEqual(codes('CODES: 1MPLAYS, 2500CCU'), ['1MPLAYS', '2500CCU']);
  assert.deepEqual(codes('CODES: UPD72 | 2MFAVS | 190KLIKES | 2MGROUP'), ['UPD72', '2MFAVS', '190KLIKES', '2MGROUP']);
  assert.deepEqual(codes('Codes: Use RETRO, FREETIX, or NEW'), ['RETRO', 'FREETIX', 'NEW']);
  assert.deepEqual(codes('❤️ NEW CODE : DRAGDRIVESIMULATORSEPTEMBER26 +4 MORE CODES'), ['DRAGDRIVESIMULATORSEPTEMBER26']);
  assert.deepEqual(codes('Code：Welcome'), ['Welcome']);
  assert.deepEqual(codes('🎉NEW CODE:50000CCU'), ['50000CCU']);
});

test('header followed by a list', () => {
  assert.deepEqual(codes('CODES:\nRELEASE\nUPDATE1\nGOLD\n\nAbout the game'), ['RELEASE', 'UPDATE1', 'GOLD']);
  assert.deepEqual(codes('🎁 CODES:\n\n- LIKETHEGAME\n- FUNNYBUBBLE\n\nCreated by: someone'), ['LIKETHEGAME', 'FUNNYBUBBLE']);
  const r = detectCodes('Active codes\n• SPRING - 500 gems\n• EGGHUNT = free pet\nPlay now');
  assert.deepEqual(r.map(c => [c.code, c.reward]), [['SPRING', '500 gems'], ['EGGHUNT', 'Free pet']]);
});

test('rewards after + and "to claim"', () => {
  assert.equal(one('Redeem code: "75MVISIT" +$40.000').reward, '+$40.000');
  assert.equal(one('Redeem Code: Use the code "SPACEFORCE" to claim 1250x FREE Gym Tokens!').reward, '1250x FREE Gym Tokens');
});

test('no false positives from milestone and social lines', () => {
  for (const d of [
    '👍 New Code at 1.1M Likes!',
    'NEW CODE at 1,450,000 LIKES! All current codes are in the community server!',
    'Like, follow, and subscribe for exclusive update news, free knife codes, and more!',
    'Join the community for codes, updates & bug reports',
    'Give the game page a thumbs-up like for more codes!',
    '🔢 SIXTH CODE AT 30,000 LIKES 👍',
    'New code @ 400k likes',
    'Enhance limited-time reward codes! ❤️',
    'Codes: https://discord.gg/abc',
    'Next code at 200K likes!',
  ]) assert.deepEqual(codes(d), [], d);
});

const game = () => ({ codes: [], expired: [], autoApprove: false });

test('new codes wait for approval, then expire when gone', () => {
  const g = game();
  let r = mergeScrape(g, [{ code: 'NEW1', reward: 'x' }], '2026-09-01T00:00:00Z');
  assert.deepEqual(r.added, ['NEW1']);
  assert.equal(g.codes[0].approved, false);
  assert.equal(r.changed, false); // not public yet
  g.codes[0].approved = true;
  r = mergeScrape(g, [], '2026-09-02T00:00:00Z');
  assert.deepEqual(r.expired, ['NEW1']);
  assert.equal(g.expired[0].removed, '2026-09-02');
  assert.equal(g.expired[0].reason, 'no longer listed by the game');
  assert.equal(r.changed, true);
  assert.equal(g.lastChanged, '2026-09-02T00:00:00Z');
  r = mergeScrape(g, [{ code: 'new1', reward: null }], '2026-09-03T00:00:00Z');
  assert.deepEqual(r.restored, ['new1']);
  assert.equal(g.codes[0].approved, true);
});

test('manual codes are never removed; unapproved codes vanish silently', () => {
  const g = game();
  g.codes.push({ code: 'DISCORD1', source: 'manual', approved: true, status: 'active' });
  g.codes.push({ code: 'MAYBE', source: 'description', approved: false, status: 'active' });
  const r = mergeScrape(g, [], '2026-09-05T00:00:00Z');
  assert.deepEqual(g.codes.map(c => c.code), ['DISCORD1']);
  assert.deepEqual(g.expired, []);
  assert.equal(r.changed, false);
  assert.equal(g.lastChecked, '2026-09-05T00:00:00Z');
});

test('autoApprove games publish straight away', () => {
  const g = { ...game(), autoApprove: true };
  const r = mergeScrape(g, [{ code: 'FAST', reward: null }], '2026-09-06T00:00:00Z');
  assert.equal(g.codes[0].approved, true);
  assert.equal(r.changed, true);
});
