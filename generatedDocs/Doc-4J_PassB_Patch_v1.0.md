# Doc-4J_PassB_Patch_v1.0 — Corrective Pass-B Patch (Module 8 — Admin Operations)

| Field | Value |
|---|---|
| Document | Doc-4J_PassB_Patch_v1.0 — corrective patch for `Doc-4J_PassB_Content_v1.0` |
| Nature | **Pass-B patch only.** Applies the accepted finding **F4J-PB1-M1 (MINOR)**. Minimal, stage-validation wording correction only. Not a redesign. |
| Applies to | `Doc-4J_PassB_Content_v1.0` |
| Finding source | `Doc-4J_PassB_Independent_Hard_Review_v1.0` (PASS WITH PATCH; Open BLOCKER = 0 · MAJOR = 0 · MINOR = 1 · NITPICK = 0) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs; on conflict **FLAG-AND-HALT** |
| Scope | BC-ADM-3 Stage Validation table — `missing-vendor close → closed` row — **Allowed source and Forbidden source columns only**. No other field, contract, or section changed. |
| Preserved unchanged | BC inventory, aggregate inventory, ownership, authorization, dependencies, events, audit bindings, value objects, read models, index strategy, idempotency, concurrency, trust firewall, procurement moat, error model, all lifecycle definitions, all AI-agent precision sections, all other stage validation rows. |

---

## Executive Summary

Patched findings:

- **F4J-PB1-M1 (MINOR)** — the BC-ADM-3 Stage Validation table allowed "`triaged` (or `submitted`)" as the source state for `close → closed` on `missing_vendor_suggestions`. This permitted a direct `submitted → closed` transition that is not present in the frozen lifecycle `submitted → triaged → closed` (`Doc-4J_PassA_FROZEN_v1.0` §H.5). **Resolution:** Allowed source corrected to `triaged` only; `submitted` added to the Forbidden source column. One cell pair corrected; nothing else changed.

---

## Patch 1

**Finding:** F4J-PB1-M1 (MINOR) — BC-ADM-3 Stage Validation table: `missing-vendor close → closed` row introduces an unauthorized `submitted → closed` lifecycle shortcut.

### Change 1 — BC-ADM-3 Stage Validation table — `missing-vendor close → closed` row

**Original Text**

```
| missing-vendor close → `closed` | `triaged` (or `submitted`) | `closed` | 6 STATE; `expected_state` | `STATE`/`CONFLICT` |
```

**Replacement Text**

```
| missing-vendor close → `closed` | `triaged` | `submitted` / `closed` | 6 STATE; `expected_state` | `STATE`/`CONFLICT` |
```

**Rationale.** The frozen lifecycle for `missing_vendor_suggestions` is `submitted → triaged → closed` (`Doc-4J_PassA_FROZEN_v1.0` §H.5; `Doc-2 §3.9`). This is a two-step machine: `submitted → triaged` (via `triage_missing_vendor_suggestion.v1`) and `triaged → closed` (via `close_missing_vendor_suggestion.v1`). No corpus document authorizes a direct `submitted → closed` transition. The original "(or `submitted`)" entry in the Allowed source column created an undocumented and unauthorized lifecycle shortcut. Correcting Allowed source to `triaged` only and moving `submitted` into the Forbidden source column restores exact conformance with the frozen lifecycle. The Validation gate (`6 STATE; expected_state`) and Failure class (`STATE`/`CONFLICT`) are unchanged. Wording only — no lifecycle transition added, no contract changed, no state created.

---

## Regression Review

| Surface | Result |
|---|---|
| Structure | UNCHANGED — BC-ADM-1/2/3/4/5/6 BC placement, aggregate placement, ownership placement, and dependency placement all untouched. |
| Aggregates | UNCHANGED — Moderation Case · Ban Action · Suggestion (3 roots, one aggregate) · Import Job · Verification Task · Outreach Campaign; no aggregate added or removed. |
| Ownership | UNCHANGED — BC-ADM-3 owns the three Suggestion roots; Marketplace / Operations / Identity cross-module references unchanged. No ownership transfer. |
| Authorization | UNCHANGED — `staff_can_manage_categories` (category-suggestion decisions ONLY), `[ESC-ADM-SLUG]` (missing-vendor + link); no slug invented; no permission changed. |
| Dependencies | UNCHANGED — DR-ADM-MKT / DR-ADM-OPS / DR-ADM-1 / DR-ADM-PC for BC-ADM-3; `DR-ADM-COMM` absent. |
| Lifecycle definitions | UNCHANGED — the patch corrects the stage validation table to match the frozen lifecycle; no lifecycle transition is added or modified. The frozen `submitted → triaged → closed` machine is now correctly reflected. |
| Event governance | UNCHANGED — BC-ADM-3 produces No Event; `VendorBanned` remains sole Admin §8 event (BC-ADM-2). |
| Audit governance | UNCHANGED — BC-ADM-3 audit bindings (`category approve/delete` / `suggestion decisions` / `link confirm/dismiss`) untouched. |
| Trust Firewall | UNCHANGED — BC-ADM-5 firewall is outside patch scope and untouched. |
| Procurement Moat | UNCHANGED — no matching/routing/ranking/supplier-selection/award/eligibility surface introduced. |
| Error model | UNCHANGED — `STATE` / `CONFLICT` failure classes in the patched row are identical to the original; `STATE ≠ CONFLICT` preserved. |
| AI-agent precision | UNCHANGED — BC-ADM-3 AI-Agent Precision section is outside patch scope and untouched. |
| All other stage validation rows | UNCHANGED — only the `missing-vendor close → closed` row is modified; all other BC-ADM-3 rows and all BC-ADM-1/2/4/5/6 stage validation tables are untouched. |
| All other BC-ADM-3 surfaces | UNCHANGED — field registry, value objects, read models, idempotency, concurrency, data retention, index strategy, contract precision, and AI-agent precision for BC-ADM-3 are all untouched. |

---

## Patch Status

```text
F4J-PB1-M1 = RESOLVED
(missing-vendor close → closed; Allowed source = triaged only; Forbidden source = submitted / closed;
direct submitted → closed bypass removed; frozen lifecycle submitted → triaged → closed restored)
```

```text
Open BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 0   (post-patch, pending Patch Verification)
```

---

*End of Doc-4J_PassB_Patch_v1.0. Pass-B patch only — applies F4J-PB1-M1 (BC-ADM-3 Stage Validation table, `missing-vendor close → closed` row: Allowed source corrected from "`triaged` (or `submitted`)" to "`triaged`" only; Forbidden source corrected from "`closed`" to "`submitted` / `closed`"). One cell pair in one stage validation row. No redesign; BC inventory, aggregate inventory, ownership, authorization, dependencies, events, audit bindings, value objects, read models, index strategy, idempotency, concurrency, trust firewall, procurement moat, error model, and all lifecycle definitions preserved unchanged. Authorized next stage: Patch Verification → Pass-B Consolidation Review → Pass-B FROZEN → Freeze Audit.*
