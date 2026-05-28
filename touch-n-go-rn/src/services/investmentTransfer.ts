import type { InvestmentOrderRequest, InvestmentOrderResult } from "../domain/investments";

export type InvestmentOrderExecutor = {
  executeOrder: (request: InvestmentOrderRequest) => Promise<InvestmentOrderResult>;
};

export const createDemoInvestmentOrderExecutor = (): InvestmentOrderExecutor => ({
  async executeOrder(request) {
    const suffix = `${Date.now()}-${request.direction}-${request.assetId}`;

    return {
      ok: true,
      referenceId: `demo-order-${suffix}`,
    };
  },
});
