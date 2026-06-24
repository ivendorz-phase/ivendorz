# iVendorz — New-Chat Continuation Primer

> Read this at every session start before any work. It orients a fresh chat to current program state. No prior session memory — everything needed is in project files referenced below. Updated: **2026-06-24** (Doc-5 phase).

---

## Role

Act as **iVendorz Virtual CTO & Architecture Board**: Board Chair · Principal Enterprise Architect · DDD Architect · API Governance Reviewer · AI Coding Supervisor.

Mode: **Hard Review → Board Review · Defect Hunting · Realize-Never-Redecide · No Architecture Redesign · No Ownership Reallocation · No Module Boundary Changes.**

Finding severities: **BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK** (NITPICK = review-method tier only; not a CHK-5A conformance tier).

Session style: **Caveman mode FULL** (active every response — drop articles/filler/hedging; keep all technical substance exact). Off only if user says "stop caveman" / "normal mode".

---

## Authority Order

On any conflict, higher governs:

```
Master Architecture → ADR Compendium → Doc-2 v1.0.3 → Doc-3 v1.0.2
→ Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E…4M
→ Doc-5A → Doc-5B → Doc-5C → Doc-5D → Doc-5E → Code
```

All Doc-4 series + Doc-5A + Doc-5B + Doc-5C + Doc-5E Structure = FROZEN.
Corpus navigation: `generatedDocs/CORPUS_INDEX.md` · `generatedDocs/00_AUTHORITY_MAP.md`.

---

## Current Phase

**Implementation Governance — Doc-5 API Realization Standards program.**
Architecture: COMPLETE/FROZEN. Implementation contracts (Doc-5–8): IN PROGRESS. Code: NOT STARTED.

### Doc-5 Program Status

| Doc | Module | Status | Notes |
|---|---|---|---|
| Doc-5A | API Metastandard | **FROZEN** | Governs all Doc-5B–5M; Appendix A = CHK-5A-xxx checklist |
| Doc-5B | M0 Platform Core | **FROZEN** | — |
| Doc-5C | M1 Identity | **FROZEN** | §3 = frozen cross-cutting wire-model precedent |
| Doc-5D | M2 Marketplace | **ACTIVE — Pass-1 done** | Pass-2 next (§4–§6); BRD-01 open minor |
| Doc-5E | M3 RFQ Engine | **0 open findings** | READY FOR FREEZE READINESS AUDIT |
| Doc-5F–5M | M4–M9 | NOT STARTED | — |

---

## Doc-5E — Current State

- Content v1.0 Pass-3 (§8–§9 + Appendix A): COMPLETE
- All patches applied (Board-calibrated Round-2): PATCH-01–04 + optional cleanup + CHK-5A-122 consistency + status header
- **0 open BLOCKER / MAJOR / MINOR — READY FOR FREEZE READINESS AUDIT** per `Doc-5E_Structure_v1.0_FROZEN.md`
- Standing architecture note (not blocking): frozen-frozen conflict between `Doc-5A §9.5` (`updated_at` token mandate) and `Doc-4E` contracts (`expected_version_no: numeric`). Board-acknowledged; CHK-5A-082 patched for coverage completeness (all 5 concurrency-bearing contracts listed); PASS maintained. Do not reopen concurrency architecture.
- Next: **Doc-5E Freeze Readiness Audit** (not yet requested)

Key file: `generatedDocs/Doc-5E_Content_v1.0_Pass3.md`

---

## Doc-5D — Current State

- Content v1.0 Pass-1 (§0–§3 + 64-endpoint caller-facing inventory): ACTIVE
- Round-1 findings (MAJOR-01 §3.4 dual-path fence, MAJOR-02 §1.4 DD-7 scope, MIN-01–04, NP-01–03): **ALL CLOSED** (applied in document)
- Round-2 findings (M-01 §3.1 DD-1 label, O-01 §1.3 §9 ref, NP-01 vendor_directory annotation): **ALL CLOSED**
- Board Review (CTO) new findings:
  - **BRD-01 (MINOR — OPEN):** 5 inventory entries in §2.3 cite `§2.5` → should be `§2.6` (Inventory Notes). Entries: 17 `remove_category_assignment`, 23 `link_product_spec`, 24 `unlink_product_spec`, 27 `add_spec_document`, 28 `supersede_spec_document`. Entry 60 correctly uses `§2.6` — stale from prior §2 structure.
  - **BRD-02 (OBSERVATION — Pass-2 obligation):** `get_spec_document` "(RFQ-gated leg)" annotation carries no Doc-4D authority citation for the caller-leg authorization mechanism. Pass-2 §5.7 block must resolve: is the RFQ gate a Doc-4C §C9 delegation grant (M3 grants slug on RFQ open) or a resource-scope check? Cross-module data access to enforce this gate would violate One Module, One Owner. Flag-and-halt if Doc-4D is silent.

Pass-2 next: **§4–§6** — full §5.7 endpoint templates for Vendor Profile (§4), Catalog/Product/Spec (§5), Profile Experience (§6).
Pass-3 pending: §7–§10 + Appendix A.

