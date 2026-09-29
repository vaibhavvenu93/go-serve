/** All money is stored in integer paise; durations in seconds; distances in metres. */
export type Money = number;
export type ISODateTime = string;
export interface Coordinates { lat: number; lng: number }
export interface Address { id: string; label: "Home" | "Work" | "Other"; line1: string; locality: string; city: string; state: string; postalCode: string; location: Coordinates; instructions?: string }
export interface Customer { id: string; name: string; addresses: Address[]; defaultAddressId: string }
export interface Kitchen { id: string; name: string; zone: string; location: Coordinates; serviceRadiusMetres: number; status: "OPEN" | "PAUSED" | "CLOSED" }
export type MenuCategory = "BOWLS" | "BIRYANI" | "SOUTH_INDIAN" | "DRINKS";
export interface MenuVariant { id: string; name: string; priceDelta: Money }
export interface Addon { id: string; name: string; price: Money; available: boolean }
export interface FoodImage { src: string | null; alt: string; width: number; height: number; treatment: "PLACEHOLDER" | "PHOTOGRAPH" }
export interface MenuItem { id: string; name: string; description: string; category: MenuCategory; price: Money; vegetarian: boolean; rating: number; prepMinutes: number; deliveryMinutes: number; popular: boolean; image: FoodImage; available: boolean; tags: string[]; variants: MenuVariant[]; addons: Addon[] }
export type SpiceLevel = "MILD" | "MEDIUM" | "HOT";
export interface CartItem { id: string; menuItemId: string; quantity: number; variantId: string; spiceLevel: SpiceLevel; addonIds: string[] }
export interface Cart { id: string; customerId: string; kitchenId: string; items: CartItem[] }
export type OrderStatus = "CART" | "CHECKOUT" | "PAYMENT_PROCESSING" | "PAID" | "CONFIRMED" | "KITCHEN_ACCEPTED" | "QUEUED" | "PREPARING" | "ASSEMBLING" | "PACKING" | "READY" | "RIDER_ASSIGNED" | "PICKED_UP" | "OUT_FOR_DELIVERY" | "ARRIVING" | "DELIVERED";
export interface OrderItem { id: string; menuItemId: string; name: string; quantity: number; basePrice: Money; variant: MenuVariant; spiceLevel: SpiceLevel; addons: Addon[]; lineTotal: Money }
export type PaymentState = { status: "UNPAID" } | { status: "PROCESSING" } | { status: "PAID"; simulatedReference: string; amount: Money };
export interface Order { id: string; customerId: string; kitchenId: string; address: Address; items: OrderItem[]; subtotal: Money; deliveryFee: Money; total: Money; status: OrderStatus; payment: PaymentState; createdAt: ISODateTime; updatedAt: ISODateTime; promisedSeconds: number; deliveredAt: ISODateTime | null }
export interface OrderEvent { id: string; orderId: string; status: OrderStatus; occurredAt: ISODateTime; actor: "CUSTOMER" | "KITCHEN" | "RIDER" | "SYSTEM"; note: string }
export type KitchenState = { kitchenId: string; mode: "DINNER_RUSH" | "STEADY" | "PAUSED"; activeOrderIds: string[]; completedToday: number; rush?: import("./kitchen").KitchenRushState };
export type RiderState = "AVAILABLE" | "ASSIGNED" | "AT_KITCHEN" | "DELIVERING" | "ON_BREAK";
export interface Rider { id: string; name: string; initials: string; status: RiderState; distanceFromKitchen: number; currentOrder: string | null; rating: number; deliveriesToday: number; utilisation: number; location: Coordinates; vehicle: "ELECTRIC_SCOOTER" | "MOTORCYCLE" | "BICYCLE" }
export interface DeliveryAssignment { orderId: string; riderId: string; assignedAt: ISODateTime; pickedUpAt: ISODateTime | null; deliveredAt: ISODateTime | null }
export type InventoryStatus = "HEALTHY" | "ATTENTION" | "LOW";
export interface InventoryItem { id: string; name: string; unit: "kg" | "litre" | "piece"; onHand: number; parLevel: number; burnRate: number; hoursRemaining: number; status: InventoryStatus; cost: Money }
export interface InventoryState { kitchenId: string; items: InventoryItem[]; updatedAt: ISODateTime; consumedOrderIds: string[] }
export interface NetworkMetrics { ordersToday: number; gmv: Money; aov: Money; averageDeliverySeconds: number; sla: number; activeRiders: number }
export interface OperationalAlert { id: string; severity: "INFO" | "ATTENTION" | "CRITICAL"; category: "INVENTORY" | "ORDER" | "RIDER"; title: string; entityId: string; createdAt: ISODateTime }
export interface AnalyticsPoint { hour: string; orders: number; gmv: Money; averageDeliverySeconds: number; sla: number; kitchenThroughput: number; demand: number; riderUtilisation: number }
export interface DemoState { decisionHistory?: import("./coordination").DecisionEvent[]; intelligenceScenario?: import("./intelligence").IntelligenceScenario; riderMission?: import("./rider").RiderMission; version: 1; simulatedAt: ISODateTime; customer: Customer; kitchen: Kitchen; cart: Cart; currentOrder: Order; orderEvents: OrderEvent[]; riders: Rider[]; deliveryAssignment: DeliveryAssignment | null; kitchenState: KitchenState; inventory: InventoryState; networkMetrics: NetworkMetrics; alerts: OperationalAlert[] }
