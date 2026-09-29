# GO SERVE — Final V1 handoff

Validation date: 29 September 2026. This report supersedes historical cluster reports where their former isolated-demo behavior differs from the integrated V1.

1. **Final V1 status:** Operational deterministic prototype. The approved visual systems are retained. Changes to frozen surfaces address integration, navigation, canonical timing, and completion defects.

2. **Built in this pass:** Shared explicit lifecycle orchestration; browser refresh persistence with versioned save validation; canonical Customer order sheet and tracking; shared exception projections; explicit recovery actions; bounded operational decision history; consolidated Prototype progression, scenario, clock, reset, and navigation controls. Removed Kitchen entry seeding and automatic clock progression. Fixed inconsistent prep copy and placement timestamps after support work.

3. **GS-2847 journey:** Customer accepts the simulated ₹189 paneer bowl order → queued → preparing → Ravi assigned to pickup → assembling → packing → rider arrives → food ready → pickup → delivery leg → customer arrival → verified handoff → delivered → Ravi available. The normal fixture finishes at 20:26:03, exactly 720 seconds after placement. Order configuration and historical milestones are preserved.

4. **Cross-surface synchronization:** Customer shows the corresponding stage, estimate, receipt and completion. Kitchen derives production and removes the collected order from active work. Rider derives pickup/delivery/available state. HQ shows the canonical order, timing, exceptions and completion. Intelligence uses the same timing and reports the final outcome. Browser navigation through all six routes preserved CART after reset; selector purity is tested at lifecycle checkpoints. Refresh preserved a preparing order with an active kitchen delay and its decision history. `/` remains the established entry page; Customer remains `/customer`.

5. **Exceptions:** Baseline, kitchen +120 seconds, rider +180 seconds, inventory at 0.4 hours, and reduced rider supply all passed deterministic tests. All four scenario triggers and explicit recoveries were exercised in the browser. Kitchen/Rider/Customer timing and HQ/Intelligence projections share the same inputs. Inventory is shared with Kitchen/HQ; the constrained supply outlook is shared by HQ/Intelligence. Recovery returns future planning to baseline without rewriting recorded arrivals or pickup.

6. **Decision/action/trace:** Prototype applies an explicit recovery or advances the canonical journey. History records the action, simulated time, changed signal, decision, relevant reason, protected constraints and resulting state/timing/stock/supply. History is visible within the existing Decision Trace. Repeated stale recovery actions are guarded. The current evaluation snapshot remains separate from the applied history.

7. **Responsive checks:** Customer, Kitchen, Rider, HQ and Intelligence inspected at 1440×900, 1366×768 and 1024×768. Customer and Rider additionally inspected at 390×844 and 430×932. No page-level horizontal overflow measured. Intelligence synchronization remains fully visible without a horizontal scrollbar; lower planning, trace and architecture sections inspected. Customer receipt, Intelligence drawer and Prototype utility fit their viewports. Existing deliberate vertical operational lists and horizontal food browsing remain. No broad visual redesign was performed.

8. **Accessibility:** Native buttons/selects/dialogs and existing accessible labels retained. Keyboard placement, Tab access, visible focus, Escape dismissal and focus return checked. Rider controls measured at least 44px tall; new Customer close and primary actions are 44px and 52px respectively. Existing reduced-motion CSS and motion preference handling retained. Basic visual contrast reviewed. This is a practical V1 check, not a formal accessibility certification or physical-device/screen-reader audit.

9. **Tests:** 36/36 pass (`npm test`): 30 existing tests plus six V1 integration tests. Covers reset, all lifecycle stages, shared delays, protected recorded milestones, inventory/supply recovery, stale actions, persistence round trips at each milestone, passive selectors, invalid saves and placement after earlier support work. Browser checks additionally covered the complete loop, recovery controls, refresh and passive routes. No visible runtime or hydration error surfaced during the exercised journeys.

10. **Lint:** `npm run lint` passes with no warnings or errors.

11. **Typecheck:** `npm run typecheck` passes.

12. **Production build:** `npm run build` passes; all existing application routes are generated. One final self-review followed the complete validation run. Its trace refinements were followed by the affected tests, lint, typecheck and build.

13. **Exact files changed:** Paths below are relative to this report's project directory. The source/test manifest was compared against a pre-pass SHA-256 snapshot. Existing cluster handoffs remain unchanged. No dependencies were added.

Modified:
- `src/app/page.tsx`
- `src/components/customer/customer-home.tsx`
- `src/components/hq/hq-demo-controls.tsx`
- `src/components/hq/hq-operations.tsx`
- `src/components/intelligence/intelligence-controls.tsx`
- `src/components/intelligence/intelligence.module.css`
- `src/components/intelligence/intelligence.tsx`
- `src/components/kitchen/kitchen-rush.tsx`
- `src/components/shared/prototype-switcher.tsx`
- `src/context/demo-provider.tsx`
- `src/lib/demo-engine.ts`
- `src/lib/hq-selectors.ts`
- `src/lib/intelligence-selectors.ts`
- `src/lib/kitchen-rush.ts`
- `src/lib/rider-mission.ts`
- `src/types/index.ts`
- `tests/intelligence-selectors.test.ts`

Added:
- `src/components/customer/customer-order.module.css`
- `src/components/customer/customer-order.tsx`
- `src/lib/coordination.ts`
- `src/lib/customer-order.ts`
- `src/lib/demo-orchestration.ts`
- `src/lib/demo-persistence.ts`
- `src/types/coordination.ts`
- `tests/v1-integration.test.ts`
- `V1-HANDOFF.md`

Generated build/cache artifacts are excluded from this source manifest.

14. **Genuine limitations:** The canonical fulfillment demo is one fixed GS-2847 order; menu browsing does not implement arbitrary checkout. Persistence is local to the browser/origin, not a synchronized multi-tab/device backend; denied or cleared storage cannot preserve a session. Decision history retains the latest 60 events. Recovery is an explicitly simulated change to future planning, not a real replenishment/dispatch optimizer. Supporting orders, roster, geography, network metrics and capacity outlook remain illustrative fixtures; supporting kitchen work advances only through explicit actions. Real mobile hardware and full accessibility conformance were not tested.

15. **Deferred scope:** The brief's hard boundary remains unchanged: real maps/GPS, dispatch, payments, authentication, backend/database/WebSockets/APIs, ML/LLMs, onboarding/admin, support, ratings/refunds/loyalty, notifications, multi-city/tenant operations, advanced optimization, observability and real inventory are outside V1. None was started.

GO SERVE V1 IS FROZEN.
