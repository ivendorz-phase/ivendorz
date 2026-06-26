# Doc-7B — Content Pass-2 (§5–§9 + Appendix) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7B_Content_v1.0_Pass2.md` (§5–§9 + Appendix) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · conformance to frozen `Doc-7A`/`Doc-7B` structure |
| Verdict | **NOT YET PASS** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- **§9.1 applicability table** cross-checked against `Doc-7B_Structure_v1.0_FROZEN` **BR11** — APPLIES set (`005/020/021/040–042/050/051/060–063/070/071/080/081`) and N/A set (`001–004/010–012/030/031`) **match exactly**; no check mis-classified. CORRECT.
- **§5 embedded catalog** matches the frozen `Doc-7A` allocation table — trust badge (M5 `Doc-5G`), billing (M7 `Doc-5I`), AI panel (M9 `Doc-5K`), thread (M6 `Doc-5H` via Doc-7C slot); **notification center correctly excluded** (Doc-7C). Single-owner `CHK-7-005`. CORRECT.
- **§6** error-state no-protected-enrichment (`Doc-7A §5.4`) + not-found ≡ absence (`Doc-7A §8.2`); **§7.3** currency `{amount,currency}` default BDT (`Doc-2 §0.4`); **§5** billing as boolean/numeric/enum not name-string (Invariant #10). CORRECT.

0 BLOCKER, 0 MAJOR. Catalog and conformance are faithful. Three precision refinements + one nit.

---

## Findings

### MINOR-1 — no-protected-enrichment must span every error-rendering component, not just the error-state primitive
§6 binds the no-protected-enrichment rule (`Doc-7A §5.4`) to the **error-state** primitive, but the Appendix also lists **`form-field` (renders `field_errors`)** — `field_errors` is the VALIDATION-class payload (`Doc-5A §6.2`), an error-rendering surface that **equally** must not leak protected facts.
**Required fix:** §6/§9.1 state the no-protected-enrichment obligation (`Doc-7A §5.4`) applies to **every error-rendering component** — the error-state primitive **and** `form-field` rendering `field_errors` — so the `CHK-7-041`/§5.4 coverage spans both, not just the error-state primitive.

### MINOR-2 — §8.2 attributes image/font optimization to the kit; it is a framework/app-shell concern
§8.2 says "image/font optimization is realized at the kit/app boundary." Next.js image/font optimization is a **framework primitive** (`next/image`, `next/font`) owned at the App Shell / framework layer (Doc-7C / Next.js), which the kit **consumes** — not a Doc-7B-owned mechanism.
**Required fix:** §8.2 clarify the kit **uses** the framework's image/font optimization (`next/image`/`next/font`, owned by the App Shell/framework — Doc-7C), rather than owning it. Keep RSC-compatibility and suspense as kit properties.

### MINOR-3 — §5 AI advisory panel omits graceful handling of absent/stale/regenerating advisory
§5 states the AI panel is regenerable/TTL (`Doc-5K R7`) and non-disclosure-bound, but `Doc-7A §9.2` requires the surface to **degrade gracefully when the advisory is absent/stale/regenerating** (it is a disposable projection). The catalog entry does not state this.
**Required fix:** §5 AI panel entry add — the component **handles absent/stale/regenerating advisory gracefully** (renders nothing or a benign placeholder, never an error or a blocking state), consistent with its disposable-projection nature (`Doc-7A §9.2`/R12).

### NITPICK-1 — Appendix shadcn primitive list reads as a frozen exact set
The Appendix enumerates specific shadcn primitives; this is illustrative, but the phrasing could imply a frozen exact inventory.
**Required fix:** label the primitive list **illustrative of the shadcn set**; the final inventory is fixed with the implementation (Doc-7B fixes inventory **conventions**, not an exact frozen component list).

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 no-protected-enrichment spans form-field too | MINOR | Content Patch — broaden §6/§9.1 |
| MINOR-2 §8.2 image/font = framework, not kit | MINOR | Content Patch — re-attribute |
| MINOR-3 §5 AI panel graceful absence | MINOR | Content Patch — add degradation rule |
| NITPICK-1 Appendix primitive list illustrative | NIT | Content Patch — label |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 3 MINOR open → **Content Patch required**, then short closure check, then Content Freeze Audit → Doc-7B FROZEN.

*End of Content Pass-2 Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — catalog/conformance sound; three genuine precision defects (error-enrichment scope, image/font attribution, AI-panel degradation).*
