# Doc-5I — Monetization / Billing (M7 `billing`) API Realization — Content v1.0 Pass-2

| Field | Value |
|---|---|
| Document | Doc-5I Content v1.0 Pass-2 |
| Status | **Pass-2 patched (Hard Review v1.0: 5 BLOCKER · 4 MAJOR · 4 MINOR · 3 NITPICK resolved)** |
| Pass-2 scope | §4 BC-BILL-1 Plans & Entitlements (8 contracts) · §5 BC-BILL-2 Subscriptions (4 contracts) · §6 BC-BILL-3 Usage & Quota (1 contract) |
| Builds on | `Doc-5I_Content_v1.0_Pass1.md` (patched) — §3 binding registers govern all disclosure scopes + actor sides below |
| Structure anchor | `Doc-5I_Structure_v1.0_FROZEN.md` — partition table is authoritative |
| Authority | `Doc-5A_SERIES_FROZEN_v1.0`; `Doc-4I_FROZEN_v1.0`; `Doc-5I_Structure_v1.0_FROZEN.md` |
| Pass-3 will cover | §7 BC-BILL-4 · §8 BC-BILL-5 · §9 BC-BILL-6 · §10 Out-of-Wire · §11 Conformance · Appendix A |

> **Cross-cutting wire rules (§3) apply in full to all sections below. Not restated. Actor model → §3.1; `check_permission` → §3.2; billing firewall → §3.3; state machine authorities → §3.4; non-disclosure `NOT_FOUND` → §3.5; disclosure scopes → §3.6; actor sides → §3.7; error-class→status map → §3.8; response envelope + pagination + prohibited request fields → §3.9.**

---

## §4.0 — Pass-2 Wire Conventions (binding; bound to §3.8/§3.9)

Every contract in §4–§6 obeys these without per-contract restatement:

- **Success body** — each **Response** block below shows only the `<representation>`. It is carried in the §3.9 envelope: single-entity → `{ "result": <representation>, "reference_id": "<uuidv7>" }` (`201` adds a `Location` header); list → `{ "items": [...], "page_info": { "next_cursor", "has_more", "total_count"? }, "reference_id": "<uuidv7>" }`. `reference_id` is top-level on every response.
- **Error tables** — the `Class` column names the `Doc-5A §6.2` `error_class` (§3.8); status is fixed by §3.8, never chosen per contract. No `BAD_REQUEST`; `VALIDATION`=`400`; `AUTHORIZATION`=`403`; `STATE`/`CONFLICT`=`409`; `REFERENCE`/`BUSINESS`=`422`.
- **Pagination** — list params are **`page_size`** + **`cursor`**; `page_size` bounds are the `[ESC-BILL-POLICY]` page key (referenced, never a literal); over-max → `400 VALIDATION`. List filters use the declared `filter` allowlist grammar.
- **Prohibited request fields** (`Doc-4A §9.7`) — no `org_id`/tenant-selection, no lifecycle-state flag, no attribution/authorization/POLICY-override field in any request. Org context = server-validated `Iv-Active-Organization`.
- **Representation fields** are owned by the Doc-4I PassB contract declarations by reference (`Doc-4A §10.1`); any field not traced to `Doc-4I §HB-x.y` is carried `[ESC-BILL-FIELD]` and flag-and-halt — never reshaped or invented here.
- **Money [realization convention]:** Doc-4I declares `price`/`amount` as `numeric` with no unit; Doc-5I realizes them as **minor units of the stored `currency`** (ISO 4217) — a wire convention, not a Doc-4I-stated unit.

---

## §4 — Plans & Entitlements Surface Realization (BC-BILL-1, 8 caller-facing)

### §4.1 Section Purpose & Wire Constraints

BC-BILL-1 governs the plan catalog and entitlement definitions. Plans carry a state machine (`draft → active → retired`; edges `Doc-2 §3.8`; authority §3.4/R7). Entitlements are catalog definitions — they confer no privilege until bundled to a plan (`bundle_plan_entitlement`) and that plan is active on a subscription.

