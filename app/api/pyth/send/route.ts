import { pythConnection } from "@/lib/pyth-round";
import { sendDevnetTransaction } from "@/lib/send-devnet-transaction";
import { verifyPythAuthorization } from "@/lib/pyth-authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(request: Request) {
  // Pyth batches include oracle setup/cleanup transactions without a Memedictions instruction.
  // Read from a clone; the common sender still applies its body size/signature checks.
  const copy = request.clone();
  return sendDevnetTransaction(request, pythConnection, undefined, async body => {
    let authorization: unknown;
    try { authorization = (await copy.json())?.authorization; }
    catch { authorization = undefined; }
    verifyPythAuthorization(authorization, body.transaction, body.blockhash, body.lastValidBlockHeight);
  });
}
