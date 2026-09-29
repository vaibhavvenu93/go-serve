# Cluster 4 — HQ Live Operations handoff

## 1. Files created

- `src/data/demo-hq.ts`
- `src/lib/hq-selectors.ts`
- `src/components/hq/hq-map.tsx`
- `src/components/hq/hq-demo-controls.tsx`
- `src/components/hq/hq-operations.tsx`
- `src/components/hq/hq-operations.module.css`
- `tests/hq-selectors.test.ts`
- `CLUSTER-4-HANDOFF.md`

## 2. Files modified

- `src/app/hq/page.tsx` — replaces the HQ shell with Live Operations.
- `src/components/shared/prototype-switcher.tsx` — mounts HQ-only walkthrough controls inside the existing utility.

SHA-256 comparison against the Cluster 3B source baseline confirms these are the only existing source files changed. Customer, Kitchen, Rider, landing, global styles, domain reducers, provider, and dependency manifests are unchanged.

## 3. HQ modules

A near-black operating canvas uses existing typography and restrained Go Serve green. The composition combines compact instrumentation, an illustrative neighbourhood map, a scrollable order stream, a prominent GS-2847 handoff strip, Kitchen capacity, a Rider roster, exceptions, one 30-minute planning graphic, and actionable Go Serve Signal.

The map has an observed kitchen, rider sample, customer destinations, delivery-zone outline, and a canonical route that changes during delivery. Markers and the GS-2847 annotation open contextual details. The map uses SVG and CSS, without a map API or dependency.

The order drawer shows customer, dish, kitchen, scheduled/assigned rider, target, synchronization, and nine recorded transaction milestones. Planned and recorded timestamps are explicitly distinguished. Supporting jobs have contextual detail rather than invented full transaction histories.

## 4. Data and timing integrity

HQ is a pure observer. `selectHQ` never dispatches, seeds an order, or modifies state. Opening HQ at the original CART baseline displays GS-2847 as Not Placed, with no handoff plan. Its stream includes the 17 supporting Kitchen snapshot jobs plus the canonical row. After order placement there are 18 active orders in this observed rush cohort; after delivery there are 17. Pickup removes GS-2847 from the Kitchen count while it remains an active delivery in HQ.

Only Vijay Nagar is represented as an observed kitchen. The existing 18-active-rider network aggregate and seven-record rider sample are labelled separately. The existing 12m 08s metric is correctly labelled average, not median. SLA and average delivery retain their network-snapshot scope.

The 30-minute forecast is separate structured illustrative data, measured in planning slots per five-minute window. It shows demand crossing rider capacity at +20 minutes while Kitchen capacity stays above demand. It is not a live dispatch model. The stock exception reads the existing mint-chutney inventory. Past-target active orders produce a further review exception and change system health.

During the matched preparation plan, the browser showed food target 20:20:23, planned rider arrival 20:20:15, and eight seconds of expected rider wait. If the presenter marks Food Ready early, HQ records that actual early completion and reports food hold instead of continuing to claim perfect alignment. The tested rapid walkthrough delivered at 20:25:55, 11:52 order-to-door.

## 5. Interactions and shared states tested

Verified order row → drawer; canonical customer/kitchen/rider facts; synchronization; full timeline; exception → contextual detail; rider detail; kitchen detail; Signal explanation; map marker controls; All/Active filters; close button; Escape; and return focus to the triggering control. The delivered canonical row disappears from Active and remains in All.

The separate Prototype utility progresses the existing shared actions through:

Reset → Place GS-2847 / queued → Kitchen preparing → assign Ravi → food ready → rider arrives → pickup → out for delivery → customer arrival → handoff → verify 2847 / delivered.

At queued, preparing, rider assignment, ready, picked up, delivering, and delivered checkpoints, product navigation confirmed consistent shared status across Customer, Kitchen, Rider, and HQ. Kitchen displays its appropriate active/ready row and removes it after pickup. Rider changes to the customer mission and later Delivered. Customer Home remains visually frozen; shared lifecycle status is available through the existing utility, with no new Customer tracking screen.

Opening HQ did not advance any checkpoint. The automated suite additionally verifies selector purity and all recorded milestones. Refreshing HQ restores the existing session-only CART baseline coherently; it does not seed a paid order.

All five routes (`/`, `/customer`, `/kitchen`, `/rider`, `/hq`) rendered during browser validation.

## 6. Responsive results

| Viewport | Result |
| --- | --- |
| 1440 × 900 | Full operating picture fits in 900px; no page overflow. |
| 1366 × 768 | Approximately 31px of lower-context vertical overflow; critical map, orders, network, and exceptions visible. |
| 1280 × 800 | Fits in 800px; no horizontal overflow. |
| 1024 × 768 | Intentional stacked layout with vertical scrolling; no horizontal overflow. |

Tables and roster use internal scrolling. The tablet order drawer fits within the viewport at 490px wide and scrolls its content independently. Controls remain accessible. Native dialog semantics provide focus trapping and Escape dismissal; text accompanies status colors, SVGs have descriptive labels, and inherited reduced-motion support remains intact.

## 7. Build / test / fix cycle

The continuous implementation cycle identified and fixed:

- A JSX closure error in the forecast rendering.
- Excess vertical space at the primary desktop size.
- Overlapping map controls near Kitchen and customer destinations.
- A stale reset message in the HQ prototype walkthrough.
- A health indicator that initially considered only canonical-order lateness, rather than every observed active order.

Validation was rerun after the fixes. Final command results are recorded below.

## 8. Final validation

- Automated regression suite: **25 tests passed**, including four new HQ tests.
- TypeScript: passed.
- ESLint: passed, no warnings or errors.
- Production build: passed; HQ generated successfully (8.95 kB route, 122 kB first-load JavaScript).
- Frozen-source comparison: passed; only the two declared existing source files differ.
- Required UI interactions, full shared journey, route rendering, refresh behavior, and responsive checks: passed.

## 9. Non-blocking limitations

The application remains an in-memory deterministic walkthrough. Refresh resets it; there is no durable backend. Rider positions and geography are illustrative, supporting jobs are a bounded rush snapshot, and aggregate network metrics do not recalculate as a single demo order moves. Forecast data is illustrative planning context. HQ deliberately does not change an order except through the separate Prototype utility.

No authentication, APIs, real mapping, database, WebSockets, actual dispatch, finance, HR, settings, reporting suite, chatbot, LLM, or additional application was built. No Customer tracking feature was added to the frozen Home screen.

Review the map/order balance, compact network density, and planned-versus-recorded handoff treatment. Work stops at Cluster 4, ready for visual review.

