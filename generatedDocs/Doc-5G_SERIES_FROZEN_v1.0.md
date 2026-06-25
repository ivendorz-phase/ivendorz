# Doc-5G_SERIES_FROZEN_v1.0

| Field | Value |
|---|---|
| Document | `Doc-5G_SERIES_FROZEN_v1.0` |
| Status | **FROZEN** (with one applied additive Doc-3 §12.2 registration — `Doc-3_Policy_Key_Registration_Patch_v1.3_Trust`, APPROVED; the `[ESC-TRUST-POLICY]` content-freeze gate cleared) |
| Freeze Date | 2026-06-25 |
| Freeze Authority | `governanceReviews/Doc-5G_Freeze_Readiness_Audit_v1.0.md` — READY TO FREEZE (BLOCKER=0 · MAJOR=0 · MINOR=0; the sole content-freeze gate resolved by Patch v1.3) |
| Module | Module 5 — Trust & Verification (`trust` schema) — **the governance-signal owner; where the firewalls are realized** |
| Realizes | `Doc-4G` (M5 contracts, FROZEN — 40 contracts: 34 caller-facing + 6 out-of-wire) on the bound HTTP transport |
| Nature | **Document-level frozen designation.** Governance closure for Doc-5G — M5 API Realization. This manifest **designates and assembles**; it authors nothing, defines nothing, resolves nothing. Effective content = the registered passes + resolved registers, read in order under the cleaning rules below. |
| Corpus Authority | Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 · Doc-3 v1.0.2 (+ Policy-Key Patches v1.0/v1.1/v1.2/v1.3) → Doc-4A–4M (FROZEN) → **Doc-5A (FROZEN)** · Doc-5B · Doc-5C · Doc-5D · Doc-5E (FROZEN) → **Doc-5G** → Doc-5F · 5H…5M → Code |
| Conflict Rule | FLAG-AND-HALT |

---

## Program Certification

```
BLOCKER = 0   MAJOR = 0   MINOR = 0   NITPICK = 0 (review records carry methodology notes)
```

**Audit Status: READY TO FREEZE — one applied additive Doc-3 §12.2 registration (Patch v1.3), no open dependency**

**Governance Status: DOC-5G FROZEN**

Doc-5G is the per-module realization of **Module 5 — Trust & Verification, the governance-signal owner**: it binds the frozen Doc-4G contracts to concrete HTTP endpoints under the `trust` namespace, realizes the cross-cutting actor / **score-firewall** / non-disclosure wire model (§3), and applies the out-of-wire boundary (R1) to the **score-computation firewall** (`compute_*`), the sole-writer ingestion (`ingest_performance_input`), the performance-review trigger, the verification/tier expiry timers, the System-detected fraud leg, and the dual-audience internal legs (§8). It realizes the 34 caller-facing endpoints across verification/verified-tier, score governance, fraud triage, and reviews/admin-ratings. It passes the Doc-5A **Appendix A** conformance checklist in full, with dedicated attestations for the **score-computation firewall (R5)**, **no-score-value-caller-editable (NP-03)**, and **non-disclosure (R10)** invariants.

---

## Frozen Document Register (effective content = these, in order)

