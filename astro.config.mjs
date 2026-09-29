import { defineConfig } from 'astro/config';

const isCloudflare = process.env.DEPLOY_TARGET === 'cloudflare';

export default defineConfig({
  site: isCloudflare
    ? 'https://family-med-guide.neutralhub.workers.dev'
    : 'https://philsting.github.io',
  base: isCloudflare ? '/' : '/family-med-guide',
  build: {
    inlineStylesheets: 'never',
  },
});
