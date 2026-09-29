import { esc } from './helpers.mjs';

const authorLink = site => `<a href="/author/${esc(site.author.slug)}/" rel="author">${esc(site.author.name)}</a>`;
const host = site => esc(site.url.replace(/^https?:\/\//, ''));

// Who is legally responsible for the site (GDPR controller). Falls back to the
// author's handle until data/settings.json "operator.name" is filled in.
const operator = site => esc(site.operator?.name || `${site.author.name}, the owner of ${site.siteName}`);

export const about = site => `
<p>Hi, I'm ${esc(site.author.firstName)} — ${authorLink(site)} on YouTube and Roblox. I run ${esc(site.siteName)} on my own. It lists working codes for Roblox games, and nothing else: no scripts, no exploits, no "free Robux". Just the codes each game's developers have released, what they give, and where to type them.</p>

<h2>Who I am</h2>
<p>I've played Roblox since ${esc(site.author.robloxSince)}. My favourite back then was Lumber Tycoon 2, and I've loved Roblox ever since. In 2018 I started my <a href="${esc(site.author.youtube)}" rel="noopener">YouTube channel</a>. Most of my videos ended up being about BedWars, and lately Rivals too. This is a one-person site, not a company. More about me on my <a href="/author/${esc(site.author.slug)}/">author page</a>.</p>

<h2>Why I made this site</h2>
<p>One thing always annoyed me: how hard it was to find Roblox codes that actually worked, or a quick guide that was easy to read. Too many code lists are full of dead codes, and too many guides take forever to get to the point. So I built this site for exactly that: working codes, short readable guides, and updates on what's new in the games people play.</p>

<h2>How codes get here</h2>
<ul>
  <li><strong>A program reads each game's Roblox page every 3 hours.</strong> Most developers post their codes in the game's description, so new codes usually reach this site the same day.</li>
  <li><strong>I approve every new code by hand.</strong> The program never publishes a code on its own. I read the developer's post, make sure it's really a code and not just a word in the description, and write down the reward.</li>
  <li><strong>Expired means "no longer listed".</strong> When a game stops listing a code, it moves to that page's expired list with the date. I say "no longer listed by the game" because that's what I can see; I don't claim to have tested every code on every account.</li>
  <li><strong>Codes from Discord or X</strong> can be added by hand when a developer posts them there, and they're labelled with where they came from.</li>
</ul>
<p>The full process, step by step, is on <a href="/how-we-check-codes/">How I check codes</a>.</p>

<h2>How the pages are written</h2>
<p>Every game page says where that game's code box actually is, what each code gives, and a little about the game. I research each game from its Roblox page and the developers' own posts. AI tools help me research and draft; I check and edit every page before it goes up, and fix it when a game moves its menus. When I've checked a game's redeem steps in-game myself, the page says so with the date.</p>
<p>I'd rather cover fewer games properly than hundreds badly, so a game only gets a page once it has working codes.</p>

<h2>How the site pays for itself</h2>
<p>The site is free. It may show ads, and they never go above the codes or right next to a Copy button. Ads here are set to be suitable for young players (no personalised ads).</p>

<h2>Not affiliated with Roblox</h2>
<p>${esc(site.siteName)} is an independent fan site. It is not affiliated with, endorsed by or sponsored by Roblox Corporation or any game developer. Game names and artwork belong to their owners.</p>

<h2>Spotted a mistake?</h2>
<p>If a code is wrong, a reward is missing, or there's a game you want covered, <a href="/contact/">tell me</a>. I usually fix it the same day.</p>
`;

export const method = site => `
<p>This page explains exactly how a code gets onto ${esc(site.siteName)}, what "working" and "expired" mean here, and what I do and don't check. If something on the site is wrong, <a href="/contact/">tell me</a>.</p>

<h2>1. The game's own Roblox page is the source</h2>
<p>Most Roblox developers announce codes in their game's description on Roblox. Every 3 hours, a small program on this site downloads the description of every game I cover, using Roblox's public game information. It looks for lines like "Use code X" or a list under "CODES:", and ignores words that only look like codes, such as "UPDATE" or "NEW CODE AT 1M LIKES".</p>

<h2>2. Every new code waits for me</h2>
<p>When the program spots something new, it doesn't publish it. It puts it in a queue with the exact line it came from. I read that line, check it's a real code, and write down the reward in plain words. Only then does it appear on the game's page. If it isn't a code, I reject it and it never shows up.</p>

<h2>3. What "working" means</h2>
<p>A code is listed as working while the game's developers still list it. That's the most reliable signal there is, because the developers decide when codes end. It isn't a promise that it will work on your account: some codes are one per account, some are only for new players, and some need something first (like finishing the tutorial). Each game page says so when a game has a rule like that.</p>

<h2>4. What "no longer listed" means</h2>
<p>When a developer removes a code from their description, the next check moves it to that game's expired list with the date. I don't call it "dead" or "tested expired" — just "no longer listed by the game", because that's what I can actually see.</p>

<h2>5. Codes from Discord, X and in-game</h2>
<p>Many big games post codes only on Discord, X or an in-game board, not on their Roblox page. I add those by hand, and only when the developers' own post or at least two code lists updated that month agree the code works. When sources disagree about a code, I leave it out. The program never removes these codes, so I recheck them and move them to the expired list myself.</p>

<h2>6. Redeem steps and game guides</h2>
<p>Where the code box is changes from game to game, so every page has its own steps. I research them from the game's Roblox page, the developers' posts and other players' reports, and use AI tools to help research and draft. I edit every page before it's published. When I've checked a game's steps in-game myself, the page shows "checked in-game" with the date. If a game moves its Codes button in an update, the steps get fixed.</p>

<h2>7. Dates you'll see</h2>
<ul>
  <li><strong>Last checked</strong>: when the program last read that game's Roblox page.</li>
  <li><strong>Added</strong>: when a code first appeared on the game's page.</li>
  <li><strong>Codes updated</strong>: the last time a code was added to or removed from that page.</li>
</ul>

<h2>8. What I'll never do</h2>
<ul>
  <li>Ask for your Roblox password, or send you to a download or "verification" page.</li>
  <li>Post "free Robux" codes. They don't exist — see <a href="/guides/free-robux-codes-scams/">how to spot those scams</a>.</li>
  <li>List scripts, exploits or cheats.</li>
</ul>
`;

export const contact = site => `
<p>Found a code that doesn't work, a missing reward, or a game you want me to cover? Email me:</p>
<p><a class="btn" href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a></p>
<h2>Helpful things to include</h2>
<ul>
  <li>The game name and the code you tried.</li>
  <li>What happened — an error message, or no reward.</li>
  <li>For a new game: its Roblox link.</li>
</ul>
<p>You can also find me on <a href="${esc(site.author.youtube)}" rel="noopener">YouTube</a>${site.author.discord ? ` and in <a href="${esc(site.author.discord)}" rel="noopener">my Discord server</a>` : ''}, but email is the fastest way to get a code fixed.</p>
<p>I read every message. I can't help with account problems, lost items or purchases — those go to <a href="https://www.roblox.com/support" rel="noopener">Roblox Support</a> or the game's developers. Never send anyone your password, including me.</p>
`;

export const privacy = (site, updated) => {
  const ga = Boolean(site.analyticsId);
  const child = Boolean(site.adsense?.childTreatment);
  return `
<p><em>Last updated: ${esc(updated)}</em></p>
<p>This policy explains what ${esc(site.siteName)} (${host(site)}) collects and why. The short version: I don't ask for or store personal information. The site has no accounts, comments or sign-up forms.${ga || site.adsense?.client ? ' Google services used for statistics and ads are described below.' : ''}</p>

<h2>Who is responsible</h2>
<p>The site is run by ${operator(site)}, based in ${esc(site.operator?.country ?? 'Denmark')}. Contact: <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>.</p>

<h2>What is collected</h2>
<ul>
  <li><strong>Emails you send me.</strong> I receive your email address and message and use them only to reply and fix what you reported. Legal basis: legitimate interest in answering you. I delete them within 12 months, or sooner if you ask.</li>
  <li><strong>Your theme choice.</strong> Light or dark mode is saved in your browser's local storage. It never leaves your device.</li>
  <li><strong>Server logs.</strong> The hosting provider keeps short-lived technical logs (such as IP address and page requested) to run and protect the site.</li>
</ul>

${ga ? `<h2>Analytics</h2>
<p>I use Google Analytics to see which pages are visited and how people find the site. It collects things like pages viewed, approximate location, device and browser type. It doesn't tell me who you are. Google Signals and ad personalisation are turned off. You can opt out with the <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener">Google Analytics opt-out add-on</a>.</p>
` : ''}
<h2>Advertising</h2>
<p>The site may show ads served by Google AdSense. Third-party vendors, including Google, use cookies to serve ads.${child
    ? ` Because many visitors are young, every ad request on this site is marked for child-directed treatment: Google turns off personalised ads and remarketing, and ads are chosen from the page you're on rather than your browsing history.`
    : ` Google's use of advertising cookies enables it and its partners to serve ads based on your visits to this site and/or other sites on the internet.`}</p>
<p>You can manage Google's ad settings at <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a> and opt out of some third-party vendors' cookies at <a href="https://www.aboutads.info/choices/" rel="noopener">aboutads.info</a>. See <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">how Google uses information from sites that use its services</a>.</p>

<h2>Consent in the EU, UK and Switzerland</h2>
<p>Visitors in the European Economic Area, the UK and Switzerland are asked for consent through Google's certified consent message before advertising${ga ? ' or analytics' : ''} cookies are used. Until you choose, those cookies stay switched off. You can change your choice any time from the privacy link the consent message adds to the page. Legal basis: your consent.</p>

<h2>Children</h2>
<p>Roblox is popular with young players, so the site is built to collect as little as possible. I don't knowingly collect personal information from children. If you're a parent and think your child emailed me personal information, contact me and I'll delete it.</p>

<h2>Your rights</h2>
<p>You can ask to see, correct or delete personal data I hold about you (in practice, emails you sent), and you can withdraw consent at any time. Email <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>. For data Google holds, use your <a href="https://myaccount.google.com/data-and-privacy" rel="noopener">Google account</a>. You also have the right to complain to the Danish Data Protection Agency, <a href="https://www.datatilsynet.dk" rel="noopener">Datatilsynet</a>.</p>

<h2>Changes</h2>
<p>If this policy changes, the date at the top changes with it.</p>
`;
};

export const disclaimer = (site, updated) => `
<p><em>Last updated: ${esc(updated)}</em></p>
<p>${esc(site.siteName)} is a free fan site about Roblox game codes. Please read this before relying on anything here.</p>

<h2>Not affiliated with Roblox</h2>
<p>${esc(site.siteName)} is independent. It is not made by, affiliated with, endorsed by or sponsored by Roblox Corporation or any game developer. Roblox, the Roblox logo and the names of Roblox games are trademarks of their owners.</p>

<h2>Codes can stop working at any time</h2>
<p>Every code on this site comes from the game's developers, who decide when it starts, what it gives and when it ends. I check the games' own pages every few hours and recheck codes posted elsewhere by hand, but a code can expire between checks, be limited to new players, or only work once per account. Rewards are listed as the developers describe them. Nothing here is a promise that a code will work for you.</p>

<h2>Game names and pictures</h2>
<p>Game icons, thumbnails and names belong to their creators and are shown only to identify which game a page is about. Screenshots marked "my screenshot" were taken by me while playing. Guides and devlogs about +1 Nose to Escape are about my own game.</p>

<h2>How the pages are written</h2>
<p>I write and check the pages myself, and use AI tools to help with research and drafts. Everything is edited by me before it's published. If you spot a mistake, <a href="/contact/">tell me</a> and I'll fix it.</p>

<h2>Ads and links</h2>
<p>The site may show ads to pay for itself. I don't use affiliate links and nobody pays to have a game or code listed. Links to other sites, like a game's Roblox page or a developer's Discord, go to places I don't control.</p>

<h2>Copyright and removal requests</h2>
<p>If you own a game, picture or text on this site and want it changed or removed, email <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a> with the page link and what you'd like changed. I reply quickly and remove content that shouldn't be here.</p>
`;

export const terms = (site, updated) => `
<p><em>Last updated: ${esc(updated)}</em></p>
<p>By using ${esc(site.siteName)} (${host(site)}) you agree to these terms. They're short because the site is simple.</p>

<h2>What the site is</h2>
<p>A free fan site that lists codes Roblox game developers have released, with instructions for redeeming them. It is not affiliated with, endorsed by or sponsored by Roblox Corporation or any game developer.</p>

<h2>No guarantee a code works</h2>
<p>Codes are created and controlled by each game's developers, who can change or end them at any time, limit them to new players, or cap how many times they can be used. I check the games' pages often and move codes they stop listing to the expired list, but I can't guarantee any code will work for you. Rewards are described as the developer or game states them and may change.</p>

<h2>Play safe</h2>
<p>Game codes are only ever redeemed inside the game itself. I will never ask for your Roblox password, and no real code needs you to download anything or visit a "generator". Anything promising free Robux is a scam — <a href="/guides/free-robux-codes-scams/">here's how to spot them</a>.</p>

<h2>Trademarks and content</h2>
<p>Roblox and game names, icons and artwork belong to their owners and are used here only to identify the games being described. The text, design and code of this site are mine; please don't copy whole pages. Linking to any page is always welcome.</p>

<h2>Links to other sites</h2>
<p>I link to Roblox game pages and developer channels. I don't control those sites and I'm not responsible for their content.</p>

<h2>Changes</h2>
<p>I may update these terms; the date at the top shows the latest version. Questions: <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>.</p>
`;
