import 'dmno/auto-inject-globals';

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
import { HumanMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import * as fs from 'fs';
import * as readline from 'readline';
import SecretAgent from 'secretagent.sh';

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = '../wallet_data.txt';

process.env.LANGCHAIN_TRACING_V2 = 'true';
process.env.LANGSMITH_TRACING = 'true';
process.env.LANGSMITH_API_KEY = SecretAgent.config.LANGSMITH_API_KEY;

/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
export async function initializeAgent() {
  console.log('Initializing agent with config:', SecretAgent.config);
  try {
    // Initialize LLM
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      apiKey: SecretAgent.config.LLM_API_KEY, // will be replaced/injected in proxy
    });

    let walletDataStr: string | null = null;

    // Read existing wallet data if available
    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, 'utf8');
      } catch (error) {
        console.error('Error reading wallet data:', error);
        // Continue without wallet data
      }
    }

    // Initialize CDP Wallet Provider
    const cdpConfig = {
      apiKeyName: DMNO_CONFIG.CDP_API_KEY_NAME,
      apiKeyPrivateKey: DMNO_CONFIG.CDP_API_KEY_PRIVATE_KEY,
      cdpWalletData: walletDataStr || undefined,
      networkId: DMNO_CONFIG.NETWORK_ID,
    };
    const walletProvider = await CdpWalletProvider.configureWithWallet(cdpConfig);
    // Initialize the wallet - which creates a new wallet if wallet data was empty
    const exportedWallet = await walletProvider.exportWallet();
    // Write wallet data to file so it remains between restarts
    fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));

    // Initialize SecretAgent
    await SecretAgent.init({
      projectId: DMNO_CONFIG.SECRETAGENT_PROJECT_ID,
      agentId: walletProvider.getAddress(),
      agentLabel: 'cdp agentkit example',
      signMessage: (msg) => walletProvider.signMessage(msg),
    });

    console.log('static config fetched from SecretAgent', SecretAgent.config.STATIC_TEST);

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

    // Add SecretAgent tools
    const allTools = [...tools, ...SecretAgent.getLangchainTools()];

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: 'CDP AgentKit Chatbot Example!' } };

    // Create React Agent using the LLM and combined tools
    const agent = createReactAgent({
      llm,
      tools: allTools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
        empowered to interact onchain using your tools. You can check the project's balance using the project_balance tool.
        If you ever need funds, you can request them from the faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
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

/**
 * Run the agent autonomously with specified intervals
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 * @param interval - Time interval between actions in seconds
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runAutonomousMode(agent: any, config: any, interval = 10) {
  console.log('Starting autonomous mode...');

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const thought = `
Be creative and do something interesting on the blockchain.
Choose an action or set of actions and execute it that highlights your abilities.
`;

      const stream = await agent.stream({ messages: [new HumanMessage(thought)] }, config);

      for await (const chunk of stream) {
        if ('agent' in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ('tools' in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log('-------------------');
      }

      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      }
      process.exit(1);
    }
  }
}

/**
 * Run the agent interactively based on user input
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const userInput = await question('\nPrompt: ');

      if (userInput.toLowerCase() === 'exit') {
        break;
      }

      const stream = await agent.stream({ messages: [new HumanMessage(userInput)] }, config);

      for await (const chunk of stream) {
        if ('agent' in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ('tools' in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log('-------------------');
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Choose whether to run in autonomous or chat mode based on user input
 *
 * @returns Selected mode
 */
async function chooseMode(): Promise<'chat' | 'auto'> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.log('\nAvailable modes:');
    console.log('1. chat    - Interactive chat mode');
    console.log('2. auto    - Autonomous action mode');

    const choice = (await question('\nChoose a mode (enter number or name): '))
      .toLowerCase()
      .trim();

    if (choice === '1' || choice === 'chat') {
      rl.close();
      return 'chat';
    } else if (choice === '2' || choice === 'auto') {
      rl.close();
      return 'auto';
    }
    console.log('Invalid choice. Please try again.');
  }
}

/**
 * Start the chatbot agent
 */
async function main() {
  try {
    const { agent, config } = await initializeAgent();
    // const mode = await chooseMode();
    const mode = 'chat';

    if (mode === 'chat') {
      await runChatMode(agent, config);
    } else {
      await runAutonomousMode(agent, config);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

await main();
