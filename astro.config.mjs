import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { rm } from 'node:fs/promises';

// Same rule as src/lib/env.ts: anything not built from main is a PR preview.
const isPreview = (process.env.WORKERS_CI_BRANCH ?? 'main') !== 'main';

// DorkGraphs draft previews carry the Instagram set as images under public/dorkgraphs-preview/.
// They exist for the founder's review on PR previews only, so the main build deletes them.
const dropDraftPreviews = {
  name: 'drop-dorkgraphs-draft-previews',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      if (!isPreview) await rm(new URL('dorkgraphs-preview/', dir), { recursive: true, force: true });
    },
  },
};

// Pages that don't belong in search: signup result pages.
const notInSitemap = (page) => /\/signup\//.test(page);

export default defineConfig({
  site: 'https://unclebuckslab.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({ filter: (page) => !notInSitemap(page) && !page.includes('/dorkgraphs-preview/') }), dropDraftPreviews],
});
