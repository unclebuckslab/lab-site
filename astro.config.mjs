import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://unclebuckslab.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
});
