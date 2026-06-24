# Doc-5B — Platform Core (M0 `core`) API Realization — Content v1.0, Pass 1 (§0–§2)

| Field | Value |
|---|---|
| Document | Doc-5B — Platform Core / Shared Kernel (Module 0) — API Realization |
| Pass | 1 of N — §0, §1, §2 only |
| Status | ACTIVE — Content Pass 1 of N; §0–§2 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5B_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Module | Module 0 — Platform Core / Shared Kernel (`core` schema) |
| Realizes | `Doc-4B` (M0 contracts, FROZEN) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN), Doc-5A v1.0 (FROZEN) |
| Contains | Document control + scope/surface-partition + the realized endpoint inventory only. No `§5.7` template instantiations (later passes), no out-of-wire realization, no schemas, no contract bodies |
| Audience | Architecture Board · API Governance Board · Doc-5B content authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4B fixed *what* each M0 contract declares (FROZEN); Doc-5A fixed *how* a contract becomes a concrete HTTP API (FROZEN). Pass-1 fixes Doc-5B's precedence/scope and the **caller-facing endpoint inventory** — method, path, actor, success status — for the **five** M0 HTTP endpoints, binding everything to Doc-5A / Doc-4B by pointer. It instantiates no full endpoint template (that is §3–§5), realizes no out-of-wire mechanism (§6), and coins no endpoint/status/header/error-class/slug/POLICY key. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §0/§1/§5` · Doc-4B §B1/§B2/§B4/§B5/§B8/§B9 · Appendix B.1 (`core`).

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Precedence

- Doc-5B sits one realization level below Doc-5A in the chain Doc-5A fixes (`Doc-5A §0.1`):
  ```
  Master Architecture → ADR Compendium → Doc-2 · Doc-3 → Doc-4A → Doc-4B → Doc-5A → Doc-5B → Code
  ```
- Doc-5B **MUST NOT** override, reinterpret, or weaken any higher document. On conflict, the higher document prevails automatically and Doc-5B is patched (`Doc-5A §0.1`; flag-and-halt, `Doc-5_Program_Governance_Note_v1.0 §7`).
- **Binds:** `Doc-5A §0.1`. **Rationale:** the realization layer inherits, never re-opens, the frozen decisions above it.

### 0.2 Scope of Authority

- Doc-5B governs **how the FROZEN Doc-4B contracts of Module 0 are realized as concrete HTTP APIs on the bound transport** — the wire realization layer only.
- Doc-5B does **not** govern: *what* a contract declares (owned by Doc-4B / Doc-4A §§0–21, by pointer); domain facts (Doc-2/Doc-3); persistence (Doc-6), framework/transport implementation, or the M0 in-process mechanisms that have no wire (§6, out-of-wire).
- **Binds:** `Doc-5A §0.2`; Doc-4B §B0. **Rationale:** one realization document, one wire surface; everything else is bound by pointer.

### 0.3 Conformance Obligation

- Before Doc-5B may freeze, it **MUST** pass the Doc-5A **Appendix A** conformance checklist (`CHK-5A-xxx`, machine-executable, binary pass/fail) in full (`Doc-5_Program_Governance_Note_v1.0 §6`). A failing check blocks freeze.
- Doc-5B coins **no** endpoint, status, header, error class, permission slug, or POLICY key — `CHK-5A-121` (broad anti-invention), `CHK-5A-154` (no self-assigned namespace token), `Doc-4A §6.4` (no invented slug).
- **Binds:** `Doc-5A §0.5`, Appendix A. **Rationale:** conformance is an obligation, not advice; the checklist is the gate.

### 0.4 Realize-Never-Redecide

- Doc-5B binds each realized point to its Doc-4B / Doc-5A / corpus owner by pointer and **MUST NOT** copy, paraphrase-with-change, or re-decide it. Where Doc-4A/Doc-5A are silent on a purely transport-level detail, Doc-5B **MAY** fix a **[realization convention]** that contradicts nothing upstream. Missing authority for a declared element ⇒ flag-and-halt (`Doc-5A §0.3`).
- **Binds:** `Doc-5A §0.3`.

---

## §1 — Scope, Audience & M0 Surface Partition

### 1.1 What Doc-5B Governs

- Doc-5B is the **HTTP realization of Module 0's caller-facing contracts** — the audit read surface, audit redaction, system-configuration change, and feature-flag set. It contains no other module's surface and no business-tenant operation.
- M0 caller-facing contracts are **Admin** (platform-staff) — Template 21.6 — or **System**; per Doc-4B §B1 they carry **no active-organization context and no delegation** (`Doc-5A §7.3` — admin carries no org context; `Doc-4B §B1` — no contract is delegation-eligible). Server-side authorization binds the existing `staff_super_admin` slug (Doc-2 §7); no slug is invented (§0.3; D-2 carried).
- **Binds:** `Doc-5A §1`, §7.3/§7.4; Doc-4B §B1.

### 1.2 M0 Surface Partition

The seven Doc-4B contract groups partition by wire-realizability (structure R1):

| Doc-4B group | Doc-5B treatment |
|---|---|
| G1 Audit Record Queries (§B4) · G2 Audit Administration (§B5) · G5 System Configuration change (§B8) · G6 Feature Flag set (§B9) | **Caller-facing HTTP** — realized here (inventory §2; full template §3–§5) |
| G3 Outbox Dispatcher/Archiver (§B6) · G4 ID Sequence / human-ref (§B7) · G7 Internal Infrastructure (§B10) · G5/G6 internal reads (`config_value_query`, `feature_flag_evaluate`) | **Out-of-wire** — no HTTP surface (§6); implementation is code / Doc-6 |

