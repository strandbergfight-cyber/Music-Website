# Design System Document: The Resonant Atelier

## 1. Overview & Creative North Star
**Creative North Star: "The Curated Manuscript"**
This design system moves beyond the "app as a tool" mentality and treats the interface as a high-end, digital manuscript. It blends the steady, rhythmic precision of musical notation with the editorial sophistication of a luxury journal. 

To break the "template" look common in educational software, we utilize **intentional asymmetry** and **tonal depth**. The layout should feel like a composed piece of music: it has moments of dense information (staves) balanced by expansive whitespace (rests). We reject the rigid, boxy grid in favor of a layered, "floating" architecture that feels both authoritative and breathable.

---

## 2. Colors & Surface Philosophy
The palette is anchored in a midnight `primary` (#000666) that communicates absolute professionalism, softened by a `surface` palette that feels like premium, unbleached paper.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders for sectioning are strictly prohibited. 
Boundaries must be defined solely through:
*   **Background Color Shifts:** Placing a `surface-container-low` (#f5f2fb) section against the main `surface` (#fbf8ff).
*   **Vertical Rhythm:** Utilizing the Spacing Scale (specifically `8` or `10`) to create "mental" boundaries.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of frosted glass or fine stationery.
*   **Level 0 (Base):** `surface` (#fbf8ff) - The canvas.
*   **Level 1 (Sections):** `surface-container-low` (#f5f2fb) - Defines large content areas (e.g., a student roster list).
*   **Level 2 (Cards):** `surface-container-lowest` (#ffffff) - Elevated pieces of information (e.g., a specific lesson plan).
*   **Level 3 (Interactive):** `surface-container-high` (#eae7ef) - For active states or sidebars.

### Signature Textures & Glassmorphism
To avoid a flat, "SaaS-standard" look:
*   **CTAs:** Use a subtle linear gradient from `primary` (#000666) to `primary_container` (#1a237e) at a 135° angle.
*   **Navigation:** Use Glassmorphism for floating headers. Apply `surface` at 80% opacity with a `backdrop-filter: blur(12px)`. This allows the "artistic soul" of the content to bleed through the interface.

---

## 3. Typography
The system pairs the architectural strength of **Manrope** (Display/Headlines) with the functional clarity of **Inter** (Body/Labels).

*   **Display (Manrope):** Large, low-tracking titles. Use `display-lg` (3.5rem) for hero moments like a student’s name or a practice streak. This conveys a "curated" editorial feel.
*   **Headline & Title (Manrope):** These are the "conductors" of the page. They should be bold and assertive.
*   **Body (Inter):** High-readability scales for lesson notes and curriculum descriptions. Use `body-lg` (1rem) for student feedback to ensure it feels personal and legible.
*   **Label (Inter):** Used for metadata (e.g., "Violin - Grade 4"). These should always be in `label-md` and can utilize `on_surface_variant` (#454652) to recede visually.

---

## 4. Elevation & Depth
Hierarchy is achieved through **Tonal Layering** rather than structural lines.

*   **Ambient Shadows:** For "floating" elements like modals or action menus, use a shadow with a blur of `32px` and an opacity of `6%`. The shadow color must be derived from `on_surface` (#1b1b21), never pure black.
*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift that mimics heavy cardstock sitting on a desk.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast modes), use `outline_variant` at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), white text, `rounded-md` (0.375rem). Use for "Start Lesson" or "Save Curriculum."
*   **Secondary:** `surface-container-highest` background with `on_primary_fixed_variant` text. No border.
*   **Tertiary:** Text-only with `primary` color. High padding (`px-4`) to maintain a premium feel.

### Cards & Lists
*   **Strict Rule:** No divider lines between list items. Use `spacing-4` (1rem) of vertical whitespace or a subtle background shift on hover (`surface-container-high`).
*   **Student Cards:** Use `surface-container-lowest` with a `rounded-lg` (0.5rem) corner. The top-left corner should feature a small "signature" accent—a 4px vertical bar of `tertiary_fixed` (#ffdea5) to represent the "artistic soul."

### Input Fields
*   **Soft Focus:** Default state is `surface-container-highest` with no border. On focus, the background stays the same, but a `primary` "Ghost Border" (20% opacity) appears. This maintains the "clean manuscript" aesthetic.

### Specialized Music Components
*   **The Metronome Toggle:** A custom chip using `secondary_container` that pulses subtly with the `surface_tint` color when active.
*   **Lesson Progress Bar:** A thin (4px) track using `outline_variant` with a `primary` fill. No rounded caps; use sharp edges for a more modern, architectural look.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. For example, give the right side of a container more breathing room than the left to mimic a musical score.
*   **Do** use `tertiary_fixed_dim` (#e9c176) for "Golden Moments"—awards, high grades, or completed certifications.
*   **Do** prioritize `surface_container_lowest` for the main content area to make the teacher's "workspace" feel bright and focused.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#1b1b21) to maintain tonal depth.
*   **Don't** use "Standard" drop shadows. If it looks like a default CSS shadow, it’s wrong. It must be ambient and diffused.
*   **Don't** use icons as the primary way to communicate. Use high-end typography (Labels) alongside icons to ensure the "Professional" tone is maintained.