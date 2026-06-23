# Doc-4G_PassB_Part1_Patch_v1.0.md

## Status

**Approved Pass-B Part-1 Patch** — applies the Architecture-Board-approved corrections to `Doc-4G_PassB_Part1_BC-TRUST-1_Verification_v1.0.md`. Surgical, contract-level patching only — no rewrite, no redesign.

| Field | Value |
|---|---|
| Applies to | `Doc-4G_PassB_Part1_BC-TRUST-1_Verification_v1.0.md` |
| Produces | `Doc-4G_PassB_Part1_BC-TRUST-1_Verification_v1.0` as amended by this patch (canonical input to Pass-B Part-1 Freeze) |
| Review authority | `Doc-4G_PassB_Part1_Independent_Hard_Review_v1.0` |
| Board adjudication | **Mandatory:** F4G-PB1-MA1, F4G-PB1-MA2, F4G-PB1-M1, F4G-PB1-M2, F4G-PB1-M3. **Recommended:** F4G-PB1-N1, F4G-PB1-N2 — applied. |
| Scope | Canonical Pass-B 9-stage validation presentation (MA1); verified-tier creation two-step lifecycle wording (MA2); assign already-`in_review` → `STATE` (M1); revoke authorization rule fixed (M2); per-query actor/authz/scope/visibility (M3); `admin tier override` mapping note (N1); event-binding de-duplication (N2). |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G Structure FROZEN, Doc-4G Pass-A FROZEN — all FROZEN |
| Application model | Additive amendment. Each item quotes the exact **Before** text present verbatim in the base and gives the **After**, except MA1's matrix relabel which is a documented global stage-label substitution (the relabel table is exhaustive and exact). Doc-4A §11.2 remains the enforcement authority; only the **presentation vocabulary** of the Stage column changes. |

This patch **introduces no contract, aggregate, bounded context, lifecycle edge, event, permission slug, audit action, or POLICY key**. Validation enforcement logic, ownership, aggregates, lifecycles, events, permissions, audit actions, the trust firewall, and the procurement moat are preserved unchanged. Escalation markers are preserved, not renamed, not removed.

---

# 1. Exact Changes

---

### F4G-PB1-MA1 — §H.1 + all validation matrices — single canonical Pass-B validation vocabulary

> Doc-4A §11.2 authority and enforcement logic are retained. The **presentation** is converted to the single mandated Pass-B nine-stage vocabulary; the dual presentation is removed. No reorder, no enforcement change.

#### F4G-PB1-MA1·a — §H.1 rewritten to one canonical presentation

**Before:**

```
- **H.1 — Validation stages (Doc-4A §11.2; the canonical nine-stage order, FROZEN, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. **Board label mapping (this Part):** the authoring-standard labels map onto the frozen §11.2 pipeline with no reordering — **SYNTAX** = §11.2 SYNTAX (presence/type/bounds/enum, §9); **SHAPE** = the field-shape aspect of §11.2 SYNTAX (cardinality/nullable/structural shape); **SEMANTIC** = §11.2 BUSINESS (domain-meaning rules); **AUTHENTICATION** = §11.2 CONTEXT (actor type + active-org/admin-scope authenticity, §5.2/§5.3/§5.6); **AUTHORIZATION** = §11.2 AUTHZ + SCOPE + DELEGATION (§6/§6B); then **STATE → REFERENCE → BUSINESS → POLICY** identical. Doc-4A is FROZEN and authoritative on stage order; this Part binds to it. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is always established before semantic processing (6–9) — a disclosure control (§7.5). Each Validation Matrix row names the **stage**, the **source authority**, the **rule (validation)**, and the **failure outcome (failure class)**.
```

**After:**

