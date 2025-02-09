import '@coinbase/onchainkit/styles.css';
import { Space_Grotesk, Space_Mono } from 'next/font/google';

import type { Metadata } from 'next';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import './globals.css';
import { Providers } from './providers';

const font = Space_Grotesk({
  subsets: ['latin'],
  variable: '--body-font',
  display: 'swap',
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const monoFont = Space_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--code-font',
});

export const metadata: Metadata = {
  title: 'secretagent.sh',
  description:
    'Secure API Access Management for AI Agents. SecretAgent.sh provides a robust platform for AI agent developers to manage API access securely, enabling seamless integration and control over your autonomous systems.',
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en" className={`${font.className}`} suppressHydrationWarning>
      <link rel="icon" href="/icon.svg" sizes="any" />
      <link rel="mask-icon" href="/icon-mask.svg" color="#000000" />
      <body className={`${font.className}`}>
        <Providers>{props.children}</Providers>
        <Toaster theme="system" position="top-right" closeButton richColors />
      </body>
    </html>
  );
}
