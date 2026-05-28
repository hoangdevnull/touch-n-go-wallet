# BPMB Investor Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the GOFinance tokenized asset flow into a BPMB investor presentation demo with mocked buy/sell behavior and no blockchain execution.

**Architecture:** Keep the existing local investment store and UI flow. Replace on-chain transfer wording/config with demo order execution, update assets to BPMB/Sukuk presentation data, and keep holdings persisted locally.

**Tech Stack:** Expo Router, React Native, TypeScript, local store classes, Vitest.

---

### Task 1: Remove Investor On-Chain Execution Semantics

**Files:**
- Modify: `src/domain/investments.ts`
- Modify: `src/services/investmentTransfer.ts`
- Modify: `src/config/investmentConfig.ts`
- Modify: `src/state/investmentStore.ts`
- Test: `__tests__/investmentStore.test.ts`

- [x] **Step 1: Rename transfer semantics to demo order semantics**

In `src/domain/investments.ts`, keep the existing holding model but replace `InvestmentTransferRequest` with `InvestmentOrderRequest`, and use demo asset data for BPMB.

- [x] **Step 2: Replace on-chain executor with local demo executor**

In `src/services/investmentTransfer.ts`, remove runtime config validation and return references like `demo-order-<timestamp>-<direction>-<assetId>`.

- [x] **Step 3: Simplify runtime config**

In `src/config/investmentConfig.ts`, expose only `{ mode: "demo" }`.

- [x] **Step 4: Update investment store copy**

In `src/state/investmentStore.ts`, change error/success copy from “on-chain transfer” to “investment order”.

- [x] **Step 5: Update existing Vitest expectations**

In `__tests__/investmentStore.test.ts`, assert demo order requests instead of treasury/user transfer requests.

### Task 2: Update GOFinance UI Copy

**Files:**
- Modify: `app/(tabs)/gofinance.tsx`

- [x] **Step 1: Replace on-chain labels**

Change hero pill, subtitle, section titles, detail rows, and last reference labels so the screen reads as a BPMB investor demo.

- [x] **Step 2: Remove account transfer details**

Do not show treasury/user account transfer rows. Show asset type, jurisdiction, minimum investment, and last demo reference.

### Task 3: Update Documentation And Verify

**Files:**
- Modify: `README.md`

- [x] **Step 1: Update README**

Replace AST/on-chain setup instructions with no-blockchain demo behavior.

- [x] **Step 2: Run checks**

Run `npm test` and `npm run typecheck`.
