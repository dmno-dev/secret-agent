import { defineDmnoService, pick } from 'dmno';

export default defineDmnoService({
  schema: {
    NETWORK_ID: {
      required: true,
      extends: pick(),
    },
    CDP_API_KEY_NAME: {
      required: true,
      extends: pick(),
    },
    CDP_API_KEY_PRIVATE_KEY: {
      required: true,
      extends: pick(),
    },
    SECRETAGENT_PROJECT_ID: {
      required: true,
    }
  },
});
