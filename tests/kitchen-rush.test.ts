import test from "node:test";
import assert from "node:assert/strict";
import { createInitialDemoState, demoReducer } from "../src/lib/demo-engine";
import { getKitchenJobs, kitchenCounts, remainingTime, jobRisk } from "../src/lib/kitchen-rush";
import type { KitchenJobStage } from "../src/types/kitchen";

const open = () => demoReducer(createInitialDemoState(), { type: "OPEN_KITCHEN_RUSH" });
test("Kitchen entry seeds the exact 18-job snapshot once without changing order configuration", () => {
  const initial = createInitialDemoState();
  assert.equal(initial.currentOrder.status, "CART");
  const state = demoReducer(initial, { type: "OPEN_KITCHEN_RUSH" });
  assert.deepEqual(kitchenCounts(getKitchenJobs(state)), { active: 18, queued: 5, preparing: 6, finishing: 4, ready: 3, handedOff: 0 });
  assert.equal(state.currentOrder.status, "QUEUED");
  assert.deepEqual(state.currentOrder.items, initial.currentOrder.items);
  assert.equal(state.currentOrder.items[0].basePrice, 17900);
  assert.equal(state.currentOrder.total, 18900);
  assert.equal(state.orderEvents.at(-1)?.actor, "SYSTEM");
  assert.equal(demoReducer(state, { type: "OPEN_KITCHEN_RUSH" }), state);
});
test("hero stages update shared state, counts and events, with no repeated or skipped action", () => {
  let state = open();
  assert.equal(demoReducer(state, { type: "ADVANCE_KITCHEN_JOB", id: "GS-2847", expectedStage: "PACKING" }), state);
  for (const stage of ["QUEUED", "PREPARING", "ASSEMBLING", "PACKING"] as KitchenJobStage[]) {
    state = demoReducer(state, { type: "ADVANCE_KITCHEN_JOB", id: "GS-2847", expectedStage: stage });
    assert.equal(demoReducer(state, { type: "ADVANCE_KITCHEN_JOB", id: "GS-2847", expectedStage: stage }), state);
  }
  assert.equal(state.currentOrder.status, "READY");
  assert.equal(state.orderEvents.filter(event => event.actor === "KITCHEN").length, 4);
  assert.deepEqual(kitchenCounts(getKitchenJobs(state)), { active: 18, queued: 4, preparing: 6, finishing: 4, ready: 4, handedOff: 0 });
  assert.equal(getKitchenJobs(state).find(job => job.id === "GS-2847")?.bay, 4);
  assert.equal(state.deliveryAssignment, null);
  assert.equal(demoReducer(state, { type: "ADVANCE_KITCHEN_JOB", id: "GS-2847", expectedStage: "READY" }), state);
  assert.equal(demoReducer(state, { type: "OPEN_KITCHEN_RUSH" }), state);
});
test("supporting work can advance independently without changing GS-2847", () => {
  let state = open();
  const hero = state.currentOrder;
  state = demoReducer(state, { type: "ADVANCE_KITCHEN_JOB", id: "GS-2848", expectedStage: "QUEUED" });
  assert.equal(state.currentOrder, hero);
  assert.equal(getKitchenJobs(state).find(job => job.id === "GS-2848")?.stage, "PREPARING");
  assert.equal(kitchenCounts(getKitchenJobs(state)).preparing, 7);
});
test("clock is deterministic, pausable, and does not automatically progress jobs", () => {
  let state = open();
  for (let i = 0; i < 10; i++) state = demoReducer(state, { type: "KITCHEN_TICK" });
  assert.equal(state.kitchenState.rush?.elapsedSeconds, 10);
  const hero = getKitchenJobs(state)[0];
  assert.equal(hero.riderArrivalAtSecond - 10, 372);
  assert.equal(hero.prepSeconds - (hero.riderArrivalAtSecond - 10), 8);
  state = demoReducer(state, { type: "ADVANCE_KITCHEN_JOB", id: hero.id, expectedStage: "QUEUED" });
  state = demoReducer(state, { type: "KITCHEN_TICK" });
  assert.equal(remainingTime(getKitchenJobs(state)[0], 11), 379);
  state = demoReducer(state, { type: "TOGGLE_KITCHEN_CLOCK" });
  assert.equal(demoReducer(state, { type: "KITCHEN_TICK" }), state);
  assert.equal(state.currentOrder.status, "PREPARING");
});
test("readiness survives the original rider action contract and event time stays monotonic", () => {
  let state = open();
  for (let i = 0; i < 40; i++) state = demoReducer(state, { type: "KITCHEN_TICK" });
  for (const stage of ["QUEUED", "PREPARING", "ASSEMBLING", "PACKING"] as KitchenJobStage[]) state = demoReducer(state, { type: "ADVANCE_KITCHEN_JOB", id: "GS-2847", expectedStage: stage });
  const readyAt = Date.parse(state.currentOrder.updatedAt);
  state = demoReducer(state, { type: "ASSIGN_RIDER", riderId: "ravi" });
  assert.equal(state.currentOrder.status, "RIDER_ASSIGNED");
  assert.ok(Date.parse(state.currentOrder.updatedAt) > readyAt);
  state = demoReducer(state, { type: "SET_STATUS", status: "PICKED_UP" });
  assert.equal(getKitchenJobs(state)[0].stage, "HANDED_OFF");
  assert.equal(kitchenCounts(getKitchenJobs(state)).active, 17);
});
test("reset clears rush state and preserves the frozen original defaults", () => {
  const reset = demoReducer(open(), { type: "RESET" });
  assert.equal(reset.kitchenState.rush, undefined);
  assert.equal(reset.currentOrder.status, "CART");
  assert.deepEqual(reset, createInitialDemoState());
});
test("amber prep attention and red promise risk have distinct thresholds", () => {
  const job = getKitchenJobs(open()).find(item => item.id === "GS-2846")!;
  assert.equal(jobRisk(job, 0), "attention");
  assert.equal(jobRisk(job, 80), "attention");
  assert.equal(jobRisk(job, 721), "late");
});
