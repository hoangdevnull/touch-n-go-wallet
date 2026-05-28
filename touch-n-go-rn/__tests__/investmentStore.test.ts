import { describe, expect, it } from "vitest";
import { createInvestmentStore } from "../src/state/investmentStore";

describe("investment store", () => {
  it("buys tokenized assets by creating a local demo order", async () => {
    const orders: unknown[] = [];
    const store = createInvestmentStore({
      executeOrder: async (request) => {
        orders.push(request);
        return { ok: true, referenceId: "demo-order-buy-001" };
      },
    });

    const result = await store.buy("petronas-station-sukuk", 5);

    expect(result.ok).toBe(true);
    expect(store.getState().holdings[0]).toMatchObject({
      assetId: "petronas-station-sukuk",
      units: 5,
      lastReferenceId: "demo-order-buy-001",
    });
    expect(orders[0]).toMatchObject({
      direction: "buy",
      referenceId: "BPMB-SUKUK-RWA-001",
      amount: "5",
    });
  });

  it("sells only available units by creating a local demo order", async () => {
    const orders: unknown[] = [];
    const store = createInvestmentStore({
      executeOrder: async (request) => {
        orders.push(request);
        return { ok: true, referenceId: "demo-order-sell-001" };
      },
    });
    await store.buy("petronas-station-sukuk", 8);

    const sell = await store.sell("petronas-station-sukuk", 3);
    const oversell = await store.sell("petronas-station-sukuk", 99);

    expect(sell.ok).toBe(true);
    expect(oversell.ok).toBe(false);
    expect(store.getState().holdings[0].units).toBe(5);
    expect(orders[1]).toMatchObject({
      direction: "sell",
      amount: "3",
    });
  });
});
