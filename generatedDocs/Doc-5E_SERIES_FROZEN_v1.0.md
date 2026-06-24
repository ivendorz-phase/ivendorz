# Doc-5E_SERIES_FROZEN_v1.0

| Field | Value |
|---|---|
| Document | `Doc-5E_SERIES_FROZEN_v1.0` |
| Status | **FROZEN** (with one applied additive Doc-3 §12.2 registration — `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ`, APPROVED; the `[ESC-RFQ-POLICY]` gate cleared) |
| Freeze Date | 2026-06-24 |
| Freeze Authority | `governanceReviews/Doc-5E_Freeze_Readiness_Audit_v1.0.md` — READY TO FREEZE (BLOCKER=0 · MAJOR=0 · MINOR=0; the sole freeze gate resolved by Patch v1.1) |
| Module | Module 3 — RFQ Procurement Engine (`rfq` schema) — **the procurement moat** |
| Realizes | `Doc-4E` (M3 contracts, FROZEN — 38 contracts: 30 caller-facing + 8 System engine workers) on the bound HTTP transport |
| Nature | **Document-level frozen designation.** Governance closure for Doc-5E — M3 API Realization. This manifest **designates and assembles**; it authors nothing, defines nothing, resolves nothing. Effective content = the registered passes + resolved registers, read in order under the cleaning rules below. |
| Corpus Authority | Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 · Doc-3 v1.0.2 (+ Policy-Key Patches v1.0/v1.1) → Doc-4A–4M (FROZEN) → **Doc-5A (FROZEN)** · Doc-5B (FROZEN) · Doc-5C (FROZEN) → **Doc-5E** → Doc-5D…5M → Code |
| Conflict Rule | FLAG-AND-HALT |

---

## Program Certification

```
BLOCKER = 0   MAJOR = 0   MINOR = 0   NITPICK = 0 (review records carry methodology notes)
```

**Audit Status: READY TO FREEZE — one applied additive Doc-3 §12.2 registration (Patch v1.1), no open dependency**

**Governance Status: DOC-5E FROZEN**

