import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://jam.mt', output: 'static', build: { inlineStylesheets: 'always' }, trailingSlash: 'always', vite: { build: { assetsInlineLimit: 0 } } });