```
- **H.1 — Validation stages (canonical Pass-B presentation; Doc-4A §11.2 is the enforcement authority).** The single canonical stage vocabulary used by **every** Validation Matrix in this Part is: `1 SYNTAX → 2 SHAPE → 3 SEMANTIC → 4 AUTHENTICATION → 5 AUTHORIZATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. This presentation is the only validation vocabulary in this document; no alternate vocabulary appears. **Enforcement authority (Doc-4A §11.2, FROZEN — order and logic unchanged):** each presented stage binds to the frozen §11.2 pipeline as its authority, with no reordering of enforcement — `1 SYNTAX` + `2 SHAPE` enforce §11.2 SYNTAX (presence/type/bounds/enum + cardinality/nullable/structural shape, §9); `3 SEMANTIC` and `8 BUSINESS` enforce §11.2 BUSINESS (domain-meaning rules); `4 AUTHENTICATION` enforces §11.2 CONTEXT (actor type + active-org/admin-scope authenticity, §5.2/§5.3/§5.6); `5 AUTHORIZATION` enforces §11.2 AUTHZ + SCOPE + DELEGATION (§6/§6B); `6 STATE` / `7 REFERENCE` / `9 POLICY` enforce the identically-named §11.2 stages. The enforcement order is exactly Doc-4A §11.2 and is never reordered. Failure terminates at the first failing stage; SYNTAX/SHAPE MAY aggregate field errors, later stages fail singly. Authentication + Authorization are always established before semantic/state/reference/business/policy processing — a disclosure control (§7.5). Each Validation Matrix row names the **stage** (canonical Pass-B label above), the **source authority** (Doc-4A §11.2 + cited Doc-2/Doc-3 source), the **rule (validation)**, and the **failure outcome (failure class)**.
```

#### F4G-PB1-MA1·b — Validation Matrix Stage-column relabel (applies to every matrix in §G4.1–§G4.8)

Every Validation Matrix **Stage** cell is relabeled from the §11.2-vocabulary value to the canonical Pass-B value below. This is a **presentation relabel only**; the row's source authority, rule, and failure outcome are unchanged, and the enforcement order is unchanged (Doc-4A §11.2). The mapping is exhaustive for the values present in the base:

| Base Stage cell (before) | Canonical Pass-B Stage cell (after) |
|---|---|
| `1 SYNTAX` | `1 SYNTAX` |
| `1 SYNTAX (incl. SHAPE)` | `1 SYNTAX` *(field-shape aspects presented as `2 SHAPE` where a row is purely structural; otherwise `1 SYNTAX`)* |
| `2 CONTEXT` | `4 AUTHENTICATION` |
| `2 CONTEXT (AUTHENTICATION)` | `4 AUTHENTICATION` |
| `2 CONTEXT / 2–5 collapse (System)` | `4 AUTHENTICATION / 4–5 collapse (System trigger-authenticity)` |
| `3 AUTHZ` | `5 AUTHORIZATION` |
| `4 SCOPE` | `5 AUTHORIZATION (scope)` |
| `5 DELEGATION` | `5 AUTHORIZATION (delegation — n/a here)` |
| `6 STATE` | `6 STATE` |
| `6 STATE / concurrency` | `6 STATE (concurrency)` |
| `7 REFERENCE` | `7 REFERENCE` |
| `8 BUSINESS` | `8 BUSINESS` *(where a row expresses a domain-meaning precondition rather than a quantitative rule, it is presented as `3 SEMANTIC`; both bind §11.2 BUSINESS)* |
| `9 POLICY` | `9 POLICY` |

**Row-specific SHAPE/SEMANTIC presentation (applied within the relabel):**
- In **every** Request-field SYNTAX row, the cardinality/nullable/enum-membership aspect is presented under `2 SHAPE`; the presence/type aspect under `1 SYNTAX`. Where a single row covers both, it is presented as `1 SYNTAX` + `2 SHAPE`.
- The **duplicate-open-case guard** (§G4.1), **basis-is-approved-tier-verification** (§G4.6), and **reason-required** rules (§G4.3/§G4.4/§G4.7) are presented under `3 SEMANTIC` where they express a domain-meaning precondition, and remain bound to §11.2 BUSINESS as authority; quantitative/threshold business rows remain `8 BUSINESS`.

**Rationale recorded once (not per matrix):** the relabel removes the dual vocabulary (MA1) while preserving Doc-4A §11.2 as the enforcement authority; no row's rule, authority, or failure class changes; the nine-stage enforcement order is unchanged.

---

### F4G-PB1-MA2 — §G4.6 — verified-tier creation two-step lifecycle (no shortcut)

> The frozen lifecycle `pending_verification → verified → suspended → expired` is preserved. The creation sequence is made explicit: the row is created at `pending_verification` and advances to `verified` in the same transaction when an approved basis exists. No absence-of-row → verified shortcut.

**Location:** §G4.6 — **6. State Machine Enforcement**.

**Before:**

```
**6. State Machine Enforcement** — `set`: source **none** (or absence-of-row "Declared Only") → target **`verified`** (via `pending_verification → verified`, Doc-2 §3.6/§10.6) · `confirm`: source **`verified`** → **`verified`** (renew; `next_review_at` +24mo) · `downgrade`: source **`verified`** → **`verified`** at a lower `tier` band · Forbidden: operating on `suspended`/`expired` rows without re-establishment → `STATE` · Concurrency: optimistic on row revision for confirm/downgrade; UNIQUE(vendor_profile_id) guards a duplicate set → `CONFLICT`/`BUSINESS`.
```

**After:**

```
**6. State Machine Enforcement** — `set` (creation, two-step within one transaction, no shortcut): (i) the `verified_financial_tiers` row is **created at `pending_verification`** (Doc-2 §3.6/§10.6 lifecycle entry; "Declared Only" = absence of a row, so creation is the transition out of absence into `pending_verification`); (ii) **in the same transaction**, when an approved tier-verification basis exists (the `verification_record_id` is `approved` and `verification_type=tier`, validated at stage 8), the row **advances `pending_verification → verified`**. The row never appears in any intermediate persisted state outside this transaction, and there is **no absence-of-row → `verified`** edge — the authoritative path is exactly `pending_verification → verified`. · `confirm`: source **`verified`** → **`verified`** (renew; `next_review_at` +24mo) · `downgrade`: source **`verified`** → **`verified`** at a lower `tier` band · Forbidden: operating on `suspended`/`expired` rows without re-establishment → `STATE`; advancing to `verified` without an approved basis → remains at `pending_verification` (→ `BUSINESS`, stage 8) · Frozen lifecycle (unchanged): `pending_verification → verified → suspended → expired` · Concurrency: optimistic on row revision for confirm/downgrade; UNIQUE(vendor_profile_id) guards a duplicate set → `CONFLICT`/`BUSINESS`.
```

---

### F4G-PB1-M1 — §G4.2 — assign already-`in_review` → `STATE` (single authoritative behavior)

> One authoritative behavior: `requested → in_review`; an already-`in_review` case → `STATE`. Replay protection is handled **only** by the idempotency key, not by treating a re-assign as a success.

#### F4G-PB1-M1·a — §G4.2 State Machine Enforcement (clarify forbidden already-`in_review`)

**Before:**

```
**6. State Machine Enforcement** — Allowed source **`requested`** · Target **`in_review`** (Doc-2 §5.6 `requested ──assign──▶ in_review`) · Forbidden: `in_review`/`approved`/`rejected`/`expired`/`revoked` → `STATE` · Concurrency: optimistic on row revision; lost race → `CONFLICT`.
```

**After:**

```
**6. State Machine Enforcement** — Allowed source **`requested`** (only) · Target **`in_review`** (Doc-2 §5.6 `requested ──assign──▶ in_review`) · Forbidden: **`in_review`** (an already-assigned case) → `STATE`; `approved`/`rejected`/`expired`/`revoked` → `STATE` · A re-assign against an already-`in_review` case is **not** a success and **not** a no-op — it returns `STATE`. Replay of the *same* assign request is handled solely by the idempotency key (§10), never by accepting a second assign as valid. · Concurrency: optimistic on row revision; lost race → `CONFLICT`.
```

#### F4G-PB1-M1·b — §G4.2 Event Binding / Idempotency wording (remove "no-op" implication)

**Before:**

```
**8. Event Binding** — Emitted **none** (H.7) · Consumed none · Idempotency: re-assign of an already-`in_review` case is a no-op (state target idempotent).
```

**After:**

```
**8. Event Binding** — Emitted **none** (H.7) · Consumed none · Idempotency: a genuine **request replay** (same idempotency key) returns the original result without a second write (§10); a **new** assign request against an already-`in_review` case is rejected with `STATE` (§6) — it is never treated as a no-op success.
```

#### F4G-PB1-M1·c — §G4.2 Idempotency Rules (align)

**Before:**

```
**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`, H.8); `expected_revision` makes retries safe; replayed assign that already applied → same state, no duplicate audit.
```

