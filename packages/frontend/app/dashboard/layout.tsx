"use client";

import {
  ConnectWallet,
  ConnectWalletText,
  Wallet,
} from "@coinbase/onchainkit/wallet";
import type React from "react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Terminal } from "../components/terminal";
import { CommandLine } from "./components/command-line";
import { DashboardNav } from "./components/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, isConnecting } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) {
    return null;
  }

  if (isConnecting) {
    return (
      <Terminal>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="text-lg font-mono animate-pulse">
            Connecting wallet...
          </div>
        </div>
      </Terminal>
    );
  }

  if (!isConnected) {
    return (
      <Terminal>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="text-lg font-mono mb-4">
            Log in to access the dashboard
          </div>
          <Wallet>
            <ConnectWallet className="inline-flex px-4 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors">
              <ConnectWalletText>Sign in</ConnectWalletText>
            </ConnectWallet>
          </Wallet>
        </div>
      </Terminal>
    );
  }

  return (
    <Terminal>
      <div className="flex flex-col">
        <DashboardNav />
        <main className="flex-grow p-6">{children}</main>
        <CommandLine />
      </div>
    </Terminal>
  );
}
