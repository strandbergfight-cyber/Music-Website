# Design System Document

## 1. Overview & Creative North Star: "The Resonant Atelier"

This design system is not a utility; it is a space. We are moving away from the "software" look to create a digital extension of a high-end music studio. Our Creative North Star is **The Resonant Atelier**. 

The goal is to evoke the tactile quality of a grand piano’s finish, the weight of a heavy paper score, and the quiet atmosphere of a wood-paneled conservatory. We achieve this through **Editorial Asymmetry**—placing elements in a way that feels curated rather than computer-generated—and **Tonal Layering**, where depth is felt through color shifts rather than drawn lines.

### Key Tenets
*   **The Breath of Silence:** Use the `24 (8.5rem)` and `20 (7rem)` spacing tokens to create immense white space, treating the screen like an open gallery.
*   **Intentional Overlap:** Break the grid by allowing images or cards to slightly overlap section boundaries, creating a sense of physical arrangement.
*   **The Warmth of Wood:** We use the `primary` and `secondary` brown tones to ground the interface, providing a sense of heritage and authority.

---

## 2. Color & Surface Philosophy

The palette is rooted in organic materials. We avoid "digital blacks" and "pure whites," opting instead for the cream of aged parchment and the deep umber of mahogany.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Boundaries must be invisible. 
*   **Transitioning:** Move from `surface` to `surface-container-low` to define a new content area.
*   **Nesting:** A `surface-container-lowest` card (Pure White) should sit on a `surface` (Off-white) background to create a "paper-on-linen" effect.

### Glass & Gradient (The "Varnish")
To mimic the gloss of a polished instrument, use semi-transparent surfaces:
*   **Glassmorphism:** For navigation bars or floating action overlays, use `surface` at 80% opacity with a `20px` backdrop blur.
*   **Signature Gradients:** For CTAs, use a linear gradient from `primary_container (#4E342E)` to `primary (#361F1a)` at a 135-degree angle. This adds "soul" and depth that flat hex codes lack.

---

## 3. Typography: The Editorial Voice

We pair a timeless Serif for expression with a modern Sans-Serif for clarity.

*   **Display & Headlines (Noto Serif):** These are our "Artistic" anchors. Use `display-lg` and `headline-md` with generous letter-spacing (-0.02em) to evoke high-end editorial magazines.
*   **Body & Labels (Manrope):** These are our "Functional" anchors. Manrope provides a clean, geometric contrast to the Serif. 
*   **Hierarchy Tip:** Always lead with a large Serif headline, but use `label-md` in `primary` (Deep Brown) for small meta-information to keep the "Literary" vibe consistent.

---

## 4. Elevation & Depth: Tonal Layering

We do not "drop shadows"; we create "ambient light."

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-highest` element is perceived as being "closer" to the user than a `surface` element.
*   **Ambient Shadows:** If a card requires a lift (e.g., a floating lesson card), use a shadow with a `32px` blur, `0%` spread, and `4%` opacity. The color should not be black, but `on-surface` (#1A1C1C).
*   **The Ghost Border Fallback:** If accessibility requires a border, use `outline-variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Cards & Lists
*   **The Forbidding of Dividers:** Never use horizontal lines to separate list items. Use the `spacing-4` (1.4rem) scale to create a "Gutter of Silence" between items.
*   **Lesson Cards:** Use `xl (1.5rem)` corner radius. Apply a subtle grain texture overlay (2% opacity) to mimic a wooden or paper surface.

### Buttons
*   **Primary:** Solid `primary_container`. No border. `md` roundedness.
*   **Secondary:** `surface_container_low` background with `on_surface` text. This feels like an integrated part of the page rather than a "widget."
*   **Tertiary:** Text-only in `secondary` (Warm wood tones), using `label-md` for an elegant, understated look.

### Elegant Progress Bars (Lesson Balances)
*   **Track:** Use `surface-container-highest` for the empty track.
*   **Indicator:** A gradient from `secondary` to `secondary_fixed_dim`. 
*   **Detail:** Add a subtle `1px` inner-glow on the top edge of the indicator to give it a 3D, "inlaid wood" feel.

### Input Fields
*   **Styling:** Forgo the box entirely. Use a "Minimalist Ledger" style—a simple `outline-variant` bottom border (at 30% opacity) that darkens to `primary` on focus. This mimics the lines of a musical staff.

---

## 6. Do’s and Don'ts

### Do
*   **Do** use asymmetrical margins. For example, give a header a left margin of `spacing-16` but a right margin of `spacing-8` to create an editorial feel.
*   **Do** use `tertiary_fixed` (#CFE8E0) as a very subtle accent color for success states or "New" badges to provide a "patina" look.
*   **Do** treat images as art. Use large `lg` or `xl` rounded corners on all photography.

### Don’t
*   **Don’t** use high-contrast borders (100% black or dark grey). It breaks the "Serene" atmosphere.
*   **Don’t** use standard "Blue" for links. All interactive elements must stay within the brown, wood, and cream spectrum.
*   **Don’t** crowd the interface. If you feel a section is too empty, add more padding, not more content. Silence is a choice, not an absence.

---

## 7. Interaction Patterns

*   **Soft Entries:** Components should fade in with a slight `Y-axis` offset (10px) over `400ms`. 
*   **The "Vibrate" Rule:** Avoid harsh, snappy animations. Every movement should feel like the slow, weighted press of a piano key. Use `cubic-bezier(0.23, 1, 0.32, 1)` for all transitions.