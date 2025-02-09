'use client';

import { AUTH_ID_LOCALSTORAGE_KEY, AUTH_KEY_LOCALSTORAGE_KEY } from '@/lib/api';
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
  const { isConnected } = useAccount();
  const { setAuthToken, authToken } = useAuth();

  // Listen for disconnect events and clear auth token
  useEffect(() => {
    if (!isConnected && authToken) {
      setAuthToken(undefined);
      window.localStorage.removeItem(AUTH_KEY_LOCALSTORAGE_KEY);
      window.localStorage.removeItem(AUTH_ID_LOCALSTORAGE_KEY);
    }
  }, [isConnected, authToken, setAuthToken]);

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
