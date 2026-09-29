"use client";
import { createContext, useContext, useMemo, useReducer, useEffect, useState } from "react";
import { DEMO_STORAGE_KEY, deserializeDemo, serializeDemo } from "@/lib/demo-persistence";
import { createInitialDemoState, demoReducer } from "@/lib/demo-engine";
import type { DemoState, OrderStatus, Rider } from "@/types";
import type { KitchenJobStage } from "@/types/kitchen";
import type { RiderAction } from "@/types/rider";
export interface DemoActions {
  nextDemoStep: () => void; advanceDemoClock: () => void; applyRecommendation: (expected: string) => void;
  setIntelligenceScenario: (scenario: import("@/types/intelligence").IntelligenceScenario) => void;
  riderAction: (action: RiderAction) => void;
  openKitchenRush: () => void; tickKitchenClock: () => void; toggleKitchenClock: () => void; advanceKitchenJob: (id: string, expectedStage: KitchenJobStage) => void;
  placeDemoOrder: () => void; advanceOrder: () => void; setOrderStatus: (status: OrderStatus) => void;
  assignRider: (id?: string) => void; markReady: () => void; pickUpOrder: () => void; completeDelivery: () => void; resetDemo: () => void;
}
interface DemoContextValue extends DemoState, DemoActions { orderStatus: OrderStatus; assignedRider: Rider | null; persistence: "loading" | "saved" | "unavailable" }
const DemoContext = createContext<DemoContextValue | null>(null);
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, createInitialDemoState);
  const [hydrated, setHydrated] = useState(false);
  const [persistence, setPersistence] = useState<"loading" | "saved" | "unavailable">("loading");
  useEffect(() => {
    try { const restored = deserializeDemo(localStorage.getItem(DEMO_STORAGE_KEY)); if (restored) dispatch({ type: "RESTORE_DEMO", state: restored }); setPersistence("saved"); } catch { setPersistence("unavailable"); }
    setHydrated(true);
  }, []);
  useEffect(() => { if (!hydrated) return; try { localStorage.setItem(DEMO_STORAGE_KEY, serializeDemo(state)); setPersistence("saved"); } catch { setPersistence("unavailable"); } }, [state, hydrated]);
  const actions = useMemo<DemoActions>(() => ({
    nextDemoStep: () => dispatch({ type: "DEMO_NEXT" }),
    advanceDemoClock: () => dispatch({ type: "DEMO_CLOCK" }),
    applyRecommendation: expected => dispatch({ type: "APPLY_RECOMMENDATION", expected }),
    setIntelligenceScenario: scenario => dispatch({ type: "SET_INTELLIGENCE_SCENARIO", scenario }),
    riderAction: action => dispatch(action),
    openKitchenRush: () => dispatch({ type: "OPEN_KITCHEN_RUSH" }),
    tickKitchenClock: () => dispatch({ type: "KITCHEN_TICK" }),
    toggleKitchenClock: () => dispatch({ type: "TOGGLE_KITCHEN_CLOCK" }),
    advanceKitchenJob: (id, expectedStage) => dispatch({ type: "ADVANCE_KITCHEN_JOB", id, expectedStage }),
    placeDemoOrder: () => dispatch({ type: "SET_STATUS", status: "CHECKOUT" }),
    advanceOrder: () => dispatch({ type: "ADVANCE" }),
    setOrderStatus: status => dispatch({ type: "SET_STATUS", status }),
    assignRider: (id = "ravi") => dispatch({ type: "ASSIGN_RIDER", riderId: id }),
    markReady: () => dispatch({ type: "SET_STATUS", status: "READY" }),
    pickUpOrder: () => dispatch({ type: "SET_STATUS", status: "PICKED_UP" }),
    completeDelivery: () => dispatch({ type: "SET_STATUS", status: "DELIVERED" }),
    resetDemo: () => dispatch({ type: "RESET" }),
  }), []);
  const value = useMemo<DemoContextValue>(() => ({ ...state, ...actions, persistence, orderStatus: state.currentOrder.status, assignedRider: state.riders.find(rider => rider.id === state.deliveryAssignment?.riderId) ?? null }), [state, actions, persistence]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
export function useDemo(): DemoContextValue { const context = useContext(DemoContext); if (!context) throw new Error("useDemo must be used inside DemoProvider"); return context; }
