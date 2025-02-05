import { Hono } from "hono";

export const proxyRoutes = new Hono();

proxyRoutes.all('/proxy', async (c) => {
  const originalUrl = c.req.header('sa-original-url');
  const originalMethod = c.req.header('sa-original-method')?.toLowerCase() || 'get';
  if (!originalUrl) {
    return c.json({ error: 'Missing required header `sa-original-url`'}, 400);
  }
  
  console.log('SA PROXY', originalMethod, originalUrl);

  // fill in our secrets
  const headers = c.req.header();
  let headersJsonStr = JSON.stringify(headers);
  
  // TODO fetch project settings and replace keys accordingly
  // should first check if url matches pattern and replace relevant keys only
  headersJsonStr = headersJsonStr.replace('{{LLM_API_KEY}}', DMNO_CONFIG.MASTER_OPENAI_API_KEY);
  headersJsonStr = headersJsonStr.replace('{{LANGSMITH_API_KEY}}', DMNO_CONFIG.MASTER_LANGSMITH_API_KEY);

  const headersJson = JSON.parse(headersJsonStr);
  delete headersJson['sa-original-url'];
  delete headersJson['sa-original-method'];
  delete headersJson['host'];
  delete headersJson['cf-connecting-ip'];
  
  let bodyToSend: string | Blob | undefined;
  if (headersJson['content-type'] === 'application/json') {
    // example showing changing the model in the proxy
    let reqBodyObj = await c.req.json();
    if (reqBodyObj.model) {
      reqBodyObj.model = 'gpt-4o-mini';
    }
    bodyToSend = JSON.stringify(reqBodyObj);  
  } else if (originalMethod !== 'get' && originalMethod !== 'head') {
    bodyToSend = await c.req.blob();
  }
  
  // TODO: do we want to substitution in request body too?
  // note - if we mess with the body, we'll have to adjust content-length header

  // TODO: do we want to do any substitution in URL?

  // make fetch call to original url
  const llmResult = await fetch(originalUrl, {
    method: originalMethod,
    headers: headersJson,
    ...bodyToSend && { body: bodyToSend },
  });

  const resBodyText = await llmResult.text();
  
  const resultContentType = llmResult.headers.get('content-type');
  if (resultContentType) c.header('content-type', resultContentType);
  
  // console.log('llm response', {
  //   statusCode: llmResult.status,
  //   contentType: resultContentType,
  // })


  if (llmResult.status !== 200) {
    console.log('Error!', resBodyText);
  }

  return c.body(resBodyText, llmResult.status as any);
});