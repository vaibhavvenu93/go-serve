import type { NextConfig } from "next";
const config: NextConfig = { reactStrictMode: true, devIndicators: false, distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next" };
export default config;
