# Doc-4I — Billing / Monetization Engine — Pass-B (Hardening) Part 1 v1.0 — BC-BILL-1 Plans & Entitlements

| Field | Value |
|---|---|
| Document | Doc-4I — **Pass-B Part 1 v1.0** — Module 7 Billing (`billing` schema, `billing_` namespace) |
| Part scope | **BC-BILL-1 — Plans & Entitlements** — the frozen Pass-A §A4.1 contracts (Plan + Entitlement aggregates), hardened to implementation grade. |
| Status | **Pass-B Part 1 draft — implementation-grade contract specification for BC-BILL-1.** Independently reviewable. Suitable for Hard Review → Patch → Patch Verification → Freeze Audit. |
| Contract authority | `Doc-4I_PassA_Content_v1.0` (FROZEN; sole contract authority; **not revisited, not redesigned, not reopened**) |
| Structure authority | `Doc-4I_Structure_v1.0` (FROZEN) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G v1.0, Doc-4H v1.0, Doc-4I_Structure_v1.0, Doc-4I_PassA_Content_v1.0 — all FROZEN |
| Part scope (this Part) | `billing.create_plan.v1` · `billing.update_plan.v1` · `billing.retire_plan.v1` · `billing.bundle_plan_entitlement.v1` · `billing.create_entitlement.v1` · `billing.update_entitlement.v1` · `billing.get_plan.v1` · `billing.list_plans.v1` |
| Audience | Claude Code / Cursor / OpenAI Codex / backend / frontend / QA — **implementation-ready, no architecture interpretation required** |

