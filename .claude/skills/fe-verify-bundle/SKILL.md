# fe-verify-bundle Skill

**Invoke:** `/fe-verify-bundle`

## Purpose
Isolated production-build verification for frontend code-split, dynamic imports, and bundle chunk ownership. Catches turbopack chunking leaks and barrel re-export eager-load issues that dev-server hides.

## When to Use
- Before Review-B on code-split or `React.lazy` changes
- After lazy-loading component refactors
- When touching barrel exports in `src/frontend/`
- Mandatory before merge if changing SEO baseline or layout imports

## Why This Matters

**Memory:** Review-B on prod-build surfaces MUST run `next build` in an isolated worktree. Dev-server doesn't catch:
- Turbopack bundling `React.lazy` chunk as eager script (was a real MAJOR)
- Barrel re-export loading heavy utilities alongside light UI code
- Chunk manifest inconsistency across page loads

---

## Verification Checklist

### 1. Isolated Build Setup
- [ ] Clone to isolated git worktree (not node_modules junction)
- [ ] Fresh `pnpm install` (real node_modules, no links)
- [ ] Run `pnpm run build` (not next dev)

**Commands:**
```bash
# Create isolated worktree
git worktree add --detach /tmp/ivendorz-bundle-verify HEAD

cd /tmp/ivendorz-bundle-verify

# Fresh install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Build
pnpm run build
```

---

### 2. Chunk Manifest Inspection
- [ ] Verify chunk ownership in `.next/app-build-manifest.json`
- [ ] Check that `React.lazy` chunks are NOT marked eager
- [ ] Confirm SEO baseline (route: `/`) doesn't eagerly load dynamic UI

**Commands:**
```bash
# After build completes
cat .next/app-build-manifest.json | jq .

# Search for your route
cat .next/app-build-manifest.json | jq '.bundles | map(select(.route | contains("vendor-workspace")))'
```

**What to look for:**
```json
{
  "route": "/app/workspace/vendors/[slug]",
  "files": [
    ".next/static/chunks/app/workspace/vendors/layout.js",
    ".next/static/chunks/vendor-ui-heavy.js" // ← should NOT be on SEO routes
  ]
}
```

---

### 3. Barrel Re-export Audit
- [ ] Check `src/frontend/navigation/index.ts` (or your modified barrel)
- [ ] Verify SEO baseline (`app/layout.tsx`) doesn't import from barrels that re-export heavy code
- [ ] Look for "unnecessary re-export" patterns

**Example (BLOCKER pattern from memory):**
```typescript
// ❌ BAD: app/layout.tsx (SEO baseline, eager on every page)
import { navigationModel } from '../frontend/navigation'
// ↑ imports from barrel that also exports 50KB MegaMenu

// ✅ FIX: import specific module
import { navigationModel } from '../frontend/navigation/model'
```

**Check:**
```bash
git diff HEAD~1 src/frontend/**/index.ts
# Look for new exports that shouldn't be there
# Verify they're not imported by SEO routes
```

---

### 4. Code-Split Verification

If your change involved `React.lazy`:

- [ ] Verify lazy component is in its own chunk (not inline)
- [ ] Confirm chunk filename contains component name (e.g., `quotation-builder.js`)
- [ ] Check bundle size didn't explode (compare before/after)

**Commands:**
```bash
# Analyze bundle
pnpm run build -- --analyze

# Or manually:
ls -lah .next/static/chunks/*.js | sort -k5 -rn | head -20
```

**Expected:**
```
quotation-builder.js     145KB ← reasonable for a form
product-details.js       82KB
vendor-profile-lazy.js   56KB
```

**Concerning:**
```
app-layout.js           2.1MB ← all UI bundled together
```

---

### 5. Dev + Prod Parity
- [ ] Run `next start` after build (production server)
- [ ] Manually test affected routes (click, load, interact)
- [ ] Confirm lazy chunks load correctly (check Network tab in DevTools)
- [ ] No JavaScript errors in console

**Commands:**
```bash
pnpm run build
pnpm run start

# In another terminal:
open http://localhost:3000/app/workspace/vendor
# DevTools → Network → filter for .js files
# Should see lazy chunks load on-demand (not eagerly)
```

**Network tab expectations:**
```
Initial load: [ layout, app-shell, product-list ]
Click "View Quotation": [ lazy-quotation-builder ]
```

---

### 6. Route-Specific Chunk Ownership
- [ ] Verify each route loads ONLY its own chunks
- [ ] SEO baseline (/) doesn't include workspace code
- [ ] Public routes don't include admin code

**Command:**
```bash
# Check which chunks load on each route
pnpm run build

# View route → chunks mapping
cat .next/app-build-manifest.json | jq '.bundles[] | {route, files}'
```

---

### 7. Size Regression Check
- [ ] Compare total bundle size before/after
- [ ] Main bundle growth ≤ 10% (unless feature justifies it)
- [ ] Report bundle delta

**Commands:**
```bash
# Build output shows bundle size
pnpm run build 2>&1 | grep -E 'Route|First Load|Size'

# Example output:
# ○ (Static)  GET        / 45.2 kB
# ◆ (SSR)     GET        /app/dashboard 78.3 kB
# ◆ (SSR)     GET        /workspace [slug] 92.1 kB
```

---

### 8. Prettier + TypeScript Clean
- [ ] After build, run `pnpm prettier` + `pnpm type-check`
- [ ] No regressions from worktree isolation

---

## If Verification Fails

**Build error?**
```bash
pnpm run build 2>&1 | tail -50
# Check error message, fix in main tree, recommit, re-verify
```

**Chunk too large?**
```bash
# Audit chunk contents
pnpm run build -- --analyze
# Find culprit, consider code-splitting deeper
```

**Lazy component not loading?**
```bash
# DevTools → Network → look for 404 on chunk
# Verify chunk filename matches import statement
# Check route ownership in app-build-manifest.json
```

**Barrel re-export leak?**
- Remove unnecessary export from barrel
- Audit importer: replace `from './index'` with specific module path
- Re-verify build

---

## Cleanup

After verification passes:

```bash
# Remove worktree
cd ~
git worktree remove /tmp/ivendorz-bundle-verify
```

---

## Reference

- **Memory:** `Review-B: isolated production build, never defer` (RV-0126 lesson)
- **Memory:** `Review-A kit-primitive duplication check` (barrel re-export gotcha)
- **Turbopack docs:** https://turbo.build/pack/docs/bundling
- **.next/app-build-manifest.json:** official chunk ownership source (never use string fingerprinting)
