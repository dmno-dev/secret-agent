import { and, eq, gt, sql, sum } from 'drizzle-orm';
import { ethers } from 'ethers';
import crypto from 'node:crypto';
import { Hono } from 'hono';
import { getConnInfo } from 'hono/cloudflare-workers';
import {
  AgentModel,
  ConfigItemModel,
  configItemsTable,
  projectAgentsTable,
  ProjectModel,
  projectsTable,
  requestsTable,
} from '../db/schema';
import { HonoEnv } from '../lib/middlewares';
import { checkUrlInPatternList } from '../lib/url-pattern-utils';
import { convertGweiToUsd, ETH_TO_GWEI, getWalletEthBalance } from '../lib/eth';

// costs in USD cents
const STATIC_COST = 0.1;
const PROXY_COST = 0.2;
const LLM_COST = 5;

export const agentLibRoutes = new Hono<
  HonoEnv & {
    Variables: {
      agent: AgentModel;
      project: ProjectModel;
      configItems: Array<ConfigItemModel>;
      requestIp?: string;
      projectWalletBalanceInfo: Awaited<ReturnType<typeof getWalletEthBalance>>;
      projectEffectiveBalanceCents: number;
    };
  }
>().basePath('/agent');

// needed a base path so the middleware below will only fire on these endpoints
agentLibRoutes.use(async (c, next) => {
  const info = getConnInfo(c); // info is `ConnInfo`
  c.set('requestIp', info.remote.address);

  const agentAuth = c.req.header('sa-agent-auth');
  if (!agentAuth) return c.json({ error: 'missing sa-agent-auth header' }, 401);
  const [projectId, timestampStr, sig] = agentAuth.split('//');

  // check how old the signed auth header is
  if (+new Date() - parseInt(timestampStr) > 30000) {
    return c.json({ error: 'sa-agent-auth message is too old' }, 401);
  }

  const agentId = await ethers.verifyMessage(`${projectId}//${timestampStr}`, sig);

  const db = c.var.db;

  const projectAgent = await db.query.projectAgentsTable.findFirst({
    where: (t, { eq, and }) => and(eq(t.projectId, projectId), eq(t.id, agentId)),
  });

  if (!projectAgent) {
    await db
      .insert(projectAgentsTable)
      .values({
        id: agentId,
        projectId,
        label: c.req.header('sa-agent-label'),
      })
      .returning();
    return c.json(
      { message: 'agent is not yet authorized for this project', status: 'pending' },
      401
    );
  } else if (projectAgent.status === 'pending') {
    return c.json(
      { message: 'agent is not yet authorized for this project', status: 'pending' },
      401
    );
  } else if (projectAgent.status === 'disabled') {
    return c.json({ message: 'agent has been disabled for this project', status: 'disabled' }, 401);
  }

  c.set('agent', projectAgent);

  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, projectId),
  });
  if (!project) return c.json({ error: 'Project does not exist' }, 404);
  c.set('project', project);

  const projectWalletBalanceInfo = await getWalletEthBalance(project.id);
  c.set('projectWalletBalanceInfo', projectWalletBalanceInfo);

  const lastMidnight = new Date(new Date().toISOString().substring(0, 10));
  const usageResult = await db
    .select({
      cost: sum(sql`costDetails->'ethGwei'`).mapWith(Number),
    })
    .from(requestsTable)
    .where(and(eq(requestsTable.projectId, project.id), gt(requestsTable.timestamp, lastMidnight)));

  const usageUsd = await convertGweiToUsd(usageResult[0].cost);
  const effectiveBalance = projectWalletBalanceInfo.usdCents - usageUsd;
  c.set('projectEffectiveBalanceCents', effectiveBalance);

  const configItems = await db.query.configItemsTable.findMany({
    where: eq(configItemsTable.projectId, c.var.project.id),
  });
  c.set('configItems', configItems);

  return next();
});

