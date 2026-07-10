# `src/frontend/components/` — canonical shared business components

This directory (the Doc-7B kit's "app components" tier) is the **canonical location** for shared,
presentation-only business components used across more than one workspace (Public / Buyer / Vendor /
Admin).

**Rules:**

- App-layer code (`app/(public)/...`, `app/(app)/(buyer)/...`, `app/(app)/_components/vendor/...`,
  `app/(app)/admin/...`) **must consume components from here**, not re-implement them.
- **No new duplicate implementations.** If a component here already does what you need, import and
  compose it. If it's close but not quite right, extend it here — don't fork a second copy in a
  workspace folder.
- Components here are **pure presentation**: props in, JSX out. No fetch, no mutation, no workspace-
  specific business shaping, and — per `NIT-2` below — **no imports from `app/`**.
- Promotion into this directory follows the process in
  [`shared_platform_component_registry.md`](../../../docs/frontend/components/shared_platform_component_registry.md) — normally
  triggered by a genuine second-workspace consumer (§4, "promote on the 2nd consumer"). `comparison/` and
  `rfq/` were promoted here ahead of that trigger under an explicit CTO override (2026-07-03); treat that
  as the exception, not the pattern, for future promotions.

**Import direction is one-way:**

```
src/frontend/components/
        ▲
app/(buyer)    app/(vendor)    app/(admin)    app/(public)
```

`src/frontend/components/` (and its subfolders) must never import from `app/`. Workspace code imports
from here; this directory never imports back.
