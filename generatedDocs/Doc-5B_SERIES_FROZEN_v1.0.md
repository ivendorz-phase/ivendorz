# Doc-5B_SERIES_FROZEN_v1.0

| Field | Value |
|---|---|
| Document | `Doc-5B_SERIES_FROZEN_v1.0` |
| Status | **FROZEN** (unconditional — no architecture-touching patch; no ratification dependency) |
| Freeze Date | 2026-06-24 |
| Freeze Authority | `governanceReviews/Doc-5B_Freeze_Readiness_Audit_v1.0.md` — READY TO FREEZE (BLOCKER=0 · MAJOR=0 · MINOR=0) |
| Module | Module 0 — Platform Core / Shared Kernel (`core` schema) |
| Realizes | `Doc-4B` (M0 contracts, FROZEN) on the bound HTTP transport |
| Nature | **Document-level frozen designation.** Governance closure for Doc-5B — M0 API Realization. This manifest **designates and assembles**; it authors nothing, defines nothing, resolves nothing. Effective content is the registered passes + resolved finding registers, read in order under the cleaning rules below. |
| Corpus Authority | Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A–4M (FROZEN) → **Doc-5A (FROZEN)** → **Doc-5B** → Doc-5C…5M → Code |
| Conflict Rule | FLAG-AND-HALT |

---

## Program Certification

```
BLOCKER = 0   MAJOR = 0   MINOR = 0   NITPICK = 2 (NP-02/NP-03 — consolidation-pass editorial, non-gate)
```

**Audit Status: READY TO FREEZE — no ratification dependency**

**Governance Status: DOC-5B FROZEN**

Doc-5B is the **first per-module realization** of the Doc-5 family: it binds the frozen Doc-4B Platform-Core contracts to concrete HTTP endpoints under the `core` namespace, and is the **precedent** for the out-of-wire boundary (R1) every later Doc-5x module reuses. It passes the Doc-5A **Appendix A** conformance checklist (`CHK-5A-xxx`) in full.

---

## Frozen Document Register (effective content = these, in order)

| Section(s) | Source pass (base) | Applied resolutions |
|---|---|---|
| Canonical structure / TOC | `Doc-5B_Structure_v1.0_FROZEN.md` | — (R1–R4 ratified at structure freeze) |
| §0 Document Control, Precedence & Conformance · §1 Scope, Audience & M0 Surface Partition · §2 Realized Endpoint Inventory | `Doc-5B_Content_v1.0_Pass1.md` | §1.1 delegation-N/A bound to `Doc-4B §B1`; user-locked inventory (five endpoints; Contract-ID command tokens verbatim) |
| §3 Audit Read Surface Realization | `Doc-5B_Content_v1.0_Pass2.md` | per-capability split (`audit_record_query.v1` paginated/sorted; `audit_correlation_lookup.v1` non-paginated) |
| §4 Audit Redaction Realization | `Doc-5B_Content_v1.0_Pass3.md` | m-01 (§4.2 FP-03 idempotency: audit-record leg only, outbox-leg N/A); M-02 (envelope+pointer, no field restatement); m-03 (re-redaction bound via §B5) |
| §5 System Configuration & Feature-Flag Surface Realization | `Doc-5B_Content_v1.0_Pass3.md` | **B-01** addressing → UUIDv7 path (`Doc-5A §5.3`, board OPTION A); **M-03** §B9 V8 → non-wire invariant (no `BUSINESS` wire row); M-01 (D-4 RESOLVED); m-02 (full POLICY-key names); m-04 (factual D-2 carry) |
| §6 Out-of-Wire Boundary (G3 · G4 · G7 · G5/G6 internal reads) | `Doc-5B_Content_v1.0_Pass4.md` | NP-01 (§6.3 Binds + Doc-2 §0.1 / Doc-4A App B); flag-and-halt clause (§6.6) |
| §7 Conformance & Carried Items | `Doc-5B_Content_v1.0_Pass4.md` | M-02 (§7.1 pointer-only severity); D-2 carried (non-gate) |
| Appendix A — Doc-5B Conformance Attestation | `Doc-5B_Content_v1.0_Pass4.md` | m-01 (CHK-5A-044 `retryable` body signal); m-02 (closing defers to this audit) |

