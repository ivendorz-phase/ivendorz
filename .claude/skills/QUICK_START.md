# Skills Quick Start Guide

Fast reference for common tasks.

---

## 🟢 I Just Wrote Frontend Code

```bash
# 1. Run pre-commit checks
/fe-checklist

# 2. If prettier/tsc/lint failed, fix:
pnpm prettier --write .
pnpm type-check
pnpm lint

# 3. Check design conformance
/ivendorz-fe-design

# 4. Test end-to-end
/ivendorz-verify-fe

# 5. If code-split/lazy changes, verify bundle
/fe-verify-bundle

# 6. Commit when all pass
git commit -m "..."
```

---

## 🟢 I Just Wrote Backend/Data Code

```bash
# 1. Security check
/ivendorz-security

# 2. If org context issues, review CLAUDE.md §5 (Users Act, Organizations Own)

# 3. Commit
git commit -m "..."
```

---

## 🟢 I'm Designing a New Page

```bash
# 1. Pick a pattern
/fe-design-apply

# Examples:
# - Vendor RFQ Inbox? → Tabs pattern
# - Marketplace vendor list? → Card grid pattern
# - Buyer settings? → Sidebar + content pattern

# 2. Implement using frozen kit
# Import from src/frontend/ (not custom components)
# Use tokens (--iv-navy-*, --iv-indigo-*, --iv-amber-*)
# Use Tailwind scale (text-sm, text-lg, not text-[14px])

# 3. Review design against frozen
/ivendorz-fe-design

# 4. Test end-to-end
/ivendorz-verify-fe

# 5. Submit for Review-A
# (Reviewer runs /review-a-lens)
```

---

## 🟢 I Need a Code Review

```bash
# 1. Architecture & Governance lens (Review-A)
/review-a-lens

# 2. General code quality (Review-B, optional)
/code-review --high

# 3. Security scan (optional)
/security-review
```

---

## 🟢 I'm Creating a Chart/Dashboard

```bash
# 1. Data visualization framework
/dataviz

# 2. Pick chart type, colors, accessibility
# Reference frozen palette (see /ivendorz-fe-design)

# 3. Implement with real data

# 4. Verify
/ivendorz-verify-fe
```

---

## 🔴 I Found a Problem

### Issue: Prettier keeps drifting
```bash
/fe-checklist
→ Copy command: pnpm prettier --write .
→ Re-run /fe-checklist
```

### Issue: Kit duplication (raw `<input>` instead of kit)
```bash
/fe-checklist
→ Find raw element in git diff
→ Replace with kit primitive from src/frontend/
→ Verify type-check passes
→ Re-run /fe-checklist
```

### Issue: Org context not validated
```bash
/ivendorz-security
→ Read CLAUDE.md §5 (Invariant #5: Users Act, Organizations Own)
→ Add server-side org validation
→ Re-run /ivendorz-security
```

### Issue: Cross-schema SQL access
```bash
/review-a-lens
→ BLOCKER: cross-module DB access
→ Replace with service call
→ Re-run /review-a-lens
```

### Issue: Private field leaked in response
```bash
/ivendorz-security
→ BLOCKER: non-disclosure breach
→ Scrub private fields (use omit())
→ Re-run /ivendorz-security
```

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| `/fe-checklist` | 2–5 min |
| `/ivendorz-security` | 3–5 min |
| `/ivendorz-fe-design` | 5–10 min |
| `/fe-design-apply` | 10–15 min |
| `/ivendorz-verify-fe` | 15–25 min |
| `/fe-verify-bundle` | 10–15 min |
| `/review-a-lens` | 10–20 min |
| `/code-review` | 20–60 min |

---

## 📋 Typical Day (Dev Team)

Morning: Write feature code
```bash
/fe-checklist → fixes → /ivendorz-verify-fe → commit
```

Midday: Push to remote
```bash
# Reviewer runs (automatic or manual):
/review-a-lens → PASS or REVISION
```

Afternoon: Address feedback
```bash
/review-a-lens (updated code) → PASS → merge
```

---

## 📋 Typical Day (Review Team 4)

Get assigned a branch
```bash
/review-a-lens
→ PASS: hand to Team-5 (Review-B)
→ REVISION: comment + send back
→ BLOCKER: escalate to Board
```

---

## 🎯 One-Line Reminders

- **Before committing:** `/fe-checklist` (frontend) or `/ivendorz-security` (backend)
- **Before Review-A:** `/review-a-lens`
- **Before Review-B (code-split):** `/fe-verify-bundle`
- **When designing:** `/fe-design-apply` (patterns) → `/ivendorz-fe-design` (conformance)
- **When unsure:** `/ivendorz-verify-fe` (full end-to-end test)

---

## 🔗 Reference

- **Full skill docs:** `.claude/skills/SKILLS_INDEX.md`
- **Frozen architecture:** `generatedDocs/CORPUS_INDEX.md`
- **Implementation guide:** `IMPLEMENTATION_START_HERE.md`
- **Governance:** `CLAUDE.md`
- **Design system:** `src/frontend/`
