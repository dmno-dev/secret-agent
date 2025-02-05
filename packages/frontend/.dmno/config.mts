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
        'local': () => `http://localhost:${DMNO_CONFIG.PORT}`,
        'production': 'https://secretagent.sh',
      })
    }

  },
});