**Pass-B mission (Part 1).** Convert the frozen Pass-A BC-BILL-1 contracts into **implementation-grade** contracts: field-level inputs/outputs, per-field validation matrices on the Doc-4A §11.2 nine-stage order, authorization, processing, audit bindings, event bindings, error registers (Doc-4A §12 closed class set), dependencies. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed; ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A. **Monetization neutrality** is preserved: Billing meters/charges, **never decides** procurement (no routing/matching/ranking/supplier-selection/award) and computes/owns **no** Trust/Performance/Verification/Governance score. **BC-BILL-1 owns the Plan and Entitlement aggregates only** — no subscription, usage/quota, lead-credit, platform-invoice, or reward ownership. Carried markers **DF-BILL-7, DF-BILL-8** (the BC-BILL-1 seams) and **`[ESC-BILL-AUDIT]`, `[ESC-BILL-POLICY]`, `[ESC-BILL-SLUG]`, `[ESC-BILL-EVENT]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt**.

**Recorded reconciliation — Part-1 inventory (no Flag-and-Halt breach; frozen Pass-A governs).** The Part-1 authoring brief listed eight contracts and (a) **omitted** `billing.retire_plan.v1` and `billing.bundle_plan_entitlement.v1` and (b) **added** `billing.get_entitlement.v1` / `billing.list_entitlements.v1`. The **frozen authority** `Doc-4I_PassA_Content_v1.0` §A4.1 / A12 fixes the BC-BILL-1 set as the **nine** contract-IDs hardened here — `create_plan`/`update_plan`/`retire_plan`, `bundle_plan_entitlement`, `create_entitlement`/`update_entitlement`, `get_plan`/`list_plans` — where the read pair `get_plan`/`list_plans` ("Plan/Entitlement Reads") **already serves both plan catalog and entitlement definitions** (Pass-A §A4.1: "read the public plan catalog / entitlement definitions"). Therefore the frozen Pass-A set governs: `retire_plan` and `bundle_plan_entitlement` are hardened (they exist in the frozen inventory); `get_entitlement`/`list_entitlements` are **not** authored (no such contract-ID exists in the frozen inventory — entitlement reads are the `get_plan`/`list_plans` pair; authoring them would invent contracts). No contract invented; no frozen contract omitted. *(Confirmed with the user before authoring.)*

---

## §H — Part-1 Hardening Conventions (stated once; bound by pointer per contract)

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) precedes semantic processing (6–9). Each Validation row names the **Authority**, the **Validation** (rule), and the **Failure Class** (error class from H.4). **Query contracts: Stage 8 BUSINESS is present** — where no business rule applies, stated exactly `n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract`.
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source), `string`, `text`, `numeric`, `bool`, `jsonb` (opaque structured payload — Pass-B fixes presence/shape boundary, not internal field schema), `timestamptz`. **Required** = MUST be present and non-null (absence → SYNTAX failure, Doc-4A §9). **Nullable** stated per field.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR §6B delegation (stage 5). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement = Identity `check_permission` (Doc-4C; no shadow authorization). **BC-BILL-1 is the platform-owned catalog** — plan/entitlement mutation is a **platform-staff (Admin, §5.6, no active org context)** action; **Doc-2 §7 enumerates no tenant catalog-management slug → `[ESC-BILL-SLUG]`** (no slug invented). Catalog **reads** are public-readable for plan selection (`[ESC-BILL-SLUG]` if a distinct read slug is later required). Catalog management is **not delegation-eligible** (platform-staff action; no representative-org scenario).
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes follow **`billing_<domain>_<code>`** (Appendix B namespace `billing_`); numeric codes are development-document scope — Pass-B fixes the **class + trigger + retryable**. **`REFERENCE` (a supplied reference does not exist / definitive negative; `retryable:false`) is distinct from `DEPENDENCY` (an owning service transiently unavailable; `retryable:true`)**; **`STATE` (operation illegal from current state) is distinct from `CONFLICT` (optimistic-concurrency lost race)** — never merged (Doc-4A §12.2/§12.4; FROZEN Doc-4F/4H convention).
- **H.5 — State machine (Doc-2 §3.8/§10.8; Doc-4A §13).** The BC-BILL-1 lifecycles are: **`plans` → `draft → active → retired`** (Doc-2 §3.8; `retired` terminal); **`entitlements` → simple** (catalog; no status machine); **`plan_entitlements` → simple** (mapping; no status machine). Every transition cites allowed **source state(s)**, the **target state**, and **forbidden source states** (all others → `STATE`). Concurrency: optimistic — a plan mutation asserts `expected_status`/row-version; a lost race → `CONFLICT` (Doc-4A §14). **No edge added or modified.**
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`Admin`), **object scope** (the `billing.*` row), **timing** (same transaction as the write — Doc-2 §10.11.4), and **source authority**. Reads not audited (§17.1). **Doc-2 §9 enumerates no separate Billing plan/entitlement catalog audit domain** → every BC-BILL-1 mutation carries **`[ESC-BILL-AUDIT]`** (nearest enumerated §9 action by pointer; Doc-2 §9 additive; **no audit action invented**), exactly as frozen in Pass-A §A8.
- **H.7 — Events (Doc-2 §8).** **BC-BILL-1 emits NO Doc-2 §8 domain event** and **consumes none** (Pass-A §A5; single-authorship Doc-4A §4.4; Doc-4A §16.4 — no event coined). The three Billing §8 events (`SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired`) are **BC-BILL-2's**, not BC-BILL-1's. Where a contract emits nothing, **No Event** is the binding (valid). No 21.2 integration contract authored.
- **H.8 — POLICY (Doc-3 §12.2; Doc-4A §18).** **Doc-3 §12.2 registers no `billing.*` POLICY namespace** → any BC-BILL-1 runtime tunable (page-size for list, plan-retirement guard window) carries **`[ESC-BILL-POLICY]`** (reference an existing key by name if one applies; **no key invented**).
- **H.9 — Ownership & boundary (Doc-2 §2/§10.8; Doc-4A §4.1).** BC-BILL-1 owns the **Plan** aggregate (`plans` + `plan_entitlements`) and the **Entitlement** aggregate (`entitlements`) — **platform-owned catalog**. **No ownership leakage:** BC-BILL-1 owns **no** subscription (BC-BILL-2), usage/quota (BC-BILL-3), lead-credit (BC-BILL-4), platform-invoice (BC-BILL-5), or reward (BC-BILL-6) entity. Entitlement **definitions** live here; entitlement **resolution** (per-org effective entitlements) is BC-BILL-2's authority — BC-BILL-1 defines, never resolves org state. **Moat:** no catalog action influences routing/matching/ranking/supplier-selection/award. **Firewall:** BC-BILL-1 computes/owns no Trust/Performance/Verification/Governance score.
- **H.10 — `billing` BC-BILL-1 field source (Doc-2 §10.8).** The hardened schemas bind to the frozen Doc-2 §10.8 columns; **Pass-B introduces no column**:
  - `plans`: `name`, `billing_cycle enum<monthly|annual>`, `price numeric`, `currency`, `is_active bool` (marketing configuration); status `draft|active|retired`.
  - `entitlements`: `slug UNIQUE`, `type enum<boolean|numeric|enum>`, `default_value`.
  - `plan_entitlements`: PK (`plan_id`, `entitlement_id`); `value_jsonb`.

**Per-contract record shape (Pass-B — Part-1 brief format).** Each contract below is recorded in 12 sections: **1 Contract Header · 2 Purpose · 3 Authority · 4 Preconditions · 5 Inputs · 6 Validation · 7 Processing · 8 Events · 9 Audit · 10 Outputs · 11 Errors · 12 Dependencies.**

---

## §HB-1.1 — `billing.create_plan.v1` · `billing.update_plan.v1` · `billing.retire_plan.v1` — Plan Catalog

**1. Contract Header** — Contract IDs `billing.create_plan.v1`, `billing.update_plan.v1`, `billing.retire_plan.v1` · Owning BC **BC-BILL-1** · Aggregate **Plan** (`plans`) · Operation **21.6 Admin** · Actor **Admin** (platform-staff, no active org context — §5.6).

**2. Purpose** — Create a commercial plan at `draft` / update plan marketing configuration / retire a plan (`active → retired`). Plans are **platform-owned marketing configuration** (name, billing cycle, price, currency); they confer no entitlement until bundled (§HB-1.2) and resolve no org state.

**3. Authority** — Permission family: platform-staff catalog management — **no enumerated Doc-2 §7 slug → `[ESC-BILL-SLUG]`** (no slug invented). Enforcement: Identity `check_permission` (Doc-4C; platform-staff context, §5.6). Not delegation-eligible (H.3).

**4. Preconditions** — Actor is platform-staff (Admin) in a valid platform context. For `update`/`retire`: the target `plan_id` exists. For `retire`: the plan is `active` (or `draft`); `retired` is terminal.

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `plan_id` | `uuid` | yes for update/retire; n/a for create | Doc-2 §10.8 | target plan (update/retire) |
| `name` | `string` | yes for create | Doc-2 §10.8 | plan display name |
| `billing_cycle` | `enum<monthly\|annual>` | yes for create | Doc-2 §10.8 | fixed enum |
| `price` | `numeric` | yes for create | Doc-2 §10.8 | ≥ 0 |
| `currency` | `string` | yes for create | Doc-2 §10.8 | ISO currency |
| `is_active` | `bool` | no | Doc-2 §10.8 | marketing-visibility flag |
| `expected_status` | `enum<draft\|active\|retired>` | yes for retire/update | Doc-4A §14 | optimistic-concurrency assertion |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `billing_cycle` ∈ enum; `price` ≥ 0; `plan_id` uuid (update/retire) | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§5.6 | actor is platform-staff (Admin); valid platform context | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7; Doc-4A §6 | catalog-management authority — **`[ESC-BILL-SLUG]`** (no §7 slug enumerated; no slug invented) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | platform scope (catalog is platform-owned; no tenant org scope) | `AUTHORIZATION` |
| 5 DELEGATION | Doc-4A §6B | n/a — catalog management not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.8 | create: no prior state (enters `draft`); update: `draft`/`active`; retire: `active`/`draft` → `retired` (forbidden from `retired` → `STATE`); optimistic `expected_status` mismatch → `CONFLICT` | `STATE` / `CONFLICT` |
| 7 REFERENCE | Doc-4A §4.5 | update/retire: `plan_id` resolves (definitive vs transient) | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §11.2 | plan marketing configuration carries no procurement/business decision (meters/charges, never decides — moat); no business rule beyond state/scope applies | — |
| 9 POLICY | Doc-3 §12.2 | none (a plan-retirement guard window, if later required, carries `[ESC-BILL-POLICY]`) | — |

**7. Processing** — create: insert `plans` at `draft`. update: mutate marketing fields (name/cycle/price/currency/is_active) under optimistic concurrency. retire: transition `active`/`draft` → `retired` (terminal). All in one transaction with the audit write. No entitlement bundle altered here (§HB-1.2).

**8. Events** — **No Event** (H.7 — BC-BILL-1 emits no Doc-2 §8 event; consumes none). Ownership: n/a.

**9. Audit** — Audit trigger: plan create / update / retire · Audit owner: Billing · Escalation marker: **`[ESC-BILL-AUDIT]`** (Doc-2 §9 enumerates no Billing catalog action; nearest by pointer; **no action invented**) · Required record: attribution `Admin`, `entity_type=plans`, `entity_id`, action, timestamp via Doc-4B `core.append_audit_record.v1` (in-transaction).

**10. Outputs** — **Success:** `plan_id : uuid`, `status : enum<draft|active|retired>`, `reference_id : uuid` (Doc-4A §22.1). **Failure:** Doc-4A §12 envelope (`error_class, error_code, message, field_errors, retryable, reference_id`).

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad enum/price; missing `plan_id` on update/retire) | false |
| `AUTHORIZATION` | actor not platform-staff / catalog authority fails (`[ESC-BILL-SLUG]`) | false |
| `STATE` | illegal transition (e.g., retire a `retired` plan) | false |
| `CONFLICT` | optimistic-concurrency lost race (`expected_status` mismatch) | false |
| `REFERENCE` | `plan_id` does not resolve (update/retire; definitive) | false |
| `DEPENDENCY` | Identity/Doc-4B transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary (Doc-4A §12.4):** `STATE` (illegal transition) ≠ `CONFLICT` (lost race); `REFERENCE` (plan not found) ≠ `DEPENDENCY` (service transient) — never merged.

**12. Dependencies** — **Admin (DF-BILL-7):** plan-catalog governance (carried pending Doc-4J). **Platform Core (DF-BILL-8):** audit-write, UUIDv7, POLICY. **No subscription/usage/invoice/reward dependency; no procurement decision (moat); no Trust score (firewall). No ownership transfer.**

---

## §HB-1.2 — `billing.bundle_plan_entitlement.v1` — Plan→Entitlement Bundle

**1. Contract Header** — Contract ID `billing.bundle_plan_entitlement.v1` · Owning BC **BC-BILL-1** · Aggregate **Plan** (`plan_entitlements`) · Operation **21.6 Admin** · Actor **Admin** (platform-staff, §5.6).

**2. Purpose** — Map a plan to its entitlement bundle (`plan_entitlements`; PK `plan_id`+`entitlement_id`; `value_jsonb`) — defines which entitlements (and values) a plan confers. Definition only; resolves no org state.

**3. Authority** — Catalog-management authority — **`[ESC-BILL-SLUG]`** (no §7 slug; no slug invented). Enforcement Identity `check_permission` (platform-staff). Not delegation-eligible.

**4. Preconditions** — Actor is platform-staff. The `plan_id` and `entitlement_id` both exist (BC-BILL-1 catalog).

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `plan_id` | `uuid` | yes | Doc-2 §10.8 | PK component; resolves to a `plans` row |
| `entitlement_id` | `uuid` | yes | Doc-2 §10.8 | PK component; resolves to an `entitlements` row |
| `value_jsonb` | `jsonb` | yes | Doc-2 §10.8 | bundle value (presence/shape only at Pass-B) |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `plan_id`/`entitlement_id` uuid; `value_jsonb` present | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.6 | actor is platform-staff (Admin) | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | catalog authority — `[ESC-BILL-SLUG]` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | platform scope (catalog) | `AUTHORIZATION` |
| 5 DELEGATION | Doc-4A §6B | n/a (not delegation-eligible) | — |
| 6 STATE | Doc-2 §3.8 | `plan_entitlements` simple (mapping; no status machine); duplicate PK is idempotent, not a new row | — |
| 7 REFERENCE | Doc-4A §4.5 | `plan_id` and `entitlement_id` both resolve in the BC-BILL-1 catalog (definitive vs transient) | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §11.2 | bundle definition carries no procurement/business decision (moat); no business rule beyond reference/scope | — |
| 9 POLICY | Doc-3 §12.2 | none | — |

**7. Processing** — upsert the `plan_entitlements` row (PK `plan_id`+`entitlement_id`; `value_jsonb`) in one transaction with the audit write.

**8. Events** — **No Event** (H.7).

**9. Audit** — Trigger: plan→entitlement bundle change · owner Billing · **`[ESC-BILL-AUDIT]`** (no §9 catalog action; nearest by pointer; no action invented) · `entity_type=plan_entitlements`, `entity_id` (PK), via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `plan_id : uuid`, `entitlement_id : uuid`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad ids; missing `value_jsonb`) | false |
| `AUTHORIZATION` | not platform-staff / `[ESC-BILL-SLUG]` fails | false |
| `REFERENCE` | `plan_id` or `entitlement_id` does not resolve (definitive) | false |
| `DEPENDENCY` | Doc-4B/Identity transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** `REFERENCE` (id not found) ≠ `DEPENDENCY` (transient).

**12. Dependencies** — **Platform Core (DF-BILL-8):** audit-write, UUIDv7. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-1.3 — `billing.create_entitlement.v1` · `billing.update_entitlement.v1` — Entitlement Catalog

**1. Contract Header** — Contract IDs `billing.create_entitlement.v1`, `billing.update_entitlement.v1` · Owning BC **BC-BILL-1** · Aggregate **Entitlement** (`entitlements`) · Operation **21.6 Admin** · Actor **Admin** (platform-staff, §5.6).

**2. Purpose** — Define / update an entitlement slug in the catalog (`slug UNIQUE`; `type` boolean/numeric/enum; `default_value`). The entitlement **definition** only — per-org resolution is BC-BILL-2's authority.

**3. Authority** — Catalog-management authority — **`[ESC-BILL-SLUG]`** (no §7 slug; no slug invented). Enforcement Identity `check_permission` (platform-staff). Not delegation-eligible.

**4. Preconditions** — Actor is platform-staff. For `update`: the target `entitlement_id` exists. `slug` is unique across the catalog.

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `entitlement_id` | `uuid` | yes for update; n/a for create | Doc-2 §10.8 | target entitlement (update) |
| `slug` | `string` | yes for create | Doc-2 §10.8 | **UNIQUE** across catalog |
| `type` | `enum<boolean\|numeric\|enum>` | yes for create | Doc-2 §10.8 | fixed enum |
| `default_value` | `jsonb` | no | Doc-2 §10.8 | default per type (presence/shape only) |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `type` ∈ enum; `entitlement_id` uuid (update) | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.6 | actor is platform-staff (Admin) | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | catalog authority — `[ESC-BILL-SLUG]` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | platform scope (catalog) | `AUTHORIZATION` |
| 5 DELEGATION | Doc-4A §6B | n/a (not delegation-eligible) | — |
| 6 STATE | Doc-2 §3.8 | `entitlements` simple (catalog; no status machine); update under optimistic concurrency → `CONFLICT` on lost race | `CONFLICT` |
| 7 REFERENCE | Doc-4A §4.5 | update: `entitlement_id` resolves (definitive vs transient) | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-4A §11.2 | `slug` UNIQUE constraint (duplicate slug → `BUSINESS`); entitlement definition carries no procurement decision (moat) | `BUSINESS` |
| 9 POLICY | Doc-3 §12.2 | none | — |

**7. Processing** — create: insert `entitlements` (`slug`/`type`/`default_value`; enforce `slug` UNIQUE). update: mutate `type`/`default_value` under optimistic concurrency. One transaction with the audit write.

**8. Events** — **No Event** (H.7).

**9. Audit** — Trigger: entitlement create / update · owner Billing · **`[ESC-BILL-AUDIT]`** (no §9 catalog action; nearest by pointer; no action invented) · `entity_type=entitlements`, `entity_id`, via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `entitlement_id : uuid`, `slug : string`, `type : enum<boolean|numeric|enum>`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad type; missing slug on create) | false |
| `AUTHORIZATION` | not platform-staff / `[ESC-BILL-SLUG]` fails | false |
| `BUSINESS` | `slug` not unique (duplicate catalog slug) | false |
| `CONFLICT` | optimistic-concurrency lost race (update) | false |
| `REFERENCE` | `entitlement_id` does not resolve (update; definitive) | false |
| `DEPENDENCY` | Doc-4B/Identity transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** `BUSINESS` (duplicate slug) ≠ `VALIDATION` (malformed); `STATE`/`CONFLICT` separated; `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Platform Core (DF-BILL-8):** audit-write, UUIDv7. **No subscription/quota dependency; no procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-1.4 — `billing.get_plan.v1` · `billing.list_plans.v1` — Plan / Entitlement Reads

