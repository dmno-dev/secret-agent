/* eslint-disable @typescript-eslint/no-this-alias */
import ky, { HTTPError, KyInstance } from 'ky';
import https from 'node:https';
import { setTimeout } from 'node:timers/promises';
import { Agent } from 'undici';
import { normalizeClientRequestArgs } from './lib/msw-utils';
import { checkUrlInPatternList } from './lib/url-pattern-utils';

const SECRETAGENT_API_URL = DMNO_CONFIG.SECRETAGENT_API_URL;

type ProjectMetadata = {
  proxyUrls: Array<string>;
  staticConfig: Record<string, string>;
};

type ProjectInitSettings = {
  /** address used to identify this SecretAgent project - also holds the funds which pay for usage */
  projectId: string;
  /** wallet address of this agent, will be used to identify it */
  agentId: string;
  /** name/label for this agent, shown in the dashbaoard */
  agentLabel: string;
  /** method that signs a message using agent's wallet/keys  */
  signMessage: (m: string) => Promise<string>;
  /** max number of times to retry init if agent status is pending (optional, defaults to 10) */
  maxRetryCount?: number;
};

class SecretAgent {
  initSettings!: ProjectInitSettings;
  projectMetadata?: ProjectMetadata;
  private accessedKeys = {} as Record<string, boolean>;
  api: KyInstance;

  constructor() {
    this.api = ky.extend({
      prefixUrl: SECRETAGENT_API_URL,

      // need to ignore self-signed cert error if connecting to localhost
      ...(SECRETAGENT_API_URL.startsWith('https://localhost:') && {
        dispatcher: new Agent({ connect: { rejectUnauthorized: false } }),
      }),

      hooks: {
        beforeRequest: [
          async (request) => {
            // await this.regenerateAuthHeader();
            request.headers.set('sa-agent-auth', this.agentAuthHeader);
            request.headers.set('sa-agent-label', this.initSettings.agentLabel);
          },
        ],
      },
    });
  }

  config = new Proxy({} as Record<string, string>, {
    get: (target, prop, receiver) => {
      if (typeof prop === 'symbol') throw new Error('symbols are not supported');

      // if we havent loaded config yet, we track it so we can verify its not a static item
      if (!this.projectMetadata) {
        this.accessedKeys[prop] = true;
        return `$$${prop}$$`;
      }

      if (this.projectMetadata.staticConfig[prop]) {
        return this.projectMetadata.staticConfig[prop];
      } else {
        return `$$${prop}$$`;
      }
    },
  });

  async init(initSettings: ProjectInitSettings) {
    this.initSettings = initSettings;

    const maxRetryCount = this.initSettings.maxRetryCount ?? 15;

    for (let retryCount = 0; retryCount < maxRetryCount; retryCount++) {
      try {
        await this.regenerateAuthHeader();
        const metadataReq = await this.api.get('agent/project-metadata');
        const metadata: any = await metadataReq.json();
        // console.log(metadata);
        this.projectMetadata = metadata;
        // unref helps it not keep the process running
        setInterval(() => this.regenerateAuthHeader(), 25000).unref();
        break;
      } catch (err) {
        if (err instanceof HTTPError) {
          const errBody = await err.response.json();
          if (errBody?.status === 'pending') {
            if (retryCount === 0) {
              console.log('This agent is not yet enabled for this project');
              console.log(
                `An admin must approve it @ https://secretagent.sh/dashboard?projectId=${this.initSettings.projectId}`
              );
              console.log('Will retry for the next few minutes...');
            } else {
              console.log(`> retry ${retryCount + 1} of ${maxRetryCount} failed`);
            }
            await setTimeout(10000);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    }

    // check if any config items used before load are static
    const staticKeys = Object.keys(this.projectMetadata!.staticConfig);
    Object.keys(this.accessedKeys).forEach((k) => {
      if (staticKeys.includes(k)) {
        throw new Error(
          `Config item ${k} is static, do not use until after calling SecretAgent.init`
        );
      }
    });

    this.enableHttpsInterceptor();
    this.enableFetchInterceptor();
  }

  agentAuthHeader!: string;
  private async regenerateAuthHeader() {
    // TODO: add some caching here, reuse signed header for a while
    const message = `${this.initSettings.projectId}//${+new Date()}`;
    const sig = await this.initSettings.signMessage(message);
    this.agentAuthHeader = `${message}//${sig}`;
  }

  private enableHttpsInterceptor() {
    const { get: originalHttpsGet, request: originalHttpsRequest } = https;

    (https as any)._originalHttpsRequest = originalHttpsRequest;

    const singleton = this;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    https.request = function patchedHttpsRequest(...args: Parameters<typeof https.request>) {
      const [url, options, callback] = normalizeClientRequestArgs('https:', args);

      if (!singleton.projectMetadata) {
        throw new Error('SecretAgent project metadata not loaded properly');
      }
      if (!checkUrlInPatternList(url.href, singleton.projectMetadata.proxyUrls)) {
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
      headers['sa-original-url'] = url.href;
      headers['sa-original-method'] = options.method || 'get';
      headers['sa-agent-auth'] = singleton.agentAuthHeader;

      return originalHttpsRequest(
        // call our proxy url instead
        `${SECRETAGENT_API_URL}/agent/proxy`,
        {
          ...options,
          headers,
          rejectUnauthorized: false,
          method: 'POST',
        }
      );
    };
    https.get = https.request;
  }
  private enableFetchInterceptor() {
    const singleton = this;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = function patchedFetch(...args: Parameters<typeof fetch>) {
      const [urlOrFetchOpts, fetchOptsArg] = args;
      let url: string;
      const headers: Record<string, string> = {};
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

      if (!singleton.projectMetadata) {
        throw new Error('SecretAgent project metadata not loaded properly');
      }
      if (!checkUrlInPatternList(url, singleton.projectMetadata.proxyUrls)) {
        // console.log(`> fetch ${url} (no proxy)`);
        return originalFetch(...args);
      }

      headers['sa-original-url'] = url;
      headers['sa-original-method'] = method || 'get';
      headers['sa-agent-auth'] = singleton.agentAuthHeader;

      // console.log('making proxy fetch req', url, headers);

      return originalFetch(`${SECRETAGENT_API_URL}/agent/proxy`, {
        headers,
        method: 'POST',
        body,

        ...(SECRETAGENT_API_URL.startsWith('https://localhost:') && {
          dispatcher: new Agent({ connect: { rejectUnauthorized: false } }),
        }),
      });
    };
  }
}

// main export will be a singleton
export default new SecretAgent();
