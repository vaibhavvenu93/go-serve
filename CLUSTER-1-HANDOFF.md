# GO SERVE — Cluster 1 handoff

Customer Home is implemented at `/customer`. Stop here for visual review.

## Exact files changed

All paths below are relative to this project directory.

Modified existing source:

```text
src/app/customer/page.tsx
```

New files:

```text
src/components/customer/customer-home.tsx
src/components/customer/customer-home.module.css
src/components/customer/customer-icons.tsx
src/components/customer/food-photo.tsx
src/lib/customer-home.ts
tests/customer-home.test.ts
public/food/paneer-bowl.webp
public/food/chicken-biryani.webp
public/food/rajma-chawal.webp
public/food/masala-dosa.webp
public/food/chole-bowl.webp
CUSTOMER-IMAGE-NOTES.md
CLUSTER-1-HANDOFF.md
```

A before/after SHA-256 comparison of the existing `src` tree confirmed only `src/app/customer/page.tsx` changed. The entry, global tokens/styles, provider, engine, menu records, shared switcher component, and other route shells were preserved. No dependencies or configuration changes were needed. Generated `.next`, `.next-build`, and TypeScript caches are not source deliverables.

## Design decisions

“Dinner in 12 minutes” is the dominant first read. One quiet nearby-kitchen signal and a small DEMO label sit beneath it. The paneer bowl is offset and cropped toward the right edge, with “Again?” placed independently on the warm canvas. Dish information and Add are not enclosed in a card. Food supplies most of the colour; brand green marks the promise and primary interaction.

The supporting menu uses a horizontal editorial strip with four dishes: Chicken Biryani, Rajma Chawal, Masala Dosa, and Chole Rice Bowl. Text-led intent filters use an underline rather than a pill container. Search opens within the same Home surface and can find all eight original demo menu records. No search route was added.

Manrope, the original palette, and existing typography/spacing tokens remain in use. Customer-only geometry and responsive type sizes live in a CSS module. Simple native SVG controls avoid a new icon dependency. Short CSS transitions and animations keep interaction feedback light; no animation loop or additional motion library was introduced.

Five images were produced with the built-in ImageGen tool, then resized and compressed to WebP. The final assets and exact prompts are documented in `CUSTOMER-IMAGE-NOTES.md`. All assets are local. The hero is prioritized through Next/Image; supporting images are lazy-loaded. FoodPhoto reserves layout space and replaces a failed image with a small typographic treatment, retaining the dish name and actions.

## Implemented interactions

- Add, increment, decrement, and remove-to-zero for dishes; quantities are bounded to 0–9.
- A bottom bag affordance reflects quantity, exact base-menu total, and the slowest selected item's demo delivery time.
- View order stays on Home and explains that ordering will be available soon.
- All / Veg / Protein / Comfort update the supporting menu locally.
- Header and bottom-navigation Search open the same inline search. It matches menu names, descriptions, and tags, with case-insensitive multi-word matching.
- Search handles empty results, clearing, Escape, returning Home, and combined dietary filtering.
- A native modal sheet lets Aarav choose fictional Home in Vijay Nagar or Work in Scheme No. 54. Selection updates the header without navigation.
- Home returns to the top. Orders and You give brief in-place availability feedback; no destination screens exist.
- The original prototype switcher remains available. Its mobile position is adjusted only by customer-scoped CSS so it does not cover native bottom navigation.
- Reset demo clears quantities, filters, search, saved-location selection, and feedback by observing replacement of the provider's existing cart fixture.

## State boundaries and assumptions

Customer Home reads Aarav's identity from DemoProvider and uses the existing typed menu. Its selection is deliberately local component state. It starts empty; adding ₹179 paneer does not silently include the future hero order's ₹10 chutney addon. Nothing places or advances GS-2847, charges a payment, changes stock, or modifies operational metrics.

Selection and location are retained while interacting within Home. Leaving the route or reloading starts this local state afresh. The future cart cluster should integrate these choices through explicit provider actions after the order configuration is designed.

The existing Cluster 0 prices and times were retained because Cluster 0 is frozen and the Cluster 1 alternatives were suggested values. This avoids divergent records. For example, Rajma remains ₹149 / 10 min and Dosa ₹129 / 15 min. Paneer remains ₹179 / 12 min. The main promise is the featured bowl's illustrative delivery time; the bag uses selected item times. Location choices do not simulate geocoding or real delivery estimates.

## Responsive behavior

- At 390 × 844 and 430 × 932, Home fills the viewport, with a stable header and bottom navigation around a vertically scrolling content area.
- The delivery promise, featured food, and Add control are visible in the initial mobile viewport.
- Food discovery scrolls horizontally inside its own strip, without widening the page.
- At 1440 × 1000, the product stays exactly 390px wide, centered on a neutral stage. There is no phone bezel or side marketing content.
- An extra 320px-width check also showed no page-level horizontal overflow.
- Safe-area padding is included at the top and bottom. Shorter viewports retain scrolling instead of compressing controls.

## Accessibility

Semantic headings and buttons, descriptive image alternatives, visible keyboard focus, named search and quantity controls, pressed filter states, and live announcements are included. Dietary information uses text plus distinct dot/triangle signals, not colour alone. Consumer action targets are at least 44px high.

The native dialog supplies modal focus containment and Escape handling; focus returns to the saved-location trigger. Search receives focus when opened. Focus is preserved when an Add button becomes a quantity stepper and when removing the final item restores Add. Motion honors the existing global reduced-motion rule. No screen depends on animation to communicate its state.

## Validation

Commands run:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

- Lint passed without warnings or errors.
- Strict TypeScript validation passed.
- All 9 tests passed: 6 original foundation tests and 3 new tests covering search/filter combinations, availability, quantity bounds, immutable updates, exact totals, and delivery-time aggregation.
- Production build passed. Customer Home is prerendered; its first-load JavaScript is approximately 121 kB in the reported build.
- Browser checks covered Add, increment, decrement, zero removal, calculated totals, non-navigating bag feedback, saved-location selection, search, empty search, Veg filtering, Orders/You responses, reset, and keyboard focus changes.
- All five food images loaded successfully. Image failure fallback is implemented; a network-failure injection was not performed.
- Inspected 390 × 844, 430 × 932, and desktop presentation, plus the 320px width check. No page-level horizontal overflow was found.

## Visual review and intentional deferrals

The intended review points are the oversized bowl crop, the balance of the delivery headline against food, and how much discovery should peek into the first viewport. These are the chosen direction, not unresolved rendering defects. Before a real launch, generated imagery should be replaced with photography of actual portions using the same asset slots.

No product detail, cart screen, checkout, payment, confirmation, tracking, account, separate search results, category pages, Kitchen, Rider, or HQ features were built. The end-to-end experience remains deferred. The existing Cluster 0 README remains unchanged as its historical handoff.
