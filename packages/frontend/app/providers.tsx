"use client";

import { ThemeProvider, useTheme } from "next-themes";

import { config } from "@/config/wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { State, WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains"; // add base for production
const queryClient = new QueryClient();

function ProvidersInner(props: { children: ReactNode; initialState?: State }) {
  const { resolvedTheme } = useTheme();

  return (
    <WagmiProvider config={config} initialState={props.initialState}>
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

export function Providers(props: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ProvidersInner {...props} />
    </ThemeProvider>
  );
}
