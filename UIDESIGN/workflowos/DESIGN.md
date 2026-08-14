---
name: WorkFlowOS
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  section-title:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  metadata:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  button-label:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-page: 24px
---

## Brand & Style

The design system is engineered for high-utility enterprise environments where efficiency and clarity are paramount. The brand personality is professional, objective, and reliable, prioritizing information density over decorative flair. 

The design style follows **Modern Corporate Minimalism**. It utilizes a "Neutral-First" approach, where the interface stays in the background to let user data take center stage. Key characteristics include:
- **Utilitarian Aesthetics:** Every element serves a functional purpose (Form follows Function).
- **Subtle Precision:** Using hairline borders and micro-interactions to signify state changes rather than heavy shadows or vibrant colors.
- **Information Density:** Optimized layouts that allow users to scan large datasets (Tables, KPIs) without cognitive overload.
- **Focus-Oriented:** A clean, distraction-free environment that highlights "Actionable Insights" (Perlu Perhatian) through restrained use of accent colors.

## Colors

This design system employs a restrained palette designed for long-term use without eye fatigue.

- **Primary Actions:** `#2563EB` (Blue) is used strictly for primary call-to-actions, active navigation states, and progress indicators.
- **Surface & Backgrounds:** The main interface uses `#F8FAFC` (Off-white) to reduce stark contrast against the primary text, while `#FFFFFF` (Pure White) is reserved for cards and elevated containers.
- **Typography:** Primary text uses `#1A1C1E` (Dark Charcoal) for maximum legibility. Secondary text/Metadata uses `#64748B` (Slate) to create clear visual hierarchy.
- **Semantic States:** Success, Warning, and Danger colors are used only in badges, status icons, or critical alerts to ensure they "pop" against the neutral backdrop when a user's attention is required.

## Typography

The typography system relies on **Inter** for its exceptional legibility in data-heavy interfaces and its neutral, systematic feel.

- **Scale:** Use `display-lg` for Page Titles and `display-md` for secondary headers.
- **Body Text:** Use `body-base` (15px) for general content and `body-sm` (14px) for data entries within tables or sidebars to maintain high density.
- **Metadata:** Use 12px for timestamps, small labels, and "Helper Text."
- **Weights:** Use *Regular (400)* for body, *Medium (500)* for section headers, and *SemiBold (600)* for primary navigation or emphasis. Avoid *Bold (700)* to keep the interface looking refined.

## Layout & Spacing

This design system uses an **8px grid system** (with 4px increments for micro-spacing) to ensure rigorous alignment.

- **Layout Model:** A fixed-sidebar (240px or 280px) paired with a fluid content area.
- **Grid:** Use a 12-column grid for dashboard layouts. Content containers should use a gutter of `16px`.
- **Density:** Components like tables should offer "Compact" and "Standard" views. Compact views use `4px` vertical padding, while Standard uses `8px`.
- **Breakpoints:**
  - **Mobile (<768px):** Sidebar collapses into a hamburger menu. Page margins reduce to `16px`.
  - **Tablet (768px - 1024px):** Sidebar may collapse to an icon-only "rail" to save horizontal space.
  - **Desktop (>1024px):** Full sidebar and multi-column KPI distribution.

## Elevation & Depth

Elevation in this design system is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than dramatic shadows.

- **Surface 0 (Background):** `#F8FAFC`. Used for the main application canvas.
- **Surface 1 (Cards/Containers):** `#FFFFFF` with a `1px` border in `#E2E8F0`. This is the primary elevation for content modules and tables.
- **Shadows:** Use a single, highly diffused "Soft Shadow" for floating elements like Modals or Dropdowns: `0px 4px 12px rgba(0, 0, 0, 0.05)`. 
- **Z-Index:**
  - `Base`: 0
  - `Navigation/Sidebar`: 100
  - `Sticky Headers`: 200
  - `Modals/Overlays`: 1000

## Shapes

The shape language is **Soft (0.25rem / 4px)**, reflecting a professional and structured environment.

- **Components:** Buttons, Input Fields, and Checkboxes all use the `4px` base radius.
- **Containers:** Large cards or "Panel" elements use `rounded-lg` (8px) to provide a gentle distinction from the sharper internal elements.
- **Status Badges:** Use `rounded-xl` (12px) or a full pill-shape to differentiate "Status Indicators" from clickable buttons.

## Components

### Buttons
- **Primary:** Background `#2563EB`, White text. No gradients.
- **Secondary:** White background, `#E2E8F0` border, `#1A1C1E` text.
- **Ghost:** No background or border, used for secondary actions like "Cancel" or "Batal".

### Data Tables (Enterprise-grade)
- **Header:** Light gray background (`#F1F5F9`), uppercase metadata typography.
- **Rows:** Border-bottom `1px` in `#F1F5F9`. Hover state uses a subtle background shift to `#F8FAFC`.
- **Cells:** Vertical alignment centered. 14px text.

### KPI Cards
- Compact layout. Top-aligned label (Metadata style), followed by a large numeric value (display-md), and a bottom-aligned "trend" indicator (Success/Danger green/red text).

### Status Indicators (Severity Badges)
- **Success (Selesai):** Light green background, dark green text.
- **Warning (Peringatan):** Light amber background, dark amber text.
- **Critical (Bahaya):** Light red background, dark red text.
- Use `rounded-xl` for a pill-shaped appearance to signify these are labels, not buttons.

### Form Inputs
- `1px` border in `#CBD5E1`. On focus, the border changes to Primary Blue (`#2563EB`) with a subtle `2px` outer glow in the same color at 10% opacity.
- Placeholder text in `#94A3B8`.

### Sidebar
- Dark or Light variant supported. Active menu items use a "Left-border" indicator (4px width) in Primary Blue to clearly mark the current location.