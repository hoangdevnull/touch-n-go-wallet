# Touch n Go Wallet React Native

Expo React Native clone of a Touch 'n Go style mobile wallet.

## Features

- eWallet dashboard with balance, rewards, reload, transfers, and GO+ savings.
- Transit ticket purchase, QR gate simulation, and physical TNG card reloads.
- Merchant pay and receive-money QR simulation.
- Transaction passbook with filters and live income/spend summaries.
- GOFinance tokenized asset buy/sell demo for the BPMB investor presentation.
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

- Buy creates a local demo order and increases the investor holding.
- Sell creates a local demo order and decreases the investor holding.
- Holdings are persisted locally for the demo.
- Demo order references are generated locally.

This investor app does not execute blockchain transactions and does not require a wallet private key. Issuer-side token creation remains outside this app.
