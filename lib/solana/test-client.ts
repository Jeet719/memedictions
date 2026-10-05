import {
  createClient,
} from "@solana/kit";

import {
  solanaRpc,
} from "@solana/kit-plugin-rpc";

import {
  walletSigner,
} from "@solana/kit-plugin-wallet";

export const testSolanaClient =
  createClient()
    .use(
      walletSigner({
        chain: "solana:devnet",
      })
    )
    .use(
      solanaRpc({
        rpcUrl:
          process.env
            .NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ||
          "https://api.devnet.solana.com",
      })
    );