**Wire constraints specific to §4 (supplement §3.3):**
- Plans at `retired` state are terminal and immutable — no field update, no re-activation, no un-retire. Any attempt → `409 STATE`.
- `is_active` (Doc-4I §HB-1.1) is a **marketing-visibility** bool — a valid create/update input — **distinct from** `status` (the `draft→active→retired` machine). It does **not** change `status`.
- The `status` `draft → active` edge (`Doc-2 §3.8`) has **no realizing Doc-4I BC-BILL-1 contract** — `create_plan`→`draft`, `update_plan` mutates marketing fields, `retire_plan`→`retired`; none drives `draft→active`. Carried **`[ESC-BILL-ACTIVATE]`** (flag-and-halt) — no activation flag or contract coined here.
- Entitlement definitions are catalog records — updating an entitlement does **not** retroactively alter active subscriptions already resolved against an older bundle snapshot.
- **Disclosure scope:** `get_plan` / `list_plans` → **Platform-Public** (§3.6). Admin reads any state (including `retired`, `draft`); User reads active plans by default.
- **Actor side:** all 6 catalog mutation commands → **Admin** (`[ESC-BILL-SLUG]`; §3.7).

---

### §4.2 Plan Catalog Commands

---

#### `billing.create_plan.v1`

| Field | Value |
|---|---|
| Token | `billing.create_plan.v1` |
| Method | `POST` |
| Path | `/billing/plans` |
| Actor | Admin (`[ESC-BILL-SLUG]`) |
| Success | `201 Created` |
| Idempotency | `Idempotency-Key` header required (`Doc-5A §9`) |
| Audit | `[ESC-BILL-AUDIT]` — nearest: `Doc-2 §9` Organization / plan-catalog created |
| Events | None (BC-BILL-1 emits no `Doc-2 §8` event; R9/BF-4) |

**Request body:**

```json
{
  "name":          "string — plan display name (required)",
  "billing_cycle": "enum<monthly|annual> (required; Doc-4I §HB-1.1)",
  "price":         "numeric — minor units of the stored currency (required; ≥ 0)",
  "currency":      "string (ISO 4217; BDT today, stored per value field — multi-currency-ready per Doc-2)",
  "is_active":     "bool (optional) — marketing-visibility flag (Doc-4I §HB-1.1); NOT the lifecycle status, does NOT drive draft→active"
}
```

> Inputs are `Doc-4I §HB-1.1` (create) verbatim. `description` is **not** a Doc-4I plan field — not accepted. `is_active` is marketing visibility, **distinct from** `status` (the `draft→active→retired` machine).

**Response `201`** — representation = `Doc-4I §HB-1.1` output, carried in the §3.9 `result`+`reference_id` envelope (`201` adds `Location`). The create output is **minimal** per Doc-4I; the full plan is read via `get_plan`:

```json
{
  "plan_id": "UUIDv7",
  "status":  "draft"
}
```

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | Malformed body / wrong type; `price` < 0; `billing_cycle` not in enum; `name` blank |
| `AUTHORIZATION` | `403` | Actor is not Admin (`[ESC-BILL-SLUG]` check failed) |
| `CONFLICT` | `409` | Duplicate `Idempotency-Key` with a different body |

(Create enters `draft`; no `REFERENCE` row — no prior entity referenced. `Doc-4I §HB-1.1`.)

---

#### `billing.update_plan.v1`

| Field | Value |
|---|---|
| Token | `billing.update_plan.v1` |
| Method | `POST` |
| Path | `/billing/plans/{plan_id}/update-plan` |
| Actor | Admin (`[ESC-BILL-SLUG]`) |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` header required |
| Audit | `[ESC-BILL-AUDIT]` — nearest: `Doc-2 §9` plan-catalog updated |
| Events | None |

**Request body** (all fields optional; omitted = unchanged):

```json
{
  "name":          "string | undefined",
  "billing_cycle": "enum<monthly|annual> | undefined",
  "price":         "numeric | undefined",
  "currency":      "string (ISO 4217) | undefined",
  "is_active":     "bool | undefined — marketing-visibility flag (Doc-4I §HB-1.1); NOT the lifecycle status",
  "expected_status": "enum<draft|active|retired> (required; optimistic-concurrency assertion — Doc-4I §HB-1.1 / Doc-4A §14; mismatch → 409 CONFLICT)"
}
```

> **No `status` lifecycle field is accepted** (`Doc-4A §9.7`; §3.9): `expected_status` is a concurrency assertion, not a target state. `is_active` (Doc-4I §HB-1.1) is a **marketing-visibility** bool, **not** the `status` machine — it does **not** drive `draft→active`. The `draft→active` lifecycle edge (`Doc-2 §3.8`) has **no realizing Doc-4I contract** — carried `[ESC-BILL-ACTIVATE]` (§4.1), flag-and-halt. `description` is not a Doc-4I field. Editing a `retired` plan → `409 STATE` (terminal).

**Response `200`** — `Doc-4I §HB-1.1` output (minimal), §3.9 envelope: `{ "plan_id": "UUIDv7", "status": "draft | active | retired" }`. Full plan via `get_plan`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | Malformed body; `price` < 0; enum value invalid |
| `AUTHORIZATION` | `403` | Not Admin |
| `REFERENCE` | `422` | `plan_id` does not resolve in the catalog (`Doc-4I §HB-1.1` stage-7 REFERENCE — not a `404`) |
| `STATE` | `409` | Mutation attempted from `retired` (terminal) |
| `CONFLICT` | `409` | `expected_status` mismatch / lost optimistic-lock race |

---

#### `billing.retire_plan.v1`

| Field | Value |
|---|---|
| Token | `billing.retire_plan.v1` |
| Method | `POST` |
| Path | `/billing/plans/{plan_id}/retire-plan` |
| Actor | Admin (`[ESC-BILL-SLUG]`) |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` header required |
| Audit | `[ESC-BILL-AUDIT]` — nearest: `Doc-2 §9` plan-catalog retired |
| Events | None |

