import type { InvestmentTransferRequest, InvestmentTransferResult } from "../domain/investments";
import { assertOnchainInvestmentConfig, investmentRuntimeConfig } from "../config/investmentConfig";

export type InvestmentTransferExecutor = {
  executeTransfer: (request: InvestmentTransferRequest) => Promise<InvestmentTransferResult>;
};

export const createDemoOnchainTransferExecutor = (): InvestmentTransferExecutor => ({
  async executeTransfer(request) {
    if (investmentRuntimeConfig.mode === "onchain") {
      assertOnchainInvestmentConfig(investmentRuntimeConfig);

      throw new Error(
        [
          "On-chain investment mode is configured, but the mobile AST SDK executor is not linked yet.",
          `TransferRequest: securityId=${request.securityId}, targetId=${request.targetAccountId}, amount=${request.amount}`,
          "Wire this executor to @hashgraph/asset-tokenization-sdk Security.transfer once the SDK package is bundled for React Native.",
        ].join(" "),
      );
    }

    const suffix = `${Date.now()}-${request.direction}-${request.assetId}`;

    return {
      ok: true,
      transactionId: `demo-onchain-${suffix}`,
    };
  },
});
