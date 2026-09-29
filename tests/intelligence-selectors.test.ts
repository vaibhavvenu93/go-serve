import test from "node:test";
import assert from "node:assert/strict";
import { createInitialDemoState, demoReducer } from "../src/lib/demo-engine";
import { selectIntelligence } from "../src/lib/intelligence-selectors";
import { selectHQ } from "../src/lib/hq-selectors";
import { intelligenceScenarios } from "../src/types/intelligence";

const prepared = () => demoReducer(createInitialDemoState(), { type: "RIDER_PREPARE_DEMO" });
test("Intelligence reads an unplaced order without inventing a plan or mutating state", () => {
  const state = createInitialDemoState();
  const before = structuredClone(state);
  const data = selectIntelligence(state);
  assert.equal(data.recommendation, "AWAIT ORDER");
  assert.equal(data.handoffAt, null);
  assert.equal(data.deliveryAt, null);
  assert.equal(data.promiseAt, null);
  assert.deepEqual(state, before);
  assert.deepEqual(selectIntelligence(state), data);
});
test("healthy synchronization uses Kitchen/HQ timing and the Rider customer leg", () => {
  const state = prepared();
  const data = selectIntelligence(state);
  assert.equal(data.now, 240);
  assert.equal(data.foodAt, selectHQ(state).sync.foodAt);
  assert.equal(data.arrivalAt, selectHQ(state).sync.arrivalAt);
  assert.equal(data.riderWait, 8);
  assert.equal(data.handoffAt, 380);
  assert.equal(data.deliveryAt, 720);
  assert.equal(data.margin, 0);
  assert.equal(data.recommendation, "KEEP PREPARING");
  assert.equal(selectIntelligence(demoReducer(createInitialDemoState(), { type: "OPEN_KITCHEN_RUSH" })).recommendation, "START NOW");
  assert.equal(data.hq.hero.customer, "Aarav");
  assert.equal(data.hq.hero.rider, "Ravi Sharma");
  assert.match(data.hq.hero.dish, /Paneer Tikka Rice Bowl/);
  assert.deepEqual(data.forecast, selectHQ(state).forecast);
});
test("delay projections move handoff and promise risk without changing canonical facts", () => {
  const state = prepared();
  const before = structuredClone(state);
  const kitchen = selectIntelligence(demoReducer(state, { type: "SET_INTELLIGENCE_SCENARIO", scenario: "KITCHEN_DELAY" }));
  assert.equal(kitchen.foodAt, 500);
  assert.equal(kitchen.riderWait, 128);
  assert.equal(kitchen.deliveryAt, 840);
  assert.equal(kitchen.margin, -120);
  assert.equal(kitchen.recommendation, "RECOVER PREP");
  const rider = selectIntelligence(demoReducer(state, { type: "SET_INTELLIGENCE_SCENARIO", scenario: "RIDER_DELAY" }));
  assert.equal(rider.arrivalAt, 552);
  assert.equal(rider.foodWait, 172);
  assert.equal(rider.handoffAt, 552);
  assert.equal(rider.margin, -172);
  assert.equal(rider.recommendation, "REVIEW PICKUP");
  assert.deepEqual(state, before);
});
test("supply and stock scenarios derive constraints; every scenario shares HQ timing and reset preserves canonical records", () => {
  const state = prepared();
  const hq = selectHQ(state);
  for (const { value } of intelligenceScenarios) {
    const next = demoReducer(state, { type: "SET_INTELLIGENCE_SCENARIO", scenario: value });
    assert.deepEqual(next.currentOrder, state.currentOrder);
    assert.equal(selectIntelligence(next).foodAt, selectHQ(next).sync.foodAt);
    assert.equal(selectIntelligence(next).arrivalAt, selectHQ(next).sync.arrivalAt);
    const recovered = demoReducer(next, { type: "SET_INTELLIGENCE_SCENARIO", scenario: "BASELINE" });
    assert.deepEqual(selectHQ(recovered), hq);
    assert.deepEqual(recovered.currentOrder, state.currentOrder);
    assert.deepEqual(demoReducer(next, { type: "RESET" }), createInitialDemoState());
  }
  const supply = selectIntelligence(demoReducer(state, { type: "SET_INTELLIGENCE_SCENARIO", scenario: "RIDER_SUPPLY" }));
  assert.equal(supply.crossover, 15);
  assert.equal(supply.handoffAt, 380);
  assert.match(supply.signal, /\+15m/);
  const inventory = selectIntelligence(demoReducer(state, { type: "SET_INTELLIGENCE_SCENARIO", scenario: "INVENTORY" }));
  assert.equal(inventory.stockCover, 0.4);
  assert.match(inventory.signal, /Replenish now/);
  assert.equal(inventory.mint?.hoursRemaining, 0.4);
  assert.equal(state.inventory.items.find(item => item.id === "mint")?.hoursRemaining, 1.5);
});
test("recorded milestones survive scenarios through pickup and verified completion", () => {
  let state = prepared();
  for (const type of ["RIDER_NAVIGATE_KITCHEN", "RIDER_ARRIVE_KITCHEN", "RIDER_READY_DEMO", "RIDER_PICKUP", "RIDER_NAVIGATE_CUSTOMER", "RIDER_ARRIVE_CUSTOMER", "RIDER_HANDOFF"] as const) {
    state = demoReducer(state, { type });
    const original = selectIntelligence(state);
    for (const scenario of ["KITCHEN_DELAY", "RIDER_DELAY"] as const) {
      const data = selectIntelligence(demoReducer(state, { type: "SET_INTELLIGENCE_SCENARIO", scenario }));
      if (data.hq.sync.actualArrival) assert.equal(data.arrivalAt, original.arrivalAt);
      if (data.hq.sync.actualFood) assert.equal(data.foodAt, original.foodAt);
      if (data.pickedUp) assert.equal(data.deliveryAt, original.deliveryAt);
    }
  }
  state = demoReducer(state, { type: "RIDER_VERIFY", code: "2847" });
  const data = selectIntelligence(state);
  assert.equal(data.recommendation, "PROMISE MET");
  assert.match(data.signal, /order is complete/);
  assert.doesNotMatch(data.signal, /order is with the rider/);
  assert.equal(data.deliveryAt, 720);
  assert.equal(data.handoffAt, 380);
  assert.equal(data.trace[0].detail, "GS-2847 · Delivered");
  assert.deepEqual(demoReducer(state, { type: "RESET" }), createInitialDemoState());
});

