export type KitchenJobStage = "QUEUED" | "PREPARING" | "ASSEMBLING" | "PACKING" | "READY" | "HANDED_OFF";
export type KitchenStation = "HOT" | "ASSEMBLY" | "PACK" | "HANDOFF";
export interface KitchenJob {
  id: string;
  menuItemId: string;
  quantity: number;
  stage: KitchenJobStage;
  station: KitchenStation;
  prepSeconds: number;
  remainingAtStart: number;
  startedAtSecond: number | null;
  promisedAtSecond: number;
  riderName: string;
  riderArrivalAtSecond: number;
  bay: number | null;
  note: string;
}
export interface KitchenRushState {
  elapsedSeconds: number;
  running: boolean;
  /** Supporting jobs only. GS-2847 always reads its stage from currentOrder. */
  jobs: KitchenJob[];
  heroStartedAtSecond: number | null;
  heroReadyAtSecond: number | null;
}
