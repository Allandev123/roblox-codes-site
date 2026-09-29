export const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const monthYear = iso => { const d = new Date(iso); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
export const shortMonthYear = iso => { const d = new Date(iso); return `${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}`; };
export const dateLong = iso => { const d = new Date(iso); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`; };
export const dateTime = iso => {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCDate()}, ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
};
// Absolute time in the HTML (honest for crawlers and no-JS), turned into
// "2 hours ago" by app.js.
export const ago = (iso, short = false) => `<time datetime="${iso}" data-ago${short ? '="short"' : ''}>${short ? dateLong(iso).replace(/, \d{4}$/, '') : dateTime(iso)}</time>`;

export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
export const fmtNum = n => Number(n ?? 0).toLocaleString('en-US');
export const compact = n => {
  n = Number(n ?? 0);
  if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return String(n);
};
export const searchKey = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();

// Cut at a word boundary so titles and descriptions never end mid-word.
export function clip(s, max) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/[\s,;:·-]+\S*$/, '') + '…';
}

export const ICONS = {
  logo: (size = 30) => `<svg width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="var(--accent)"/><path d="M9 9H23A2 2 0 0 1 25 11V13.2A2.8 2.8 0 0 0 25 18.8V21A2 2 0 0 1 23 23H9A2 2 0 0 1 7 21V18.8A2.8 2.8 0 0 0 7 13.2V11A2 2 0 0 1 9 9Z" fill="var(--accent-ink)"/><path d="M19.5 10.5V21.5" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="1.8 1.8"/><path d="M11 13.5h5M11 16h5M11 18.5h3" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  moon: '<svg class="moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  sun: '<svg class="sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>',
};

// "Sep 29", with the year only when it isn't this year
export const dateShort = iso => {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  return `${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCDate()}${y !== new Date().getUTCFullYear() ? `, ${y}` : ''}`;
};
export const numberWord = n => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] ?? String(n);

ICONS.chev = '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
ICONS.down = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
ICONS.ext = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
