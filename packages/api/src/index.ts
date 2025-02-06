import 'dmno/injector-standalone/edge-auto';
import { Hono } from 'hono'

import { HonoEnv, initCommonMiddlewares } from './lib/middlewares';
import { authRoutes } from './routes/auth';
import { agentLibRoutes } from './routes/agent-lib';
import { projectRoutes } from './routes/project';
import { configItemRoutes } from './routes/config-items';
import { agentRoutes } from './routes/agents';

const app = new Hono<HonoEnv>();

initCommonMiddlewares(app);

app.get('/', async (c) => {
  return c.json({ apiStatus: 'ok' });
});
app.route('/', authRoutes);
app.route('/', agentLibRoutes);
app.route('/', projectRoutes);
app.route('/', configItemRoutes);
app.route('/', agentRoutes);

export default app
