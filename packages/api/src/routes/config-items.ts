import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Hono } from 'hono';

import { configItemsTable } from '../db/schema';
import { HonoEnv } from '../lib/middlewares';
import { projectIdMiddleware } from './project';
import { eq } from 'drizzle-orm';

export const configItemRoutes = new Hono<HonoEnv>();

const configItemUpdateSchema = z.object({
  key: z.string().trim().default('Default project'),
  itemType: z.enum(['llm', 'user']).default('llm'),
  // TODO: refine based on itemType
  value: z.string().optional(),
  llmSettings: z.object().optional(),
  settings: z.object().optional(),
});

// create new config item
configItemRoutes.post(
  '/projects/:projectId/config-items',
  projectIdMiddleware,
  zValidator('json', configItemUpdateSchema),
  async (c) => {
    const body = c.req.valid('json');
    const db = c.var.db;

    const newItem = await db
      .insert(configItemsTable)
      .values({
        projectId: c.var.project.id,
        key: body.key,
        itemType: body.itemType,
        value: body.value,
        settings: body.itemType === 'llm' ? body.llmSettings : body.settings,
      })
      .returning();

    return c.json(newItem[0]);
  }
);

// update existing config item
configItemRoutes.patch(
  '/projects/:projectId/config-items/:configItemKey',
  projectIdMiddleware,
  zValidator('json', configItemUpdateSchema),
  async (c) => {
    const body = c.req.valid('json');
    const db = c.var.db;

    const updatedItem = await db
      .update(configItemsTable)
      .set({
        key: body.key,
        itemType: body.itemType,
        settings: body.itemType === 'llm' ? body.llmSettings : body.settings,
        ...(body.value && { value: body.value }),
      })
      .returning();

    return c.json(updatedItem);
  }
);

// delete config item
configItemRoutes.delete(
  '/projects/:projectId/config-items/:configItemKey',
  projectIdMiddleware,
  async (c) => {
    const db = c.var.db;
    const configItemKey = c.req.param('configItemKey');

    await db.delete(configItemsTable).where(eq(configItemsTable.key, configItemKey));

    return c.json({ message: 'Config item deleted' });
  }
);
