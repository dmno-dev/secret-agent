import { DmnoBaseTypes, defineDmnoService } from 'dmno';

export default defineDmnoService({
  schema: {
    OPENAI_API_KEY: {
      required: true,
      sensitive: true,
    },
    NETWORK_ID: {
      value: 'base-sepolia'
    },
    CDP_API_KEY_NAME: {
      required: true,
    },
    CDP_API_KEY_PRIVATE_KEY: {
      sensitive: true,
      required: true,
      coerce: (val) => val.replaceAll('\\n', '\n'),
    },
  },
});
