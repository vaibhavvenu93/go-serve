# Cluster 2 — Kitchen Rush handoff

Implemented `/kitchen` only. Customer Home, the landing page, global tokens/styles, prototype switcher, and Rider/HQ interfaces are unchanged. File hashes confirm the only existing source changes are the four listed below.

## 1. Exact files created

Paths are relative to this project directory.

- `src/types/kitchen.ts`
- `src/data/demo-kitchen.ts`
- `src/lib/kitchen-rush.ts`
- `src/components/kitchen/kitchen-rush.tsx`
- `src/components/kitchen/kitchen-rush.module.css`
- `tests/kitchen-rush.test.ts`
- `CLUSTER-2-HANDOFF.md`

## 2. Exact files modified

- `src/app/kitchen/page.tsx` — mounts Kitchen Rush in the existing route.
- `src/types/index.ts` — optional typed Kitchen Rush state.
- `src/context/demo-provider.tsx` — exposes initialization, clock, pause, and guarded advancement actions.
- `src/lib/demo-engine.ts` — delegates Kitchen actions and preserves chronological event timestamps across later shared-order transitions.

## 3. Screen composition

An edge-to-edge near-black operating surface inherits the established Manrope typography and Go Serve palette. Three levels organize attention: enormous next order and Start Now action; compact active-work stream and rider handoff; quieter incoming work, station load, one stock alert, and Go Serve Signal. Thin progress lines supply the common time language. No dashboard cards, charts, Kanban lanes, imagery, or new dependencies.

## 4. Operational model

The initial snapshot contains 18 orders: five queued, six preparing, four assembling/packing, and three ready. Counts and station estimates derive from the current jobs. The canonical order remains in the existing shared order state; 17 supporting jobs form the surrounding rush.

Stages are queued → preparing → assembling → packing → ready, with handed-off status understood for future integration. This cluster stops manual advancement at Ready. Stage changes require the expected current stage, preventing stale or duplicate actions from skipping work.

The deterministic simulated clock advances once per second while Kitchen is mounted and visible; it can be paused. It never advances lifecycle stages automatically. Remaining preparation time reaches zero without becoming negative. Amber marks approaching completion; red is reserved for a breached promise. Network delivery/SLA statistics and the incoming forecast remain explicit demo context, not live analytics.

Timing assumption: the brief gives 6:20 preparation, 4:12 rider travel, and an eight-second wait, which cannot all describe an immediate rider arrival. The demo stages Ravi for two minutes before his 4:12 approach, yielding a 6:12 arrival against 6:20 preparation. The UI labels travel as staged and the detail sheet explains the release window. Handoff targets account for whichever finishes later: food or rider arrival.

## 5. Interactions implemented

- Start Now advances the selected queued order and promotes the next queued job.
- Order rows and the primary order open a contextual native side sheet.
- Stage-appropriate controls advance preparation, assembly, packing, and Ready.
- Preparing and Assembly & pack controls filter active work.
- Ready orders appear with rider arrival status and pickup bay.
- The mint-chutney alert opens a contextual stock explanation and acknowledgement.
- Clock pause/resume and the existing prototype switcher/reset work.
- Other Kitchen navigation destinations remain disabled; no additional pages exist.

## 6. GS-2847 behavior

GS-2847 retains Aarav Mehta, Paneer Tikka Rice Bowl ×1, medium spice, extra mint chutney, Vijay Nagar, and Ravi Sharma. The existing base price remains ₹179 (the existing ₹10 addition remains separate). Entering Kitchen from the original pre-order state seeds a clearly simulated paid/queued operating scenario without changing the configured dish or customer.

Starting adds the order to active preparation. Subsequent explicit actions update the canonical shared status and event history. Ready places it in Handoff, Bay 4, with Ravi arriving/arrived as appropriate. The implementation does not claim real rider assignment or GPS tracking.

## 7. Shared-state changes

The existing DemoProvider owns the extension. Initialization is idempotent and does not rewind a later order state. Hero status is projected from `currentOrder`, avoiding a competing copy. Supporting jobs and the clock persist during prototype navigation in the same mounted session. A full reload is not durable storage.

Reset outside Kitchen retains the original demo defaults. Reset while on Kitchen restores the original defaults and immediately seeds the fresh rush for that surface. Existing rider assignment/pickup actions remain compatible; event timestamps stay chronological.

## 8. Responsive behavior

At 1440 × 900, the initial full composition fits the viewport. At 1366 × 768, the primary workflow stays prominent and lower context scrolls vertically. At approximately 1024px, Next and Active Work remain alongside each other with Handoff below, followed by context. Narrower layouts stack Next, Active Work, Handoff, then context. Target widths were checked for horizontal overflow; none was observed. Longer active/handoff lists scroll within their regions.

## 9. Accessibility

Semantic named buttons, visible focus, native modal dialogs, Escape dismissal, focus restoration, labelled progress values, generous primary action targets, and reduced-motion support are included. Stage and urgency are conveyed in text as well as color. The keyboard Start action and focus restoration were exercised in the browser. This is practical interaction validation, not a formal assistive-technology certification.

## 10. Validation

- ESLint: passed, no warnings or errors.
- TypeScript (`tsc --noEmit`): passed.
- Unit tests: 16 passed, including seven Kitchen tests covering the initial snapshot, guarded progression, supporting-job independence, clock/pause/synchronization, shared rider compatibility, reset, and risk thresholds.
- Browser: Start → Preparing → Assembling → Packing → Ready, details, work filters, stock acknowledgement, keyboard Start, reset, and prototype switching passed. Switching to the existing Rider shell showed shared GS-2847 as READY; returning to Kitchen preserved it.
- Frozen-source hash comparison: only the four declared existing source files changed.

## 11. Production build

`npm run build`: passed. Kitchen is generated successfully with no added dependencies.

## 12. Intentionally deferred

Other Kitchen pages, inventory editing/procurement, recipes, staff/settings/analytics, Rider and HQ development, new Customer flows, backend persistence, real dispatch/GPS, predictive demand, sound, and physical handoff confirmation remain deferred. Stock cover and station loads are demo estimates; acknowledgement does not alter inventory.

## 13. Visual review

Review the dominant order/action scale, pale-green action emphasis, active-row density, tablet Handoff placement, and restrained lower context. Confirm the explicit rider staging assumption before connecting real dispatch. The screen has been returned to its initial queued scenario with the clock paused for stable review; resume from the header to inspect live timing.

The next action, health, amber approaching-completion job, and ready riders each have distinct emphasis. The screen uses the company’s typography and restrained green while giving Kitchen its own operational density. Work stops here pending visual review.
