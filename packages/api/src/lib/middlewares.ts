import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { createFactory, createMiddleware } from 'hono/factory';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';

export type HonoEnv = {
  Bindings: {
    DB: D1Database;
  };
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
    const db = drizzle(c.env.DB, { schema });
    c.set('db', db);
    await next();
  });

  // auth middleware
  app.use(async (c, next) => {
    const authMessage = c.req.header('sa-admin-auth');
    if (!authMessage) return next();

    // this message must match the frontend
    // ideally we replace the flow with exchanging a message for a JWT cookie
    const verifiedAddress = await ethers.verifyMessage(
      'You are logging into SecretAgent.sh',
      authMessage
    );
    console.log('user authd', verifiedAddress);

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
