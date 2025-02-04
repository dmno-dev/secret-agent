import { DmnoBaseTypes, defineDmnoService, pick } from 'dmno';

export default defineDmnoService({
  schema: {
    MASTER_OPENAI_API_KEY: {
      extends: pick('root', 'OPENAI_API_KEY'),
      required: true,
    }
  },
});
