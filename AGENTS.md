# Lyna Hair Touch Demo

## Stack

- **Language / Runtime**: JavaScript (ES modules), Node.js
- **Framework**: React 19, Vite 6
- **Key dependencies**: Tailwind CSS 3, Lucide React, Canvas Confetti
- **Package manager**: npm

## Build approach

<TBD, set by /scope>

## Commands

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md`.

## Rules

- Keep all styling inside Tailwind utility classes matching the custom salon palette (rosewood, espresso, blush, and cream).
- State flows through BookingContext for active view navigation, appointment bookings, and schedule records.
- Service and pricing data stay centralized in `src/data/servicesData.js`.
- Clean customer phone numbers to international Nigerian format before generating WhatsApp links.
- Interactive controls must include accessible labels and hover states for mobile and desktop screens.
- Keep components modular and separated between customer presentation, booking steps, and business dashboard views.

## Agent skills

MCP servers: tailwindcss-mcp-server (recommended)

## Context files

- [src/components/booking/AGENTS.md](src/components/booking/AGENTS.md): Five step reservation modal engine and WhatsApp integration

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
