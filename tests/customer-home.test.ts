import test from "node:test";
import assert from "node:assert/strict";
import { demoMenu } from "../src/data/demo-menu";
import { changeQuantity, filterFood, selectionSummary } from "../src/lib/customer-home";

test("search matches words case-insensitively and respects dietary intent", () => {
  assert.equal(filterFood(demoMenu, "All", "  PANEER rice ")[0]?.id, "paneer-bowl");
  assert.equal(filterFood(demoMenu, "Veg", "chicken").length, 0);
  assert.ok(filterFood(demoMenu, "Veg").every(item => item.vegetarian));
  assert.equal(filterFood(demoMenu, "All", "zzzzzz").length, 0);
  assert.equal(filterFood([{ ...demoMenu[0], available: false }], "All").length, 0);
});
test("local selection uses base menu prices and the slowest selected delivery promise", () => {
  let quantities = changeQuantity({}, "paneer-bowl", 1);
  assert.deepEqual(selectionSummary(quantities, demoMenu), { count: 1, total: 17900, minutes: 12 });
  quantities = changeQuantity(quantities, "paneer-bowl", 1);
  quantities = changeQuantity(quantities, "masala-dosa", 1);
  assert.deepEqual(selectionSummary(quantities, demoMenu), { count: 3, total: 48700, minutes: 15 });
  quantities = changeQuantity(quantities, "paneer-bowl", -1);
  assert.equal(selectionSummary(quantities, demoMenu).total, 30800);
});
test("quantity never goes negative or above nine, and updates are immutable", () => {
  const before = { "paneer-bowl": 9 };
  assert.equal(changeQuantity(before, "paneer-bowl", 1)["paneer-bowl"], 9);
  assert.equal(changeQuantity({}, "paneer-bowl", -1)["paneer-bowl"], 0);
  assert.equal(changeQuantity(before, "paneer-bowl", -1)["paneer-bowl"], 8);
  assert.equal(before["paneer-bowl"], 9);
});
