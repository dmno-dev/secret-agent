'use client';

import { X } from 'lucide-react';
import { CodeBlock } from '../../components/code-block';
import { useState } from 'react';

interface DocsModalProps {
  onClose: () => void;
  initialTab?: 'quickstart' | 'secret-types' | 'advanced';
}

export function DocsModal({ onClose, initialTab = 'quickstart' }: DocsModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const exampleCode = `// ...rest of imports
import SecretAgent from 'secretagent.sh';

// Initialize the client
await SecretAgent.init({
  projectId: 'INSERT_PROJECT_ID', // from dashboard
  agentId: 'INSERT_WALLET_ADDRESS', // wallet agent will use this address to sign messages
  agentLabel: 'INSERT_AGENT_LABEL', // human-readable label for the agent
  signMessage: (msg) => walletProvider.signMessage(msg), // sign messages with the wallet provider
});

// Initialize LLM
const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  apiKey: SecretAgent.config.LLM_API_KEY, // will be replaced/injected in proxy
});

// .. rest of agent code`;

  const secretTypesCode = `import { SecretAgent } from 'secretagent';
  
// LLM KEY - will be replaced/injected in proxy
const LLM_API_KEY = SecretAgent.config.LLM_API_KEY;

// PROXY KEY - will be replaced/injected in proxy, 
// based on the domain match rules of the request
const PROXY_API_KEY = SecretAgent.config.PROXY_API_KEY;

// STATS KEY - will fetch the actual value
const STATS_API_KEY = SecretAgent.config.STATS_API_KEY; 
  `;

  const advancedCode = `// Custom Request Configuration
// TODO: add examples
`;

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
            {['quickstart', 'secret-types', 'advanced'].map((tab) => (
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
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
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
                <CodeBlock code={exampleCode} language="typescript" />
              </section>
            </>
          )}

          {activeTab === 'secret-types' && (
            <>
              <section>
                <h3 className="text-xl font-semibold mb-3 dark:text-green-400">
                  Available Secret Types
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  SecretAgent supports different types of secrets, each with its own configuration
                  options and security features.
                </p>
                <CodeBlock code={secretTypesCode} language="typescript" />
              </section>
            </>
          )}

          {activeTab === 'advanced' && (
            <>
              <section>
                <h3 className="text-xl font-semibold mb-3 dark:text-green-400">
                  Advanced Configuration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Fine-tune your SecretAgent implementation with advanced configuration options and
                  features.
                </p>
                <CodeBlock code={advancedCode} language="typescript" />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
