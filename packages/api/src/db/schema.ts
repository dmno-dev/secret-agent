import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(), // users wallet address
  email: text('email'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const projectsTable = sqliteTable('projects', {
  id: text('id').primaryKey(), // server wallet address
  privyServerWalletId: text('privy_server_wallet_id').notNull(),
  name: text('name').notNull(),
  ownedByUserId: text('owned_by_user_id')
    .notNull()
    .references(() => usersTable.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const configItemsTable = sqliteTable(
  'config_items',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projectsTable.id),
    key: text('key').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    itemType: text({ enum: ['llm', 'proxy', 'static'] }).notNull(),
    value: text(), // only for user-defined keys, will store encrypted
    settings: text({ mode: 'json' }), // .$type<{ foo: string }>(),
  },
  (table) => [
    // compound primary key
    primaryKey({ columns: [table.projectId, table.key] }),
  ]
);

export const projectAgentsTable = sqliteTable(
  'project_agents',
  {
    id: text('id'), // agent wallet address
    projectId: text('project_id')
      .notNull()
      .references(() => projectsTable.id),
    label: text('label'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    status: text('status', { enum: ['pending', 'enabled', 'paused', 'disabled'] })
      .notNull()
      .default('pending'),
  },
  (table) => [
    // compound primary key
    primaryKey({ columns: [table.projectId, table.id] }),
  ]
);
