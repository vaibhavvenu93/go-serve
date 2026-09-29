import type { MenuItem } from "@/types";

export const FOOD_INTENTS = ["All", "Veg", "Protein", "Comfort"] as const;
export type FoodIntent = typeof FOOD_INTENTS[number];
export type HomeQuantities = Record<string, number>;
export const TONIGHT_IDS = ["chicken-biryani", "rajma-chawal", "masala-dosa", "chole-bowl"];
const proteinIds = new Set(["paneer-bowl", "chicken-biryani", "chole-bowl", "egg-bowl", "butter-chicken"]);
const comfortIds = new Set(["rajma-chawal", "chole-bowl", "butter-chicken", "masala-dosa"]);

export function filterFood(items: MenuItem[], intent: FoodIntent, query = "") {
  const words = query.toLocaleLowerCase("en-IN").trim().split(/\s+/).filter(Boolean);
  return items.filter(item => item.available
    && (intent !== "Veg" || item.vegetarian)
    && (intent !== "Protein" || proteinIds.has(item.id))
    && (intent !== "Comfort" || comfortIds.has(item.id))
    && words.every(word => `${item.name} ${item.description} ${item.tags.join(" ")}`.toLocaleLowerCase("en-IN").includes(word)));
}

/** This selection belongs to Customer Home, not the future order/checkout flow. */
export function changeQuantity(quantities: HomeQuantities, id: string, delta: -1 | 1): HomeQuantities {
  const next = Math.min(9, Math.max(0, (quantities[id] ?? 0) + delta));
  return { ...quantities, [id]: next };
}
export function selectionSummary(quantities: HomeQuantities, menu: MenuItem[]) {
  return menu.reduce((summary, item) => {
    const quantity = quantities[item.id] ?? 0;
    return { count: summary.count + quantity, total: summary.total + item.price * quantity, minutes: quantity ? Math.max(summary.minutes, item.deliveryMinutes) : summary.minutes };
  }, { count: 0, total: 0, minutes: 0 });
}
