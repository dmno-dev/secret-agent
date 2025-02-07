import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Hono } from 'hono';

import { configItemsTable } from '../db/schema';
import { HonoEnv } from '../lib/middlewares';
import { projectIdMiddleware } from './project';
import { and, eq, InferSelectModel } from 'drizzle-orm';

export const configItemRoutes = new Hono<HonoEnv>();

const configItemUpdateSchema = z.object({
  key: z.string().trim().default('Default project'),
  itemType: z.enum(['llm', 'proxy', 'static']).default('llm'),
  // TODO: refine based on itemType
  value: z.string().optional(),
  llmSettings: z.object().optional(),
  proxySettings: z.object().optional(),
});

type ConfigItem = InferSelectModel<typeof configItemsTable>;

export function serializeConfigItem(configItem: ConfigItem) {
  return {
    key: configItem.key,
    itemType: configItem.itemType,
    createdAt: configItem.createdAt,
    ...(configItem.itemType === 'llm' && {
      llmSettings: configItem.settings,
    }),
    ...(configItem.itemType === 'proxy' && {
      proxySettings: configItem.settings,
    }),
    ...(['proxy', 'static'].includes(configItem.itemType) && {
      maskedValue: configItem.value?.slice(2) + '****' + configItem.value?.slice(-2),
    }),
  };
}

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
        ...(body.itemType !== 'llm' &&
          'value' in body && {
            value: body.value,
          }),
        settings:
          (body.itemType === 'llm' && body.llmSettings) ||
          (body.itemType === 'proxy' && body.proxySettings) ||
          undefined,
      })
      .returning();

    return c.json(serializeConfigItem(newItem[0]));
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
        // copied from POST above
        key: body.key,
        itemType: body.itemType,
        ...(body.itemType !== 'llm' &&
          'value' in body && {
            value: body.value,
          }),
        settings:
          (body.itemType === 'llm' && body.llmSettings) ||
          (body.itemType === 'proxy' && body.proxySettings) ||
          undefined,
      })
      .where(
        and(
          eq(configItemsTable.projectId, c.var.project.id),
          eq(configItemsTable.key, c.req.param('configItemKey'))
        )
      )
      .returning();

    return c.json(serializeConfigItem(updatedItem?.[0]));
  }
);

// delete config item
configItemRoutes.delete(
  '/projects/:projectId/config-items/:configItemKey',
  projectIdMiddleware,
  async (c) => {
    const db = c.var.db;
    const configItemKey = c.req.param('configItemKey');

    await db
      .delete(configItemsTable)
      .where(
        and(
          eq(configItemsTable.projectId, c.var.project.id),
          eq(configItemsTable.key, c.req.param('configItemKey'))
        )
      );

    return c.json({ success: true, message: 'Config item deleted' });
  }
);
