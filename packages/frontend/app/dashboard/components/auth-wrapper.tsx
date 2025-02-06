"use client";

import { useAuth } from "@/app/providers";
import {
  ConnectWallet,
  ConnectWalletText,
  Wallet,
} from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import { Terminal } from "../../components/terminal";
import { CommandLine } from "./command-line";
import { DashboardNav } from "./dashboard-nav";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isConnected: walletIsConnected, isConnecting: walletIsConnecting } =
    useAccount();
  const { isLoading } = useAuth();

  if (walletIsConnecting || isLoading) {
    return (
      <Terminal>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="text-lg font-mono animate-pulse">
            {walletIsConnecting && "Connecting wallet..."}
            {isLoading && "Authenticating..."}
          </div>
        </div>
      </Terminal>
    );
  }

  if (!walletIsConnected) {
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

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <DashboardContent>{children}</DashboardContent>;
}
