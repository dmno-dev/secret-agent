'use client';

import { ThemeProvider, useTheme } from 'next-themes';

import { config } from '@/config/wagmi';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

import { AUTH_ID_LOCALSTORAGE_KEY, AUTH_KEY_LOCALSTORAGE_KEY } from '@/lib/api';
import { toast } from 'sonner';
import { useAccount, useSignMessage } from 'wagmi';

type AuthContextType = {
  authToken: string | undefined;
  isLoading: boolean;
  logout: () => void;
  setAuthToken: (authToken: string | undefined) => void;
};

const AuthContext = createContext<AuthContextType>({
  authToken: undefined,
  isLoading: true,
  logout: () => {},
  setAuthToken: () => {},
});

export const useAuth = () => useContext(AuthContext);

const SIGN_IN_MESSAGE = (address: string, nonce: string) => `You are signing into SecretAgent.sh

By signing this message, you are proving ownership of the wallet address ${address}.

This signature will not trigger a blockchain transaction or cost any gas fees.

Nonce: ${nonce}
Issued At: ${new Date().toISOString()}
Version: 1
Chain ID: ${baseSepolia.id}
URI: ${DMNO_PUBLIC_CONFIG.SECRETAGENT_WEB_URL}`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [authToken, setAuthToken] = useState<string>();
  const [pendingSignIn, setPendingSignIn] = useState(false);
  const { isConnected: walletIsConnected, address: connectedWalletAddress } = useAccount();

  const {
    data: signMessageData,
    error: signMessageError,
    isPending: signMessageIsPending,
    signMessage,
  } = useSignMessage();

  const clearAuthState = useCallback(() => {
    setAuthToken(undefined);
    setPendingSignIn(false);
    window.localStorage.removeItem(AUTH_KEY_LOCALSTORAGE_KEY);
    window.localStorage.removeItem(AUTH_ID_LOCALSTORAGE_KEY);
    window.localStorage.removeItem('SA_AUTH_NONCE');
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const tokenFromLocalStorage = window?.localStorage?.getItem(AUTH_KEY_LOCALSTORAGE_KEY);
    if (tokenFromLocalStorage) {
      try {
        const [signature, timestamp] = tokenFromLocalStorage.split('|');
        const expiryTime = new Date(timestamp).getTime() + 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() > expiryTime) {
          clearAuthState();
        } else {
          setAuthToken(signature);
        }
      } catch (e) {
        clearAuthState();
      }
    }
    setMounted(true);
  }, [clearAuthState]);

  // Handle wallet connection and initiate sign message
  useEffect(() => {
    if (walletIsConnected && !authToken && connectedWalletAddress) {
      const nonce = crypto.randomUUID();
      window.localStorage.setItem('SA_AUTH_NONCE', nonce);
      setPendingSignIn(true);
      signMessage({
        message: SIGN_IN_MESSAGE(connectedWalletAddress, nonce),
      });
    }
  }, [walletIsConnected, signMessage, authToken, connectedWalletAddress]);

  // Handle successful signature
  useEffect(() => {
    if (signMessageData && pendingSignIn) {
      const formattedSignature = signMessageData;
      const timestamp = new Date().toISOString();
      const tokenWithTimestamp = `${formattedSignature}|${timestamp}`;

      setAuthToken(formattedSignature);
      window.localStorage.setItem(AUTH_KEY_LOCALSTORAGE_KEY, tokenWithTimestamp);
      window.localStorage.setItem(AUTH_ID_LOCALSTORAGE_KEY, connectedWalletAddress!);
      setPendingSignIn(false);
      toast.success('Successfully authenticated');
    }
  }, [signMessageData, connectedWalletAddress, pendingSignIn]);

  // Handle signature errors
  useEffect(() => {
    if (signMessageError && pendingSignIn) {
      console.error('Authentication error:', signMessageError);
      toast.error('Failed to authenticate: ' + signMessageError.message);
      clearAuthState();
    }
  }, [signMessageError, pendingSignIn, clearAuthState]);

  // Handle wallet disconnection
  useEffect(() => {
    if (!walletIsConnected && authToken) {
      clearAuthState();
    }
  }, [walletIsConnected, authToken, clearAuthState]);

  const handleLogout = useCallback(() => {
    clearAuthState();
    toast.success('Logged out successfully');
  }, [clearAuthState]);

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        authToken,
        setAuthToken,
        logout: handleLogout,
        isLoading: signMessageIsPending || !mounted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const queryClient = new QueryClient({});

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
          chain={baseSepolia}
          config={{
            appearance: {
              theme: resolvedTheme as 'dark' | 'light',
              name: 'custom',
            },
            wallet: {
              display: 'modal',
            },
          }}
        >
          <AuthProvider>{props.children}</AuthProvider>
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
