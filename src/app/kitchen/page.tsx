import type { Metadata } from "next";
import { KitchenRush } from "@/components/kitchen/kitchen-rush";
export const metadata: Metadata = { title: "Kitchen OS" };
export default function KitchenPage() { return <KitchenRush />; }
