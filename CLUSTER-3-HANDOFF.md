# Cluster 3 — Rider OS handoff

## Scope and files

Built `/rider` only, plus minimal shared-state and prototype utility extensions. Frozen Customer, Kitchen, landing, HQ, and global styles are unchanged, verified against SHA-256 source baselines.

Created:

- `src/types/rider.ts`
- `src/lib/rider-mission.ts`
- `src/components/rider/rider-map.tsx`
- `src/components/rider/rider-os.tsx`
- `src/components/rider/rider-os.module.css`
- `tests/rider-mission.test.ts`
- `CLUSTER-3-HANDOFF.md`

Modified:

- `src/app/rider/page.tsx` — replaces the existing Rider placeholder.
- `src/types/index.ts` — optional typed rider mission on shared state.
- `src/context/demo-provider.tsx` — exposes typed Rider actions through the existing reducer.
- `src/lib/demo-engine.ts` — delegates Rider actions; original actions and reset contracts remain.
- `src/components/shared/prototype-switcher.tsx` — route-specific demo preparation and arrival controls.

## Mission model and shared order

Typed stages: idle → assigned → to_kitchen → at_kitchen → picked_up → to_customer → arrived_customer → handoff → delivered → idle.

The mission stores availability, deterministic elapsed time, and arrival/completion timestamps. Read-only projection derives the initial mission from the existing order; opening Rider does not mutate or advance GS-2847. A baseline CART order therefore shows an online rider awaiting assignment rather than pretending it is ready. Kitchen-created queued/preparing/finishing/ready states are reflected directly.

Navigation associates Ravi with the order without changing Kitchen's preparation status. Confirm Pickup is guarded by both at-kitchen mission state and shared READY/RIDER_ASSIGNED status. Pickup writes PICKED_UP, customer navigation writes OUT_FOR_DELIVERY, arrival writes ARRIVING, and correct handoff verification writes DELIVERED. The existing legacy RIDER_ASSIGNED state remains compatible. Repeated or invalid mission actions are no-ops.

Rider events, assignment timestamps, rider availability, delivery count, and Kitchen active-order membership update together. GS-2847 is projected as handed off by Kitchen's existing logic after pickup. Successful delivery credits Ravi exactly once. State survives product navigation within the same provider session; no durable backend/local-storage persistence was introduced.

## Timing continuity

Rider reads Kitchen's existing planned arrival and preparation time instead of inventing an independent countdown. Arrival simulations advance the shared elapsed time explicitly; no random timers or automatic order changes run in Rider.

Prepare Rider Demo is an explicit utility action, available only before preparation begins. It uses the Kitchen reducer to start the canonical order and stages the preview four minutes into preparation: food ready in 2:20, rider arrival in 2:12, expected wait eight seconds. Simulate Kitchen Arrival reaches that same scheduled arrival. If food is still being prepared, pickup remains unavailable. Set GS-2847 Ready is a separate prototype-only action that advances Kitchen's legal stages at the planned completion time.

The matched demonstration reaches food readiness at 20:20:23, then takes 330 seconds for the 1.7 km customer leg (rounded to six minutes in the interface), plus ten seconds for handoff. Completion is 20:26:03, exactly 12:00 order-to-door. ETA, clock, and completion derive from these values. A rapid manual Kitchen-ready walkthrough can finish earlier; the browser-tested required path completed in 11:52.

Kitchen's existing staged pickup schedule is preserved. Immediately marking food READY while its clock is paused does not magically move Ravi closer: the pickup window can therefore be longer than the illustrative three-minute approach. The interface labels this as time to the pickup window. The small 'right on time' pickup message appears only if actual simulated readiness and arrival differ by at most ten seconds. Late deliveries do not claim to be on time.

## Map and visual composition

A local SVG depicts an illustrative Vijay Nagar neighbourhood with quiet roads, a garden, sparse labels, a Go Serve kitchen marker, Ravi's direction marker, and a customer destination. The green route switches from pickup to customer delivery. An idle rider has no active route. No map images, paid APIs, keys, WebGL, or external map dependency are used.

