---
name: Unified Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e5'
  on-secondary-container: '#626567'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e0e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  h1:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h1-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-padding: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is built on a foundation of clarity, efficiency, and professional focus. It adopts a **Modern Minimalist** aesthetic that prioritizes content over chrome, ensuring that users can manage complex tasks without cognitive overload. The emotional response should be one of "calm productivity"—where the interface feels like a reliable tool that disappears into the background until needed.

Key stylistic pillars include:
- **Functional Precision:** Every element has a clear purpose and a defined place in the hierarchy.
- **Visual Breathability:** Extensive use of whitespace to group related tasks and reduce visual noise.
- **Refined Interactivity:** Subtle transitions and state changes (hover, focus, active) that provide immediate but non-intrusive feedback.

## Colors
This design system utilizes a professional palette rooted in Slate and Zinc tones, accented by a crisp Indigo primary. 

- **Primary (Indigo-600):** Used for primary actions, active states, and focus indicators. It provides a sharp, energetic contrast against neutral backgrounds.
- **Neutrals (Slate):** A range of greys from Slate-50 to Slate-950 handles surfaces, text hierarchy, and borders. 
- **Semantic Colors:** Standard success (Emerald), destructive (Rose), and warning (Amber) tones are used sparingly for status indicators and high-stakes actions.
- **Dark Mode Strategy:** The system scales by inverting the luminance of the neutral palette while maintaining the primary Indigo's vibrance (adjusting to Indigo-500/400) to ensure accessibility and contrast.

## Typography
The system uses **Inter** exclusively to achieve a clean, systematic look that is highly legible at small sizes (essential for task details and metadata).

- **Hierarchy:** Use bold and semi-bold weights for headlines to create clear section breaks. 
- **Text Contrast:** Primary body text uses Slate-900/950, while secondary descriptions or metadata use Slate-500/600.
- **Scale:** On mobile devices, headline sizes are reduced to prevent excessive line wrapping in tight views like task lists or sidebars.

## Layout & Spacing
The layout follows a **Fluid Grid** model with fixed maximum widths for content readability. 

- **Grid:** A 12-column grid is used for desktop dashboards. Elements typically align to an 8px spacing rhythm.
- **Margins:** Desktop views utilize a 24px or 32px outer margin, while mobile views compress to 16px.
- **Breakpoints:**
  - **Mobile:** < 640px (Single column layout).
  - **Tablet:** 640px - 1024px (Navigation collapses to a drawer or icon bar).
  - **Desktop:** > 1024px (Permanent sidebar navigation, multi-pane task views).

## Elevation & Depth
Depth is created using a combination of **Tonal Layers** and **Subtle Shadows**. This design system avoids heavy shadows, opting for a "flat plus" look.

- **Level 0 (Background):** Slate-50 or Pure White. Used for the main canvas.
- **Level 1 (Cards/Sidebar):** Pure White with a 1px Slate-200 border. This is the primary surface for task items and sidebar navigation.
- **Level 2 (Popovers/Modals):** Pure White with a subtle, diffused shadow (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1)`). 
- **State Changes:** Interactive elements (like cards or buttons) may lift slightly on hover, often indicated by a slightly darker border color rather than a larger shadow.

## Shapes
The shape language follows the standard shadcn/ui aesthetic: clean, friendly, but professional.

- **Standard Elements:** Buttons, inputs, and small cards use a **0.5rem (8px)** radius.
- **Large Elements:** Modals and large containers use a **1rem (16px)** radius.
- **Interactive Indicators:** Selection indicators in sidebars or segmented controls use a **0.375rem (6px)** radius to fit comfortably within parent containers.

## Components
Consistent component behavior ensures the system remains predictable and accessible.

- **Buttons:** 
  - *Primary:* Indigo background, white text. No gradient.
  - *Secondary:* Slate-100 background, Slate-900 text.
  - *Ghost:* No background, appears on hover. Used for utility actions in lists.
- **Inputs:** 1px Slate-200 border that transitions to a 2px Indigo ring on focus. Text uses `body-sm`.
- **Cards:** White background, 1px Slate-200 border. Padding is typically 16px (`stack-md`).
- **Chips/Badges:** Small, low-contrast pills (e.g., Slate-100 background with Slate-700 text) used for tags or status. Success/Warning variants follow semantic colors but with high-transparency backgrounds.
- **Lists:** Task lists use `border-b` dividers in Slate-100. Hovering over a list item reveals "ghost" action buttons for editing or deleting.
- **Checkboxes:** When checked, they fill with the Primary Indigo color and a white checkmark. The transition should be a quick scale-in.