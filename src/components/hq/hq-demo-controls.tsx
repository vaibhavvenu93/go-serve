"use client";
import { useDemo } from "@/context/demo-provider";
import { demoStepLabel, recommendationAction } from "@/lib/demo-orchestration";
export function HQDemoControls({ onAction }: { onAction: () => void }) {
  const demo = useDemo();
  const label = demoStepLabel(demo), decision = recommendationAction(demo);
  return <>{label ? <button className="reset-button" onClick={() => { demo.nextDemoStep(); onAction(); }}>{label}<span aria-hidden="true">→</span></button> : <p className="metadata muted">GS-2847 delivered · Ravi available</p>}
    {demo.intelligenceScenario && decision.label && <button className="reset-button" onClick={() => { demo.applyRecommendation(decision.key); onAction(); }}>Apply decision: {decision.label}<span aria-hidden="true">↗</span></button>}
  </>;
}
