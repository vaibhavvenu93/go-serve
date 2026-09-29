import type { DemoState } from "@/types";
import { hqForecast } from "@/data/demo-hq";

export const isPlaced = (state: DemoState) => !["CART", "CHECKOUT", "PAYMENT_PROCESSING"].includes(state.currentOrder.status);
export const hasLeftKitchen = (state: DemoState) => ["PICKED_UP", "OUT_FOR_DELIVERY", "ARRIVING", "DELIVERED"].includes(state.currentOrder.status);
export const prepDelay = (state: DemoState) => state.intelligenceScenario === "KITCHEN_DELAY" && !hasLeftKitchen(state) && state.kitchenState.rush?.heroReadyAtSecond == null ? 120 : 0;
export const arrivalDelay = (state: DemoState) => state.intelligenceScenario === "RIDER_DELAY" && !hasLeftKitchen(state) && state.riderMission?.kitchenArrivedAt == null ? 180 : 0;
export const coordinationForecast = (state: DemoState) => hqForecast.map(point => ({ ...point, riders: point.riders - (state.intelligenceScenario === "RIDER_SUPPLY" ? 4 : 0) }));
export const coordinationInventory = (state: DemoState) => state.inventory.items.map(item => item.id === "mint" && state.intelligenceScenario === "INVENTORY" ? { ...item, onHand: item.burnRate * 0.4, hoursRemaining: 0.4, status: "LOW" as const } : item);
