"use client";

import { ThemeProvider, useTheme } from "next-themes";

import { config } from "@/config/wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";

const queryClient = new QueryClient();

function ProvidersInner(props: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={DMNO_PUBLIC_CONFIG.ONCHAINKIT_API_KEY}
          chain={baseSepolia} // add baseSepolia for testing
          config={{
            appearance: {
              theme: resolvedTheme as "dark" | "light",
              name: "custom",
            },
            wallet: {
              display: "modal",
            },
          }}
        >
          {props.children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function Providers(props: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ProvidersInner {...props} />
    </ThemeProvider>
  );
}
