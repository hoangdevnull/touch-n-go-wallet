# Touch n Go Wallet React Native

Expo React Native clone of a Touch 'n Go style mobile wallet.

## Features

- eWallet dashboard with balance, rewards, reload, transfers, and GO+ savings.
- Transit ticket purchase, QR gate simulation, and physical TNG card reloads.
- Merchant pay and receive-money QR simulation.
- Transaction passbook with filters and live income/spend summaries.
- GOFinance tokenized asset buy/sell demo with AST-style transfer semantics.
- Local persisted wallet state using AsyncStorage.

## Run Locally

```bash
npm install
npm run start
```

Then open the app with Expo Go, an Android emulator, or an iOS simulator.

## Checks

```bash
npm test
npm run typecheck
```

## Tokenized Asset Demo

The GOFinance tab contains a two-click tokenized asset investment flow.

Current behavior:

- Buy builds a treasury-to-user AST transfer request.
- Sell builds a user-to-treasury AST transfer request.
- Holdings are persisted locally for the demo.
- `demo` mode returns deterministic demo transaction ids.

Local on-chain configuration is intentionally not committed. Copy `.env.example` to `.env` and use a throwaway testnet/previewnet account only.

```bash
EXPO_PUBLIC_INVESTMENT_EXECUTION_MODE=onchain
EXPO_PUBLIC_AST_RPC_URL=<hedera-json-rpc-url>
EXPO_PUBLIC_AST_DEMO_PRIVATE_KEY=<throwaway-demo-private-key>
EXPO_PUBLIC_AST_USER_ACCOUNT_ID=<demo-user-account>
EXPO_PUBLIC_AST_TREASURY_ACCOUNT_ID=<demo-treasury-account>
```

The mobile executor validates this config in `onchain` mode. The AST SDK package still needs to be bundled for React Native before `Security.transfer` can be called directly from the app.
