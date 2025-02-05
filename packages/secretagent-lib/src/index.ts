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
  }
  private enableHttpsInterceptor() {
    const { get: originalHttpsGet, request: originalHttpsRequest } = https;

    (https as any)._originalHttpsRequest = originalHttpsRequest;

    const projectSettings = this.projectSettings;

    // @ts-ignore
    https.request = function patchedHttpsRequest (...args: Parameters<typeof https.request>) {
      const [url, options, callback] = normalizeClientRequestArgs('https:', args);
  
      if (!checkUrlInPatternList(url.href, projectSettings.proxyDomains)) {
        console.log(`> ${url} (no proxy)`);
        return originalHttpsRequest(...args);
      }
      
      console.log(`> ${url} (proxy!)`);
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
}

// main export will be a singleton 
export default new SecretAgent();