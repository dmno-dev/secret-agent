import ky from 'ky';

export const AUTH_KEY_LOCALSTORAGE_KEY = 'SA_AUTH_TOKEN';
export const AUTH_ID_LOCALSTORAGE_KEY = 'SA_AUTH_ID';

const getAuthInfo = () => {
  if (typeof window === 'undefined') return null;
  const authToken = window.localStorage.getItem(AUTH_KEY_LOCALSTORAGE_KEY);
  if (!authToken) return null;

  try {
    const [signature, timestamp] = authToken.split('|');
    return {
      id: window.localStorage.getItem(AUTH_ID_LOCALSTORAGE_KEY)!,
      auth: signature,
      timestamp,
      nonce: window.localStorage.getItem('SA_AUTH_NONCE') || '',
      uri: DMNO_PUBLIC_CONFIG.SECRETAGENT_WEB_URL,
    };
  } catch (e) {
    return null;
  }
};

export const secretAgentApi = ky.extend({
  prefixUrl: DMNO_PUBLIC_CONFIG.SECRETAGENT_API_URL,
  hooks: {
    beforeRequest: [
      (req) => {
        console.log('making request!', req.url);
        const authInfo = getAuthInfo();

        if (!authInfo) throw new Error('not logged in');
        req.headers.set('sa-admin-auth', authInfo.auth);
        req.headers.set('sa-user-id', authInfo.id);
        req.headers.set('sa-auth-timestamp', authInfo.timestamp);
        req.headers.set('sa-auth-nonce', authInfo.nonce);
        req.headers.set('sa-auth-uri', authInfo.uri);
      },
    ],
  },
});

// Dev tools helper that only runs in browser
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).api = secretAgentApi;
}
