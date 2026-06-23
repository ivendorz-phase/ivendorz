# Doc-4F_PassB_Part4_Patch_v1.0 — Governance Patch (BC-OPS-4 Document Generation & Templates)

| Field | Value |
|---|---|
| Document | Doc-4F_PassB_Part4_Patch_v1.0 — governance patch for `Doc-4F_PassB_Part4_BC-OPS-4_Document_Generation_&_Templates_v1.0` |
| Nature | **Governance patch — not redesign, not rewrite, not re-authoring.** Applies only the Board-approved findings. |
| Sole review authority | `Doc-4F_PassB_Part4_Hard_Review_v1.0` |
| Authority | Doc-4_Governance_Note_v1.0; Doc-4A v1.0 (FROZEN) governs; corpus precedence; on conflict FLAG-AND-HALT |
| Applies to | `Doc-4F_PassB_Part4_BC-OPS-4_Document_Generation_&_Templates_v1.0.md` |
| Preserved unchanged | Architecture, ADRs, Pass-A authority, aggregate ownership, DDD boundaries, procurement moat, Trust firewall, event ownership, audit ownership, escalation markers |
| Scope | P-01 · P-02 · P-03 · P-04 · P-05 · P-06 · P-07 · P-08 (optional, applied) |

---

## P-01 — Split merged STATE / CONFLICT rows (§F7.1, §F7.2) — BC-OPS-3 P-04 precedent

### §F7.1 Validation Matrix

**Original**

```
| transition legal | 6 STATE | Doc-2 §5.9 | `draft → active` (activate); `active → archived` (archive); `archived → active` (reactivate); create enters `draft` | `STATE` |
| status match | 6 STATE / concurrency | Doc-4A §14 | `expected_status` = current status (activate/archive/reactivate) | `CONFLICT` |
```

**Replacement**

```
| transition legal (state) | 6 STATE | Doc-2 §5.9 | `draft → active` (activate); `active → archived` (archive); `archived → active` (reactivate); create enters `draft` (lifecycle legality checked first) | `STATE` |
| status match (concurrency) | 6 STATE → concurrency sub-check | Doc-4A §14 | after lifecycle legality passes, optimistic-concurrency: `expected_status` = current status (activate/archive/reactivate) | `CONFLICT` |
```

### §F7.2 Validation Matrix

**Original**

```
| template active | 6 STATE | Doc-2 §5.9 | parent template is `active` (a new version is added on the `active → active` edit edge) | `STATE` |
| status match | 6 STATE / concurrency | Doc-4A §14 | `expected_template_status` = current (`active`) | `CONFLICT` |
```

**Replacement**

```
| template active (state) | 6 STATE | Doc-2 §5.9 | parent template is `active` (a new version is added on the `active → active` edit edge; lifecycle legality checked first) | `STATE` |
| status match (concurrency) | 6 STATE → concurrency sub-check | Doc-4A §14 | after lifecycle legality passes, optimistic-concurrency: `expected_template_status` = current (`active`) | `CONFLICT` |
```

---

## P-02 — §F7.3 · remove `9 POLICY/infra`; separate DEPENDENCY from ASYNC_PENDING

**Original** (Validation Matrix `storage available` row)

```
| storage available | 9 POLICY/infra | Doc-4B storage (DF-8) | storage backend available to write the `storage_ref` | `DEPENDENCY` (retry) / `ASYNC_PENDING` (not yet complete) |
```

**Replacement** (canonical stage placement; two independent rules)

```
| storage available | 7 REFERENCE | Doc-4B storage (DF-8); Doc-4A §4.5 | the storage backend is available to write the `storage_ref` | `DEPENDENCY` (transient; retry) |
| generation completion | 8 BUSINESS | Doc-4A §12.2 (async result lifecycle) | the async generation result is available; while in progress the contract returns the in-progress signal | `ASYNC_PENDING` (poll until complete) |
```

---

## P-03 — §F7.4 · remove inline `[ESC-OPS-SLUG]` hedges; `can_create_documents` authoritative; carry the marker only in Appendix B

### §F7.4 Validation Matrix (`can_create_documents` AUTHZ row)

**Original**

```
| `can_create_documents` | 3 AUTHZ | Doc-2 §7 | slug held (generated-document sharing under document-creation authority; **if a content/review pass finds a distinct share slug is required, carry `[ESC-OPS-SLUG]`**) | `AUTHORIZATION` |
```

**Replacement**

```
| `can_create_documents` | 3 AUTHZ | Doc-2 §7 | slug held — generated-document sharing is authorized under `can_create_documents` (document-creation authority) | `AUTHORIZATION` |
```

### §F7.4 Authorization Matrix

**Original**