// endpoint used by client lib to fetch minimal project metadata
agentLibRoutes.get('/project-metadata', async (c) => {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const { db, configItems, project, agent } = c.var;

  if (c.var.projectEffectiveBalanceCents < 100) {
    return c.json(
      {
        message:
          'SecretAgent project wallet must have minimum buffer of $1usd (of ETH) for agent to connect',
      },
      402 // "Payment Required" response code
    );
  }

  const domainPatterns = new Set<string>();
  const staticConfig = {} as Record<string, string>;
  for (const configItem of configItems) {
    if (configItem.itemType === 'llm') {
      domainPatterns.add('api.openai.com');
    } else if (configItem.itemType === 'proxy') {
      configItem.settings?.matchUrl?.forEach((m: string) => domainPatterns.add(m));
    } else if (configItem.itemType === 'static') {
      staticConfig[configItem.key] = configItem.value!;
    }
  }

  // make last connected on agent
  await db
    .update(projectAgentsTable)
    .set({
      lastConnectedAt: timestamp,
    })
    .where(and(eq(projectAgentsTable.projectId, project.id), eq(projectAgentsTable.id, agent.id)));

  const staticKeys = Object.keys(staticConfig);

  const currentEthPriceCents = c.var.projectWalletBalanceInfo.ethPriceCents;

  const costUsd = staticKeys.length ? STATIC_COST : 0;

  // track usage of static keys
  await db.insert(requestsTable).values({
    id: requestId,
    projectId: project.id,
    agentId: agent.id,
    timestamp,
    requestType: 'init',
    requestDetails: {
      ip: c.var.requestIp,
      staticKeys,
    },
    // small fee if using any static config
    costDetails: {
      // gwei should be safe to store as regular number/int
      ethGwei: Math.round((costUsd / currentEthPriceCents) * ETH_TO_GWEI),
      ethPriceCents: currentEthPriceCents,
    },
  });

  return c.json({
    proxyUrls: Array.from(domainPatterns),
    staticConfig,
  });
});

