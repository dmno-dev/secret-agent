import { CodeBlock } from './code-block';

export function CodeExample() {
  const code = `import SecretAgent from 'secretagent.sh';
import OpenAI from 'openai';

// create your wallet / walletProvider however you normally would
// your wallet is used to authenticate with the SecretAgent api
// so secrets needed are still be owned by the agent / hosting platform
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);

// Initialize SecretAgent (global singleton)
await SecretAgent.init({
  projectId: '0x123abc...', // project ID from dashboard - also the central project wallet address
  agentLabel: 'chatbot assistant v2', // will be visible in dashboard
  agentId: wallet.address,
  signMessage: (msg) => wallet.signMessage(msg),
});

// \`SecretAgent.config\` helper to get placeholder API keys that will be replaced by the proxy
const client = new OpenAI({ apiKey: SecretAgent.config.LLM_API_KEY });

// ... rest of your agent code ...
`;

  return (
    <section className="mb-12">
      <h2 className="">vim integration_example.ts</h2>
      <CodeBlock code={code} language="typescript" />
    </section>
  );
}
