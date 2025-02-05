import { defineConfig } from 'drizzle-kit';

// Use better-sqlite driver for local development
export default defineConfig(
  process.env.LOCAL_DB_PATH
  // local config
  ? ({
      schema: "./src/db/schema.ts",
      dialect: "sqlite",
      dbCredentials: {
        url: process.env.LOCAL_DB_PATH
      },
    })
  // remote D1
  : ({
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dialect: "sqlite",
      driver: "d1-http",

      // https://github.com/drizzle-team/drizzle-kit-mirror/releases/tag/v0.21.3
      // creating token https://dash.cloudflare.com/profile/api-tokens
      dbCredentials: {
        databaseId: '6ff1340d-7dfc-426b-9b34-83496245b72e', // TODO: pull from wrangler.json
        token: process.env.CLOUDFLARE_API_TOKEN,
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      },
    })
);