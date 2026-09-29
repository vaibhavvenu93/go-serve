import type { OrderStatus } from "@/types";
export const ORDER_STAGES = ["CART", "CHECKOUT", "PAYMENT_PROCESSING", "PAID", "CONFIRMED", "KITCHEN_ACCEPTED", "QUEUED", "PREPARING", "ASSEMBLING", "PACKING", "READY", "RIDER_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "ARRIVING", "DELIVERED"] as const satisfies readonly OrderStatus[];
export function nextOrderStatus(status: OrderStatus): OrderStatus | null { return ORDER_STAGES[ORDER_STAGES.indexOf(status) + 1] ?? null; }
export function canTransition(from: OrderStatus, to: OrderStatus): boolean { return nextOrderStatus(from) === to; }