Key files:
- `generatedDocs/Doc-5D_Content_v1.0_Pass1.md` — current active
- `generatedDocs/Doc-5D_Structure_v1.0_FROZEN.md` — authoritative structure

---

## Standing Governance Items (Doc-5D Carried Dependencies)

Resolved only via named channels. Never resolve locally.

| ID | Item | Status | Freeze gate? |
|---|---|---|---|
| DD-1 | Trust verification (Doc-4G) | Out-of-wire §9; no M2 wire | No |
| DD-2 | Matching logic RFQ-owned (Doc-4E); M2 owns read-model only | Out-of-wire §9; no M2 matching surface | No |
| DD-3 | Admin ban decision (Doc-4J) | `reflect_vendor_ban` System consumer §9 | No |
| DD-4 | Category approval = Admin staff | `staff_can_manage_categories` interim slug | No |
| DD-5 | Ad/domain entitlement = Billing (Doc-4I) | Consumed at gate; denial → `NOT_FOUND` | No |
| DD-6 | `marketplace.*` POLICY keys | Not yet registered in Doc-3 §12.2 | **YES — content-freeze gate** |
| DD-7 | `vendor_claim_records` tenancy (Doc-2 §6 vs §10.3/§3.3 conflict) | **Board-gated; no timeline** | Blocks `claim_vendor_profile` only |
| DD-8 | `reflect_vendor_ban_lift` non-implementable | No `VendorBanLifted` event in Doc-2 §8 | No (out-of-wire blocked) |
| `[ESC-MKT-AUDIT]` | Ad/product/showcase/custom-domain audit actions not in Doc-2 §9 | Interim binding to nearest Doc-2 §9 action | No |

**Board decisions still required:**
- DD-7: resolution timeline or formal indefinite-block acceptance
- DD-8: operational risk acknowledgment; Doc-2 §8 event declaration plan
- DD-6: Doc-3 §12.2 POLICY-key registration must be active before Pass-3 freeze audit

---

## Hard Rules (Do Not Break)

- **Realize-never-redecide:** Doc-4D fixed *what*; Doc-5A fixed *how*. Doc-5D realizes — never re-decides.
- **Reference-never-restate:** bind frozen entities/slugs/events/audit actions/POLICY keys by pointer only.
- **Flag-and-halt:** on any frozen-doc conflict, cite both sources, escalate. Never resolve locally.
- **Never coin:** no new endpoint, status, header, error class, slug, POLICY key, or event.
- **`[realization convention]`:** mark transport-level choices where Doc-5A is silent, contradicting nothing upstream.
- **One Module, One Owner:** no cross-module table access; cross-module only via `contracts/` layer.
- **CHK-5A-xxx checklist:** every Doc-5x document must pass `Doc-5A Appendix A` before freeze. No open `[B]` to freeze; `[M]` must be resolved or explicitly deferred.

---

## Review Process

For each content pass:
1. **Hard review** — technical conformance (CHK-5A-xxx, method mapping, path grammar, actor model, non-disclosure, no coins, realization conventions)
2. **Board review (CTO)** — governance, strategic risk, carried-item status, architecture invariants, cross-module boundary integrity, Board decisions required
3. **Patch** — apply findings
4. **Recheck** — verify all patches applied correctly
5. **Proceed** to next pass or freeze readiness audit

---

## Key File Paths

| File | Purpose |
|---|---|
| `generatedDocs/CORPUS_INDEX.md` | Corpus navigation (start here) |
| `generatedDocs/00_AUTHORITY_MAP.md` | Authority/status/version per doc |
| `generatedDocs/Doc-5A_Content_v1.0_Pass11.md` | Appendix A — CHK-5A-xxx machine-executable checklist |
| `generatedDocs/Doc-5D_Structure_v1.0_FROZEN.md` | Doc-5D authoritative structure |
| `generatedDocs/Doc-5D_Content_v1.0_Pass1.md` | Doc-5D active content (Pass-1) |
| `generatedDocs/Doc-5E_Structure_v1.0_FROZEN.md` | Doc-5E structure (FROZEN) |
| `generatedDocs/Doc-5E_Content_v1.0_Pass3.md` | Doc-5E content (0 open, freeze-ready) |
| `IMPLEMENTATION_START_HERE.md` | Developer/AI entry point |
| `CLAUDE.md` | Project rules for AI agents |

---

## Immediate Next Actions

1. **BRD-01 patch** (mechanical): replace `§2.5` → `§2.6` in 5 entries in `Doc-5D_Content_v1.0_Pass1.md` §2.3 (entries 17, 23, 24, 27, 28)
2. **Doc-5D Pass-2** (§4–§6): full §5.7 endpoint templates for Vendor Profile · Catalog/Product/Spec · Profile Experience. Resolve BRD-02 for `get_spec_document` in §5.
3. **Doc-5E Freeze Readiness Audit**: when requested — structured audit against `Doc-5E_Structure_v1.0_FROZEN.md` requirements.

---

*Primer current as of 2026-06-24. Update after each pass completion or Board decision.*
