# Memedictions

**From memes to verifiable markets.**

Memedictions is an experimental prediction market platform built on **Solana**.

It allows users to create short-duration markets, predict whether a memecoin or market will go **UP** or **DOWN**, record that prediction on-chain, resolve the round, and verify the complete lifecycle directly on Solana.

The current public version runs entirely on **Solana Devnet** and uses only **fictitious points (PTS)**.

No real money is used.

---

## Live Demo

Public Devnet testing:

https://memedictions.vercel.app/test

The current V2.1 release has been tested end-to-end in production.

### Current flow

```text
Connect wallet
      ↓
Create round
      ↓
Register prediction
      ↓
Wait for round expiration
      ↓
Resolve round
      ↓
Store result on-chain
      ↓
Verify with Solana Explorer
      ↓
Start a new round
Why Memedictions?
Prediction markets can be powerful information systems, but many existing implementations are complex, slow to use, or disconnected from the fast-moving communities where narratives actually form.
Memedictions explores a simpler model:
- short-duration prediction markets;
- simple UP / DOWN decisions;
- transparent on-chain records;
- verifiable results;
- wallet-based identity;
- social and community-driven markets;
- a UX designed for fast-moving crypto communities.
The long-term vision is to evolve from simple memecoin predictions into reusable infrastructure for verifiable community markets.

Current Status — V2.1
Solana Devnet
V2.1 is deployed and operational on Solana Devnet.
Current capabilities:
- ✅ Solana Wallet Standard integration
- ✅ Wallet detection and connection
- ✅ Solflare support
- ✅ Devnet balance detection
- ✅ On-chain round creation
- ✅ UP / DOWN predictions
- ✅ Fictitious PTS
- ✅ One prediction per user per round
- ✅ Solana clock validation
- ✅ Round expiration validation
- ✅ Manual closing price
- ✅ On-chain round resolution
- ✅ SUBE / BAJA / VOID outcomes
- ✅ RoundResult PDA
- ✅ Duplicate resolution protection
- ✅ Solana Explorer links
- ✅ Automatic state recovery
- ✅ Automatic reset after completed rounds
- ✅ Public Vercel deployment
- ✅ End-to-end public testing

Solana Program
V2.1 Program ID
6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy

The program is deployed on Solana Devnet.
The same Program ID is synchronized across the current V2.1 implementation.

How to Test Memedictions
1. Open the public test application
https://memedictions.vercel.app/test
2. Connect a compatible Solana wallet
The application uses Solana Wallet Standard.
Solflare has been tested successfully.
Make sure the wallet is using:
Solana Devnet

3. Get Devnet SOL
A small amount of Devnet SOL is required to pay test transaction fees.
Devnet SOL has no monetary value.
Solana faucet:
https://faucet.solana.com/
4. Create a round
Choose:
- market;
- duration;
- opening price.
The round is created on-chain.
5. Submit a prediction
Choose:
SUBE

or:
BAJA

Then assign fictitious PTS.
The prediction is recorded on-chain.
6. Wait for the round to finish
The Solana clock is used to validate whether the round has reached its closing time.
Predictions cannot be submitted after the round has expired.
7. Resolve the round
Enter the final price.
Memedictions compares:
Opening Price
      ↓
Closing Price
      ↓
Outcome

Possible outcomes:
SUBE
BAJA
VOID

8. Verify on-chain
The interface provides Solana Explorer links for:
- Round PDA
- Prediction PDA
- Round Result PDA
- Round creation transaction
- Prediction transaction
- Resolution transaction

Architecture
Memedictions currently uses the following architecture:
User
  ↓
Wallet Standard
  ↓
Frontend
  ↓
API /prepare
  ↓
Unsigned Solana transaction
  ↓
User wallet signs
  ↓
API /send
  ↓
Solana Devnet
  ↓
Program
  ↓
PDAs

The server prepares transactions.
The user's wallet signs them.
The server never receives or stores the user's private keys.
Wallet Standard
V2.1 migrated away from a direct Phantom-only integration.
Memedictions now uses Solana Wallet Standard.
This allows the application architecture to support compatible Solana wallets without depending on a single wallet provider.
Current tested wallet:
Solflare

The signing flow is handled through the connected wallet signer.
Program Derived Addresses
Memedictions uses PDAs to represent protocol state.
Round
Conceptually:
["round", authority, round_id]

Represents a prediction round.
Prediction
["prediction", round, user]

Represents one user's prediction for one round.
The current program prevents the same user from submitting multiple predictions for the same round.
Round Result
["round_result", round]

Represents the final resolved result of a round.
The result account also prevents the same round from being resolved multiple times.
Prediction Model
Users currently choose between:
SUBE

and:
BAJA

They assign fictitious PTS to the prediction.
Example:
User A → SUBE → 100 PTS
User B → BAJA → 150 PTS
User C → SUBE → 75 PTS

PTS are currently used only for testing the prediction model and user experience.
They are not tokens and have no monetary value.

Round Resolution
V2.1 currently uses a manually supplied opening and closing price.
The program determines the outcome from those values.
Example
Opening Price: 100
Closing Price: 105

Outcome: SUBE

Opening Price: 100
Closing Price: 95

Outcome: BAJA

Opening Price: 100
Closing Price: 100

Outcome: VOID

The result is stored on-chain.

Why Manual Prices in V2.1?
The goal of V2.1 is to prove the complete on-chain prediction lifecycle before introducing external market data dependencies.
V2.1 validates:
- round creation;
- user identity through wallets;
- predictions;
- timing;
- PDA derivation;
- transaction signing;
- resolution;
- result storage;
- public verification.
This creates a stable base before oracle automation is introduced.

V2.2 — Oracle Integration
The next technical evolution of Memedictions is V2.2.
The objective is to replace manually supplied market prices with externally verifiable price data.
The current oracle research and development path uses Pyth Network.
Target architecture:
Create round
      ↓
Oracle opening price
      ↓
Users predict
      ↓
Round expires
      ↓
Oracle closing price
      ↓
Automatic comparison
      ↓
On-chain result

A separate V2.2 development program has already been used for oracle experimentation.
V2.2 is intentionally kept separate from the stable V2.1 public demo so that oracle development cannot destabilize the hackathon-ready release.

Current Oracle Research
Memedictions has already explored Pyth integration on Solana Devnet.
The main technical challenge identified during testing is reliable access to sufficiently fresh oracle price updates in the development environment.
The current direction for V2.2 is to continue evaluating authenticated Hermes / Pull Oracle workflows.
V2.1 remains the stable public release while this work continues.

Public Testing
The current version includes a public testing guide directly inside the application.
Testers are informed that:
- the application runs on Solana Devnet;
- a compatible wallet is required;
- Devnet SOL is required for transaction fees;
- PTS are fictitious;
- no real money is used;
- feedback is welcome.

Security Model
The current design follows a non-custodial signing model.
Server prepares transaction
        ↓
Browser receives transaction
        ↓
User wallet signs
        ↓
Signed transaction is submitted
        ↓
Solana processes transaction

Memedictions does not require the server to control the user's wallet.
Private keys and seed phrases remain under the user's wallet control.

Tech Stack
Blockchain
- Solana
- Anchor
- Rust
- Program Derived Addresses
- Solana Devnet
Frontend
- Next.js
- React
- TypeScript
Solana Client
- Solana Kit
- Solana Wallet Standard
- Solana RPC
- solana/web3.js
Infrastructure
- Vercel
- GitHub
- Solana Explorer
Oracle R&D
- Pyth Network
- Hermes
- Pull Oracle architecture research

Current Limitations
Memedictions is still an experimental project.
Current limitations include:
- Devnet only;
- fictitious PTS only;
- no Mainnet deployment;
- no real-money settlement;
- no SPL-token settlement;
- opening and closing prices are manually supplied in V2.1;
- oracle integration remains under development;
- no production economic model yet.
These limitations are intentional for the current testing stage.

Roadmap
V2.1 — Public Devnet MVP
- ✅ Solana program deployed
- ✅ Round creation
- ✅ Wallet Standard
- ✅ Predictions
- ✅ Round expiration
- ✅ Round resolution
- ✅ VOID handling
- ✅ PDAs
- ✅ Public Solana Explorer verification
- ✅ Public Vercel demo
- ✅ External testers
- ✅ Testing documentation
V2.2 — Oracle Automation
- 🟡 Pyth integration
- 🟡 Fresh price update workflow
- 🟡 Hermes / Pull Oracle evaluation
- ⬜ Automatic opening price
- ⬜ Automatic closing price
- ⬜ Oracle-driven resolution
- ⬜ Public oracle-enabled testing
Future Protocol Evolution
Potential future areas include:
- prediction accuracy history;
- reputation systems;
- streaks;
- leaderboards;
- creator markets;
- community-created markets;
- social prediction feeds;
- multiple market categories;
- APIs and SDKs;
- Markets-as-a-Service;
- automated market creation;
- advanced oracle infrastructure;
- SPL-based experimental settlement;
- governance research.

Long-Term Vision
Memedictions begins with short-duration memecoin predictions, but the larger idea is broader.
The goal is to explore a system where communities can create simple markets around questions they care about and verify the complete lifecycle on-chain.
Possible long-term direction:
Memecoins
    ↓
Crypto markets
    ↓
Creator markets
    ↓
Community predictions
    ↓
Reusable prediction infrastructure

Or simply:
From memes to verifiable markets.

Hackathon Release
The current hackathon release is:
Memedictions V2.1
Solana Devnet
Wallet Standard
Public Testing

Stable release tag:
v2.1-wallet-standard-stable

The stable release is intentionally separated from ongoing V2.2 oracle development.

Disclaimer
Memedictions is currently experimental software.
The current version:
- does not process real money;
- does not provide real-money gambling;
- does not provide financial products;
- does not use real-value settlement;
- uses fictitious PTS;
- runs on Solana Devnet;
- is intended for development, demonstration and testing.
Any future implementation involving real assets would require additional technical, security, economic and regulatory review.

Links
Live Demo
https://memedictions.vercel.app/test
GitHub
https://github.com/Jeet719/memedictions
Solana Program
6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy

Memedictions
From memes to verifiable markets.
Built on Solana.
