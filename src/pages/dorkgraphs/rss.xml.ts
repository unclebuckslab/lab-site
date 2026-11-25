// RSS feed for DorkGraphs reports: /dorkgraphs/rss.xml. Drafts are left out the same way as on the page.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getReports } from '../../lib/dorkgraphs';

export async function GET(context: APIContext) {
  const reports = await getReports();
  return rss({
    title: "DorkGraphs · Uncle Buck's Laboratory",
    description: 'Reports on the numbers behind living in America now.',
    site: context.site!,
    items: reports.map((r) => ({
      title: r.data.title,
      pubDate: r.data.date,
      description: r.data.dek,
      link: `/dorkgraphs/${r.id}`,
    })),
    customData: '<language>en-us</language>',
  });
}
