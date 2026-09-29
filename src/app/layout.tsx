import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DemoProvider } from "@/context/demo-provider";
import { PrototypeSwitcher } from "@/components/shared/prototype-switcher";

const manrope = localFont({ src: "./fonts/Manrope-Variable.ttf", weight: "200 800", variable: "--font-manrope", display: "swap" });
export const metadata: Metadata = {
  title: { default: "GO SERVE — Quiet speed.", template: "%s / GO SERVE" },
  description: "The GO SERVE product universe. A fictional, local product prototype.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={manrope.variable}><a className="skip-link" href="#main">Skip to content</a><DemoProvider>{children}<PrototypeSwitcher /></DemoProvider></body></html>;
}
