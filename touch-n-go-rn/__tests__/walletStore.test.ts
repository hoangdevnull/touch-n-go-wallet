import { createWalletStore } from "../src/state/walletStore";
import { describe, expect, it } from "vitest";

describe("wallet store", () => {
  it("reloads the wallet and records an income transaction", () => {
    const store = createWalletStore();

    store.reloadWallet(50);

    expect(store.getState().wallet.balance).toBe(200);
    expect(store.getState().transactions[0]).toMatchObject({
      type: "RELOAD",
      title: "Wallet Reload",
      amount: 50,
      isExpense: false,
    });
  });

  it("prevents transfers that exceed the wallet balance", () => {
    const store = createWalletStore();

    const result = store.sendMoney("Maya", "0123456789", 999);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Insufficient");
    expect(store.getState().wallet.balance).toBe(150);
    expect(store.getState().transactions).toHaveLength(0);
  });

  it("buys and validates a transit ticket when balance is available", () => {
    const store = createWalletStore();

    const purchase = store.buyTransitTicket("KL Sentral", "KLCC", "MRT", 2.8);
    const ticket = store.getState().tickets[0];

    expect(purchase.ok).toBe(true);
    expect(ticket.status).toBe("ACTIVE");
    expect(store.getState().wallet.balance).toBeCloseTo(147.2);

    store.markTicketUsed(ticket.id);

    expect(store.getState().tickets[0].status).toBe("USED");
  });

  it("moves money between wallet and GO+ with balance checks", () => {
    const store = createWalletStore();

    expect(store.triggerGoPlusInvestment(30, false).ok).toBe(true);
    expect(store.getState().wallet.balance).toBe(120);
    expect(store.getState().wallet.goplusBalance).toBe(55.5);

    expect(store.triggerGoPlusInvestment(999, true).ok).toBe(false);
    expect(store.getState().wallet.goplusBalance).toBe(55.5);
  });
});