**1. Contract Header** — Contract IDs `billing.get_plan.v1`, `billing.list_plans.v1` · Owning BC **BC-BILL-1** · Aggregate **Plan / Entitlement** · Operation **21.3 Query** · Actor **User / Admin**.

**2. Purpose** — Read the public plan catalog and entitlement definitions (for plan selection). Serves both plan catalog and entitlement-definition reads (Pass-A §A4.1 "Plan/Entitlement Reads"). Read-only; resolves no org-specific entitlement (that is BC-BILL-2).

**3. Authority** — Catalog is **platform-owned, public-readable for plan selection**; no distinct Doc-2 §7 read slug enumerated → **`[ESC-BILL-SLUG]`** if a distinct read slug is later required (no slug invented). Enforcement Identity `check_permission` where a scope applies.

**4. Preconditions** — None beyond a valid caller context; the catalog is public-readable.

**5. Inputs** — *`get_plan`:* `plan_id : uuid (required)`. *`list_plans`:* `filter : object{ billing_cycle?, is_active?, status? } (optional; allowlisted fields only, Doc-4A §9.6)`; `page_size : numeric (optional; bounded by POLICY — `[ESC-BILL-POLICY]`)`; `page_token : string (optional; Doc-4A §22.3)`.

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; only allowlisted filter fields; `plan_id` uuid (get) | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | valid caller context | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | catalog read — public for plan selection (`[ESC-BILL-SLUG]` if a distinct slug is later required) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | catalog is platform-owned (no tenant scoping on public catalog) | — |
| 5 DELEGATION | Doc-4A §6B | n/a (read) | — |
| 6 STATE | Doc-2 §3.8 | none (read) | — |
| 7 REFERENCE | Doc-4A §4.5 | get: `plan_id` resolves else `NOT_FOUND` | `NOT_FOUND` |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-BILL-POLICY]`) | `VALIDATION` |

**7. Processing** — get: fetch the `plans` row (+ its `plan_entitlements`/entitlement definitions) by `plan_id`. list: enumerate the catalog with allowlisted filters + pagination. Read-only; no state change.

**8. Events** — **No Event** (reads emit/consume none).

**9. Audit** — **None** (reads not audited — Doc-4A §17.1).

**10. Outputs** — **Success:** *`get_plan`:* `plan : object{ plan_id, name, billing_cycle, price, currency, status, is_active, entitlements:list<object{ entitlement_id, slug, type, value }> }`, `reference_id`. *`list_plans`:* `items : list<object{ plan_id, name, billing_cycle, price, currency, status }>`, `next_page_token : string (nullable)`, `reference_id`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad filter; `page_size` out of bound) | false |
| `NOT_FOUND` | `plan_id` does not resolve (get) | false |
| `DEPENDENCY` | Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** a non-existent `plan_id` is `NOT_FOUND` (public catalog; no protected-fact collapse needed — catalog is public). `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Platform Core (DF-BILL-8):** read infrastructure, POLICY (page-size). **No ownership transfer; no procurement decision (moat); no Trust score (firewall).**

