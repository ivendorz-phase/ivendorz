# iVendorz brand assets — SINGLE SOURCE OF TRUTH

Every surface renders the official logo via the kit (`src/frontend/brand`):
`BrandLogo` (full lockup) and `BrandMark` (compact mark). Nothing recreates, redraws,
recolors, or approximates the brand in code.

## Required files (place the OFFICIAL SVGs here, byte-for-byte)

| File | Used by | Surfaces |
|---|---|---|
| `ivendorz-logo-long.svg` | `BrandLogo` (default) | Public header, auth pages, marketing/landing, footer, docs, branded empty states |
| `ivendorz-logo-s.svg` | `BrandMark` (compact) | Authenticated shell, collapsed sidebar, mobile nav, favicon, loading/avatar marks |

## Rules

- Use the **official** SVGs exactly as provided — **never recreate, recolor, re-proportion,
  or add gradients/shadows/outlines**. Preserve each file as-is.
- Size only via the component `height` prop; width stays proportional (never stretched).
- The favicon is wired in `app/layout.tsx` via the brand module's `BRAND_MARK_SRC` constant.
- **Commit these exactly as delivered — no SVGO, no optimization, no re-export / Illustrator save,
  no cleanup, no formatting. The original bytes are canonical.** They are an asset, not code, and are
  never regenerated. Only `BrandLogo` / `BrandMark` (and the exported `BRAND_*_SRC` constants) may
  reference these paths.

> If either file is missing, the logo will 404 at runtime — drop the official asset in with the
> exact filename above. (These bytes were intentionally left for the brand owner to place rather
> than reproduced in-tool, to avoid any risk of an approximated/altered brand mark.)
