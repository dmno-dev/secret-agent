import ky from 'ky';


export const AUTH_KEY_LOCALSTORAGE_KEY = 'SA_AUTH_TOKEN';

export const secretAgentApi = ky.extend({
  prefixUrl: DMNO_PUBLIC_CONFIG.SECRETAGENT_API_URL,
  hooks: {
    beforeRequest: [
      (req) => {
        console.log('making request!', req.url);
        const authToken = window.localStorage.getItem(AUTH_KEY_LOCALSTORAGE_KEY);
        if (!authToken) throw new Error('not logged in');

        req.headers.set('sa-admin-auth', authToken)
      }
    ]
  }
});

// makes it easier to make authd requests from dev tools console
(window as any).api = secretAgentApi;