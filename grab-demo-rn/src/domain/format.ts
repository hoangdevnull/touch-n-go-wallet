export const money = (value: number) =>
  `$${value.toFixed(2)}`;

export const round = (value: number) =>
  Math.round(value * 100) / 100;

export const uuid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);
