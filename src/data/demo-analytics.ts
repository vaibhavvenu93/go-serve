import type { AnalyticsPoint, NetworkMetrics } from "@/types";
export const baseNetworkMetrics: NetworkMetrics = { ordersToday: 247, gmv: 7184600, aov: Math.round(7184600 / 247), averageDeliverySeconds: 728, sla: .947, activeRiders: 18 };
/** Entire fictional day through 20:14. Throughput/demand are counts per bucket.
 * SLA and duration are order-weighted samples, not per-order records.
 * Last bucket spans 20:00–20:14; seven rider records are a network subset. */
const orders = [8, 11, 20, 28, 21, 13, 10, 17, 30, 51, 38];
const rupees = [2144, 2981, 5660, 8092, 5922, 3614, 2820, 4896, 8730, 15504, 11483];
const rawSeconds = [650, 660, 680, 710, 700, 670, 680, 720, 750, 770, 760];
const rawSla = [.98, .98, .97, .95, .96, .97, .97, .96, .94, .92, .93];
const avg = (values: number[]) => values.reduce((sum, value, i) => sum + value * orders[i], 0) / 247;
const durationAdjustment = 728 - avg(rawSeconds);
const slaAdjustment = .947 - avg(rawSla);
export const demoAnalytics: AnalyticsPoint[] = orders.map((count, i) => ({ hour: `${10 + i}:00`, orders: count, gmv: rupees[i] * 100, averageDeliverySeconds: rawSeconds[i] + durationAdjustment, sla: rawSla[i] + slaAdjustment, kitchenThroughput: count, demand: count + [1, 2, 3, 3, 2, 1, 1, 2, 4, 6, 4][i], riderUtilisation: [.38, .44, .61, .74, .66, .49, .45, .63, .78, .88, .82][i] }));
