import 'dmno/injector-standalone/edge-auto';
import { Hono } from 'hono';

import { CloudflareEnvBindings, HonoEnv, initCommonMiddlewares } from './lib/middlewares';
import { agentLibRoutes } from './routes/agent-lib';
import { agentRoutes } from './routes/agents';
import { authRoutes } from './routes/auth';
import { projectRoutes } from './routes/project';
import { configItemRoutes } from './routes/config-items';
import { runNightlyBillingCron } from './cron/billing';
import { UTCDate } from '@date-fns/utc';

const app = new Hono<HonoEnv>().basePath('/api');

initCommonMiddlewares(app);

app.get('/', async (c) => {
  return c.json({ apiStatus: 'ok' });
});

app.route('/', authRoutes);
app.route('/', agentLibRoutes);
app.route('/', projectRoutes);
app.route('/', configItemRoutes);
app.route('/', agentRoutes);

export default {
  fetch: app.fetch,
  async scheduled(
    event: ScheduledEvent,
    env: CloudflareEnvBindings,
    ctx: EventContext<CloudflareEnvBindings, any, any>
  ) {
    console.log(event, env, ctx);
    ctx.waitUntil(runNightlyBillingCron(new UTCDate(event.scheduledTime), env));
  },
};