| Section(s) | Source pass (base) | Applied resolutions |
|---|---|---|
| Canonical structure / TOC | `Doc-5G_Structure_v1.0_FROZEN.md` | R1–R12 + DG-1…DG-8 ratified at structure freeze (Hard Review + ADD-1/ADD-2; SR-1 reconciled to 40; history in `Doc-5G_Structure_Proposal_v0.1.md`) |
| §0 Document Control · §1 Scope & M5 Surface Partition · §2 Realized Endpoint Inventory (34) · §3 Cross-Cutting Actor / Score-Firewall / Non-Disclosure Wire Model | `Doc-5G_Content_v1.0_Pass1.md` | M5G-01 realization-authority flag-and-halt rule; M5G-02 disclosure-scope binding (narrow-never-widen); `check_permission` sole authority; R5/R6/R10; dual-audience fence; AI rule (R12); per-section counts; active-org authority = M1 Identity; `reference_id` + `[ESC-TRUST-POLICY]` obligations |
| §4 Verification & Verified-Tier · §5 Trust & Performance Score | `Doc-5G_Content_v1.0_Pass2.md` | verification (`Doc-2 §5.6`) + verified-tier (`Doc-2 §3.6/§10.6`) machines; `expire_*` edges → §8 timers (R7/R8); R8 seam (Trust emits `VendorTierChanged[verified]`, Marketplace writes `financial_tier_history`); `reference_id` §4.4 nominated point; freeze/reactivate publication-only (R5); Not-Rated ≠ zero |
| §6 Fraud & Risk Signals · §7 Reviews & Admin Ratings · §8 Out-of-Wire Boundary · §9 Conformance & Carried Items · Appendix A Conformance Attestation | `Doc-5G_Content_v1.0_Pass3.md` | fraud `open→reviewed→actioned|dismissed` (staff-internal R10; AI R12; no ban DG-5); publish invokes §8 ingestion (R9); admin-rating internal-only; §8 protocol exclusion (REST/SSE/WS/webhook/GraphQL) + flag-and-halt; CHK-5A-121/071 → **cleared** by Patch v1.3; dedicated score-firewall + no-score-value + non-disclosure attestations |

Governing authority for all sections: `Doc-5_Program_Governance_Note_v1.0`; conformance gate: `Doc-5A Appendix A`.

---

## Assembly & Cleaning Rules (for any future consolidated monolith or reader)

1. **Order** = the register above (structure, then §0→§9, then Appendix A).
2. **Apply resolutions** in place at their named section; the resolved wording supersedes the original pass text.
3. **Strip** per-pass scaffolding on assembly: pass header tables, "Independent Hard Review applied" status lines, and review notes.
4. **Anchors verbatim** — every `Doc-5A §X` / `Doc-4G §X` / `Doc-2` / `Doc-4M` / `Doc-4A` / `Doc-4C §C3/§C8` pointer is preserved exactly; reference-never-restate holds; **no score value/formula/threshold/weight on any wire**.
5. **No content change on assembly** — assembly is mechanical; any substantive change requires a new Doc-5G amendment (`Doc-5_Program_Governance_Note_v1.0 §5`).

---

## Ratified Structural Decisions (carried from structure freeze)

| ID | Decision |
|---|---|
| **R1** | Out-of-wire boundary — 6 contracts (`compute_trust_score`, `compute_performance_score`, `ingest_performance_input`, `trigger_performance_review`, `expire_verification`, `expire_verified_tier`) + dual-audience internal legs + System-detected fraud leg + integrations + outbox events have no caller wire (§8). No caller `202`. |
| **R2** | Multi-actor — Public (anonymous badge/published-review reads), User (only `request_verification` + `submit_review`, server-validated `Iv-Active-Organization`), Admin (governance bulk, no org context); System out-of-wire. |
| **R3** | `trust` route prefix; `trust.` token (Doc-5A App B.1; Doc-2 §0.3). |
| **R4** | No token invented — Doc-2 §7 slugs / §9 audit / §8 events / Doc-3 §12.2 keys; carried gaps escalated. |
| **R5** | Score-computation firewall — `compute_*` System-only, out-of-wire, never hand-edited; no score value/formula/threshold/weight on any wire; `freeze_*`/`reactivate_*` publication-only; Not-Rated ≠ zero. |
| **R6** | Governance-signal + Billing firewall (DG-7 verbatim) — no commercial state influences Trust Score, Performance Score, Verification, or Verified Tier; no cross-signal write. |
| **R7** | Verification: Admin decides, Trust owns — `request → assign/decide/revoke`; `expire_verification` System timer (§8), not Admin. |
| **R8** | Verified-tier-without-ownership — Trust emits `VendorTierChanged[verified]`; Marketplace writes `financial_tier_history` (reciprocal of Doc-5D DD-1); `expire_verified_tier` System timer. |
| **R9** | Performance-input sole writer — `ingest_performance_input` only; `publish_review` invokes, never writes. |
| **R10** | Non-disclosure firewall — verification detail / fraud / admin ratings staff-internal only; `NOT_FOUND` collapse. |
| **R11** | Event surface via outbox, not webhook — `trust` events (Doc-2 §8, by pointer) → M0 outbox; consumed by M2/M3/M6. |
| **R12** | AI suggests, modules decide — AI-detected fraud signals observational only; administrative disposition authoritative. |

