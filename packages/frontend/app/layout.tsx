import "@coinbase/onchainkit/styles.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { type ReactNode } from "react";
import { cookieToInitialState } from "wagmi";
import "./globals.css";

import { config } from "../config/wagmi";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "secretagent.sh",
  description:
    "Secure API Access Management for AI Agents. SecretAgent.sh provides a robust platform for AI agent developers to manage API access securely, enabling seamless integration and control over your autonomous systems.",
};

export default function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`${GeistSans.className} ${GeistMono.className}`}>
        <Providers initialState={initialState}>{props.children}</Providers>
      </body>
    </html>
  );
}
