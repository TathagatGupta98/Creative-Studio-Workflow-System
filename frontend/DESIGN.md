---
name: StudioFlow Neo-Brutal
colors:
  surface: '#fdfae4'
  surface-dim: '#dedbc6'
  surface-bright: '#fdfae4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f4df'
  surface-container: '#f2efd9'
  surface-container-high: '#ece9d3'
  surface-container-highest: '#e6e3ce'
  on-surface: '#1c1c0f'
  on-surface-variant: '#484831'
  inverse-surface: '#323123'
  inverse-on-surface: '#f5f1dc'
  outline: '#79785f'
  outline-variant: '#cac8aa'
  surface-tint: '#626200'
  primary: '#626200'
  on-primary: '#ffffff'
  primary-container: '#ffff00'
  on-primary-container: '#757500'
  inverse-primary: '#cdcd00'
  secondary: '#2f29e8'
  on-secondary: '#ffffff'
  secondary-container: '#4b4cff'
  on-secondary-container: '#e8e6ff'
  tertiary: '#bb1522'
  on-tertiary: '#ffffff'
  tertiary-container: '#fff5f4'
  on-tertiary-container: '#d72d32'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaea00'
  primary-fixed-dim: '#cdcd00'
  on-primary-fixed: '#1d1d00'
  on-primary-fixed-variant: '#494900'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2215e0'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930014'
  background: '#fdfae4'
  on-background: '#1c1c0f'
  surface-variant: '#e6e3ce'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.5'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-page: 32px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  border-width-thin: 2px
  border-width-thick: 4px
  shadow-offset: 4px
---

## Brand & Style

This design system is built on the principles of **Neo-Brutality**. It is designed for creative teams who want a workflow manager that feels as energetic and raw as their creative process. The aesthetic rejects the polished, overly-sanitized "SaaS" look in favor of bold confidence, high-impact visuals, and a physical, boxy structure.

The interface should evoke a sense of urgency and clarity. By using unyielding black borders and hard, geometric shadows, we create a UI that feels tactile—like blocks on a physical workspace. It is unapologetically loud, functional, and structured, prioritizing high-contrast legibility over subtle gradients.

## Colors

The palette is rooted in a high-saturation, primary-heavy spectrum. 

- **Primary (Yellow):** Used for main actions and high-priority highlights.
- **Secondary (Blue):** Used for navigation, links, and secondary interactive elements.
- **Tertiary (Red):** Reserved for destructive actions, errors, and "Overdue" status indicators.
- **Quaternary (Mint):** Used for "Completed" states and positive confirmations.
- **Neutral:** A stark black (#000000) for all borders, shadows, and text, set against an off-white background to ensure the 100% saturated accents "pop" without overwhelming the eye.

## Typography

Typography follows a hierarchy of "Impact vs. Utility." 

Headlines use **Montserrat** in its heaviest weights (Extra Bold and Black) to anchor the page. For titles and large headings, tight letter spacing and uppercase styling enhance the brutalist aesthetic. 

Body text utilizes **Hanken Grotesk** for its modern, clean legibility which balances the aggression of the headlines. **JetBrains Mono** is used for metadata, tags, and labels (Tasks, Projects, Dashboard) to provide a technical, "under-construction" vibe that fits the workflow logic.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy. Content is housed within defined containers that use a strict 8px spacing rhythm. 

- **Desktop:** 12-column grid with 24px gutters. Sidebars are fixed width (280px) with a heavy right border.
- **Mobile:** Single column with 16px margins. Headlines scale down to `headline-md` for accessibility.
- **Visual Rhythm:** Elements do not rely on whitespace alone; they are separated by physical 2px or 4px black borders. Padding within cards and containers is generous (typically 24px) to ensure the heavy borders don't feel claustrophobic.

## Elevation & Depth

Elevation is never communicated through blurs or soft shadows. Instead, it uses **Hard Shadows**:
- **Level 1 (Buttons/Cards):** 4px horizontal and 4px vertical offset, 0px blur, #000000.
- **Level 2 (Active/Hover):** 8px horizontal and 8px vertical offset, 0px blur, #000000.
- **Level 3 (Modals):** 12px offset.

The "Pressed" state of a button or card is achieved by reducing the shadow offset to 0px and shifting the element's position, mimicking a physical press. Tonal layering is achieved by filling containers with 100% saturated primary colors against the off-white background.

## Shapes

The shape language is overwhelmingly **boxy**. 
A slight border-radius of 4px (`roundedness: 1`) is applied to prevent the UI from feeling dangerously sharp, but it should never approach "soft" or "circular" territory. 

- **Buttons & Cards:** 4px radius.
- **Input Fields:** 0px radius (Sharp).
- **Tags/Chips:** 4px radius.
- **Navigation Highlights:** 0px radius.

## Components

### Buttons
Primary buttons use a #FFFF00 (Yellow) fill with a 4px black border and a 4px hard shadow. Text is Montserrat Extra Bold, uppercase. On hover, the shadow increases to 8px.

### Input Fields
Inputs are sharp-cornered (0px radius) with a 2px black border. The background is white. When focused, the border thickens to 4px or changes color to #4B4BFF (Blue).

### Cards (Tasks/Projects)
Cards are the core of the workflow. They use a white background, 2px black border, and 4px black shadow. Headers within cards should use the primary accent colors (e.g., a "New Task" header in Mint Green).

### Status Chips
Status chips use high-contrast fills:
- **Draft:** White background, 2px border.
- **Review:** #FFFF00.
- **Overdue:** #FF4B4B.
- **Completed:** #00FF9D.

### Dashboard Widgets
Widgets are treated as heavy containers. Data visualizations (like "Total Projects") should use thick black lines for charts instead of soft area fills.

### Navigation Sidebar
The sidebar items use `label-md` (JetBrains Mono). Active states are indicated by a 100% saturated fill (Blue) behind the text with a 2px black border, making the active link look like a pressed button.