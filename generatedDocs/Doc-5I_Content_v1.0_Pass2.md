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

---

## §4 — Plans & Entitlements Surface Realization (BC-BILL-1, 8 caller-facing)

### §4.1 Section Purpose & Wire Constraints

BC-BILL-1 governs the plan catalog and entitlement definitions. Plans carry a state machine (`draft → active → retired`; edges `Doc-2 §3.8`; authority §3.4/R7). Entitlements are catalog definitions — they confer no privilege until bundled to a plan (`bundle_plan_entitlement`) and that plan is active on a subscription.

**Wire constraints specific to §4 (supplement §3.3):**
- Plans at `retired` state are terminal and immutable — no field update, no re-activation, no un-retire. Any attempt → `409 STATE`.
- The `draft → active` activation edge is driven by `update_plan` **publish semantics, server-derived** — **not** by a caller-supplied lifecycle-state field (`Doc-4A §9.7`; §3.9). The activation-contract attribution is carried **`[ESC-BILL-ACTIVATE]`** pending `Doc-4I §HB-1.2` verbatim confirmation (which BC-BILL-1 contract realizes the edge); flag-and-halt — no activation flag coined. Activating an already-`active` plan is an idempotent no-op (return current state).
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
  "description":   "string | null — plan description",
  "billing_cycle": "monthly | annual | lifetime (required)",
  "price_amount":  "integer — minor units of the stored currency (required; 0 = free)",
  "currency":      "string (ISO 4217; BDT today, stored per value field — multi-currency-ready per Doc-2)"
}
```

**Response `201`:**

```json
{
  "id":            "UUIDv7",
  "human_ref":     "string (year-scoped; prefix per M0 ID-gen registry — not coined here)",
  "name":          "string",
  "description":   "string | null",
  "billing_cycle": "monthly | annual | lifetime",
  "price_amount":  "integer (minor units)",
  "currency":      "string (ISO 4217)",
  "state":         "draft",
  "entitlements":  [],
  "created_at":    "ISO 8601",
  "updated_at":    "ISO 8601"
}
```

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | Malformed body / wrong type; `price_amount` < 0; `billing_cycle` not in enum; `name` blank |
| `AUTHORIZATION` | `403` | Actor is not Admin (`[ESC-BILL-SLUG]` check failed) |
| `CONFLICT` | `409` | Duplicate `Idempotency-Key` with a different body |

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
  "description":   "string | null | undefined",
  "billing_cycle": "monthly | annual | lifetime | undefined",
  "price_amount":  "integer | undefined",
  "currency":      "string (ISO 4217) | undefined"
}
```

> **No lifecycle-state field is accepted in this body** (`Doc-4A §9.7`; §3.9). `update_plan` mutates catalog metadata only. The `draft → active` activation edge is server-derived via publish semantics, carried `[ESC-BILL-ACTIVATE]` (§4.1) — never an `is_active`/state flag. Editing a `retired` plan → `409 STATE` (terminal).

**Response `200`:** plan representation (same shape as `create_plan` response), carried in the §3.9 envelope.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | Malformed body; `price_amount` < 0; enum value invalid |
| `AUTHORIZATION` | `403` | Not Admin |
| `NOT_FOUND` | `404` | `plan_id` does not exist |
| `STATE` | `409` | Mutation attempted on a `retired` plan (terminal) |
| `CONFLICT` | `409` | Lost optimistic-lock race (concurrent update) |

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

**Request body:** `{}` (empty; idempotency key in header is sufficient)

**Response `200`:** full plan object with `state: "retired"`.

