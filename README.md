# Freelance Escrow

Milestone-based USDC escrow for Southeast Asian freelancers, built on Soroban.

## Preview

![Freelance Escrow web app: hero section, milestone how-it-works timeline, and the Stellar Testnet wallet panel](docs/screenshot.png)

The web app (`app/`) connects a Freighter wallet to Stellar Testnet as the
settlement layer the escrow contract runs on. See [Setup Guide](#setup-guide)
below to run it locally, or [How to Build](#how-to-build) to work with the
Soroban contract directly.

## Problem

A freelancer in Cebu City, Manila, Ho Chi Minh City, or Jakarta delivers work
on a contract platform and the client disappears before paying — leaving the
freelancer with no recourse and no income for hours or days of completed
work. Traditional payment platforms charge 10-20% in combined fees and take
5-7 days to settle, on top of offering zero protection against non-payment.

## Solution

Freelance Escrow locks a client's USDC into a Soroban smart contract at the start of
a freelance engagement, broken into milestones. Funds release to the
freelancer automatically once the client approves each milestone, and either
party can raise a dispute that freezes the contract for arbitrator review.
Settlement happens on-chain in 3-5 seconds at a fraction of a cent — making
even small, frequent milestone payouts (e.g. $20-$50) economically viable in
a way that's impossible on higher-fee networks.

## Timeline

Designed for a hackathon build cycle:

- Day 1: Core escrow contract (`create_contract`, `submit_milestone`, `approve_milestone`)
- Day 2: Dispute flow (`raise_dispute`, `resolve_dispute`) + test suite
- Day 3: Web UI (React) wired to Freighter wallet + Soroban RPC, deploy to testnet

## Stellar Features Used

- **Soroban smart contracts** — escrow logic and milestone state machine
- **USDC transfers** — via the Stellar Asset Contract (SAC) interface
- **Trustlines** — client and freelancer must each hold a USDC trustline

## Vision and Purpose

Freelancing is a primary or supplemental income source for millions of
workers across the Philippines, Vietnam, and Indonesia. Freelance Escrow aims to
give these freelancers the same payment protection enjoyed by workers on
large platforms, without the platform's fees or delays, by putting the
escrow logic directly on-chain where both parties can verify it
independently. Long-term, Freelance Escrow is designed to plug into local Stellar
anchors so freelancers can off-ramp earnings directly into local currency.

## Prerequisites

- Rust (stable toolchain, edition 2021) with the `wasm32v1-none` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli) v23+ (formerly `soroban` CLI)
- A funded Stellar testnet account (via [Friendbot](https://friendbot.stellar.org))

## Setup Guide

### 1. Clone the repository

```bash
git clone <REPO_URL>
cd freelance_escrow
```

### 2. Install Rust and the Wasm target

If you don't already have Rust, install it via [rustup.rs](https://rustup.rs), then add the target this contract compiles to:

```bash
rustup target add wasm32v1-none
```

### 3. Install the Stellar CLI

```bash
cargo install --locked stellar-cli --features opt
```

Verify it installed correctly:

```bash
stellar --version
```

### 4. Configure the testnet network

Register the testnet as a named network so later commands can reference it with `--network testnet`:

```bash
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### 5. Create and fund an identity

Generate a local keypair (used as `--source` in CLI commands) and fund it via Friendbot:

```bash
stellar keys generate alice --network testnet --fund
```

Check the resulting address any time with:

```bash
stellar keys address alice
```

Repeat this step to create separate identities for the client, freelancer, and arbitrator roles used in the sample invocation below.

With the toolchain, network, and a funded identity in place, you're ready to build, test, and deploy — see the sections below.

## How to Build

```bash
stellar contract build
```

The compiled Wasm will be output to `target/wasm32v1-none/release/freelance_escrow.wasm`.

## How to Test

```bash
cargo test
```

This runs all 5 tests in `src/test.rs`: happy path, unauthorized-caller
rejection, post-transaction state verification, full dispute resolution
flow, and rejection of duplicate milestone submission.

## How to Deploy to Testnet

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/freelance_escrow.wasm \
  --source <YOUR_IDENTITY> \
  --network testnet
```

This prints the deployed contract's address — save it for invocations below.

## Sample CLI Invocation

Create a 2-milestone, 400 USDC contract (dummy addresses/token shown):

```bash
stellar contract invoke \
  --id <CONTRACT_ADDRESS> \
  --source <YOUR_IDENTITY> \
  --network testnet \
  -- \
  create_contract \
  --client GCLIENT...EXAMPLE \
  --freelancer GFREELANCER...EXAMPLE \
  --arbitrator GARBITRATOR...EXAMPLE \
  --token GTOKEN...USDC_CONTRACT \
  --milestone_amounts '[2000000000, 2000000000]'
```

Submit and approve the first milestone:

```bash
stellar contract invoke --id <CONTRACT_ADDRESS> --source <FREELANCER_IDENTITY> --network testnet \
  -- submit_milestone --contract_id 0 --milestone_index 0 --freelancer GFREELANCER...EXAMPLE

stellar contract invoke --id <CONTRACT_ADDRESS> --source <CLIENT_IDENTITY> --network testnet \
  -- approve_milestone --contract_id 0 --milestone_index 0 --client GCLIENT...EXAMPLE
```

## License

MIT