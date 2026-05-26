import { describe, expect, it } from "vitest";
import { createInvestmentStore } from "../src/state/investmentStore";

describe("investment store", () => {
  it("buys tokenized assets by constructing a treasury-to-user transfer", async () => {
    const transfers: unknown[] = [];
    const store = createInvestmentStore({
      executeTransfer: async (request) => {
        transfers.push(request);
        return { ok: true, transactionId: "0.0.777-1700000000-000000001" };
      },
    });

    const result = await store.buy("bpmb-green-bond", 5);

    expect(result.ok).toBe(true);
    expect(store.getState().holdings[0]).toMatchObject({
      assetId: "bpmb-green-bond",
      units: 5,
    });
    expect(transfers[0]).toMatchObject({
      direction: "buy",
      securityId: "0.0.61001",
      sourceAccountId: "0.0.9001",
      targetAccountId: "0.0.8001",
      amount: "5",
    });
  });

  it("sells only available units by constructing a user-to-treasury transfer", async () => {
    const transfers: unknown[] = [];
    const store = createInvestmentStore({
      executeTransfer: async (request) => {
        transfers.push(request);
        return { ok: true, transactionId: "0.0.777-1700000001-000000001" };
      },
    });
    await store.buy("bpmb-green-bond", 8);

    const sell = await store.sell("bpmb-green-bond", 3);
    const oversell = await store.sell("bpmb-green-bond", 99);

    expect(sell.ok).toBe(true);
    expect(oversell.ok).toBe(false);
    expect(store.getState().holdings[0].units).toBe(5);
    expect(transfers[1]).toMatchObject({
      direction: "sell",
      sourceAccountId: "0.0.8001",
      targetAccountId: "0.0.9001",
      amount: "3",
    });
  });
});
