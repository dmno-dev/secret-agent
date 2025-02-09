import { Coinbase } from '@coinbase/coinbase-sdk';
import { ethers } from 'ethers';

export const SUPPORTED_CHAIN_IDS = {
  ethereum: 1,
  base: 8453,
  'base-sepolia': 84532,
  arbitrum: 42161,
  'arbitrum-sepolia': 421614,
};

export const ETH_TO_GWEI = 1000000000;
export const GWEI_TO_WEI = 1000000000;

Coinbase.configure({
  apiKeyName: DMNO_CONFIG.CDP_API_KEY_NAME,
  privateKey: DMNO_CONFIG.CDP_API_KEY_PRIVATE_KEY,
});

let ethUsdPriceCents: number | undefined;
let ethUsdPriceLastUpdated: Date | undefined;
const CACHE_ETH_PRICE_DURATION = 10000; // cache price for 10 sec

export async function getEthUsdPrice(): Promise<number> {
  if (
    ethUsdPriceCents &&
    ethUsdPriceLastUpdated &&
    +new Date() - +ethUsdPriceLastUpdated < CACHE_ETH_PRICE_DURATION
  ) {
    return ethUsdPriceCents;
  }

  const ethSpotReq = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot');
  const ethSpotData: any = await ethSpotReq.json();
  ethUsdPriceCents = parseFloat(ethSpotData.data.amount);
  return ethUsdPriceCents;
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
