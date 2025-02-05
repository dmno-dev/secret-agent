import { DmnoBaseTypes, defineDmnoService } from 'dmno';

export default defineDmnoService({
  // no `name` specified - will inherit from package.json
  schema: {
    ONCHAINKIT_API_KEY: {
      externalDocs: {
        description: "OnchainKit Public API Key",
        url: "https://onchainkit.xyz/installation/nextjs#get-your-client-api-key",
      },
      value: "B3HXZFf3UD56w3OhKwk0NmgZx9CT1fLv",
    },
  },
});
