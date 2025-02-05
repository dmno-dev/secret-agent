# SecretAgent.sh

Check out [SecretAgent.sh](https://secretagent.sh) for more details!


---

## Instructions for local dev of this repo
_end users do not need to do this_

- Node.js v22, use [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm)
- pnpm v10.2 (corepack, fnm)
- you'll need the `DMNO_VAULT_KEY` in your `.dmno/.env.local` - this key decrypts the rest of the secrets
- `pnpm install`
- `pnpm db:setup`
- `pnpm dev`