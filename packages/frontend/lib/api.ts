import ky from 'ky';

export const AUTH_KEY_LOCALSTORAGE_KEY = 'SA_AUTH_TOKEN';

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_KEY_LOCALSTORAGE_KEY);
};

export const secretAgentApi = ky.extend({
  prefixUrl: DMNO_PUBLIC_CONFIG.SECRETAGENT_API_URL,
  hooks: {
    beforeRequest: [
      (req) => {
        console.log('making request!', req.url);
        const authToken = getAuthToken();

        if (!authToken) throw new Error('not logged in');
        req.headers.set('sa-admin-auth', authToken);
      },
    ],
  },
});

// Dev tools helper that only runs in browser
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).api = secretAgentApi;
}
