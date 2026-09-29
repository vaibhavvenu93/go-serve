/** Public currency helper accepts rupees, matching the brief's examples. */
export const formatINR = (rupees: number, decimals = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(rupees);
export const formatMoney = (paise: number, decimals = 0) => formatINR(paise / 100, decimals);
export function formatDuration(seconds: number): string { const value = Math.max(0, Math.round(seconds)); return `${Math.floor(value / 60)}m ${String(value % 60).padStart(2, "0")}s`; }
export const formatPercentage = (ratio: number) => new Intl.NumberFormat("en-IN", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(ratio);
export const formatMetric = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
export const formatTime = (date: string) => new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(date));
export const formatOrderNumber = (id: string) => id.startsWith("GS-") ? id : `GS-${id}`;
