import type { KitchenJob, KitchenRushState } from "@/types/kitchen";

/** A deterministic operational snapshot, loaded only on entering Kitchen Rush. */
export const KITCHEN_EPOCH = "2026-09-25T20:14:03+05:30";
export const HERO_PREP_SECONDS = 380;
export const HERO_RIDER_TRAVEL_SECONDS = 252;
export const HERO_RIDER_RELEASE_SECONDS = 120;
export const HERO_RIDER_ARRIVAL_SECONDS = HERO_RIDER_RELEASE_SECONDS + HERO_RIDER_TRAVEL_SECONDS;

function job(id: string, menuItemId: string, stage: KitchenJob["stage"], remaining: number, extra: Partial<KitchenJob> = {}): KitchenJob {
  return { id: `GS-${id}`, menuItemId, quantity: 1, stage, station: stage === "ASSEMBLING" ? "ASSEMBLY" : stage === "PACKING" ? "PACK" : stage === "READY" ? "HANDOFF" : "HOT", prepSeconds: 360, remainingAtStart: remaining, startedAtSecond: stage === "QUEUED" ? null : 0, promisedAtSecond: 720, riderName: "Rider scheduled", riderArrivalAtSecond: 240, bay: null, note: "Regular", ...extra };
}
export function createKitchenRush(): KitchenRushState {
  return {
    elapsedSeconds: 0, running: true, heroStartedAtSecond: null, heroReadyAtSecond: null,
    jobs: [
      job("2843", "chicken-biryani", "PREPARING", 138, { quantity: 2, riderName: "Aditya Singh", riderArrivalAtSecond: 180 }),
      job("2845", "butter-chicken", "PREPARING", 186, { riderName: "Nitin Dubey", riderArrivalAtSecond: 210 }),
      job("2846", "egg-bowl", "PREPARING", 48, { riderName: "Suresh Pal", riderArrivalAtSecond: 60, note: "Finish eggs · rider close" }),
      job("2842", "rajma-chawal", "PREPARING", 204, { riderName: "Ankit Soni", riderArrivalAtSecond: 240 }),
      job("2852", "paneer-bowl", "PREPARING", 262, { riderName: "Deepak Sen", riderArrivalAtSecond: 300 }),
      job("2853", "chole-bowl", "PREPARING", 288, { riderName: "Vikas Rao", riderArrivalAtSecond: 320 }),
      job("2838", "masala-dosa", "ASSEMBLING", 102, { riderName: "Manoj Patel", riderArrivalAtSecond: 120 }),
      job("2854", "rajma-chawal", "ASSEMBLING", 114, { riderName: "Akash Joshi", riderArrivalAtSecond: 150 }),
      job("2855", "paneer-bowl", "PACKING", 72, { riderName: "Nilesh Shah", riderArrivalAtSecond: 90 }),
      job("2856", "chicken-biryani", "PACKING", 84, { riderName: "Rakesh Verma", riderArrivalAtSecond: 100 }),
      job("2844", "rajma-chawal", "READY", 0, { riderName: "Rohit Patel", riderArrivalAtSecond: 0, bay: 2 }),
      job("2839", "chole-bowl", "READY", 0, { riderName: "Kunal Gupta", riderArrivalAtSecond: 60, bay: 1 }),
      job("2837", "chicken-biryani", "READY", 0, { riderName: "Sanjay Rathore", riderArrivalAtSecond: 120, bay: 3 }),
      job("2848", "masala-dosa", "QUEUED", 420, { quantity: 2, prepSeconds: 420, riderName: "Pooja Verma", riderArrivalAtSecond: 450 }),
      job("2849", "chicken-biryani", "QUEUED", 300, { prepSeconds: 300, riderName: "Sahil Jain", riderArrivalAtSecond: 380 }),
      job("2850", "chole-bowl", "QUEUED", 300, { prepSeconds: 300, riderName: "Aditya Singh", riderArrivalAtSecond: 480 }),
      job("2851", "butter-chicken", "QUEUED", 360, { riderName: "Nitin Dubey", riderArrivalAtSecond: 540 }),
    ],
  };
}
