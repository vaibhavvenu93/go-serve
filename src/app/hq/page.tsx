import type { Metadata } from "next";
import { HQOperations } from "@/components/hq/hq-operations";
export const metadata: Metadata = { title: "HQ / Live Operations" };
export default function HQPage() { return <HQOperations />; }
