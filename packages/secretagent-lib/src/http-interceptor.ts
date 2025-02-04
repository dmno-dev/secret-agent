import http from 'node:http'
import https from 'node:https'

import { normalizeClientRequestArgs } from './lib/msw-utils';

export function enableHttpInterceptor() {
  const { get: originalGet, request: originalRequest } = http;
  const { get: originalHttpsGet, request: originalHttpsRequest } = https;

  (https as any)._originalHttpsRequest = originalHttpsRequest;
  // @ts-ignore
  https.request = function patchedHttpsRequest (...args: Parameters<typeof https.request>) {
    const [url, options, callback] = normalizeClientRequestArgs(
      'https:',
      args
    );

    if (url.href.startsWith('https://api.openai.com')) {
      
      // delete url related config from options
      delete options.host;
      delete options.hostname;
      delete options.port;
      delete options.path;

      const headers = options.headers || {};
      // pass along original request URL and method as headers
      headers['sa-original-url'] = url.href
      headers['sa-original-method'] = options.method;

      return originalHttpsRequest(
        // call our proxy url instead
        'https://localhost:8787/api/proxy', {
          ...options,
          headers,
          rejectUnauthorized: false,
          method: 'POST',
        }
      );
    }

    console.log('Patched https.request', url, options);
    // TODO: check headers?

    const req = originalHttpsRequest(...args);
    const originalReqWrite = req.write;
    const originalReqEnd = req.end;
    req.write = function patchedReqWrite (...writeArgs) {
      const chunk = writeArgs[0];
      const isBuffer = chunk instanceof Buffer;
      let chunkStr = chunk.toString();
      chunkStr = chunkStr.replaceAll('san francisco', 'montreal     ');

      if (chunkStr.includes('supersecretkey')) {
        console.log('FOUND SECRET IN REQUEST BODY!');
        chunkStr = chunkStr.replaceAll('supersecretkey', '**REDACTED****')
        // console.log('scrubbed: ', chunkStr);
      }
      
      return originalReqWrite.call(
        req, 
        isBuffer ? Buffer.from(chunkStr) : chunkStr,
        ...writeArgs.slice(1),
      );
    }
    req.end = function patchedReqEnd(...writeArgs) {
      // TODO: scrub -- usually end is just empty, although it can have data
      console.log('> patched end', writeArgs);
      return originalReqEnd.call(req, ...writeArgs);
    }
    //   const chunk = writeArgs[0];
    //   const isBuffer = chunk instanceof Buffer;
    //   const chunkStr = chunk.toString();
    //   if (chunkStr.includes('supersecretkey')) {
    //     console.log('FOUND SECRET IN REQUEST BODY!');
    //     chunkStr.replaceAll('supersecretkey', '**REDACTED**')
    //   }
    //   writeArgs[0] = isBuffer ? Buffer.from(chunkStr) : chunkStr;
      
    //   return originalReqWrite.apply(req, writeArgs as any);
    // }
    // TODO: patch req.end
    return req;
  }


  // TODO: patch http.request, and maybe https.get/http.get
}
function disableHttpInterceptor() {
  https.request = (https as any)._originalHttpsRequest;
}


