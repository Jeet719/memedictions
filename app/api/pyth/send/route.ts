import { pythConnection } from "@/lib/pyth-round";
import { sendDevnetTransaction } from "@/lib/send-devnet-transaction";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(request: Request) {
  // Pyth batches include oracle setup/cleanup transactions without a Memedictions instruction.
  return sendDevnetTransaction(request, pythConnection);
}
