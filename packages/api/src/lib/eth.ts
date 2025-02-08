import { Coinbase } from '@coinbase/coinbase-sdk';
import { ethers } from 'ethers';

Coinbase.configure({
  apiKeyName: DMNO_CONFIG.CDP_API_KEY_NAME,
  privateKey: DMNO_CONFIG.CDP_API_KEY_PRIVATE_KEY,
});

export const ETH_TO_GWEI = 1000000000;

export async function getEthUsdPrice(): Promise<number> {
  const ethSpotReq = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot');
  const ethSpotData: any = await ethSpotReq.json();
  return parseFloat(ethSpotData.data.amount);
}

export async function convertGweiToUsd(gweiAmount: number): Promise<number> {
  const ethPrice = await getEthUsdPrice();
  const ethAmount = gweiAmount / ETH_TO_GWEI;
  return ethAmount * ethPrice;
}

export async function getWalletEthBalance(address: string) {
  const provider = new ethers.InfuraProvider(
    'base-sepolia',
    DMNO_CONFIG.INFURA_API_KEY,
    DMNO_CONFIG.INFURA_API_KEY_SECRET
  );

  const balanceWei = await provider.getBalance(address);
  const balance = parseFloat(ethers.formatEther(balanceWei));

  console.log(balance);

  const ethPrice = await getEthUsdPrice();
  const usdValue = balance * ethPrice;

  return {
    eth: balance.toString(),
    usdCents: usdValue * 100,
    ethPriceCents: ethPrice * 100,
  };
}
