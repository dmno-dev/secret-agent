import { DmnoBaseTypes, configPath, defineDmnoService } from 'dmno';
import { EncryptedVaultDmnoPlugin, EncryptedVaultTypes } from '@dmno/encrypted-vault-plugin';

const SecretVault = new EncryptedVaultDmnoPlugin('vault', { key: configPath('..', 'DMNO_VAULT_KEY')});

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
    NETWORK_ID: {
    },
    
    OPENAI_API_KEY: {
      sensitive: true,
      value: SecretVault.item(),
    },
    
    CDP_CLIENT_API_KEY: {
      description: 'used in client components',
      value: 'B3HXZFf3UD56w3OhKwk0NmgZx9CT1fLv',
    },
    CDP_API_KEY_NAME: {
      value: 'organizations/8585afaa-bf44-4f17-9759-295115d95709/apiKeys/f6b0b9cd-b143-4a79-865a-c4f0565d76c6'
    },
    CDP_API_KEY_PRIVATE_KEY: {
      sensitive: true,
      value: SecretVault.item(),
    },
  },
});
