import type { DemoState } from "@/types";
import { selectIntelligence } from "./intelligence-selectors";
import { kitchenTime } from "./kitchen-rush";
import { isPlaced } from "./coordination";
export function selectCustomerOrder(state: DemoState) {
  const data = selectIntelligence(state), status = state.currentOrder.status;
  const stage = status === "DELIVERED" ? "Delivered" : status === "ARRIVING" ? "Ravi is here" : ["PICKED_UP", "OUT_FOR_DELIVERY"].includes(status) ? "On the way" : ["READY", "RIDER_ASSIGNED"].includes(status) ? "Ready for pickup" : ["ASSEMBLING", "PACKING"].includes(status) ? "Finishing your bowl" : status === "PREPARING" ? "Cooking your dinner" : "Order accepted";
  return { placed: isPlaced(state), completed: data.completed, stage, promise: data.promiseAt === null ? null : kitchenTime(data.promiseAt, true), estimate: data.deliveryAt === null ? null : kitchenTime(data.deliveryAt, true), minutes: data.deliveryAt === null ? null : Math.max(0, Math.ceil((data.deliveryAt - data.now) / 60)), delayed: (data.margin ?? 0) < 0, dish: data.hq.hero.dish, customer: data.hq.hero.customer, rider: data.hq.hero.rider };
}
