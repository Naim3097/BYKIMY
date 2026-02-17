# BYKI — Section Transition Plan

## Current Section Map (top → bottom)

| #  | Section             | Background         | Existing Motion        |
|----|---------------------|--------------------|------------------------|
| 1  | **Hero**            | `bg-byki-light-gray` (#f6f6f6)  | Mount animations (fade+slide) |
| 2  | **Manifesto**       | `bg-white`         | `whileInView` fade-up  |
| 3  | **HowItWorksSteps** | `bg-byki-light-gray` | `whileInView` stagger  |
| 4  | **FeatureGrid**     | `bg-white`         | `whileInView` stagger  |
| 5  | **SystemCoverage**  | `bg-byki-light-gray` | `whileInView` stagger  |
| 6  | **ComparisonSection** | `bg-white`       | `whileInView` fade     |
| 7  | **Testimonials**    | `bg-byki-light-gray` | `AnimatePresence` carousel |
| 8  | **FAQAccordion**    | `bg-white`         | `whileInView` stagger  |
| 9  | **Disclaimer**      | `bg-byki-light-gray` | None (server component) |
| 10 | **Footer**          | `bg-byki-dark-green` | None (server component) |

### Background Pattern
The sections alternate: **light-gray → white → light-gray → white …** with a final jump to **dark-green** (Footer).

---

## Transition Strategy

### Principle
- **Subtle, seamless, out-of-the-box feel** — no gimmicks, no heavy parallax
- **Soft color blending** between sections via CSS gradient dividers
- **Scroll-triggered reveals** via Framer Motion `whileInView` (already partially in place — standardize across all sections)
- **Mobile-first**: all transitions use `transform` and `opacity` only (GPU-accelerated, smooth on low-end devices)
- No layout shifts — all animated elements have pre-reserved space

---

## Implementation Plan

### 1. Reusable `<SectionDivider />` component

A thin decorative element placed **between** sections to create a seamless color blend.

**Three variants based on background transition:**

| Transition                        | Divider Style                                |
|-----------------------------------|----------------------------------------------|
| light-gray → white               | Soft curved SVG wave (concave), gray→white gradient |
| white → light-gray               | Soft curved SVG wave (convex), white→gray gradient  |
| light-gray → dark-green (Footer) | Diagonal slash or bold curve, gray→dark-green       |

**SVG approach**: A simple `<svg viewBox>` with a single `<path>` curve, ~40-60px tall, full-width. Uses `fill` matching the next section's bg. The SVG sits at the bottom of the preceding section with `margin-bottom: -1px` to prevent sub-pixel gaps.

**Mobile**: Same SVG scales naturally via `width: 100%; height: auto`. Height reduced to ~30px on mobile via responsive class.

### 2. Standardized `whileInView` reveal for all sections

Create a reusable `<RevealOnScroll>` wrapper component:

```tsx
// Wraps any section content with a consistent scroll-triggered reveal
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
>
  {children}
</motion.div>
```

**Config per section:**

| Section             | Reveal Style                          | Notes |
|---------------------|---------------------------------------|-------|
| Hero                | **Skip** — already has mount anim     | No change needed |
| Manifesto           | Fade-up (y: 30→0, opacity: 0→1)      | Already has it — keep |
| HowItWorksSteps     | Header fade-up, cards stagger         | Already has it — keep |
| FeatureGrid         | Header fade-up, cards stagger         | Already has it — keep |
| SystemCoverage      | Left text fade-up, right pills stagger | Already has it — keep |
| ComparisonSection   | Header fade-up, table slide-up        | Already has it — keep |
| Testimonials        | Header fade-up, carousel fade         | Already has it — keep |
| FAQAccordion        | Header fade-up, items stagger         | Already has it — keep |
| Disclaimer          | **Add** — subtle fade-in (opacity only, no y-shift) | Currently none |
| Footer              | **Add** — subtle fade-in on CTA band  | Currently none |

### 3. Smooth background color transitions via CSS

Add a subtle gradient overlap at each section boundary. Instead of a hard color cut, each section gets:

```css
/* Outgoing section — bottom edge fades into next section's color */
section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, transparent, var(--next-bg));
  pointer-events: none;
}
```

**Implementation**: Rather than complex CSS pseudo-elements, we'll use a `<div>` with a gradient placed between sections. This is more reliable and works with Tailwind classes directly.

### 4. Specific divider placements on homepage

```
Hero (light-gray)
  └─ wave divider (gray → white)
Manifesto (white)
  └─ wave divider (white → gray)
HowItWorksSteps (light-gray)
  └─ wave divider (gray → white)
FeatureGrid (white)
  └─ wave divider (white → gray)
SystemCoverage (light-gray)
  └─ wave divider (gray → white)
ComparisonSection (white)
  └─ wave divider (white → gray)
Testimonials (light-gray)
  └─ wave divider (gray → white)
FAQAccordion (white)
  └─ wave divider (white → gray)
Disclaimer (light-gray)
  └─ angular divider (gray → dark-green)
Footer (dark-green)
```

---

## Components to Create

### `<SectionWave />` — new component
```
Props:
  - fromColor: string (tailwind color token)  
  - toColor: string (tailwind color token)
  - flip?: boolean (flip the curve direction)
  - className?: string

Renders:
  - A full-width SVG with a subtle sine/bezier curve
  - Top half filled with `fromColor`, bottom curve filled with `toColor`
  - Height: h-10 md:h-14 lg:h-16 (40-64px)
  - Negative margin to overlap section edges (-mt-1)
```

### `<RevealOnScroll />` — new component
```
Props:
  - children: ReactNode
  - delay?: number
  - direction?: 'up' | 'left' | 'right' | 'none'
  - className?: string

Already mostly in place via inline motion.div — this just standardizes it.
Used only for Disclaimer & Footer which currently lack any animation.
```

---

## Files to Modify

| File | Change |
|------|--------|
| `components/ui/SectionWave.tsx` | **Create** — SVG wave divider |
| `components/ui/RevealOnScroll.tsx` | **Create** — reusable scroll-reveal wrapper |
| `app/page.tsx` | **Modify** — insert `<SectionWave>` between each section |
| `sections/Disclaimer.tsx` | **Modify** — add subtle fade-in |
| `layout/Footer.tsx` | **Modify** — add subtle fade-in on CTA band |

---

## Mobile Considerations

- **Wave dividers**: Use `h-8 md:h-12 lg:h-16` — shorter on mobile, taller on desktop
- **Reveal animations**: Use `viewport.margin: "-60px"` on mobile (elements appear earlier in viewport) — handled by Framer Motion's responsive margin
- **Performance**: Only `transform` and `opacity` are animated — both are GPU-composited and won't cause layout reflow
- **Reduced motion**: Respect `prefers-reduced-motion` — wrap animations in a media query check; skip y-translation, keep only opacity fade

---

## Visual Result

The page will feel like one continuous flowing surface:
- Sections **melt** into each other via soft wave curves
- Content **gently rises** into view as you scroll
- The alternating gray/white pattern gets softened by the gradient blending
- The Footer transition is more dramatic (angular cut from light to dark green)
- On mobile, waves are proportionally shorter, and reveals trigger slightly earlier for a snappy feel
