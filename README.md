# SecretAgent.sh

![SecretAgent.sh](./packages/frontend/public/secretagent-logo.png)

<!-- TODO: add a screenshot of the web app -->

SecretAgent is a full stack application that includes: 
- A web app for managing secrets (`/packages/frontend`)
- A client library to integrate in your AgentKit/LangChain code (`/packages/secretagent-lib`)
- An API that powers the web app and client library (`/packages/api`)
- Examples apps of how to use the client library (`/examples`)

SecretAgent allows you to deploy agents without having to worry about managing secrets. It provides three different ways to use secrets:
- LLM secrets - On-demand LLM keys, just use our LangChain/AgentKit integration to proxy your LLM calls and pay as you go
- Proxy secrets - Managed secrets that are automatically added via a proxy server
- Static secrets - simple key-value pairs, fetched via our client library

Getting Started: 
1. Create a project on [SecretAgent.sh](https://secretagent.sh)
2. Add your secrets
3. Add your agents
4. Add our integration to your agents

Sample code: 

```typescript
// TODO: add sample code here
```

Check out [SecretAgent.sh](https://secretagent.sh) for more details!

SecretAgent is powered by: 
- CDP - Onchainkit, Agentkit
- Privy - Server wallets
- Base - L2 provider
- Autonome - Agent deployment and testing
- DMNO - Secrets management
- Next.js - Web app
- TailwindCSS - Styling
- Hono - API
- Drizzle - Database ORM


---

## Instructions for local dev of this repo

_end users do not need to do this_

- Node.js v22, use [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm)
- pnpm v10.2 (corepack, fnm)
- you'll need the `DMNO_VAULT_KEY` in your `.dmno/.env.local` - this key decrypts the rest of the secrets
- `pnpm install`
- `pnpm --filter api db:reset:local`
- Generate local ssl certs by running just the frontend (first boot only), it will prompt you for sudo access to add it to your local cert authority
  - `pnpm --filter @secretagent.sh/frontend dev`
- `pnpm dev`
