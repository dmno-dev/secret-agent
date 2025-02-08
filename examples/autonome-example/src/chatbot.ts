import {
  AgentKit,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  CdpWalletProvider,
  erc20ActionProvider,
  pythActionProvider,
  walletActionProvider,
  wethActionProvider,
} from '@coinbase/agentkit';
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import SecretAgent from 'secretagent.sh';

// Required environment variables
const requiredEnvVars = [
  'NETWORK_ID',
  'CDP_API_KEY_NAME',
  'CDP_API_KEY_PRIVATE_KEY',
  'SECRETAGENT_PROJECT_ID',
  'CDP_WALLET_ID',
  'CDP_WALLET_SEED',
] as const;

// Check for required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
export async function initializeAgent() {
  console.log('Initializing agent...');
  try {
    // Initialize CDP Wallet Provider with environment variables
    const cdpConfig = {
      apiKeyName: process.env.CDP_API_KEY_NAME!,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!,
      cdpWalletData: JSON.stringify({
        walletId: process.env.CDP_WALLET_ID,
        seed: process.env.CDP_WALLET_SEED,
        networkId: process.env.NETWORK_ID,
      }),
      networkId: process.env.NETWORK_ID!,
    };
    const walletProvider = await CdpWalletProvider.configureWithWallet(cdpConfig);

    // Initialize SecretAgent after walletProvider is created
    await SecretAgent.init({
      projectId: process.env.SECRETAGENT_PROJECT_ID!,
      agentId: walletProvider.getAddress(),
      agentLabel: 'autonome example',
      signMessage: (msg) => walletProvider.signMessage(msg),
    });

    // Initialize LLM
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      apiKey: SecretAgent.config.LLM_API_KEY,
    });

    // Initialize AgentKit
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        cdpApiActionProvider({
          apiKeyName: cdpConfig.apiKeyName,
          apiKeyPrivateKey: cdpConfig.apiKeyPrivateKey,
        }),
        cdpWalletActionProvider({
          apiKeyName: cdpConfig.apiKeyName,
          apiKeyPrivateKey: cdpConfig.apiKeyPrivateKey,
        }),
      ],
    });

    const tools = await getLangChainTools(agentkit);

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: 'CDP AgentKit Example!' } };

    // Create React Agent using the LLM and CDP AgentKit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
        faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
        funds from the user. Before executing your first action, get the wallet details to see what network 
        you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
        asks you to do something you can't do with your currently available tools, you must say so, and 
        encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
        docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
        restating your tools' descriptions unless it is explicitly requested.
        `,
    });

    return { agent, config: agentConfig };
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    throw error; // Re-throw to be handled by caller
  }
}
