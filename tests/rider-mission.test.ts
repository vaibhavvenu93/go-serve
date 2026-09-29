import test from "node:test";
import assert from "node:assert/strict";
import { createInitialDemoState, demoReducer } from "../src/lib/demo-engine";
import { getRiderMission, riderTiming } from "../src/lib/rider-mission";
import { getKitchenJobs, kitchenCounts } from "../src/lib/kitchen-rush";

test("Rider projection does not mutate the canonical cart; illegal actions are no-ops", () => {
  const state = createInitialDemoState();
  const before = structuredClone(state);
  assert.equal(getRiderMission(state).stage, "idle");
  for (const type of ["RIDER_PICKUP", "RIDER_NAVIGATE_KITCHEN", "RIDER_ARRIVE_CUSTOMER", "RIDER_READY_DEMO"] as const) assert.equal(demoReducer(state, { type }), state);
  assert.deepEqual(state, before);
});

test("independent setup uses the same kitchen timing and waits for actual readiness", () => {
  let state = demoReducer(createInitialDemoState(), { type: "RIDER_PREPARE_DEMO" });
  assert.equal(state.currentOrder.status, "PREPARING");
  assert.deepEqual({ food: riderTiming(state).food, rider: riderTiming(state).riderRemaining, wait: riderTiming(state).wait }, { food: 140, rider: 132, wait: 8 });
  assert.equal(demoReducer(state, { type: "RIDER_PREPARE_DEMO" }), state);
  state = demoReducer(state, { type: "RIDER_NAVIGATE_KITCHEN" });
  state = demoReducer(state, { type: "RIDER_ARRIVE_KITCHEN" });
  assert.equal(riderTiming(state).now, 372);
  assert.equal(demoReducer(state, { type: "RIDER_PICKUP" }), state);
  state = demoReducer(state, { type: "RIDER_READY_DEMO" });
  assert.equal(state.currentOrder.status, "READY");
  assert.equal(riderTiming(state).readyAt, 380);
  assert.equal(demoReducer(state, { type: "RIDER_READY_DEMO" }), state);
});

test("complete mission records pickup, travel, verified delivery and exactly one delivery credit", () => {
  let state = demoReducer(createInitialDemoState(), { type: "RIDER_PREPARE_DEMO" });
  for (const type of ["RIDER_NAVIGATE_KITCHEN", "RIDER_ARRIVE_KITCHEN", "RIDER_READY_DEMO", "RIDER_PICKUP"] as const) state = demoReducer(state, { type });
  assert.equal(state.currentOrder.status, "PICKED_UP");
  assert.equal(state.deliveryAssignment?.riderId, "ravi");
  assert.equal(kitchenCounts(getKitchenJobs(state)).active, 17);
  assert.equal(demoReducer(state, { type: "RIDER_PICKUP" }), state);
  state = demoReducer(state, { type: "RIDER_NAVIGATE_CUSTOMER" });
  assert.equal(state.currentOrder.status, "OUT_FOR_DELIVERY");
  state = demoReducer(state, { type: "RIDER_ARRIVE_CUSTOMER" });
  state = demoReducer(state, { type: "RIDER_HANDOFF" });
  assert.equal(demoReducer(state, { type: "RIDER_VERIFY", code: "0000" }), state);
  state = demoReducer(state, { type: "RIDER_VERIFY", code: "2847" });
  assert.equal(state.currentOrder.status, "DELIVERED");
  assert.equal(getRiderMission(state).deliveredAt, 720);
  assert.equal(state.riders.find(rider => rider.id === "ravi")?.deliveriesToday, 17);
  assert.equal(state.riders.find(rider => rider.id === "ravi")?.currentOrder, null);
  assert.equal(demoReducer(state, { type: "RIDER_VERIFY", code: "2847" }), state);
  const times = state.orderEvents.map(event => Date.parse(event.occurredAt));
  assert.ok(times.every((time, i) => i === 0 || time >= times[i - 1]));
  state = demoReducer(state, { type: "RIDER_FINISH" });
  assert.equal(getRiderMission(state).stage, "idle");
  assert.deepEqual(demoReducer(state, { type: "RESET" }), createInitialDemoState());
});

test("Kitchen-ready order projects directly into Rider and cannot be reseeded", () => {
  let state = demoReducer(createInitialDemoState(), { type: "OPEN_KITCHEN_RUSH" });
  for (const expectedStage of ["QUEUED", "PREPARING", "ASSEMBLING", "PACKING"] as const) state = demoReducer(state, { type: "ADVANCE_KITCHEN_JOB", id: "GS-2847", expectedStage });
  assert.equal(getRiderMission(state).stage, "assigned");
  assert.equal(demoReducer(state, { type: "RIDER_PREPARE_DEMO" }), state);
  state = demoReducer(state, { type: "RIDER_NAVIGATE_KITCHEN" });
  assert.equal(state.currentOrder.status, "READY");
  state = demoReducer(state, { type: "RIDER_ARRIVE_KITCHEN" });
  state = demoReducer(state, { type: "RIDER_PICKUP" });
  assert.equal(state.currentOrder.status, "PICKED_UP");
});

test("offline blocks navigation and availability cannot change during navigation", () => {
  let state = demoReducer(createInitialDemoState(), { type: "RIDER_PREPARE_DEMO" });
  state = demoReducer(state, { type: "RIDER_TOGGLE_ONLINE" });
  assert.equal(demoReducer(state, { type: "RIDER_NAVIGATE_KITCHEN" }), state);
  state = demoReducer(state, { type: "RIDER_TOGGLE_ONLINE" });
  state = demoReducer(state, { type: "RIDER_NAVIGATE_KITCHEN" });
  assert.equal(demoReducer(state, { type: "RIDER_TOGGLE_ONLINE" }), state);
});
