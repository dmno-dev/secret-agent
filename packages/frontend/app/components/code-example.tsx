export function CodeExample() {
  const code = `import secretagent

# Initialize SecretAgent
agent = secretagent.init('YOUR_PROXY_ENDPOINT')

# Make an API call through the proxy
response = agent.request('GET', 'https://api.example.com/data')

# SecretAgent handles authentication, key management,
# and usage tracking behind the scenes`;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">$ vim integration_example.py</h2>
      <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
        <code className="text-sm">{code}</code>
      </pre>
    </section>
  );
}
