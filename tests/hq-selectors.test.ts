import test from "node:test";
import assert from "node:assert/strict";
import { createInitialDemoState, demoReducer } from "../src/lib/demo-engine";
import { selectHQ } from "../src/lib/hq-selectors";
import { getRiderMission } from "../src/lib/rider-mission";
import { heroStage } from "../src/lib/kitchen-rush";

test("HQ initial projection is pure and never invents a placed canonical order", () => {
  const state = createInitialDemoState();
  const before = structuredClone(state);
  const hq = selectHQ(state);
  assert.equal(hq.hero.stage, "Not placed");
  assert.equal(hq.hero.active, false);
  assert.equal(hq.activeOrders, 17);
  assert.equal(hq.sync.label, "Awaiting plan");
  assert.equal(hq.sync.foodAt, null);
  assert.equal(hq.timeline.filter(step => step.at).length, 0);
  assert.equal(hq.kitchensOnline, 1);
  assert.equal(hq.activeRiders, 18);
  assert.equal(hq.riders.length, 7);
  assert.deepEqual(state, before);
  assert.deepEqual(selectHQ(state), hq);
});

test("HQ follows the complete shared journey without changing other product projections", () => {
  let state = demoReducer(createInitialDemoState(), { type: "OPEN_KITCHEN_RUSH" });
  assert.equal(selectHQ(state).hero.stage, "Queued");
  assert.equal(selectHQ(state).activeOrders, 18);
  state = demoReducer(state, { type: "RIDER_PREPARE_DEMO" });
  assert.equal(selectHQ(state).hero.stage, "Preparing");
  assert.equal(selectHQ(state).sync.gap, 8);
  state = demoReducer(state, { type: "RIDER_NAVIGATE_KITCHEN" });
  assert.ok(selectHQ(state).timeline.find(step => step.label === "Rider assigned")?.at);
  assert.equal(getRiderMission(state).stage, "to_kitchen");
  for (const expectedStage of ["PREPARING", "ASSEMBLING", "PACKING"] as const) state = demoReducer(state, { type: "ADVANCE_KITCHEN_JOB", id: "GS-2847", expectedStage });
  assert.equal(selectHQ(state).hero.stage, "Ready");
  assert.equal(selectHQ(state).sync.actualFood, true);
  assert.equal(selectHQ(state).sync.label, "Food hold");
  state = demoReducer(state, { type: "RIDER_ARRIVE_KITCHEN" });
  assert.equal(selectHQ(state).sync.actualArrival, true);
  state = demoReducer(state, { type: "RIDER_PICKUP" });
  assert.equal(selectHQ(state).hero.stage, "Picked up");
  assert.equal(selectHQ(state).kitchen.active, 17);
  assert.equal(selectHQ(state).activeOrders, 18);
  assert.equal(heroStage(state.currentOrder.status), "HANDED_OFF");
  state = demoReducer(state, { type: "RIDER_NAVIGATE_CUSTOMER" });
  assert.equal(selectHQ(state).hero.stage, "Delivering");
  state = demoReducer(state, { type: "RIDER_ARRIVE_CUSTOMER" });
  assert.equal(selectHQ(state).hero.stage, "At customer");
  state = demoReducer(state, { type: "RIDER_HANDOFF" });
  state = demoReducer(state, { type: "RIDER_VERIFY", code: "2847" });
  const before = structuredClone(state);
  assert.equal(selectHQ(state).hero.stage, "Delivered");
  assert.equal(selectHQ(state).activeOrders, 17);
  assert.equal(selectHQ(state).timeline.filter(step => step.at).length, 9);
  assert.equal(selectHQ(state).riders.find(rider => rider.id === "ravi")?.displayState, "Available");
  assert.deepEqual(state, before);
  assert.deepEqual(demoReducer(state, { type: "RESET" }), createInitialDemoState());
});

test("HQ separates inventory and illustrative forecast exceptions and computes station load", () => {
  const state = demoReducer(createInitialDemoState(), { type: "RIDER_PREPARE_DEMO" });
  const hq = selectHQ(state);
  assert.equal(hq.loads.find(load => load.label === "Hot")?.value, 80);
  assert.equal(hq.exceptions.length, 2);
  assert.match(hq.exceptions.find(item => item.id === "mint")!.detail, /1.5h/);
  assert.equal(hq.forecast.find(point => point.demand > point.riders)?.minute, 20);
  assert.ok(hq.forecast.every(point => point.kitchen > point.demand));
});

test("late supporting jobs raise a network review without changing the canonical order", () => {
  const state = demoReducer(createInitialDemoState(), { type: "RIDER_PREPARE_DEMO" });
  state.kitchenState.rush!.elapsedSeconds = 721;
  const before = structuredClone(state);
  const hq = selectHQ(state);
  assert.equal(hq.health, "Review needed");
  assert.ok(hq.exceptions.some(item => item.id === "late"));
  assert.deepEqual(state, before);
});
