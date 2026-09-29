import { prepDelay, arrivalDelay, coordinationInventory } from "./coordination";
import type { DemoState } from "@/types";
import { intelligenceScenarios } from "@/types/intelligence";
import { HERO_PREP_SECONDS, KITCHEN_EPOCH } from "@/data/demo-kitchen";
import { selectHQ } from "./hq-selectors";
import { getRiderMission, CUSTOMER_TRAVEL_SECONDS, HANDOFF_SECONDS } from "./rider-mission";
import { kitchenTime } from "./kitchen-rush";

const second = (at: string) => Math.round((Date.parse(at) - Date.parse(KITCHEN_EPOCH)) / 1000);
/** Pure, deterministic projection. Scenarios affect future estimates only, never transaction records. */
export function selectIntelligence(state: DemoState) {
  const hq = selectHQ(state);
  const mission = getRiderMission(state);
  const scenario = state.intelligenceScenario ?? "BASELINE";
  const status = state.currentOrder.status;
  const completed = status === "DELIVERED";
  const pickedUp = ["PICKED_UP", "OUT_FOR_DELIVERY", "ARRIVING", "DELIVERED"].includes(status);
  const planned = hq.sync.foodAt !== null && hq.sync.arrivalAt !== null;
  const start = state.kitchenState.rush?.heroStartedAtSecond ?? hq.now;
  const kitchenDelay = planned ? prepDelay(state) : 0;
  const riderDelay = planned ? arrivalDelay(state) : 0;
  const foodAt = hq.sync.foodAt === null ? null : hq.sync.foodAt;
  const arrivalAt = hq.sync.arrivalAt === null ? null : hq.sync.arrivalAt;
  const pickupAt = state.deliveryAssignment?.pickedUpAt ? second(state.deliveryAssignment.pickedUpAt) : null;
  const handoffAt = pickupAt ?? (foodAt === null || arrivalAt === null ? null : Math.max(hq.now, foodAt, arrivalAt));
  const deliveryAt = completed && state.currentOrder.deliveredAt ? second(state.currentOrder.deliveredAt)
    : mission.customerArrivedAt !== null ? Math.max(hq.now, mission.customerArrivedAt) + HANDOFF_SECONDS
    : handoffAt === null ? null : Math.max(hq.now, handoffAt + CUSTOMER_TRAVEL_SECONDS) + HANDOFF_SECONDS;
  const promiseAt = ["CART", "CHECKOUT", "PAYMENT_PROCESSING"].includes(status) ? null : second(state.currentOrder.createdAt) + state.currentOrder.promisedSeconds;
  const gap = foodAt === null || arrivalAt === null ? null : foodAt - arrivalAt;
  const riderWait = gap === null ? null : Math.max(0, gap);
  const foodWait = gap === null ? null : Math.max(0, -gap);
  const margin = promiseAt === null || deliveryAt === null ? null : Math.round(promiseAt - deliveryAt);
  const forecast = hq.forecast;
  const crossover = forecast.find(point => point.demand > point.riders)?.minute ?? null;
  const mint = coordinationInventory(state).find(item => item.id === "mint");
  const stockCover = mint?.hoursRemaining ?? null;
  const hasMint = state.currentOrder.items.some(item => item.addons.some(addon => /mint/i.test(addon.name)));
  const recommendation = completed ? (margin !== null && margin < 0 ? "DELIVERY COMPLETE" : "PROMISE MET")
    : !planned ? "AWAIT ORDER" : status === "ARRIVING" ? "VERIFY HANDOFF" : pickedUp ? "PROTECT DELIVERY"
    : kitchenDelay ? "RECOVER PREP" : riderDelay ? "REVIEW PICKUP"
    : ["READY", "RIDER_ASSIGNED"].includes(status) ? "PROTECT HANDOFF" : status === "QUEUED" ? "START NOW" : "KEEP PREPARING";
  const why = completed ? `Aarav’s delivery is recorded. ${margin !== null && margin < 0 ? `The promise was exceeded by ${-margin} seconds.` : "The delivery promise was met."}`
    : !planned ? "GS-2847 has no Kitchen timing plan yet. A preparation recommendation becomes available when the order enters the queue."
    : pickedUp ? "Kitchen pickup is recorded. Protect the customer leg and verify Aarav’s handoff before marking delivery complete."
    : kitchenDelay ? `An extra 120 seconds of preparation creates ${riderWait} seconds of rider wait. Recover the preparation window or review the delivery promise.`
    : riderDelay ? `Ravi’s projected delay leaves food waiting ${foodWait} seconds. Review pickup coverage; moving the cooking window alone cannot recover the promise.`
    : Math.abs(gap ?? 0) <= 10 ? `${status === "QUEUED" ? "Starting now aligns" : "The preparation plan aligns"} food completion with Ravi’s arrival, with ${riderWait} seconds of rider wait.`
    : `${gap! > 0 ? `Ravi waits ${riderWait} seconds for food` : `Food waits ${foodWait} seconds for Ravi`}. Protect the handoff window and review the remaining promise.`;
  const supplyText = crossover === null ? "Rider capacity covers the next 30 minutes." : `Review rider supply before demand crosses capacity at +${crossover}m.`;
  const inventoryText = completed ? "The order is complete. Replenish mint chutney for the next orders."
    : stockCover !== null && stockCover < 0.5 ? pickedUp ? "Mint cover is under 30 minutes. Replenish now for the next orders; this order has already left the kitchen." : "Mint cover is under 30 minutes. Replenish now and confirm the extra portion before packing."
    : hasMint && !pickedUp ? "Keep the extra mint chutney with the order." : pickedUp ? "The packed order is with the rider; monitor mint cover for the next orders." : "Monitor mint chutney cover before the next rush.";
  const signal = `${recommendation.charAt(0)}${recommendation.slice(1).toLowerCase()}${planned && !completed ? ` for ${state.currentOrder.id}` : ""}. ${inventoryText} ${supplyText}`;
  const scenarioNote = scenario === "BASELINE" ? "Canonical timing · shared with Kitchen, Rider and HQ"
    : `Shared demo condition · ${intelligenceScenarios.find(item => item.value === scenario)?.label}. ${["KITCHEN_DELAY", "RIDER_DELAY"].includes(scenario) && !kitchenDelay && !riderDelay ? "No pending milestone to delay; recorded times are preserved." : "All surfaces share this plan; recorded milestones stay intact."}`;
  const trace = [
    { label: "Order evaluated", detail: `${hq.hero.id} · ${hq.hero.stage}` },
    { label: "Kitchen capacity checked", detail: `${hq.loads[0].value}% hot station · ${hq.kitchen.queued} queued` },
    { label: "Rider ETA matched", detail: arrivalAt === null ? "Timing plan pending" : `${hq.sync.actualArrival ? "Recorded" : "Projected"} ${kitchenTime(arrivalAt, true)}` },
    { label: "Inventory checked", detail: stockCover === null ? "Cover unavailable" : `Mint chutney · ${stockCover.toFixed(1)}h cover` },
    { label: "Handoff calculated", detail: handoffAt === null ? "Timing plan pending" : kitchenTime(handoffAt, true) },
    { label: "Recommendation evaluated", detail: recommendation },
  ].map(item => ({ ...item, at: kitchenTime(hq.now, true) }));
  return { hq, now: hq.now, scenario, scenarioNote, planned, pickedUp, completed, start, foodAt, arrivalAt, handoffAt, deliveryAt, promiseAt, gap, riderWait, foodWait, margin, kitchenDelay, riderDelay, prepSeconds: HERO_PREP_SECONDS, forecast, crossover, stockCover, mint, recommendation, why, signal, supplyText, inventoryText, trace };
}