**Request body:**

```json
{
  "expected_status": "enum<draft|active|retired> (required; optimistic-concurrency assertion — Doc-4I §HB-1.1; mismatch → 409 CONFLICT)"
}
```

**Response `200`** — `Doc-4I §HB-1.1` output, §3.9 envelope: `{ "plan_id": "UUIDv7", "status": "retired" }`.

> `retired` is **terminal and irreversible** (`Doc-2 §3.8`; §3.4/R7). Existing active subscriptions on this plan continue until expiry — retirement prevents **new** subscriptions, does not cancel existing ones.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `AUTHORIZATION` | `403` | Not Admin |
| `REFERENCE` | `422` | `plan_id` does not resolve in the catalog (`Doc-4I §HB-1.1` stage-7 — not a `404`) |
| `STATE` | `409` | Plan already `retired` (terminal; forbidden from `retired`) |
| `CONFLICT` | `409` | `expected_status` mismatch (lost race) |

---

#### `billing.bundle_plan_entitlement.v1`

| Field | Value |
|---|---|
| Token | `billing.bundle_plan_entitlement.v1` |
| Method | `POST` |
| Path | `/billing/plans/{plan_id}/bundle-plan-entitlement` |
| Actor | Admin (`[ESC-BILL-SLUG]`) |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` header required; operation is idempotent (re-bundling same entitlement = no-op) |
| Audit | `[ESC-BILL-AUDIT]` — nearest: `Doc-2 §9` plan-catalog entitlement bundled |
| Events | None |

**Request body:**

```json
{
  "entitlement_id": "UUIDv7 — the entitlement to associate (required)",
  "value_jsonb":    "jsonb — bundle value (required; presence/shape only; Doc-4I §HB-1.2)"
}
```

**Response `200`** — `Doc-4I §HB-1.2` output, §3.9 envelope: `{ "plan_id": "UUIDv7", "entitlement_id": "UUIDv7" }`. Full bundle via `get_plan`.

> Inputs/output = `Doc-4I §HB-1.2` verbatim (PK `plan_id`+`entitlement_id`, `value_jsonb`). **Upsert on the PK** — re-bundling the same entitlement is **idempotent** (duplicate PK = no new row; `200`). No retired-plan STATE guard is defined by Doc-4I §HB-1.2.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `entitlement_id` malformed; `value_jsonb` absent |
| `AUTHORIZATION` | `403` | Not Admin |
| `REFERENCE` | `422` | `plan_id` or `entitlement_id` does not resolve in the catalog (`Doc-4I §HB-1.2` stage-7 — not a `404`) |

---

#### `billing.create_entitlement.v1`

| Field | Value |
|---|---|
| Token | `billing.create_entitlement.v1` |
| Method | `POST` |
| Path | `/billing/entitlements` |
| Actor | Admin (`[ESC-BILL-SLUG]`) |
| Success | `201 Created` |
| Idempotency | `Idempotency-Key` header required |
| Audit | `[ESC-BILL-AUDIT]` — nearest: `Doc-2 §9` entitlement-catalog created |
| Events | None |

**Request body:**

```json
{
  "slug":          "string — entitlement slug, e.g. 'rfq_submissions_per_month' (required; UNIQUE; Doc-4I §HB-1.3)",
  "type":          "enum<boolean|numeric|enum> (required)",
  "default_value": "jsonb (optional) — default per type (presence/shape only; Doc-4I §HB-1.3)"
}
```

> Inputs = `Doc-4I §HB-1.3` verbatim. Field is `default_value` (jsonb), not `value`; no `description` field.

**Response `201`** — `Doc-4I §HB-1.3` output, §3.9 `result`+`reference_id` envelope (`201` adds `Location`):

```json
{
  "entitlement_id": "UUIDv7",
  "slug":           "string",
  "type":           "boolean | numeric | enum"
}
```

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `slug` blank; invalid `type` enum; malformed `default_value` |
| `AUTHORIZATION` | `403` | Not Admin |
| `BUSINESS` | `422` | `slug` already exists (UNIQUE — `Doc-4I §HB-1.3` stage-8 BUSINESS, not `409`) |

---

#### `billing.update_entitlement.v1`

| Field | Value |
|---|---|
| Token | `billing.update_entitlement.v1` |
| Method | `POST` |
| Path | `/billing/entitlements/{entitlement_id}/update-entitlement` |
| Actor | Admin (`[ESC-BILL-SLUG]`) |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` header required |
| Audit | `[ESC-BILL-AUDIT]` — nearest: `Doc-2 §9` entitlement-catalog updated |
| Events | None |

