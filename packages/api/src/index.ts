import 'dmno/injector-standalone/edge-auto';
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { Environment } from "./bindings";
import { authRoutes } from './routes/auth';
import { proxyRoutes } from './routes/proxy';
import { projectRoutes } from './routes/project';
import { initDbConnect } from './db';
import { users } from './db/schema';

const app = new Hono<Environment>();

app.use('/*', cors({
  origin: DMNO_CONFIG.SECRETAGENT_WEB_URL,
  // have to be very permissive since we are proxying 
  allowHeaders: ['*'],
  allowMethods: ['*'],
  // exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}))

app.get('/', async (c) => {
  return c.json({ apiStatus: 'ok' });
});


app.get('/add-user', async (c) => {
  const db = initDbConnect(c.env.DB);
  const newUser = await db.insert(users).values({
    id: '0x7f448FA8cc5db07E8e4eF382B6453b91Bd9B05a6',
    email: 'theo@dmno.dev',
  })
  console.log(newUser);
  return c.json({ ok: true })
});

app.get('/users', async (c) => {
  const db = initDbConnect(c.env.DB);
  const allUsers = await db.select().from(users).all();
  console.log(allUsers);

  return c.text("Hello Hono!");
});

app.route('/', authRoutes);
app.route('/', proxyRoutes);
app.route('/', projectRoutes);

export default app
