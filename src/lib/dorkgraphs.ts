import { getCollection } from 'astro:content';
import { isPreview } from './env';

// Drafts show on PR previews but not on main, the same rule as Thoughts.
export async function getReports() {
  const reports = await getCollection('dorkgraphs', (r) => isPreview || !r.data.draft);
  return reports.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
