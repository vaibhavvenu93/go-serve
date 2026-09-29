import { progressDemo, applyRecommendation, recordDecision, atClock, demoStepLabel } from "./demo-orchestration";
import { riderTiming } from "./rider-mission";
import { riderReducer } from "./rider-mission";
import type { RiderAction } from "@/types/rider";
import type { DemoState, OrderStatus } from "@/types";
import { demoCart, demoCustomer, demoKitchen, demoOrder, SIMULATED_AT } from "@/data/demo-orders";
import { demoRiders } from "@/data/demo-riders";
import { demoInventory } from "@/data/demo-inventory";
import { baseNetworkMetrics } from "@/data/demo-analytics";
import { canTransition, nextOrderStatus } from "./order-state";
import { kitchenReducer, type KitchenAction } from "./kitchen-rush";

export type DemoAction =
  | { type: "RESTORE_DEMO"; state: DemoState }
  | { type: "DEMO_NEXT" }
  | { type: "DEMO_CLOCK" }
  | { type: "APPLY_RECOMMENDATION"; expected: string }
  | { type: "SET_INTELLIGENCE_SCENARIO"; scenario: import("@/types/intelligence").IntelligenceScenario }
  | { type: "RESET" }
  | { type: "ADVANCE" }
  | { type: "SET_STATUS"; status: OrderStatus }
  | { type: "ASSIGN_RIDER"; riderId: string }
  | KitchenAction | RiderAction;

/** A fresh graph on every call: a reset never reuses mutated fixture objects. */
export function createInitialDemoState(): DemoState {
  return structuredClone({ version: 1, simulatedAt: SIMULATED_AT, customer: demoCustomer, kitchen: demoKitchen, cart: demoCart, currentOrder: demoOrder, orderEvents: [{ id: "GS-2847-event-0", orderId: demoOrder.id, status: "CART", occurredAt: SIMULATED_AT, actor: "CUSTOMER", note: "Demo cart configured" }], riders: demoRiders, deliveryAssignment: null, kitchenState: { kitchenId: demoKitchen.id, mode: "DINNER_RUSH", activeOrderIds: ["GS-2844"], completedToday: 247 }, inventory: { kitchenId: demoKitchen.id, items: demoInventory, updatedAt: SIMULATED_AT, consumedOrderIds: [] }, networkMetrics: baseNetworkMetrics, alerts: [{ id: "alert-mint", severity: "ATTENTION", category: "INVENTORY", title: "Mint chutney is running low", entityId: "mint", createdAt: SIMULATED_AT }] } satisfies DemoState);
}

/** Cluster 0 contract only. No timers, dispatch, payment gateway, metrics or stock effects.
 * Invalid/repeated actions are identity no-ops. Later clusters add domain effects here. */
function transition(state: DemoState, status: OrderStatus): DemoState {
  if (!canTransition(state.currentOrder.status, status)) return state;
  if (status === "RIDER_ASSIGNED" && !state.deliveryAssignment) return state;
  const eventIndex = state.orderEvents.length;
  // Deterministic event clock, deliberately not a delivery-time simulation.
  const at = new Date(Math.max(Date.parse(SIMULATED_AT) + eventIndex * 1000, Date.parse(state.currentOrder.updatedAt) + 1000)).toISOString();
  const payment = status === "PAYMENT_PROCESSING" ? { status: "PROCESSING" as const } : status === "PAID" ? { status: "PAID" as const, simulatedReference: "SIM-GS-2847", amount: state.currentOrder.total } : state.currentOrder.payment;
  const deliveryAssignment = state.deliveryAssignment ? { ...state.deliveryAssignment, pickedUpAt: status === "PICKED_UP" ? at : state.deliveryAssignment.pickedUpAt, deliveredAt: status === "DELIVERED" ? at : state.deliveryAssignment.deliveredAt } : null;
  const riders = state.riders.map(rider => {
    if (rider.id !== deliveryAssignment?.riderId) return rider;
    if (status === "PICKED_UP") return { ...rider, status: "DELIVERING" as const };
    if (status === "DELIVERED") return { ...rider, status: "AVAILABLE" as const, currentOrder: null };
    return rider;
  });
  const activeOrderIds = status === "KITCHEN_ACCEPTED" ? [...state.kitchenState.activeOrderIds, state.currentOrder.id] : status === "PICKED_UP" ? state.kitchenState.activeOrderIds.filter(id => id !== state.currentOrder.id) : state.kitchenState.activeOrderIds;
  return { ...state, riders, deliveryAssignment, kitchenState: { ...state.kitchenState, activeOrderIds }, currentOrder: { ...state.currentOrder, status, payment, updatedAt: at, deliveredAt: status === "DELIVERED" ? at : null }, orderEvents: [...state.orderEvents, { id: `${state.currentOrder.id}-event-${eventIndex}`, orderId: state.currentOrder.id, status, occurredAt: at, actor: "SYSTEM", note: `Simulated ${status.toLowerCase().replaceAll("_", " ")}` }] };
}

