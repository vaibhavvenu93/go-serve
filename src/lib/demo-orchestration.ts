import type { DemoState } from "@/types";
import { kitchenReducer, getKitchenJobs } from "./kitchen-rush";
import { getRiderMission, riderReducer, riderTiming } from "./rider-mission";
import { isPlaced, prepDelay, arrivalDelay } from "./coordination";
import { selectIntelligence } from "./intelligence-selectors";
import { KITCHEN_EPOCH } from "@/data/demo-kitchen";

export function demoStepLabel(state: DemoState) {
  const status = state.currentOrder.status, mission = getRiderMission(state);
  if (!isPlaced(state) || !state.kitchenState.rush) return "Place GS-2847";
  if (status === "QUEUED") return "Start preparation";
  if (mission.stage === "assigned") return "Assign Ravi to pickup";
  if (status === "PREPARING") return "Mark assembling";
  if (status === "ASSEMBLING") return "Mark packing";
  if (status === "PACKING" && mission.stage === "to_kitchen" && riderTiming(state).arrival <= selectIntelligence(state).foodAt!) return "Rider arrives at kitchen";
  if (status === "PACKING") return "Food ready";
  if (mission.stage === "to_kitchen") return "Rider arrives at kitchen";
  if (mission.stage === "at_kitchen") return "Confirm pickup";
  if (mission.stage === "picked_up") return "Out for delivery";
  if (mission.stage === "to_customer") return "Customer arrival";
  if (mission.stage === "arrived_customer") return "Begin handoff";
  if (mission.stage === "handoff") return "Verify 2847 · delivered";
  if (mission.stage === "delivered") return "Return Ravi to shift";
  return null;
}
export function atClock(state: DemoState, target: number): DemoState {
  const now = Math.max(riderTiming(state).now, target);
  return { ...state, ...(state.riderMission ? { riderMission: { ...state.riderMission, elapsedSeconds: now } } : {}), kitchenState: { ...state.kitchenState, ...(state.kitchenState.rush ? { rush: { ...state.kitchenState.rush, elapsedSeconds: now } } : {}) } };
}
export function progressDemo(state: DemoState): DemoState {
  const label = demoStepLabel(state);
  const job = getKitchenJobs(state).find(item => item.id === state.currentOrder.id);
  const readyAt = (state.kitchenState.rush?.heroStartedAtSecond ?? 0) + (job?.prepSeconds ?? 380);
  switch (label) {
    case "Place GS-2847": return kitchenReducer(state, { type: "OPEN_KITCHEN_RUSH" });
    case "Start preparation": return riderReducer(state, { type: "RIDER_PREPARE_DEMO" });
    case "Assign Ravi to pickup": return riderReducer({ ...state, riderMission: { ...getRiderMission(state), online: true } }, { type: "RIDER_NAVIGATE_KITCHEN" });
    case "Mark assembling": return kitchenReducer(atClock(state, readyAt - 60), { type: "ADVANCE_KITCHEN_JOB", id: state.currentOrder.id, expectedStage: "PREPARING" });
    case "Mark packing": return kitchenReducer(atClock(state, readyAt - 20), { type: "ADVANCE_KITCHEN_JOB", id: state.currentOrder.id, expectedStage: "ASSEMBLING" });
    case "Food ready": return kitchenReducer(atClock(state, readyAt), { type: "ADVANCE_KITCHEN_JOB", id: state.currentOrder.id, expectedStage: "PACKING" });
    case "Rider arrives at kitchen": return riderReducer(state, { type: "RIDER_ARRIVE_KITCHEN" });
    case "Confirm pickup": return riderReducer(state, { type: "RIDER_PICKUP" });
    case "Out for delivery": return riderReducer(state, { type: "RIDER_NAVIGATE_CUSTOMER" });
    case "Customer arrival": return riderReducer(state, { type: "RIDER_ARRIVE_CUSTOMER" });
    case "Begin handoff": return riderReducer(state, { type: "RIDER_HANDOFF" });
    case "Verify 2847 · delivered": return riderReducer(state, { type: "RIDER_VERIFY", code: "2847" });
    case "Return Ravi to shift": return riderReducer(state, { type: "RIDER_FINISH" });
    default: return state;
  }
}
export function recommendationAction(state: DemoState) {
  const scenario = state.intelligenceScenario ?? "BASELINE";
  const label = scenario === "KITCHEN_DELAY" && prepDelay(state) ? "Recover preparation plan"
    : scenario === "RIDER_DELAY" && arrivalDelay(state) ? "Restore pickup coverage"
    : scenario === "RIDER_SUPPLY" ? "Restore rider planning capacity"
    : scenario === "INVENTORY" ? "Replenish mint to 1.5h cover" : demoStepLabel(state);
  return { label, key: `${scenario}/${state.currentOrder.status}/${getRiderMission(state).stage}/${state.decisionHistory?.length ?? 0}` };
}
export function applyRecommendation(state: DemoState, expected: string) {
  if (recommendationAction(state).key !== expected || !recommendationAction(state).label) return state;
  if (state.intelligenceScenario && (prepDelay(state) || arrivalDelay(state) || ["RIDER_SUPPLY", "INVENTORY"].includes(state.intelligenceScenario))) {
    const next = { ...state }; delete next.intelligenceScenario; return next;
  }
  return progressDemo(state);
}
export function recordDecision(before: DemoState, after: DemoState, what: string) {
  if (before === after) return before;
  const prior = selectIntelligence(before), next = selectIntelligence(after);
  const at = new Date(Math.max(Date.parse(KITCHEN_EPOCH) + next.now * 1000, Date.parse(after.currentOrder.updatedAt))).toISOString();
  const history = before.decisionHistory ?? [];
  const reason = what === "Recommendation applied" ? prior : next;
  const why = reason.scenario === "INVENTORY" ? reason.inventoryText : reason.scenario === "RIDER_SUPPLY" ? reason.supplyText : reason.why;
  return { ...after, decisionHistory: [...history, { id: `decision-${Number(history.at(-1)?.id.split("-")[1] ?? 0) + 1}-${at}`, at, what, signal: `${prior.scenario} → ${next.scenario}; ${prior.hq.hero.stage} → ${next.hq.hero.stage}`, decision: what === "Recommendation applied" ? recommendationAction(before).label! : next.recommendation, why, constraint: "Customer promise · food freshness · rider availability · order completeness", consequence: `${next.hq.hero.stage}; Ravi ${getRiderMission(after).stage.replaceAll("_", " ")}; ${next.margin === null ? "timing pending" : `${next.margin}s promise margin`}; mint ${next.stockCover?.toFixed(1)}h; supply crossover +${next.crossover}m.` }].slice(-60) };
}
