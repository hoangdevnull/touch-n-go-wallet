import { restaurants, rideServices } from "../domain/assets";
import { round, uuid } from "../domain/format";
import type { ActiveOrder, CartItem, GrabState, MenuItem, Restaurant, TokenHolding } from "../domain/types";

export const initialState: GrabState = {
  balance: 1000.00,
  rewardsPoints: 1420,
  activeOrders: [],
  pastOrders: [
    {
      id: uuid(),
      type: "RIDE",
      title: "JustGrab to Orchard Road 400",
      subtitle: "Completed • 25 May, 04:32 PM",
      statusText: "Completed",
      progress: 1.0,
      driverName: "David Tan",
      vehiclePlate: "SGB1234A",
      estimateMinutes: 0,
      cost: 14.50,
    },
    {
      id: uuid(),
      type: "FOOD",
      title: "McBurger Diner (Siam Plaza)",
      subtitle: "Completed • 24 May, 12:15 PM",
      statusText: "Delivered",
      progress: 1.0,
      driverName: "Somsak K.",
      vehiclePlate: "",
      estimateMinutes: 0,
      cost: 22.80,
    },
  ],
  selectedRestaurant: null,
  cart: {},
  selectedRideServiceId: "justgrab",
  tokenHoldings: [],
  announcement: null,
};

type Listener = (state: GrabState, message?: string) => void;

