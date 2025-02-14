import { zValidator } from '@hono/zod-validator';
import { and, eq, gt, sql, sum } from 'drizzle-orm';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';
import { UTCDate } from '@date-fns/utc';
import { addHours, subHours, addMinutes, format, subMinutes } from 'date-fns';

import { configItemsTable, ProjectModel, projectsTable, requestsTable } from '../db/schema';
import { convertGweiToUsd, getWalletEthBalance } from '../lib/eth';
import { HonoEnv, loggedInOnly } from '../lib/middlewares';
import { createPrivyServerWallet } from '../lib/privy';
import { serializeConfigItem } from '../lib/serializers';

export const projectRoutes = new Hono<HonoEnv>();

// create new project
projectRoutes.post(
  '/projects',
  loggedInOnly,
  zValidator(
    'json',
    z.object({
      name: z.string().trim().default('Default project'),
    })
  ),
  async (c) => {
    const body = c.req.valid('json');
    console.log('body', body);
    const db = c.var.db;

    const serverWalletInfo = await createPrivyServerWallet();

    const inserted = await db
      .insert(projectsTable)
      .values({
        id: serverWalletInfo.address,
        privyServerWalletId: serverWalletInfo.id,
        name: body.name,
        ownedByUserId: c.var.authUserId,
      })
      .returning();
    const newProject = inserted[0];

    await db
      .insert(configItemsTable)
      .values({
        projectId: newProject.id,
        key: 'LLM_API_KEY',
        itemType: 'llm',
        settings: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.5,
        },
      })
      .returning();

    await db
      .insert(configItemsTable)
      .values({
        projectId: newProject.id,
        key: 'LANGSMITH_API_KEY',
        itemType: 'proxy',
        settings: {
          matchUrl: ['api.smith.langchain.com'],
        },
        value: 'example',
      })
      .returning();

    return c.json(newProject);
  }
);

// get list of projects
projectRoutes.get('/projects', loggedInOnly, async (c) => {
  const db = c.var.db;
  const projects = await db.query.projectsTable.findMany({
    where: (projectsTable, { eq }) => eq(projectsTable.ownedByUserId, c.var.authUserId),
  });
  return c.json(projects);
});

export const projectIdMiddleware = createMiddleware<
  HonoEnv & {
    Variables: {
      project: ProjectModel;
    };
  }
>(async (c, next) => {
  if (!c.var.authUserId) {
    return c.json({ error: 'You must be logged in' }, 401);
  }

  const db = c.var.db;
  const projectId = c.req.param('projectId');
  if (!projectId) throw new Error('Use this middleware only with a :projectId param');

  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, projectId),
  });
  if (!project) {
    return c.json({ error: 'Project does not exist' }, 404);
  }
  if (project.ownedByUserId !== c.var.authUserId) {
    return c.json({ error: 'You can only access your own projects' }, 401);
  }

  c.set('project', project);
  return next();
});

// fetch single project - including config items and usage
projectRoutes.get('/projects/:projectId', projectIdMiddleware, async (c) => {
  const project = c.var.project;
  const db = c.var.db;

  const agents = await db.query.projectAgentsTable.findMany({
    where: (t, { eq }) => eq(t.projectId, project.id),
  });

  const configItems = await db.query.configItemsTable.findMany({
    where: (t, { eq }) => eq(t.projectId, project.id),
  });

  const balanceInfo = await getWalletEthBalance(project.id);
  console.log(balanceInfo);

  return c.json({
    project,
    agents,
    configItems: configItems.map(serializeConfigItem),
  });
});

// update project settings
projectRoutes.patch(
  '/projects/:projectId',
  projectIdMiddleware,
  zValidator(
    'json',
    z.object({
      name: z.string().trim(),
    })
  ),
  async (c) => {
    const body = c.req.valid('json');
    const db = c.var.db;
    const updatedProject = await db
      .update(projectsTable)
      .set({
        name: body.name || undefined,
      })
      .where(eq(projectsTable.id, c.var.project.id))
      .returning();

    return c.json(updatedProject);
  }
);

// get project stats for the current period (since last night midnight GMT)
projectRoutes.get('/projects/:projectId/stats', projectIdMiddleware, async (c) => {
  const project = c.var.project;
  const db = c.var.db;

  // Get the period totals
  const result = await db
    .select({
      cost: sum(sql`costDetails->'ethGwei'`).mapWith(Number),
      promptTokens: sum(sql`responseDetails->'llmResponse'->'usage'->'prompt_tokens'`).mapWith(
        Number
      ),
      completionTokens: sum(
        sql`responseDetails->'llmResponse'->'usage'->'completion_tokens'`
      ).mapWith(Number),
      totalTokens: sum(sql`responseDetails->'llmResponse'->'usage'->'total_tokens'`).mapWith(
        Number
      ),
      proxyCount: sum(sql`CASE WHEN requestType = 'proxy' THEN 1 ELSE 0 END`).mapWith(Number),
      llmCount: sum(sql`CASE WHEN requestType = 'llm' THEN 1 ELSE 0 END`).mapWith(Number),
    })
    .from(requestsTable)
    .where(and(eq(requestsTable.projectId, project.id), sql`DATE(timestamp) = CURRENT_DATE`));

  const totals = result[0];

  // Get hourly data for the last hour
  const hourlyQuery = await db
    .select({
      cost: sum(sql`costDetails->'ethGwei'`).mapWith(Number),
      proxyCount: sum(sql`CASE WHEN requestType = 'proxy' THEN 1 ELSE 0 END`).mapWith(Number),
      llmCount: sum(sql`CASE WHEN requestType = 'llm' THEN 1 ELSE 0 END`).mapWith(Number),
      totalTokens: sum(sql`responseDetails->'llmResponse'->'usage'->'total_tokens'`).mapWith(
        Number
      ),
      time: sql`strftime('%H:%M', timestamp)`.as('time'),
    })
    .from(requestsTable)
    .where(
      and(eq(requestsTable.projectId, project.id), sql`timestamp > datetime('now', '-60 minutes')`)
    )
    .groupBy(sql`strftime('%H:%M', timestamp)`)
    .orderBy(sql`strftime('%H:%M', timestamp)`);

  const now = new UTCDate();
  let t = subMinutes(now, 59); // Start from 59 minutes ago to include current minute
  const recentData: Array<{
    label: string;
    cost: number;
    proxyCount: number;
    llmCount: number;
    totalTokens: number;
  }> = [];
  for (let i = 0; i < 60; i++) {
    const timeStr = format(t, 'HH:mm'); // Use 24-hour format
    const data = hourlyQuery.find((q) => q.time === timeStr);
    recentData.push({
      label: timeStr,
      cost: data?.cost || 0,
      proxyCount: data?.proxyCount || 0,
      llmCount: data?.llmCount || 0,
      totalTokens: data?.totalTokens || 0,
    });
    t = addMinutes(t, 1);
  }

  // Calculate USD cost using our helper function
  const costInUsd = totals?.cost ? await convertGweiToUsd(totals.cost) : 0;

  return c.json({
    totals: {
      ...totals,
      cost: totals?.cost || 0,
      promptTokens: totals?.promptTokens || 0,
      completionTokens: totals?.completionTokens || 0,
      totalTokens: totals?.totalTokens || 0,
      proxyCount: totals?.proxyCount || 0,
      llmCount: totals?.llmCount || 0,
      costInUsd,
    },
    hourly: recentData,
  });
});
