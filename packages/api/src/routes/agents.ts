import { createMiddleware } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Hono } from 'hono';
import { and, eq } from 'drizzle-orm';

import { projectAgentsTable, projectsTable } from '../db/schema';
import { HonoEnv } from '../lib/middlewares';
import { projectIdMiddleware } from './project';
import { getWalletEthBalance } from '../lib/eth';

export const agentRoutes = new Hono<HonoEnv>();

// create new agent from the UI
agentRoutes.post(
  '/projects/:projectId/agents',
  projectIdMiddleware,
  zValidator(
    'json',
    z.object({
      id: z.string().trim(),
      label: z.string().trim(),
    })
  ),
  async (c) => {
    const body = c.req.valid('json');
    console.log('body', body);
    const db = c.var.db;

    const newAgent = await db
      .insert(projectAgentsTable)
      .values({
        id: body.id,
        projectId: c.var.project.id,
        label: body.label,
        status: 'enabled',
      })
      .returning();

    return c.json(newAgent[0]);
  }
);

export const agentIdMiddleware = createMiddleware<
  HonoEnv & {
    Variables: {
      project: any;
      agent: any;
    };
  }
>(async (c, next) => {
  if (!c.var.authUserId) {
    return c.json({ error: 'You must be logged in' }, 401);
  }

  if (!c.var.project) throw new Error('Use this middleware only with the :projectId middleware');

  const db = c.var.db;
  const agentId = c.req.param('agentId');
  if (!agentId) throw new Error('Use this middleware only with a :agentId param');

  const agent = await db.query.projectAgentsTable.findFirst({
    where: (t, { eq, and }) => and(eq(t.projectId, c.var.project.id), eq(t.id, agentId)),
  });
  if (!agent) {
    return c.json({ error: 'Project does not exist' }, 404);
  }

  c.set('agent', agent);
  return next();
});

// get agent details
agentRoutes.get(
  '/projects/:projectId/agents/:agentId',
  projectIdMiddleware,
  agentIdMiddleware,
  async (c) => {
    const agent = c.var.project;
    return c.json(agent);
  }
);

// update agent status
agentRoutes.patch(
  '/projects/:projectId/agents/:agentId',
  projectIdMiddleware,
  agentIdMiddleware,
  zValidator(
    'json',
    z
      .object({
        label: z.string(),
        status: z.enum(['enabled', 'disabled', 'paused']),
      })
      .partial()
  ),
  async (c) => {
    const body = c.req.valid('json');
    const db = c.var.db;
    const updatedAgent = await db
      .update(projectAgentsTable)
      .set({
        label: body.label,
        status: body.status,
      })
      .where(
        and(
          eq(projectAgentsTable.projectId, c.var.project.id),
          eq(projectAgentsTable.id, c.var.agent.id)
        )
      )
      .returning();

    return c.json(updatedAgent);
  }
);

// Add agent-specific route for getting project balance
agentRoutes.get('/agent/project-balance', async (c) => {
  const db = c.var.db;
  const agentAuth = c.req.header('sa-agent-auth');

  if (!agentAuth) {
    return c.json({ error: 'Missing agent auth header' }, 401);
  }

  const [projectId] = agentAuth.split('//');
  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, projectId),
  });

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const balanceInfo = await getWalletEthBalance(project.id);
  return c.json({ balanceInfo });
});
