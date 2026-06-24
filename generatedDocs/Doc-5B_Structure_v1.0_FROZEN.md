# Doc-5B — Platform Core (M0 `core`) API Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents for Doc-5B |
| Freeze Date | 2026-06-24 |
| Supersedes | `Doc-5B_Structure_Proposal_v0.1.md` (Board review applied; authoring history retained there) |
| Module | Module 0 — Platform Core / Shared Kernel (`core` schema) |
| Realizes | `Doc-4B` (M0 contracts, FROZEN) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN), Doc-5A v1.0 (FROZEN) |
| Contains | Structure only — section map, surface partition, ratified decisions, the single open carried item. No endpoints, paths, status tables, schemas, or contract bodies |
| Audience | Architecture Board · API Governance Board · Doc-5B content authors (human + AI) · AI Coding Supervisor · backend, QA |

Two governing rules shape the document:

1. **Realize, never re-decide.** Doc-4B fixed *what* M0 contracts declare; Doc-5A fixed *how* a contract becomes a concrete HTTP API. Doc-5B realizes Doc-4B's surface on the wire and re-decides nothing; every rule binds to Doc-5A / Doc-4B / corpus by pointer.
2. **Conformance is an obligation.** Doc-5B passes the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) before freeze (`Doc-5_Program_Governance_Note_v1.0 §6`). It coins no endpoint, status, header, error class, permission slug, or POLICY key.

## Decisions ratified at structure freeze

- **R1 — Out-of-wire boundary (precedent-setting).** Doc-5B realizes only the caller-facing HTTP surface (G1/G2/G5/G6). G3/G4/G7 — and the G5/G6 internal reads (`config_value_query`, `feature_flag_evaluate`) — have no wire and are documented as an out-of-wire boundary (§6), bound to Doc-4B; their implementation is code / Doc-6. Grounds: Doc-5A §1.3 (transport-implementation deferred), §5 (HTTP endpoints only). *Precedent for every Doc-5x module with internal mechanisms.*
- **R2 — Admin-only actor surface.** M0 caller-facing contracts are Admin (platform-staff) or System; **no tenant-user business operation, no active-organization context, no delegation** (Doc-4B §B1; Doc-5A §7.2/§7.3/§7.4).
- **R3 — `core` route prefix** (Doc-5A Appendix B.1).
- **R4 — No token invented.** Admin endpoints bind the existing `staff_super_admin` (Doc-2 §7) pending the D-2 least-privilege patch; Doc-5B invents nothing — Doc-5A App A **CHK-5A-121** (broad anti-invention) · CHK-5A-154 (namespace token) · `Doc-4A §6.4` (slug).

## M0 surface partition (the structural spine)

| Doc-4B group | Nature | Doc-5B treatment |
|---|---|---|
| G1 Audit Record Queries (§B4) | Admin reads (21.6) | **Caller-facing HTTP** `GET` |
| G2 Audit Administration — redaction (§B5) | Admin command | **Caller-facing HTTP** `POST` command |
| G5 System Configuration — change (§B8) | Admin command | **Caller-facing HTTP** `POST` command |
| G6 Feature Flags — set (§B9) | Admin command | **Caller-facing HTTP** `POST` command |
| G3 Outbox Dispatcher/Archiver (§B6) | System actor (21.5, Phase-2, `Response: none`) | **Out-of-wire** — background workers |
| G4 ID Sequence / human-ref allocation (§B7) | Internal-service | **Out-of-wire** — in-process |
| G5/G6 internal reads (`config_value_query`, `feature_flag_evaluate`, §B8/§B9) | Internal-service (in-process) | **Out-of-wire** — not a caller surface |
| G7 Supporting Internal Infrastructure (§B10) | Internal obligations | **Out-of-wire** — in-process |

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Doc-5B's precedence (… → Doc-4A → Doc-4B → Doc-5A → **Doc-5B** → Code); the obligation to conform to Doc-5A in full and pass Appendix A; realize-never-redecide.
- **Dependencies:** `Doc-5A §0`; `Doc-5_Program_Governance_Note_v1.0`. **Detail:** short, normative.

## §1 — Scope, Audience & M0 Surface Partition
- **Purpose:** what Doc-5B governs (the M0 HTTP surface) and does not; carry the surface partition table; carry the one **open** Doc-4B item (D-2) by pointer (D-1/PA-E1/PA-E2 resolved at Doc-4B freeze).
- **§1.x — Dependency Boundary:** one paragraph — **M0 owns realization only for M0 surfaces. Cross-module realization belongs to the owning module's Doc-5x** (Identity context → Doc-5C; RFQ context → Doc-5E). Doc-5B references other modules by ID/contract only and realizes no other module's surface.
- **Dependencies:** `Doc-5A §1`; Doc-4B §B1/§B2. **Detail:** scope + partition tables.

