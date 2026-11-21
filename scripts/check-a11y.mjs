// Accessibility check on the built site: axe (WCAG 2.2 A and AA rules) on every page, in light and dark,
// on desktop and phone widths, plus the house 44px tap-target rule (axe only checks 24px).
// Run after `npm run build`. Set CHROME_PATH to use an installed Chrome instead of Playwright's.
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const DIST = new URL('../dist/', import.meta.url).pathname;
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.txt': 'text/plain' };

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  if (!extname(p)) p += '.html';
  try {
    const body = await readFile(join(DIST, p));
    res.writeHead(200, { 'content-type': TYPES[extname(p)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(0);
const base = `http://localhost:${server.address().port}`;

async function* pages(dir, prefix = '') {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!e.name.startsWith('_')) yield* pages(join(dir, e.name), `${prefix}/${e.name}`); }
    else if (e.name.endsWith('.html') && e.name !== '404.html') yield e.name === 'index.html' ? `${prefix}/` : `${prefix}/${e.name.replace(/\.html$/, '')}`;
  }
}

// Interactive things that must be at least 44px tall: nav items, buttons, inputs, menus and standalone links.
// Links inside running text are exempt (WCAG's inline exception).
const TAP_SELECTOR = 'button, input, select, textarea, summary, nav a, footer a, .button, .skip:focus';

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const problems = [];
for await (const path of pages(DIST)) {
  for (const colorScheme of ['light', 'dark']) {
    for (const [device, viewport] of [['desktop', { width: 1280, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
      const context = await browser.newContext({ viewport, colorScheme });
      const page = await context.newPage();
      await page.goto(base + path, { waitUntil: 'networkidle' });
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      for (const v of result.violations) {
        problems.push(`${path} [${colorScheme}, ${device}] ${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.target.join(' ')}`);
      }
      const small = await page.$$eval(TAP_SELECTOR, (els) =>
        els
          .filter((el) => el.offsetParent !== null && !el.closest('.menu-list:not([open] .menu-list)'))
          .map((el) => ({ h: el.getBoundingClientRect().height, label: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30) }))
          .filter((x) => x.h > 0 && x.h < 44),
      );
      for (const s of small) problems.push(`${path} [${colorScheme}, ${device}] tap target "${s.label}" is ${Math.round(s.h)}px, needs 44px`);
      await context.close();
    }
  }
}
await browser.close();
server.close();

if (problems.length) {
  console.error('a11y: problems found\n  ' + [...new Set(problems)].join('\n  '));
  process.exit(1);
}
console.log('a11y: all pages pass axe (WCAG 2.2 AA) and the 44px rule in light and dark, desktop and phone');
