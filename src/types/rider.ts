export type RiderMissionStage = "idle" | "assigned" | "to_kitchen" | "at_kitchen" | "picked_up" | "to_customer" | "arrived_customer" | "handoff" | "delivered";
export interface RiderMission {
  stage: RiderMissionStage;
  online: boolean;
  elapsedSeconds: number;
  kitchenArrivedAt: number | null;
  customerArrivedAt: number | null;
  deliveredAt: number | null;
}
export type RiderAction =
  | { type: "RIDER_PREPARE_DEMO" }
  | { type: "RIDER_READY_DEMO" }
  | { type: "RIDER_NAVIGATE_KITCHEN" }
  | { type: "RIDER_ARRIVE_KITCHEN" }
  | { type: "RIDER_PICKUP" }
  | { type: "RIDER_NAVIGATE_CUSTOMER" }
  | { type: "RIDER_ARRIVE_CUSTOMER" }
  | { type: "RIDER_HANDOFF" }
  | { type: "RIDER_VERIFY"; code: string }
  | { type: "RIDER_FINISH" }
  | { type: "RIDER_TOGGLE_ONLINE" };