**Request body** (all optional; omitted = unchanged):

```json
{
  "type":          "enum<boolean|numeric|enum> | undefined",
  "default_value": "jsonb | undefined"
}
```

> `Doc-4I §HB-1.3` processing: update mutates `type`/`default_value` (the `slug` is the catalog identity — not mutated here; no `description` field). Changes do **not** retroactively alter active-subscription entitlement snapshots (snapshots are taken at purchase time).

**Response `200`** — `Doc-4I §HB-1.3` output, §3.9 envelope: `{ "entitlement_id": "UUIDv7", "slug": "string", "type": "boolean | numeric | enum" }`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | invalid `type` enum; malformed `default_value` |
| `AUTHORIZATION` | `403` | Not Admin |
| `REFERENCE` | `422` | `entitlement_id` does not resolve (`Doc-4I §HB-1.3` stage-7 — not a `404`) |
| `CONFLICT` | `409` | Lost optimistic-lock race (`Doc-4I §HB-1.3` stage-6) |

---

### §4.3 Plan Catalog Reads

---

#### `billing.get_plan.v1`

| Field | Value |
|---|---|
| Token | `billing.get_plan.v1` |
| Method | `GET` |
| Path | `/billing/plans/{plan_id}` |
| Actor | User / Admin |
| Slug | Authentication only (Platform-Public catalog; §3.6) |
| Disclosure scope | Platform-Public (§3.6) |
| Audit | Not audited (`Doc-5A §17.1`) |
| Events | None |

**Response `200`** — representation = `Doc-4I §HB-1.4` `plan` output, in the §3.9 `result`+`reference_id` envelope:

```json
{
  "plan_id":       "UUIDv7",
  "name":          "string",
  "billing_cycle": "monthly | annual",
  "price":         "numeric (minor units)",
  "currency":      "string (ISO 4217)",
  "status":        "draft | active | retired",
  "is_active":     "boolean",
  "entitlements":  [
    {
      "entitlement_id": "UUIDv7",
      "slug":           "string",
      "type":           "boolean | numeric | enum",
      "value":          "boolean | integer | string"
    }
  ]
}
```

> User reads any plan regardless of status (Platform-Public). `draft` and `retired` plans are visible to all authenticated users; use `status`/`is_active` to filter client-side. Fields are `Doc-4I §HB-1.4` output verbatim — no `human_ref`/`description`/timestamp added (not in the Doc-4I output; would require a Doc-4I output extension, `[ESC-BILL-FIELD]`).

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `NOT_FOUND` | `404` | `plan_id` does not exist |

---

#### `billing.list_plans.v1`

| Field | Value |
|---|---|
| Token | `billing.list_plans.v1` |
| Method | `GET` |
| Path | `/billing/plans` |
| Actor | User / Admin |
| Slug | Authentication only (Platform-Public catalog; §3.6) |
| Disclosure scope | Platform-Public (§3.6) |
| Pagination | Cursor-based (`Doc-5A §8`): `?cursor=&page_size=` |
| Audit | Not audited |
| Events | None |

