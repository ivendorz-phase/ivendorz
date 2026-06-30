# Brand Assets

These SVG files are **authoritative**.

**Never:**

- recreate
- optimize
- export
- redraw
- simplify
- recolor

Replace only with an **official replacement approved by Brand**.

These assets are intentionally **stored exactly as delivered** — the original bytes are canonical
(no SVGO, no Illustrator/export save, no cleanup, no reformatting). The logo is an _asset, not code_,
and is **never regenerated** (including by tooling or AI).

## Status

Brand integration is complete. The only remaining requirement is the addition of the official,
unmodified SVG assets under `public/brand/`. Until those files are present, logo rendering will
remain intentionally incomplete.

## Files

| File | Component | Surfaces |
|---|---|---|
| `ivendorz-logo-long.svg` | `BrandLogo` (default · full lockup) | public header · auth · marketing/landing · footer · docs · branded empty states |
| `ivendorz-logo-s.svg` | `BrandMark` (compact) | authenticated shell · collapsed sidebar · mobile nav · favicon · loading/avatar marks |

## The only way to render the brand

- Render **only** via the kit: `src/frontend/brand` → `BrandLogo` / `BrandMark`. Size with the
  `height` prop; width stays proportional (never stretched). No effects, no recolor.
- These paths are referenced **only** through the brand module — the components, or the exported
  `BRAND_LOGO_SRC` / `BRAND_MARK_SRC` constants. Nothing else hardcodes `/brand/…` (the favicon in
  `app/layout.tsx` imports `BRAND_MARK_SRC`).
- **Never** substitute text, Lucide icons, or placeholder squares for the brand.

> Onboarding requirement: any new UI needing branding reuses `BrandLogo` / `BrandMark` as-is. To
> change the artwork, replace these files with a Brand-approved original — do not edit them in place.