## Realization Conventions (§0.4 — frozen-sourced, within Doc-5G authority)

- **`remove_review` → `DELETE`** (soft-delete; Doc-4G §G8.3 §6 / Doc-2 §10.6 SD=YES).
- **`set_admin_rating` → `PATCH`** (subject-keyed upsert; Doc-4G §G8.4).
- **Score/tier reads subject-keyed by `vendor_profile_id`** (Doc-4G §G5.3/§G6.5/§G4.8); history/inputs nested.
- **`create_fraud_signal` dual-template** — Admin staff-reported caller leg (`POST` `201`); System-detected leg out-of-wire §8.

## Open Carried Items (non-gate) & Applied Patch

| ID | Item | Status |
|---|---|---|
| **DG-1…DG-4 · DG-6 · DG-8** | Identity / Marketplace / RFQ / Operations / Communication / Platform Core integrations | OPEN — out-of-wire (§8); consumed in-process / via outbox |
| **DG-5** Admin ban decision | OPEN — Trust issues no ban (ban = Doc-4J); fraud triage realized (§6) |
| **DG-7** Billing firewall | OPEN — DG-7 verbatim invariant (R6); no commercial state on any wire |
| **R8** verified-tier seam | OPEN — Trust emits, Marketplace writes `financial_tier_history` (reciprocal of Doc-5D DD-1) |
| `[ESC-TRUST-SLUG]` / `[ESC-TRUST-AUDIT]` | OPEN — nearest Doc-2 §7 / §9 by pointer; never invented |
| `[ESC-TRUST-POLICY]` (wire keys) | **RESOLVED** — `trust.idempotency_dedup_window` + `trust.list_page_size_max` registered in Doc-3 §12.2 via approved `Doc-3_Policy_Key_Registration_Patch_v1.3_Trust` (Doc-4A §18.2). Out-of-wire score/expiry keys tracked, non-wire-gate |
| `[REC-TRUST-COUNT]` (SR-1) | CLOSED — 40 reconciled (`decide_verification` frozen; `approve_verification` absent from frozen Doc-4G) |

**Applied corpus patch (ratification dependency, satisfied):** `Doc-3_Policy_Key_Registration_Patch_v1.3_Trust` — additive §12.2 registration of `trust.idempotency_dedup_window` + `trust.list_page_size_max`; Status APPROVED (human owner, 2026-06-25). Additive only; no Doc-3 semantic/scoring/trust/governance/ownership change; governance-signal + Billing firewall preserved. Review evidence: `governanceReviews/Doc-5G_Freeze_Readiness_Audit_v1.0.md`.

---

## Downstream Effect

Doc-5G is the binding API-realization layer for **Module 5 — Trust & Verification, the governance-signal owner**. It establishes the **score-computation firewall** (no score value/formula on any wire; compute_* out-of-wire — the highest-stakes R1/R5 application) and the **governance-signal/Billing firewall** (R6/DG-7) as wire invariants, plus the verified-tier seam (R8, reciprocal of Doc-5D DD-1) and staff-internal non-disclosure (R10). Each remaining Doc-5x (Doc-5F Operations, Doc-5H…5M) is gated at freeze by the Doc-5A Appendix A checklist. Doc-6 (DB) / Doc-7 (Frontend) / Doc-8 (Tests) planning may proceed in parallel.

---

*Doc-5G program freeze designation. Non-authoring. On any conflict, the registered frozen sources, Doc-5A (FROZEN), and `Doc-5_Program_Governance_Note_v1.0` win; flag-and-halt.*
