# SecretAgent.sh

Check out [SecretAgent.sh](https://secretagent.sh) for more details!


---

## Instructions for local dev of this repo
_end users do not need to do this_

- Node.js v22, use [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm)
- pnpm v10.2 (corepack, fnm)
- you'll need the `DMNO_VAULT_KEY` in your `.dmno/.env.local` - this key decrypts the rest of the secrets
- `pnpm install`
- `pnpm db:reset:local`
- Generate local ssl certs by running just the frontend (first boot only), it will prompt you for sudo access to add it to your local cert authority
  - `pnpm --filter @secretagent.sh/frontend dev`
- `pnpm dev`
