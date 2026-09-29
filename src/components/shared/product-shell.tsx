"use client";
import Link from "next/link";
import { Brand } from "./brand";
import { useDemo } from "@/context/demo-provider";
type Product = "customer" | "kitchen" | "rider" | "hq" | "experience";
const products = {
  customer: { label: "CUSTOMER", number: "01", headline: "Experience\nbegins here.", note: "Good food. Close by.", mobile: true },
  kitchen: { label: "KITCHEN OS", number: "02", headline: "Calm.\nUnder control.", note: "Go Serve — Vijay Nagar", mobile: false },
  rider: { label: "RIDER", number: "03", headline: "Ready for\nwhat’s next.", note: "Vijay Nagar, Indore", mobile: true },
  hq: { label: "FOOD OS", number: "04", headline: "A wider\nperspective.", note: "The Go Serve network", mobile: false },
  experience: { label: "ONE ORDER", number: "05", headline: "One order.\nEvery perspective.", note: "The end-to-end experience is coming next.", mobile: false },
} as const;
export function ProductShell({ product }: { product: Product }) {
  const item = products[product];
  const { currentOrder, orderStatus } = useDemo();
  return <div className={`product-stage stage-${product} ${item.mobile ? "mobile-stage" : "wide-stage"}`}><div className="product-canvas">
    <header className="shell-header"><Brand /><span className="demo-label">DEMO</span></header>
    <main id="main" className="shell-main"><div className="shell-intro"><p className="eyebrow">{item.number} <span className="separator">/</span> {item.label}</p><h1 className={item.mobile ? "headline" : "display-lg"}>{item.headline.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h1><p className="body muted">{item.note}</p></div><div className="shell-foundation"><span className="small-rule" /><p className="metadata muted">FOUNDATION ONLY<br />This experience takes shape in the next cluster.</p></div></main>
    <footer className="shell-footer"><Link href="/" className="label back-link">← All experiences</Link><span className="metadata muted" aria-label={`Shared demo order ${currentOrder.id}, ${orderStatus}`}>{currentOrder.id} <span className="separator">/</span> {orderStatus.replaceAll("_", " ")}</span></footer>
  </div></div>;
}
