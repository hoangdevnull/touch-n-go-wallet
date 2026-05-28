export type TokenizedAsset = {
  id: string;
  name: string;
  issuer: string;
  referenceId: string;
  symbol: string;
  unitPrice: number;
  minimumInvestment: number;
  projectedYield: string;
  assetType: string;
  jurisdiction: string;
  risk: "Low" | "Medium";
};

export type AssetHolding = {
  assetId: string;
  units: number;
  averagePrice: number;
  lastReferenceId: string;
};

export type InvestmentOrderDirection = "buy" | "sell";

export type InvestmentOrderRequest = {
  direction: InvestmentOrderDirection;
  referenceId: string;
  amount: string;
  assetId: string;
};

export type InvestmentOrderResult = {
  ok: boolean;
  referenceId: string;
};

export type InvestmentOperationResult = {
  ok: boolean;
  message: string;
  referenceId?: string;
};

export const tokenizedAssets: TokenizedAsset[] = [
  {
    id: "petronas-station-sukuk",
    name: "Sukuk RWA - Petronas Petrol Station",
    issuer: "Bank Pembangunan Malaysia",
    referenceId: "BPMB-SUKUK-RWA-001",
    symbol: "PET-SK01",
    unitPrice: 10,
    minimumInvestment: 10,
    projectedYield: "5.1% p.a.",
    assetType: "Islamic bond",
    jurisdiction: "Malaysia",
    risk: "Low",
  },
  {
    id: "bpmb-green-infra-note",
    name: "BPMB Green Infrastructure Note",
    issuer: "Bank Pembangunan Malaysia",
    referenceId: "BPMB-RWA-002",
    symbol: "BGI-02",
    unitPrice: 25,
    minimumInvestment: 25,
    projectedYield: "5.2% p.a.",
    assetType: "Tokenized note",
    jurisdiction: "Malaysia",
    risk: "Medium",
  },
];
