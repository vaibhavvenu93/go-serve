import { prepDelay, arrivalDelay, isPlaced } from "./coordination";
import type { DemoState, OrderStatus } from "@/types";
import type { KitchenJob, KitchenJobStage, KitchenStation } from "@/types/kitchen";
import { createKitchenRush, HERO_PREP_SECONDS, HERO_RIDER_ARRIVAL_SECONDS, KITCHEN_EPOCH } from "@/data/demo-kitchen";
import { ORDER_STAGES } from "./order-state";

export const KITCHEN_STAGES: KitchenJobStage[] = ["QUEUED", "PREPARING", "ASSEMBLING", "PACKING", "READY", "HANDED_OFF"];
export const ACTION_LABELS: Partial<Record<KitchenJobStage, string>> = { QUEUED: "Start now", PREPARING: "Mark assembling", ASSEMBLING: "Mark packing", PACKING: "Mark ready" };
export type KitchenAction = { type: "OPEN_KITCHEN_RUSH" } | { type: "KITCHEN_TICK" } | { type: "TOGGLE_KITCHEN_CLOCK" } | { type: "ADVANCE_KITCHEN_JOB"; id: string; expectedStage: KitchenJobStage };
export const kitchenTime = (second: number, withSeconds = false) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", ...(withSeconds ? { second: "2-digit" } : {}) }).format(new Date(Date.parse(KITCHEN_EPOCH) + second * 1000));
export const clockDuration = (seconds: number) => `${String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, "0")}:${String(Math.max(0, seconds) % 60).padStart(2, "0")}`;
export function stationFor(stage: KitchenJobStage): KitchenStation { return stage === "ASSEMBLING" ? "ASSEMBLY" : stage === "PACKING" ? "PACK" : stage === "READY" || stage === "HANDED_OFF" ? "HANDOFF" : "HOT"; }
export function heroStage(status: OrderStatus): KitchenJobStage {
  if (["PICKED_UP", "OUT_FOR_DELIVERY", "ARRIVING", "DELIVERED"].includes(status)) return "HANDED_OFF";
  if (status === "RIDER_ASSIGNED") return "READY";
  return KITCHEN_STAGES.includes(status as KitchenJobStage) ? status as KitchenJobStage : "QUEUED";
}
export function getKitchenJobs(state: DemoState): KitchenJob[] {
  const rush = state.kitchenState.rush;
  if (!rush) return createKitchenRush().jobs;
  const stage = heroStage(state.currentOrder.status);
  if (!isPlaced(state)) return rush.jobs;
  return [{ id: state.currentOrder.id, menuItemId: state.currentOrder.items[0].menuItemId, quantity: state.currentOrder.items[0].quantity, stage, station: stationFor(stage), prepSeconds: HERO_PREP_SECONDS + prepDelay(state), remainingAtStart: HERO_PREP_SECONDS + prepDelay(state), startedAtSecond: rush.heroStartedAtSecond, promisedAtSecond: (Date.parse(state.currentOrder.createdAt) - Date.parse(KITCHEN_EPOCH)) / 1000 + state.currentOrder.promisedSeconds, riderName: "Ravi Sharma", riderArrivalAtSecond: state.riderMission?.kitchenArrivedAt ?? (rush.heroStartedAtSecond ?? rush.elapsedSeconds) + HERO_RIDER_ARRIVAL_SECONDS + arrivalDelay(state), bay: rush.heroReadyAtSecond === null ? null : 4, note: "Medium spice · Extra mint chutney" }, ...rush.jobs];
}
export function remainingTime(job: KitchenJob, elapsed: number): number {
  if (job.stage === "QUEUED") return job.prepSeconds;
  if (job.stage === "READY" || job.stage === "HANDED_OFF") return 0;
  return Math.max(0, job.remainingAtStart - Math.max(0, elapsed - (job.startedAtSecond ?? 0)));
}
export function jobRisk(job: KitchenJob, elapsed: number): "healthy" | "attention" | "late" {
  if (job.stage === "HANDED_OFF") return "healthy";
  if (elapsed >= job.promisedAtSecond) return "late";
  if (!["READY", "QUEUED"].includes(job.stage) && remainingTime(job, elapsed) <= 60) return "attention";
  return "healthy";
}
export function kitchenCounts(jobs: KitchenJob[]) {
  const count = (stages: KitchenJobStage[]) => jobs.filter(job => stages.includes(job.stage)).length;
  return { active: count(["QUEUED", "PREPARING", "ASSEMBLING", "PACKING", "READY"]), queued: count(["QUEUED"]), preparing: count(["PREPARING"]), finishing: count(["ASSEMBLING", "PACKING"]), ready: count(["READY"]), handedOff: count(["HANDED_OFF"]) };
}
export function kitchenReducer(state: DemoState, action: KitchenAction): DemoState {
  if (action.type === "OPEN_KITCHEN_RUSH") {
    if (state.kitchenState.rush && isPlaced(state)) return state;
    const seedOrder = ORDER_STAGES.indexOf(state.currentOrder.status) < ORDER_STAGES.indexOf("QUEUED");
    const rush = state.kitchenState.rush ?? createKitchenRush();
    if (!seedOrder && heroStage(state.currentOrder.status) !== "QUEUED") rush.heroStartedAtSecond = 0;
    if (!seedOrder && heroStage(state.currentOrder.status) === "READY") rush.heroReadyAtSecond = 0;
    const placedAt = new Date(Date.parse(KITCHEN_EPOCH) + rush.elapsedSeconds * 1000).toISOString();
    const order = seedOrder ? { ...state.currentOrder, status: "QUEUED" as const, payment: { status: "PAID" as const, simulatedReference: "SIM-KITCHEN-GS-2847", amount: state.currentOrder.total }, createdAt: placedAt, updatedAt: placedAt, promisedSeconds: 720 } : state.currentOrder;
    return { ...state, currentOrder: order, kitchenState: { ...state.kitchenState, rush, activeOrderIds: [...rush.jobs.map(job => job.id), ...(heroStage(order.status) === "HANDED_OFF" ? [] : [order.id])] }, orderEvents: seedOrder ? [...state.orderEvents, { id: `${order.id}-kitchen-seed`, orderId: order.id, status: "QUEUED", occurredAt: placedAt, actor: "SYSTEM", note: "Customer demo order placed: simulated payment accepted and kitchen queued." }] : state.orderEvents };
  }
  const rush = state.kitchenState.rush;
  if (!rush) {
    if (action.type !== "ADVANCE_KITCHEN_JOB") return state;
    const snapshot = createKitchenRush();
    return kitchenReducer({ ...state, kitchenState: { ...state.kitchenState, rush: snapshot, activeOrderIds: snapshot.jobs.map(job => job.id) } }, action);
  }
  if (action.type === "TOGGLE_KITCHEN_CLOCK") return { ...state, kitchenState: { ...state.kitchenState, rush: { ...rush, running: !rush.running } } };
  if (action.type === "KITCHEN_TICK") {
    if (!rush.running) return state;
    return { ...state, kitchenState: { ...state.kitchenState, rush: { ...rush, elapsedSeconds: rush.elapsedSeconds + 1 } } };
  }
  const job = getKitchenJobs(state).find(item => item.id === action.id);
  if (!job || job.stage !== action.expectedStage || !ACTION_LABELS[job.stage]) return state;
  const next = KITCHEN_STAGES[KITCHEN_STAGES.indexOf(job.stage) + 1];
  if (job.id === state.currentOrder.id) {
    // Only the kitchen's contiguous stages are accepted. READY does not dispatch a rider.
    const at = new Date(Math.max(Date.parse(KITCHEN_EPOCH) + rush.elapsedSeconds * 1000, Date.parse(state.currentOrder.updatedAt) + 1)).toISOString();
    return { ...state, currentOrder: { ...state.currentOrder, status: next as OrderStatus, updatedAt: at }, orderEvents: [...state.orderEvents, { id: `${job.id}-event-${state.orderEvents.length}`, orderId: job.id, status: next as OrderStatus, occurredAt: at, actor: "KITCHEN", note: `Kitchen marked ${next.toLowerCase()}` }], kitchenState: { ...state.kitchenState, rush: { ...rush, heroStartedAtSecond: next === "PREPARING" ? rush.elapsedSeconds : rush.heroStartedAtSecond, heroReadyAtSecond: next === "READY" ? rush.elapsedSeconds : rush.heroReadyAtSecond } } };
  }
  return { ...state, kitchenState: { ...state.kitchenState, rush: { ...rush, jobs: rush.jobs.map(item => item.id === job.id ? { ...item, stage: next, station: stationFor(next), startedAtSecond: next === "PREPARING" ? rush.elapsedSeconds : item.startedAtSecond } : item) } } };
}
