/** Illustrative planning context, separate from the shared canonical transaction. */
export const hqForecast = [
  { minute: 0, demand: 18, kitchen: 29, riders: 27 },
  { minute: 5, demand: 20, kitchen: 29, riders: 27 },
  { minute: 10, demand: 23, kitchen: 30, riders: 27 },
  { minute: 15, demand: 25, kitchen: 30, riders: 26 },
  { minute: 20, demand: 26, kitchen: 30, riders: 25 },
  { minute: 25, demand: 27, kitchen: 31, riders: 25 },
  { minute: 30, demand: 28, kitchen: 31, riders: 26 },
];
export const hqCustomerNames: Record<string, string> = { "GS-2848": "Isha", "GS-2849": "Kabir", "GS-2850": "Meera", "GS-2851": "Rohan", "GS-2843": "Ananya", "GS-2845": "Dev", "GS-2846": "Nisha", "GS-2842": "Arjun", "GS-2852": "Tara", "GS-2853": "Yash", "GS-2838": "Neel", "GS-2854": "Diya", "GS-2855": "Aditi", "GS-2856": "Kunal", "GS-2844": "Riya", "GS-2839": "Om", "GS-2837": "Maya" };
export const hqRiderPositions: Record<string, [number, number]> = { ravi: [215, 270], imran: [458, 104], pooja: [130, 190], rohit: [318, 242], neha: [520, 237], amit: [244, 240], sahil: [110, 294] };
export const hqLandmarks = [{ x: 102, y: 55, label: "SCHEME 54" }, { x: 418, y: 305, label: "VIJAY NAGAR" }, { x: 377, y: 88, label: "NEHRU GARDEN" }];
