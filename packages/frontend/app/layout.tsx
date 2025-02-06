import '@coinbase/onchainkit/styles.css';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'secretagent.sh',
  description:
    'Secure API Access Management for AI Agents. SecretAgent.sh provides a robust platform for AI agent developers to manage API access securely, enabling seamless integration and control over your autonomous systems.',
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className={`${GeistSans.className}, ${GeistMono.className}`}>
        <Providers>{props.children}</Providers>
        <Toaster theme="system" position="top-right" closeButton richColors />
      </body>
    </html>
  );
}
