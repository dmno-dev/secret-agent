import { PrivyClient } from '@privy-io/server-auth';

const privy = new PrivyClient(DMNO_CONFIG.PRIVY_APP_ID, DMNO_CONFIG.PRIVY_APP_SECRET);

export async function createPrivyServerWallet() {
  const { id, address, chainType } = await privy.walletApi.create({ chainType: 'ethereum' });
  return { id, address };
}