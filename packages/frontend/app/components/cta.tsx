"use client";

import {
  ConnectWallet,
  ConnectWalletText,
  Wallet,
} from "@coinbase/onchainkit/wallet";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export function CTA() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle successful connection
  const handleConnect = () => {
    router.push("/dashboard");
  };

  if (!mounted) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 font-mono">
        $ curl secretagent.sh/start
      </h2>
      {isConnected ? (
        <Link
          href="/dashboard"
          className="inline-flex px-4 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors"
        >
          Go to Dashboard
        </Link>
      ) : (
        <Wallet>
          <ConnectWallet
            className="inline-flex px-4 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors"
            onConnect={handleConnect}
          >
            <ConnectWalletText>Get started</ConnectWalletText>
          </ConnectWallet>
        </Wallet>
      )}
    </section>
  );
}
