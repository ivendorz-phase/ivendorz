# Doc-7B — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7B_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · conformance to frozen `Doc-7A` |
| Verdict | **NOT YET FREEZE-READY** — 1 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Structure Patch → short closure check → Structure Freeze Audit |

---

## Anchors verified CORRECT

- Doc-7B presentation-only posture (owns no content/state, no contract fetch) — conforms to `Doc-7A R5/R12`. CORRECT.
- DR5 contract-owner attributions: trust badge → M5 `Doc-5G`, billing indicator → M7 `Doc-5I`, AI panel → M9 `Doc-5K`, thread → M6 `Doc-5H` — match the frozen `Doc-7A` allocation table contract owners. CORRECT.
- DR7 currency: `{amount, currency}` per field, default BDT, never assumed (`Doc-2 §0.4`). CORRECT.
- DR11 applicable-subset framing matches `Doc-7A` Appendix A applicability preamble. CORRECT in shape.

0 BLOCKER. One conformance contradiction against the frozen allocation table + three refinements + one naming nit.

---

## Findings

### MAJOR-1 — Notification center mis-assigned to Doc-7B; the frozen Doc-7A allocation table assigns its defining document to Doc-7C
The header and **DR5** claim Doc-7B defines "notification-**center** & thread presentation." But the frozen `Doc-7A_Structure_v1.0_FROZEN` allocation table (Structure Patch C-1) sets the **global notification center's defining document = Doc-7C (App Shell)** (it is the cross-cutting shell slot), while only the **RFQ/quotation conversation thread** is defined as "Doc-7B (presentation) + Doc-7C shell slot." Assigning the notification center to Doc-7B **contradicts the frozen single-owner allocation** (`CHK-7-005`) and would create a two-owner conflict with Doc-7C.
**Required fix:** correct the header + DR5 + §5: Doc-7B defines the **trust badge, billing/entitlement indicator, AI advisory panel, and the conversation-thread *presentation*** (consumed via the Doc-7C shell slot). The **notification center is defined in Doc-7C**; Doc-7B may supply its presentational primitives (toast, list item), but the **defining document is Doc-7C**. Re-state the catalog to match the frozen allocation table exactly.

### MINOR-1 — Status → presentation mapping location unstated (DR3/§3)
DR3 rightly says "no token encodes a domain value," but a status chip (e.g. an RFQ/quotation/verification state badge) must map a **contract-reported state value → a presentation variant**. The proposal doesn't say where that mapping lives. It must be explicit that the mapping is a **kit-component presentation concern driven by the contract-reported state** (`Doc-7A §6/§7`) — never a token semantic and never a surface re-decision of domain meaning.
**Required fix:** DR3/§3 state that status→presentation-variant mapping is a presentation-component concern keyed on the contract-reported value; the kit invents no status and re-orders/re-labels nothing (consistent with `Doc-7A §7.1` — no state/label coined).

### MINOR-2 — DR11 marks `CHK-7-004` N/A while DR9 builds error-presentation primitives
DR11 lists `CHK-7-004` (error taxonomy) as N/A, but DR9 defines an **error-state primitive** rendering from `error.error_class`/`message`. The *binding* (branch on class, class→status, reference_id) is indeed the surface's job (N/A here is defensible), but the **error-presentation primitive carries a real obligation**: render **no protected enrichment** (`Doc-7A §5.4`) and the **not-found-≡-absence** rule (`Doc-7A §8.2`).
**Required fix:** DR11 keep `CHK-7-004` N/A for the binding, but **note the seam** — the error/not-found presentation primitive's non-disclosure obligation is covered by `CHK-7-041` + the `Doc-7A §5.4` no-protected-enrichment rule (which **do** apply to Doc-7B). Make the coverage explicit so the primitive isn't unchecked.

### MINOR-3 — DR3 theming omits the microsite (vendor-branded presentation) case
`Doc-7A §6.2` establishes the microsite case (M2 content rendered by Public 7D + managed by Vendor 7G, two surfaces one owner). Vendor microsites carry **branded presentation**. DR3 theming doesn't address per-microsite theme overriding.
**Required fix:** DR3 add that the token/theme layer supports **microsite-level theme overriding** (vendor-branded presentation skinning) while kit primitives stay consistent — theming is **presentation only and owns no M2 content** (`Doc-7A §6.2`). This is the realization vehicle for the microsite presentation/content split.

### NITPICK-1 — R-set prefix `DR1…DR12` collides with the carried-dependency prefix `DR-7-*`
The R-set uses `DR1…DR12` while carried dependencies use `DR-7-SHELL`/`DR-7-API`. Two different "DR" meanings invite confusion.
**Required fix:** rename the R-set to a non-colliding prefix (e.g. **`BR1…BR12`** — "Doc-7B realization decisions"), leaving `DR-7-*` for carried dependencies.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MAJOR-1 notification center mis-assigned (vs frozen allocation table) | MAJOR | Structure Patch — reassign to Doc-7C; correct catalog |
| MINOR-1 status→presentation mapping location | MINOR | Structure Patch — state in DR3/§3 |
| MINOR-2 CHK-7-004 N/A vs error primitive | MINOR | Structure Patch — note coverage seam |
| MINOR-3 microsite theming omitted | MINOR | Structure Patch — add to DR3 |
| NITPICK-1 DR-prefix collision | NIT | Structure Patch — rename to BR |

**Gate:** freeze only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 1 MAJOR + 3 MINOR open → **Structure Patch required**, then short closure check, then Structure Freeze Audit.

*End of Doc-7B Structure Independent Hard Review. Nothing coined; no frozen document edited. The MAJOR is a conformance contradiction against the frozen Doc-7A allocation table, not a style note.*
