import type { InventoryItem, InventoryStatus } from "@/types";
/** Burn rate is units/hour; cost is paise per unit. Thresholds apply to coverage. */
export function inventoryStatus(hours: number): InventoryStatus { return hours < 2 ? "LOW" : hours < 4 ? "ATTENTION" : "HEALTHY"; }
const stock: Omit<InventoryItem, "hoursRemaining" | "status">[] = [
  { id: "paneer", name: "Paneer", unit: "kg", onHand: 12.4, parLevel: 18, burnRate: 2.4, cost: 32000 },
  { id: "rice", name: "Basmati rice", unit: "kg", onHand: 35, parLevel: 50, burnRate: 5, cost: 11000 },
  { id: "chicken", name: "Chicken", unit: "kg", onHand: 17, parLevel: 24, burnRate: 3.2, cost: 24000 },
  { id: "rajma", name: "Rajma", unit: "kg", onHand: 9, parLevel: 12, burnRate: 1.2, cost: 14500 },
  { id: "chole", name: "Chole", unit: "kg", onHand: 8.5, parLevel: 12, burnRate: 1.1, cost: 10500 },
  { id: "eggs", name: "Eggs", unit: "piece", onHand: 180, parLevel: 240, burnRate: 26, cost: 650 },
  { id: "mint", name: "Mint chutney", unit: "litre", onHand: 1.8, parLevel: 6, burnRate: 1.2, cost: 16000 },
  { id: "onion", name: "Onion", unit: "kg", onHand: 16, parLevel: 22, burnRate: 2.2, cost: 3500 },
  { id: "tomato", name: "Tomato", unit: "kg", onHand: 14, parLevel: 20, burnRate: 2.1, cost: 4200 },
  { id: "yoghurt", name: "Yoghurt", unit: "kg", onHand: 8, parLevel: 12, burnRate: 1.4, cost: 8000 },
  { id: "bowls", name: "Packaging bowls", unit: "piece", onHand: 420, parLevel: 600, burnRate: 48, cost: 650 },
  { id: "lids", name: "Lids", unit: "piece", onHand: 165, parLevel: 600, burnRate: 48, cost: 250 },
  { id: "cutlery", name: "Cutlery sets", unit: "piece", onHand: 380, parLevel: 500, burnRate: 38, cost: 300 },
];
export const demoInventory: InventoryItem[] = stock.map(item => ({ ...item, hoursRemaining: item.onHand / item.burnRate, status: inventoryStatus(item.onHand / item.burnRate) }));
