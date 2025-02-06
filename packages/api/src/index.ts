import 'dmno/injector-standalone/edge-auto';
import { Hono } from 'hono';

import { HonoEnv, initCommonMiddlewares } from './lib/middlewares';
import { agentLibRoutes } from './routes/agent-lib';
import { agentRoutes } from './routes/agents';
import { authRoutes } from './routes/auth';
import { configItemRoutes } from './routes/config-items';
import { projectRoutes } from './routes/project';

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

export default app;
