import { CodeBlock } from './code-block';

export function CodeExample() {
  const code = `import { SecretAgent } from 'secretagent';

// Initialize SecretAgent
const agent = SecretAgent.init('YOUR_PROXY_ENDPOINT');

// Make an API call through the proxy
const response = await agent.request<Response>('GET', 'https://api.example.com/data');

// SecretAgent handles authentication, key management,
// and usage tracking behind the scenes`;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 font-mono">$ vim integration_example.ts</h2>
      <CodeBlock code={code} language="typescript" />
    </section>
  );
}
