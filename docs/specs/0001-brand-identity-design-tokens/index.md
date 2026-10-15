# 0001. Brand identity & design tokens

**Date**: 2026-10-12
**Status**: In Progress

## Summary

This decision migrates the salon demo from Lyna Hair Touch to Braids by Helen. We establish a centralized palette based on the client brief with Primary Burgundy, Warm Ivory, Soft Gold, Espresso Brown, and Dusty Rose, paired with Cormorant Garamond and DM Sans typography. We also organize the supplied logo and app icon into the public assets directory with standard web and mobile icon sizes. This creates the visual foundation that every later customer and admin interface builds on.

## Requirements

**User stories**:
- As a customer visiting Braids by Helen, I want to see cohesive luxury branding, clear readable typography, and authentic salon assets so that I trust Helen's professional craftsmanship.
- As a developer building features across the app, I want centralized design tokens and semantic utility classes so that styling remains consistent and maintainable without magic hex values.

**Acceptance criteria**:
- **AC-1**: Centralized design tokens for Primary Burgundy (`#70263D`), Warm Ivory (`#FFF9F2`), Soft Gold (`#C5A46D`), Espresso Brown (`#302522`), Dusty Rose (`#D9A6A6`), and Pure White (`#FFFFFF`) are declared as CSS variables in `src/index.css` and exposed via `tailwind.config.js`.
- **AC-2**: Typography configuration loads Cormorant Garamond for serif headings and DM Sans for interface and body text, with accessible fallbacks.
- **AC-3**: Brand assets from the New assets directory (`Logo.png` and `Icon.png`) are placed in `public/assets/`, with generated standard icon variants (32px favicon, 192px and 512px PWA icons) and updated `index.html` metadata.
- **AC-4**: Semantic tokens for states (success, warning, error, interactive hover, and focus ring outlines) meet WCAG AA contrast standards on both ivory and white surfaces.
- **AC-5**: Global styles in `src/index.css` apply the base background (`#FFF9F2`), text color (`#302522`), and selection highlighting matching the new palette.

## Decision

**Chosen option**: Option 2: Hybrid CSS custom properties mapped into Tailwind

We adopt the hybrid CSS custom properties and Tailwind extension architecture, configure Cormorant Garamond and DM Sans typography, and establish the asset pipeline for `Logo.png` and `Icon.png`.

## Rationale

Reasoning and options: see [rationale.md](./rationale.md).

## Feature design

**Data model sketch**:
Not applicable (styling and visual asset foundation).

**API surface**:
Not applicable (frontend visual styling tokens).

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Page load | Primary brand color (`#70263D`) | CSS variable `--color-primary` in `src/index.css` |
| Page load | Background surface (`#FFF9F2`) | CSS variable `--color-background` in `src/index.css` |
| Page load | Accent gold highlight (`#C5A46D`) | CSS variable `--color-accent` in `src/index.css` |
| Page load | Text body color (`#302522`) | CSS variable `--color-text` in `src/index.css` |
| Page load | Secondary rose accent (`#D9A6A6`) | CSS variable `--color-secondary` in `src/index.css` |
| Header and Footer render | Brand logo image | Asset `public/assets/logo.png` derived from `New assets/Logo.png` |
| Browser tab render | Favicon and app icon | Asset `public/favicon.ico` and `public/assets/icon-192.png` derived from `New assets/Icon.png` |

**Key invariants**:
- All component styling must reference semantic tokens or palette utility names, never ad hoc arbitrary hex strings.
- Interactive controls must display visible focus rings using `--color-accent` or `--color-primary` with minimum 3:1 contrast against adjacent backgrounds.
- Brand logo rendering must maintain natural aspect ratio without distortion.

**Security model**:
Not applicable (static frontend presentation tokens and assets).

**Configuration required**:
- Fonts loaded via Google Fonts link in `index.html` or font imports in `src/index.css` for Cormorant Garamond and DM Sans.

**Critical test scenarios**:
- Happy path: Rendering the application shows warm ivory background, espresso text, burgundy primary buttons, gold highlights, and the Braids by Helen primary logo, verifies **AC-1**, **AC-2**, **AC-3**, **AC-5**
- Contrast check: Text elements on ivory and burgundy backgrounds satisfy WCAG AA contrast ratio (minimum 4.5:1 for normal text), verifies **AC-4**
- Asset verification: Browser loads favicon and logo assets cleanly without 404 network errors, verifies **AC-3**

## Build plan

- [x] 1. Copy and optimize `Logo.png` and `Icon.png` from the New assets directory into `public/assets/` and generate standard icon derivatives, satisfies **AC-3**
- [x] 2. Update `index.html` with Cormorant Garamond and DM Sans font imports, page title "Braids by Helen", and favicon links, satisfies **AC-2**, **AC-3**
- [x] 3. Declare CSS design tokens and base element styles in `src/index.css`, satisfies **AC-1**, **AC-4**, **AC-5**
- [x] 4. Update `tailwind.config.js` with the new color tokens, font families, and shadow utilities, satisfies **AC-1**, **AC-2**
- [x] 5. Verify visual rendering across mobile and desktop viewport sizes, satisfies **AC-4**, **AC-5**

## Consequences

**Positive**:
- Unifies the visual language around Helen's authentic luxury brand.
- Centralizes color and font tokens so future component edits remain clean and maintainable.
- Eliminates leftover Lyna Hair Touch styling references.

**Negative / tradeoffs**:
- Requires updating existing components that reference legacy palette classes like `rosewood-*` and `blush-*`.

**Neutral**:
- Font loading depends on Google Fonts CDN or local font asset hosting.

## Follow-up

- [ ] Update existing customer and booking components during subsequent slices to migrate legacy color utility classes to the new tokens

## Migration plan

**Strategy**: Strangler (incremental component token update)
**Phases**:
1. Foundation setup: install tokens, font links, and assets into public directory and Tailwind configuration.
2. Layout migration: update Navbar, Hero, and Footer to display the new logo and primary burgundy styling.
3. Feature migration: update booking modal and dashboard cards during Slices 1 and 2.
**Rollback**: Revert configuration changes to `tailwind.config.js` and `src/index.css`.
**Risks**: Minor visual style mismatches in unmigrated components while legacy classes remain active.