> `retired` is **terminal and irreversible** (`Doc-2 §3.8`; §3.4/R7). Existing active subscriptions on this plan continue until expiry — retirement prevents **new** subscriptions, does not cancel existing ones.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `AUTHORIZATION` | `403` | Not Admin |
| `NOT_FOUND` | `404` | `plan_id` does not exist |
| `STATE` | `409` | Plan already `retired` (terminal; `Idempotency-Key` distinguishes re-send from duplicate) |

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
  "entitlement_id": "UUIDv7 — the entitlement definition to associate (required)"
}
```

**Response `200`:** full plan object with updated `entitlements` array (includes newly bundled item).

> Bundling an entitlement to a `retired` plan → `409 STATE`. Bundling a non-existent `entitlement_id` → `404 NOT_FOUND`. Re-bundling an already-bundled entitlement → idempotent `200` (no duplicate; returns current plan state).

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `entitlement_id` missing or malformed UUID |
| `AUTHORIZATION` | `403` | Not Admin |
| `NOT_FOUND` | `404` | `plan_id` or `entitlement_id` does not exist |
| `STATE` | `409` | Plan is `retired` (no mutation on terminal plans) |

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
  "key":         "string — feature entitlement key, e.g. 'rfq_submissions_per_month' (required; unique)",
  "type":        "boolean | numeric | enum (required)",
  "value":       "boolean | integer | string — must match type (required)",
  "description": "string | null"
}
```

**Response `201`:**

```json
{
  "id":          "UUIDv7",
  "key":         "string",
  "type":        "boolean | numeric | enum",
  "value":       "boolean | integer | string",
  "description": "string | null",
  "created_at":  "ISO 8601",
  "updated_at":  "ISO 8601"
}
```

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `value` type mismatch against `type`; `key` blank; invalid `type` enum |
| `AUTHORIZATION` | `403` | Not Admin |
| `CONFLICT` | `409` | `key` already exists (entitlement keys are globally unique) |

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
  "key":         "string | undefined",
  "type":        "boolean | numeric | enum | undefined",
  "value":       "boolean | integer | string | undefined",
  "description": "string | null | undefined"
}
```

> Updating `key` → uniqueness check applies. Updating `type`/`value` does **not** retroactively alter active subscription entitlement snapshots (snapshots are taken at purchase time).

**Response `200`:** full entitlement object.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `value` type mismatch; `key` blank |
| `AUTHORIZATION` | `403` | Not Admin |
| `NOT_FOUND` | `404` | `entitlement_id` does not exist |
| `CONFLICT` | `409` | `key` change collides with an existing key |

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

**Response `200`:**

```json
{
  "id":            "UUIDv7",
  "human_ref":     "string (year-scoped; prefix per M0 ID-gen registry — not coined here)",
  "name":          "string",
  "description":   "string | null",
  "billing_cycle": "monthly | annual | lifetime",
  "price_amount":  "integer (minor units)",
  "currency":      "string (ISO 4217)",
  "state":         "draft | active | retired",
  "entitlements":  [
    {
      "id":    "UUIDv7",
      "key":   "string",
      "type":  "boolean | numeric | enum",
      "value": "boolean | integer | string"
    }
  ],
  "created_at":    "ISO 8601",
  "updated_at":    "ISO 8601"
}
```

> User reads any plan regardless of state (Platform-Public). `draft` and `retired` plans are visible to all authenticated users; use `state` field to filter client-side.

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
| Pagination | Cursor-based (`Doc-5A §8`): `?cursor=&limit=` |
| Audit | Not audited |
| Events | None |

**Query parameters** (§3.9 grammar):

| Param | Type | Note |
|---|---|---|
| `cursor` | string | Opaque cursor from previous `page_info.next_cursor` |
| `page_size` | integer | Bounds referenced by `[ESC-BILL-POLICY]` page key (never a literal); over-max → `400 VALIDATION` |
| `filter` | string | Declared allowlist grammar (`Doc-5A §8`). Allowed dimension: `state ∈ {draft,active,retired}` — default selection per `Doc-4I §HB-1.2`; undeclared field → `400 VALIDATION` |

**Response `200`** (list representation, carried in the §3.9 `items`/`page_info`/`reference_id` envelope — items are plan summaries; use `get_plan` for the full `entitlements` bundle):

```json
{
  "id":            "UUIDv7",
  "human_ref":     "string (year-scoped human ref; prefix per ID-gen registry)",
  "name":          "string",
  "billing_cycle": "monthly | annual | lifetime",
  "price_amount":  "integer (minor units)",
  "currency":      "string (ISO 4217)",
  "state":         "draft | active | retired",
  "entitlement_count": "integer"
}
```

---

## §5 — Subscriptions Surface Realization (BC-BILL-2, 4 caller-facing)

### §5.1 Section Purpose & Wire Constraints

BC-BILL-2 is the **sole subscription lifecycle authority** (R7). The subscription machine is `pending_payment → active → expired` (edges `Doc-2 §5.7`; §3.4). `resolve_entitlements.v1` and the period-end jobs (`renew_subscription`, `expire_subscription`) are out-of-wire (§10/R1) — **not realized here**.

**Wire constraints specific to §5 (supplement §3.3):**
- An org may have at most **one active subscription** at a time (Doc-4I module invariant). `purchase_subscription` while an `active` subscription exists → `409 CONFLICT`.
- `cancel_subscription` sets `auto_renew = false` — **state stays `active`**; the subscription runs to `current_period_end`. State machine is unchanged at this moment (§3.4/R7).
- `purchase_subscription` emits `SubscriptionPurchased` immediately via outbox (`Doc-4B`) — the event fires at pending_payment creation, **not** at payment confirmation (R9; §3.4).
- **Disclosure scope:** `get_subscription` / `list_subscription_events` → **Own-Org** (§3.6); Admin reads any org.
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
  "plan_id":       "UUIDv7 — the plan to subscribe to (required; must be state=active)",
  "billing_cycle": "monthly | annual | lifetime (required; must match a cycle offered by the plan)"
}
```

