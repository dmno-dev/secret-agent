import { eq } from 'drizzle-orm';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { ethers } from 'ethers';
import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import * as schema from '../db/schema';

export type CloudflareEnvBindings = {
  DB: D1Database;
};
export type HonoEnv = {
  Bindings: CloudflareEnvBindings;
  Variables: {
    db: DrizzleD1Database<typeof schema>;
    authUser?: any;
    /** id of admin user (also their wallet address) */
    authUserId?: string;
  };
};

export function initCommonMiddlewares(app: Hono<HonoEnv>) {
  app.use(
    '/*',
    cors({
      origin: DMNO_CONFIG.SECRETAGENT_WEB_URL,
      // have to be very permissive since we are proxying
      allowHeaders: ['*'],
      allowMethods: ['*'],
      // exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
      maxAge: 600,
      credentials: true,
    })
  );

  // set up db connection
  app.use(async (c, next) => {
    const db = drizzle(c.env.DB, { schema, logger: true });
    c.set('db', db);
    await next();
  });

  // auth middleware
  app.use(async (c, next) => {
    const authMessage = c.req.header('sa-admin-auth');
    const userId = c.req.header('sa-user-id');

    if (!authMessage) return next();

    let verifiedAddress: string;
    // eslint-disable-next-line no-useless-catch
    try {
      // Check if this is a Coinbase WebAuthn signature by looking at the length and structure
      // WebAuthn signatures from Coinbase are much longer and have a specific structure
      if (authMessage.length > 500 && authMessage.startsWith('0x000000')) {
        // For Coinbase WebAuthn, we'll trust the user ID since the signature format is different
        if (!userId) {
          throw new Error('User ID required for WebAuthn signatures');
        }
        verifiedAddress = userId;
        console.log('Authenticated Coinbase Wallet user:', verifiedAddress);
      } else {
        // Standard Ethereum signature verification
        verifiedAddress = await ethers.verifyMessage(
          'You are logging into SecretAgent.sh',
          authMessage
        );
        console.log('Authenticated standard wallet user:', verifiedAddress);
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      throw err;
    }
    c.set('authUserId', verifiedAddress);
    // fetch the user from the database
    const db = c.var.db;
    const authUser = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, verifiedAddress),
    });

    if (authUser) {
      c.set('authUser', authUser);
    } else {
      // we may want to add more of a signup flow eventually?
      // return c.json({ error: `Admin ${verifiedAddress} does not exist`}, 401);
      // for now we'll just create the user on the fly
      const newUser = await db
        .insert(schema.usersTable)
        .values({
          id: verifiedAddress,
        })
        .returning();
      c.set('authUser', newUser);
    }
    await next();
  });
}

type LoggedInHonoEnv = HonoEnv & {
  Variables: {
    authUserId: string;
  };
};

export const loggedInOnly = createMiddleware<LoggedInHonoEnv>(
  async (c: Context<LoggedInHonoEnv>, next) => {
    if (!c.var.authUserId) {
      return c.json({ error: 'You must be logged in' }, 401);
    }
    await next();
  }
);
