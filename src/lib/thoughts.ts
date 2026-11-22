import { getCollection } from 'astro:content';
import { isPreview } from './env';

// Drafts show on PR previews but not on main.
const showDrafts = isPreview;

export async function getThoughts() {
  const posts = await getCollection('thoughts', (p) => showDrafts || !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