export class GrabStore {
  private state: GrabState;
  private listeners = new Set<Listener>();
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(seed: GrabState = initialState) {
    this.state = JSON.parse(JSON.stringify(seed));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  getState(): GrabState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // ── Balance ──────────────────────────────────────────────────────────────
  addBalance(amount: number) {
    this.state.balance = round(this.state.balance + amount);
    this.emit(`Added $${amount.toFixed(2)} to GrabPay`);
  }

  // ── Ride booking ─────────────────────────────────────────────────────────
  selectRideService(id: string) {
    this.state.selectedRideServiceId = id;
    this.emit();
  }

  confirmRide(destination: string) {
    const service = rideServices.find((s) => s.id === this.state.selectedRideServiceId);
    if (!service) return;
    const cost = service.baseFare;
    if (this.state.balance < cost) this.state.balance = round(this.state.balance + 50);

    this.state.balance = round(this.state.balance - cost);
    this.state.rewardsPoints += Math.floor(cost * 10);

    const order: ActiveOrder = {
      id: uuid(),
      type: "RIDE",
      title: `Ride with ${service.typeName}`,
      subtitle: `To: ${destination || "Orchard Towers Terminal"}`,
      statusText: "Locating nearby drivers...",
      progress: 0.1,
      driverName: "",
      vehiclePlate: "",
      estimateMinutes: service.durationMin,
      cost,
    };

    this.state.activeOrders = [...this.state.activeOrders, order];
    this.emit();

    this._simulateRide(order.id, destination || "Orchard Towers Terminal");
    return order.id;
  }

  private _simulateRide(id: string, destination: string) {
    const t = (ms: number, fn: () => void) => {
      const timer = setTimeout(fn, ms);
      this.timers.push(timer);
    };

    t(6000,  () => this._updateOrder(id, "Driver Assigned",  "John Doe is on the way",          0.25, "John Doe", "SGC9882X", 12));
    t(12000, () => this._updateOrder(id, "Driver Assigned",  "John Doe • 3 min away",            0.38, undefined, undefined, 3));
    t(20000, () => this._updateOrder(id, "Driver Arriving",  "John has arrived — please head down", 0.55, undefined, undefined, 2));
    t(28000, () => this._updateOrder(id, "On Trip",          `Heading to ${destination}`,        0.72, undefined, undefined, 8));
    t(38000, () => this._updateOrder(id, "On Trip",          `Almost there — 2 min to ${destination}`, 0.88, undefined, undefined, 2));
    t(48000, () => this._completeOrder(id));
  }

  // ── Food ─────────────────────────────────────────────────────────────────
  selectRestaurant(restaurant: Restaurant) {
    this.state.selectedRestaurant = restaurant;
    this.state.cart = {};
    this.emit();
  }

  deselectRestaurant() {
    this.state.selectedRestaurant = null;
    this.state.cart = {};
    this.emit();
  }

  addToCart(item: MenuItem) {
    const existing = this.state.cart[item.name];
    this.state.cart = {
      ...this.state.cart,
      [item.name]: existing
        ? { ...existing, count: existing.count + 1 }
        : { name: item.name, price: item.price, count: 1 },
    };
    this.emit();
  }

  removeFromCart(item: MenuItem) {
    const existing = this.state.cart[item.name];
    if (!existing) return;
    if (existing.count > 1) {
      this.state.cart = { ...this.state.cart, [item.name]: { ...existing, count: existing.count - 1 } };
    } else {
      const { [item.name]: _, ...rest } = this.state.cart;
      this.state.cart = rest;
    }
    this.emit();
  }

  getCartTotal(): number {
    return Object.values(this.state.cart).reduce((sum, item) => sum + item.price * item.count, 0);
  }

  checkoutFood() {
    const restaurant = this.state.selectedRestaurant;
    if (!restaurant) return;
    const total = round(this.getCartTotal() + restaurant.deliveryFee);
    if (this.state.balance < total) this.state.balance = round(this.state.balance + 50);

    this.state.balance = round(this.state.balance - total);
    this.state.rewardsPoints += Math.floor(total * 10);

    const order: ActiveOrder = {
      id: uuid(),
      type: "FOOD",
      title: restaurant.name,
      subtitle: "Food Order Delivery",
      statusText: "Confirming order with restaurant...",
      progress: 0.15,
      driverName: "Kenji S.",
      vehiclePlate: "",
      estimateMinutes: 25,
      cost: total,
    };

    this.state.activeOrders = [...this.state.activeOrders, order];
    this.state.cart = {};
    this.emit();

    this._simulateFood(order.id);
    return order.id;
  }

  private _simulateFood(id: string) {
    const t = (ms: number, fn: () => void) => {
      const timer = setTimeout(fn, ms);
      this.timers.push(timer);
    };

    t(5000,  () => this._updateOrder(id, "Order Confirmed",   "Restaurant accepted your order",            0.25, undefined, undefined, 22));
    t(14000, () => this._updateOrder(id, "Preparing Meal",   "Chef is preparing your items",              0.42, undefined, undefined, 16));
    t(24000, () => this._updateOrder(id, "Preparing Meal",   "Almost ready — packing your order",        0.55, undefined, undefined, 10));
    t(34000, () => this._updateOrder(id, "Rider Picking Up", "Kenji S. is collecting your order",        0.70, undefined, undefined, 8));
    t(44000, () => this._updateOrder(id, "Out for Delivery", "Kenji S. is 5 min away from you",          0.85, undefined, undefined, 5));
    t(54000, () => this._updateOrder(id, "Almost There",     "Kenji S. is 1 min away — get ready!",      0.95, undefined, undefined, 1));
    t(62000, () => this._completeOrder(id));
  }

  // ── Token Assets ─────────────────────────────────────────────────────────
  buyTokenAsset(assetId: string, unitPrice: number, units: number): { ok: boolean; message: string } {
    const cost = round(unitPrice * units);
    if (units <= 0) return { ok: false, message: "Enter a valid number of units." };
    if (this.state.balance < cost)
      return { ok: false, message: `Insufficient balance. Need $${cost.toFixed(2)}.` };

    this.state.balance = round(this.state.balance - cost);

    const existing = this.state.tokenHoldings.find((h) => h.assetId === assetId);
    if (existing) {
      const totalUnits = existing.units + units;
      const avgPrice = round((existing.units * existing.averagePrice + units * unitPrice) / totalUnits);
      this.state.tokenHoldings = this.state.tokenHoldings.map((h) =>
        h.assetId === assetId ? { ...h, units: totalUnits, averagePrice: avgPrice } : h
      );
    } else {
      this.state.tokenHoldings = [
        ...this.state.tokenHoldings,
        { assetId, units, averagePrice: unitPrice },
      ];
    }

    this.emit(`Purchased ${units} unit${units > 1 ? "s" : ""} for $${cost.toFixed(2)}`);
    return { ok: true, message: `Purchased ${units} unit${units > 1 ? "s" : ""} for $${cost.toFixed(2)}` };
  }

  sellTokenAsset(assetId: string, unitPrice: number, units: number): { ok: boolean; message: string } {
    if (units <= 0) return { ok: false, message: "Enter a valid number of units." };
    const holding = this.state.tokenHoldings.find((h) => h.assetId === assetId);
    if (!holding || holding.units < units)
      return { ok: false, message: `You only hold ${holding?.units ?? 0} units.` };

    const proceeds = round(unitPrice * units);
    this.state.balance = round(this.state.balance + proceeds);

    const newUnits = holding.units - units;
    if (newUnits === 0) {
      this.state.tokenHoldings = this.state.tokenHoldings.filter((h) => h.assetId !== assetId);
    } else {
      this.state.tokenHoldings = this.state.tokenHoldings.map((h) =>
        h.assetId === assetId ? { ...h, units: newUnits } : h
      );
    }

    this.emit(`Sold ${units} unit${units > 1 ? "s" : ""} for $${proceeds.toFixed(2)}`);
    return { ok: true, message: `Sold ${units} unit${units > 1 ? "s" : ""} for $${proceeds.toFixed(2)}` };
  }

  // ── Announcement ─────────────────────────────────────────────────────────
  showAnnouncement(message: string) {
    this.state.announcement = message;
    this.emit();
  }

  dismissAnnouncement() {
    this.state.announcement = null;
    this.emit();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  clearTrackingOrder() {
    this.emit();
  }

  private _updateOrder(
    id: string,
    statusText: string,
    subtitle: string,
    progress: number,
    driverName?: string,
    vehiclePlate?: string,
    estimateMinutes?: number
  ) {
    this.state.activeOrders = this.state.activeOrders.map((o) =>
      o.id === id
        ? {
            ...o,
            statusText,
            subtitle,
            progress,
            driverName: driverName ?? o.driverName,
            vehiclePlate: vehiclePlate ?? o.vehiclePlate,
            estimateMinutes: estimateMinutes ?? o.estimateMinutes,
          }
        : o
    );
    this.emit();
  }

  private _completeOrder(id: string) {
    const order = this.state.activeOrders.find((o) => o.id === id);
    if (!order) return;
    const completed: ActiveOrder = { ...order, statusText: "Completed", progress: 1.0, subtitle: "Completed" };
    this.state.activeOrders = this.state.activeOrders.filter((o) => o.id !== id);
    this.state.pastOrders = [completed, ...this.state.pastOrders];
    this.emit("Order completed!");
  }

  private emit(message?: string) {
    const snapshot = this.getState();
    this.listeners.forEach((l) => l(snapshot, message));
  }

  destroy() {
    this.timers.forEach(clearTimeout);
  }
}

export const createGrabStore = (seed?: GrabState) => new GrabStore(seed);
