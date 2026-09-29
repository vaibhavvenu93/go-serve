import test from "node:test";
import assert from "node:assert/strict";
import { createInitialDemoState, demoReducer } from "../src/lib/demo-engine";
import { selectIntelligence } from "../src/lib/intelligence-selectors";
import { selectHQ } from "../src/lib/hq-selectors";
import { selectCustomerOrder } from "../src/lib/customer-order";
import { getKitchenJobs, remainingTime } from "../src/lib/kitchen-rush";
import { getRiderMission, riderTiming } from "../src/lib/rider-mission";
import { coordinationInventory } from "../src/lib/coordination";
import { demoStepLabel, recommendationAction } from "../src/lib/demo-orchestration";
import { serializeDemo, deserializeDemo } from "../src/lib/demo-persistence";

const prepare = () => demoReducer(demoReducer(createInitialDemoState(), { type: "DEMO_NEXT" }), { type: "DEMO_NEXT" });
test("V1 complete explicit lifecycle stays coherent across all five selectors and resets exactly", () => {
  let state = createInitialDemoState();
  const stages = new Set<string>();
  for (let i=0; i<20 && demoStepLabel(state); i++) {
    state = demoReducer(state, { type: "DEMO_NEXT" });
    stages.add(state.currentOrder.status);
    const before = serializeDemo(state), intelligence = selectIntelligence(state), hq = selectHQ(state), customer = selectCustomerOrder(state);
    assert.equal(intelligence.hq.hero.stage, hq.hero.stage);
    assert.equal(intelligence.foodAt, hq.sync.foodAt);
    assert.equal(intelligence.arrivalAt, hq.sync.arrivalAt);
    assert.equal(customer.customer, "Aarav");
    assert.equal(customer.rider, "Ravi Sharma");
    assert.equal(customer.dish, "Paneer Tikka Rice Bowl");
    assert.equal(customer.completed, state.currentOrder.status === "DELIVERED");
    assert.equal(serializeDemo(state), before, "selectors never advance any state");
    assert.deepEqual(deserializeDemo(serializeDemo(state)), state, "every checkpoint survives refresh serialization");
  }
  for (const stage of ["QUEUED","PREPARING","ASSEMBLING","PACKING","READY","PICKED_UP","OUT_FOR_DELIVERY","ARRIVING","DELIVERED"]) assert.ok(stages.has(stage), stage);
  assert.equal(getRiderMission(state).stage, "idle");
  assert.equal(getKitchenJobs(state).find(job => job.id === "GS-2847")?.stage, "HANDED_OFF");
  assert.equal(selectHQ(state).hero.active, false);
  assert.equal(selectCustomerOrder(state).stage, "Delivered");
  assert.equal(selectIntelligence(state).recommendation, "PROMISE MET");
  assert.equal(selectIntelligence(state).deliveryAt, 720);
  assert.equal(state.riders.find(rider => rider.id === "ravi")?.deliveriesToday, 17);
  assert.ok(state.decisionHistory!.length >= 10);
  assert.deepEqual(demoReducer(state, { type: "RESET" }), createInitialDemoState());
});
test("V1 kitchen delay affects Kitchen, Rider, Customer, HQ and Intelligence once", () => {
  const base = prepare(), delayed = demoReducer(base, { type: "SET_INTELLIGENCE_SCENARIO", scenario: "KITCHEN_DELAY" });
  const job = getKitchenJobs(delayed).find(job => job.id === "GS-2847")!;
  assert.equal(remainingTime(job, 240), 260);
  assert.equal(riderTiming(delayed).food, 260);
  assert.equal(selectHQ(delayed).sync.foodAt, 500);
  assert.ok(selectHQ(delayed).exceptions.some(item => item.id === "prep-delay"));
  assert.equal(selectIntelligence(delayed).margin, -120);
  assert.equal(selectCustomerOrder(delayed).delayed, true);
  const action = recommendationAction(delayed);
  const recovered = demoReducer(delayed, { type: "APPLY_RECOMMENDATION", expected: action.key });
  assert.equal(selectIntelligence(recovered).foodAt, 380);
  assert.equal(selectCustomerOrder(recovered).delayed, false);
  assert.equal(recovered.decisionHistory!.at(-1)!.what, "Recommendation applied");
  assert.match(recovered.decisionHistory!.at(-1)!.decision, /Recover/);
  assert.strictEqual(demoReducer(recovered, { type: "APPLY_RECOMMENDATION", expected: action.key }), recovered, "stale apply is a no-op");
});
test("V1 rider delay shares a single ETA, protects recorded arrival and supports recovery", () => {
  let state = demoReducer(prepare(), { type: "SET_INTELLIGENCE_SCENARIO", scenario: "RIDER_DELAY" });
  assert.equal(getKitchenJobs(state).find(job => job.id === "GS-2847")?.riderArrivalAtSecond, 552);
  assert.equal(riderTiming(state).arrival, 552);
  assert.equal(selectHQ(state).sync.arrivalAt, 552);
  assert.equal(selectIntelligence(state).foodWait, 172);
  assert.equal(selectCustomerOrder(state).delayed, true);
  state = demoReducer(state, { type: "RIDER_NAVIGATE_KITCHEN" });
  state = demoReducer(state, { type: "RIDER_ARRIVE_KITCHEN" });
  state = demoReducer(state, { type: "SET_INTELLIGENCE_SCENARIO", scenario: "BASELINE" });
  assert.equal(riderTiming(state).arrival, 552);
  assert.equal(getKitchenJobs(state).find(job => job.id === "GS-2847")?.riderArrivalAtSecond, 552);
  assert.equal(selectIntelligence(state).arrivalAt, 552);
});
test("V1 inventory and rider supply constraints share signals and explicit recovery", () => {
  for (const scenario of ["INVENTORY", "RIDER_SUPPLY"] as const) {
    const state = demoReducer(prepare(), { type: "SET_INTELLIGENCE_SCENARIO", scenario });
    assert.deepEqual(selectHQ(state).forecast, selectIntelligence(state).forecast);
    if (scenario === "INVENTORY") {
      assert.equal(coordinationInventory(state).find(item => item.id === "mint")?.hoursRemaining, 0.4);
      assert.match(selectHQ(state).exceptions.find(item => item.id === "mint")!.detail, /0.4h/);
      assert.match(selectIntelligence(state).signal, /Replenish now/);
    } else assert.equal(selectIntelligence(state).crossover, 15);
    const recovered = demoReducer(state, { type: "APPLY_RECOMMENDATION", expected: recommendationAction(state).key });
    assert.equal(selectIntelligence(recovered).stockCover, 1.5);
    assert.equal(selectIntelligence(recovered).crossover, 20);
    assert.match(recovered.decisionHistory!.at(-1)!.why, scenario === "INVENTORY" ? /Replenish/ : /capacity/);
    assert.ok(recovered.decisionHistory!.at(-1)!.consequence);
  }
});
test("V1 baseline is passive and persistence rejects malformed or incompatible saves", () => {
  const state = createInitialDemoState(), before = serializeDemo(state);
  getKitchenJobs(state); getRiderMission(state); selectCustomerOrder(state); selectHQ(state); selectIntelligence(state);
  assert.equal(serializeDemo(state), before);
  assert.equal(state.currentOrder.status, "CART");
  assert.equal(state.orderEvents.length, 1);
  assert.equal(selectCustomerOrder(state).placed, false);
  assert.equal(getRiderMission(state).stage, "idle");
  assert.ok(!getKitchenJobs(state).some(job => job.id === "GS-2847"));
  for (const raw of [null, "broken", "{}", '{"schema":2}', '{"schema":1,"state":{"version":1}}']) assert.equal(deserializeDemo(raw), null);
  const restored = deserializeDemo(serializeDemo(prepare()))!;
  assert.equal(restored.currentOrder.status, "PREPARING");
  assert.deepEqual(demoReducer(restored, { type: "RESET" }), state);
});

test("V1 placing an order after support work preserves its own promise window", () => {
  let state = createInitialDemoState();
  const support = getKitchenJobs(state).find(job => job.stage === "QUEUED")!;
  state = demoReducer(state, {type:"ADVANCE_KITCHEN_JOB", id:support.id, expectedStage:"QUEUED"});
  state = demoReducer(state, {type:"DEMO_CLOCK"});
  state = demoReducer(state, {type:"DEMO_NEXT"});
  assert.equal(selectIntelligence(state).promiseAt, 750);
  assert.equal(getKitchenJobs(state).find(job => job.id === "GS-2847")!.promisedAtSecond, 750);
  assert.equal(state.orderEvents.at(-1)!.occurredAt, state.currentOrder.createdAt);
});
