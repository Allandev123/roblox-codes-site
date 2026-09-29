import { esc } from './helpers.mjs';

export const about = site => `
<p>${esc(site.siteName)} lists working codes for Roblox games — nothing else. No scripts, no exploits, no "free Robux" tricks. Just the codes each game's developers have released, what they give, and where to type them.</p>

<h2>Who runs it</h2>
<p>${esc(site.siteName)} is run by <a href="/author/${esc(site.author.slug)}/" rel="author">${esc(site.author.name)}</a>, a Roblox player since ${esc(site.author.robloxSince)} and the creator behind the <a href="${esc(site.author.youtube)}" rel="noopener">${esc(site.author.name)} YouTube channel</a>. It's a one-person site, not a company.</p>

<h2>How codes get on this site</h2>
<ul>
  <li><strong>Checked every few hours.</strong> A small program reads each game's official Roblox page several times a day. When a developer posts a new code there, it usually shows up on this site within hours.</li>
  <li><strong>Approved by hand.</strong> The program never publishes a new code by itself. Each one waits until ${esc(site.author.name)} has read the developer's post, confirmed it's really a code and noted the reward.</li>
  <li><strong>Honest about expiry.</strong> When a game stops listing a code, it moves to that page's expired list with the date. We say "no longer listed by the game" because that's what we can see; we don't claim to have tested every code on every account.</li>
  <li><strong>Codes from other official channels.</strong> Some developers post codes only on their Discord, X account or in-game. Those are added by hand and kept until the developer retires them.</li>
</ul>

<h2>How the guides are written</h2>
<p>Every game page has step-by-step instructions for that specific game — where its Codes button actually is, not a generic "find the menu" — and a short guide to the game. They're based on playing the games and on each game's own Roblox page and announcements. AI tools help with research and first drafts; every page is checked and edited by hand before it's published, and corrected when a game changes its menus.</p>
<p>We'd rather cover fewer games well than thousands badly, so a game only gets a page once it has working codes.</p>

<h2>Why it exists</h2>
<p>Finding a code that works usually means scrolling past lists of expired ones. This site is built to answer one question fast: which codes work right now, and how do I use them? The site is free and paid for by ads, which never appear above the codes.</p>

<h2>Not affiliated with Roblox</h2>
<p>${esc(site.siteName)} is an independent fan site. It is not affiliated with, endorsed by or sponsored by Roblox Corporation or any game developer. Game names and artwork belong to their owners.</p>

<h2>Spotted a problem?</h2>
<p>If a code is wrong, a reward is missing, or you know about a game we should cover, <a href="/contact/">get in touch</a>. Corrections usually go live the same day.</p>
`;

export const contact = site => `
<p>Found a code that doesn't work, a missing reward, or a game you want us to cover? Email us:</p>
<p><a class="btn" href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a></p>
<h2>Helpful things to include</h2>
<ul>
  <li>The game name and the code you tried.</li>
  <li>What happened — an error message, or no reward.</li>
  <li>For a new game: its Roblox link.</li>
</ul>
<p>You can also reach ${esc(site.author.name)} through <a href="${esc(site.author.youtube)}" rel="noopener">YouTube</a>, but email is the fastest way to get a code fixed.</p>
<p>We read every message. We can't help with account problems, lost items or purchases — those go to <a href="https://www.roblox.com/support" rel="noopener">Roblox Support</a> or the game's developers.</p>
`;

export const privacy = (site, updated) => `
<p><em>Last updated: ${esc(updated)}</em></p>
<p>This policy explains what information ${esc(site.siteName)} (${esc(site.url.replace(/^https?:\/\//, ''))}) collects and how it is used. The short version: we don't ask for or store personal information ourselves. Third-party services we use for statistics and advertising set cookies, described below.</p>

<h2>Information we collect</h2>
<p>We don't have accounts, comments or sign-up forms. If you email us, we receive your email address and message and use them only to reply.</p>

<h2>Analytics</h2>
<p>We use Google Analytics to understand which pages are visited and how people find the site. Google Analytics uses cookies and collects information such as pages viewed, approximate location, device and browser type. It does not tell us who you are. You can opt out with the <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener">Google Analytics opt-out browser add-on</a>.</p>

<h2>Advertising</h2>
<p>We may show ads served by Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on your previous visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visits to this site and/or other sites on the internet.</p>
<p>You can opt out of personalised advertising in <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a>, or opt out of some third-party vendors' use of cookies at <a href="https://www.aboutads.info/choices/" rel="noopener">aboutads.info</a>. See <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">how Google uses information from sites that use its services</a>.</p>
<p>Visitors in the European Economic Area, the UK and Switzerland are asked for consent before personalised ads or analytics cookies are used, through Google's certified consent message. Until you choose, Google's consent mode keeps advertising and analytics cookies switched off for those visitors. You can change your choice at any time from the privacy link the consent message adds to the page.</p>

<h2>Cookies and local storage</h2>
<p>Besides the Google cookies above, the site stores one value in your browser's local storage: your light or dark theme choice. It never leaves your device.</p>

<h2>Children</h2>
<p>Roblox is popular with young players, so the site is built to collect as little as possible: no accounts, no comments, no forms. We don't knowingly collect personal information from children under 13. If you're a parent and believe your child has emailed us personal information, contact us and we will delete it.</p>

<h2>Your rights</h2>
<p>Depending on where you live, you may have the right to access, correct or delete personal data held about you. Because we don't hold personal data beyond emails sent to us, most requests concern Google's services; you can manage those in your <a href="https://myaccount.google.com/data-and-privacy" rel="noopener">Google account</a>. For anything else, email <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>.</p>

<h2>Changes</h2>
<p>If this policy changes, the date at the top changes with it.</p>
`;

export const terms = (site, updated) => `
<p><em>Last updated: ${esc(updated)}</em></p>
<p>By using ${esc(site.siteName)} (${esc(site.url.replace(/^https?:\/\//, ''))}) you agree to these terms. They're short because the site is simple.</p>

<h2>What the site is</h2>
<p>A free fan site that lists promo codes Roblox game developers have released, with instructions for redeeming them. It is not affiliated with, endorsed by or sponsored by Roblox Corporation or any game developer.</p>

<h2>No guarantee a code works</h2>
<p>Codes are created and controlled by each game's developers, who can change or end them at any time, limit them to new players, or cap how many times they can be used. We check codes often and remove ones the game stops listing, but we can't guarantee any code will work for you. Rewards are described as the developer or game states them and may change.</p>

<h2>Play safe</h2>
<p>Codes are only ever redeemed inside the game itself. We will never ask for your Roblox password, and no real code needs you to download anything or visit a "generator". Anything promising free Robux is a scam.</p>

<h2>Trademarks and content</h2>
<p>Roblox and game names, icons and artwork belong to their owners and are used here only to identify the games being described. The text, design and code of this site are ours; please don't copy whole pages. Linking to any page is always welcome.</p>

<h2>Links to other sites</h2>
<p>We link to Roblox game pages and developer channels. We don't control those sites and aren't responsible for their content.</p>

<h2>Changes</h2>
<p>We may update these terms; the date at the top shows the latest version. Questions: <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>.</p>
`;
