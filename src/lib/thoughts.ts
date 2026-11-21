import { getCollection } from 'astro:content';

// Drafts show on PR previews (Workers Builds sets WORKERS_CI_BRANCH) but not on main.
const showDrafts = import.meta.env.DEV || (process.env.WORKERS_CI_BRANCH ?? 'main') !== 'main';

export async function getThoughts() {
  const posts = await getCollection('thoughts', (p) => showDrafts || !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
