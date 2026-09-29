import { coordinationForecast, coordinationInventory, prepDelay, arrivalDelay, hasLeftKitchen } from "./coordination";
import type { DemoState, OrderStatus } from "@/types";
import { createKitchenRush, KITCHEN_EPOCH } from "@/data/demo-kitchen";
import { demoMenu } from "@/data/demo-menu";
import { hqCustomerNames } from "@/data/demo-hq";
import { getKitchenJobs, kitchenCounts, remainingTime, kitchenTime, clockDuration } from "./kitchen-rush";
import { getRiderMission, riderTiming, CUSTOMER_TRAVEL_SECONDS } from "./rider-mission";

export interface HQOrder { id: string; customer: string; dish: string; stage: string; rider: string; timing: string; risk: string; canonical: boolean; active: boolean }
const labels: Partial<Record<OrderStatus, string>> = { CART: "Not placed", CHECKOUT: "Checkout", PAYMENT_PROCESSING: "Payment pending", PAID: "Paid", CONFIRMED: "Confirmed", KITCHEN_ACCEPTED: "Accepted", QUEUED: "Queued", PREPARING: "Preparing", ASSEMBLING: "Assembling", PACKING: "Packing", READY: "Ready", RIDER_ASSIGNED: "Ready · rider assigned", PICKED_UP: "Picked up", OUT_FOR_DELIVERY: "Delivering", ARRIVING: "At customer", DELIVERED: "Delivered" };
const preOrder = (status: OrderStatus) => ["CART", "CHECKOUT", "PAYMENT_PROCESSING"].includes(status);
const second = (at: string) => Math.round((Date.parse(at) - Date.parse(KITCHEN_EPOCH)) / 1000);

