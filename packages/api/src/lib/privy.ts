import { PrivyClient } from '@privy-io/server-auth';
import ky, { HTTPError } from 'ky';
import { GWEI_TO_WEI } from './eth';

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
  try {
    console.log('pulling funds from privy server wallet', privyWalletId, amountGwei);
    console.log('billing wallet address', DMNO_CONFIG.BILLING_WALLET_ADDRESS);
    const value = BigInt(amountGwei) * BigInt(GWEI_TO_WEI);
    console.log('value', value);

    const response = await privy.walletApi.ethereum.sendTransaction({
      walletId: privyWalletId,
      caip2: 'eip155:84532', // base-sepolia chain id
      transaction: {
        to: DMNO_CONFIG.BILLING_WALLET_ADDRESS as `0x${string}`,
        value: Number(value), // Convert BigInt to number as per example
        chainId: 84532,
      },
    });

    console.log('Transaction response:', response);
    return response;
  } catch (err) {
    console.error('Error pulling funds from privy server wallet:', err);
    if (err instanceof HTTPError) {
      console.error('Privy API error response:', await err.response.json());
    }
    throw err; // Re-throw to let caller handle the error
  }
}
