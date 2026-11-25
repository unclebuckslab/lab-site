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

// DorkGraphs reports. Written by the dorkgraphs repo's publish script (pipeline/publish/publish_report.py),
// one Markdown file per report with its charts inline. Edit the report in dorkgraphs, not here.
const dorkgraphs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/dorkgraphs' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    number: z.number().int().positive(),
    format: z.string().optional(),
    evidence: z.string(),
    // Drafts build in previews but never on the live site.
    draft: z.boolean().default(true),
  }),
});

export const collections = { thoughts, dorkgraphs };
