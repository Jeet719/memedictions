# Memedictions

**From memes to verifiable prediction records. Built on Solana.**

Memedictions is an experimental UP/DOWN prediction app for memecoin communities. Its public Devnet demo lets a user create a timed round, register a prediction, and inspect the recorded result on Solana Explorer.

**The current demo uses manually entered opening and closing prices and fictitious PTS. It does not provide oracle-backed market-price resolution, real-money stakes, or token payouts.**

## Try the public demo

- [Open the app](https://memedictions.vercel.app/test)
- [Visit the landing page](https://memedictions.vercel.app/landing)
- [Browse the source](https://github.com/Jeet719/memedictions)
- [Inspect the Devnet program](https://explorer.solana.com/address/6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy?cluster=devnet)

Program ID: `6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy`

## Judge walkthrough

1. Open the app and connect a Wallet Standard wallet. Solflare was used in the creator's public demo tests. Select Solana Devnet.
2. Obtain test SOL from a Devnet faucet if needed. Transactions and account creation require test SOL for fees and rent.
3. Create a market round. For a simple demonstration, choose a two-minute duration and enter an opening price of 100.
4. Sign the creation transaction, choose UP or DOWN, assign fictitious PTS, and sign the prediction transaction.
5. Wait until the round closes. The app uses the Solana Devnet clock to determine when resolution is allowed.
6. Using the round creator's wallet, enter a closing price and sign the resolution transaction.
7. Inspect the Round, Prediction, and RoundResult accounts and their transaction links before the interface starts a new cycle.

PTS are test points with no monetary value. They do not represent a funded stake. The automatic interface reset starts another cycle; it does not fetch a market price or resolve a round automatically.

### Example outcomes

| Opening input | Closing input | Prediction | Official direction | Prediction outcome |
| --- | --- | --- | --- | --- |
| 100 | 110 | UP | UP | Correct |
| 100 | 90 | UP | DOWN | Incorrect |
| 100 | 100 | UP or DOWN | VOID | Neither direction wins |

These values demonstrate the comparison rules. They are not live memecoin price quotes.

## Public demo evidence

The following references were collected by the project creator while testing the Vercel app on October 6, 2026. They provide inspectable examples of the round lifecycle, rather than adoption metrics or a security audit.

### VOID example

Round ID: `1791328293982`. Opening price: 100. Closing price: 100. Prediction: UP, 100 PTS. Displayed result: VOID.

| Step | Account | Transaction |
| --- | --- | --- |
| Round | [View PDA](https://explorer.solana.com/address/GFihU9TC95SBGD4pw2PdjWh1RrF73ZKkcQMQkz1B3Ey3?cluster=devnet) | [View transaction](https://explorer.solana.com/tx/5Q2NpDDYxuhWvFT1xLtZhy1rV96udNHbwfA1KUm6shEUhWxwTpycCJRq6c8TkhpYP7EDYj6VPdhp7Btypk6s1PeB?cluster=devnet) |
| Prediction | [View PDA](https://explorer.solana.com/address/CPdcECdjgVUZqaEaWH53mLKqGV9ofzZjjodcpYruqZG?cluster=devnet) | [View transaction](https://explorer.solana.com/tx/2WSBpHzw66b8QxFTho8etC57cpbc46MZSPujvudpb2C6FoVJVwHh5yRujeRJYrUq9uBXFof5kYfRckY69LDCWDHz?cluster=devnet) |
| RoundResult | [View PDA](https://explorer.solana.com/address/8oiBQqQwefit3Vks4NpbcWkzN5H74vnetXPgcV4GLdnZ?cluster=devnet) | [View transaction](https://explorer.solana.com/tx/3Qj2YopYWWN3uhm7DW99tioSeAzvF9cMsivaU22RqeGjs7jgJrK3Lpbyi6eRqRhQ1rTkpZDpu4YMprcrzr9LEi6g?cluster=devnet) |

### Incorrect prediction example

Round ID: `1791327220404`. Opening price: 80. Closing price: 110. Prediction: DOWN, 70 PTS. Displayed result: UP; prediction lost.

| Step | Account | Transaction |
| --- | --- | --- |
| Round | [View PDA](https://explorer.solana.com/address/AL9Vxe5ajYRAgoS7xoBD1nrWnhBY2DvYCfecQTBw2c5J?cluster=devnet) | [View transaction](https://explorer.solana.com/tx/2jmx3XgiinAuAFZzQWfN5GHfEjyKVGUB4VByy5iYogGNAFsS4TP6jwC4Qom7yCRYCvDgxQZ5NaE6Y4f7e1uECi4B?cluster=devnet) |
| Prediction | [View PDA](https://explorer.solana.com/address/3MxQnfBBEQPPbbdYcSU5X5uAmhrM8nNS6cVxuSWkmJ4M?cluster=devnet) | [View transaction](https://explorer.solana.com/tx/34kvE9MhvL4gQKmFCNhmwZ7q1Bo8NZ6TQDeuMy3iUEZTo9nVjgWX6Qm5pDzoPYGM5HQKr6RZmK9YECcz65cf4mjc?cluster=devnet) |
| RoundResult | [View PDA](https://explorer.solana.com/address/8s6vpt4JnA7z2mhhhCFt5gxV7WNjZAiG6uwjyBxMNuHx?cluster=devnet) | [View transaction](https://explorer.solana.com/tx/4QJLqLp3T6cAyB3xVLbpqWUmdBc3wLtCeaSZSZkfQc3XoKNAG5hn533HtPWwTjETcnB8MXfUfwKRmhURoPcwYb8L?cluster=devnet) |

## What works today

- A public English interface for creating, predicting, resolving, and inspecting rounds.
- Wallet Standard connection and wallet-signed transactions.
- On-chain Round, Prediction, and RoundResult accounts.
- One prediction per wallet per round, enforced through the Prediction PDA.
- Time checks using Solana's clock.
- UP, DOWN, and equal-price VOID outcomes.
- Explorer links for accounts and transactions.
- A new-round interface cycle that keeps the wallet connected.

The creator has tested the public round lifecycle. Broader wallet compatibility, independent testing, and usage metrics remain areas for further validation.

## Resolution and trust assumptions

The round creator supplies both price inputs. Only the round authority can sign its resolution transaction. The program checks the round timing and compares the supplied prices to record UP, DOWN, or VOID.

An on-chain result proves which inputs and outcome were recorded by the program. It does not authenticate those inputs against an external market-price feed. A creator may supply an inaccurate price or fail to resolve a round.

The current public release demonstrates prediction registration and result recording. Trustless market-price resolution is future work.

## Architecture

1. The Next.js interface requests transaction preparation from the server API.
2. The connected wallet signs the prepared transaction.
3. The API submits the signed transaction to Solana Devnet.
4. The Anchor program validates the instruction and creates or updates the relevant accounts.
5. The interface reads state and presents links to Solana Explorer.

| Account | PDA seeds | Purpose |
| --- | --- | --- |
| Round | `round`, authority, round ID encoded as little-endian bytes | Market, opening input, timing, and authority |
| Prediction | `prediction`, round, user | Direction and fictitious points |
| RoundResult | `round_result`, round | Closing input and computed outcome |

The public UI uses UP/DOWN labels. Some internal identifiers retain earlier Spanish names for compatibility.

### Technology

- Next.js, React, and TypeScript
- Solana Web3.js and Wallet Standard
- Rust and Anchor
- Solana Devnet
- Vercel hosting

## Run locally

Use a Node.js version compatible with the repository dependencies. The creator's Ubuntu environment uses Node.js 22.

```bash
git clone https://github.com/Jeet719/memedictions.git
cd memedictions
npm ci
cp .env.example .env.local
npm run dev
```

Open [localhost:3000/test](http://localhost:3000/test) for the app or [localhost:3000/landing](http://localhost:3000/landing) for the landing page.

The server-side `SOLANA_DEVNET_RPC_URL` setting is optional. Without it, the app uses the public Solana Devnet RPC endpoint. Public RPC rate limits can affect requests.

The public demo connects to the existing Devnet deployment; running the frontend does not require deploying a new program.

### Frontend checks

```bash
npm run typecheck
npm run build
```

These check TypeScript and the production frontend build. They do not replace contract tests or a security audit.

## Experimental oracle work

The repository also contains V2.2 oracle experiments involving Pyth. They are separate from the manual-price public demo described above.

Oracle-backed resolution still requires validating price freshness, source selection, transaction integration, and end-to-end behavior. The public demo evidence in this README does not demonstrate completed oracle integration.

## Current limits and next steps

This is a Devnet prototype. It has no funded prediction stakes, SPL-token payouts, liquidity mechanism, or audited production deployment. This README makes no claim of established adoption.

The next priorities are:

1. Implement and test oracle-backed resolution.
2. Validate rounds with multiple participants and additional wallets.
3. Improve recovery when a round is not resolved within its permitted timing window.
4. Gather independent tester feedback and measurable usage data.

Reputation, community competitions, and broader prediction infrastructure are potential extensions rather than completed features.

## Why Memedictions

The product hypothesis is that memecoin communities can use a simple timed UP/DOWN interaction as an entry point to prediction experiences. Solana makes each registered prediction and resolved result inspectable through public accounts and transactions.

The prototype tests that interaction and its on-chain lifecycle. Community demand and repeat usage still need to be measured.
