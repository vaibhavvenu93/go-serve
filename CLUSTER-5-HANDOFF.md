# Cluster 5 — System Intelligence

Built at `/intelligence`. Ready for visual review; not frozen.

## 1. What was built

A dark, desktop-first coordination surface with a state-derived Live Decision, a shared Kitchen/Rider/Customer timing axis, five incoming signal groups, operational constraints, the HQ-derived 30-minute forecast, GO SERVE Signal, a deterministic evaluation trace, and a restrained system relationship strip. The header identifies Vijay Nagar, Dinner Rush, the simulated clock, and COORDINATING status.

The healthy prepared snapshot shows food ready at 20:20:23, Ravi arriving at 20:20:15, an 8-second rider wait, and delivery at the 20:26:03 promise. These values come from the existing canonical model; they do not copy the illustrative timestamps in the brief.

## 2. Exact files created / changed

Created:

- `src/app/intelligence/page.tsx`
- `src/components/intelligence/intelligence.tsx`
- `src/components/intelligence/intelligence.module.css`
- `src/components/intelligence/intelligence-controls.tsx`
- `src/lib/intelligence-selectors.ts`
- `src/types/intelligence.ts`
- `tests/intelligence-selectors.test.ts`
- `CLUSTER-5-HANDOFF.md`

Changed:

- `src/types/index.ts` — optional scenario selection on DemoState.
- `src/lib/demo-engine.ts` — scenario selection action; baseline removes the optional override.
- `src/context/demo-provider.tsx` — exposes scenario selection through the existing provider.
- `src/components/shared/prototype-switcher.tsx` — Intelligence link, route-scoped scenario controls and existing explicit walkthrough controls; bounded utility scrolling on this route.

No package, dependency, global stylesheet, frozen route, frozen component, existing domain selector, fixture, or existing test was changed. A SHA-256 comparison against the pre-Cluster-5 source snapshot identified exactly the four existing files above as changed.

## 3. State and selectors

`selectIntelligence` is a pure projection over DemoState, `selectHQ`, shared Kitchen timing, and Rider mission constants. It derives preparation/arrival/handoff/delivery times, promise margin, rider wait, food hold, constraints, forecast crossover, recommendation, signal, and the current evaluation trace.

The only added shared state is the optional scenario enum. No duplicated order, transaction history, stock balance, rider assignment, or kitchen queue is introduced. There is no dispatch or order-seeding effect on route entry. Recorded milestones take precedence over scenario estimates. Timestamp presentation follows the existing whole-second timing model.

## 4. Interactions

- GS-2847 opens order, timing, recommendation, calculation and evaluation details.
- Mint chutney opens stock-cover context.
- Rider supply opens the forecast table and capacity constraint.
- Order details link to Customer, Kitchen, Rider and HQ.
- Native modal drawers support close buttons, Escape, explicit Tab containment and focus restoration.
- Prototype supports scenario selection, reset, and the existing explicit canonical walkthrough.
- Product detail interactions do not advance the order. Only deliberately selected Prototype walkthrough actions do.

## 5. Scenario behaviour

Scenarios are visibly labelled **what-if projections**. They affect Intelligence estimates without rewriting frozen product records.

| Scenario | Result on healthy prepared snapshot |
| --- | --- |
| Healthy synchronization | Canonical 380s food readiness / 372s rider arrival; 8s wait; 720s delivery; zero promise buffer |
| Kitchen delay +2m | Food ready 500s; 128s rider wait; handoff 500s; delivery 840s; 120s beyond promise; RECOVER PREP |
| Rider delay +3m | Rider arrival 552s; 172s food hold; handoff 552s; delivery 892s; 172s beyond promise; REVIEW PICKUP |
| Rider supply constraint | Four fewer illustrative rider slots per window; demand crossover shifts from +20m to +15m |
| Inventory constraint | Projected mint cover becomes 0.4h / 24 minutes; critical replenishment guidance; canonical 1.5h stock cover unchanged |
| Healthy after a scenario | Removes the override and returns exactly to the pre-scenario canonical state |
| Reset demo | Restores the original complete CART state, including clearing the scenario, rush and rider mission |

Delay scenarios do not move recorded readiness, recorded arrival, completed pickup, or delivery. If a selected delay no longer applies, the UI explains that recorded times are preserved.

## 6. Canonical GS-2847 validation

Browser checks confirmed Aarav, Paneer Tikka Rice Bowl, Ravi Sharma and GS-2847 across Customer, Kitchen, Rider, HQ and Intelligence. HQ and Intelligence showed the same 20:20:23 readiness, 20:20:15 arrival and 8-second wait. Entering Intelligence preserved lifecycle and simulated time.

The explicit browser walkthrough covered queue, preparation, Ravi assignment, readiness, kitchen arrival, pickup, outbound delivery, customer arrival, handoff and verified completion. Intelligence changed from START NOW / KEEP PREPARING through delivery guidance to PROMISE MET. Automated tests also exercise the shared full journey and preserve recorded milestones under both delay scenarios.

All required routes were opened successfully: `/`, `/customer`, `/kitchen`, `/rider`, `/hq`, `/intelligence`.

## 7. Responsive and accessibility validation

Checked 1440×900, 1366×768, 1024×768 and 390×844 in the in-app browser. No horizontal page overflow was observed. The mobile timing axis has its own bounded horizontal scroll region.

At 1366×768, the full critical signals region ends at approximately 740px, following the hero and timeline. The 1024px treatment was tightened further to keep the network signal clear of the floating Prototype control. Full desktop lower sections, timeline labels, wrapping, drawer bounds and mobile typography were visually inspected.

Fixed during QA: below-fold signals at 1366px, scrollbar-width clipping on the mobile drawer, focus leaving a single-control drawer on Tab, and Prototype overlap with the 1024px network signal. Escape closes drawers and restores focus. Status has textual labels; timing also distinguishes recorded and projected milestones. No new animation is introduced.

## 8–11. Engineering validation

| Check | Result |
| --- | --- |
| `npm run lint` | PASS — no warnings or errors |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — optimized Next.js build; `/intelligence` generated successfully |
| `npm test` | PASS — 30 tests, 0 failures; 25 existing and 5 new tests |

New tests cover pure/no-plan entry, healthy timing and canonical identity, delay arithmetic and promise impact, supply/inventory scenarios, unchanged HQ projections, exact reset, recorded-milestone protection and verified completion. An initial test exposed millisecond precision in recorded event ordering; the selector now uses whole seconds consistently with existing operational displays, and the suite passed after repair.

## 12. Remaining limitations

- This remains an explicitly simulated, session-only prototype, with no production telemetry or dispatch backend.
- What-if scenario estimates are scoped to Intelligence. The frozen screens retain their canonical data and behaviour.
- The shared clock advances through the existing Kitchen simulation and explicit demo actions; Intelligence does not start a new timer or advance the transaction.
- Reset intentionally returns to the established CART baseline. To inspect healthy active synchronization, use Prototype → Place GS-2847 → Kitchen preparing.
- Forecast capacity is illustrative planning slots per five-minute window, not a live rider count or dispatch prediction.
- Mobile retains a scrollable timing axis; the primary operating target remains desktop.

Cluster 5 is ready for visual review.
