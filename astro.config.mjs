import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pages that don't belong in search: signup result pages.
const notInSitemap = (page) => /\/signup\//.test(page);

export default defineConfig({
  site: 'https://unclebuckslab.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({ filter: (page) => !notInSitemap(page) })],
});
