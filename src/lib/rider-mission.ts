import type { DemoState, OrderStatus } from "@/types";
import type { RiderAction, RiderMission } from "@/types/rider";
import { KITCHEN_EPOCH } from "@/data/demo-kitchen";
import { getKitchenJobs, kitchenReducer, remainingTime } from "./kitchen-rush";

export const CUSTOMER_TRAVEL_SECONDS = 330;
export const HANDOFF_SECONDS = 10;
export const isPickupReady = (status: OrderStatus) => status === "READY" || status === "RIDER_ASSIGNED";
const preOrder = (status: OrderStatus) => ["CART", "CHECKOUT", "PAYMENT_PROCESSING", "PAID", "CONFIRMED", "KITCHEN_ACCEPTED"].includes(status);
export function getRiderMission(state: DemoState): RiderMission {
  if (state.riderMission) return state.riderMission.stage === "idle" && !preOrder(state.currentOrder.status) && state.currentOrder.status !== "DELIVERED" ? { ...state.riderMission, stage: "assigned" } : state.riderMission;
  const status = state.currentOrder.status;
  return { stage: status === "DELIVERED" ? "delivered" : status === "ARRIVING" ? "arrived_customer" : status === "OUT_FOR_DELIVERY" ? "to_customer" : status === "PICKED_UP" ? "picked_up" : preOrder(status) ? "idle" : "assigned", online: true, elapsedSeconds: state.kitchenState.rush?.elapsedSeconds ?? 0, kitchenArrivedAt: null, customerArrivedAt: null, deliveredAt: null };
}
export function riderTiming(state: DemoState) {
  const mission = getRiderMission(state);
  const now = Math.max(mission.elapsedSeconds, state.kitchenState.rush?.elapsedSeconds ?? 0);
  const job = getKitchenJobs(state).find(job => job.id === state.currentOrder.id);
  const food = job ? remainingTime(job, now) : 0;
  const arrival = mission.kitchenArrivedAt ?? Math.max(now, job?.riderArrivalAtSecond ?? now + 180);
  return { now, food, arrival, riderRemaining: Math.max(0, arrival - now), wait: Math.max(0, now + food - arrival), readyAt: state.kitchenState.rush?.heroReadyAtSecond ?? null };
}
function atSecond(second: number) { return new Date(Date.parse(KITCHEN_EPOCH) + second * 1000).toISOString(); }
function save(state: DemoState, mission: RiderMission): DemoState {
  return { ...state, riderMission: mission, kitchenState: { ...state.kitchenState, ...(state.kitchenState.rush ? { rush: { ...state.kitchenState.rush, elapsedSeconds: mission.elapsedSeconds } } : {}) } };
}
function orderEvent(state: DemoState, mission: RiderMission, status: OrderStatus): DemoState {
  const at = new Date(Math.max(Date.parse(atSecond(mission.elapsedSeconds)), Date.parse(state.currentOrder.updatedAt) + 1)).toISOString();
  const delivered = status === "DELIVERED";
  return save({ ...state, currentOrder: { ...state.currentOrder, status, updatedAt: at, deliveredAt: delivered ? at : null }, deliveryAssignment: { orderId: state.currentOrder.id, riderId: "ravi", assignedAt: state.deliveryAssignment?.assignedAt ?? at, pickedUpAt: status === "PICKED_UP" ? at : state.deliveryAssignment?.pickedUpAt ?? null, deliveredAt: delivered ? at : null }, riders: state.riders.map(rider => rider.id !== "ravi" ? rider : { ...rider, currentOrder: delivered ? null : state.currentOrder.id, status: delivered ? "AVAILABLE" : "DELIVERING", deliveriesToday: rider.deliveriesToday + (delivered ? 1 : 0) }), kitchenState: { ...state.kitchenState, activeOrderIds: state.kitchenState.activeOrderIds.filter(id => id !== state.currentOrder.id) }, orderEvents: [...state.orderEvents, { id: `${state.currentOrder.id}-event-${state.orderEvents.length}`, orderId: state.currentOrder.id, status, occurredAt: at, actor: "RIDER", note: `Ravi: ${status.toLowerCase().replaceAll("_", " ")}` }] }, mission);
}
export function riderReducer(state: DemoState, action: RiderAction): DemoState {
  const current = getRiderMission(state);
  const timing = riderTiming(state);
  const mission = { ...current, elapsedSeconds: timing.now };
  if (action.type === "RIDER_PREPARE_DEMO") {
    if (!preOrder(state.currentOrder.status) && state.currentOrder.status !== "QUEUED") return state;
    let prepared = kitchenReducer(state, { type: "OPEN_KITCHEN_RUSH" });
    prepared = kitchenReducer(prepared, { type: "ADVANCE_KITCHEN_JOB", id: state.currentOrder.id, expectedStage: "QUEUED" });
    const elapsedSeconds = (prepared.kitchenState.rush?.heroStartedAtSecond ?? 0) + 240;
    return save(prepared, { ...mission, online: true, stage: "assigned", elapsedSeconds });
  }
  if (action.type === "RIDER_READY_DEMO") {
    if (mission.stage !== "at_kitchen" || !state.kitchenState.rush || !["QUEUED", "PREPARING", "ASSEMBLING", "PACKING"].includes(state.currentOrder.status)) return state;
    let prepared = state;
    if (prepared.currentOrder.status === "QUEUED") prepared = kitchenReducer(prepared, { type: "ADVANCE_KITCHEN_JOB", id: state.currentOrder.id, expectedStage: "QUEUED" });
    const elapsedSeconds = Math.max(timing.now, (prepared.kitchenState.rush?.heroStartedAtSecond ?? 0) + (getKitchenJobs(prepared).find(job => job.id === prepared.currentOrder.id)?.prepSeconds ?? 380));
    prepared = save(prepared, { ...mission, elapsedSeconds });
    for (const stage of ["PREPARING", "ASSEMBLING", "PACKING"] as const) prepared = kitchenReducer(prepared, { type: "ADVANCE_KITCHEN_JOB", id: state.currentOrder.id, expectedStage: stage });
    return prepared;
  }
  switch (action.type) {
    case "RIDER_NAVIGATE_KITCHEN":
      if (mission.stage !== "assigned" || !mission.online || preOrder(state.currentOrder.status)) return state;
      return save({ ...state, deliveryAssignment: state.deliveryAssignment ?? { orderId: state.currentOrder.id, riderId: "ravi", assignedAt: atSecond(timing.now), pickedUpAt: null, deliveredAt: null }, riders: state.riders.map(rider => rider.id === "ravi" ? { ...rider, status: "ASSIGNED", currentOrder: state.currentOrder.id } : rider) }, { ...mission, stage: "to_kitchen" });
    case "RIDER_ARRIVE_KITCHEN":
      if (mission.stage !== "to_kitchen") return state;
      return save({ ...state, riders: state.riders.map(rider => rider.id === "ravi" ? { ...rider, status: "AT_KITCHEN", distanceFromKitchen: 0 } : rider) }, { ...mission, stage: "at_kitchen", elapsedSeconds: timing.arrival, kitchenArrivedAt: timing.arrival });
    case "RIDER_PICKUP":
      if (mission.stage !== "at_kitchen" || !isPickupReady(state.currentOrder.status)) return state;
      return orderEvent(state, { ...mission, stage: "picked_up" }, "PICKED_UP");
    case "RIDER_NAVIGATE_CUSTOMER":
      if (mission.stage !== "picked_up" || state.currentOrder.status !== "PICKED_UP") return state;
      return orderEvent(state, { ...mission, stage: "to_customer" }, "OUT_FOR_DELIVERY");
    case "RIDER_ARRIVE_CUSTOMER":
      if (mission.stage !== "to_customer" || state.currentOrder.status !== "OUT_FOR_DELIVERY") return state;
      return orderEvent(state, { ...mission, stage: "arrived_customer", elapsedSeconds: timing.now + CUSTOMER_TRAVEL_SECONDS, customerArrivedAt: timing.now + CUSTOMER_TRAVEL_SECONDS }, "ARRIVING");
    case "RIDER_HANDOFF":
      return mission.stage === "arrived_customer" ? save(state, { ...mission, stage: "handoff" }) : state;
    case "RIDER_VERIFY":
      if (mission.stage !== "handoff" || action.code !== "2847" || state.currentOrder.status !== "ARRIVING") return state;
      return orderEvent(state, { ...mission, stage: "delivered", elapsedSeconds: timing.now + HANDOFF_SECONDS, deliveredAt: timing.now + HANDOFF_SECONDS }, "DELIVERED");
    case "RIDER_FINISH":
      return mission.stage === "delivered" ? save(state, { ...mission, stage: "idle" }) : state;
    case "RIDER_TOGGLE_ONLINE":
      return ["idle", "assigned"].includes(mission.stage) ? save(state, { ...mission, online: !mission.online }) : state;
  }
}
