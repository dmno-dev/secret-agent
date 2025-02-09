import { PrivyClient } from '@privy-io/server-auth';
import ky, { HTTPError } from 'ky';
import { GWEI_TO_WEI, SUPPORTED_CHAIN_IDS } from './eth';

const privy = new PrivyClient(DMNO_CONFIG.PRIVY_APP_ID, DMNO_CONFIG.PRIVY_APP_SECRET);

const privyApi = ky.extend({
  prefixUrl: 'https://api.privy.io/v1',
  headers: {
    // basic auth
    Authorization: btoa(`${DMNO_CONFIG.PRIVY_APP_ID}:${DMNO_CONFIG.PRIVY_APP_SECRET}`),
    'privy-app-id': DMNO_CONFIG.PRIVY_APP_ID,
  },
});

export async function createPrivyServerWallet() {
  // TODO: better error handling, use idempotency key
  const createReq = await privyApi.post(`wallets`, {
    json: {
      chain_type: 'ethereum',
      policy_ids: [DMNO_CONFIG.PRIVY_SERVER_WALLET_POLICY_ID],
    },
  });
  const result = await createReq.json<{ id: string; address: string }>();
  console.log(result);
  return result;
}

export async function createDefaultWalletPolicy() {
  try {
    const policy = await privyApi.post('policies', {
      json: {
        version: '1.0',
        name: 'SecretAgent project wallet default policy',
        chain_type: 'ethereum',
        default_action: 'DENY',
        method_rules: [
          {
            method: 'eth_sendTransaction',
            rules: [
              {
                name: 'Allowlist',
                conditions: [
                  {
                    field_source: 'ethereum_transaction',
                    field: 'to',
                    operator: 'eq',
                    value: DMNO_CONFIG.BILLING_WALLET_ADDRESS,
                  },
                ],
                action: 'ALLOW',
              },
            ],
          },
        ],
      },
    });
    console.log(policy);
  } catch (err) {
    if (err instanceof HTTPError) {
      console.log(await err.response.json());
    } else {
      throw err;
    }
  }
}

export async function addDefaultPolicyToPrivyServerWallet(privyWalletId: string) {
  await privyApi.patch(`wallets/${privyWalletId}`, {
    json: {
      policy_ids: [DMNO_CONFIG.PRIVY_SERVER_WALLET_POLICY_ID],
    },
  });
}

export async function pullFundsFromPrivyServerWallet(privyWalletId: string, amountGwei: number) {
  // ! NOTE - server wallets only work on ETH mainnet at the moment, so we cannot actually charge it!
  return {
    hash: '0xabc123',
  };

  // TODO: enable this...
  const txn = await privy.walletApi.ethereum.sendTransaction({
    walletId: privyWalletId,
    caip2: 'eip155:8453',
    transaction: {
      to: DMNO_CONFIG.BILLING_WALLET_ADDRESS,
      // TODO: not 100% sure if amount is supposed to be wei or gwei?
      value: BigInt(amountGwei) * BigInt(GWEI_TO_WEI),
      // doesnt work at the moment
      chainId: SUPPORTED_CHAIN_IDS['base-sepolia'],
    },
  });

  return txn;
}
