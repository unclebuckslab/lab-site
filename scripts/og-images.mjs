// Draws the link-preview images (Open Graph, 1200×630) into public/og/: one default, one per project shown
// on the site. Uses the site's own fonts and tokens, rendered in Chromium by Playwright.
// Run by hand after a project's name or summary changes: npm run og  (set CHROME_PATH if needed)
// The PNGs are committed, so the Cloudflare build needs no browser.
import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
import { execSync } from 'node:child_process';

execSync('npm run sync && npm run tokens', { stdio: 'inherit' });

const root = resolve(import.meta.dirname, '..');
// Fonts are inlined as data URLs: a page set with setContent can't load file:// fonts.
const font = async (p) => `data:font/woff2;base64,${(await readFile(resolve(root, 'node_modules', p))).toString('base64')}`;
const FONTS = {
  display: await font('@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2'),
  sans: await font('@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2'),
  mono: await font('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2'),
};
const tokens = await readFile(resolve(root, 'src/styles/tokens.css'), 'utf8');
const registry = yaml.load(await readFile(resolve(root, 'src/data/projects.yaml'), 'utf8'));

const TYPE_LABELS = { 'recurring-report': 'Recurring report', dashboard: 'Dashboard', 'reference-database': 'Reference database', writing: 'Writing', brand: 'Data brand', product: 'Product' };
const KINDS = new Set(['dashboard', 'recurring-report', 'brand', 'reference-database', 'writing']);
const STATUS = { live: 'Live', 'in-the-lab': 'In the lab', archived: 'Retired' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Fraunces Variable'; src: url(${FONTS.display}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'IBM Plex Sans Variable'; src: url(${FONTS.sans}) format('woff2'); font-weight: 100 700; }
@font-face { font-family: 'IBM Plex Mono'; src: url(${FONTS.mono}) format('woff2'); font-weight: 500; }
${tokens}
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: var(--color-ground); color: var(--color-text); font-family: var(--font-sans); }
.card { position: absolute; inset: 40px; border-top: 6px solid var(--color-rule-strong); border-bottom: 2px solid var(--color-rule-strong);
  display: flex; flex-direction: column; justify-content: space-between; padding: 36px 0 28px; }
.mono { font-family: var(--font-mono); font-weight: 500; font-size: 24px; letter-spacing: 0.02em; }
.top { display: flex; justify-content: space-between; align-items: center; }
.kind { padding: 6px 14px; font-size: 22px; color: var(--color-on-kind); }
.kind.outline { color: var(--color-text); border: 2px solid var(--color-rule-strong); }
h1 { font-family: var(--font-display); font-weight: 600; font-size: 104px; line-height: 0.95; letter-spacing: -0.02em; max-width: 1000px; }
h1.brand { font-size: 132px; }
p.summary { font-size: 32px; line-height: 1.3; color: var(--color-text-secondary); max-width: 960px; margin-top: 24px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bottom { display: flex; justify-content: space-between; color: var(--color-text-secondary); }
</style></head><body><div class="card">${body}</div></body></html>`;

const cards = [{
  file: 'default',
  html: page(`
    <div class="top"><span class="mono">Research · analysis · building in public</span></div>
    <div><h1 class="brand">Uncle Buck&rsquo;s<br>Laboratory</h1></div>
    <div class="bottom mono"><span>unclebuckslab.com</span></div>`),
}];

for (const p of registry.projects.filter((p) => p.show_on_site === true && STATUS[p.status])) {
  const kind = KINDS.has(p.type) ? `kind" style="background: var(--color-kind-${p.type})` : 'kind outline';
  cards.push({
    file: p.id,
    html: page(`
      <div class="top"><span class="mono">Uncle Buck&rsquo;s Laboratory</span><span class="mono ${kind}">${esc(TYPE_LABELS[p.type] ?? p.type)}</span></div>
      <div><h1>${esc(p.name)}</h1>${p.summary ? `<p class="summary">${esc(p.summary)}</p>` : ''}</div>
      <div class="bottom mono"><span>unclebuckslab.com/projects/${esc(p.id)}</span><span>${STATUS[p.status]}</span></div>`),
  });
}

await mkdir(resolve(root, 'public/og'), { recursive: true });
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, colorScheme: 'light' });
const tab = await context.newPage();
for (const c of cards) {
  await tab.setContent(c.html, { waitUntil: 'load' });
  const loaded = await tab.evaluate(async () => {
    await Promise.all([...document.fonts].map((f) => f.load()));
    return [...document.fonts].filter((f) => f.status === 'loaded').length;
  });
  if (loaded < 3) throw new Error(`og: only ${loaded} of 3 fonts loaded for ${c.file}`);
  await tab.screenshot({ path: resolve(root, `public/og/${c.file}.png`) });
  console.log(`og: public/og/${c.file}.png`);
}
await browser.close();