The warm cream interface uses inherited Manrope typography, deep Go Serve green, large time/destination hierarchy, and one thumb-sized primary action. Navigation introduces a concise directional cue above the map. The operational bottom surface changes with the mission; completion shows actual elapsed order-to-door time without celebration effects.

## Interactions

- Navigate to Kitchen; simulate arrival in Prototype.
- Wait for actual shared Kitchen readiness; confirm pickup.
- Navigate to Customer; simulate customer arrival in Prototype.
- I'm Here; numeric four-digit handoff input; restrained incorrect-code feedback; verify 2847.
- Delivered receipt; Back to Shift; online/offline between missions.
- Simulated Call, Message, Safety, and issue sheets; no external messages, phone calls, reports, or emergency services are contacted.
- Reset preserves the original system baseline and clears Rider mission state.

The existing fictional Narmada Residency / Flat 302 address is reused, avoiding a conflicting destination. Customer identity is limited to Aarav M. and relevant delivery details. The existing canonical base dish price ₹179 and extra-chutney configuration remain unchanged.

Shift deliveries use Ravi's canonical starting count of 16 and become 17 after delivery. Earnings (₹744 baseline, ₹790 after this delivery) are explicitly labelled demo context; online duration is a fixed shift snapshot. No settlement or live earnings model is implied.

## Complete walkthrough verified

1. Reset system, open Kitchen, start GS-2847, mark assembling, packing, and ready.
2. Switch Kitchen → Rider: Ravi Sharma, GS-2847, Ready for Pickup.
3. Navigate; simulate kitchen arrival; confirm pickup.
4. Navigate to Aarav; simulate customer arrival; I'm Here.
5. Enter 2847; shared order becomes DELIVERED and receipt appears.
6. Switch Rider → Kitchen: GS-2847 is absent from Active Work and Handoff; prototype state remains DELIVERED.
7. Return to Rider: completion persists.

Also exercised independent demo setup, eight-second synchronization, blocked premature pickup, wrong OTP 0000, keyboard OTP submit, contact sheet, safety sheet, online/offline, and reset.

## Responsive and accessibility

Browser measurements found no page overflow at 390 × 844, 393 × 852, or 430 × 932. Desktop at 1440 × 900 centers a bounded mobile application on a quiet product stage; Rider never stretches into a desktop dashboard. The prototype utility has a reserved lower area on mobile and does not cover the primary button. Shorter screens may scroll rather than compress text below readable sizes.

Semantic buttons, labelled numeric input, 58px primary actions, 44px secondary touch controls, visible focus, native modal focus trapping/Escape dismissal, and focus restoration are implemented. Mission changes move keyboard focus to the new heading; incorrect OTP feedback is announced and marks the input invalid. Text accompanies state colors. Existing global reduced-motion support suppresses route/surface transitions. Browser keyboard checks passed; no formal screen-reader certification is claimed.

## Validation

- ESLint: passed.
- TypeScript: passed.
- Production build: passed, including Rider route generation.
- Regression suite: 21 tests passed (16 existing, five new Rider tests).
- New tests cover non-mutating projection, illegal-action guards, shared synchronization, readiness gating, complete delivery, OTP rejection, exactly-once credit, reset, Kitchen-ready compatibility, and offline behavior.
- Source hash comparison: only the five declared existing files changed; approved Customer and Kitchen source files remain unchanged.

## Intentional deferrals and visual review

No HQ, Customer tracking, new Kitchen pages, real GPS/navigation, authentication, telephony, messaging, payments, wallet, onboarding, KYC, incentives, support backend, notifications, or real APIs were built. The map is explicitly illustrative and unsuitable for real navigation. OTP is a deterministic prototype gate, not a production security mechanism.

Review the map-to-action balance, navigation cue scale, thumb reach, completion treatment, and inherited Kitchen pickup schedule before freeze. No known blocking implementation issues remain. Rider is left on the completed canonical delivery for review. Work stops after Rider OS.
