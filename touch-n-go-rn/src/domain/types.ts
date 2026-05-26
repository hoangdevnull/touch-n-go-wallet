export type TransactionType = "RELOAD" | "TRANSFER" | "TRANSIT_QR" | "TICKET_BUY";
export type TicketStatus = "ACTIVE" | "USED" | "EXPIRED";
export type TransportType = "MRT" | "LRT" | "BUS";

export type WalletState = {
  balance: number;
  goplusBalance: number;
  rewardPoints: number;
};

export type Transaction = {
  id: number;
  type: TransactionType;
  title: string;
  subtitle: string;
  amount: number;
  isExpense: boolean;
  timestamp: number;
  reference: string;
  status: "SUCCESS";
};

export type TngCard = {
  cardNumber: string;
  cardName: string;
  balance: number;
  isEnhanced: boolean;
  lastUpdated: number;
};

export type TransitTicket = {
  id: number;
  sourceStation: string;
  destinationStation: string;
  transportType: TransportType;
  fare: number;
  timestamp: number;
  status: TicketStatus;
  qrCodePayload: string;
};

export type AppState = {
  wallet: WalletState;
  transactions: Transaction[];
  cards: TngCard[];
  tickets: TransitTicket[];
};

export type OperationResult = {
  ok: boolean;
  message: string;
};
