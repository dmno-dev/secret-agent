import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { Hono } from 'hono';
import { configItemsTable, projectAgentsTable, projectsTable } from '../db/schema';
import { HonoEnv } from '../lib/middlewares';
import { checkUrlInPatternList } from '../lib/url-pattern-utils';

export const agentLibRoutes = new Hono<
  HonoEnv & {
    Variables: {
      agent: any;
      project: any;
      configItems: any;
    };
  }
>().basePath('/agent');

// needed a base path so the middleware below will only fire on these endpoints
agentLibRoutes.use(async (c, next) => {
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

  const configItems = await db.query.configItemsTable.findMany({
    where: eq(configItemsTable.projectId, c.var.project.id),
  });
  c.set('configItems', configItems);

  return next();
});

// endpoint used by client lib to fetch minimal project metadata
agentLibRoutes.get('/project-metadata', async (c) => {
  const configItems = c.var.configItems;

  const domainPatterns = new Set<string>();
  const staticConfig = {} as Record<string, string>;
  for (const configItem of configItems) {
    if (configItem.itemType === 'llm') {
      domainPatterns.add('api.openai.com');
    } else if (configItem.itemType === 'proxy') {
      configItem.settings?.matchUrl?.forEach((m: string) => domainPatterns.add(m));
    } else if (configItem.itemType === 'static') {
      staticConfig[configItem.key] = configItem.value;
    }
  }

  return c.json({
    proxyUrls: Array.from(domainPatterns),
    staticConfig,
  });
});

// proxy endpoint used by client lib
agentLibRoutes.post('/proxy', async (c) => {
  const originalUrl = c.req.header('sa-original-url');
  const originalMethod = c.req.header('sa-original-method')?.toLowerCase() || 'get';
  if (!originalUrl) {
    return c.json({ error: 'Missing required header `sa-original-url`' }, 400);
  }

  // fill in our secrets
  const headers = c.req.header();
  let headersJsonStr = JSON.stringify(headers);

  const configItems = c.var.configItems;

  let isLlmSharedKeyRequest = false;

  for (const configItem of configItems) {
    if (configItem.itemType === 'llm') {
      if (checkUrlInPatternList(originalUrl, ['api.openai.com'])) {
        const key = `$$${configItem.key}$$`;
        if (headersJsonStr.includes(key)) {
          isLlmSharedKeyRequest = true;
          // TODO: record usage of the key
          headersJsonStr = headersJsonStr.replaceAll(key, DMNO_CONFIG.MASTER_OPENAI_API_KEY);
        }
      }
    } else if (configItem.itemType === 'proxy') {
      if (checkUrlInPatternList(originalUrl, configItem.settings?.matchUrl || [])) {
        const key = `$$${configItem.key}$$`;
        if (headersJsonStr.includes(key)) {
          // TODO: record usage of the key
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
  if (headersJson['content-type'] === 'application/json') {
    // example showing changing the model in the proxy
    const reqBodyObj = await c.req.json();
    if (reqBodyObj.model) {
      reqBodyObj.model = 'gpt-4o-mini';
    }
    bodyToSend = JSON.stringify(reqBodyObj);
  } else if (originalMethod !== 'get' && originalMethod !== 'head') {
    bodyToSend = await c.req.blob();
  }

  // TODO: do we want to substitution in request body too?
  // note - if we mess with the body, we'll have to adjust content-length header
  // TODO: do we want to do any substitution in URL?

  // make fetch call to original url
  const proxiedReqResult = await fetch(originalUrl, {
    method: originalMethod,
    headers: headersJson,
    ...(bodyToSend && { body: bodyToSend }),
  });

  if (isLlmSharedKeyRequest) {
    // TODO: record usage/tokens
  }

  const resBodyText = await proxiedReqResult.text();

  const resultContentType = proxiedReqResult.headers.get('content-type');
  if (resultContentType) c.header('content-type', resultContentType);

  if (proxiedReqResult.status !== 200) {
    console.log('Error!', resBodyText);
  }

  return c.body(resBodyText, proxiedReqResult.status as any);
});
