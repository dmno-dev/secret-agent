import { createConfig, createStorage, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';

// Create storage for persisting connection state
const storage = createStorage({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

// Configure connectors
const connectors = [
  metaMask(),
  coinbaseWallet({
    appName: 'SecretAgent',
  }),
];

export const config = createConfig({
  chains: [baseSepolia],
  connectors,
  transports: {
    [baseSepolia.id]: http(),
  },
  storage,
  multiInjectedProviderDiscovery: false,
});
