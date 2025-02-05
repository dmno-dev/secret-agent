import 'dmno/injector-standalone/edge-auto';

import { Hono } from 'hono'
import { authRoutes } from './routes/auth';
import { proxyRoutes } from './routes/proxy';
import { projectRoutes } from './routes/project';

const app = new Hono().basePath('/api');

app.get('/status', async (c) => {
  return c.json({ status: 'ok' });
});

app.route('/', authRoutes);
app.route('/', proxyRoutes);
app.route('/', projectRoutes);

export default app
