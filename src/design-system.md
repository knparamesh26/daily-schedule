---
name: Productivity Focus
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1b1a'
  on-tertiary-container: '#868381'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#e6e1df'
  tertiary-fixed-dim: '#cac6c3'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
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
  gutter: 20px
  margin: 40px
---

## Brand & Style

This design system is engineered for high-velocity professional environments where cognitive load must be minimized. The brand personality is disciplined, efficient, and unobtrusive, acting as a quiet partner in the user's workflow rather than a distraction.

The style is a refined **Corporate Modern** aesthetic. It leverages heavy whitespace and a strict mathematical grid to create a sense of calm and order. By stripping away decorative elements and focusing on functional clarity, the UI directs the user's attention solely toward their tasks. The emotional response should be one of "controlled momentum"—the feeling that the interface is keeping pace with the user's thoughts.

## Colors

The palette is built on a foundation of "Functional Grayscale." The background uses a slightly off-white neutral to reduce eye strain during long sessions. Primary actions are anchored by a deep charcoal to maintain a professional weight.

Vibrant accents are reserved strictly for semantic meaning:
- **Blue (#3B82F6):** Represents active momentum and "In Progress" states.
- **Green (#10B981):** Signifies resolution and "Completed" milestones.
- **Amber (#F59E0B):** Signals "Pending" status or items requiring attention.
- **Secondary Indigo (#6366F1):** Used sparingly for interactive highlights that are not status-dependent.

## Typography

This design system utilizes **Inter** exclusively to take advantage of its exceptional legibility in data-dense environments. The type scale emphasizes a clear vertical hierarchy through deliberate weight shifts.

- **Headlines:** Use tighter letter-spacing and heavier weights to create strong anchors for sections.
- **Body:** Set with generous line-heights to ensure task descriptions remain readable even when text is dense.
- **Labels:** Small caps or medium-weight uppercase may be used for metadata tags to distinguish them from actionable task text.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a 12-column structure for the main content area. A fixed-width side navigation (240px) is recommended to maintain a consistent anchor point.

Spacing is based on a 4px baseline, but the "generous whitespace" requirement dictates a preference for the `lg` (24px) and `xl` (32px) increments to separate high-level modules. This "macro-spacing" allows the user to parse different workstreams without visual interference.

## Elevation & Depth

This design system employs **Ambient Shadows** to create a functional hierarchy without the clutter of heavy borders. Depth is used sparingly to indicate interactivity and z-axis importance:

- **Level 0 (Surface):** The main background (`#F8FAFC`).
- **Level 1 (Cards):** Flat white background with a 1px soft gray border (`#E2E8F0`).
- **Level 2 (Hover/Active):** A very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)).
- **Level 3 (Modals/Overlays):** High-diffusion, low-opacity shadow (0px 12px 24px rgba(0,0,0,0.08)) to focus the user on a single task.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding provides a modern feel while maintaining the professional rigor associated with sharp-edged productivity tools.

- **Inputs and Buttons:** Use the base `rounded` (4px).
- **Cards and Modals:** Use `rounded-lg` (8px) to soften larger surface areas.
- **Status Indicators/Chips:** Can utilize `rounded-full` (pill) to distinguish them from interactive buttons.

## Components

### Buttons
Primary buttons use the charcoal color with white text. Secondary buttons are ghost-style with a subtle border. Interactions should be snappy—use 150ms transitions for hover states to emphasize efficiency.

### Chips & Status Indicators
Status chips use a low-opacity background of the accent color (e.g., 10% opacity Blue) with high-contrast text of the same hue. This ensures the status is visible but doesn't compete with the task content.

### Task Cards
Cards should be flat by default, becoming elevated on hover. Information density should be high but organized, using the `label-sm` typography for metadata like due dates and project names.

### Form Inputs
Inputs use a white background with a 1px border. Focus states are indicated by a 2px secondary indigo ring with no offset, providing a crisp, clear indicator of the active field.

### Progress Bars
Use a thin 4px track height. The progress fill should use the `status_in_progress` blue to reinforce the "work in motion" narrative.
