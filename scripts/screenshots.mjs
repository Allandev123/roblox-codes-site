// Full-page screenshots of the local build at phone and desktop width, light and dark.
//
//   node scripts/screenshots.mjs [baseUrl] [outDir] [path ...]
//
// Needs a running server (npm run dev) and a local Chrome or Edge.

import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const [base = 'http://localhost:4321', out = 'screenshots', ...paths] = process.argv.slice(2);
const targets = paths.length ? paths : ['/'];
const browsers = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const executablePath = browsers.find(p => fs.existsSync(p));
if (!executablePath) throw new Error('no Chrome found; set CHROME_PATH');

fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath, headless: true });
const sizes = [['phone', 390, 844, true], ['desktop', 1366, 900, false]];
for (const p of targets) {
  for (const [label, width, height, isMobile] of sizes) {
    for (const scheme of ['light', 'dark']) {
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: isMobile ? 2 : 1, isMobile, hasTouch: isMobile });
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
      await page.goto(base + p, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      // load lazy images before the full-page capture
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await page.waitForNetworkIdle({ idleTime: 300 }).catch(() => {});
      const name = `${(p.replace(/\//g, '-').replace(/^-|-$/g, '') || 'home')}-${label}-${scheme}.png`;
      await page.screenshot({ path: path.join(out, name), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      console.log(`${name}${overflow ? '  !! horizontal overflow' : ''}`);
      await page.close();
    }
  }
}
await browser.close();
