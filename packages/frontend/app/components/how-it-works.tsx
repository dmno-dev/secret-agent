export function HowItWorks() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 font-mono">
        $ cat how_it_works.txt
      </h2>
      <ol className="list-decimal list-inside space-y-2 text-gray-400">
        <li>Sign up for AgentSecrets and obtain your proxy endpoint</li>
        <li>
          Replace your direct API calls with calls to the AgentSecrets proxy
        </li>
        <li>
          Configure access controls, budgets, and monitoring in the dashboard
        </li>
        <li>
          Deploy your agents with confidence, knowing your keys are secure
        </li>
        <li>Monitor usage, rotate keys, and manage access in real-time</li>
      </ol>
    </section>
  );
}
