import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://jam.mt', output: 'static', trailingSlash: 'always', vite: { build: { assetsInlineLimit: 0 } } });