---

## Appendix A — BC-BILL-1 Part-1 Contract Register (Pass-B)

| § | Contract-ID | Operation | Aggregate | Actor | Permission | Emits event | Audit |
|---|---|---|---|---|---|---|---|
| §HB-1.1 | `billing.create_plan.v1` · `billing.update_plan.v1` · `billing.retire_plan.v1` | 21.6 Admin | Plan (`plans`) | Admin | `[ESC-BILL-SLUG]` | No Event | `[ESC-BILL-AUDIT]` |
| §HB-1.2 | `billing.bundle_plan_entitlement.v1` | 21.6 Admin | Plan (`plan_entitlements`) | Admin | `[ESC-BILL-SLUG]` | No Event | `[ESC-BILL-AUDIT]` |
| §HB-1.3 | `billing.create_entitlement.v1` · `billing.update_entitlement.v1` | 21.6 Admin | Entitlement (`entitlements`) | Admin | `[ESC-BILL-SLUG]` | No Event | `[ESC-BILL-AUDIT]` |
| §HB-1.4 | `billing.get_plan.v1` · `billing.list_plans.v1` | 21.3 Query | Plan / Entitlement | User / Admin | `[ESC-BILL-SLUG]` (public read) | No Event | none (read) |

**Part-1 invariants (held):** the hardened contracts are the verbatim frozen Pass-A §A4.1 set — `create_plan`/`update_plan`/`retire_plan`, `bundle_plan_entitlement`, `create_entitlement`/`update_entitlement`, `get_plan`/`list_plans` (no contract added/renamed; `get_entitlement`/`list_entitlements` not authored — the read pair serves entitlement definitions); BC-BILL-1 owns the **Plan and Entitlement aggregates only** (no subscription/usage/quota/invoice/reward ownership); **emits zero Doc-2 §8 events** and consumes none (the three subscription events are BC-BILL-2's — single-authorship); binds **no invented slug** (`[ESC-BILL-SLUG]` for the platform-owned catalog — Doc-2 §7 enumerates no catalog slug); every mutation carries `[ESC-BILL-AUDIT]` (Doc-2 §9 enumerates no Billing catalog action; no action invented); lifecycles are exactly `plans draft→active→retired` and `entitlements`/`plan_entitlements` simple (no state invented); `STATE ≠ CONFLICT` and `REFERENCE ≠ DEPENDENCY` separated; **the procurement moat holds** (no catalog action influences routing/matching/ranking/supplier-selection/award) and **the trust firewall holds** (no Trust/Performance/Verification/Governance score). **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.**

---

## Appendix B — Carried Markers (Part 1; unchanged)

- **DF-BILL-7** (Admin — plan-catalog/governance, carried pending Doc-4J), **DF-BILL-8** (Platform Core — audit-write, UUIDv7, POLICY).
- **`[ESC-BILL-AUDIT]`** (Doc-2 §9 additive) — every BC-BILL-1 mutation (plan create/update/retire, bundle, entitlement create/update): Doc-2 §9 enumerates no Billing catalog action; nearest action bound by pointer; no action invented.
- **`[ESC-BILL-SLUG]`** (Doc-2 §7 additive) — BC-BILL-1 is the platform-owned catalog; Doc-2 §7 enumerates no catalog-management or catalog-read slug; carried; no slug invented.
- **`[ESC-BILL-POLICY]`** (Doc-3 §12.2 additive) — list `page_size` bound, plan-retirement guard window (if later required); no `billing` POLICY namespace registered; no key invented.
- **`[ESC-BILL-EVENT]`** (Doc-2 §8 additive) — BC-BILL-1 produces no §8 event; carried for the module.

**Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Pass-A or this Part.

---

*End of Doc-4I — Pass-B (Hardening) Part 1 v1.0 — BC-BILL-1 Plans & Entitlements. Authored against `Doc-4I_PassA_Content_v1.0` (FROZEN; sole contract authority) and `Doc-4I_Structure_v1.0` (FROZEN). Hardens the frozen Pass-A §A4.1 set — `create_plan`/`update_plan`/`retire_plan`, `bundle_plan_entitlement`, `create_entitlement`/`update_entitlement`, `get_plan`/`list_plans` — to implementation grade (field-level inputs/outputs, Doc-4A §11.2 nine-stage validation, processing, audit bindings, event bindings, error registers with §12.4 boundaries + REFERENCE/DEPENDENCY + STATE/CONFLICT separation, dependencies) — no entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. BC-BILL-1 owns the Plan and Entitlement aggregates only; emits no Doc-2 §8 domain event and consumes none (the three subscription events are BC-BILL-2's — single-authorship); the lifecycles are exactly `plans draft→active→retired` and `entitlements`/`plan_entitlements` simple; catalog management is platform-staff (Admin) under `[ESC-BILL-SLUG]` (no slug invented); every mutation carries `[ESC-BILL-AUDIT]`; the procurement moat (no catalog action influences routing/matching/ranking/supplier-selection/award) and the trust firewall (no score owned/computed/modified) are preserved; Billing meters/charges, never decides; nothing invented. Reconciliation: the brief's eight-item list (omitting `retire_plan`/`bundle_plan_entitlement`, adding `get_entitlement`/`list_entitlements`) was reconciled to the frozen Pass-A nine-ID set per the user's confirmation — frozen Pass-A governs. Carried markers DF-BILL-7/DF-BILL-8, `[ESC-BILL-AUDIT]`/`[ESC-BILL-SLUG]`/`[ESC-BILL-POLICY]`/`[ESC-BILL-EVENT]` travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Suitable for: Hard Review → Patch → Patch Verification → Freeze Audit → FROZEN.*
