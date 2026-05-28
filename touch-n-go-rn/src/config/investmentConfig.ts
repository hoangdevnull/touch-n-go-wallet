export type InvestmentExecutionMode = "demo";

export type InvestmentRuntimeConfig = {
  mode: InvestmentExecutionMode;
};

export const investmentRuntimeConfig: InvestmentRuntimeConfig = {
  mode: "demo",
};