// proxy endpoint used by client lib
agentLibRoutes.post('/proxy', async (c) => {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const { db, configItems, project, agent } = c.var;

  const originalUrl = c.req.header('sa-original-url');
  const originalMethod = c.req.header('sa-original-method')?.toLowerCase() || 'get';
  if (!originalUrl) {
    return c.json({ error: 'Missing required header `sa-original-url`' }, 400);
  }

  let sharedLlmConfigItem: ConfigItemModel | undefined;
  const usedProxyKeys = new Set<string>();

  // replace placeholder secrets with actual values
  const headers = c.req.header();
  let headersJsonStr = JSON.stringify(headers);
  for (const configItem of configItems) {
    if (configItem.itemType === 'llm') {
      if (checkUrlInPatternList(originalUrl, ['api.openai.com'])) {
        const key = `$$${configItem.key}$$`;
        if (headersJsonStr.includes(key)) {
          if (sharedLlmConfigItem) {
            throw new Error('did not expect to find 2 llm keys in the request');
          }
          sharedLlmConfigItem = configItem;
          // TODO: check settings on this key, allow switching providers, model, etc

          headersJsonStr = headersJsonStr.replaceAll(key, DMNO_CONFIG.MASTER_OPENAI_API_KEY);
        }
      }
    } else if (configItem.itemType === 'proxy') {
      if (checkUrlInPatternList(originalUrl, configItem.settings?.matchUrl || [])) {
        const key = `$$${configItem.key}$$`;
        if (headersJsonStr.includes(key)) {
          usedProxyKeys.add(configItem.key);
          if (!configItem.value) throw new Error(`config item "${key}" is missing value`);
          headersJsonStr = headersJsonStr.replaceAll(key, configItem.value);
        }
      }
    }
  }

  const headersJson = JSON.parse(headersJsonStr);
  delete headersJson['sa-agent-auth'];
  delete headersJson['sa-original-url'];
  delete headersJson['sa-original-method'];
  delete headersJson['host'];
  delete headersJson['cf-connecting-ip'];

  let bodyToSend: string | Blob | undefined;
  let reqBodyObj: Record<string, any> | undefined;
  if (headersJson['content-type'] === 'application/json' && sharedLlmConfigItem) {
    // example showing changing the request config (model, etc)
    reqBodyObj = await c.req.json();

    // TODO: swap params, adjust content length?

    bodyToSend = JSON.stringify(reqBodyObj);
  } else if (originalMethod !== 'get' && originalMethod !== 'head') {
    bodyToSend = await c.req.blob();
  }

  // TODO: estimate cost based on input and model
  if (c.var.projectEffectiveBalanceCents < 200) {
    if (sharedLlmConfigItem) {
      // we embed our error message in a normal looking response, so the chat agent continues
      return c.json({
        id: `chatcmpl-error${+new Date()}`,
        object: 'chat.completion',
        created: +new Date(),
        model: reqBodyObj!.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: [
                '',
                "> 🤑 Sorry I'm running low on LLM credits",
                // TODO: add correct chain
                `> 💸 Please send ETH to ${project.id} (on Base Sepolia) and try your request again.`,
                '>> This agent is powered by https://SecretAgent.sh 😎 <<',
                '',
              ].join('\n'),
              refusal: null,
            },
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
          completion_tokens_details: {
            reasoning_tokens: 0,
            audio_tokens: 0,
            accepted_prediction_tokens: 0,
            rejected_prediction_tokens: 0,
          },
        },
        service_tier: 'default',
        system_fingerprint: 'fp_72ed7ab54c',
      });
    } else {
      return c.json(
        {
          message:
            'SecretAgent project wallet has insufficient funds to make a proxied API request',
        },
        402 // "Payment Required" response code
      );
    }
  }

  // do we want to allow substitution in URL?

  let response: Response;
  let llmResponseJson: any;
  let responseStatusCode: number | undefined;

  let costUsdCents = PROXY_COST;

  try {
    // make fetch call to original url
    const proxiedReqResult = await fetch(originalUrl, {
      method: originalMethod,
      headers: headersJson,
      ...(bodyToSend && { body: bodyToSend }),
    });
    const resBodyText = await proxiedReqResult.text();

    const resultContentType = proxiedReqResult.headers.get('content-type');
    if (resultContentType) c.header('content-type', resultContentType);

    if (proxiedReqResult.status >= 400) {
      console.log('Error!', resBodyText);
    }

    // record some stats about tokens if this was an LLM request
    if (sharedLlmConfigItem && resultContentType === 'application/json') {
      llmResponseJson = JSON.parse(resBodyText);
      console.log(JSON.stringify(llmResponseJson));
      // TODO: determine LLM cost based on token usage info
      costUsdCents = LLM_COST;
      console.log('token usage info', llmResponseJson.usage);
    } else {
      console.log('response', resBodyText);
    }

    responseStatusCode = proxiedReqResult.status;

    response = c.body(resBodyText, proxiedReqResult.status as any);
  } catch (err: any) {
    console.log('ERROR DURING PROXY!');
    console.log(err);
    response = c.json({ secretAgentProxyError: 'Something went wrong...' }, 500);
  }

  const currentEthPriceCents = c.var.projectWalletBalanceInfo.ethPriceCents;
  // track usage
  await db.insert(requestsTable).values({
    id: requestId,
    projectId: project.id,
    agentId: agent.id,
    timestamp,
    requestType: sharedLlmConfigItem ? 'llm' : 'proxy',
    requestDetails: {
      url: originalUrl,
      method: originalMethod,
      ip: c.var.requestIp,
      ...(sharedLlmConfigItem && { llmKey: sharedLlmConfigItem.key }),
      ...(usedProxyKeys.size && { proxyKeys: Array.from(usedProxyKeys) }),
    },
    responseDetails: {
      statusCode: responseStatusCode,
      ...(llmResponseJson && { llmResponse: llmResponseJson }),
    },
    costDetails: {
      // gwei should be safe to store as regular number/int
      ethGwei: Math.round((costUsdCents / currentEthPriceCents) * ETH_TO_GWEI),
      ethPriceCents: currentEthPriceCents,
    },
  });

  return response;
});
