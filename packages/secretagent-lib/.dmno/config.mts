import { DmnoBaseTypes, defineDmnoService, pick } from 'dmno';

export default defineDmnoService({
  // no `name` specified - will inherit from package.json
  schema: {
    SECRETAGENT_API_URL: {
      extends: pick('api'),
      required: true,
    }
  },
});
