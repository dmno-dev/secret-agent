'use client';

import { Address, EthBalance, Identity } from '@coinbase/onchainkit/identity';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '../providers';

export function WalletButton() {
  const { isConnected, isDisconnected } = useAccount();
  const { authToken, logout } = useAuth();

  // Handle wallet disconnection
  useEffect(() => {
    if (isDisconnected && authToken) {
      logout();
    }
  }, [isDisconnected, authToken, logout]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex items-center">
      <Wallet>
        <ConnectWallet className="!p-0 !bg-transparent !border-0 text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-200 transition-colors font-mono">
          Profile
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2">
            <Address />
            <EthBalance />
          </Identity>

          <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
            Wallet
          </WalletDropdownLink>

          <WalletDropdownDisconnect text="Logout" />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
