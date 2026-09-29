// Adds your own screenshot of a game's code box to its page, and marks the
// redeem steps as checked in-game today.
//
//   node scripts/add-screenshot.mjs <slug> <screenshot.png|jpg> ["caption"]
//
// Take the screenshot in Roblox with the code box open (Win+Shift+S, or the
// Roblox screenshot key), save it, and point this at the file. It's cropped to
// 16:9, saved as data/images/<slug>-redeem.webp and shown under the redeem steps
// with "My screenshot, <date>".

import path from 'path';
import sharp from 'sharp';
import { IMAGES_DIR, loadGames, saveGame } from '../lib/store.mjs';

const [slug, file, caption] = process.argv.slice(2);
const die = m => { console.error(`FAILED: ${m}`); process.exit(1); };
if (!slug || !file) die('usage: node scripts/add-screenshot.mjs <slug> <screenshot file> ["caption"]');
const g = loadGames().find(x => x.slug === slug) ?? die(`no game "${slug}" (see data/games/)`);

const out = `${slug}-redeem.webp`;
await sharp(file).resize(1280, 720, { fit: 'cover', position: 'centre' }).webp({ quality: 80 }).toFile(path.join(IMAGES_DIR, out));
g.redeemImage = out;
if (caption) g.redeemCaption = caption;
g.checkedInGame = new Date().toISOString().slice(0, 10);
saveGame(g);
console.log(`saved ${out} and marked ${g.name}'s redeem steps as checked in-game today.`);
console.log('next: node publish.mjs');
