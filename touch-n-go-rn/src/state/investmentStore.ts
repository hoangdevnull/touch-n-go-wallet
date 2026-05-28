import { tokenizedAssets } from "../domain/investments";
import type {
  AssetHolding,
  InvestmentOrderRequest,
  InvestmentOperationResult,
} from "../domain/investments";
import { createDemoInvestmentOrderExecutor } from "../services/investmentTransfer";
import type { InvestmentOrderExecutor } from "../services/investmentTransfer";

export type InvestmentState = {
  holdings: AssetHolding[];
  lastMessage: string | null;
};

export const initialInvestmentState: InvestmentState = {
  holdings: [],
  lastMessage: null,
};

type PersistedAssetHolding = AssetHolding & { lastTransactionId?: string };

const cloneState = (state: InvestmentState): InvestmentState => ({
  holdings: state.holdings.map((holding) => {
    const persistedHolding = holding as PersistedAssetHolding;
    return {
      ...holding,
      lastReferenceId: persistedHolding.lastReferenceId ?? persistedHolding.lastTransactionId ?? "",
    };
  }),
  lastMessage: state.lastMessage,
});

export class InvestmentStore {
  private state: InvestmentState;
  private listeners = new Set<(state: InvestmentState, message?: string) => void>();

  constructor(
    private readonly executor: InvestmentOrderExecutor = createDemoInvestmentOrderExecutor(),
    seed: InvestmentState = initialInvestmentState,
  ) {
    this.state = cloneState(seed);
  }

  subscribe(listener: (state: InvestmentState, message?: string) => void) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return cloneState(this.state);
  }

  hydrate(nextState: InvestmentState) {
    this.state = cloneState(nextState);
    this.emit();
  }

  async buy(assetId: string, units: number): Promise<InvestmentOperationResult> {
    const asset = tokenizedAssets.find((item) => item.id === assetId);
    if (!asset) return this.fail("Tokenized asset not found");
    if (units <= 0) return this.fail("Enter a valid unit amount");

    const order = await this.executor.executeOrder(
      this.buildOrderRequest("buy", asset.referenceId, assetId, units),
    );
    if (!order.ok) return this.fail("Investment order could not be confirmed");

    const existing = this.state.holdings.find((holding) => holding.assetId === assetId);
    if (existing) {
      existing.averagePrice =
        (existing.averagePrice * existing.units + asset.unitPrice * units) / (existing.units + units);
      existing.units += units;
      existing.lastReferenceId = order.referenceId;
    } else {
      this.state.holdings.unshift({
        assetId,
        units,
        averagePrice: asset.unitPrice,
        lastReferenceId: order.referenceId,
      });
    }

    return this.ok(`Investment confirmed: ${units} ${asset.symbol} units bought`, order.referenceId);
  }

  async sell(assetId: string, units: number): Promise<InvestmentOperationResult> {
    const asset = tokenizedAssets.find((item) => item.id === assetId);
    if (!asset) return this.fail("Tokenized asset not found");
    if (units <= 0) return this.fail("Enter a valid unit amount");

    const existing = this.state.holdings.find((holding) => holding.assetId === assetId);
    if (!existing || existing.units < units) {
      return this.fail("Not enough tokenized asset units to sell");
    }

    const order = await this.executor.executeOrder(
      this.buildOrderRequest("sell", asset.referenceId, assetId, units),
    );
    if (!order.ok) return this.fail("Sell order could not be confirmed");

    existing.units -= units;
    existing.lastReferenceId = order.referenceId;
    this.state.holdings = this.state.holdings.filter((holding) => holding.units > 0);

    return this.ok(`Sell order confirmed: ${units} ${asset.symbol} units sold`, order.referenceId);
  }

  private buildOrderRequest(
    direction: "buy" | "sell",
    referenceId: string,
    assetId: string,
    units: number,
  ): InvestmentOrderRequest {
    return {
      direction,
      referenceId,
      assetId,
      amount: String(units),
    };
  }

  private ok(message: string, referenceId?: string): InvestmentOperationResult {
    this.state.lastMessage = message;
    this.emit(message);
    return { ok: true, message, referenceId };
  }

  private fail(message: string): InvestmentOperationResult {
    this.state.lastMessage = message;
    this.emit(message);
    return { ok: false, message };
  }

  private emit(message?: string) {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => listener(snapshot, message));
  }
}

export const createInvestmentStore = (executor?: InvestmentOrderExecutor, seed?: InvestmentState) =>
  new InvestmentStore(executor, seed);
