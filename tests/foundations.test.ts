import test from "node:test";
import assert from "node:assert/strict";
import { createInitialDemoState, demoReducer } from "../src/lib/demo-engine";
import { ORDER_STAGES } from "../src/lib/order-state";
import { formatINR, formatMoney, formatDuration, formatPercentage } from "../src/lib/format";
import { baseNetworkMetrics, demoAnalytics } from "../src/data/demo-analytics";
import { demoInventory } from "../src/data/demo-inventory";

test("INR, durations, and percentage match the product brief", () => {
  assert.equal(formatINR(71846), "₹71,846"); assert.equal(formatINR(291), "₹291");
  assert.equal(formatMoney(17900), "₹179"); assert.equal(formatDuration(728), "12m 08s"); assert.equal(formatPercentage(.947), "94.7%");
});
test("analytics reconcile with the network headline metrics", () => {
  assert.equal(demoAnalytics.reduce((n, point) => n + point.orders, 0), 247);
  assert.equal(demoAnalytics.reduce((n, point) => n + point.gmv, 0), baseNetworkMetrics.gmv);
  const weighted = (field: "averageDeliverySeconds" | "sla") => demoAnalytics.reduce((n, point) => n + point[field] * point.orders, 0) / 247;
  assert.ok(Math.abs(weighted("averageDeliverySeconds") - 728) < 1e-8);
  assert.ok(Math.abs(weighted("sla") - .947) < 1e-8);
  assert.equal(formatMoney(baseNetworkMetrics.aov), "₹291");
});
test("fixture configuration and inventory warnings stay believable", () => {
  const state = createInitialDemoState();
  assert.equal(state.currentOrder.total, state.currentOrder.items.reduce((sum, item) => sum + item.lineTotal, 0));
  assert.equal(state.currentOrder.items[0].basePrice, 17900);
  assert.equal(state.riders.find(rider => rider.id === "ravi")?.distanceFromKitchen, 310);
  assert.equal(demoInventory.filter(item => item.status === "LOW").length, 1);
  assert.equal(demoInventory.filter(item => item.status === "ATTENTION").length, 1);
});
test("invalid and repeated actions cannot skip payment or order stages", () => {
  const state = createInitialDemoState();
  assert.equal(demoReducer(state, { type: "SET_STATUS", status: "READY" }), state);
  assert.equal(demoReducer(state, { type: "ASSIGN_RIDER", riderId: "ravi" }), state);
  const checkout = demoReducer(state, { type: "ADVANCE" });
  assert.equal(checkout.currentOrder.status, "CHECKOUT");
  assert.equal(demoReducer(checkout, { type: "SET_STATUS", status: "CHECKOUT" }), checkout);
  assert.equal(checkout.orderEvents.length, 2);
});
test("assignment requires ready order and available rider; complete chain is terminal", () => {
  let state = createInitialDemoState();
  for (const status of ORDER_STAGES.slice(1, 11)) state = demoReducer(state, { type: "SET_STATUS", status });
  assert.equal(state.currentOrder.status, "READY");
  assert.equal(state.currentOrder.payment.status, "PAID");
  assert.equal(demoReducer(state, { type: "ADVANCE" }), state);
  assert.equal(demoReducer(state, { type: "ASSIGN_RIDER", riderId: "missing" }), state);
  assert.equal(demoReducer(state, { type: "ASSIGN_RIDER", riderId: "imran" }), state);
  state = demoReducer(state, { type: "ASSIGN_RIDER", riderId: "ravi" });
  assert.equal(state.currentOrder.status, "RIDER_ASSIGNED");
  assert.equal(state.deliveryAssignment?.riderId, "ravi");
  for (const status of ORDER_STAGES.slice(12)) state = demoReducer(state, { type: "SET_STATUS", status });
  assert.equal(state.currentOrder.status, "DELIVERED");
  assert.equal(state.orderEvents.length, 16);
  assert.ok(state.deliveryAssignment?.pickedUpAt);
  assert.equal(state.deliveryAssignment?.deliveredAt, state.currentOrder.deliveredAt);
  assert.equal(state.riders.find(rider => rider.id === "ravi")?.status, "AVAILABLE");
  assert.ok(!state.kitchenState.activeOrderIds.includes("GS-2847"));
  assert.equal(demoReducer(state, { type: "ADVANCE" }), state);
  // Operational side effects intentionally belong to later clusters.
  assert.deepEqual(state.networkMetrics, baseNetworkMetrics);
});
test("reset restores an independent state graph after edits", () => {
  const state = createInitialDemoState();
  state.inventory.items[0].onHand = 0;
  state.currentOrder.items[0].addons[0].price = 999;
  const reset = demoReducer(state, { type: "RESET" });
  assert.equal(reset.currentOrder.status, "CART");
  assert.equal(reset.inventory.items[0].onHand, 12.4);
  assert.equal(reset.currentOrder.items[0].addons[0].price, 1000);
  assert.equal(reset.deliveryAssignment, null);
  assert.equal(reset.orderEvents.length, 1);
});