- **Binds:** Doc-4B §B1/§B2 (groups); `Doc-5A §1.3` (transport-implementation deferred). **Rationale:** only contracts with a caller-facing wire are realized; in-process mechanisms are fenced (§6), never given a wire.

### 1.3 Dependency Boundary

- **M0 owns realization only for M0 surfaces.** Cross-module realization belongs to the owning module's Doc-5x (e.g. Identity context → Doc-5C; RFQ context → Doc-5E). Doc-5B references other modules **by ID / public contract only** and realizes no other module's surface. This prevents scope creep: an M0 endpoint never realizes, embeds, or re-decides another module's contract.
- **Binds:** `Doc-5A §1` (scope allocation); structure §1.x.

### 1.4 Audience & Carried Items

- **Audience:** Architecture / API Governance Boards; Doc-5B content authors (human + AI); AI Coding Supervisor; backend and QA engineers consuming or validating the realized M0 surface.
- **Open carried item — D-2 only:** no least-privilege `staff_*` slug exists for config / flag / audit-read; endpoints bind `staff_super_admin` (Doc-2 §7) until a Doc-2 §7 patch adds one. **D-1, PA-E1, PA-E2 were dispositioned during the Doc-4B freeze** and are referenced by pointer for provenance only — not open Doc-5B items.
- **Binds:** Doc-4B §B2; Doc-2 §7.

---

## §2 — Realized Endpoint Inventory

### 2.1 Namespace & Path Grammar

- All M0 caller-facing endpoints live under the reserved **`core`** route prefix (Appendix B.1) and follow the §5.3 grammar `/{module-namespace}/{resource-plural}[/{id}][/{command-name}]`. Resource segments are the owning entity tables (Doc-2 §0.3), rendered **plural** per §5.3 **[realization convention]** where the table name is singular (the store `core.system_configuration` is realized as the `system_configurations` path segment; the underlying entity name is unchanged).
- Command tokens are the **exact `snake_case` operation names from each contract's Contract-ID**, used verbatim as the `{command-name}` segment (`Doc-5A §5.3` — tokens are drawn from the owning module's contract): `admin_redact_audit_field`, `admin_update_config_value`, `admin_set_feature_flag`. No shortening, substitution, or invention. (`Doc-5A §5.3` additionally prohibits standalone abstract verbs such as `get`/`update` as `{command-name}` tokens; the full compound operation names are not standalone abstract verbs.)
- **Binds:** `Doc-5A §5.2/§5.3`, Appendix B.1; Doc-2 §0.3.

### 2.2 Inventory

| # | Doc-4B contract | Actor | Method | Path | Success |
|---|---|---|---|---|---|
| 1 | `core.audit_record_query.v1` (§B4) | Admin | `GET` | `/core/audit_records` | `200` |
| 2 | `core.audit_correlation_lookup.v1` (§B4) | Admin | `GET` | `/core/audit_records` | `200` |
| 3 | `core.admin_redact_audit_field.v1` (§B5) | Admin | `POST` | `/core/audit_records/{id}/admin_redact_audit_field` | `200` |
| 4 | `core.admin_update_config_value.v1` (§B8) | Admin | `POST` | `/core/system_configurations/{id}/admin_update_config_value` | `200` |
| 5 | `core.admin_set_feature_flag.v1` (§B9) | Admin | `POST` | `/core/feature_flags/{id}/admin_set_feature_flag` | `200` |

### 2.3 Inventory Notes

- **Rows 1 & 2 — two contracts, one HTTP path.** Both realize `GET /core/audit_records`: `audit_record_query.v1` (general filters) and `audit_correlation_lookup.v1` (correlation-id filter) are **filter variants of one read endpoint** (§5.3; full filter/pagination grammar realized in §3/§8). Separate rows preserve one-contract-per-row traceability required by the frozen structure inventory.
- **Methods (§5.2):** audit reads (rows 1–2) are `GET` (safe); the three mutations (rows 3–5) are `POST` to a **named command sub-resource** (`{command-name}`), never arbitrary field replacement (§5.1/§5.2).
- **Success (§5.5):** all five are synchronous Admin (21.6) operations → `200` per `Doc-5A §5.5` (`Doc-4A §10.2`/§10.3) — synchronous command with a result; no async, none returns `201`/`202`/`204`.
- **Actor (§7):** all Admin (21.6) — `Authorization` bearer (authentication only) + `staff_super_admin`; **no `Iv-Active-Organization`** (admin carries no org context, `Doc-5A §7.3`).
- The full §5.7 template instantiation (request/response binding, error-status set, idempotency/concurrency, audit) for each endpoint is authored in **§3 (audit read), §4 (redaction), §5 (config/flag)** — not here.
- **Binds:** `Doc-5A §5.1/§5.2/§5.5/§5.7`, §7.3; Doc-4B §B4/§B5/§B8/§B9.

---

*End of Doc-5B Content v1.0, Pass 1 (§0–§2). Document control, scope/surface-partition, and the five-entry realized inventory only — no §5.7 template instantiation, no out-of-wire realization (§6), no schemas, no contract bodies; nothing coined beyond what Doc-4B declares. §3 (audit read) onward follow in later passes, each conforming to `Doc-5B_Structure_v1.0_FROZEN.md`.*