**After:**

```
**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`, H.8). **Replay protection is the idempotency key's sole responsibility:** a replay of the *same* assign (same key) within the window returns the original result with no second write and no duplicate audit. A **distinct** assign request targeting an already-`in_review` case is **not** idempotency-absorbed — it is rejected by state enforcement with `STATE` (§6). `expected_revision` guards concurrent races on the `requested` source (lost race → `CONFLICT`).
```

---

### F4G-PB1-M2 — §G4.4 — revoke authorization model (single authority-backed rule)

> One authority-backed rule: **either** `staff_can_verify` **or** `staff_can_ban` authorizes revoke (an OR over two confirmed Doc-2 §7 platform-staff slugs). No "and/or" ambiguity; no implementer interpretation.

**Location:** §G4.4 — **5. Authorization Matrix** (and the matching Validation/Authorization rows reference this rule).

**Before:**

```
**5. Authorization Matrix** — Actor **Admin** · Slug **`staff_can_verify`** and/or **`staff_can_ban`** (Doc-2 §7 platform-staff; compliance-driven revoke may require ban authority) · Scope = platform · Delegation n/a · Enforcement `check_permission` · **If a distinct revoke-specific slug is required → `[ESC-TRUST-SLUG]`** (Doc-2 §7 additive; no slug invented).
```

**After:**

```
**5. Authorization Matrix** — Actor **Admin** · **Authorization rule = OR (either slug authorizes):** the caller MUST hold **`staff_can_verify`** OR **`staff_can_ban`** (Doc-2 §7 platform-staff slugs); holding **either** is sufficient and the operation is identical regardless of which slug authorized it (a verification-revoke and a compliance-revoke are the same state transition `approved → revoked`). Neither slug is required in combination; there is no policy gate selecting between them. · Scope = platform · Delegation n/a · Enforcement Identity `check_permission` evaluates the OR. · Both slugs are confirmed in Doc-2 §7; **no `[ESC-TRUST-SLUG]` is needed for revoke** (the marker remains available only if a future *dedicated* revoke slug is introduced to §7 — not the case today; no slug invented).
```

---

### F4G-PB1-M3 — §G4.8 — separate read-surface authority per query

> Each of the three read contracts gets its own Actor / Authorization / Scope / Visibility, so no mixed read-surface authority remains.

**Location:** §G4.8 — **5. Authorization Matrix** (expanded into three per-query records).

**Before:**

```
**5. Authorization Matrix** — *case detail / list:* Actor **Admin** · Slug **`staff_can_verify`** · Scope platform. *verified-tier badge:* public read (Doc-2 §3.6 "public badge read") via service projection (no slug; band/status only). Enforcement `check_permission` for staff reads.
```

**After:**

```
**5. Authorization Matrix (per query — independent authority):**