function reduceAction(state: DemoState, action: DemoAction): DemoState {
  if (action.type.startsWith("RIDER_")) return riderReducer(state, action as RiderAction);
  switch (action.type) {
    case "RESTORE_DEMO": return action.state;
    case "DEMO_NEXT": return progressDemo(state);
    case "DEMO_CLOCK": return state.kitchenState.rush ? atClock(state, riderTiming(state).now + 30) : state;
    case "APPLY_RECOMMENDATION": return applyRecommendation(state, action.expected);
    case "SET_INTELLIGENCE_SCENARIO": {
      if ((state.intelligenceScenario ?? "BASELINE") === action.scenario) return state;
      const next = { ...state };
      if (action.scenario === "BASELINE") delete next.intelligenceScenario;
      else next.intelligenceScenario = action.scenario;
      return next;
    }
    case "OPEN_KITCHEN_RUSH":
    case "KITCHEN_TICK":
    case "TOGGLE_KITCHEN_CLOCK":
    case "ADVANCE_KITCHEN_JOB": return kitchenReducer(state, action);
    default: return state;
    case "RESET": return createInitialDemoState();
    case "SET_STATUS": return transition(state, action.status);
    case "ADVANCE": { const next = nextOrderStatus(state.currentOrder.status); return next ? transition(state, next) : state; }
    case "ASSIGN_RIDER": {
      if (state.currentOrder.status !== "READY" || state.deliveryAssignment) return state;
      const rider = state.riders.find(candidate => candidate.id === action.riderId && candidate.status === "AVAILABLE" && candidate.currentOrder === null);
      if (!rider) return state;
      const at = new Date(Math.max(Date.parse(SIMULATED_AT) + state.orderEvents.length * 1000, Date.parse(state.currentOrder.updatedAt) + 1000)).toISOString();
      return transition({ ...state, deliveryAssignment: { orderId: state.currentOrder.id, riderId: rider.id, assignedAt: at, pickedUpAt: null, deliveredAt: null }, riders: state.riders.map(candidate => candidate.id === rider.id ? { ...candidate, status: "ASSIGNED", currentOrder: state.currentOrder.id } : candidate) }, "RIDER_ASSIGNED");
    }
  }
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  const next = reduceAction(state, action);
  if (["RESET", "RESTORE_DEMO", "KITCHEN_TICK", "TOGGLE_KITCHEN_CLOCK"].includes(action.type)) return next;
  return recordDecision(state, next, action.type === "APPLY_RECOMMENDATION" ? "Recommendation applied" : action.type === "SET_INTELLIGENCE_SCENARIO" ? "Scenario changed" : action.type === "DEMO_CLOCK" ? "Simulation advanced 30s" : action.type === "DEMO_NEXT" ? demoStepLabel(state) ?? "Journey complete" : action.type === "OPEN_KITCHEN_RUSH" ? "Customer order accepted" : action.type === "ADVANCE_KITCHEN_JOB" ? `Kitchen advanced ${action.id} from ${action.expectedStage.toLowerCase()}` : action.type.replaceAll("_", " ").toLowerCase());
}
