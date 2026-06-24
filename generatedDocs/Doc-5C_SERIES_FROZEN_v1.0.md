# Doc-5C_SERIES_FROZEN_v1.0

| Field | Value |
|---|---|
| Document | `Doc-5C_SERIES_FROZEN_v1.0` |
| Status | **FROZEN** (unconditional — no architecture-touching patch; no ratification dependency) |
| Freeze Date | 2026-06-24 |
| Freeze Authority | `governanceReviews/Doc-5C_Freeze_Readiness_Audit_v1.0.md` — READY TO FREEZE (BLOCKER=0 · MAJOR=0 · MINOR=0) |
| Module | Module 1 — Identity & Organization (`identity` schema) |
| Realizes | `Doc-4C` (M1 contracts, FROZEN — 42 contracts) on the bound HTTP transport |
| Nature | **Document-level frozen designation.** Governance closure for Doc-5C — M1 API Realization. This manifest **designates and assembles**; it authors nothing, defines nothing, resolves nothing. Effective content = the registered passes + resolved registers, read in order under the cleaning rules below. |
| Corpus Authority | Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A–4M (FROZEN) → **Doc-5A (FROZEN)** · Doc-5B (FROZEN) → **Doc-5C** → Doc-5D…5M → Code |
| Conflict Rule | FLAG-AND-HALT |

---

## Program Certification

```
BLOCKER = 0   MAJOR = 0   MINOR = 0   NITPICK = 0 (review records carry methodology notes)
```

**Audit Status: READY TO FREEZE — no ratification dependency**

**Governance Status: DOC-5C FROZEN**

Doc-5C is the **second per-module realization** of the Doc-5 family and the first with a **User-primary, active-organization-scoped** surface: it binds the frozen Doc-4C Identity & Organization contracts to concrete HTTP endpoints under the `identity` namespace, realizes the cross-cutting authorization/context wire model (§3), and reuses the Doc-5B out-of-wire boundary (R1) for the platform authorization root. It passes the Doc-5A **Appendix A** conformance checklist in full.

---

## Frozen Document Register (effective content = these, in order)

| Section(s) | Source pass (base) | Applied resolutions |
|---|---|---|
| Canonical structure / TOC | `Doc-5C_Structure_v1.0_FROZEN.md` | R1–R6 ratified at structure freeze (Hard Review v0.1 → v0.2; history in `Doc-5C_Structure_Proposal_v0.1.md`) |
| §0 Document Control · §1 Scope & M1 Surface Partition · §2 Realized Endpoint Inventory · §3 Cross-Cutting Authorization & Context Wire Model | `Doc-5C_Content_v1.0_Pass1.md` | §3.4 R5; §1.2 canonical 11-row partition; §2 methods reconciled to §5.2; rows 33/35 owning-org actor; context addressing board-selected |
| §4 User & Organization Surface · §5 Membership, Role & Delegation Surface · §6 Context, Buyer-Profile & Workflow-Settings Surface · §7 Out-of-Wire Boundary · §8 Conformance & Carried Items · Appendix A Conformance Attestation | `Doc-5C_Content_v1.0_Pass2.md` | §4.6 method conventions (B-01/M-01/m-02); §4.2 suspended→soft_deleted (m-01); §5.2 set_role_permissions (m-03) + delegation fencing (MAJ-02); §6.2 addressing selected (MAJ-03); CHK-5A-031 unconditional PASS (MAJ-01); MIN-01…04; out-of-wire hardening |

Governing authority for all sections: `Doc-5_Program_Governance_Note_v1.0`; conformance gate: `Doc-5A Appendix A`.

---

## Assembly & Cleaning Rules (for any future consolidated monolith or reader)

1. **Order** = the register above (structure, then §0→§8, then Appendix A).
2. **Apply resolutions** in place at their named section; the resolved wording supersedes the original pass text.
3. **Strip** per-pass scaffolding on assembly: pass header tables, "pending Independent Hard Review" status lines, board self-review notes, and the Pass-1→Pass-2 reconciliation table (now applied).
4. **Anchors verbatim** — every `Doc-5A §X` / `Doc-4C §X` / `Doc-4M` / `Doc-2` / `Doc-3` / `Doc-4A` pointer is preserved exactly; reference-never-restate holds.
5. **No content change on assembly** — assembly is mechanical; any substantive change requires a new Doc-5C amendment (`Doc-5_Program_Governance_Note_v1.0 §5`).