Governing authority for all sections: `Doc-5_Program_Governance_Note_v1.0`; conformance gate: `Doc-5A Appendix A`.

---

## Assembly & Cleaning Rules (for any future consolidated monolith or reader)

1. **Order** = the register above (structure, then §0→§7, then Appendix A).
2. **Apply resolutions** in place at their named section; the resolved wording supersedes the original pass text.
3. **Strip** per-pass scaffolding on assembly: pass header tables, "pending Independent Hard Review" status lines, board self-review notes, and "(later pass)" qualifiers (all referenced sections now exist).
4. **Anchors verbatim** — every `Doc-5A §X` / `Doc-4B §X` / `Doc-2` / `Doc-3` / `Doc-4A` pointer is preserved exactly; reference-never-restate holds.
5. **No content change on assembly** — assembly is mechanical; any substantive change requires a new Doc-5B amendment (`Doc-5_Program_Governance_Note_v1.0 §5`).

---

## Ratified Structural Decisions (carried from structure freeze)

| ID | Decision |
|---|---|
| **R1** | Out-of-wire boundary (precedent) — Doc-5B realizes only the caller-facing HTTP surface; G3/G4/G7 + G5/G6 internal reads have no wire (§6). |
| **R2** | Admin-only actor surface — no tenant-user op, no active-organization context, no delegation. |
| **R3** | `core` route prefix (Doc-5A Appendix B.1). |
| **R4** | No token invented — binds existing `staff_super_admin` / `staff_can_redact_audit`; D-2 least-privilege slug deferred. |

---

## Finding-Register Disposition (closed)

| Source | Result |
|---|---|
| Pass-3 register (B-01, M-01, M-02, M-03, m-01…m-04, NP-01/02) | All resolved; **B-01 + M-03 board-ruled (OPTION A, 2026-06-24)**; escalation `governanceReviews/Doc-5B_Pass3_Escalation_B01_M03.md` CLOSED |
| Pass-4 register (M-01, M-02, m-01, m-02, NP-01/02/03) | M-01 **rejected (stale review)**; M-02/m-01/m-02/NP-01 resolved; NP-02/NP-03 deferred (NITPICK, non-gate) |

---

## Open Carried Item (non-gate)

| ID (Doc-4B) | Item | Status |
|---|---|---|
| **D-2** | No least-privilege `staff_*` slug for config / flag / audit-read | **OPEN** — tracked Doc-2 §7 additive future enhancement (`Doc-4B_Freeze_Patch_v1.0.1 §2`, CARRY FORWARD); binds `staff_super_admin` meanwhile; **not a freeze gate** |

No corpus patch, no architecture amendment, no ratification dependency. Review evidence: `governanceReviews/Doc-5B_Freeze_Readiness_Audit_v1.0.md`.

---

## Downstream Effect

Doc-5B is the binding API-realization layer for **Module 0** and the **out-of-wire boundary precedent** for every later module. **Doc-5C** (Identity & Organization, Module 1) structure authoring is authorized next; recommended order Doc-5B(M0) → 5C(M1) → 5E(M3). Each Doc-5x is gated at freeze by the Doc-5A Appendix A checklist (`CHK-5A-xxx`). Doc-6 (DB) / Doc-7 (Frontend) / Doc-8 (Tests) planning may proceed in parallel.

---

*Doc-5B program freeze designation. Non-authoring. On any conflict, the registered frozen sources, Doc-5A (FROZEN), and `Doc-5_Program_Governance_Note_v1.0` win; flag-and-halt.*
