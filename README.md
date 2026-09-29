# GO SERVE · Cluster 0

A local, coded product foundation. Cluster 0 stops at the entry experience and route shells.

## Run

Use Node.js 22 or newer. From this directory:

```sh
npm ci
npm run dev -- --port 3000
```

Open http://127.0.0.1:3000. For a production build locally, run `npm run build`, then `npm start -- --port 3001`.

## What was built

- A typography-led entry with four functional entrances and a disabled end-to-end teaser.
- Warm neutral design tokens, limited brand green, spacing, geometry, motion, and explicit typography classes.
- Locally bundled, OFL-licensed variable Manrope through `next/font/local`.
- Product-specific shells: Customer and Rider within a 390px desktop stage, Kitchen in near-black, Food OS in warm white.
- Semantic navigation, focus styles, skip link, reduced motion, and a discreet global prototype switcher.
- Typed menu, customer, kitchen, order, riders, inventory, metrics, alerts, and analytics.
- A shared client state provider, pure transition reducer, guarded action contracts, and reset.
- Six foundation tests plus lint, strict TypeScript, and production build scripts.

## Architecture decisions

Next.js App Router with TypeScript, React context/useReducer, CSS custom properties, and a small Framer Motion entrance. Page modules and root layout are server components; state and interactive controls are client components. No backend or remote runtime dependency is required. The font is local, avoiding a network fetch at build time.

The root layout owns one `DemoProvider`. Next Link navigation retains that provider across products. A hard reload or new tab starts a fresh demo; localStorage and cross-tab synchronization are intentionally absent.

`src/styles/tokens.css` defines the palette, spacing, radii, typography, and timing. `src/app/globals.css` implements the entry, shells, mobile stage, utility, responsive rules, and accessibility. A shared shell is appropriate here because these are route foundations; the later art-directed products should get their own components, not extend a universal dashboard template. Empty product component directories were not created.

Amounts in domain objects are integer **paise**. `formatINR` accepts rupees to match the supplied examples; `formatMoney` accepts domain paise. Durations are seconds, distance is metres, utilisation/SLA are ratios. Display rounding does not change source data.

Development output goes to `.next`; production output goes to `.next-build`. This permits a build while the preview is running.

## How DemoProvider works

`createInitialDemoState()` deep-clones fixtures to produce a fresh independent object graph. `demoReducer` is the only state transition point. `useDemo()` exposes the state plus stable actions. `orderStatus` and `assignedRider` are derived from the current order and assignment instead of duplicated state.

Available state includes `currentOrder`, `orderStatus`, `orderEvents`, `assignedRider`, `kitchenState`, `inventory`, `networkMetrics`, and `alerts`, plus customer, kitchen, cart, riders, and delivery assignment.

| Action | Cluster 0 contract |
| --- | --- |
| `placeDemoOrder()` | Moves CART to CHECKOUT; does not charge or submit anything. |
| `advanceOrder()` | Advances one legal stage; pauses at READY until a rider is assigned. |
| `setOrderStatus(status)` | Accepts only the immediate next stage. |
| `assignRider(id = "ravi")` | Requires READY and an available rider without an order. |
| `markReady()` | Valid only from PACKING. |
| `pickUpOrder()` | Valid only from RIDER_ASSIGNED. |
| `completeDelivery()` | Valid only from ARRIVING. |
| `resetDemo()` | Recreates the entire original state. |

Invalid, duplicate, backward, and post-delivery actions are safe no-ops. Events have deterministic IDs and a synthetic one-second increment for ordering. Basic order/payment state, kitchen order membership, rider availability, and assignment timestamps remain coherent. This is a contract scaffold, **not a timed delivery simulator**. Metrics, stock consumption, completed counts, alerts, and analytics side effects are deferred. None of the order progression actions are exposed as a walkthrough UI. The visible controls only navigate and reset.

The next clusters should add business effects centrally in `demo-engine.ts`, with tests for idempotent metric and inventory updates, before using these contracts for a complete order journey.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Minimal product entry |
| `/customer` | Customer foundation, mobile stage |
| `/kitchen` | Kitchen OS foundation, dark surface |
| `/rider` | Rider foundation, mobile stage |
| `/hq` | Food OS foundation |
| `/experience` | Reserved “coming next” shell; entry teaser disabled |

