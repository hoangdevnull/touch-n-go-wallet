export type TokenizedAsset = {
  id: string;
  name: string;
  issuer: string;
  securityId: string;
  symbol: string;
  unitPrice: number;
  projectedYield: string;
  risk: "Low" | "Medium";
};

export type AssetHolding = {
  assetId: string;
  units: number;
  averagePrice: number;
  lastTransactionId: string;
};

export type InvestmentTransferDirection = "buy" | "sell";

export type InvestmentTransferRequest = {
  direction: InvestmentTransferDirection;
  securityId: string;
  sourceAccountId: string;
  targetAccountId: string;
  amount: string;
  assetId: string;
};

export type InvestmentTransferResult = {
  ok: boolean;
  transactionId: string;
};

export type InvestmentOperationResult = {
  ok: boolean;
  message: string;
  transactionId?: string;
};

export const demoInvestmentAccounts = {
  userAccountId: "0.0.8001",
  treasuryAccountId: "0.0.9001",
};

export const tokenizedAssets: TokenizedAsset[] = [
  {
    id: "bpmb-green-bond",
    name: "BPMB Green Bond 2028",
    issuer: "AST Bank",
    securityId: "0.0.61001",
    symbol: "BGB28",
    unitPrice: 10,
    projectedYield: "4.8% p.a.",
    risk: "Low",
  },
  {
    id: "kl-infra-income",
    name: "KL Infra Income Note",
    issuer: "AST Bank",
    securityId: "0.0.61002",
    symbol: "KLIN",
    unitPrice: 25,
    projectedYield: "5.2% p.a.",
    risk: "Medium",
  },
];