Doc-5E is the **fourth per-module realization** of the Doc-5 family and the realization of **the platform moat**: it binds the frozen Doc-4E RFQ Procurement Engine contracts to concrete HTTP endpoints under the `rfq` namespace, realizes the cross-cutting authorization/context/**non-disclosure** wire model (§3), and applies the out-of-wire boundary (R1) to **the entire matching/routing/selection/comparison engine** (§8). It realizes the dual-User (buyer + vendor) + Admin caller surface and fences the 8 System engine workers, the internal-service read legs, the DE-1…DE-8 integrations, and the emitted outbox events as out-of-wire. It passes the Doc-5A **Appendix A** conformance checklist in full, with dedicated attestations for the **R5 non-disclosure** invariant and the **engine-execution moat** invariant.

---

## Frozen Document Register (effective content = these, in order)

| Section(s) | Source pass (base) | Applied resolutions |
|---|---|---|
| Canonical structure / TOC | `Doc-5E_Structure_v1.0_FROZEN.md` | R1–R7 ratified at structure freeze (Hard Review v0.1 → v0.2; history in `Doc-5E_Structure_Proposal_v0.1.md`) |
| §0 Document Control · §1 Scope & M3 Surface Partition · §2 Realized Endpoint Inventory (30) · §3 Cross-Cutting Authz/Context/Non-Disclosure Wire Model | `Doc-5E_Content_v1.0_Pass1.md` | PATCH-01 dual-path leg rule (§2.1); PATCH-02 nested/source addressing finalized (§2.5); §3.6 R5 first-class; no caller `202` (§2.1) |
| §4 RFQ Authoring & Lifecycle · §5 Quotation & Invitation-Response · §6 Buyer Evaluation, Comparison & Closure · §7 Routing Governance & Engine/Routing Reads | `Doc-5E_Content_v1.0_Pass2.md` | §7.2 `manage_routing_rule` per-variant + freeze fence (MAJOR-01); §4.6 `reissue_rfq` source-unchanged (MIN-01); §5.3 Billing-owns-ledger (MIN-02); §7.3 matching observational-only (MIN-03); r2: concurrency token, §0.4 bases, first-open transition |
| §8 Out-of-Wire Boundary · §9 Conformance & Carried Items · Appendix A Conformance Attestation | `Doc-5E_Content_v1.0_Pass3.md` | §8.2 dual-path traceability; §8.5 protocol exclusion (REST/SSE/WS/webhook/GraphQL) + flag-and-halt; CHK-5A-121 objective gate → **cleared** by Patch v1.1; dedicated R5 + engine-execution attestations |

Governing authority for all sections: `Doc-5_Program_Governance_Note_v1.0`; conformance gate: `Doc-5A Appendix A`.

---

## Assembly & Cleaning Rules (for any future consolidated monolith or reader)

1. **Order** = the register above (structure, then §0→§9, then Appendix A).
2. **Apply resolutions** in place at their named section; the resolved wording supersedes the original pass text.
3. **Strip** per-pass scaffolding on assembly: pass header tables, "pending/applied Independent Hard Review" status lines, and board self-review notes.
4. **Anchors verbatim** — every `Doc-5A §X` / `Doc-4E §X` / `Doc-4M` / `Doc-2` / `Doc-3` / `Doc-4A` pointer is preserved exactly; reference-never-restate holds.
5. **No content change on assembly** — assembly is mechanical; any substantive change requires a new Doc-5E amendment (`Doc-5_Program_Governance_Note_v1.0 §5`).

---

## Ratified Structural Decisions (carried from structure freeze)

| ID | Decision |
|---|---|
| **R1** | Out-of-wire boundary — the entire matching/routing/selection/comparison engine (8 System workers), internal-service read legs, DE-1…DE-8 integrations, and emitted outbox events have no caller wire (§8). No caller `202`; engine observed via reads. |
| **R2** | Dual User actor (Buyer + Vendor, server-validated `Iv-Active-Organization`) + Admin (no org context) + System (out-of-wire); vendor representative action via §6B delegation server-side. |
| **R3** | `rfq` route prefix (Doc-5A Appendix B.1; Doc-2 §0.3). |
| **R4** | No token invented — existing Doc-2 §7 slugs / Doc-3 §12.2 keys; carried gaps escalated. |
| **R5** | Non-disclosure first-class wire invariant — blacklist/deferral/gate-fail indistinguishable from non-match; no public RFQ board; banded loss feedback. |
| **R6** | No auto-decision — comparison statement read-only; award explicit (`award_rfq`); no auto-winner/recommendation endpoint. |
| **R7** | Firewall + three-instrument quota — no plan/payment/entitlement value a matching input; Billing owns the quota ledger (DE-7). |

## Realization Conventions (§0.4 transport disambiguations — within Doc-5E authority)

- **`reissue_rfq` (§4.6):** named command on the source RFQ producing a new aggregate (`POST …/{id}/reissue_rfq` `201`); source unchanged.
- **`manage_routing_rule` (§7.2):** per-variant — `create` → `POST /rfq/routing_rules` `201`; `update`/`set_status` → `POST …/{id}/manage_routing_rule` `200`. Single Doc-4E contract preserved (freeze fence); count 38.
- **Nested / singleton paths (§2.5):** `get_rfq_version`, `list_quotations_for_rfq`, `get_comparison_statement` (singleton), `list_invitations` — §5.3 silent on nested child reads/singletons; conventions contradict nothing upstream.

## Open Carried Items (non-gate) & Applied Patch

| ID | Item | Status |
|---|---|---|
| **DE-1…DE-8** | Cross-module integrations (Identity/Marketplace/Trust/Operations/Admin/Communication/Billing/Core) | OPEN — out-of-wire (§8); consumed in-process / via outbox |
| `[ESC-RFQ-AUDIT]` | Audit actions not separately enumerated in Doc-2 §9 | OPEN — bound to nearest §9 action; never invented |
| `[ESC-RFQ-SLUG]` | Human-assist / routing-rule admin slugs | OPEN — interim `staff_*`; least-privilege slug = future Doc-2 §7 patch |
| **`[ESC-RFQ-POLICY]`** | `rfq.*` API-realization POLICY keys (idempotency dedup-window · list page-size) | **RESOLVED** — registered in Doc-3 §12.2 via approved `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ` (the freeze gate; Doc-4A §18.2 satisfied) |

**Applied corpus patch (ratification dependency, satisfied):** `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ` — additive §12.2 registration of `rfq.idempotency_dedup_window` + `rfq.list_page_size_max`; Status APPROVED (human owner, 2026-06-24). Additive only; no Doc-3 semantic/routing/trust/procurement/ownership change; R7 firewall preserved. Review evidence: `governanceReviews/Doc-5E_Freeze_Readiness_Audit_v1.0.md`.

---

## Downstream Effect

Doc-5E is the binding API-realization layer for **Module 3 — the procurement moat**. It establishes the engine-out-of-wire precedent (the most consequential R1 application to date) and the R5/R6/R7 wire invariants for any module that observes or feeds the matching/routing engine. Each remaining Doc-5x (Doc-5D Marketplace, Doc-5F…5M) is gated at freeze by the Doc-5A Appendix A checklist. Doc-6 (DB) / Doc-7 (Frontend) / Doc-8 (Tests) planning may proceed in parallel.

---

*Doc-5E program freeze designation. Non-authoring. On any conflict, the registered frozen sources, Doc-5A (FROZEN), and `Doc-5_Program_Governance_Note_v1.0` win; flag-and-halt.*
