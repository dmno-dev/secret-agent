
import { BatchInterceptor } from '@mswjs/interceptors'
import { ClientRequestInterceptor } from '@mswjs/interceptors/ClientRequest'
import { XMLHttpRequestInterceptor } from '@mswjs/interceptors/XMLHttpRequest'
import { WebSocketInterceptor } from '@mswjs/interceptors/WebSocket'


const interceptor = new BatchInterceptor({
  name: 'my-interceptor',
  interceptors: [
    new ClientRequestInterceptor(),
    // new XMLHttpRequestInterceptor(),
  ],
})

interceptor.on('request', async ({ request, requestId, controller }) => {
  console.log('intercepted http request!');
  
  console.log(request.method, request.url, request.body);
  const bodyJson = await request.clone().json();
  const bodyStr = JSON.stringify(bodyJson);
  if (bodyStr.includes('supersecretkey')) {
    // mswjs cannot change the body :(
    console.log('DETECTED SENSITIVE KEY!');
  }
});


const wsInterceptor = new WebSocketInterceptor();
wsInterceptor.on('connection', ({ client }) => {
  console.log(client.url)
})

// ~~~~~~~~~~~~~~~~~~~~~~~~ 

export function enableHttpInterceptor() {
  interceptor.apply()
  wsInterceptor.apply();
}
export function disableHttpInterceptor() {
  interceptor.dispose();
  wsInterceptor.dispose();
}