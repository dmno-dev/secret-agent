import { Hono } from "hono";
import { HonoEnv } from "../lib/middlewares";
import { eq } from "drizzle-orm";
import { configItemsTable, projectAgentsTable, projectsTable } from "../db/schema";
import { ethers } from "ethers";

export const agentLibRoutes = new Hono<HonoEnv & {
  Variables: {
    agent: any,
    project: any
    configItems: any,
  }
}>().basePath('/agent');

// needed a base path so the middleware below will only fire on these endpoints
agentLibRoutes.use(async (c, next) => {
  const agentAuth = c.req.header('sa-agent-auth');
  if (!agentAuth) return c.json({ error: 'missing sa-agent-auth header' }, 401);
  const [projectId, timestampStr, sig] = agentAuth.split('//');

  // check how old the signed auth header is
  if (+new Date() - parseInt(timestampStr) > 30000) {
    return c.json({ error: 'sa-agent-auth message is too old'}, 401);
  }

  const agentId = await ethers.verifyMessage(`${projectId}//${timestampStr}`, sig);
  console.log('verified agent id =', agentId);

  const db = c.var.db;

  const projectAgent = await db.query.projectAgentsTable.findFirst({
    where: ((t, { eq, and }) => and(eq(t.projectId, projectId), eq(t.id, agentId))),
  });

  if (!projectAgent) {
    await db.insert(projectAgentsTable).values({
      id: agentId,
      projectId,
      label: c.req.header('sa-agent-label'),
    }).returning();
    return c.json({ message: 'agent is not yet authorized for this project', status: 'pending' }, 401);
  } else if (projectAgent.status === 'pending') {
    return c.json({ message: 'agent is not yet authorized for this project', status: 'pending' }, 401);
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
  const db = c.var.db;
  
  const configItems = c.var.configItems;

  const domainPatterns = new Set<string>();
  for (const configItem of configItems) {
    if (configItem.itemType === 'llm') {
      domainPatterns.add('api.openai.com');
    } else {
      // configItem.settings.
    }
  }

  return c.json({
    proxyDomains: Array.from(domainPatterns),
  })
});

// proxy endpoint used by client lib
agentLibRoutes.post('/proxy', async (c) => {
  

  const originalUrl = c.req.header('sa-original-url');
  const originalMethod = c.req.header('sa-original-method')?.toLowerCase() || 'get';
  if (!originalUrl) {
    return c.json({ error: 'Missing required header `sa-original-url`'}, 400);
  }
  
  console.log('SA PROXY', originalMethod, originalUrl);

  // fill in our secrets
  const headers = c.req.header();
  let headersJsonStr = JSON.stringify(headers);
  
  // TODO fetch project settings and replace keys accordingly
  // should first check if url matches pattern and replace relevant keys only
  headersJsonStr = headersJsonStr.replace('{{LLM_KEY}}', DMNO_CONFIG.MASTER_OPENAI_API_KEY);
  headersJsonStr = headersJsonStr.replace('{{LANGSMITH_API_KEY}}', DMNO_CONFIG.MASTER_LANGSMITH_API_KEY);

  const headersJson = JSON.parse(headersJsonStr);
  delete headersJson['sa-agent-auth'];
  delete headersJson['sa-original-url'];
  delete headersJson['sa-original-method'];
  delete headersJson['host'];
  delete headersJson['cf-connecting-ip'];
  
  let bodyToSend: string | Blob | undefined;
  if (headersJson['content-type'] === 'application/json') {
    // example showing changing the model in the proxy
    let reqBodyObj = await c.req.json();
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
  const llmResult = await fetch(originalUrl, {
    method: originalMethod,
    headers: headersJson,
    ...bodyToSend && { body: bodyToSend },
  });

  const resBodyText = await llmResult.text();
  
  const resultContentType = llmResult.headers.get('content-type');
  if (resultContentType) c.header('content-type', resultContentType);
  
  // console.log('llm response', {
  //   statusCode: llmResult.status,
  //   contentType: resultContentType,
  // })


  if (llmResult.status !== 200) {
    console.log('Error!', resBodyText);
  }

  return c.body(resBodyText, llmResult.status as any);
});