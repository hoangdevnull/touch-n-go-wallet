export type GrabTab = "home" | "activity" | "payment" | "messages" | "account";

export type GrabScreen = "main" | "ride-booking" | "food-home" | "food-restaurant" | "order-tracking" | "token-assets";

export type OrderType = "RIDE" | "FOOD";

export interface ActiveOrder {
  id: string;
  type: OrderType;
  title: string;
  subtitle: string;
  statusText: string;
  progress: number;
  driverName: string;
  vehiclePlate: string;
  estimateMinutes: number;
  cost: number;
}

export interface CartItem {
  name: string;
  price: number;
  count: number;
}

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  category: string;
  deliveryTime: string;
  distance: string;
  deliveryFee: number;
  promoLabel: string;
  bannerColorStart: string;
  bannerColorEnd: string;
  menu: MenuItem[];
}

export interface RideService {
  id: string;
  typeName: string;
  seatCount: number;
  icon: string;
  baseFare: number;
  durationMin: number;
  description: string;
}

export interface TokenAsset {
  id: string;
  name: string;
  symbol: string;
  issuer: string;
  referenceId: string;
  unitPrice: number;
  minimumInvestment: number;
  projectedYield: string;
  assetType: string;
  jurisdiction: string;
  risk: "Low" | "Medium";
}

export interface TokenHolding {
  assetId: string;
  units: number;
  averagePrice: number;
}

export interface GrabState {
  balance: number;
  rewardsPoints: number;
  activeOrders: ActiveOrder[];
  pastOrders: ActiveOrder[];
  selectedRestaurant: Restaurant | null;
  cart: Record<string, CartItem>;
  selectedRideServiceId: string;
  tokenHoldings: TokenHolding[];
  announcement: string | null;
}
