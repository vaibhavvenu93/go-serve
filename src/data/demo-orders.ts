import type { Cart, Customer, Kitchen, Order } from "@/types";
import { demoMenu } from "./demo-menu";
/** Friday, 25 September 2026, 20:14 IST. Frozen fictional demo clock. */
export const SIMULATED_AT = "2026-09-25T20:14:00+05:30";
export const demoCustomer: Customer = { id: "customer-aarav", name: "Aarav Mehta", defaultAddressId: "address-home", addresses: [{ id: "address-home", label: "Home", line1: "Flat 302, Narmada Residency", locality: "Vijay Nagar", city: "Indore", state: "Madhya Pradesh", postalCode: "452010", location: { lat: 22.7558, lng: 75.9021 }, instructions: "Leave at the door. Please ring the bell." }] };
export const demoKitchen: Kitchen = { id: "kitchen-vijay-nagar", name: "Go Serve — Vijay Nagar", zone: "Vijay Nagar", location: { lat: 22.7512, lng: 75.8954 }, serviceRadiusMetres: 2500, status: "OPEN" };
export const demoCart: Cart = { id: "cart-aarav", customerId: demoCustomer.id, kitchenId: demoKitchen.id, items: [{ id: "cart-item-1", menuItemId: "paneer-bowl", quantity: 1, variantId: "regular", spiceLevel: "MEDIUM", addonIds: ["extra-mint"] }] };
const paneer = demoMenu[0];
export const demoOrder: Order = { id: "GS-2847", customerId: demoCustomer.id, kitchenId: demoKitchen.id, address: demoCustomer.addresses[0], items: [{ id: "order-item-1", menuItemId: paneer.id, name: paneer.name, quantity: 1, basePrice: paneer.price, variant: paneer.variants[0], spiceLevel: "MEDIUM", addons: paneer.addons, lineTotal: 18900 }], subtotal: 18900, deliveryFee: 0, total: 18900, status: "CART", payment: { status: "UNPAID" }, createdAt: SIMULATED_AT, updatedAt: SIMULATED_AT, promisedSeconds: 900, deliveredAt: null };
