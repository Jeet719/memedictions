import { Connection } from "@solana/web3.js";
import idl from "@/lib/idl/memedictions_v2_devnet.json";
import { sendDevnetTransaction } from "@/lib/send-devnet-transaction";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  return sendDevnetTransaction(request, () => new Connection(
    process.env.SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com", "confirmed"
  ), { program: idl.address,
    discriminator: idl.instructions.find(ix => ix.name === "initialize_round")!.discriminator });
}
