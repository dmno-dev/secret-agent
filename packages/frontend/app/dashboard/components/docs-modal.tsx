'use client';

import { X } from 'lucide-react';
import { CodeBlock } from '../../components/code-block';
import { useState } from 'react';

interface DocsModalProps {
  onClose: () => void;
  initialTab?: 'quickstart' | 'llm' | 'proxy' | 'static';
}

export function DocsModal({ onClose, initialTab = 'quickstart' }: DocsModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const quickstartCode = `import SecretAgent from 'secretagent.sh';
import OpenAI from 'openai';

// Create your wallet / walletProvider however you normally would
// Your wallet is used to authenticate with the SecretAgent API
// Secrets needed are still owned by the agent / hosting platform
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);

// Initialize SecretAgent (global singleton)
await SecretAgent.init({
  projectId: '0x123abc...', // project ID from dashboard - also the central project wallet address
  agentLabel: 'chatbot assistant v2', // will be visible in dashboard
  agentId: wallet.address,
  signMessage: (msg) => wallet.signMessage(msg),
});

const client = new OpenAI({ apiKey: SecretAgent.config.LLM_API_KEY });`;

  const llmCode1 = `import { ChatOpenAI } from '@langchain/openai';
const llm = new ChatOpenAI({ apiKey: SecretAgent.config.LLM_API_KEY });`;

  const llmCode2 = `import OpenAI from 'openai';
const client = new OpenAI({ apiKey: SecretAgent.config.LLM_API_KEY });`;

  const proxyCode1 = `import { CoolApi } from 'cool-api-sdk'
const coolApiClient = new CoolApi({
  apiKeyId: SecretAgent.config.COOL_API_KEY_ID,
  apiKeySecret: SecretAgent.config.COOL_API_KEY_SECRET,
})`;

  const proxyCode2 = `// LangChain SDKs detect this key being present in env and enable tracing
process.env.LANGSMITH_API_KEY = SecretAgent.config.LANGSMITH_API_KEY;`;

  const staticCode = `if (SecretAgent.config.FEATURE_FLAG_1 === '1') {
  // do something...
}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-green-400">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold dark:text-green-400">SecretAgent Documentation</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-green-400" />
            </button>
          </div>

          <div className="flex space-x-1 px-4">
            {['quickstart', 'llm', 'proxy', 'static'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors
                  ${
                    activeTab === tab
                      ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-green-400 border-t border-x border-gray-200 dark:border-green-400 border-b-0'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-green-300'
                  }`}
              >
                {tab === 'llm' ? 'LLM' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'quickstart' && (
            <>
              <section>
                <h3 className="text-xl font-semibold mb-3 dark:text-green-400">Getting Started</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  After creating a project, adding a secret and giving access to an agent, you can
                  add the following to your AgentKit/LangChain code:
                </p>
                <CodeBlock code={quickstartCode} language="typescript" />
              </section>
            </>
          )}

          {activeTab === 'llm' && (
            <>
              <section>
                <h3 className="text-xl font-semibold mb-3 dark:text-green-400">
                  Pay-as-you-go LLM Keys
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Instead of using your own OpenAI/etc API keys, you can use our keys and
                  pay-as-you-go. Use SecretAgent.config to get your LLM key placeholder and connect
                  as you normally would.
                </p>
                <h4 className="text-lg font-semibold mb-2 dark:text-green-400">
                  LangChain Example
                </h4>
                <CodeBlock code={llmCode1} language="typescript" />
                <h4 className="text-lg font-semibold mb-2 mt-4 dark:text-green-400">
                  OpenAI SDK Example
                </h4>
                <CodeBlock code={llmCode2} language="typescript" />
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Note: Our shared LLM type keys automatically proxy any calls to api.openai.com,
                    but allow you to switch providers and modify other settings like temperature and
                    model on the fly without redeploying your agents.
                  </p>
                </div>
              </section>
            </>
          )}

          {activeTab === 'proxy' && (
            <>
              <section>
                <h3 className="text-xl font-semibold mb-3 dark:text-green-400">
                  Bring-your-own API Keys
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Use your own API keys (for any APIs, not just LLMs) but insert them by proxy.
                  Create config items in the dashboard and set the domain matching rules
                  appropriately.
                </p>
                <h4 className="text-lg font-semibold mb-2 dark:text-green-400">Generic Example</h4>
                <CodeBlock code={proxyCode1} language="typescript" />
                <h4 className="text-lg font-semibold mb-2 mt-4 dark:text-green-400">
                  Langsmith Example
                </h4>
                <CodeBlock code={proxyCode2} language="typescript" />
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Keys are inserted by proxy, so agents never have direct access. This enables
                    instant key rotation and revocation when needed.
                  </p>
                </div>
              </section>
            </>
          )}

          {activeTab === 'static' && (
            <>
              <section>
                <h3 className="text-xl font-semibold mb-3 dark:text-green-400">Static Config</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Static config is fetchable by the agent rather than inserted by proxy. This is
                  useful for non-sensitive config that affects agent behavior or sensitive keys that
                  must be used for additional computation within agent code.
                </p>
                <CodeBlock code={staticCode} language="typescript" />
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Warning: Static items must be used after SecretAgent.init(). After init
                    completes, the library will throw an error if any static items were already
                    accessed.
                  </p>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
