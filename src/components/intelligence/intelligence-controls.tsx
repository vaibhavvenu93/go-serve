"use client";
import { useDemo } from "@/context/demo-provider";
import { intelligenceScenarios, type IntelligenceScenario } from "@/types/intelligence";
export function IntelligenceControls() {
  const demo = useDemo();
  return <label style={{ display: "grid", gap: 8, padding: "12px 0", fontSize: 12 }}>Intelligence scenario
    <select aria-label="Intelligence scenario" value={demo.intelligenceScenario ?? "BASELINE"} onChange={event => demo.setIntelligenceScenario(event.target.value as IntelligenceScenario)} style={{ width: "100%", minHeight: 44, padding: 8, background: "#f5f3ed", color: "#173b29", borderRadius: 6 }}>{intelligenceScenarios.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
    <span style={{ opacity: 0.75 }}>Shared across all surfaces. Recorded milestones stay intact.</span>
  </label>;
}
