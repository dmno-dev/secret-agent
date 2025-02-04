import { DmnoBaseTypes, defineDmnoService } from 'dmno';

export default defineDmnoService({
  settings: {
    redactSensitiveLogs: true,
    interceptSensitiveLeakRequests: true,
    preventClientLeaks: true,
  },
  name: 'root',
  schema: {
    NETWORK_ID: {
      sensitive: true,
    },
    CDP_API_KEY_NAME: {
      sensitive: true,
    },
    CDP_API_KEY_PRIVATE_KEY: {
      sensitive: true,
    },
  },
});
