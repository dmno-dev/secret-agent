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
        prod: { description: 'production' },
      }),
      value: 'local',
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
    },
    
    OPENAI_API_KEY: {
      sensitive: true,
      value: encryptedVault.item(),
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
    }
  },
});