**Response `201`:**

```json
{
  "id":                   "UUIDv7",
  "human_ref":            "string (year-scoped; prefix per M0 ID-gen registry — not coined here)",
  "organization_id":      "UUIDv7 (server-resolved Controlling Organization; §3.4)",
  "plan_id":              "UUIDv7",
  "plan_snapshot":        { "name": "string", "billing_cycle": "...", "price_amount": "integer (minor units)", "currency": "string (ISO 4217)" },
  "billing_cycle":        "monthly | annual | lifetime",
  "state":                "pending_payment",
  "current_period_start": "ISO date",
  "current_period_end":   "ISO date",
  "auto_renew":           true,
  "purchased_at":         "ISO 8601",
  "cancelled_at":         null,
  "expired_at":           null
}
```

> State is `pending_payment` at creation. `billing.record_payment.v1` (§10/R8) drives `pending_payment → active` when the payment gateway confirms. `SubscriptionPurchased` is emitted regardless (pending-payment creation = intent confirmed).

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | Malformed body; `plan_id`/`billing_cycle` missing or malformed |
| `AUTHORIZATION` | `403` | `can_manage_billing` check failed |
| `NOT_FOUND` | `404` | `plan_id` does not exist |
| `CONFLICT` | `409` | Duplicate `Idempotency-Key` with a different body |
| `BUSINESS` | `422` | Org already has an `active` subscription (one-active-per-org invariant); `plan_id` is `draft`/`retired`; `billing_cycle` not offered by the plan |

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

**Request body:** `{}` (idempotency key in header)

**Response `200`:**

```json
{
  "id":                   "UUIDv7",
  "human_ref":            "string (year-scoped; prefix per M0 ID-gen registry — not coined here)",
  "organization_id":      "UUIDv7",
  "plan_id":              "UUIDv7",
  "billing_cycle":        "monthly | annual | lifetime",
  "state":                "active",
  "current_period_end":   "ISO date (subscription runs until this date)",
  "auto_renew":           false,
  "cancelled_at":         "ISO 8601 (timestamp of this cancel call)"
}
```

