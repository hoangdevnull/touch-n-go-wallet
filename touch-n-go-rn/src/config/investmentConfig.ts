export type InvestmentExecutionMode = "demo" | "onchain";

export type InvestmentRuntimeConfig = {
  mode: InvestmentExecutionMode;
  rpcUrl?: string;
  privateKey?: string;
  userAccountId?: string;
  treasuryAccountId?: string;
};

export const investmentRuntimeConfig: InvestmentRuntimeConfig = {
  mode: process.env.EXPO_PUBLIC_INVESTMENT_EXECUTION_MODE === "onchain" ? "onchain" : "demo",
  rpcUrl: process.env.EXPO_PUBLIC_AST_RPC_URL,
  privateKey: process.env.EXPO_PUBLIC_AST_DEMO_PRIVATE_KEY,
  userAccountId: process.env.EXPO_PUBLIC_AST_USER_ACCOUNT_ID,
  treasuryAccountId: process.env.EXPO_PUBLIC_AST_TREASURY_ACCOUNT_ID,
};

export function assertOnchainInvestmentConfig(config: InvestmentRuntimeConfig) {
  const missing = [
    ["EXPO_PUBLIC_AST_RPC_URL", config.rpcUrl],
    ["EXPO_PUBLIC_AST_DEMO_PRIVATE_KEY", config.privateKey],
    ["EXPO_PUBLIC_AST_USER_ACCOUNT_ID", config.userAccountId],
    ["EXPO_PUBLIC_AST_TREASURY_ACCOUNT_ID", config.treasuryAccountId],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(`Missing on-chain investment config: ${missing.map(([key]) => key).join(", ")}`);
  }
}
