# fe-checklist Skill

**Invoke:** `/fe-checklist`

## Purpose
Frontend pre-commit checklist. Catches common mistakes before they reach Review-A: prettier drift, kit duplication, barrel re-exports, unregistered routes, placeholder content.

## When to Use
- Before `git commit` on any frontend change
- After building a new page or component
- To unblock Review-A (fixes common findings early)

---

## Pre-Commit Checklist

### 1. Code Quality Gates
- [ ] `pnpm run prettier` passes (no formatting drift)?
- [ ] `pnpm run type-check` passes (no TypeScript errors)?
- [ ] `pnpm run lint` passes (ESLint clean)?
- [ ] No `console.log`, `debugger`, or `TODO` comments left in code?

**Run:**
```bash
pnpm run prettier --check
pnpm run type-check
pnpm run lint
```

---

### 2. Component Duplication Check
- [ ] No raw `<input>`, `<button>`, `<select>`, `<textarea>` (use kit primitives)?
- [ ] No custom tab component (use `WorkspaceTabs` from kit)?
- [ ] No custom sidebar/nav (use `SideBar`/`TopBar` from kit)?
- [ ] No custom form label wrapper (use kit `Label` if it exists)?

**Search in your changes:**
```bash
git diff HEAD | grep -E '<input|<button|<select|<textarea'
# If found in your new code → use kit primitive instead
```

**Kit primitives location:** `src/frontend/` (check `index.ts` for exports)

---

### 3. Barrel Re-export Audit (Prod-Build Leak)
- [ ] No imports from parent barrel files that re-export too much?
- [ ] If importing from `../components/index.ts`, verify it doesn't pull heavy utilities alongside light UI?

**Example (BLOCKER):**
```typescript
// ❌ Barrel re-exports both light nav model + heavy MegaMenu
// src/frontend/navigation/index.ts
export { navigationModel } from './model'
export { MegaMenu } from './mega-menu' // 50KB chunk!

// app/layout.tsx imports for SEO (always-eager)
import { navigationModel } from '../frontend/navigation'
// ^ Turbopack sees the barrel, includes MegaMenu as eager script on every page
```

**Fix:** Import specific modules, bypass the barrel.
```typescript
import { navigationModel } from '../frontend/navigation/model'
```

---

### 4. Route Registration
- [ ] New page routes added to route registry (check `scripts/verify-fe-wbs-coverage.mjs`)?
- [ ] Route added to `IMPLEMENTATION_START_HERE.md` (page universe)?
- [ ] ESC class assigned if new (`ESC-BUY-*`, `ESC-VEN-*`, etc.)?

**Check:**
```bash
pnpm run verify-fe-coverage
# Should include your new route
```

---

### 5. Content Reality Check
- [ ] No hardcoded Lorem Ipsum or "TODO: add real content"?
- [ ] Real data flowing through (not placeholder fixtures)?
- [ ] Responsive mockup tested on mobile/tablet/desktop sizes?

**Guidance:** Use dev data or staging fixtures that look real (company names, vendor data, RFQ examples). Never ship placeholder prose.

---

### 6. Responsive Design Check
- [ ] Tested mobile breakpoint (320px)?
- [ ] Tested tablet breakpoint (768px)?
- [ ] Tested desktop breakpoint (1024px+)?
- [ ] No horizontal scroll on mobile?

**Quick test:**
```bash
pnpm run dev
# Open DevTools, toggle device toolbar (Ctrl+Shift+M)
# Test: iPhone SE, iPad, Desktop
```

---

### 7. Token & Theme Consistency
- [ ] All colors use `--iv-*` tokens (no hex codes)?
- [ ] All text sizes use Tailwind scale (`text-sm`, `text-lg`, no `text-[14px]`)?
- [ ] Dark/light theme applied (check `@media (prefers-color-scheme: dark)`)?

**Search:**
```bash
git diff HEAD | grep -E '#[0-9A-F]{6}|text-\['
# If found → replace with tokens
```

---

### 8. Accessibility Basics
- [ ] Form labels associated with inputs (`<label htmlFor="id">`)?
- [ ] Images have alt text?
- [ ] Buttons labeled (not icon-only without aria-label)?
- [ ] Focus states visible (not removed)?

---

## Quick Commands

```bash
# Full pre-commit check
pnpm run prettier --check && pnpm run type-check && pnpm run lint && pnpm run verify-fe-coverage

# Or manually:
pnpm prettier --check
pnpm type-check
pnpm lint
pnpm verify-fe-coverage
```

---

## If Checklist Fails

**Prettier drift?**
```bash
pnpm prettier --write .
git add .
```

**TypeScript error?**
```bash
pnpm type-check --noEmit
# Fix errors, re-test
```

**Route not registered?**
- Add to `scripts/verify-fe-wbs-coverage.mjs`
- Re-run verify command

**Kit duplication found?**
- Replace raw element with kit import
- Test it looks the same
- Re-run type-check

---

## Red Flags

Stop and escalate if:
- [ ] Introducing a new kit primitive when one exists (architecture change)
- [ ] Removing existing component (breaking change)
- [ ] Circular import in barrel files
- [ ] Performance regression in dev build time

---

## Reference

- **Memory:** `Review-A kit-primitive duplication check` (duplication = MINOR)
- **Memory:** `Review-B: isolated production build` (barrel re-export leak pattern)
- **Memory:** `repo-structure-g1-package` (prettier drift)
- **IMPLEMENTATION_START_HERE.md:** Route registry + page universe
- **src/frontend/index.ts:** Kit primitive exports
