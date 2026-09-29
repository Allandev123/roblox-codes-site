import { esc } from './helpers.mjs';

export const about = site => `
<p>${esc(site.siteName)} lists working codes for Roblox games — nothing else. No scripts, no exploits, no "free Robux" tricks. Just the codes each game's developers have released, what they give, and where to type them.</p>

<h2>How codes get on this site</h2>
<ul>
  <li><strong>Checked every few hours.</strong> An automated check reads each game's official Roblox page several times a day. When a developer posts a new code, it is usually on this site within hours.</li>
  <li><strong>Reviewed by a person.</strong> A new code is never published automatically the first time it appears. Someone reads the developer's announcement, confirms it is a code and not just a word in the description, and writes down the reward.</li>
  <li><strong>Honest about expiry.</strong> When a game stops listing a code, it moves to that page's expired list with the date. We say "no longer listed by the game" because that is what we can see; we don't claim to have tested every code on every account.</li>
  <li><strong>Codes from other official channels.</strong> Some developers post codes only on their Discord, X account or in-game. Those are added by hand and kept until the developer retires them.</li>
</ul>

<h2>What each game page tells you</h2>
<p>Every page shows the time it was last checked, the reward for each code, and step-by-step instructions for that specific game — where its Codes button actually is, not a generic "find the menu". We would rather cover fewer games well than thousands badly, so a game only gets a page once it has working codes.</p>

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
<p>Visitors in the European Economic Area, the UK and Switzerland are asked for consent before personalised ads or analytics cookies are used, through a consent message provided by Google.</p>

<h2>Cookies and local storage</h2>
<p>Besides the Google cookies above, the site stores one value in your browser's local storage: your light or dark theme choice. It never leaves your device.</p>

<h2>Children</h2>
<p>Roblox is popular with young players. We don't knowingly collect personal information from children. The site has no accounts or forms, and if you believe a child has emailed us personal information, contact us and we will delete it.</p>

<h2>Your rights</h2>
<p>Depending on where you live, you may have the right to access, correct or delete personal data held about you. Because we don't hold personal data beyond emails sent to us, most requests concern Google's services; you can manage those in your <a href="https://myaccount.google.com/data-and-privacy" rel="noopener">Google account</a>. For anything else, email <a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>.</p>

<h2>Changes</h2>
<p>If this policy changes, the date at the top changes with it.</p>
`;
