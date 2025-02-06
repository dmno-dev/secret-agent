import { DmnoBaseTypes, defineDmnoService, pick, pickFromSchemaObject, switchBy } from 'dmno';
import { CloudflareWranglerEnvSchema, DmnoWranglerEnvSchema } from '@dmno/cloudflare-platform';

export default defineDmnoService({
  name: 'api',
  schema: {
    
    SECRETAGENT_ENV: pick(),
    SECRETAGENT_API_URL: {
      extends: 'url',
      value: switchBy('SECRETAGENT_ENV', {
        local: () => DMNO_CONFIG.WRANGLER_DEV_URL,
        production: 'https://secretagent.sh/api',
      }),
      required: true,
    },
    SECRETAGENT_WEB_URL: pick('frontend'),

    CLOUDFLARE_ACCOUNT_ID: pick(),
    CLOUDFLARE_API_TOKEN: pick(),

    // special config that controls wrangler via `dwrangler` cli wrapper (all optional)
    ...pickFromSchemaObject(DmnoWranglerEnvSchema, {
      // WRANGLER_ENV: {}, // passed as --env
      // WRANGLER_DEV_IP: { value: 'custom.host.local' }, // passed as --ip
      WRANGLER_DEV_PORT: { value: 8881 }, // passed as --port
      WRANGLER_DEV_URL: {}, // will be populated with full dev URL
      WRANGLER_DEV_PROTOCOL: { value: 'https' },
      // WRANGLER_LIVE_RELOAD: { value: true }, // passed as `--live-reload`
      WRANGLER_DEV_ACTIVE: {}, // true when running `dwrangler dev` or `dwrangler pages dev`
      WRANGLER_BUILD_ACTIVE: {}, // true when dwrangler is performing a build for deployment
    }),


    MASTER_OPENAI_API_KEY: {
      extends: pick('root', 'OPENAI_API_KEY'),
      required: true,
    },
    MASTER_LANGSMITH_API_KEY: {
      extends: pick('root', 'LANGSMITH_API_KEY'),
      required: true,
    },
    PRIVY_APP_ID: {
      extends: pick(),
      required: true,
    },
    PRIVY_APP_SECRET: {
      extends: pick(),
      required: true,
    },
  },
});
