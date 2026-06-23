# Doc-4F_PassB_Part5_Patch_v1.0 — Corrective Patch (BC-OPS-5 Finance Records)

| Field | Value |
|---|---|
| Document | Doc-4F_PassB_Part5_Patch_v1.0 — corrective patch for `Doc-4F_PassB_Part5_BC-OPS-5_Finance_Records_v1.0` |
| Nature | **Corrective patch — not a redesign.** Applies only the Board-approved findings. |
| Sole review authority | `Doc-4F_PassB_Part5_Hard_Review_v1.0` |
| Authority | Doc-4_Governance_Note_v1.0; Doc-4A v1.0 (FROZEN) governs; corpus precedence; on conflict FLAG-AND-HALT |
| Applies to | `Doc-4F_PassB_Part5_BC-OPS-5_Finance_Records_v1.0.md` |
| Preserved unchanged | ownership, aggregate boundaries, lifecycle, permissions, event ownership, audit ownership, procurement moat, Trust firewall, escalation markers |
| Scope | AD-01 · AD-02 · IR-01 · IR-02 · IR-03 · IR-04 |

---

## AD-01 — §F8.1 Error Register · `SYSTEM` retryable false → true (Doc-4A §12)

**Original**

```
| `SYSTEM` | unexpected | false |
```

**Replacement**

```
| `SYSTEM` | unexpected internal failure | true |
```

---

## AD-02 — §F8.1 Request Schema + Validation Matrix · explicit create/update separation; `record_type` immutable post-create (structurally excluded from update)

### §F8.1 Request Schema (replace the single merged table with two explicit tables)

**Original**

```
**3. Request Schema**

| Field | Type | Required | Validation notes |
|---|---|---|---|
| `record_type` | `enum<tax\|ait\|payment\|expense>` | yes (create) | Doc-2 §10.5 fixed four-value enum (immutable post-create) |
| `period` | `string` | yes (create) | Doc-2 §10.5 `period` (reporting period text) |
| `amount` | `numeric` | yes (create) | Doc-2 §10.5 `amount` (record value; no funds movement) |
| `currency` | `enum<BDT>` | no | Doc-2 §10.5 `currency` (optional; corpus default BDT — Doc-4A §9.2) |
| `note` | `text` | no | Doc-2 §10.5 `note` (structured text) |
| `finance_record_id` | `uuid` | yes (update) | target record (update only) |
| `expected_revision` | `numeric` | yes (update) | optimistic-concurrency assertion (H.5) |
```

**Replacement**

```
**3. Request Schema**

**Create — `ops.create_finance_record.v1`:**

| Field | Type | Required | Validation notes |
|---|---|---|---|
| `record_type` | `enum<tax\|ait\|payment\|expense>` | yes | Doc-2 §10.5 fixed four-value enum; set at create, **immutable thereafter** |
| `period` | `string` | yes | Doc-2 §10.5 `period` (reporting period text) |
| `amount` | `numeric` | yes | Doc-2 §10.5 `amount` (record value; no funds movement) |
| `currency` | `enum<BDT>` | no | Doc-2 §10.5 `currency` (optional; corpus default BDT — Doc-4A §9.2) |
| `note` | `text` | no | Doc-2 §10.5 `note` (structured text) |

**Update — `ops.update_finance_record.v1`:**

| Field | Type | Required | Validation notes |
|---|---|---|---|
| `finance_record_id` | `uuid` | yes | target record |
| `expected_revision` | `numeric` | yes | optimistic-concurrency assertion (H.5) |
| `period` | `string` | no | Doc-2 §10.5 `period` (editable) |
| `amount` | `numeric` | no | Doc-2 §10.5 `amount` (editable; no funds movement) |
| `currency` | `enum<BDT>` | no | Doc-2 §10.5 `currency` (editable) |
| `note` | `text` | no | Doc-2 §10.5 `note` (editable) |

> **`record_type` immutability (deterministic enforcement).** `record_type` is set at create and is **structurally excluded from the update request schema** — update requests do **not** accept `record_type`. There is no update-time `record_type` mutation path; immutability is enforced by schema exclusion (a supplied `record_type` on update is an unknown field → SYNTAX `VALIDATION` failure, Doc-4A §9).
```

### §F8.1 Validation Matrix (align Stage-8 BUSINESS to the chosen enforcement path)

**Original**

```
| 8 BUSINESS | Doc-2 §10.5 | `record_type` immutable post-create (update may not change `record_type`); structured text only (no funds, no file uploads) | `BUSINESS` (if `record_type` mutation or funds operation attempted) |
```

**Replacement**

```
| 8 BUSINESS | Doc-2 §10.5 | structured text only — no funds movement, no file uploads (a finance record is org-internal text; not a Billing invoice or a BC-OPS-2 trade invoice/payment record) | `BUSINESS` (if a funds/file-upload operation is attempted) |
```

*(`record_type` immutability is now enforced at Stage-1 SYNTAX by schema exclusion — update does not accept `record_type` — so the Stage-8 BUSINESS `record_type`-mutation branch is removed; no ambiguity remains.)*

---

