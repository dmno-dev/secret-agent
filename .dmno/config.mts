import { DmnoBaseTypes, configPath, defineDmnoService, pickFromSchemaObject } from 'dmno';
import { EncryptedVaultDmnoPlugin, EncryptedVaultTypes } from '@dmno/encrypted-vault-plugin';
import { CloudflareWranglerEnvSchema } from '@dmno/cloudflare-platform';

const encryptedVault = new EncryptedVaultDmnoPlugin('vault', { key: configPath('..', 'DMNO_VAULT_KEY')});

export default defineDmnoService({
  settings: {
    redactSensitiveLogs: true,
    interceptSensitiveLeakRequests: true,
    preventClientLeaks: true,
  },
  name: 'root',
  schema: {
    DMNO_VAULT_KEY: {
      // set this one in .env.local
      description: 'this key decrypts the encrypted vault secrets',
      extends: EncryptedVaultTypes.encryptionKey,
    },

    SECRETAGENT_ENV: {
      extends: DmnoBaseTypes.enum({
        local: { description: 'local development' },
        production: { description: 'production' },
      }),
      value: 'local',
    },

    BILLING_WALLET_ADDRESS: {
      description: 'App owned wallet which collects all fees',
      value: '0x7f448FA8cc5db07E8e4eF382B6453b91Bd9B05a6',
      required: true,
    },

    ...pickFromSchemaObject(CloudflareWranglerEnvSchema, {
      CLOUDFLARE_ACCOUNT_ID: {
        value: encryptedVault.item(),
      },
      CLOUDFLARE_API_TOKEN: {
        value: encryptedVault.item(),
      },
    }),

    NETWORK_ID: {
      value: 'base-sepolia',
      extends: DmnoBaseTypes.enum([
        'base', 'base-sepolia',
        'arbitrum', 'arbitrum-sepolia',
      ])
    },
    
    OPENAI_API_KEY: {
      sensitive: true,
      value: encryptedVault.item(),
    },

    GEMINI_API_KEY: {
      sensitive: true,
      value: encryptedVault.item(),
    },
    GOOGLE_SERVICE_ACCOUNT_EMAIL: {
      value: 'secret-agent-llm-caller@dmno-signup-api.iam.gserviceaccount.com',
    },
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: {
      sensitive: true,
      value: encryptedVault.item(),
      coerce: (val) => val.replaceAll('\\n', '\n'),
    },

    
    CDP_CLIENT_API_KEY: {
      externalDocs: {
        description: "OnchainKit Public API Key",
        url: "https://onchainkit.xyz/installation/nextjs#get-your-client-api-key",
      },
      value: 'B3HXZFf3UD56w3OhKwk0NmgZx9CT1fLv',
    },
    CDP_API_KEY_NAME: {
      value: 'organizations/8585afaa-bf44-4f17-9759-295115d95709/apiKeys/f6b0b9cd-b143-4a79-865a-c4f0565d76c6'
    },
    CDP_API_KEY_PRIVATE_KEY: {
      sensitive: true,
      value: encryptedVault.item(),
      coerce: (val) => val.replaceAll('\\n', '\n'),
    },

    LANGSMITH_API_KEY: {
      sensitive: true,
      externalDocs: { url: 'https://docs.smith.langchain.com/administration/how_to_guides/organization_management/create_account_api_key' },
      value: encryptedVault.item(),
    },

    PRIVY_APP_ID: {
      value: 'cm6s6hgoi00irdc7mfvmj8wc7',
    },
    PRIVY_APP_SECRET: {
      externalDocs: { url: 'https://docs.privy.io/guide/server-wallets/setup/api-keys' },
      sensitive: true,
      value: encryptedVault.item(),
    },
    PRIVY_SERVER_WALLET_POLICY_ID: {
      description: 'id of default server wallet policy',
      value: 'n06xo08hs66qbi3ln0w91srd',
      required: true,
    },

    INFURA_API_KEY: {
      value: '70f16b5a2d3f494faf8ceeb6a3d28d17',
    },
    INFURA_API_KEY_SECRET: {
      sensitive: true,
      value: encryptedVault.item(),
    }
  },
});
