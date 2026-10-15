# Rationale: 0001. Brand identity & design tokens

## Context

The demo currently uses Lyna Hair Touch branding, placeholder color names (rosewood, blush, espresso, cream), and generic styling visuals. The business owner, Helen in Ibadan, requires a distinct luxury brand identity reflecting African braiding artistry.

The master product brief defines the exact core color tokens, typography suggestions, and supplied assets in the New assets directory (Logo.png, Icon.png, two photos, and two videos).

Without a structured design token architecture, components across customer landing, booking modal, and admin schedule would either hardcode inconsistent color hex codes or reference obsolete salon names. Establishing centralized design tokens, font pairings, and optimized asset paths ensures consistent styling, high contrast accessibility, and effortless theming across all screens.

## Options considered

### Option 1: Direct Tailwind color hex replacement only

Replace the colors directly in `tailwind.config.js` without declaring CSS custom properties.

**Pros**:
- Fast single file configuration edit.

**Cons**:
- Lacks dynamic runtime theme inspection and makes future dark mode or theme switching difficult.

### Option 2: Hybrid CSS custom properties mapped into Tailwind

Define design tokens as CSS variables in `src/index.css` and wire them into `tailwind.config.js` as semantic color aliases.

**Pros**:
- Provides both utility class ergonomic speed and runtime CSS variable access.
- Centralizes design tokens in one clean stylesheet while supporting standard Tailwind utilities (`bg-primary`, `text-espresso`, `border-accent`).

**Cons**:
- Requires coordinating declarations across `src/index.css` and `tailwind.config.js`.

### Option 3: Full CSS in JS or CSS modules migration

Move styles from Tailwind to a runtime styling library.

**Pros**:
- Scoped component styles.

**Cons**:
- Major architectural deviation that contradicts the project stack rule in `AGENTS.md` and slows build performance.

## Rationale

Option 2 aligns directly with the existing Tailwind CSS 3 setup while satisfying the master brief requirement for centralized design tokens. It avoids hardcoding hex codes in multiple JSX files and keeps CSS variables easily accessible for canvas confetti animations, PWA theme colors, and SVG fills.
