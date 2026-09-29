import type { Rider } from "@/types";
export const demoRiders: Rider[] = [
  { id: "ravi", name: "Ravi Sharma", initials: "RS", status: "AVAILABLE", distanceFromKitchen: 310, currentOrder: null, rating: 4.9, deliveriesToday: 16, utilisation: .76, location: { lat: 22.7531, lng: 75.8976 }, vehicle: "ELECTRIC_SCOOTER" },
  { id: "imran", name: "Imran Khan", initials: "IK", status: "DELIVERING", distanceFromKitchen: 1240, currentOrder: "GS-2841", rating: 4.8, deliveriesToday: 18, utilisation: .88, location: { lat: 22.7601, lng: 75.9012 }, vehicle: "MOTORCYCLE" },
  { id: "pooja", name: "Pooja Verma", initials: "PV", status: "AVAILABLE", distanceFromKitchen: 460, currentOrder: null, rating: 4.9, deliveriesToday: 14, utilisation: .72, location: { lat: 22.7484, lng: 75.8987 }, vehicle: "ELECTRIC_SCOOTER" },
  { id: "rohit", name: "Rohit Patel", initials: "RP", status: "AT_KITCHEN", distanceFromKitchen: 0, currentOrder: "GS-2844", rating: 4.7, deliveriesToday: 17, utilisation: .84, location: { lat: 22.7512, lng: 75.8954 }, vehicle: "MOTORCYCLE" },
  { id: "neha", name: "Neha Yadav", initials: "NY", status: "DELIVERING", distanceFromKitchen: 980, currentOrder: "GS-2840", rating: 4.8, deliveriesToday: 15, utilisation: .81, location: { lat: 22.7569, lng: 75.9027 }, vehicle: "ELECTRIC_SCOOTER" },
  { id: "amit", name: "Amit Joshi", initials: "AJ", status: "ON_BREAK", distanceFromKitchen: 120, currentOrder: null, rating: 4.7, deliveriesToday: 20, utilisation: .85, location: { lat: 22.7521, lng: 75.8961 }, vehicle: "MOTORCYCLE" },
  { id: "sahil", name: "Sahil Jain", initials: "SJ", status: "AVAILABLE", distanceFromKitchen: 620, currentOrder: null, rating: 4.8, deliveriesToday: 12, utilisation: .68, location: { lat: 22.747, lng: 75.8915 }, vehicle: "BICYCLE" },
];
