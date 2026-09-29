import type { Metadata } from "next";
import { Intelligence } from "@/components/intelligence/intelligence";
export const metadata: Metadata = { title: "System Intelligence" };
export default function IntelligencePage() { return <Intelligence />; }
