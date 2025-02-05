import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";


export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // users wallet address
  email: text("email"),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(), // server wallet address
  name: text("name").notNull(),
  ownedByUserId: text("owned_by_user_id").notNull().references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const projectKeys = sqliteTable("project_keys", {
  projectId: text("project_id").notNull().references(() => projects.id),
  key: text('key').notNull(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  keyType: text({ enum: ['llm', 'user'] }).notNull(),
  value: text(), // only for user-defined keys, will store encrypted
  settings: text({ mode: 'json' }).$type<{ foo: string }>()
}, (table) => [
  // compound primary key
  primaryKey({ columns: [table.projectId, table.key] }),
]);


export const projectAgents = sqliteTable("project_agents", {
  id: text("id"), // agent wallet address
  projectId: text("project_id").notNull().references(() => projects.id),
  label: text("label"),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
}, (table) => [
  // compound primary key
  primaryKey({ columns: [table.projectId, table.id] }),
]);
