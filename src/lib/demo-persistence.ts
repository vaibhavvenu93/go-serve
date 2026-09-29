import type { DemoState } from "@/types";
import { ORDER_STAGES } from "./order-state";
export const DEMO_STORAGE_KEY = "go-serve-v1-demo";
export function serializeDemo(state: DemoState) { return JSON.stringify({ schema: 1, state }); }
/** Reject incompatible/corrupt data before it can become the shared transaction. */
export function deserializeDemo(raw: string | null): DemoState | null {
  if (!raw) return null;
  try {
    const envelope = JSON.parse(raw), state = envelope.state as DemoState;
    if (envelope.schema !== 1 || state?.version !== 1 || state.currentOrder?.id !== "GS-2847" || !ORDER_STAGES.includes(state.currentOrder.status)) return null;
    if (!Array.isArray(state.currentOrder.items) || !state.currentOrder.items.length || !Array.isArray(state.orderEvents) || !Array.isArray(state.riders) || !Array.isArray(state.inventory?.items) || !state.customer?.name || !state.kitchenState || !state.networkMetrics || !state.cart?.items) return null;
    if (![state.currentOrder.createdAt, state.currentOrder.updatedAt].every(at => Number.isFinite(Date.parse(at))) || !Number.isFinite(state.currentOrder.promisedSeconds)) return null;
    if (state.kitchenState.rush && (!Number.isFinite(state.kitchenState.rush.elapsedSeconds) || !Array.isArray(state.kitchenState.rush.jobs))) return null;
    if (state.riderMission && (!Number.isFinite(state.riderMission.elapsedSeconds) || !["idle","assigned","to_kitchen","at_kitchen","picked_up","to_customer","arrived_customer","handoff","delivered"].includes(state.riderMission.stage))) return null;
    if (state.intelligenceScenario && !["BASELINE","KITCHEN_DELAY","RIDER_DELAY","RIDER_SUPPLY","INVENTORY"].includes(state.intelligenceScenario)) return null;
    if (state.decisionHistory && !Array.isArray(state.decisionHistory)) return null;
    return state;
  } catch { return null; }
}