> **State stays `active`** after cancel. `auto_renew` set to `false`. The `expire_subscription` System job (§10) fires at `current_period_end` and drives `active → expired` independently. Cancelling an already-cancelled (auto_renew=false) subscription is idempotent — returns current state, no error.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `AUTHORIZATION` | `403` | `can_manage_billing` check failed |
| `NOT_FOUND` | `404` | `subscription_id` absent or belongs to a different org (§3.5 non-disclosure) |
| `STATE` | `409` | Subscription not `active` (`pending_payment` or `expired`) — cancel applies only to an active subscription |

---

### §5.3 Subscription Reads

---

#### `billing.get_subscription.v1`

| Field | Value |
|---|---|
| Token | `billing.get_subscription.v1` |
| Method | `GET` |
| Path | `/billing/subscriptions/{subscription_id}` |
| Actor | User (`can_view_billing`) / Admin |
| Disclosure scope | Own-Org; cross-org → `NOT_FOUND` (§3.5/§3.6); Admin reads any |
| Audit | Not audited (`Doc-5A §17.1`) |
| Events | None |

**Response `200`:**

```json
{
  "id":                   "UUIDv7",
  "human_ref":            "string (year-scoped; prefix per M0 ID-gen registry — not coined here)",
  "organization_id":      "UUIDv7",
  "plan_id":              "UUIDv7",
  "plan_snapshot":        {
    "name":          "string",
    "billing_cycle": "monthly | annual | lifetime",
    "price_amount":  "integer (minor units)",
    "currency":      "string (ISO 4217)",
    "entitlements":  [{ "key": "string", "type": "...", "value": "..." }]
  },
  "billing_cycle":        "monthly | annual | lifetime",
  "state":                "pending_payment | active | expired",
  "current_period_start": "ISO date",
  "current_period_end":   "ISO date",
  "auto_renew":           "boolean",
  "purchased_at":         "ISO 8601",
  "cancelled_at":         "ISO 8601 | null",
  "expired_at":           "ISO 8601 | null"
}
```

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
| Actor | User (`can_view_billing`) / Admin |
| Disclosure scope | Own-Org; parent subscription must belong to active org → `NOT_FOUND` if cross-org (§3.5/§3.6); Admin reads any |
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
  "id":              "UUIDv7",
  "subscription_id": "UUIDv7",
  "event_type":      "purchased | activated | cancelled | renewed | expired",
  "occurred_at":     "ISO 8601",
  "actor":           "string (user_id or 'system')",
  "metadata":        "object | null"
}
```

> Events are append-only and immutable (`Doc-2 §10.8` / Invariant #8). Ordered descending by `occurred_at`. `event_type=activated` is sourced from the `record_payment` transition (§10/R8); `renewed`/`expired` from the §10 System jobs — these are subscription-history projections, **not** caller-emitted events (only the 3 R9 `Doc-2 §8` events exist). `subscription_id` absent or cross-org → `404 NOT_FOUND` on the parent lookup.

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
- **Disclosure scope:** `get_usage` → **Own-Org** (§3.6); Admin reads any org.
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
| Actor | User (`can_view_billing`) / Admin |
| Disclosure scope | Own-Org (§3.6); org = Controlling Organization resolved from server-validated `Iv-Active-Organization` (§3.4). Admin "reads any org" (§3 grant) is realized **server-side** — `[ESC-BILL-ADMINSCOPE]` (see note); **no caller-supplied `org_id`** (`Doc-4A §9.7`; §3.9) |
| Audit | Not audited (`Doc-5A §17.1`) |
| Events | None |

> **`[ESC-BILL-ADMINSCOPE]` (flag-and-halt):** the mechanism by which platform-staff Admin reads another org's **ID-less singleton** ledger (usage here; lead-account / reward-account in Pass-3) is **undefined in the frozen structure §3** — tenant-selection via request `org_id` is prohibited. Escalated; resolve once and apply uniformly to all org-singleton reads. Until resolved, the Admin singleton-read leg is provisional; the User Own-Org leg below is final.

**Query parameters** (§3.9 grammar):

| Param | Type | Note |
|---|---|---|
| `cursor` | string | Opaque cursor from previous `page_info.next_cursor` |
| `page_size` | integer | Bounds referenced by `[ESC-BILL-POLICY]` page key (never a literal); over-max → `400 VALIDATION` |
| `filter` | string | Declared allowlist grammar (`Doc-5A §8`). Allowed dimension: `period` (`YYYY-MM`; default = current billing period); a future `period` → `422 BUSINESS`; undeclared field → `400 VALIDATION` |

**Response `200`** (representation carried in the §3.9 envelope; `entries` is a list payload → `items`/`page_info`/`reference_id` envelope shape):

```json
{
  "organization_id":  "UUIDv7 (Controlling Organization; §3.4)",
  "period_start":     "ISO date",
  "period_end":       "ISO date",
  "totals": {
    "rfq_response":   "integer — total RFQ responses recorded this period",
    "lead_access":    "integer — total lead-access debits this period",
    "ad_launch":      "integer — total ad-launch events this period"
  },
  "entries": [
    {
      "id":           "UUIDv7",
      "source":       "rfq_response | lead_access | ad_launch",
      "quantity":     "integer",
      "unit_cost":    "integer (minor units of the stored currency; 0 for quota-included usage)",
      "source_ref":   "UUIDv7 | null (RFQ ID, lead ID, ad ID — bare ref; no cross-module data)",
      "recorded_at":  "ISO 8601"
    }
  ]
}
```

> `source_ref` is a **bare UUIDv7 reference only** — no cross-module entity data embedded (One Module, One Owner). Renamed from `reference_id` to avoid collision with the reserved top-level envelope key (`Doc-4A §22.1 C-05`; §3.9). Callers resolve the referenced entity via the owning module's endpoint.
>
> `entries` are append-only and immutable. `totals` are derived aggregates (sum of `entries` by `source` for the period) — computed at read time.
>
> All representation fields trace to `Doc-4I §HB-3.1/§HB-3.3`; any untraced field is carried `[ESC-BILL-FIELD]` (§4.0). Past `period` with no entries → `200`, empty `entries`, `totals` 0.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `filter` field undeclared; `period` format invalid; `page_size` over POLICY max |
| `AUTHORIZATION` | `403` | `can_view_billing` check failed |
| `BUSINESS` | `422` | Future `period` requested |

---

*Pass-2 patched per Hard Review v1.0. Resolved: B-01 (`BAD_REQUEST` class removed); B-02 (`VALIDATION`→`400`, business rules→`422 BUSINESS`); B-03 (`page_size`+`cursor`; page bounds via `[ESC-BILL-POLICY]`); B-04 (`org_id` removed; admin singleton-scope escalated `[ESC-BILL-ADMINSCOPE]`); B-05 (`is_active` removed; activation `[ESC-BILL-ACTIVATE]`); M-01 (`AUTHORIZATION` not `FORBIDDEN`); M-02/M-03 (envelope + `page_info` via §3.9/§4.0); M-04 (fields traced to Doc-4I; usage `reference_id`→`source_ref`); m-01..m-03 + n-01..n-03. Canonical error-class (§3.8) + envelope (§3.9) added to Pass-1. §4 (8 contracts), §5 (4), §6 (1) = 13 realized. Pass-3 covers §7 (BC-BILL-4), §8 (BC-BILL-5), §9 (BC-BILL-6), §10 (Out-of-Wire), §11 (Conformance), Appendix A — and must resolve `[ESC-BILL-ADMINSCOPE]` for lead-account/reward-account singletons.*
