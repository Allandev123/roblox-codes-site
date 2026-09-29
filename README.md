# RBXCodesHQ

Working Roblox game codes, one page per game, checked every few hours.
Static site: `build.mjs` turns `data/` into plain HTML in `dist/`, Vercel serves it.

## Everyday commands

```bash
node scripts/review.mjs                  # approve / reject codes the scraper found (one key each)
node publish.mjs --push                  # build, run every check, commit, push (Vercel deploys), ping IndexNow
```

## Adding a game

```bash
node scripts/discover.mjs                # popular games that list codes in their description, biggest first
node scripts/add-game.mjs <roblox game url>
```

`add-game` creates `data/games/<slug>.json` as a draft, saves the icon and thumbnail as WebP and runs the first scrape.
A game goes live only when it has:

- at least one approved working code,
- real `redeem` steps (where the Codes button is in *that* game),
- a hand-written `notes` paragraph (200+ characters).

Until then `build.mjs` leaves it out and says why.

## Codes by hand

For codes posted only on Discord, X or in-game:

```bash
node scripts/review.mjs add <slug> CODE "reward"
node scripts/review.mjs expire <slug> CODE
node scripts/review.mjs reward <slug> CODE "better reward text"
```

Manual codes (`source: "manual"`) are never touched by the scraper.

## How the scraper works

`scripts/scrape.mjs` fetches every tracked game's description (50 per API call), and `lib/detect.mjs` finds codes near words like *code*, *codes*, *redeem*.
`lib/merge.mjs` folds the result in:

- new codes go in with `approved: false` and wait in `PENDING.md` (and a GitHub issue),
- codes that leave the description move to `expired`, labelled "no longer listed by the game",
- `lastChecked` moves every run, `lastChanged` only when the public list changes.

A game whose detection is reliable can skip the queue with `"autoApprove": true` in its file.

GitHub Actions (`.github/workflows/scrape.yml`) runs this every 3 hours and publishes through `publish.mjs --push`, so a failed check never deploys.

## Local preview

```bash
npm install
npm run dev                              # http://localhost:4321
node scripts/screenshots.mjs http://localhost:4321 screenshots / /taxi-boss-codes/
npm test
```

## Settings

`data/settings.json`: site URL, contact email, GA4 id (`analyticsId`), AdSense client and slot ids, IndexNow key and switch.
Ads and analytics render nothing while their ids are empty.
