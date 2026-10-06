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

  const shellStyle = {
    marginTop: 14,
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.08)",
    background:
      "linear-gradient(180deg, rgba(14,11,20,.88), rgba(10,8,15,.78))",
  } as const;

  const badgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: ".04em",
  } as const;

  if (!mounted) {
    return (
      <div style={shellStyle}>
        <div
          style={{
            color: "#8fffc9",
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: ".08em",
          }}
        >
          WALLET STANDARD
        </div>

        <div
          style={{
            marginTop: 10,
            color: "#bbb2c8",
          }}
        >
          Detectando wallets...
        </div>
      </div>
    );
  }

  if (
    status === "pending" ||
    status === "reconnecting"
  ) {
    return (
      <div style={shellStyle}>
        <div
          style={{
            color: "#8fffc9",
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: ".08em",
          }}
        >
          WALLET STANDARD
        </div>

        <div
          style={{
            marginTop: 10,
            color: "#bbb2c8",
          }}
        >
          Detectando wallets...
        </div>
      </div>
    );
  }

  if (connected) {
    return (
      <div style={shellStyle}>
        <div
          style={{
            ...badgeStyle,
            background: "rgba(99,230,169,.10)",
            border: "1px solid rgba(99,230,169,.24)",
            color: "#8fffc9",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#63e6a9",
              display: "inline-block",
            }}
          />
          WALLET CONNECTED
        </div>

        <div
          style={{
            marginTop: 14,
            color: "#ffffff",
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          {connected.wallet.name}
        </div>

        <div
          style={{
            marginTop: 8,
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid rgba(169,139,255,.16)",
            background: "rgba(10,8,15,.55)",
            color: "#cbb9ff",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 13,
            overflowWrap: "anywhere",
          }}
        >
          {connected.account.address}
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() =>
              disconnect.dispatch()
            }
            style={{
              padding: "11px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,130,159,.26)",
              background:
                "linear-gradient(135deg, rgba(55,20,34,.96), rgba(36,16,28,.96))",
              color: "#ffb3c7",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Disconnect wallet
          </button>
        </div>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div style={shellStyle}>
        <div
          style={{
            ...badgeStyle,
            background: "rgba(255,171,192,.08)",
            border: "1px solid rgba(255,171,192,.20)",
            color: "#ffb3c7",
          }}
        >
          SIN WALLETS DETECTADAS
        </div>

        <p
          style={{
            marginTop: 12,
            marginBottom: 0,
            color: "#bbb2c8",
            lineHeight: 1.7,
          }}
        >
          No se detectaron wallets compatibles con Solana Wallet Standard.
          Si vas a probar la demo, abre Solflare y verifica que esté habilitada
          en tu navegador.
        </p>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#8fffc9",
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: ".08em",
            }}
          >
            WALLET STANDARD
          </div>

          <div
            style={{
              marginTop: 6,
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Connect Wallet
          </div>
        </div>

        <div
          style={{
            ...badgeStyle,
            background: "rgba(169,139,255,.10)",
            border: "1px solid rgba(169,139,255,.24)",
            color: "#cbb9ff",
          }}
        >
          {wallets.length} wallet{wallets.length === 1 ? "" : "s"} available
        </div>
      </div>

      <p
        style={{
          marginTop: 12,
          color: "#bbb2c8",
          lineHeight: 1.7,
          marginBottom: 0,
        }}
      >
        Usa una wallet compatible con Solana Wallet Standard para firmar
        transacciones directamente en Devnet.
      </p>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {wallets.map((wallet) => (
          <button
            key={wallet.name}
            type="button"
            disabled={connect.isRunning}
            onClick={() =>
              connect.dispatch(wallet)
            }
            style={{
              padding: "13px 18px",
              borderRadius: 14,
              border: "1px solid rgba(123,97,255,.28)",
              background:
                wallet.name.toLowerCase().includes("solflare")
                  ? "linear-gradient(135deg, #7b61ff, #21d4a7)"
                  : "linear-gradient(135deg, rgba(40,28,60,.98), rgba(23,17,34,.98))",
              color: "#ffffff",
              fontWeight: 800,
              cursor: connect.isRunning
                ? "not-allowed"
                : "pointer",
              boxShadow:
                wallet.name.toLowerCase().includes("solflare")
                  ? "0 10px 26px rgba(68, 201, 162, .18)"
                  : "none",
            }}
          >
            {connect.isRunning
              ? "Connecting..."
              : `Connect ${wallet.name}`}
          </button>
        ))}
      </div>
    </div>
  );
}
