"use client";

import {
  ClientProvider,
} from "@solana/react";

import {
  testSolanaClient,
} from "@/lib/solana/test-client";

export default function TestWalletProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <ClientProvider
      client={
        testSolanaClient
      }
    >
      {children}
    </ClientProvider>
  );
}
