"use client";

import { useEffect, useState } from "react";

import {
  useConnect,
  useConnectedWallet,
  useDisconnect,
  useWallets,
  useWalletStatus,
} from "@solana/kit-plugin-wallet/react";

import {
  useClient,
} from "@solana/react";

import {
  testSolanaClient,
} from "@/lib/solana/test-client";

type TestClient =
  typeof testSolanaClient;

export default function WalletStandardPanel() {
  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const client =
    useClient<TestClient>();

  const status =
    useWalletStatus(client);

  const wallets =
    useWallets(client);

  const connected =
    useConnectedWallet(client);

  const connect =
    useConnect(client);

  const disconnect =
    useDisconnect(client);

  if (!mounted) {
    return (
      <div>
        Detectando wallets...
      </div>
    );
  }

  if (
    status === "pending" ||
    status === "reconnecting"
  ) {
    return (
      <div>
        Detectando wallets...
      </div>
    );
  }

  if (connected) {
    return (
      <div>
        <div>
          Wallet conectada:
        </div>

        <strong>
          {connected.account.address}
        </strong>

        <div
          style={{
            marginTop: 12,
          }}
        >
          <button
            type="button"
            onClick={() =>
              disconnect.dispatch()
            }
          >
            Desconectar wallet
          </button>
        </div>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div>
        No se detectaron wallets compatibles con Solana Wallet Standard.
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 12,
        }}
      >
        Wallets detectadas
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {wallets.map(
          (wallet) => (
            <button
              key={wallet.name}
              type="button"
              disabled={
                connect.isRunning
              }
              onClick={() =>
                connect.dispatch(
                  wallet
                )
              }
            >
              Conectar {wallet.name}
            </button>
          )
        )}
      </div>
    </div>
  );
}
