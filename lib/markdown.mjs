// A small Markdown renderer for guides: enough for articles, nothing more.
//
// Supports: ## and ### headings, paragraphs, - and 1. lists, > callouts,
// | tables |, **bold**, *italic*, `code`, [links](/path/), and ![caption](file.webp)
// on its own line for a picture from data/images/guides. Raw HTML is escaped,
// so a guide can't inject markup. Front matter between --- lines is parsed as
// simple "key: value" pairs (lists as "key: a, b, c").

import { esc } from '../templates/helpers.mjs';

export function parseFrontMatter(src) {
  src = src.replace(/\r\n?/g, '\n');
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, '$1');
  }
  return { meta, body: src.slice(m[0].length) };
}

function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
    const ext = /^https?:\/\//.test(href);
    return `<a href="${href}"${ext ? ' rel="noopener" target="_blank"' : ''}>${text}</a>`;
  });
  return out;
}

export const slugifyHeading = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// returns { html, headings: [{ level, text, id }], words }
export function renderMarkdown(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const html = [];
  const headings = [];
  let words = 0;
  let i = 0;
  const count = s => { words += (s.match(/[A-Za-z0-9']+/g) || []).length; };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const img = line.match(/^!\[([^\]]*)\]\(([\w.-]+)\)\s*$/);
    if (img) {
      html.push(`<figure class="shot"><img src="/img/guides/${img[2]}" alt="${esc(img[1])}" width="1280" height="720" loading="lazy" decoding="async"><figcaption>${inline(img[1])}</figcaption></figure>`);
      i++;
      continue;
    }

    const h = line.match(/^(#{2,3})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].trim();
      const id = slugifyHeading(text);
      headings.push({ level, text, id });
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      count(text);
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const re = ordered ? /^\s*\d+\.\s+(.*)$/ : /^\s*[-*]\s+(.*)$/;
      const items = [];
      while (i < lines.length && re.test(lines[i])) {
        let item = lines[i].match(re)[1];
        i++;
        // continuation lines indented under the item
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !re.test(lines[i])) item += ' ' + lines[i++].trim();
        items.push(item);
        count(item);
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>\n${items.map(t => `  <li>${inline(t)}</li>`).join('\n')}\n</${tag}>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const parts = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) parts.push(lines[i++].replace(/^>\s?/, ''));
      const text = parts.join(' ');
      count(text);
      html.push(`<div class="callout">${inline(text)}</div>`);
      continue;
    }

    if (/^\|.*\|\s*$/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(lines[i++]);
      const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(1).filter(r => !/^\|\s*:?-{2,}/.test(r)).map(cells);
      [head, ...body].flat().forEach(count);
      html.push(`<div class="table-wrap"><table>\n<thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead>\n<tbody>\n${body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('\n')}\n</tbody>\n</table></div>`);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|>\s?|\|)/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s+/.test(lines[i])) para.push(lines[i++].trim());
    const text = para.join(' ');
    count(text);
    html.push(`<p>${inline(text)}</p>`);
  }
  return { html: html.join('\n'), headings, words };
}
