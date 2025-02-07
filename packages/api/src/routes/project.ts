import { createMiddleware } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';

import { createPrivyServerWallet } from '../lib/privy';
import { configItemsTable, projectsTable } from '../db/schema';
import { HonoEnv, loggedInOnly } from '../lib/middlewares';
import { serializeConfigItem } from './config-items';

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

    const newProject = await db
      .insert(projectsTable)
      .values({
        id: serverWalletInfo.address,
        privyServerWalletId: serverWalletInfo.id,
        name: body.name,
        ownedByUserId: c.var.authUserId,
      })
      .returning();

    return c.json(newProject[0]);
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
      project: any;
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
