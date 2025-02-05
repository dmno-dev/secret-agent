import { ethers } from "ethers";
import { Hono } from "hono";
import { MOCKED_PROJECT_DATA } from "../lib/project-data";

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
