# SecretAgent.sh 🔐🕶️🤖 

**Pay-as-you-go LLM keys and secret management tools for AI agents - powered by [secretagent.sh](https://secretagent.sh)**

> Brought to you by [dmno.dev](dmno.dev)

- Centralized secret management with integrated access logs
- Secrets inserted by proxy so agent never has direct access
- Agent auth and payments powered by crypto wallets
- Support managing a fleet of agents with shared config/secrets
- Central project wallet enables agent self-funding workflows
- Instant config changes without code changes or redeploying
- No changes needed to existing API calls/sdk integrations!
- Agent fleet monitoring and management

---

### Drop-in integration

- Login/signup on [secretagent.sh](https://secretagent.sh)
- Create new project and send some funds to the project wallet
- `pnpm install secretagent.sh` in agent repo (or npm/yarn/bun/etc)
- Integrate `SecretAgent` sdk (see below)
- Boot up agent
- Approve your agent in dashboard

```ts
import SecretAgent from 'secretagent.sh';
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

const client = new OpenAI({ apiKey: SecretAgent.config.LLM_API_KEY });
```

> [!NOTE] 
> HTTP calls are automatically proxied and API keys are inserted appropriately

--------

This tool supports 3 kinds of config keys:

### Pay-as-you-go LLM API keys

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

### Static config (not proxied)

> Also supports static config, fetchable by agent, rather than inserted by proxy.

- Useful for non-sensitive config that affects agent behaviour
- Or sensitive keys that must be used for additional computation within agent code

---

## Using project config items

### Using pay-as-you-go LLM keys

Use `SecretAgent.config` to get your LLM key placeholder (for example `SecretAgent.config.LLM_API_KEY`)
LLM requests will automatically be proxied, and the key will be inserted. Connect to OpenAI as you normally would.

**LangChain example**
```ts
import { ChatOpenAI } from '@langchain/openai';
const llm = new ChatOpenAI({ apiKey: SecretAgent.config.LLM_API_KEY });
```

**OpenAI SDK example**
```ts
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: SecretAgent.config.LLM_API_KEY });
```

> [!TIP]
> You can access these keys before calling `SecretAgent.init()`, because a static placeholder key is used.

> [!NOTE]
> Our shared `llm` type keys automatically proxy any calls to `api.openai.com`, but allow you to switch providers and modify other settings like `temperature` and `model` on the fly without redeploying your agents


### Using bring-your-own API keys

Create config items in the dashboard and set the domain matching rules appropriately. Use `SecretAgent.config` to get placeholder key, and use your SDKs as you normally would.

**Generic example**

Create user keys called `COOL_API_KEY_ID` and `COOL_API_KEY_SECRET`, set the domain rules for each to `api.supercool.com`
```ts
import { CoolApi } from 'cool-api-sdk'
const coolApiClient = new CoolApi({
  apiKeyId: SecretAgent.config.COOL_API_KEY_ID,
  apiKeySecret: SecretAgent.config.COOL_API_KEY_SECRET,
})
```

**[Langsmith](https://www.langchain.com/langsmith) example**

Create a new user key called `LANGSMITH_API_KEY`, set the domain rules to `api.smith.langchain.com`
```ts
// LangChain sdks detect this key being present in env and enables tracing
process.env.LANGSMITH_API_KEY = SecretAgent.config.LANGSMITH_API_KEY;
```

### Using static config

For static items, the `SecretAgent.config` helper will return the actual value rather than a placeholder.

```ts
if (SecretAgent.config.FEATURE_FLAG_1 === '1') {
  // do something...
}
```
> [!WARNING]
> Static items must be used _after_ `SecretAgent.init()`. After init completes, the library will throw an error if any static items were already accessed.
