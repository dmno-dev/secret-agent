import ky, { KyInstance } from 'ky';
import { Agent } from 'undici';
import https from 'node:https'
import { normalizeClientRequestArgs } from './lib/msw-utils';
import { checkUrlInPatternList } from './lib/url-pattern-utils';

// TODO: swap to prod url
const SECRETAGENT_API_URL = 'https://localhost:8787/api'

type ProjectSettings = {
  proxyDomains: Array<string>,
}

class SecretAgent {
  projectSettings!: ProjectSettings;
  api: KyInstance;

  constructor() {
    this.api = ky.extend({
      prefixUrl: SECRETAGENT_API_URL,
    
      // need to ignore self-signed cert error if connecting to localhost
      ...SECRETAGENT_API_URL.startsWith('https://localhost:') && {
        // @ts-ignore
        dispatcher: new Agent({ connect: { rejectUnauthorized: false } }),
      },
      
      
      // hooks: {
      //   beforeRequest: [
      //     request => {
      //       request.headers.set('X-Requested-With', 'ky');
      //     }
      //   ]
      // }
    });
  }

  async init(initOptions: {
    /** address used to identify this SecretAgent project - also holds the funds which pay for usage */
    projectAddress: string,
    /** wallet address of this agent, will be used to identify it */
    agentAddress: string,
    /** method that signs a message using agent's wallet/keys  */
    signMessage: (m: string) => Promise<string>
  }) {
    const settingsReq = await this.api.get('project-config');
    const settings: any = await settingsReq.json();
    console.log(settings);
    this.projectSettings = settings;
    this.enableHttpsInterceptor();
    this.enableFetchInterceptor();
  }
  private enableHttpsInterceptor() {
    const { get: originalHttpsGet, request: originalHttpsRequest } = https;

    (https as any)._originalHttpsRequest = originalHttpsRequest;

    const projectSettings = this.projectSettings;

    // @ts-ignore
    https.request = function patchedHttpsRequest (...args: Parameters<typeof https.request>) {
      const [url, options, callback] = normalizeClientRequestArgs('https:', args);
  
      if (!checkUrlInPatternList(url.href, projectSettings.proxyDomains)) {
        // console.log(`> https req ${url} (no proxy)`);
        return originalHttpsRequest(...args);
      }
      
      // console.log(`> https req ${url} (proxy!)`);
      // delete url related config from options
      delete options.host;
      delete options.hostname;
      delete options.port;
      delete options.path;

      const headers = options.headers || {};
      // pass along original request URL and method as headers
      headers['sa-original-url'] = url.href
      headers['sa-original-method'] = options.method;

      return originalHttpsRequest(
        // call our proxy url instead
        `${SECRETAGENT_API_URL}/proxy`, {
          ...options,
          headers,
          rejectUnauthorized: false,
          method: 'POST',
        }
      );
    }
  }
  private enableFetchInterceptor() {
    const projectSettings = this.projectSettings;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = function patchedFetch(...args: Parameters<typeof fetch>) {
      const [urlOrFetchOpts, fetchOptsArg] = args;
      let url: string;
      let headers: Record<string, string> = {};
      let method: string | undefined;
      let body: any;
      if (urlOrFetchOpts instanceof URL) {
        url = urlOrFetchOpts.href;
      } else if (urlOrFetchOpts instanceof Request) {
        url = urlOrFetchOpts.url;
        body = urlOrFetchOpts.body;
        Object.assign(headers, urlOrFetchOpts.headers);
      } else {
        url = urlOrFetchOpts;
      }
      if (fetchOptsArg) {
        // console.log(fetchOptsArg.headers);
        Object.assign(headers, fetchOptsArg.headers);
        method = fetchOptsArg.method;
        body = fetchOptsArg.body;
      }
    
      if (!checkUrlInPatternList(url, projectSettings.proxyDomains)) {
        // console.log(`> fetch ${url} (no proxy)`);
        return originalFetch(...args);
      }

      headers['sa-original-url'] = url;
      headers['sa-original-method'] = method || 'get';

      // console.log('making proxy fetch req', url, headers);

      return originalFetch(`${SECRETAGENT_API_URL}/proxy`, {
        headers,
        method,
        body,

        ...SECRETAGENT_API_URL.startsWith('https://localhost:') && {
          // @ts-ignore
          dispatcher: new Agent({ connect: { rejectUnauthorized: false } }),
        },
        
      });
    }
  }
}

// main export will be a singleton 
export default new SecretAgent();