## §2 — Realized Endpoint Inventory
- **Purpose:** the `core`-namespace HTTP surface — one row per caller-facing endpoint (G1 reads; G2/G5/G6 commands): method (§5.2), path grammar (§5.3), actor (Admin), success status (§5.5). Every endpoint instantiates the §5.7 template (filled in content).
- **Dependencies:** `Doc-5A §5`, App B.1 (`core`); Doc-4B §B4/§B5/§B8/§B9. **Detail:** inventory table (paths in content pass).

## §3 — Audit Read Surface Realization
- **Purpose:** G1 → `GET` reads; non-disclosure on the wire (§6.3/§7 — audit of protected-fact-gated operations never served to a gated-out party); pagination/filter (§8); top-level `reference_id` (§6 / C-05).
- **Dependencies:** `Doc-5A §5/§6/§7/§8`; Doc-4B §B4. **Detail:** read-surface realization.

## §4 — Audit Redaction Realization
- **Purpose:** G2 → `POST` named command; idempotency/concurrency carriage (§9); error mapping (§6); the redaction action itself audited.
- **Dependencies:** `Doc-5A §5/§6/§9`; Doc-4B §B5. **Detail:** command realization.

## §5 — System Configuration & Feature-Flag Surface Realization
- **Purpose:** G5+G6 → Admin `POST` change/set commands **only** (the `config_value_query` / `feature_flag_evaluate` reads are internal-service → §6 out-of-wire); POLICY-key boundary (values by key, never literal — Doc-5A §8/§12 · Doc-3 §12); config-change governance ownership settled at Doc-4B freeze (PA-E2), referenced by pointer.
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-3 §12`; Doc-4B §B8/§B9. **Detail:** config/flag command realization.

## §6 — Out-of-Wire Boundary (G3 · G4 · G7 · G5/G6 internal reads)
- **Purpose:** declare that G3 (outbox dispatch/archive), G4 (ID/human-ref allocation), G7 (internal infrastructure obligations), and the G5/G6 internal reads have **no HTTP wire**: System workers and in-process mechanisms invoked within consuming modules' transactions. Implementation is code / Doc-6. **Flag-and-halt if any wire surface is proposed for them** (an architecture change).
- **Dependencies:** Doc-4B §B6/§B7/§B10 (+ §B8/§B9 internal reads); `Doc-5A §1.3`, §10.5/§11. **Detail:** boundary statement only — no realization.

## §7 — Conformance & Carried Items
- **Purpose:** Doc-5B's attestation against Doc-5A **Appendix A** (`CHK-5A-xxx`, the freeze gate); the one **open** carried item (D-2) registered by pointer; statement that Doc-5B coins nothing.
- **Dependencies:** `Doc-5A Appendix A`; Doc-4B §B2/§B13. **Detail:** attestation + carried-item register.

## Appendix A — Doc-5B Conformance Attestation
- **Purpose:** per-endpoint pass/fail against the applicable `CHK-5A-xxx` checks; the freeze evidence.
- **Dependencies:** `Doc-5A Appendix A`. **Detail:** attestation table (content pass).

---

## Open Carried Item: D-2 only

| ID (Doc-4B) | Item | Doc-5B handling |
|---|---|---|
| D-2 | No least-privilege `staff_*` slug for config/flag/audit-read | binds the existing `staff_super_admin` (Doc-2 §7); a least-privilege slug awaits a Doc-2 §7 patch — **OPEN** |

**Resolved at Doc-4B freeze (not Doc-5B's to carry):** D-1 (internal-service template — composed via Templates 21.3/21.4; realized out-of-wire, §6), PA-E1 (outbox/audit POLICY-key registration), PA-E2 (config-change governance ownership). Referenced by pointer for provenance only.

## Fences / Out of scope

Cross-module realization (owning module's Doc-5x — §1.x) · any other module's surface · resolving D-2 · framework/DB/job-engine implementation (code/Doc-6) · giving G3/G4/G7 or the internal reads a wire · coining any endpoint/status/header/error-class/slug/POLICY key.

---

*End of Doc-5B Canonical Structure v1.0 (FROZEN) — structure only. On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt. Authoring history retained in `Doc-5B_Structure_Proposal_v0.1.md`. Next: content passes, each conforming to this structure.*
