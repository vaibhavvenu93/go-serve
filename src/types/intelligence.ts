export type IntelligenceScenario = "BASELINE" | "KITCHEN_DELAY" | "RIDER_DELAY" | "RIDER_SUPPLY" | "INVENTORY";
export const intelligenceScenarios: { value: IntelligenceScenario; label: string }[] = [
  { value: "BASELINE", label: "Healthy synchronization" },
  { value: "KITCHEN_DELAY", label: "Kitchen delay +2m" },
  { value: "RIDER_DELAY", label: "Rider delay +3m" },
  { value: "RIDER_SUPPLY", label: "Rider supply constraint" },
  { value: "INVENTORY", label: "Inventory constraint" },
];