```
**5. Authorization Matrix** — Actor **User** · Slug **`can_create_documents`** (Doc-2 §7) **or carry `[ESC-OPS-SLUG]`** if a distinct generated-document-share slug is later required · Scope = owning org · Delegation **not eligible** · Enforcement Identity `check_permission`.
```

**Replacement**

```
**5. Authorization Matrix** — Actor **User** · Slug **`can_create_documents`** (Doc-2 §7; authoritative for generated-document sharing) · Scope = owning org · Delegation **not eligible** (Doc-4A §6B — generated-document sharing is an own-org action, not delegation-eligible) · Enforcement Identity `check_permission`.
```

### §F7.4 Section 12 prose

**Original**

```
**12. AI-Agent Implementation Notes** — sharing is a **grant**, not a copy or a tenancy change — the document stays Operations-owned (Doc-2 §10.5); a shared generated document is visible to the **owning org + granted counterparty only**, and **revoke removes counterparty visibility** — never broaden. Distinct from RFQ's `rfq_document_grant` (RFQ-owned — Doc-4E). Own-org scope only; collapse to `NOT_FOUND` for non-owners.
```

**Replacement** *(no `[ESC-OPS-SLUG]` was inline in §F7.4 prose; unchanged except confirming `can_create_documents` is authoritative — text retained as-is; the marker is carried only in Appendix B per P-03.)*

```
**12. AI-Agent Implementation Notes** — sharing is a **grant**, not a copy or a tenancy change — the document stays Operations-owned (Doc-2 §10.5); a shared generated document is visible to the **owning org + granted counterparty only**, and **revoke removes counterparty visibility** — never broaden. Generated-document sharing is authorized under `can_create_documents` (Doc-2 §7). Distinct from RFQ's `rfq_document_grant` (RFQ-owned — Doc-4E). Own-org scope only; collapse to `NOT_FOUND` for non-owners.
```

*(Appendix B retains `[ESC-OPS-SLUG]` as the carried marker — unchanged.)*

---

## P-04 — §F7.2 · rewrite immutable-version rule as a guard condition (no happy-path wording)

**Original**

```
| immutable-version semantics | 8 BUSINESS | Doc-2 §5.9 | append a new `version_no` (prior versions retained, never overwritten) | `BUSINESS` (if an overwrite of an existing version is attempted) |
```

**Replacement**

```
| immutable-version guard | 8 BUSINESS | Doc-2 §5.9 | a request that targets or mutates an existing `template_versions` row (any overwrite of a prior `version_no`) is rejected — `template_versions` are immutable; a version may only be appended as a new `version_no` | `BUSINESS` |
```

---

## P-05 — §F7.3 Error Register · remove replay/idempotency commentary (keep in §10) — BC-OPS-3 P-06 precedent

**Original** (Error Register parenthetical)

```
*(No `CONFLICT` on the per-job uniqueness path: a replayed job for an existing `generation_job_id` is an **idempotent no-op** (dedup on job identity, Doc-4A §16.7), never `CONFLICT` — consistent with the FROZEN Part-2/Part-3 / Doc-4A §14.6 convention.)*
```

**Replacement** (parenthetical removed from Error Register; §10 already carries the replay behavior — amended to make the no-`CONFLICT` explicit)

§10 original:

```
**10. Idempotency Rules** — inherently idempotent (Doc-4A §14 / §16.7): **dedup on `generation_job_id`** — a replayed generation request produces **no** duplicate `generated_documents` row and **no** duplicate audit (no duplicate-generation ambiguity). `ASYNC_PENDING` is the in-progress signal; the completed row is written once.
```

§10 replacement:

```
**10. Idempotency Rules** — inherently idempotent (Doc-4A §14 / §16.7): **dedup on `generation_job_id`** — a replayed generation request produces **no** duplicate `generated_documents` row and **no** duplicate audit (no duplicate-generation ambiguity). A replayed job for an existing `generation_job_id` is an **idempotent no-op** — **never `CONFLICT`** (dedup on job identity, Doc-4A §16.7; FROZEN Part-2/Part-3 / Doc-4A §14.6 convention). `ASYNC_PENDING` is the in-progress signal; the completed row is written once.
```

---

## P-06 — cite corpus authority for every `Delegation not eligible` assertion (§F7.1, §F7.2, §F7.4, §F7.5)

Authority: **Doc-4A §6B** — delegation applies only where a contract is delegation-eligible (a representative org acting for a profile it does not control); BC-OPS-4 template/generated-document operations are **own-org actions** with no representative-org scenario, hence not delegation-eligible. Cited inline; no authority invented; no escalation required.

### §F7.1 Authorization Matrix

**Original**

