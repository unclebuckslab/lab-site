import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Thoughts: Garrett's writing. One Markdown file per post in src/content/thoughts/.
const thoughts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/thoughts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    // Drafts build in previews but never on the live site.
    draft: z.boolean().default(false),
  }),
});

export const collections = { thoughts };
