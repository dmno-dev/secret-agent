import { ethers } from "ethers";
import { Hono } from "hono";
import { MOCKED_PROJECT_DATA } from "../lib/project-data";
import { createServerWallet } from "../lib/privy";

export const projectRoutes = new Hono();

projectRoutes.get('/project-config', async (c) => {

  const proxyDomains: Array<string> = ['api.openai.com'];

  // const domains = 
  for (const itemKey in MOCKED_PROJECT_DATA.configItems) {
    const configItem = MOCKED_PROJECT_DATA.configItems[itemKey];
    proxyDomains.push(...configItem.urlPatterns);
    
  }

  return c.json({
    contactEmail: MOCKED_PROJECT_DATA.contactEmail,
    proxyDomains,
  })

  return c.json(MOCKED_PROJECT_DATA);
})

// create project endpoint
projectRoutes.post('/projects', async (c) => {
  const serverWalletInfo = await createServerWallet();

  return c.json({
    name: 'Super cool project',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  });
});

projectRoutes.get('/projects', async (c) => {
  const serverWalletInfo = await createServerWallet();

  return c.json({
    name: 'Super cool project',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  });
});

projectRoutes.get('/projects/:projectId', async (c) => {
  const projectId = c.req.param('projectId');

  const serverWalletInfo = await createServerWallet();

  return c.json({
    name: 'Super cool project',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  });
});

projectRoutes.patch('/projects/:projectId', async (c) => {
  const projectId = c.req.param('projectId');

  const serverWalletInfo = await createServerWallet();

  return c.json({
    name: 'Super cool project',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  });
});