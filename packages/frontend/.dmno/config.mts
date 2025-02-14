import { DmnoBaseTypes, defineDmnoService, pick, switchBy } from 'dmno';

export default defineDmnoService({
  name: 'frontend',
  schema: {
    SECRETAGENT_ENV: pick(),
    SECRETAGENT_API_URL: pick('api'),
    ONCHAINKIT_API_KEY: pick('root', 'CDP_CLIENT_API_KEY'),

    PORT: {
      extends: DmnoBaseTypes.port,
      value: 3000,
    },

    SECRETAGENT_WEB_URL: {
      extends: 'url',
      required: true,
      value: switchBy('SECRETAGENT_ENV', {
        'local': () => `https://localhost:${DMNO_CONFIG.PORT}`,
        'production': 'https://secretagent.sh',
      })
    },

    PAYMASTER_API_URL: {
      extends: 'url',
      required: true,
      value: 'https://api.developer.coinbase.com/rpc/v1/base-sepolia/9RVvr1pvpoZSbTtdGbW6XJmF6a3HdbtL',
    },

    OCK_PROJECT_ID: {
      extends: 'string',
      required: true,
      value: '1b942ee5-6082-4898-bf72-9ace467959b4',
    },

    CHATBOT_URL: {
      extends: 'url',
      required: true,
      value: 'https://autonome.alt.technology/sa2-rpnrje',
    },

    CHATBOT_USERNAME: {
      extends: 'string',
      required: true,
      value: 'sa2',
    },

    CHATBOT_PASSWORD: {
      extends: 'string',
      required: true,
      value: 'qfljGmbhjk',
    },
  },
});
