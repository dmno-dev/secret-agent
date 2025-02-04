import 'dmno/injector-standalone/edge-auto';

import { Hono } from 'hono'

const app = new Hono()

app.all('/api/proxy', async (c) => {
  
  const originalUrl = c.req.header('sa-original-url');
  const originalMethod = c.req.header('sa-original-method') || 'get';
  if (!originalUrl) {
    return c.json({ error: 'Missing required header `sa-original-url`'}, 400);
  }
  
  console.log('SA PROXY', originalMethod, originalUrl);

  // fill in our secrets
  const headers = c.req.header();
  console.log('headers', JSON.stringify(headers));
  let headersJsonStr = JSON.stringify(headers);
  
  // TODO: fetch list of keys to replace
  headersJsonStr = headersJsonStr.replace('{{OPENAI_API_KEY}}', DMNO_CONFIG.MASTER_OPENAI_API_KEY);

  const headersJson = JSON.parse(headersJsonStr);
  delete headersJson['sa-original-url'];
  delete headersJson['sa-original-method'];
  delete headersJson['host'];
  delete headersJson['cf-connecting-ip'];
  
  const reqBodyStr = await c.req.text(); 
  // TODO: do we want to substitution in request body too?
  // note - if we mess with the body, we'll have to adjust content-length header

  // TODO: do we want to do any substitution in URL?

  // make fetch call to original url
  const llmResult = await fetch(originalUrl, {
    method: originalMethod,
    headers: headersJson,
    body: reqBodyStr,
  });

  const resBodyText = await llmResult.text();
  
  const resultContentType = llmResult.headers.get('content-type');
  if (resultContentType) {
    c.header('content-type', resultContentType);
  }
  
  // console.log('llm response', {
  //   statusCode: llmResult.status,
  //   contentType: resultContentType,
  // })

  c.status(llmResult.status as any);

  return c.body(resBodyText);
});

export default app
