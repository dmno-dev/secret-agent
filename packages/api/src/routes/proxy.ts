import { Hono } from "hono";

export const proxyRoutes = new Hono();

proxyRoutes.all('/proxy', async (c) => {
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
  
  if (headersJsonStr.includes('{{LLM_API_KEY}}'))
  headersJsonStr = headersJsonStr.replace('{{LLM_API_KEY}}', DMNO_CONFIG.MASTER_OPENAI_API_KEY);

  const headersJson = JSON.parse(headersJsonStr);
  delete headersJson['sa-original-url'];
  delete headersJson['sa-original-method'];
  delete headersJson['host'];
  delete headersJson['cf-connecting-ip'];
  
  const reqBodyStr = await c.req.text();
  console.log(reqBodyStr);
  
  // example showing changing the model in the proxy
  const reqBodyObj = JSON.parse(reqBodyStr);
  reqBodyObj.model = 'gpt-4o-mini';
  const updatedReqBodyStr = JSON.stringify(reqBodyObj);
  
  
  // TODO: do we want to substitution in request body too?
  // note - if we mess with the body, we'll have to adjust content-length header

  // TODO: do we want to do any substitution in URL?

  // make fetch call to original url
  const llmResult = await fetch(originalUrl, {
    method: originalMethod,
    headers: headersJson,
    body: updatedReqBodyStr,
  });

  const resBodyText = await llmResult.text();
  
  const resultContentType = llmResult.headers.get('content-type');
  if (resultContentType) c.header('content-type', resultContentType);
  
  // console.log('llm response', {
  //   statusCode: llmResult.status,
  //   contentType: resultContentType,
  // })

  return c.body(resBodyText, llmResult.status as any);
});