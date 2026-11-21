// Fails the build if any private registry value reaches the built site.
// Reads the full registry from lab-hq, collects the private fields, and scans every file in dist/.
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { PUBLIC_FIELDS } from './public-fields.mjs';

const SOURCE = 'https://raw.githubusercontent.com/unclebuckslab/lab-hq/main/registry/projects.yaml';
const DIST = new URL('../dist/', import.meta.url).pathname;

let registry;
try {
  const res = await fetch(SOURCE, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  registry = yaml.load(await res.text());
} catch (err) {
  console.warn(`privacy: could not fetch the registry (${err.message}); skipping`);
  process.exit(0);
}

// Repos that are public on GitHub may be linked (for example as a methods link). All others are private.
const PUBLIC_REPOS = new Set(['unclebuck20/denver-dashboard']);

// Every non-public string field, plus private repo names. Short single words (agent role names) are skipped
// because they are ordinary English; the risk is the notes, repos and paths.
const needles = new Set();
for (const p of registry.projects) {
  for (const [k, v] of Object.entries(p)) {
    if (PUBLIC_FIELDS.includes(k)) continue;
    if (k === 'repo' && PUBLIC_REPOS.has(v)) continue;
    const values = Array.isArray(v) ? v : [v];
    for (const x of values) if (typeof x === 'string' && x.length >= 12) needles.add(x);
  }
}

async function* files(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* files(p);
    else if (/\.(html|xml|txt|json|js|css)$/.test(e.name)) yield p;
  }
}

const hits = [];
for await (const f of files(DIST)) {
  const text = await readFile(f, 'utf8');
  for (const n of needles) if (text.includes(n)) hits.push(`${f.replace(DIST, 'dist/')}: "${n.slice(0, 60)}"`);
}
if (hits.length) {
  console.error('privacy: private registry values found in the built site\n  ' + hits.join('\n  '));
  process.exit(1);
}
console.log(`privacy: checked ${needles.size} private values; none in dist/`);
