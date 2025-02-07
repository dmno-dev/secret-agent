import path from 'node:path';
import fs from 'node:fs';
import { defineConfig } from 'drizzle-kit';

function getLocalD1DB() {
  try {
    const basePath = path.resolve('.wrangler');
    const dbFile = fs
      .readdirSync(basePath, { encoding: 'utf-8', recursive: true })
      .find((f) => f.endsWith('.sqlite'));

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);
    return url;
  } catch (err) {
    console.log(`Error finding local D1 db - ${err.message}`);
  }
}

// Use better-sqlite driver for local development
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  ...(process.env.SECRETAGENT_ENV === 'production'
    ? {
        driver: 'd1-http',
        dbCredentials: {
          databaseId: '6ff1340d-7dfc-426b-9b34-83496245b72e', // TODO: pull from wrangler.json
          token: process.env.CLOUDFLARE_API_TOKEN,
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
        },
      }
    : {
        dbCredentials: {
          url: getLocalD1DB(),
        },
      }),
});
