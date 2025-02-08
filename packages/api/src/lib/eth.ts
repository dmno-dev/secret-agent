import { ethers } from 'ethers';
import { Coinbase, Wallet } from '@coinbase/coinbase-sdk';

Coinbase.configure({
  apiKeyName: DMNO_CONFIG.CDP_API_KEY_NAME,
  privateKey: DMNO_CONFIG.CDP_API_KEY_PRIVATE_KEY,
});

export const ETH_TO_GWEI = 1000000000;

export async function getWalletEthBalance(address: string) {
  const provider = new ethers.InfuraProvider(
    'base-sepolia',
    DMNO_CONFIG.INFURA_API_KEY,
    DMNO_CONFIG.INFURA_API_KEY_SECRET
  );

  const balanceWei = await provider.getBalance(address);
  const balance = parseFloat(ethers.formatEther(balanceWei));

  console.log(balance);

  // https://api.exchange.coinbase.com/products/ETH-USD/ticker
  const ethSpotReq = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot');
  const ethSpotData: any = await ethSpotReq.json();
  const ethPriceCents = parseFloat(ethSpotData.data.amount) * 100;
  return {
    eth: balance.toString(),
    usdCents: balance * ethPriceCents,
    ethPriceCents,
  };
}
