import type { Metadata } from "next";
import { CustomerHome } from "@/components/customer/customer-home";
export const metadata: Metadata = { title: "Customer" };
export default function CustomerPage() { return <CustomerHome />; }