**Query parameters** (§3.9 grammar):

| Param | Type | Note |
|---|---|---|
| `cursor` | string | Opaque cursor from previous `page_info.next_cursor` |
| `page_size` | integer | Bounds referenced by `[ESC-BILL-POLICY]` page key (never a literal); over-max → `400 VALIDATION` |
| `filter` | object | Declared allowlist (`Doc-4I §HB-1.4` / `Doc-4A §9.6`): `{ billing_cycle?, is_active?, status? }`; undeclared field → `400 VALIDATION` |

**Response `200`** (list representation = `Doc-4I §HB-1.4` `items`, carried in the §3.9 `items`/`page_info`/`reference_id` envelope; use `get_plan` for the full `entitlements` bundle):

```json
{
  "plan_id":       "UUIDv7",
  "name":          "string",
  "billing_cycle": "monthly | annual",
  "price":         "numeric (minor units)",
  "currency":      "string (ISO 4217)",
  "status":        "draft | active | retired"
}
```

---

## §5 — Subscriptions Surface Realization (BC-BILL-2, 4 caller-facing)

### §5.1 Section Purpose & Wire Constraints

BC-BILL-2 is the **sole subscription lifecycle authority** (R7). The subscription machine is `pending_payment → active → expired` (edges `Doc-2 §5.7`; §3.4). `resolve_entitlements.v1` and the period-end jobs (`renew_subscription`, `expire_subscription`) are out-of-wire (§10/R1) — **not realized here**.

**Wire constraints specific to §5 (supplement §3.3):**
- An org may have at most **one active subscription** at a time (Doc-4I module invariant). `purchase_subscription` while an `active` subscription exists → `409 CONFLICT`.
- `cancel_subscription` sets `auto_renew = false` — **`status` stays `active`**; the subscription runs to its period end. The state machine is unchanged at this moment (§3.4/R7).
- `purchase_subscription` emits `SubscriptionPurchased` immediately via outbox (`Doc-4B`) — the event fires at pending_payment creation, **not** at payment confirmation (R9; §3.4).
- **Disclosure scope:** `get_subscription` / `list_subscription_events` → **Own-Org**, **User-only** (`Doc-4I §HB-2.5`; no Admin actor — §3.6 [ESC-BILL-ADMINSCOPE]).
- **Actor side:** `purchase_subscription` / `cancel_subscription` → **User** (`can_manage_billing`; §3.7).

---

### §5.2 Subscription Commands

---

#### `billing.purchase_subscription.v1`

| Field | Value |
|---|---|
| Token | `billing.purchase_subscription.v1` |
| Method | `POST` |
| Path | `/billing/subscriptions` |
| Actor | User (`can_manage_billing`) |
| Success | `201 Created` |
| Idempotency | `Idempotency-Key` header required |
| Audit | `[ESC-BILL-AUDIT]` — nearest: `Doc-2 §9` Financial / subscription purchased |
| Events | `SubscriptionPurchased` — emitted immediately on creation at `pending_payment`; outbox via `Doc-4B`; consumed by M6 Communication (DF-BILL-6) |

**Request body:**

```json
{
  "plan_id":    "UUIDv7 — the plan to subscribe to (required; must resolve to an active plan — Doc-4I §HB-2.1)",
  "auto_renew": "bool (optional; default true; Doc-4I §HB-2.1)"
}
```

> Inputs = `Doc-4I §HB-2.1` (`plan_id`, `auto_renew`). `billing_cycle` is **not** a caller input — carried by the plan (`Doc-4I §HB-1.4`); duplicating it would be a payload-duplication field (`Doc-4A §9.7`). Org = server-resolved Controlling Organization (§3.4), never a request field.

**Response `201`** — `Doc-4I §HB-2.1` output, §3.9 `result`+`reference_id` envelope (`201` adds `Location`):

```json
{
  "subscription_id": "UUIDv7",
  "status":          "pending_payment",
  "plan_id":         "UUIDv7"
}
```

