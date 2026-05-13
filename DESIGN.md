---
name: Obsidian
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1b1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e2'
  on-surface-variant: '#c5c6cb'
  inverse-surface: '#e5e2e2'
  inverse-on-surface: '#313031'
  outline: '#8e9195'
  outline-variant: '#44474a'
  surface-tint: '#c1c7cf'
  primary: '#ffffff'
  on-primary: '#2b3137'
  primary-container: '#dde3eb'
  on-primary-container: '#5f656c'
  inverse-primary: '#595f66'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#ffffff'
  on-tertiary: '#3a2e24'
  tertiary-container: '#f3dfd0'
  on-tertiary-container: '#706256'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dde3eb'
  primary-fixed-dim: '#c1c7cf'
  on-primary-fixed: '#161c22'
  on-primary-fixed-variant: '#41474e'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#f3dfd0'
  tertiary-fixed-dim: '#d6c3b5'
  on-tertiary-fixed: '#241a11'
  on-tertiary-fixed-variant: '#51443a'
  background: '#131314'
  on-background: '#e5e2e2'
  surface-variant: '#353535'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: '0'
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  code:
    fontFamily: jetbrainsMono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin: 24px
  container-max: 1440px
---

## Brand & Style

This design system is engineered for high-stakes technical environments where clarity, speed, and focus are paramount. It adopts a **Minimalist** aesthetic with a heavy emphasis on atmospheric depth and structural precision. The visual language evokes a sense of high-performance hardware—cool, dark, and exceptionally responsive.

The target audience consists of engineers and support specialists who require a low-fatigue interface for prolonged monitoring. The style avoids all unnecessary ornamentation, relying on the interplay of deep blacks and subtle luminosity to guide the user's eye toward critical data points and system alerts.

## Colors

The palette is strictly monochromatic, utilizing "Obsidian" grays to create a tiered hierarchy of surfaces. 

*   **Backgrounds:** Pure black (#000000) is the foundation, ensuring maximum contrast and reducing eye strain in dark environments.
*   **Surfaces:** Incremental steps of gray (#0a0a0a through #1a1a1a) define the depth of containers and workspace modules.
*   **Text:** High-contrast slate grays provide legibility. Use #e2e8f0 for primary actions and titles; use #94a3b8 for secondary metadata and inactive states.
*   **Accents:** Visual cues are delivered via luminosity and border shifts rather than hue, maintaining a neutral, technical atmosphere.

## Typography

The typography system utilizes **Geist** for its mathematical precision and developer-centric aesthetic. The hierarchy is built on significant weight shifts and ample white space rather than font size alone.

*   **Headlines:** Utilize semi-bold weights with negative letter spacing to create a compact, authoritative feel.
*   **Body:** Standardized at 14px for maximum information density without sacrificing legibility.
*   **Labels:** Small caps or increased tracking are used for metadata headers to distinguish them from actionable content.
*   **Monospace:** JetBrains Mono is integrated specifically for ticket IDs, logs, and technical parameters to reinforce the system's "pro" utility.

## Layout & Spacing

This design system employs a **Fixed Grid** model for the main dashboard content to ensure consistency across wide-screen monitoring stations.

*   **Grid:** A 12-column grid with 16px gutters allows for flexible arrangement of data widgets.
*   **Rhythm:** A 4px baseline shift governs all internal padding, ensuring that even dense data tables remain scannable.
*   **Breakpoints:** 
    *   **Desktop (1280px+):** Full 12-column display with persistent side navigation.
    *   **Tablet (768px - 1279px):** 6-column display; navigation collapses into an icon-only rail.
    *   **Mobile (Under 768px):** Single column stack with 16px margins.

## Elevation & Depth

In this system, depth is communicated through **Tonal Layering** and **Low-Contrast Outlines** rather than traditional shadows. 

The background (#000000) represents the lowest "floor." Interactive modules sit on top of this using #0a0a0a. Higher-priority elements, like active modals or popovers, use #121212. 

Instead of drop shadows, surfaces are separated by 1px solid borders using #1a1a1a or #262626. This creates a "precision-cut" appearance that feels structural and high-performance. On hover, these borders increase in luminosity to provide immediate tactile feedback.

## Shapes

The shape language is **Soft (0.25rem)**. This slight rounding provides just enough approachability to prevent the UI from feeling aggressive, while maintaining the "hard-edged" professional look required for technical tools. 

*   **Standard Elements:** Buttons, inputs, and chips use a 4px (0.25rem) radius.
*   **Large Containers:** Dashboard cards use 8px (0.5rem) to define major layout sections.
*   **Active States:** Never use pill-shaped containers except for specific status badges to preserve the geometric integrity of the grid.

## Components

### Buttons
Primary buttons feature a ghost-border style (#e2e8f0 at 20% opacity) that transitions to a solid white border on hover. The focus state introduces a subtle outer glow (0px 0px 8px #ffffff20) to simulate a powered-on hardware indicator.

### Filter Chips
Chips are designed with interactive transitions. When inactive, they feature a #1a1a1a border. Upon selection, the border color shifts to #e2e8f0 with a 0.2s ease-in-out opacity shift on the background fill (from 0% to 10% white).

### Cards
Cards are strictly flat. They must use the #0a0a0a surface color and a 1px #1a1a1a border. There are no shadows. Headers within cards should be separated by a subtle horizontal rule of the same border color.

### Input Fields
Inputs utilize the #000000 background to "recess" into the surface. The border is the primary indicator of state: #262626 for resting, #e2e8f0 for active. Text entry should always use the primary text gray (#e2e8f0).

### Data Tables
Tables are the heart of the dashboard. Row separators use #0a0a0a. Hovering over a row should change the background to #0a0a0a to highlight the current data set. Columns should use Geist Mono for numerical data to ensure alignment.