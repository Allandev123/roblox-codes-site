// Open Graph images, 1200x630: the game's thumbnail with the title on top.
//
// Text is drawn as SVG paths from the bundled font (opentype.js) instead of
// SVG <text>, so the result doesn't depend on which fonts the build machine
// has installed — Vercel's build image has almost none.

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { ROOT } from './store.mjs';

const W = 1200, H = 630;
const load = f => opentype.parse(fs.readFileSync(path.join(ROOT, 'static', 'fonts', f)).buffer.slice(0));
let fonts;
const F = () => (fonts ??= { bold: load('og-extrabold.ttf'), semi: load('og-semibold.ttf') });

const TEAL = '#f2894a';
const INK = '#1b1815';

// Glyph-by-glyph layout with kerning. opentype.js's own text shaping throws
// on this font's contextual substitution tables, and plain Latin titles don't
// need shaping anyway.
function layoutGlyphs(font, text, size) {
  const scale = size / font.unitsPerEm;
  const glyphs = [...text].map(ch => font.charToGlyph(ch));
  const out = [];
  let x = 0;
  glyphs.forEach((g, i) => {
    out.push({ g, x });
    x += g.advanceWidth * scale;
    if (glyphs[i + 1]) x += font.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  return { out, width: x };
}
function textPath(font, text, x, y, size, fill) {
  const d = layoutGlyphs(font, text, size).out.map(({ g, x: gx }) => g.getPath(x + gx, y, size).toPathData(1)).join('');
  return `<path d="${d}" fill="${fill}"/>`;
}
const width = (font, text, size) => layoutGlyphs(font, text, size).width;

// Greedy wrap to at most `lines` lines, shrinking the size until it fits.
function fit(font, text, maxW, sizes, lines) {
  for (const size of sizes) {
    const words = text.split(/\s+/);
    const out = [''];
    for (const w of words) {
      const cur = out[out.length - 1];
      const next = cur ? `${cur} ${w}` : w;
      if (width(font, next, size) <= maxW) out[out.length - 1] = next;
      else out.push(w);
    }
    if (out.length <= lines && out.every(l => width(font, l, size) <= maxW)) return { size, lines: out };
  }
  const size = sizes[sizes.length - 1];
  return { size, lines: [text] };
}

function logo(x, y) {
  // same gift mark as the site header, 40px
  const s = 40 / 24;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${TEAL}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8c-2-4-6-4-6-1.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z"/></g>`;
}

function overlay({ title, kicker, sub }) {
  const { bold, semi } = F();
  const pad = 64;
  const t = fit(bold, title, W - pad * 2, [92, 84, 76, 68, 60, 54], 2);
  const lineH = t.size * 1.08;
  const subY = H - pad - 4;
  const titleBottom = subY - 52;
  const titleTop = titleBottom - lineH * (t.lines.length - 1);
  const kickerY = titleTop - t.size - 22;
  const kickerW = width(bold, kicker, 30) + 36;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#050807" stop-opacity=".6"/>
  <stop offset=".25" stop-color="#050807" stop-opacity=".3"/>
  <stop offset=".5" stop-color="#050807" stop-opacity=".55"/>
  <stop offset="1" stop-color="#050807" stop-opacity=".94"/>
</linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
${logo(pad, pad - 8)}
${textPath(bold, 'RBXCodes', pad + 58, pad + 24, 30, '#ffffff')}${textPath(bold, 'HQ', pad + 58 + width(bold, 'RBXCodes', 30) + 6, pad + 24, 30, TEAL)}
<rect x="${pad}" y="${kickerY - 34}" width="${kickerW}" height="48" rx="24" fill="${TEAL}"/>
${textPath(bold, kicker, pad + 18, kickerY, 30, INK)}
${t.lines.map((l, i) => textPath(bold, l, pad, titleTop + i * lineH, t.size, '#ffffff')).join('\n')}
${textPath(semi, sub, pad, subY, 34, '#d6e4e1')}
</svg>`;
}

export async function ogImage({ background, title, kicker, sub, out }) {
  const base = background && fs.existsSync(background)
    ? sharp(background).resize(W, H, { fit: 'cover' })
    : sharp({ create: { width: W, height: H, channels: 3, background: '#0a1413' } });
  await base
    .composite([{ input: Buffer.from(overlay({ title, kicker, sub })) }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
}