```
**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_templates`** (Doc-2 §7) · Scope = owning org (`organization_id`) · Delegation **not eligible** · Enforcement Identity `check_permission`.
```

**Replacement**

```
**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_templates`** (Doc-2 §7) · Scope = owning org (`organization_id`) · Delegation **not eligible** (Doc-4A §6B — own-org template management; no representative-org scenario) · Enforcement Identity `check_permission`.
```

### §F7.2 Authorization Matrix

**Original**

```
**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_templates`** (Doc-2 §7) · Scope = owning org · Delegation **not eligible** · Enforcement Identity `check_permission`.
```

**Replacement**

```
**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_templates`** (Doc-2 §7) · Scope = owning org · Delegation **not eligible** (Doc-4A §6B — own-org template versioning; no representative-org scenario) · Enforcement Identity `check_permission`.
```

### §F7.4 Authorization Matrix

*(Covered by P-03 replacement, which already adds the `Doc-4A §6B` citation to the `Delegation not eligible` clause.)*

### §F7.5 Authorization Matrix

**Original**

```
**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_templates`** (template reads) / **`can_create_documents`** (generated-document reads, owning org) **or counterparty grant** (granted org) (Doc-2 §7) · Scope = owning org, plus granted counterparty for shared generated documents · Delegation **not eligible** · Enforcement Identity `check_permission`.
```

**Replacement**

```
**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_templates`** (template reads) / **`can_create_documents`** (generated-document reads, owning org) **or counterparty grant** (granted org) (Doc-2 §7) · Scope = owning org, plus granted counterparty for shared generated documents · Delegation **not eligible** (Doc-4A §6B — own-org / counterparty-grant reads; no representative-org scenario) · Enforcement Identity `check_permission`.
```

*(§F7.3 Authorization Matrix uses Actor **System** with "Delegation **not eligible**" — System-actor contracts are inherently non-delegation per Doc-4A §15.5/§5.2 (already cited in that row); no change required by P-06.)*

---

## P-07 — §F7.3 Validation Matrix · replace `idempotent no-op (no error)` with `—`

**Original**

```
| no completed document for `generation_job_id` | 6 STATE | Doc-2 §10.5 (per-job) | a generated document is produced once per `generation_job_id`; a duplicate job is an idempotent no-op (dedup on job identity) | idempotent no-op (no error) |
```

**Replacement**

```
| no completed document for `generation_job_id` | 6 STATE | Doc-2 §10.5 (per-job) | a generated document is produced once per `generation_job_id`; a duplicate job is dedup-handled (see §10 Idempotency Rules) | — |
```

*(Replay behavior remains in §10 Idempotency Rules, per P-05.)*

---

## P-08 (optional, applied) — §F7.3 Error Register · add AUTHORIZATION

**Original** (Error Register, first row)

```
| `VALIDATION` | malformed job input → DLQ per POLICY | false |
```

**Replacement**

```
| `VALIDATION` | malformed job input → DLQ per POLICY | false |
| `AUTHORIZATION` | the job runs without a valid Phase-2 System-actor origin (Doc-4A §15.5) — the enqueuing user command must have carried `can_create_documents`/`can_manage_templates` | false |
```

---

# Patch Summary

| Patch ID | Location | Change |
|---|---|---|
| P-01 | §F7.1, §F7.2 Validation Matrix | STATE / CONFLICT split into ordered checks |
| P-02 | §F7.3 Validation Matrix | `9 POLICY/infra` removed; DEPENDENCY (7 REFERENCE) and ASYNC_PENDING (8 BUSINESS) as independent rules |
| P-03 | §F7.4 Validation/Authorization Matrix + prose | inline `[ESC-OPS-SLUG]` hedges removed; `can_create_documents` authoritative; marker carried only in Appendix B |
| P-04 | §F7.2 Validation Matrix | immutable-version rule rewritten as a guard condition |
| P-05 | §F7.3 Error Register → §10 | replay/idempotency commentary relocated to §10 |
| P-06 | §F7.1, §F7.2, §F7.4, §F7.5 Authorization Matrix | `Delegation not eligible` cited to Doc-4A §6B |
| P-07 | §F7.3 Validation Matrix | `idempotent no-op (no error)` → `—` |
| P-08 | §F7.3 Error Register | `AUTHORIZATION` row added |

---

*End of Doc-4F_PassB_Part4_Patch_v1.0. Governance patch only — no review/audit commentary, no redesign. Eight patches applied (P-01…P-08). Architecture, ADRs, Pass-A authority, aggregate ownership, DDD boundaries, procurement moat, Trust firewall, event ownership, audit ownership, and escalation markers preserved unchanged; no entity/state/event/slug/audit-action/POLICY-key invented. Patch Verification required next; not performed here.*