---

## Ratified Structural Decisions (carried from structure freeze)

| ID | Decision |
|---|---|
| **R1** | Out-of-wire boundary (Doc-5B precedent) — §C3 authorization root (`check_permission`/`get_*`), System timers, dual-audience internal leg, DC-1 cascade have no wire (§7). |
| **R2** | User-primary actor surface **with server-validated `Iv-Active-Organization`** context; Admin governance subset no-org; System out-of-wire. |
| **R3** | `identity` route prefix (Doc-5A Appendix B.1). |
| **R4** | No token invented — existing Doc-2 §7 slugs; carried gaps escalated. |
| **R5** | Delegation = grant-management commands + party reads on wire; the §6B delegated-access check is server-side inside `check_permission` (out-of-wire); no delegation wire input. |
| **R6** | No event surface (DC-1) — no `identity` domain event; §11 N/A; no webhook. |

## Realization Conventions (board-reviewed, selected)

- **Method mapping (§4.6):** soft-deletes → `DELETE` (ADR-012 precedence); `update_user_2fa_settings` → named-command `POST` (transport-addressing disambiguation — §5.2 defines no realization for two update-commands on one aggregate item; §0.4). CHK-5A-031 PASS unconditional.
- **Context / singleton addressing (§6.2):** `switch_active_organization` = context command (`/identity/active_context`); `get_active_context` = context singleton; `list_my_organizations` = principal-scoped collection read; buyer-profile / workflow-settings = active-org singleton `PATCH`. Alternatives retained for historical review only.

## Open Carried Items (non-gate) & Separate Board Item

| ID | Item | Status |
|---|---|---|
| **DC-1** | Cross-module cascade with no `identity` event | OPEN — out-of-wire; integration legs only |
| **DC-2** | Org verification ownership = Trust | OPEN |
| **DC-3** | Platform-governance Admin slugs (`staff_*`) | CARRY FORWARD |
| **DC-4** | Authentication mechanism = infrastructure | OPEN |
| **DC-5** | `identity.*` POLICY-key registration | TRACKED — contracts not finalized until Doc-3 §12.2 registration |
| `[ESC-IDN-SLUG]` / `[ESC-IDN-AUDIT]` | Slug / audit-action gaps | OPEN — escalate, never invent |
| `[ESC-IDN-DELEG-EXPIRY]` | `reinstate_delegation_grant` boundary | TRACKED — not finalized until Doc-2 §5.10 resolves |
| **O-01 (separate Board item)** | Doc-4M M5 delegation rows diverge from Doc-2 §5.10/Doc-4C §C9 | **FLAGGED** — additive Doc-4M correction (architecture-touching); **does not gate Doc-5C** (Doc-5C realizes the rank-0 Doc-2 §5.10 owner) |

No corpus patch, no architecture amendment, no ratification dependency for Doc-5C. Review evidence: `governanceReviews/Doc-5C_Freeze_Readiness_Audit_v1.0.md`.

---

## Downstream Effect

Doc-5C is the binding API-realization layer for **Module 1** and the first **User-primary / active-org** realization (template for tenant-facing modules). **Doc-5E** (RFQ Procurement Engine, Module 3 — the platform moat) is authorized next (recommended order Doc-5C → 5E). Each Doc-5x is gated at freeze by the Doc-5A Appendix A checklist. Doc-6 (DB) / Doc-7 (Frontend) / Doc-8 (Tests) planning may proceed in parallel. **Separately**, the Board should open an additive **Doc-4M** correction for the M5 delegation rows (O-01).

---

*Doc-5C program freeze designation. Non-authoring. On any conflict, the registered frozen sources, Doc-5A (FROZEN), and `Doc-5_Program_Governance_Note_v1.0` win; flag-and-halt.*
