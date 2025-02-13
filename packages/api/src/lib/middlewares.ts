import { eq } from 'drizzle-orm';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
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

const SIGN_IN_MESSAGE = (address: string, nonce: string, timestamp: string, uri: string) =>
  `You are signing into SecretAgent.sh

By signing this message, you are proving ownership of the wallet address ${address}.

This signature will not trigger a blockchain transaction or cost any gas fees.

Nonce: ${nonce}
Issued At: ${timestamp}
Version: 1
Chain ID: ${baseSepolia.id}
URI: ${uri}`;

// Initialize Viem public client
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

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
    const timestamp = c.req.header('sa-auth-timestamp');
    const nonce = c.req.header('sa-auth-nonce');
    const uri = c.req.header('sa-auth-uri');

    if (!authMessage) return next();

    let verifiedAddress: string;
    try {
      // Standard signature verification with enhanced security
      if (!timestamp || !nonce || !uri || !userId) {
        throw new Error('Missing authentication parameters');
      }

      // Verify timestamp is within acceptable range (5 minutes)
      const messageTime = new Date(timestamp).getTime();
      const now = Date.now();
      if (Math.abs(now - messageTime) > 5 * 60 * 1000) {
        throw new Error('Signature timestamp expired');
      }

      const message = SIGN_IN_MESSAGE(userId, nonce, timestamp, uri);

      try {
        // Use Viem's verifyMessage which supports both EOA and smart contract wallets
        const isValid = await publicClient.verifyMessage({
          address: userId as `0x${string}`,
          message,
          signature: authMessage as `0x${string}`,
        });

        if (!isValid) {
          throw new Error('Signature verification failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown verification error';
        console.error('Verification error details:', error);
        throw new Error(`Signature verification failed: ${errorMessage}`);
      }

      verifiedAddress = userId;
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
