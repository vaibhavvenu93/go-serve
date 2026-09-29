import type { Metadata } from "next";
import { ProductShell } from "@/components/shared/product-shell";
export const metadata: Metadata = { title: "One order — Coming next" };
export default function ExperiencePage() { return <ProductShell product="experience" />; }
