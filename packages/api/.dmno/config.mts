import { DmnoBaseTypes, defineDmnoService, pick, pickFromSchemaObject } from 'dmno';
import { EncryptedVaultDmnoPlugin } from '@dmno/encrypted-vault-plugin';
import { CloudflareWranglerEnvSchema, DmnoWranglerEnvSchema } from '@dmno/cloudflare-platform';

const encryptedVault = EncryptedVaultDmnoPlugin.injectInstance('vault'); // inject vault from root

export default defineDmnoService({
  schema: {
    // config that affects wrangler directly
    ...pickFromSchemaObject(CloudflareWranglerEnvSchema, {
      CLOUDFLARE_ACCOUNT_ID: {
        // value: encryptedVault.item(),
      },
      CLOUDFLARE_API_TOKEN: {
        // value: encryptedVault.item(),
      },
    }),

    // special config that controls wrangler via `dwrangler` cli wrapper (all optional)
    ...pickFromSchemaObject(DmnoWranglerEnvSchema, {
      // WRANGLER_ENV: {}, // passed as --env
      // WRANGLER_DEV_IP: { value: 'custom.host.local' }, // passed as --ip
      // WRANGLER_DEV_PORT: { value: 8881 }, // passed as --port
      // WRANGLER_DEV_URL: {}, // will be populated with full dev URL
      // WRANGLER_LIVE_RELOAD: { value: true }, // passed as `--live-reload`
      WRANGLER_DEV_ACTIVE: {}, // true when running `dwrangler dev` or `dwrangler pages dev`
      WRANGLER_BUILD_ACTIVE: {}, // true when dwrangler is performing a build for deployment
    }),


    MASTER_OPENAI_API_KEY: {
      extends: pick('root', 'OPENAI_API_KEY'),
      required: true,
    }
  },
});
