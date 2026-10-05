import {
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEVNET_RPC =
  process.env.SOLANA_DEVNET_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ||
  "https://api.devnet.solana.com";

async function getBalance(
  address: string
) {
  const response =
    await fetch(
      DEVNET_RPC,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          "Cache-Control":
            "no-cache",
        },
        cache: "no-store",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "getBalance",
          params: [
            address,
            {
              commitment: "finalized",
            },
          ],
        }),
      }
    );

  const data =
    await response.json();

  if (
    !response.ok ||
    data?.error ||
    typeof data?.result?.value !== "number"
  ) {
    throw new Error(
      data?.error?.message ||
      "RPC Devnet no devolvió un balance válido."
    );
  }

  return {
    lamports: data.result.value as number,
    slot: data.result.context?.slot,
  };
}

export async function GET(
  request: Request
) {
  try {
    const url =
      new URL(request.url);

    const address =
      url.searchParams.get("address");

    if (!address) {
      return Response.json(
        {
          ok: false,
          error:
            "Falta la dirección de wallet.",
        },
        {
          status: 400,
        }
      );
    }

    const publicKey =
      new PublicKey(address);

    let result =
      await getBalance(
        publicKey.toBase58()
      );

    for (
      let attempt = 1;
      attempt < 4 &&
      result.lamports === 0;
      attempt++
    ) {
      await new Promise(
        resolve =>
          setTimeout(resolve, 350)
      );

      result =
        await getBalance(
          publicKey.toBase58()
        );
    }

    const sol =
      result.lamports /
      LAMPORTS_PER_SOL;

    console.log(
      "DEVNET_BALANCE_SERVER",
      {
        address:
          publicKey.toBase58(),
        lamports:
          result.lamports,
        sol,
        slot:
          result.slot,
        rpc:
          DEVNET_RPC,
      }
    );

    return Response.json(
      {
        ok: true,
        address:
          publicKey.toBase58(),
        lamports:
          result.lamports,
        sol,
        slot:
          result.slot,
        network:
          "devnet",
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );

  } catch (error) {
    console.error(
      "V2_DEVNET_BALANCE_API_ERROR",
      error
    );

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo consultar el saldo Devnet.",
      },
      {
        status: 500,
      }
    );
  }
}
