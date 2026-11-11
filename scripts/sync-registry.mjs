// Pulls the project list from lab-hq so the site and the registry can't drift.
// If the fetch fails (offline, GitHub down), the last committed copy is used and the build carries on.
import { writeFile, readFile } from 'node:fs/promises';

const SOURCE = 'https://raw.githubusercontent.com/unclebuckslab/lab-hq/main/registry/projects.yaml';
const TARGET = new URL('../src/data/projects.yaml', import.meta.url);

try {
  const res = await fetch(SOURCE, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (!text.includes('projects:')) throw new Error('response is not the registry');
  const current = await readFile(TARGET, 'utf8').catch(() => '');
  if (current === text) {
    console.log('registry: up to date');
  } else {
    await writeFile(TARGET, text);
    console.log('registry: updated from lab-hq');
  }
} catch (err) {
  console.warn(`registry: fetch failed (${err.message}); using the committed copy`);
}
