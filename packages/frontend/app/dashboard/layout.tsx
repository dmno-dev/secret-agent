"use client";

import {
  ConnectWallet,
  ConnectWalletText,
  Wallet,
} from "@coinbase/onchainkit/wallet";
import type React from "react";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Terminal } from "../components/terminal";
import { CommandLine } from "./components/command-line";
import { DashboardNav } from "./components/dashboard-nav";
import { AUTH_KEY_LOCALSTORAGE_KEY } from "@/lib/api";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [authToken, setAuthToken] = useState<string>();
  const {
    isConnected: walletIsConnected,
    isConnecting: walletIsConnecting,
  } = useAccount();
  const {
    data: signMessageData,
    error: signMessageError,
    isPending: signMessageIsPending,
    isSuccess: signMessageSuccess,
    variables: signMessageVars,
    signMessage,
  } = useSignMessage();

  useEffect(() => {
    const tokenFromLocalStorage = window.localStorage.getItem(AUTH_KEY_LOCALSTORAGE_KEY);
    if (tokenFromLocalStorage) setAuthToken(tokenFromLocalStorage);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (walletIsConnected && !authToken) {
      signMessage({
        message: [
          'You are logging into SecretAgent.sh',
        ].join('\n')
      });
    }
  }, [walletIsConnected, signMessage, authToken])

  useEffect(() => {
    if (signMessageData) {
      setAuthToken(signMessageData);
      window.localStorage.setItem(AUTH_KEY_LOCALSTORAGE_KEY, signMessageData);
    }
  }, [signMessageData])

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) {
    return null;
  }

  if (walletIsConnecting || signMessageIsPending) {
    return (
      <Terminal>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="text-lg font-mono animate-pulse">
            { walletIsConnecting && 'Connecting wallet...'}
            { signMessageIsPending && 'Signing auth message...'}
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
