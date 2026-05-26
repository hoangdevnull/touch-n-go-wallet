import {
  demoInvestmentAccounts,
  tokenizedAssets,
} from "../domain/investments";
import type {
  AssetHolding,
  InvestmentOperationResult,
  InvestmentTransferRequest,
} from "../domain/investments";
import { createDemoOnchainTransferExecutor } from "../services/investmentTransfer";
import type { InvestmentTransferExecutor } from "../services/investmentTransfer";

export type InvestmentState = {
  holdings: AssetHolding[];
  lastMessage: string | null;
};

export const initialInvestmentState: InvestmentState = {
  holdings: [],
  lastMessage: null,
};

const cloneState = (state: InvestmentState): InvestmentState => ({
  holdings: state.holdings.map((holding) => ({ ...holding })),
  lastMessage: state.lastMessage,
});

export class InvestmentStore {
  private state: InvestmentState;
  private listeners = new Set<(state: InvestmentState, message?: string) => void>();

  constructor(
    private readonly executor: InvestmentTransferExecutor = createDemoOnchainTransferExecutor(),
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

    const transfer = await this.executor.executeTransfer(
      this.buildTransferRequest("buy", asset.securityId, assetId, units),
    );
    if (!transfer.ok) return this.fail("On-chain buy transfer failed");

    const existing = this.state.holdings.find((holding) => holding.assetId === assetId);
    if (existing) {
      existing.averagePrice =
        (existing.averagePrice * existing.units + asset.unitPrice * units) / (existing.units + units);
      existing.units += units;
      existing.lastTransactionId = transfer.transactionId;
    } else {
      this.state.holdings.unshift({
        assetId,
        units,
        averagePrice: asset.unitPrice,
        lastTransactionId: transfer.transactionId,
      });
    }

    return this.ok(`Bought ${units} ${asset.symbol} units on-chain`, transfer.transactionId);
  }

  async sell(assetId: string, units: number): Promise<InvestmentOperationResult> {
    const asset = tokenizedAssets.find((item) => item.id === assetId);
    if (!asset) return this.fail("Tokenized asset not found");
    if (units <= 0) return this.fail("Enter a valid unit amount");

    const existing = this.state.holdings.find((holding) => holding.assetId === assetId);
    if (!existing || existing.units < units) {
      return this.fail("Not enough tokenized asset units to sell");
    }

    const transfer = await this.executor.executeTransfer(
      this.buildTransferRequest("sell", asset.securityId, assetId, units),
    );
    if (!transfer.ok) return this.fail("On-chain sell transfer failed");

    existing.units -= units;
    existing.lastTransactionId = transfer.transactionId;
    this.state.holdings = this.state.holdings.filter((holding) => holding.units > 0);

    return this.ok(`Sold ${units} ${asset.symbol} units on-chain`, transfer.transactionId);
  }

  private buildTransferRequest(
    direction: "buy" | "sell",
    securityId: string,
    assetId: string,
    units: number,
  ): InvestmentTransferRequest {
    const buy = direction === "buy";
    return {
      direction,
      securityId,
      assetId,
      sourceAccountId: buy ? demoInvestmentAccounts.treasuryAccountId : demoInvestmentAccounts.userAccountId,
      targetAccountId: buy ? demoInvestmentAccounts.userAccountId : demoInvestmentAccounts.treasuryAccountId,
      amount: String(units),
    };
  }

  private ok(message: string, transactionId?: string): InvestmentOperationResult {
    this.state.lastMessage = message;
    this.emit(message);
    return { ok: true, message, transactionId };
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

export const createInvestmentStore = (executor?: InvestmentTransferExecutor, seed?: InvestmentState) =>
  new InvestmentStore(executor, seed);