## IR-01 — §F8.2 Error Register · `SYSTEM` retryable false → true (Doc-4A §12)

**Original**

```
| `SYSTEM` | unexpected | false |
```

**Replacement**

```
| `SYSTEM` | unexpected internal failure | true |
```

---

## IR-02 — §F8.1 Response Schema · add `revision` (deterministic optimistic-concurrency chaining)

**Original**

```
**4. Response Schema**

| Field | Type | Source authority |
|---|---|---|
| `finance_record_id` | `uuid` | Operations `finance_records` (UUIDv7, Doc-4A §8) |
| `record_type` | `enum<tax\|ait\|payment\|expense>` | Doc-2 §10.5 |
| `reference_id` | `uuid` | Doc-4A §22.1 C-05 (every response) |
```

**Replacement**

```
**4. Response Schema**

| Field | Type | Source authority |
|---|---|---|
| `finance_record_id` | `uuid` | Operations `finance_records` (UUIDv7, Doc-4A §8) |
| `record_type` | `enum<tax\|ait\|payment\|expense>` | Doc-2 §10.5 |
| `revision` | `numeric` | Operations `finance_records` row revision (optimistic-concurrency token, Doc-4A §14) — the value to supply as the next `expected_revision`; not a lifecycle state |
| `reference_id` | `uuid` | Doc-4A §22.1 C-05 (every response) |
```

---

## IR-03 — §F8.1 Validation Matrix · mark concurrency assertion update-only (remove create-path ambiguity)

**Original**

```
| 6 STATE → concurrency sub-check | Doc-4A §14 | (update) optimistic-concurrency: `expected_revision` = current revision | `CONFLICT` |
```

**Replacement**

```
| 6 STATE → concurrency sub-check (**update-only**) | Doc-4A §14 | **update only** — optimistic-concurrency: `expected_revision` = current revision. **Create executes no concurrency sub-check** (no prior row exists). | `CONFLICT` (update only) |
```

---

## IR-04 — §F8.1 AI-Agent Notes · normalize validation-order wording to frozen-Part style

**Original**

```
**13. AI-Agent Implementation Notes** — Validation execution order: SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION(n/a) → STATE(none)+concurrency → REFERENCE(none) → BUSINESS → POLICY(none) (Doc-4A §11.2). State enforcement: **`finance_records` has no lifecycle** — never synthesize states or transitions; mutations declare `State-Machine-Effects: none`. Audit: every create/update writes an audit record via Doc-4B in the same transaction (carried `[ESC-OPS-AUDIT]`). `record_type` is the **fixed four-value enum** (tax/ait/payment/expense) — never extend; immutable post-create. Finance records are **structured text only** (Doc-2 §10.5) — **never** link to Billing (`platform_invoices` = Doc-4I, DF-6), **never** treat as a BC-OPS-2 trade invoice/payment record, **never** move funds. Own-org scope only; collapse to `NOT_FOUND` for non-owners. May read Trust outputs but **never** compute/mutate a Trust score (DF-4).
```

**Replacement**

```
**13. AI-Agent Implementation Notes** — Validation execution order (Doc-4A §11.2, canonical, never reordered): `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`; failure terminates at the first failing stage. For these contracts: stage 5 DELEGATION is not eligible (own-org), stage 6 STATE applies no transition gate (`finance_records` has no state machine) and carries the update-only optimistic-concurrency sub-check, stage 7 REFERENCE is not exercised (org-internal), stage 9 POLICY is not exercised. State enforcement: **`finance_records` has no lifecycle** — never synthesize states or transitions; mutations declare `State-Machine-Effects: none`. Audit requirements: every create/update writes an audit record via Doc-4B in the same transaction (carried `[ESC-OPS-AUDIT]`). `record_type` is the **fixed four-value enum** (tax/ait/payment/expense) — never extend; set at create and **structurally excluded from update** (immutable). Finance records are **structured text only** (Doc-2 §10.5) — **never** link to Billing (`platform_invoices` = Doc-4I, DF-6), **never** treat as a BC-OPS-2 trade invoice/payment record, **never** move funds. Own-org scope only; collapse to `NOT_FOUND` for non-owners. May read Trust outputs but **never** compute/mutate a Trust score (DF-4).
```

---

# Regression Audit

| Area | Result |
|---|---|
| Ownership | UNCHANGED |
| Aggregate Count | UNCHANGED (one — Finance Record) |
| State Machine | UNCHANGED (none; `finance_records` simple) |
| Permissions | UNCHANGED (`can_manage_finance_records`) |
| Events | UNCHANGED (zero) |
| Audit Bindings | UNCHANGED (`[ESC-OPS-AUDIT]`) |
| Escalation Markers | UNCHANGED (`[ESC-OPS-AUDIT]`/`[ESC-OPS-POLICY]`/`[ESC-OPS-SLUG]`) |
| Procurement Moat | UNCHANGED |
| Trust Firewall | UNCHANGED |

All six patches are error-retryability / schema-separation / response-field / matrix-labeling / wording-normalization corrections; no governance object created or changed.

---

*End of Doc-4F_PassB_Part5_Patch_v1.0.*
