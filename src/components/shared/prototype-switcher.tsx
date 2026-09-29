"use client";
import { IntelligenceControls } from "@/components/intelligence/intelligence-controls";
import { HQDemoControls } from "@/components/hq/hq-demo-controls";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDemo } from "@/context/demo-provider";
const routes = [{ href: "/", name: "Entry" }, { href: "/customer", name: "Customer" }, { href: "/kitchen", name: "Kitchen" }, { href: "/rider", name: "Rider" }, { href: "/hq", name: "HQ" }, { href: "/intelligence", name: "Intelligence" }];
export function PrototypeSwitcher() {
  const [open, setOpen] = useState(false), [message, setMessage] = useState("");
  const pathname = usePathname(), demo = useDemo();
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) { setOpen(false); trigger.current?.focus(); }
      if (event.altKey && event.key.toLowerCase() === "d") { event.preventDefault(); setOpen(value => !value); trigger.current?.focus(); }
    };
    const onOutside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("keydown", onKey); document.addEventListener("pointerdown", onOutside);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onOutside); };
  }, [open]);
  return <div ref={root} className="prototype-utility">
    <button ref={trigger} className="prototype-trigger" disabled={demo.persistence === "loading"} aria-expanded={open} aria-controls="prototype-panel" aria-label="Prototype switcher" aria-keyshortcuts="Alt+D" onClick={() => setOpen(value => !value)}><span aria-hidden="true">⌘</span><span>Prototype</span></button>
    {open && <div id="prototype-panel" className="prototype-panel" style={{ maxHeight: "calc(100dvh - 120px)", overflowY: "auto", overscrollBehavior: "contain" }}><div className="utility-heading"><span className="eyebrow">PROTOTYPE</span><span className="metadata muted">Alt + D</span></div><nav aria-label="Prototype navigation">{routes.map(route => <Link key={route.href} href={route.href} aria-current={pathname === route.href ? "page" : undefined} onClick={() => { setOpen(false); setMessage(""); }}>{route.name}<span aria-hidden="true">{pathname === route.href ? "•" : "↗"}</span></Link>)}</nav><div className="utility-state metadata"><span>{demo.currentOrder.id}</span><span>{demo.orderStatus.replaceAll("_", " ")}</span></div><IntelligenceControls /><HQDemoControls onAction={() => setMessage("")} />{demo.kitchenState.rush && <button className="reset-button" onClick={demo.advanceDemoClock}>Advance clock +30s<span aria-hidden="true">→</span></button>}<button className="reset-button" onClick={() => { demo.resetDemo(); setMessage("System reset. GS-2847 is back in cart."); }}>Reset demo <span aria-hidden="true">↺</span></button><p className="metadata muted utility-status" role="status">{message || (demo.persistence === "unavailable" ? "Browser storage unavailable · refresh will reset this session" : "Simulated data · Saved in this browser")}</p></div>}
  </div>;
}
