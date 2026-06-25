# Doc-4I — Additive Patch: `billing.activate_plan.v1` (BC-BILL-1) v1.0

| Field | Value |
|---|---|
| Patch | Doc-4I Additive Patch — `billing.activate_plan.v1` |
| Type | **Additive contract** (new §HB-1.1a, BC-BILL-1). Frozen `Doc-4I_FROZEN_v1.0` is **not edited in place** — this patch layers on top |
| Authorizes | Realization of the `Doc-2 §3.8` plans `draft → active` edge, which had **no realizing Doc-4I contract** (`[ESC-BILL-ACTIVATE]` gap) |
| Disposition | **Board Gate 2 → Option A (human-approved):** "additive `activate_plan` contract … explicit owner for `draft → active` … keeps lifecycle transitions auditable" (`Doc-5I_ESC_Board_Escalation_v1.0.md`) |
| Approval | **HUMAN-APPROVED** (board/approver). Architecture-affecting; CLAUDE.md §8 satisfied. To be folded into the corpus index (`CORPUS_INDEX.md` / `00_AUTHORITY_MAP.md`) under architecture governance |
| Conforms to | `Doc-2 §3.8` (plans machine — edge already mandated, none added), `Doc-4A §21` (Pass-B 12-section shape), `Doc-4I §H` Part-1 hardening conventions (§HB-1.1 sibling) |
| Invariants | No new module; no ownership change; no governance-signal change; no event coined (`Doc-2 §8` unchanged — BC-BILL-1 still emits nothing); firewall/moat intact |

> **Why additive, not a redecision.** The `draft → active` edge is **already** in the frozen `Doc-2 §3.8` plans machine. Doc-4I §HB-1.1 realized `create → draft` and `retire → retired` but left `draft → active` unattributed. This patch supplies the **explicit owning contract** for that existing edge — DDD lifecycle ownership, auditable — without modifying any existing contract or edge.

---

## §HB-1.1a — `billing.activate_plan.v1` — Activate (Publish) Plan

**1. Contract Header** — Contract ID `billing.activate_plan.v1` · Owning BC **BC-BILL-1** · Aggregate **Plan** (`plans`) · Operation **21.6 Admin** · Actor **Admin** (platform-staff, §5.6).

**2. Purpose** — Transition a plan `draft → active` (publish to the catalog). Platform-owned marketing configuration; confers no entitlement of itself (entitlements via §HB-1.2 bundle). Explicit lifecycle owner for the `Doc-2 §3.8` `draft → active` edge.

**3. Authority** — Catalog-management — **`[ESC-BILL-SLUG]`** (no Doc-2 §7 catalog slug; no slug invented; same authority as §HB-1.1). Enforcement Identity `check_permission` (platform-staff). Not delegation-eligible.

**4. Preconditions** — Actor platform-staff (Admin). `plan_id` exists and is `draft` (`active`/`retired` are not valid sources).

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `plan_id` | `uuid` | yes | Doc-2 §10.8 | target plan |
| `expected_status` | `enum<draft>` | yes | Doc-4A §14 | optimistic-concurrency assertion (must be `draft`) |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `plan_id` uuid; `expected_status` = `draft` | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.6 | actor is platform-staff (Admin); valid platform context | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | catalog-management authority — `[ESC-BILL-SLUG]` (no slug invented) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | platform scope (catalog platform-owned; no tenant org scope) | `AUTHORIZATION` |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible | — |
| 6 STATE | Doc-2 §3.8 | `draft → active`; forbidden from `active`/`retired` → `STATE`; `expected_status` mismatch → `CONFLICT` | `STATE` / `CONFLICT` |
| 7 REFERENCE | Doc-4A §4.5 | `plan_id` resolves | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-4A §11.2 | activation carries no procurement/business decision (moat); no rule beyond state/scope | — |
| 9 POLICY | Doc-3 §12.2 | none | — |

**7. Processing** — transition `plans.status` `draft → active` under optimistic concurrency (`expected_status`). One transaction with the audit write; no entitlement bundle altered, no `is_active` (marketing-visibility) coupling.

**8. Events** — **No Event** (H.7 — BC-BILL-1 emits no `Doc-2 §8` event; activation is not a §8 domain event; `Doc-2 §8` catalog unchanged).

**9. Audit** — Trigger: plan activation · owner Billing · **`[ESC-BILL-AUDIT]`** (plan activation not separately enumerated in Doc-2 §9; nearest by pointer; no action invented) · `entity_type=plans`, `entity_id`, attribution `Admin`, via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `plan_id : uuid`, `status : enum<draft|active|retired> = active`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (`expected_status` ≠ `draft`) | false |
| `AUTHORIZATION` | actor not platform-staff / `[ESC-BILL-SLUG]` | false |
| `STATE` | source not `draft` (e.g. already `active`/`retired`) | false |
| `CONFLICT` | optimistic-concurrency lost race (`expected_status` mismatch) | false |
| `REFERENCE` | `plan_id` does not resolve (definitive) | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary (§12.4):** `STATE` (illegal source) ≠ `CONFLICT` (lost race); `REFERENCE` (plan not found) ≠ `DEPENDENCY`.

**12. Dependencies** — **Admin (DF-BILL-7):** catalog governance (`[ESC-BILL-SLUG]`). **Platform Core (DF-BILL-8):** audit-write, UUIDv7. **No procurement decision (moat); no Trust score (firewall); no ownership transfer; no event.**

---

## Partition impact

- **BC-BILL-1:** 8 → **9** caller-facing (add `activate_plan` to the `POST` catalog commands).
- **Doc-4I total:** 32 → **33** contracts (27 caller-facing + 6 out-of-wire).
- **Plans machine (Doc-2 §3.8) realization (now complete):** `create_plan → draft`; **`activate_plan → active` (this patch)**; `retire_plan → retired`. `update_plan` = marketing-config mutation only (no status edge); `is_active` = marketing-visibility bool (≠ status).

## Carried-item closure

- **`[ESC-BILL-ACTIVATE]` → RESOLVED** by this additive contract (the `draft → active` edge now has an explicit owning contract; no lifecycle body field; auditable).

---

*Additive Doc-4I patch, human-approved (Board Gate 2 → Option A). Frozen `Doc-4I_FROZEN_v1.0` is not edited in place. Fold into `CORPUS_INDEX.md` / `00_AUTHORITY_MAP.md` under architecture governance. Doc-5I realizes this contract in §4 (`POST /billing/plans/{plan_id}/activate-plan`).*
