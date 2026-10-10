# Security hardening — first isolated patch

Apply on `security-hardening`, based on the stable public demo. This patch changes
request validation and response headers. It does not publish production changes,
deploy a program or introduce funded stakes.

## Changes

- Four signed transaction endpoints enforce a 4 KiB streamed JSON limit, strict
  base64 and the 1,232-byte serialized transaction limit.
- Verify all legacy transaction signatures cryptographically, match the blockhash
  and require a positive integer last-valid block height.
- Manual `/test` send endpoints accept exactly their corresponding Memedictions
  instruction. Unrelated transfers, other operations and extra instructions fail.
- Reject cross-site browser requests. Origin checking is not authentication and
  does not prevent non-browser access to public endpoints.
- Retain the signature when confirmation is uncertain, and recover confirmation
  when a status lookup shows the transaction confirmed or finalized.
- Return controlled errors instead of provider URLs or raw RPC exceptions.
- Add anti-framing, MIME-sniffing, referrer and camera/microphone/location headers.
  The CSP only restricts framing; it is not a complete script/XSS policy.
- Remove conflict markers from `.gitignore`, ignore generated signing keypairs
  and stop ignoring the Pyth program source directory.

## Validation

```bash
npm run typecheck
node --test tests/signed-devnet-request.test.cjs
npm run build
```

Ten automated tests cover rejected transfers/operations, invalid/missing signatures,
blockhash mismatch, expiry shape, invalid JSON, cross-origin requests, streamed
body limits, legacy multisigner shape, error redaction, confirmation recovery and
the distinct Pyth/manual prediction send policies.
They generate local keys and mock RPC calls; they never broadcast or spend SOL.

Before merging, run complete `/test` and `/pyth` cycles on the isolated local build
with a Devnet wallet. Check chart, wallet prompts, Explorer links, result and reset.
Automated checks do not replace this wallet/oracle integration check.

## Pending work

The Pyth send endpoint still accepts signed legacy transactions with arbitrary
instructions. Oracle batches contain setup/cleanup transactions that need a
separate policy. Signatures prove authorization, not membership in a prepared
Memedictions batch. An expiring server-issued batch authorization or a reviewed
instruction policy is needed to restrict this relay.

Preparation/read endpoints still need review for input limits, timeouts and
resource abuse. Rate limiting should be distributed or configured at the edge,
rather than relying on process-local counters.

The supplied tracked archive contains manual V2 Rust and Pyth IDL, but not current
Pyth V2.2 Rust. Include and review that source before claiming contract coverage.
Dependencies, oracle freshness, recovery and privileged operations still need
review. This patch is not a full audit or a guarantee against compromise.

Identify unused files through dependency and route analysis before deletion.
This patch deletes no working routes or contract source files.
