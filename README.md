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

Use Node.js 24 for the Pyth frontend. Its Hermes and Solana Receiver dependencies declare `^24.0.0` as their supported Node.js engine.

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

## Pyth integration under local validation

The new `/pyth` interface has been tested locally on Solana Devnet. It has not yet replaced the public manual-price demo linked above.

Program ID: `7Smr7aaiTiXquYeRYqGnweNoTNKMHoqtvAKQYhcJudRC`

- DOGE/USD opening and closing quotes come from Pyth price updates verified by the program.
- The five steps are Connect, Create, Predict, Wait & Resolve, and Result & Verify.
- A chart checks for quotes approximately every five seconds while open. Network latency and the feed's publication cadence can make updates slower.
- A chart marker is a visual reference. It does not lock an entry price; the opening price is recorded when the round is created.
- Predictions still use fictitious PTS. No funded stakes or token payouts are implemented.

### Run the Pyth interface

After installing the Pyth frontend changes, set `PYTH_API_KEY` in the server's `.env.local` and open `/pyth`. Keep the key server-side and out of version control. Keep at least 0.05 Devnet SOL in the signing wallet; the preparation API checks this reserve for temporary oracle accounts and fees. The server fetches updates from `https://pyth.dourolabs.app/hermes`.

`SOLANA_DEVNET_RPC_URL` can select a server-side Devnet RPC. `PYTH_PRIORITY_FEE_MICROLAMPORTS` defaults to 5000 and accepts integers from 0 to 50000. This configures the priority rate, not a fixed total fee.

### Resolution timing and remaining limits

The timer starts when the round is created. Predict before it expires. Resolution requires the round authority's signature; it is not performed by an autonomous keeper.

The contract requires a fully verified update for the expected feed, a positive price, exponent -8, and a publish time no more than 60 seconds old according to Solana's clock. A closing quote must also be published between the scheduled close and 60 seconds after it. To leave time for signing and confirmation, the API only prepares resolution during the first 40 seconds after close. An expired window currently requires a new round; historical resolution is not implemented.

### Locally tested Devnet cycle

The creator reported the following successful transactions on October 9, 2026. These are local frontend tests against Devnet, not evidence that `/pyth` is publicly deployed or independently audited.

| Action | Transaction |
| --- | --- |
| Opening oracle preparation | [Explorer](https://explorer.solana.com/tx/2CLDx55Rs5q6ZwKLWzzDVzSeFQ1NQEeNmBDnoMSFaSi7WSESxWkDCmHZbmgTYWq7DXWhQ4x5UZsso4ZAswhkdKjr?cluster=devnet) |
| Create round | [Explorer](https://explorer.solana.com/tx/59kugTqPpFqorw1MEk72UaMamib1Bc651FfVXDozqx8t4YLnGTHtzZGCQwJNChEvvUPszU2RyYhVUTmy4MfcTcGu?cluster=devnet) |
| Submit prediction | [Explorer](https://explorer.solana.com/tx/2SfVLXxFCEuo52hV1Q4otcnbgp293TjjL4ei4nkQQXByy5WirqHY6RpZFK2dNGzmFdketL6BMgMwVPajYembaXhv?cluster=devnet) |
| Closing oracle preparation | [Explorer](https://explorer.solana.com/tx/38u4Vdxp5oGBn4CdT6Jf41bf18FDG27DLGn1UJkpNZhpiAneDht5gBUxDmZP1nQ9Gz6kWajsZ1bczvoeWhmyeRFw?cluster=devnet) |
| Resolve round | [Explorer](https://explorer.solana.com/tx/4x5MzEiiJZAvnQmAQ8zh5eMyrbSjQVCVvT48FvvwXHYbZ8aJwpKwWbNYWHkXcZMYRZYXxuceJsgDGTyxv55ZXV2j?cluster=devnet) |

For this cycle, the five transactions charged a total network fee of 0.000059090 SOL. The wallet's net reduction was 0.003518570 SOL, including 0.003459480 SOL of non-fee account funding. Fees can vary. Temporary oracle accounts are reclaimed in the batch; persistent Round, Prediction, and RoundResult accounts currently have no rent-recovery instruction. The user's wallet pays these Devnet costs.

### Dependency review

The October 9 local dependency review reduced `npm audit` from 14 affected packages (7 high, 7 moderate) to 3 moderate alerts, with none rated high or critical. The remaining alerts originate in `stream-json` and propagate through `jayson` and `@solana/web3.js`; they are not three independent bugs in the app.

The tested dependency lock upgrades Next.js within version 15 and uses scoped overrides for PostCSS 8.5.23, TOML 4.2.0, and UUID 11.1.1. A trial override to `stream-json` 3.6.0 broke Jayson's import paths and was removed. The remaining dependency needs a compatible upstream fix or a separately tested migration. Do not use `npm audit fix --force` on the demo without reviewing and testing the changes.

TypeScript, a production build, mocked RPC access, Anchor configuration parsing, and signed create/predict/resolve instruction serialization were checked locally. These checks do not replace a real-wallet regression run, a deployed performance test, or a contract audit.

## Current limits and next steps

This is a Devnet prototype. It has no funded prediction stakes, SPL-token payouts, liquidity mechanism, or audited production deployment. This README makes no claim of established adoption.

The next priorities are:

1. Complete regression testing and publish the locally tested Pyth interface.
2. Validate rounds with multiple participants and additional wallets.
3. Improve recovery when a round is not resolved within its permitted timing window.
4. Gather independent tester feedback and measurable usage data.

Reputation, community competitions, and broader prediction infrastructure are potential extensions rather than completed features.

## Why Memedictions

The product hypothesis is that memecoin communities can use a simple timed UP/DOWN interaction as an entry point to prediction experiences. Solana makes each registered prediction and resolved result inspectable through public accounts and transactions.

The prototype tests that interaction and its on-chain lifecycle. Community demand and repeat usage still need to be measured.
