export const money = (value: number) => `RM ${value.toFixed(2)}`;

export const shortDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

export const fareForStations = (stations: string[], source: string, destination: string) => {
  const sourceIndex = stations.indexOf(source);
  const destinationIndex = stations.indexOf(destination);
  const hops = Math.abs(sourceIndex - destinationIndex);
  return hops === 0 ? 1.2 : 1.2 + hops * 0.8;
};
