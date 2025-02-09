# SecretAgent.sh 🔐🕶️🤖 

**Pay-as-you-go LLM keys and secret management tools for AI agents - powered by [secretagent.sh](https://secretagent.sh)**

![SecretAgent.sh](/packages/frontend/assets/hero.jpg)

## Features

- Centralized secret management with integrated access logs
- Secrets inserted by proxy so agents never have direct access
- Agent authentication and payments powered by crypto wallets
- Support for managing a fleet of agents with shared config/secrets
- Central project wallet enables agent self-funding workflows
- Instant config changes without code changes or redeploying
- No changes needed to existing API calls/SDK integrations
- Agent fleet monitoring and management

## Getting Started
1. Login/signup on [secretagent.sh](https://secretagent.sh)
2. Create new project and send funds to the project wallet
3. `pnpm install secretagent.sh` in agent repo (or npm/yarn/bun/etc)
4. Integrate `SecretAgent` SDK (see below)
5. Boot up agent
6. Approve your agent in dashboard

## Sample Code

```ts
import SecretAgent from 'secretagent.sh';
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

const client = new OpenAI({ apiKey: SecretAgent.config.LLM_API_KEY });
```

> [!NOTE] 
> HTTP calls are automatically proxied and API keys are inserted appropriately

## Configuration Types

This tool supports 3 kinds of config keys:

### Pay-as-you-go LLM API Keys

> Instead of using your own OpenAI/etc API keys, you can use our keys and pay-as-you-go.

- Agents can self-fund their own LLM calls by sending funds to project wallet
- Dynamically swap model, provider, and other LLM settings at the proxy, enabling instant changes
- Human operated kill switch to disable rogue agents

### Bring-your-own API keys

> Use your own api keys (for any apis, not just LLMs) but insert them by proxy

- Per item configuration for matching domain rules, only matching requests rerouted to proxy
- Keys inserted by proxy, so agent never has direct access
- Enables instant key rotation / revocation
- Usage-based pricing, paid by central project-wallet

### Static Config (not proxied)

> Also supports static config, fetchable by agent, rather than inserted by proxy.

- Useful for non-sensitive config that affects agent behavior
- Or sensitive keys that must be used for additional computation within agent code

## Using Project Config Items

### Using Pay-as-you-go LLM Keys

Use `SecretAgent.config` to get your LLM key placeholder (for example `SecretAgent.config.LLM_API_KEY`).
LLM requests will automatically be proxied, and the key will be inserted. Connect to OpenAI as you normally would.

**LangChain Example**
```ts
import { ChatOpenAI } from '@langchain/openai';
const llm = new ChatOpenAI({ apiKey: SecretAgent.config.LLM_API_KEY });
```

**OpenAI SDK Example**
```ts
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: SecretAgent.config.LLM_API_KEY });
```

> [!TIP]
> You can access these keys before calling `SecretAgent.init()`, because a static placeholder key is used.

> [!NOTE]
> Our shared `llm` type keys automatically proxy any calls to `api.openai.com`, but allow you to switch providers and modify other settings like `temperature` and `model` on the fly without redeploying your agents.

### Using Bring-your-own API Keys

Create config items in the dashboard and set the domain matching rules appropriately. Use `SecretAgent.config` to get placeholder key, and use your SDKs as you normally would.

**Generic Example**

Create user keys called `COOL_API_KEY_ID` and `COOL_API_KEY_SECRET`, set the domain rules for each to `api.supercool.com`
```ts
import { CoolApi } from 'cool-api-sdk'
const coolApiClient = new CoolApi({
  apiKeyId: SecretAgent.config.COOL_API_KEY_ID,
  apiKeySecret: SecretAgent.config.COOL_API_KEY_SECRET,
})
```

**[Langsmith](https://www.langchain.com/langsmith) Example**

Create a new user key called `LANGSMITH_API_KEY`, set the domain rules to `api.smith.langchain.com`
```ts
// LangChain SDKs detect this key being present in env and enable tracing
process.env.LANGSMITH_API_KEY = SecretAgent.config.LANGSMITH_API_KEY;
```

### Using Static Config

For static items, the `SecretAgent.config` helper will return the actual value rather than a placeholder.

```ts
if (SecretAgent.config.FEATURE_FLAG_1 === '1') {
  // do something...
}
```

> [!WARNING]
> Static items must be used _after_ `SecretAgent.init()`. After init completes, the library will throw an error if any static items were already accessed.

Check out [SecretAgent.sh](https://secretagent.sh) for more details!

## Powered By

- [CDP](https://docs.cdp.coinbase.com/) - Onchainkit, Agentkit
- [Privy](https://www.privy.io/) - Server wallets
- [Base](https://www.base.org/) - L2 provider
- [Autonome](https://dev.autonome.fun/login) - Agent deployment and testing
- [DMNO](https://dmno.dev) - Secrets management
- [Next.js](https://nextjs.org/) - Web app
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Hono](https://hono.dev/) - API framework
- [Drizzle](https://orm.drizzle.team/) - Database / ORM
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) - API hosting

## Local Development Instructions

⚠️ _end users do not need to do this_ ⚠️

SecretAgent is a full stack application that includes: 
- A web app for managing secrets (`/packages/frontend`)
- A client library to integrate in your AgentKit/LangChain code (`/packages/secretagent-lib`)
- An API that powers the web app and client library (`/packages/api`)
- Example apps showing how to use the client library (`/examples`)

Requirements:
- Node.js v22, use [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm)
- pnpm v10.2 (corepack, fnm)
- You'll need the `DMNO_VAULT_KEY` in your `.dmno/.env.local` - this key decrypts the rest of the secrets
- `pnpm install`
- `pnpm --filter api db:reset:local`
- Generate local SSL certs by running just the frontend (first boot only), it will prompt you for sudo access to add it to your local cert authority
  - `pnpm --filter @secretagent.sh/frontend dev`
- `pnpm dev`
