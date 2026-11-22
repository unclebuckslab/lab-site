// RSS feed for Thoughts: /thoughts/rss.xml. Drafts are left out the same way as on the page.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getThoughts } from '../../lib/thoughts';

export async function GET(context: APIContext) {
  const posts = await getThoughts();
  return rss({
    title: "Thoughts · Uncle Buck's Laboratory",
    description: "Posts from Uncle Buck's Laboratory.",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: `/thoughts/${post.id}`,
    })),
    customData: '<language>en-us</language>',
  });
}
