import { InferSelectModel, sql } from 'drizzle-orm';
import { text, integer, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: text().primaryKey(), // users wallet address
  email: text(),
  createdAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const projectsTable = sqliteTable('projects', {
  id: text().primaryKey(), // server wallet address
  privyServerWalletId: text('privy_server_wallet_id').notNull(),
  name: text().notNull(),
  ownedByUserId: text()
    .notNull()
    .references(() => usersTable.id),
  createdAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const configItemsTable = sqliteTable(
  'config_items',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projectsTable.id),
    key: text().notNull(),
    createdAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    itemType: text({ enum: ['llm', 'proxy', 'static'] }).notNull(),
    value: text(), // only for user-defined keys, will store encrypted
    settings: text({ mode: 'json' }).$type<any>(),
  },
  (table) => [
    // compound primary key
    primaryKey({ columns: [table.projectId, table.key] }),
  ]
);

export const projectAgentsTable = sqliteTable(
  'project_agents',
  {
    id: text().notNull(), // agent wallet address
    projectId: text()
      .notNull()
      .references(() => projectsTable.id),
    label: text(),
    createdAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    lastConnectedAt: text(),
    status: text({ enum: ['pending', 'enabled', 'paused', 'disabled'] })
      .notNull()
      .default('pending'),
  },
  (table) => [
    // compound primary key
    primaryKey({ columns: [table.projectId, table.id] }),
  ]
);

export const requestsTable = sqliteTable('requests', {
  id: text().primaryKey(), // uuid as a primary key
  projectId: text()
    .notNull()
    .references(() => projectsTable.id),
  agentId: text().notNull(), // skip foreign key for now
  timestamp: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  requestDetails: text({ mode: 'json' }), // url, method, etc...
  responseDetails: text({ mode: 'json' }),
  requestType: text({ enum: ['init', 'llm', 'proxy'] }).notNull(),
  costDetails: text({ mode: 'json' }).$type<{ ethGwei: number; ethPriceCents: number }>(),
});

export type UserModel = InferSelectModel<typeof usersTable>;
export type ProjectModel = InferSelectModel<typeof projectsTable>;
export type ConfigItemModel = InferSelectModel<typeof configItemsTable>;
export type AgentModel = InferSelectModel<typeof projectAgentsTable>;
export type RequestModel = InferSelectModel<typeof requestsTable>;