The prototype switcher appears at the bottom right. Click it or press **Alt+D**. Tab navigates its links and reset button. Escape closes it and returns focus. Clicking outside also closes it. The small order/status footer in every shell confirms shared state consumption. DEMO labels identify fictional data.

## Commands and validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

- ESLint: passed, no warnings or errors.
- TypeScript: passed under `strict: true`.
- Foundation tests: 6 passed. Covers currency/duration/percentage examples, aggregate consistency, fixture configuration, invalid transitions, rider prerequisites, terminal state, and independent reset.
- Production build: passed; entry and all five shells prerender successfully.
- Browser: all six routes loaded. Customer entrance, switcher links, back-to-entry, reset feedback, Alt+D, and disabled journey action checked.
- Responsive review: desktop 1440px, kitchen tablet 1024px, customer/rider 390px, and mobile entry. Checked layout width and inspected rendered views.

The initial Google-font build failed under network restrictions. Bundling Manrope locally resolved it. The test runner's OS lookup was blocked in the restricted shell; the same tests passed in the approved local execution context. No TypeScript errors were suppressed and no ESLint rules were disabled.

## Assumptions

- The supplied workspace was empty; this is a new standalone project rather than an edit to an existing app.
- “No production infrastructure” is treated as local-only: nothing was hosted or published.
- The fictional Friday is **25 September 2026, 20:14 IST**. This clock is fixed and does not use the viewer's timezone.
- Paneer bowl base price is ₹179; extra mint chutney is ₹10; demo total is ₹189. Delivery is ₹0. No additional tax calculation is implied by this prototype pricing.
- The seven named rider records are a representative subset of the 18 active network riders, not the entire roster.
- Analytics cover 10:00–20:14. Orders total 247 and GMV totals ₹71,846. AOV rounds to ₹291. Delivery and SLA series reconcile by order-weighted averaging; SLA is a synthetic aggregate, not a reconstructed integer count of successful deliveries.
- Inventory has exactly one low item (mint chutney), one attention item (lids), and eleven healthy items. Inventory cost is paise per listed unit; burn rate is units/hour.
- Food image records have explicit `src: null` and PLACEHOLDER treatment. No broken image elements or remote placeholders render. Real food photography belongs to the next art-directed customer cluster.

## Concerns and deliberate limits

This prototype has no persistence across reloads, real clock, automatic progression, payments, maps, GPS, authentication, backend, APIs, dispatch, stock ledger, finance logic, forecasting, or production infrastructure. Fixed analytics/metrics are baseline fixtures and will not change with the contract scaffold. Recipe consumption and accounting effects must be implemented when the journey is built.

Customer Home, Kitchen Rush, Rider Delivery, HQ Command Centre, full product journeys, and the future 50–60 screens were **not built**. `/experience` is only a reserved shell. Cluster 0 is complete; stop here for visual review.

## Exact source file manifest

All paths below are relative to this project directory. All are **newly created**. **Pre-existing files modified: none.** Intermediate revisions during implementation are included in the final new files below.

```text
.gitignore
README.md
eslint.config.mjs
next-env.d.ts
next.config.ts
package.json
package-lock.json
tsconfig.json
src/app/customer/page.tsx
src/app/experience/page.tsx
src/app/fonts/Manrope-Variable.ttf
src/app/fonts/OFL.txt
src/app/globals.css
src/app/hq/page.tsx
src/app/icon.svg
src/app/kitchen/page.tsx
src/app/layout.tsx
src/app/page.tsx
src/app/rider/page.tsx
src/components/shared/arrival.tsx
src/components/shared/brand.tsx
src/components/shared/product-shell.tsx
src/components/shared/prototype-switcher.tsx
src/context/demo-provider.tsx
src/data/demo-analytics.ts
src/data/demo-inventory.ts
src/data/demo-menu.ts
src/data/demo-orders.ts
src/data/demo-riders.ts
src/lib/demo-engine.ts
src/lib/format.ts
src/lib/order-state.ts
src/styles/tokens.css
src/types/index.ts
tests/foundations.test.ts
```

Generated dependency/build/cache directories (`node_modules`, `.next`, `.next-build`, and TypeScript build info) are ignored and excluded from the source manifest.
