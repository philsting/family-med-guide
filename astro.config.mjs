import { defineConfig } from 'astro/config';

const deployTarget = process.env.DEPLOY_TARGET;
const isCloudflare = deployTarget
  ? deployTarget === 'cloudflare'
  : process.env.WORKERS_CI === '1';

export default defineConfig({
  site: isCloudflare
    ? 'https://family-med-guide.neutralhub.workers.dev'
    : 'https://philsting.github.io',
  base: isCloudflare ? '/' : '/family-med-guide',
  build: {
    inlineStylesheets: 'never',
  },
});