- **`trust.get_verification.v1`** — Actor **Admin** (platform-staff, §5.6) · Authorization **`staff_can_verify`** (Doc-2 §7) · Scope **platform** (no tenant scope) · Visibility **staff-only** — full `verification_records` + `verification_decisions`; a non-entitled caller receives `NOT_FOUND` (protected-fact collapse, §7.5).
- **`trust.list_verifications.v1`** — Actor **Admin** (platform-staff, §5.6) · Authorization **`staff_can_verify`** (Doc-2 §7) · Scope **platform** (staff queue) · Visibility **staff-only** — case summaries; allowlisted filter/sort fields only (Doc-4A §9.6); non-entitled caller → `NOT_FOUND`.
- **`trust.get_verified_tier.v1`** — Actor **internal-service / any caller via public projection** · Authorization **none** (public **badge** read, Doc-2 §3.6 "public badge read") · Scope **public** (per `vendor_profile_id`) · Visibility **public band/status only** — `tier`, `status`, `verified_at`, `next_review_at`; **no** internal `basis_jsonb`, decisions, or case detail; served by Marketplace via service projection, never table access (Doc-2 §10.6).

Enforcement: Identity `check_permission` for the two staff queries; the public verified-tier badge requires no slug and exposes band/status only. No query mutates state (CQRS).
```

---

### F4G-PB1-N1 (recommended, applied) — §H.6 — `admin tier override` mapping clarification

> Short note explaining why `admin tier override` is the nearest authoritative Doc-2 §9 mapping for verified-tier status transitions. No new audit action; no new ownership.

**Location:** §H.6 — appended to the existing bullet.

**Before:**

```
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`Admin` for staff actions; `System` for system transitions; `User` for submission), **object scope** (the `trust.*` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B write mechanism). Reads are not audited (§17.1). The **separately-enumerated** Doc-2 §9 **Trust** actions this Part binds directly are: **"verification request"**, **"verification … decision"**, **"verification … revoke"**, **"verification … expiry"**, **"admin tier override"**. Verified-tier **status transitions** (set/confirm/downgrade/suspend/expire) beyond "admin tier override", and **case assignment**, are **not** separately enumerated → carry **`[ESC-TRUST-AUDIT]`** (interim: nearest §9 Trust action by pointer; channel Doc-2 §9 additive; **no action invented**), exactly as frozen in Pass-A §G4/§G12/§G14.
```

**After:**

```
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`Admin` for staff actions; `System` for system transitions; `User` for submission), **object scope** (the `trust.*` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B write mechanism). Reads are not audited (§17.1). The **separately-enumerated** Doc-2 §9 **Trust** actions this Part binds directly are: **"verification request"**, **"verification … decision"**, **"verification … revoke"**, **"verification … expiry"**, **"admin tier override"**. Verified-tier **status transitions** (set/confirm/downgrade/suspend/expire) beyond "admin tier override", and **case assignment**, are **not** separately enumerated → carry **`[ESC-TRUST-AUDIT]`** (interim: nearest §9 Trust action by pointer; channel Doc-2 §9 additive; **no action invented**), exactly as frozen in Pass-A §G4/§G12/§G14. **Why "admin tier override" is the nearest §9 mapping (clarification, no new action):** the Doc-2 §9 Trust domain enumerates **"admin tier override"** as the staff-initiated change to a vendor's verified financial tier; the verified-tier set/confirm/downgrade/suspend transitions are precisely staff-initiated tier changes, so "admin tier override" is the closest authoritative action by meaning. It is used as the **nearest** pointer (not an exact per-transition action), which is why the residual per-transition specificity still carries `[ESC-TRUST-AUDIT]` for additive resolution — **no audit action is invented and no audit ownership changes**.
```

---

### F4G-PB1-N2 (recommended, applied) — Event Binding sections — single authoritative reference

> Reduce repetition of the "Trust never writes `marketplace.financial_tier_history`" statement; cite the authoritative location (§H.7) once and reference it. No behavior change.

#### F4G-PB1-N2·a — §G4.6 Event Binding

**Before:**

```
**8. Event Binding** — Emitted **`VendorTierChanged`** with payload `tier_type='verified'` (+ old/new tier) (Doc-2 §8 — `trust.verified_financial_tiers`) via Doc-4B outbox-write (one transaction) · **Trust never writes `marketplace.financial_tier_history`** — Marketplace consumes the event and writes the history rows + read-model band (Doc-2 §8 ownership note) · Consumed none · Consumers: Marketplace (history + matching refresh), Communication (DG-6 fan-out).
```

**After:**

```
**8. Event Binding** — Emitted **`VendorTierChanged`** with payload `tier_type='verified'` (+ old/new tier) (Doc-2 §8 — `trust.verified_financial_tiers`) via Doc-4B outbox-write (one transaction); the no-history-write rule is per §H.7 (Trust emits; Marketplace consumes and writes `marketplace.financial_tier_history` + read-model band) · Consumed none · Consumers: Marketplace (history + matching refresh), Communication (DG-6 fan-out).
```

#### F4G-PB1-N2·b — §G4.7 Event Binding

**Before:**

```
**8. Event Binding** — Emitted **`VendorTierChanged`** `tier_type='verified'` (Doc-2 §8) on both suspend and expire, via outbox-write · **Trust never writes `marketplace.financial_tier_history`** (Marketplace consumes) · Consumed: expire is a **system-timer effect** (not a Doc-2 §8 consumer); suspend may follow a compliance revoke (§G4.4) by service · Consumers: Marketplace (history/read-model), RFQ (matching refresh), Communication (DG-6).
```

**After:**

```
**8. Event Binding** — Emitted **`VendorTierChanged`** `tier_type='verified'` (Doc-2 §8) on both suspend and expire, via outbox-write; no-history-write rule per §H.7 · Consumed: expire is a **system-timer effect** (not a Doc-2 §8 consumer); suspend may follow a compliance revoke (§G4.4) by service · Consumers: Marketplace (history/read-model), RFQ (matching refresh), Communication (DG-6).
```

---

# 2. Regression Audit

| Check | Result | Evidence |
|---|---|---|
| **Contract Inventory** | **UNCHANGED** | 8 contract-record blocks / 13 contract IDs intact; no contract added/removed/split. MA1 relabels presentation; MA2/M1/M2/M3/N1/N2 edit wording only. |
| **Aggregate Ownership** | **UNCHANGED** | Verification Case + Verified Financial Tier → BC-TRUST-1; no aggregate added/moved. |
| **Lifecycle Ownership** | **UNCHANGED** | MA2 makes the `pending_verification → verified` creation path explicit (no new edge; the frozen Doc-2 §5.6/§3.6 machine is unchanged); M1 clarifies `requested → in_review` with already-`in_review` → `STATE` (frozen edge unchanged). |
| **Event Ownership** | **UNCHANGED** | `VendorVerified` / `VendorTierChanged[verified]` still Trust-emitted; N2 only de-duplicates the no-history-write prose (references §H.7); no event added/renamed; Trust still never writes `marketplace.financial_tier_history`. |
| **Permission Ownership** | **UNCHANGED** | M2 fixes the revoke rule to an OR over the two confirmed Doc-2 §7 slugs; M3 assigns per-query slugs (`staff_can_verify`) and the public badge (no slug). No slug invented/renamed. |
| **Audit Ownership** | **UNCHANGED** | N1 explains the `admin tier override` nearest-mapping; §9 bindings + `[ESC-TRUST-AUDIT]` carries unchanged; no audit action invented. |
| **Policy Ownership** | **UNCHANGED** | No POLICY key added/changed; `[ESC-TRUST-POLICY]` carries (review/dedup windows) unchanged. |
| **Trust Firewall** | **UNCHANGED** | Scores untouched (no scoring in this Part); Financial Tier never feeds a score; verified tier validates declared without owning it (PATCH-01); no Billing influence. |
| **Procurement Moat** | **UNCHANGED** | No matching/routing/ranking/evaluation/selection/award; RFQ ownership authoritative. |
| **Validation enforcement** | **UNCHANGED** | MA1 changes the Stage-column **presentation** to the canonical Pass-B vocabulary only; the Doc-4A §11.2 enforcement order and logic, and each row's authority/rule/failure-class, are unchanged. |
| **Escalation Markers** | **PRESERVED** | `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]` retained — not renamed, not removed. M2 notes ESC-TRUST-SLUG is not needed for revoke today (both slugs confirmed) but leaves the marker available; carries unchanged. |
| **No invention** | **CONFIRMED** | No contract, aggregate, bounded context, lifecycle edge, event, slug, audit action, or POLICY key introduced. |

---

*End of Doc-4G_PassB_Part1_Patch_v1.0 — applies F4G-PB1-MA1 (single canonical Pass-B nine-stage validation presentation; Doc-4A §11.2 retained as enforcement authority; dual vocabulary removed), F4G-PB1-MA2 (verified-tier creation = `pending_verification → verified` two-step in one transaction; no absence→verified shortcut; frozen lifecycle preserved), F4G-PB1-M1 (assign: already-`in_review` → `STATE`; replay protection is the idempotency key's sole job), F4G-PB1-M2 (revoke authorization = OR over `staff_can_verify` / `staff_can_ban`; no ambiguity), F4G-PB1-M3 (per-query Actor/Authorization/Scope/Visibility for the three reads), F4G-PB1-N1 (`admin tier override` nearest-mapping clarification), F4G-PB1-N2 (event-binding no-history-write de-duplicated to §H.7). Surgical/contract-level only; contract inventory, aggregate/lifecycle/event/permission/audit/policy ownership, trust firewall, and procurement moat preserved; escalation markers preserved; nothing invented. Canonical input: `Doc-4G_PassB_Part1_BC-TRUST-1_Verification_v1.0.md` as amended by this patch.*
