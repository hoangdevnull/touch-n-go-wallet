import type {
  AppState,
  OperationResult,
  TngCard,
  Transaction,
  TransactionType,
  TransitTicket,
  TransportType,
} from "../domain/types";

export const initialState: AppState = {
  wallet: {
    balance: 150,
    goplusBalance: 25.5,
    rewardPoints: 450,
  },
  transactions: [],
  cards: [],
  tickets: [],
};

const roundMoney = (value: number) => Math.round(value * 100) / 100;

const txReference = () =>
  `TXN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

const qrPayload = () =>
  `TNGTICKET-${Math.random().toString(36).slice(2, 14).toUpperCase()}`;

export class WalletStore {
  private state: AppState;
  private nextTransactionId = 1;
  private nextTicketId = 1;
  private listeners = new Set<(state: AppState, message?: string) => void>();

  constructor(seed: AppState = initialState) {
    this.state = {
      wallet: { ...seed.wallet },
      transactions: [...seed.transactions],
      cards: [...seed.cards],
      tickets: [...seed.tickets],
    };
    this.nextTransactionId =
      Math.max(0, ...this.state.transactions.map((tx) => tx.id)) + 1;
    this.nextTicketId = Math.max(0, ...this.state.tickets.map((ticket) => ticket.id)) + 1;
  }

  subscribe(listener: (state: AppState, message?: string) => void) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): AppState {
    return {
      wallet: { ...this.state.wallet },
      transactions: this.state.transactions.map((tx) => ({ ...tx })),
      cards: this.state.cards.map((card) => ({ ...card })),
      tickets: this.state.tickets.map((ticket) => ({ ...ticket })),
    };
  }

  hydrate(nextState: AppState) {
    this.state = {
      wallet: { ...nextState.wallet },
      transactions: nextState.transactions.map((tx) => ({ ...tx })),
      cards: nextState.cards.map((card) => ({ ...card })),
      tickets: nextState.tickets.map((ticket) => ({ ...ticket })),
    };
    this.nextTransactionId =
      Math.max(0, ...this.state.transactions.map((tx) => tx.id)) + 1;
    this.nextTicketId = Math.max(0, ...this.state.tickets.map((ticket) => ticket.id)) + 1;
    this.emit();
  }

  reloadWallet(amount: number): OperationResult {
    if (amount <= 0) return this.fail("Please enter a valid amount");
    this.state.wallet.balance = roundMoney(this.state.wallet.balance + amount);
    this.addTransaction("RELOAD", "Wallet Reload", "eWallet Top Up", amount, false);
    return this.ok(`Reloaded RM ${amount.toFixed(2)} successfully!`);
  }

  sendMoney(name: string, phone: string, amount: number): OperationResult {
    if (!name.trim() || !phone.trim() || amount <= 0) {
      return this.fail("Invalid transfer entries");
    }
    if (this.state.wallet.balance < amount) {
      return this.fail("Request failed. Insufficient wallet balance.");
    }
    this.state.wallet.balance = roundMoney(this.state.wallet.balance - amount);
    this.addTransaction(
      "TRANSFER",
      `Transfer to ${name}`,
      `Transfer to ${phone}`,
      amount,
      true,
    );
    return this.ok(`Sent RM ${amount.toFixed(2)} to ${name} successfully!`);
  }

  receiveMoney(sender: string, amount: number): OperationResult {
    if (!sender.trim() || amount <= 0) return this.fail("Invalid receive parameters");
    this.state.wallet.balance = roundMoney(this.state.wallet.balance + amount);
    this.addTransaction(
      "TRANSFER",
      `Received from ${sender}`,
      "Direct Peer Transfer",
      amount,
      false,
    );
    return this.ok(`Received RM ${amount.toFixed(2)} from ${sender}!`);
  }

  linkTngCard(cardNumber: string, cardName: string, balance: number): OperationResult {
    if (cardNumber.length < 5 || !cardName.trim()) {
      return this.fail("Please enter a valid card number and alias");
    }
    const card: TngCard = {
      cardNumber,
      cardName,
      balance: roundMoney(Math.max(0, balance)),
      isEnhanced: true,
      lastUpdated: Date.now(),
    };
    this.state.cards = [
      card,
      ...this.state.cards.filter((item) => item.cardNumber !== cardNumber),
    ];
    return this.ok(`Linked TNG Card '${cardName}' successfully!`);
  }

  removeTngCard(cardNumber: string): OperationResult {
    this.state.cards = this.state.cards.filter((card) => card.cardNumber !== cardNumber);
    return this.ok("Removed linked TNG Card.");
  }

  reloadPhysicalCard(cardNumber: string, amount: number): OperationResult {
    if (amount <= 0) return this.fail("Please enter a valid amount");
    if (this.state.wallet.balance < amount) {
      return this.fail("Reload failed. Insufficient wallet balance.");
    }
    this.state.wallet.balance = roundMoney(this.state.wallet.balance - amount);
    this.state.cards = this.state.cards.map((card) =>
      card.cardNumber === cardNumber
        ? { ...card, balance: roundMoney(card.balance + amount), lastUpdated: Date.now() }
        : card,
    );
    this.addTransaction("RELOAD", "TNG Card Reload", `Card: ${cardNumber}`, amount, true);
    return this.ok(`TNG Card ${cardNumber} reloaded with RM ${amount.toFixed(2)}!`);
  }

  buyTransitTicket(
    source: string,
    destination: string,
    type: TransportType,
    fare: number,
  ): OperationResult {
    if (source === destination) return this.fail("Source and destination cannot be identical");
    if (this.state.wallet.balance < fare) {
      return this.fail("Purchase failed. Insufficient wallet balance.");
    }
    const ticket: TransitTicket = {
      id: this.nextTicketId++,
      sourceStation: source,
      destinationStation: destination,
      transportType: type,
      fare: roundMoney(fare),
      timestamp: Date.now(),
      status: "ACTIVE",
      qrCodePayload: qrPayload(),
    };
    this.state.wallet.balance = roundMoney(this.state.wallet.balance - fare);
    this.state.tickets = [ticket, ...this.state.tickets];
    this.addTransaction(
      "TICKET_BUY",
      `${type} Ticket Purchase`,
      `${source} to ${destination}`,
      fare,
      true,
    );
    return this.ok(`Successfully purchased ${type} Ticket to ${destination}!`);
  }

  useTransitQR(fare: number): OperationResult {
    if (this.state.wallet.balance < fare) {
      return this.fail("Passage entry denied! Please top up your wallet.");
    }
    this.state.wallet.balance = roundMoney(this.state.wallet.balance - fare);
    this.addTransaction(
      "TRANSIT_QR",
      "Transit Tap Fare",
      "Gate QR Passage Auto-charge",
      fare,
      true,
    );
    return this.ok(`Transit QR gate passage approved! RM ${fare.toFixed(2)} charged.`);
  }

  markTicketUsed(id: number): OperationResult {
    this.state.tickets = this.state.tickets.map((ticket) =>
      ticket.id === id ? { ...ticket, status: "USED" } : ticket,
    );
    return this.ok("Ticket validated and used successfully!");
  }

  triggerGoPlusInvestment(amount: number, isWithdrawal: boolean): OperationResult {
    if (amount <= 0) return this.fail("Please enter a valid amount");
    if (!isWithdrawal && this.state.wallet.balance < amount) {
      return this.fail("Operation failed. Insufficient funds.");
    }
    if (isWithdrawal && this.state.wallet.goplusBalance < amount) {
      return this.fail("Operation failed. Insufficient funds.");
    }
    this.state.wallet.balance = roundMoney(
      this.state.wallet.balance + (isWithdrawal ? amount : -amount),
    );
    this.state.wallet.goplusBalance = roundMoney(
      this.state.wallet.goplusBalance + (isWithdrawal ? -amount : amount),
    );
    this.addTransaction(
      isWithdrawal ? "RELOAD" : "TRANSFER",
      isWithdrawal ? "Cash out from GO+" : "Transfer into GO+",
      isWithdrawal ? "Earn & Save Withdrawal" : "Auto-Yield Daily Savings",
      amount,
      !isWithdrawal,
    );
    const operation = isWithdrawal ? "withdrawn from GO+" : "invested into GO+";
    return this.ok(`RM ${amount.toFixed(2)} successfully ${operation}!`);
  }

  addRewardsPoints(points: number): OperationResult {
    this.state.wallet.rewardPoints += points;
    return this.ok(`Earned +${points} GO Rewards points!`);
  }

  showEventMessage(message: string): OperationResult {
    return this.ok(message);
  }

  private addTransaction(
    type: TransactionType,
    title: string,
    subtitle: string,
    amount: number,
    isExpense: boolean,
  ) {
    const transaction: Transaction = {
      id: this.nextTransactionId++,
      type,
      title,
      subtitle,
      amount: roundMoney(amount),
      isExpense,
      timestamp: Date.now(),
      reference: txReference(),
      status: "SUCCESS",
    };
    this.state.transactions = [transaction, ...this.state.transactions];
  }

  private ok(message: string): OperationResult {
    this.emit(message);
    return { ok: true, message };
  }

  private fail(message: string): OperationResult {
    this.emit(message);
    return { ok: false, message };
  }

  private emit(message?: string) {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => listener(snapshot, message));
  }
}

export const createWalletStore = (seed?: AppState) => new WalletStore(seed);
