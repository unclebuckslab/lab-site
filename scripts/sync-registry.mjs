// Pulls the project list from lab-hq so the site and the registry can't drift.
// Only public fields are written here: notes, agents, repos, playbooks and milestones never enter this repo.
// If the fetch fails (offline, GitHub down), the last committed copy is used and the build carries on.
import { writeFile, readFile } from 'node:fs/promises';
import yaml from 'js-yaml';
import { PUBLIC_FIELDS } from './public-fields.mjs';

const SOURCE = 'https://raw.githubusercontent.com/unclebuckslab/lab-hq/main/registry/projects.yaml';
const TARGET = new URL('../src/data/projects.yaml', import.meta.url);


function publicOnly(registry) {
  return {
    projects: registry.projects.map((p) => Object.fromEntries(PUBLIC_FIELDS.filter((f) => f in p).map((f) => [f, p[f]]))),
  };
}

const header = '# Public fields from lab-hq registry/projects.yaml, written by scripts/sync-registry.mjs. Do not edit.\n';

try {
  const res = await fetch(SOURCE, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const parsed = yaml.load(await res.text());
  if (!parsed || !Array.isArray(parsed.projects)) throw new Error('response is not the registry');
  const text = header + yaml.dump(publicOnly(parsed), { lineWidth: -1 });
  const current = await readFile(TARGET, 'utf8').catch(() => '');
  if (current === text) {
    console.log('registry: up to date');
  } else {
    await writeFile(TARGET, text);
    console.log('registry: updated from lab-hq (public fields only)');
  }
} catch (err) {
  console.warn(`registry: fetch failed (${err.message}); using the committed copy`);
}
