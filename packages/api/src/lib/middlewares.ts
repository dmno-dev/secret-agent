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
    if (!authMessage || !userId) return next();

    let verifiedAddress: string;
    // eslint-disable-next-line no-useless-catch
    try {
      // this message must match the frontend
      // ideally we replace the flow with exchanging a message for a JWT cookie
      const isVerified = await publicClient.verifyMessage({
        message: 'You are logging into SecretAgent.sh',
        signature: authMessage as `0x${string}`,
        address: userId as `0x${string}`,
      });
      console.log('user authd', isVerified);
    } catch (err) {
      throw err;
      // // coinbase smart wallet having some weird issues with the signed message, so this is temporary insecure workaround
      // if (c.req.header('sa-user-id')) {
      //   verifiedAddress = c.req.header('sa-user-id')!;
      //   console.log('faking auth', verifiedAddress);
      // } else {
      //   return next();
      // }
    }
    c.set('authUserId', userId);
    // fetch the user from the database
    const db = c.var.db;
    const authUser = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, userId),
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
          id: userId,
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
