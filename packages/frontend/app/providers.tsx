'use client';

import { ThemeProvider, useTheme } from 'next-themes';

import { config } from '@/config/wagmi';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

import { AUTH_ID_LOCALSTORAGE_KEY, AUTH_KEY_LOCALSTORAGE_KEY } from '@/lib/api';
import { toast } from 'sonner';
import { useAccount, useSignMessage } from 'wagmi';

type AuthContextType = {
  authToken: string | undefined;
  isLoading: boolean;
  setAuthToken: (authToken: string | undefined) => void;
};

const AuthContext = createContext<AuthContextType>({
  authToken: undefined,
  isLoading: true,
  setAuthToken: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [authToken, setAuthToken] = useState<string>();
  const { isConnected: walletIsConnected, address: connectedWalletAddress } = useAccount();

  const {
    data: signMessageData,
    error: signMessageError,
    isPending: signMessageIsPending,

    signMessage,
  } = useSignMessage();

  useEffect(() => {
    const tokenFromLocalStorage = window?.localStorage?.getItem(AUTH_KEY_LOCALSTORAGE_KEY);
    if (tokenFromLocalStorage) setAuthToken(tokenFromLocalStorage);
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('walletIsConnected', walletIsConnected);
    console.log('authToken', authToken);

    if (walletIsConnected && !authToken) {
      signMessage({
        message: ['You are logging into SecretAgent.sh'].join('\n'),
      });
    }
  }, [walletIsConnected, signMessage, authToken]);

  useEffect(() => {
    if (signMessageData) {
      console.log('message signed!', signMessageData);

      setAuthToken(signMessageData);
      window.localStorage.setItem(AUTH_KEY_LOCALSTORAGE_KEY, signMessageData);
      window.localStorage.setItem(AUTH_ID_LOCALSTORAGE_KEY, connectedWalletAddress!);
      toast.success('Successfully authenticated');
    }
  }, [signMessageData]);

  useEffect(() => {
    if (signMessageError && !authToken) {
      toast.error('Failed to authenticate: ' + signMessageError.message);
    }
  }, [signMessageError, authToken]);

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        authToken,
        setAuthToken,
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
          projectId={DMNO_PUBLIC_CONFIG.OCK_PROJECT_ID}
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
