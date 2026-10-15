# Verify: Brand identity & design tokens · spec 0001 · updated 2026-10-12
_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Open index.html in browser → inspect title and header logo → displays "Braids by Helen" and logo.png cleanly without 404 → AC-2, AC-3
- [ ] Inspect computed styles on body → background is #FFF9F2 and text color is #302522 → AC-1, AC-5
- [ ] Inspect typography on headings and body → h1-h6 use Cormorant Garamond and body uses DM Sans → AC-2
- [ ] Inspect buttons and primary controls → background is primary burgundy #70263D with high contrast text → AC-1, AC-4
- [ ] Tab navigate through interactive controls → visible gold focus outline appears with high contrast → AC-4

## Commands
- [ ] `npm run build` → production build bundles clean with zero errors or unresolved asset imports → AC-1, AC-2, AC-3

## Acceptance criteria coverage
- AC-1: covered by body computed style check and `npm run build`
- AC-2: covered by heading and body font family inspection
- AC-3: covered by browser title, logo asset, and favicon check
- AC-4: covered by interactive control contrast and focus ring check
- AC-5: covered by body background and selection color inspection
