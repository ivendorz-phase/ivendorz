# Review Log — Team-4 QCT

**Owner:** Team-4 (Quality & Conformance). **Reviews only** `🔵 Ready for Review` pages; **never
edits implementation** (Raise ≠ Accept — CLAUDE.md §13). Each review gets a sequential **`RV-####`**.

## Governance (per CLAUDE.md §13)

- **Severity ladder:** `BLOCKER` · `MAJOR` · `MINOR` · `NIT` · `OBS`.
- **Gate to Approve:** `BLOCKER = 0 · MAJOR = 0 · MINOR = 0`. NIT/OBS never block.
- **Raise ≠ Accept:** the reviewer raises findings with a severity; the **author/authority rules**
  on each via the Validate-Findings gate (Valid? Applicable? Best for product? Corpus-consistent?).
- Verdict is exactly `PASS` or `PATCH REQUIRED` (with numbered findings).

## Entry template

```
### RV-0001 · P-<ID> · <Page title> · Team-<n>
- Date: YYYY-MM-DD
- Verdict: PASS | PATCH REQUIRED
- Findings:
  1. [BLOCKER|MAJOR|MINOR|NIT|OBS] <one-line defect> — <file:line if applicable>
- Disposition (author/authority): <accepted/deferred/rejected + why>
- Result: page → ✅ Approved | 🟥 Patch Required
```

---

## Reviews

_None yet — first review opens when Team-4 receives the first `🔵 Ready for Review` page._
