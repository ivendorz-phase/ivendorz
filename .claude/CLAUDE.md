# iVendorz Skills Guide

## Available Custom Skills

### Pre-Commit Checklist
- **`/fe-checklist`** — Run before committing frontend code
  - Checks: prettier, tsc, lint, kit duplication, routes
  - Blocks commit if failed

- **`/ivendorz-security`** — Run before committing backend/data code
  - Checks: org context, RLS, privacy, cross-module access
  - Blocks commit if failed

### Design & Conformance
- **`/ivendorz-fe-design`** — Verify UI matches frozen system
  - Checks: tokens, typography, kit primitives, patterns
  - Audit design conformance

- **`/fe-design-apply`** — Reuse frozen design patterns
  - 8 pattern templates: sidebar, grid, tabs, forms, table, hero, modal, document-flow
  - Composition rules + selection matrix; pick + compose patterns for new pages

### Verification
- **`/ivendorz-verify-fe`** — End-to-end frontend verification
  - 8-layer check: run app, design, governance, journey, state matrix (loading/empty/error/success/focus/disabled), perf, edges, prod build

- **`/fe-verify-bundle`** — Prod-build verification (code-split changes)
  - Isolated build, chunk manifests, barrel audits

### Review & Governance
- **`/review-a-lens`** — Review-A architecture & governance gate
  - Scope, contracts, signals, privacy, invariants, types

## When to Use Each

### Before Writing Code
```
/ivendorz-fe-design  — Check frozen system
/fe-design-apply     — Pick pattern
```

### After Writing Code
```
/fe-checklist              — Code quality gate (frontend)
/ivendorz-security         — Security check (backend/data)
/ivendorz-verify-fe        — End-to-end test
```

### Before Review
```
/fe-verify-bundle   — Prod-build verify (if code-split changes)
/review-a-lens      — Architecture conformance
```

## Frontend Motion Standard — ALL teams & agents (owner directive 2026-07-10)

Every animation in FE code follows **`docs/frontend/design-system/motion_standard.md`**:

- Subtle & professional only — 150–250ms, easeOut/easeInOut, ≤8px translate, scale ≥0.95;
  **no bounce/spring/flash**; respect `prefers-reduced-motion` (global guard exists).
- **Reuse shared vocabulary, never duplicate**: Framer Motion variants/components from
  `@/frontend/motion` (LazyMotion `m.*` only — never full `motion` import); CSS token layer
  (`duration-150/200/250`, `ease-iv-out/-in-out`, `animate-iv-*`, `iv-stagger-*`) for
  Server Components and Radix `data-state` surfaces.
- GPU-friendly properties only (`opacity`/`transform`); never `AnimatePresence` inside Radix
  kit primitives; never break a "Server-render-friendly (no hooks)" kit contract for motion.
- Reviewers (Review-A/B): a one-off duration/easing/keyframe in a surface = duplication
  finding; check the doc's §6 checklist.

---

## Automation

Hooks auto-run:
- ✅ **prettier** after every write (PostToolUse)
- ✅ **Reminder tips** on pending changes (UserPromptSubmit)

Manual invocation:
- 🙋 **All skills** require explicit `/skill-name` (cannot auto-invoke via hooks)

---

## Quick Commands

```bash
/fe-checklist             # Frontend pre-commit
/ivendorz-security        # Backend security pre-commit
/ivendorz-verify-fe       # End-to-end frontend test
/review-a-lens            # Review-A conformance gate
```

---

See `.claude/skills/SKILLS_INDEX.md` for full reference.
