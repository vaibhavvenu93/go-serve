"use client";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
export function Arrival({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return <LazyMotion features={domAnimation} strict><m.div className="arrival" initial={{ y: 8 }} animate={{ y: 0 }} transition={{ duration: reduceMotion ? 0 : .6, ease: [.2, .8, .2, 1] }}>{children}</m.div></LazyMotion>;
}