/** Pure projection: visiting HQ never seeds, dispatches or advances any product. */
export function selectHQ(state: DemoState) {
  const mission = getRiderMission(state);
  const timing = riderTiming(state);
  const now = timing.now;
  const status = state.currentOrder.status;
  const placed = !preOrder(status);
  const completed = status === "DELIVERED";
  const jobs = state.kitchenState.rush ? getKitchenJobs(state) : createKitchenRush().jobs;
  const kitchen = kitchenCounts(jobs);
  const heroJob = jobs.find(job => job.id === state.currentOrder.id);
  const elapsed = placed ? Math.max(0, (completed && state.currentOrder.deliveredAt ? second(state.currentOrder.deliveredAt) : now) - second(state.currentOrder.createdAt)) : 0;
  const late = placed && elapsed > state.currentOrder.promisedSeconds;
  const predictedLate = !!heroJob && !hasLeftKitchen(state) && Math.max(now + timing.food, timing.arrival) + CUSTOMER_TRAVEL_SECONDS + 10 > second(state.currentOrder.createdAt) + state.currentOrder.promisedSeconds;
  const hero: HQOrder = { id: state.currentOrder.id, customer: state.customer.name.split(" ")[0], dish: state.currentOrder.items.map(item => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`).join(", "), stage: labels[status] ?? status, rider: "Ravi Sharma", timing: completed ? clockDuration(elapsed) : placed ? `${Math.round(state.currentOrder.promisedSeconds / 60)}m target` : "Awaiting order", risk: !placed ? "Not started" : late ? "Past target" : predictedLate ? "Promise at risk" : completed ? "On time" : "On plan", canonical: true, active: placed && !completed };
  const supporting: HQOrder[] = jobs.filter(job => job.id !== hero.id).map(job => ({ id: job.id, customer: hqCustomerNames[job.id] ?? "Guest", dish: `${demoMenu.find(item => item.id === job.menuItemId)?.name ?? "Meal"}${job.quantity > 1 ? ` ×${job.quantity}` : ""}`, stage: job.stage.toLowerCase().replaceAll("_", " "), rider: job.riderName, timing: job.stage === "READY" ? "At handoff" : `${clockDuration(remainingTime(job, now))} prep`, risk: now > job.promisedAtSecond ? "Past target" : "On plan", canonical: false, active: job.stage !== "HANDED_OFF" }));
  const orders = [hero, ...supporting.sort((a,b) => a.id.localeCompare(b.id))];
  const pastTarget = orders.filter(order => order.active && order.risk === "Past target").length;
  const hotLoad = Math.min(98, Math.max(0, 72 + (kitchen.preparing - 6) * 8));
  const loads = [{ label: "Hot", value: hotLoad }, { label: "Assembly", value: Math.min(98, jobs.filter(job => job.stage === "ASSEMBLING").length * 24) }, { label: "Pack", value: Math.min(98, Math.round(jobs.filter(job => job.stage === "PACKING").length * 30.5)) }];
  const hasPlan = !!heroJob && placed;
  const foodAt = hasPlan ? state.kitchenState.rush?.heroReadyAtSecond ?? now + timing.food : null;
  const arrivalAt = hasPlan ? mission.kitchenArrivedAt ?? heroJob.riderArrivalAtSecond : null;
  const gap = foodAt !== null && arrivalAt !== null ? foodAt - arrivalAt : null;
  const sync = { foodAt, arrivalAt, actualFood: state.kitchenState.rush?.heroReadyAtSecond !== null && state.kitchenState.rush?.heroReadyAtSecond !== undefined, actualArrival: mission.kitchenArrivedAt !== null, gap, label: gap === null ? "Awaiting plan" : Math.abs(gap) <= 10 ? "Aligned" : gap > 0 ? "Rider wait" : "Food hold" };
  const forecast = coordinationForecast(state);
  const crossover = forecast.find(point => point.demand > point.riders)?.minute;
  const mint = coordinationInventory(state).find(item => item.id === "mint");
  const exceptions = [
    ...(placed && prepDelay(state) ? [{ id: "prep-delay", title: "GS-2847 preparation", detail: "Preparation slips by 2m", tag: "REVIEW", explanation: "The shared preparation plan includes 120 additional seconds. Recover the plan explicitly in Prototype; recorded milestones cannot be undone." }] : []),
    ...(placed && arrivalDelay(state) ? [{ id: "rider-delay", title: "Ravi arrival", detail: "Pickup slips by 3m", tag: "REVIEW", explanation: "The shared rider arrival plan includes 180 additional seconds. Kitchen, Rider, Customer and Intelligence use this same window." }] : []),
    ...(mint && mint.hoursRemaining < 2 ? [{ id: "mint", title: "Mint chutney", detail: `${mint.hoursRemaining.toFixed(1)}h stock cover`, tag: "LOW", explanation: `${mint.onHand} litres remain at ${mint.burnRate} litres per hour. Prepare the next batch; current orders can continue. This is the shared Kitchen inventory signal.` }] : []),
    { id: "supply", title: "Rider supply", detail: `Demand crosses supply in ${crossover}m`, tag: "WATCH", explanation: `Demand first exceeds rider capacity at +${crossover} minutes. Review available riders before the peak. These are planning slots per five-minute window, not live rider counts or a dispatch prediction.` },
    ...(pastTarget ? [{ id: "late", title: "Delivery targets", detail: `${pastTarget} active orders past target`, tag: "REVIEW", explanation: "Review the order stream for elapsed delivery targets. Check the current kitchen stage and rider before contacting customers." }] : []),
  ];
  const signal = !placed ? "Keep Vijay Nagar ready. No cooking window is scheduled for GS-2847 yet." : status === "QUEUED" ? `Start GS-2847 now. Pickup window ${arrivalAt === null ? "pending" : kitchenTime(arrivalAt)}.` : ["PREPARING", "ASSEMBLING", "PACKING"].includes(status) ? "Keep the extra mint chutney with GS-2847. Protect the pickup window." : ["READY", "RIDER_ASSIGNED"].includes(status) ? "Hold GS-2847 at Bay 4. Match the order with Ravi on arrival." : completed ? "GS-2847 is delivered. Review rider supply before the next demand peak." : "Keep Aarav’s handoff clear. Ravi is completing the final delivery leg.";
  const timeline = [
    { label: "Order placed", at: placed ? state.currentOrder.createdAt : null },
    { label: "Kitchen accepted / queued", at: state.orderEvents.find(event => ["KITCHEN_ACCEPTED", "QUEUED"].includes(event.status))?.occurredAt ?? null },
    { label: "Preparation started", at: state.orderEvents.find(event => event.status === "PREPARING")?.occurredAt ?? null },
    { label: "Rider assigned", at: state.deliveryAssignment?.assignedAt ?? null },
    { label: "Food ready", at: state.orderEvents.find(event => event.status === "READY")?.occurredAt ?? null },
    { label: "Rider arrives", at: mission.kitchenArrivedAt === null ? null : new Date(Date.parse(KITCHEN_EPOCH) + mission.kitchenArrivedAt * 1000).toISOString() },
    { label: "Pickup", at: state.deliveryAssignment?.pickedUpAt ?? null },
    { label: "Customer arrival", at: mission.customerArrivedAt === null ? null : new Date(Date.parse(KITCHEN_EPOCH) + mission.customerArrivedAt * 1000).toISOString() },
    { label: "Delivered", at: state.currentOrder.deliveredAt },
  ];
  const riders = state.riders.map(rider => ({ ...rider, displayState: rider.id === "ravi" && placed && !completed ? ({ assigned: "Scheduled pickup", to_kitchen: "To kitchen", at_kitchen: "Waiting at kitchen", picked_up: "Order collected", to_customer: "Delivering", arrived_customer: "At customer", handoff: "Verifying handoff", delivered: "Available", idle: "Available" }[mission.stage]) : ({ AVAILABLE: "Available", ASSIGNED: "To kitchen", AT_KITCHEN: "Waiting", DELIVERING: "Delivering", ON_BREAK: "On break" }[rider.status]), displayOrder: rider.id === "ravi" && placed && !completed ? hero.id : rider.currentOrder, eta: rider.id === "ravi" && placed && !completed ? ["to_customer", "picked_up"].includes(mission.stage) ? clockDuration(CUSTOMER_TRAVEL_SECONDS) : ["arrived_customer", "handoff", "at_kitchen"].includes(mission.stage) ? "Here" : clockDuration(timing.riderRemaining) : null }));
  return { hero, orders, kitchen, loads, sync, timeline, riders, exceptions, signal, now, elapsed, forecast, activeOrders: orders.filter(order => order.active).length, activeRiders: state.networkMetrics.activeRiders, kitchensOnline: state.kitchen.status === "OPEN" ? 1 : 0, health: pastTarget || predictedLate ? "Review needed" : "Flow healthy", scope: "Vijay Nagar · live snapshot" };
}
