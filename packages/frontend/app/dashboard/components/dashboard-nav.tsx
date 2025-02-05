"use client";

import { Address, EthBalance, Identity } from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
} from "@coinbase/onchainkit/wallet";
import Link from "next/link";
import { useEffect, useState } from "react";

export function DashboardNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const activeNavLinkStyles =
    "flex items-center space-x-2 px-3 py-2 rounded bg-gray-200 text-gray-900 dark:bg-green-800 dark:text-green-200";
  const walletButtonStyles =
    "flex items-center space-x-2 px-3 py-2 rounded bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors";

  return (
    <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <Link href="/dashboard" className={activeNavLinkStyles}>
        Projects
      </Link>
      <div className="flex items-center">
        <Wallet>
          <ConnectWallet className={walletButtonStyles}>
            <Address hasCopyAddressOnClick={false} />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2">
              <Address />
              <EthBalance />
            </Identity>

            <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
              Wallet
            </WalletDropdownLink>

            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>
    </nav>
  );
}