> Status is `pending_payment` at creation. `billing.record_payment.v1` (§10/R8) drives `pending_payment → active` when the payment gateway confirms. `SubscriptionPurchased` is emitted regardless (pending-payment creation = intent confirmed). Period/snapshot/timestamp fields are not in the Doc-4I output; read the full head via `get_subscription`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | Malformed body; `plan_id` missing or malformed |
| `AUTHORIZATION` | `403` | `can_manage_billing` check failed |
| `STATE` | `409` | Org already has an `active` subscription — one-active-per-org (`Doc-4I §HB-2.1` stage-6 STATE; partial UNIQUE WHERE status='active') |
| `CONFLICT` | `409` | Duplicate `Idempotency-Key` with a different body |
| `REFERENCE` | `422` | `plan_id` does not resolve to an **active** plan — missing/`draft`/`retired` (`Doc-4I §HB-2.1` stage-7 — not a `404`) |

---

#### `billing.cancel_subscription.v1`

| Field | Value |
|---|---|
| Token | `billing.cancel_subscription.v1` |
| Method | `POST` |
| Path | `/billing/subscriptions/{subscription_id}/cancel-subscription` |
| Actor | User (`can_manage_billing`) |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` header required |
| Audit | `[ESC-BILL-AUDIT]` — nearest: `Doc-2 §9` Financial / subscription cancelled |
| Events | **None** — cancel is not an event-producing operation (R9/`Doc-4I §H.7`) |

**Request body:**

```json
{
  "expected_status": "enum<active> (required; optimistic-concurrency assertion — Doc-4I §HB-2.2; mismatch → 409 CONFLICT)"
}
```

**Response `200`** — `Doc-4I §HB-2.2` output, §3.9 envelope:

```json
{
  "subscription_id": "UUIDv7",
  "status":          "active"
}
```

> **Status stays `active`** after cancel; `auto_renew` is set to `false` (not a state change — `Doc-4I §HB-2.2`). The `expire_subscription` System job (§10) fires at period end and drives `active → expired` independently. Cancelling an already-cancelled (`auto_renew=false`) subscription is idempotent — returns current status, no error. Period/`auto_renew` detail is read via `get_subscription`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `AUTHORIZATION` | `403` | `can_manage_billing` check failed |
| `NOT_FOUND` | `404` | `subscription_id` absent or belongs to a different org (§3.5 non-disclosure) |
| `STATE` | `409` | Subscription not `active` (`pending_payment`/`expired`) — cancel applies only to an active subscription (`Doc-4I §HB-2.2`) |
| `CONFLICT` | `409` | `expected_status` mismatch (lost race; `Doc-4I §HB-2.2`) |

---

### §5.3 Subscription Reads

---

#### `billing.get_subscription.v1`

| Field | Value |
|---|---|
| Token | `billing.get_subscription.v1` |
| Method | `GET` |
| Path | `/billing/subscriptions/{subscription_id}` (path id optional per `Doc-4I §HB-2.5`; omitted → the actor's Controlling-Org subscription — realized as `GET /billing/subscriptions/current`) |
| Actor | **User** (`can_view_billing`) — `Doc-4I §HB-2.5` is User-only; **no Admin actor** ([ESC-BILL-ADMINSCOPE], §3.6) |
| Disclosure scope | Own-Org; cross-org → `NOT_FOUND` (§3.5/§3.6) |
| Audit | Not audited (`Doc-5A §17.1`) |
| Events | None |

**Response `200`** — representation = `Doc-4I §HB-2.5` `subscription` output, §3.9 `result`+`reference_id` envelope:

```json
{
  "subscription_id": "UUIDv7",
  "plan_id":         "UUIDv7",
  "status":          "pending_payment | active | expired",
  "period_start":    "ISO date",
  "period_end":      "ISO date",
  "auto_renew":      "boolean"
}
```

> Fields are `Doc-4I §HB-2.5` output verbatim. `human_ref`/`organization_id`/`plan_snapshot`/timestamps are **not** in the Doc-4I output — adding them needs a Doc-4I output extension (`[ESC-BILL-FIELD]`), never reshaped here.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `AUTHORIZATION` | `403` | `can_view_billing` check failed |
| `NOT_FOUND` | `404` | `subscription_id` absent or belongs to a different org (non-disclosure §3.5) |

---

#### `billing.list_subscription_events.v1`

| Field | Value |
|---|---|
| Token | `billing.list_subscription_events.v1` |
| Method | `GET` |
| Path | `/billing/subscriptions/{subscription_id}/events` |
| Actor | **User** (`can_view_billing`) — `Doc-4I §HB-2.5` is User-only; **no Admin actor** ([ESC-BILL-ADMINSCOPE], §3.6) |
| Disclosure scope | Own-Org; parent subscription must belong to active org → `NOT_FOUND` if cross-org (§3.5/§3.6) |
| Pagination | Cursor-based (`Doc-5A §8`) |
| Audit | Not audited |
| Events | None |

**Query parameters** (§3.9 grammar):

| Param | Type | Note |
|---|---|---|
| `cursor` | string | Opaque cursor from previous `page_info.next_cursor` |
| `page_size` | integer | Bounds referenced by `[ESC-BILL-POLICY]` page key (never a literal); over-max → `400 VALIDATION` |

**Response `200`** (list representation, carried in the §3.9 `items`/`page_info`/`reference_id` envelope):

```json
{
  "event_type":  "string (e.g. purchased | activated | cancelled | renewed | expired)",
  "occurred_at": "ISO 8601"
}
```

> Item shape = `Doc-4I §HB-2.5` `items` verbatim (`{ event_type, occurred_at }`). Events are append-only and immutable (`Doc-2 §10.8` / Invariant #8), ordered descending by `occurred_at`. `event_type=activated` is sourced from the `record_payment` transition (§10/R8); `renewed`/`expired` from the §10 System jobs — subscription-history projections, **not** caller-emitted events (only the 3 R9 `Doc-2 §8` events exist). `subscription_id` absent or cross-org → `404 NOT_FOUND` on the parent lookup.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `AUTHORIZATION` | `403` | `can_view_billing` check failed |
| `NOT_FOUND` | `404` | `subscription_id` absent or belongs to a different org (non-disclosure §3.5) |

---

## §6 — Usage & Quota Surface Realization (BC-BILL-3, 1 caller-facing)

### §6.1 Section Purpose & Wire Constraints

BC-BILL-3 governs the usage ledger. **Only 1 contract has a caller wire** — `get_usage`. `record_usage` (System metering) and `enforce_quota` (internal service authority) are **out-of-wire** (§10/R1/R10) and are **not realized here** — pointer to §10.

**Wire constraints specific to §6 (supplement §3.3):**
- Usage ledger is **append-only** — no mutation surface is exposed to callers (`Doc-2 §10.8`; Invariant #8).
- `enforce_quota` is an internal gate — **never a routing, eligibility, or procurement signal** (R5/R10/BF-2). Its result is not surfaced in any `get_usage` response field.
- Usage data is metering-only: it meters commercial consumption (RFQ responses, lead access, ad launches); it **never gates trust/verification/matching** (R5/BF-1/BF-3).
- **Disclosure scope:** `get_usage` → **Own-Org**, **User-only** (`Doc-4I §HB-3.3`; no Admin actor — §3.6 [ESC-BILL-ADMINSCOPE]).
- **Actor side:** `get_usage` is a read (no command actor-side applies).
- `record_usage` and `enforce_quota` out-of-wire declaration: **§10 is the authority** — no wire in any protocol; Flag-and-Halt if a wire is proposed (R1/R10).

---

### §6.2 Usage Read

---

#### `billing.get_usage.v1`

| Field | Value |
|---|---|
| Token | `billing.get_usage.v1` |
| Method | `GET` |
| Path | `/billing/usage` |
| Actor | **User** (`can_view_billing`) — `Doc-4I §HB-3.3` is User-only; **no Admin actor** ([ESC-BILL-ADMINSCOPE], §3.6) |
| Disclosure scope | Own-Org (§3.6); org = Controlling Organization from server-validated `Iv-Active-Organization` (§3.4); **no caller-supplied `org_id`** (`Doc-4A §9.7`; §3.9) |
| Audit | Not audited (`Doc-5A §17.1`) |
| Events | None |

**Query parameters** (§3.9 grammar):

| Param | Type | Note |
|---|---|---|
| `cursor` | string | Opaque cursor from previous `page_info.next_cursor` |
| `page_size` | integer | Bounds referenced by `[ESC-BILL-POLICY]` page key (never a literal); over-max → `400 VALIDATION` |
| `filter` | object | Declared allowlist (`Doc-4I §HB-3.3` / `Doc-4A §9.6`): `{ quota_key?, period? }` (`period` = `YYYY-MM`, default current period); future `period` → `422 BUSINESS`; undeclared field → `400 VALIDATION` |

**Response `200`** — representation = `Doc-4I §HB-3.3` output (this read **is** a list: `items` = usage rows, with a `totals` facet), in the §3.9 list envelope (`items` + `page_info` + `reference_id`); `totals` is a list facet (`Doc-4A §10.3`):

```json
{
  "items": [
    {
      "quota_key": "string",
      "amount":    "numeric",
      "period":    "YYYY-MM",
      "source":    "string (metering source — e.g. rfq_response | lead_access | ad_launch)"
    }
  ],
  "totals": { "quota_key": "string", "used": "numeric" },
  "page_info": { "next_cursor": "string | null", "has_more": "boolean" },
  "reference_id": "UUIDv7"
}
```

> Item/`totals` shape = `Doc-4I §HB-3.3` output verbatim. Usage rows are append-only and immutable (`Doc-2 §10.8`; Invariant #8). No `organization_id`/`unit_cost`/`source_ref`/`recorded_at` field is added — none is in the Doc-4I output; any need escalates `[ESC-BILL-FIELD]` (§4.0), never reshaped here. Past `period` with no rows → `200`, empty `items`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `filter` field undeclared; `period` format invalid; `page_size` over POLICY max |
| `AUTHORIZATION` | `403` | `can_view_billing` check failed |
| `BUSINESS` | `422` | Future `period` requested |

---

*Pass-2 patched per Hard Review v1.0 + Focused Re-Review v1.0 (5 BLOCKERs).*
*Hard Review: B-01 (`BAD_REQUEST` removed); B-02 (`VALIDATION`→`400`, business→`422 BUSINESS`); B-03 (`page_size`+`cursor`; bounds via `[ESC-BILL-POLICY]`); B-04 (`org_id` removed); B-05 (no `status` lifecycle field in body); M-01 (`AUTHORIZATION`); M-02/M-03 (envelope + `page_info` via §3.9/§4.0); m/n items.*
*Doc-4I field/error trace (correction round): `billing_cycle` enum = `monthly|annual` (`lifetime` was invented — removed); invented `description` removed (plans + entitlements); entitlement `value`→`default_value` (Doc-4I §HB-1.3); `is_active` **restored** as the Doc-4I §HB-1.1 marketing-visibility bool (distinct from `status`; B-05 over-fix reversed); `bundle` gains required `value_jsonb` (§HB-1.2); `auto_renew` added to purchase (§HB-2.1). Error reclass to Doc-4I validation tables: catalog-command missing id → `REFERENCE 422` (not 404); duplicate entitlement `slug` → `BUSINESS 422` (not 409); one-active-per-org → `STATE 409` (not 422); plan/entitlement lost race + `expected_status` mismatch → `CONFLICT 409`. `draft→active` confirmed to have **no** Doc-4I contract → `[ESC-BILL-ACTIVATE]` (real gap, not authoring).*
*Re-Review: **RR-B1** — all 9 org-scoped reads corrected to **User-only** per `Doc-4I §HB-2.5/3.3/4.2/5.4/6.3`; Admin actor removed; structure §3 "Admin reads any org" grant re-scoped to catalog reads + escalated as corpus conflict `[ESC-BILL-ADMINSCOPE]` (Pass-1 §3.6). **RR-B2** — every representation aligned to Doc-4I `§HB` outputs verbatim: `state`→`status`, `price_amount`→`price`, entitlement `key`→`slug`, plan `is_active` output, command outputs minimized (`{id,status}`), get_usage rewritten to `Doc-4I §HB-3.3` (`items{quota_key,amount,period,source}`+`totals`); untraced fields escalated `[ESC-BILL-FIELD]`. RR-m1 (`[ESC-BILL-ACTIVATE]` = update_plan wire-intent), RR-m2 (get_usage = list+facet), RR-m3 (`page_token`§22.3→`cursor`), RR-m4 (`subscription_id` optional → `/current`). `expected_status` concurrency assertions added (update/retire plan, cancel sub).*
*§4 (8) + §5 (4) + §6 (1) = 13 realized. Open gates for content freeze: `[ESC-BILL-ADMINSCOPE]` (corpus conflict — human approval) · `[ESC-BILL-ACTIVATE]` · `[ESC-BILL-FIELD]` · `[ESC-BILL-POLICY]` page key. Pass-3: §7 (BC-BILL-4), §8 (BC-BILL-5), §9 (BC-BILL-6), §10 (Out-of-Wire), §11, Appendix A — author §7/§8/§9 reads User-only + field-traced from the start.*
