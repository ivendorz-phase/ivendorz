# Doc-5I — Monetization / Billing (M7 `billing`) API Realization — Content v1.0 Pass-3

| Field | Value |
|---|---|
| Document | Doc-5I Content v1.0 Pass-3 |
| Status | **CONTENT IN PROGRESS — Pass-3 complete (§7 · §8 · §9 · §10 · §11 · Appendix A)** |
| Pass-3 scope | §7 BC-BILL-4 Lead Credits (4) · §8 BC-BILL-5 Platform Invoicing (4 wire + record_payment out-of-wire) · §9 BC-BILL-6 Rewards & Referrals (5) · §10 Out-of-Wire Boundary (6) · §11 Conformance · Appendix A |
| Builds on | `Doc-5I_Content_v1.0_Pass1.md` (§0–§3 binding registers — §3.8 error map, §3.9 envelope) · `Doc-5I_Content_v1.0_Pass2.md` (§4–§6) |
| Authority | `Doc-5A_SERIES_FROZEN_v1.0`; `Doc-4I_FROZEN_v1.0` (§HB-4/5/6 + §H conventions); `Doc-5I_Structure_v1.0_FROZEN.md` |
| Carried ESC (unchanged) | `[ESC-BILL-ADMINSCOPE]` · `[ESC-BILL-ACTIVATE]` · `[ESC-BILL-POLICY]` · `[ESC-BILL-FIELD]` · `[ESC-BILL-SLUG]` · `[ESC-BILL-AUDIT]` · `[ESC-BILL-EVENT]` — **none resolved here; ADMINSCOPE & ACTIVATE not locally fixed** |

> **Cross-cutting §3 binds all sections below (Pass-1).** Error-class→status → §3.8; response envelope + pagination + prohibited request fields → §3.9; actor model → §3.1; `check_permission` → §3.2; billing firewall → §3.3; state machines → §3.4; non-disclosure `NOT_FOUND` → §3.5; disclosure scopes → §3.6; actor sides → §3.7. Realize-never-redecide; every field/output/error traces to `Doc-4I §HB-x` verbatim.

---

## §7.0 — Pass-3 Wire Conventions (binding; supplements §3.8/§3.9/§4.0)

- **Actor-branched contracts (R11 / `Doc-4I` F4I-PA-M1).** Each of `credit_lead_account`, `debit_lead_account`, `issue_platform_invoice`, `update_invoice_status`, `credit_reward`, `track_referral`, `advance_referral` is **one contract-ID, two actor legs**. Only the **User leg has a caller HTTP wire** (realized below); the **System leg is in-process** (metering/milestone/gateway-driven — no wire, not §10). **System-leg realization is code / Doc-6** (like the §10 contracts); Doc-5I realizes only the User-leg wire. Counted once as caller-facing (§3.7).
- **Org context is never a request field** (`Doc-4A §9.7`; Invariant #5). Doc-4I lists `organization_id` as a contract input; on the wire it is the **server-validated `Iv-Active-Organization` (Controlling Organization, DF-BILL-1)** — never accepted in body/query/header. Where a Doc-4I input is the actor's own org, it is omitted from the request.
- **Reads are User-only** (`Doc-4I §HB-4.2/5.4/6.3` Actor = User) — **no Admin actor**; the structure §3 "Admin reads any org" grant does not reach these org-scoped reads ([ESC-BILL-ADMINSCOPE], §3.6). Cross-org → `404 NOT_FOUND` (§3.5).
- **Transient/system error classes** (`DEPENDENCY → 503`, `SYSTEM → 500`; `Doc-5A §6.2`) apply to every mutation and read per `Doc-4I §11`; not repeated in each error table below. Tables list the domain-specific classes only (`Doc-5A §5.7` Error-Status-Set subset rule).
- **Idempotency** (`Doc-4I §H.8`): every command carries `Idempotency-Key` (required); dedup window = `[ESC-BILL-POLICY]` page/dedup key (referenced, never a literal). Append-only ledgers are idempotent on the movement unit (`source_event_id` / `gateway_ref`).
- **Money [realization convention]:** Doc-4I declares `amount`/`points`/`price` as `numeric` with no unit; Doc-5I realizes them as **minor units of the stored `currency`** (ISO 4217) — a wire convention, not a Doc-4I-stated unit; `currency` carried per value field (multi-currency-ready, Doc-2). **Firewall (R5/H.9):** no lead-credit / invoice / reward / referral state influences matching / routing / ranking / supplier-selection / award / eligibility; balances are commercial/promotional, **never procurement standing**.

---

## §7 — Lead Credits Surface Realization (BC-BILL-4, 4 caller-facing)

### §7.1 Section Purpose & Wire Constraints

BC-BILL-4 owns the Lead Credit Account (`lead_credit_accounts` head + append-only `lead_credit_transactions`). `credit_lead_account` / `debit_lead_account` are actor-branched (R11): **User leg = org-initiated movement** (wire below); **System leg = metering-driven** (shortfall credit / lead-consumption debit — in-process, consumes the Operations lead-access signal `[ESC-BILL-EVENT]`, DF-BILL-4). Lead credit is a commercial balance — **never procurement standing** (firewall). Account/transactions are org-singletons keyed on the Controlling Organization.

- **Disclosure scope:** `get_lead_balance` / `list_lead_transactions` → **Own-Org, User-only** (`Doc-4I §HB-4.2`).
- **Actor side:** `credit_lead_account` / `debit_lead_account` → **actor-branched** (User leg wired; System in-process; §3.7).
- **`direction` (Doc-4I §HB-4.1 required input) is server-set per contract leg, not a caller field** — not dropped. Lead account: `credit-lead-account`→`credit`, `debit-lead-account`→`debit` (slug-determined). Reward: see the `credit_reward` naming artifact (§9.2) — its User leg is fixed to `redeem`.

---

### §7.2 Lead-Credit Movement Commands (User leg)

#### `billing.credit_lead_account.v1`

| Field | Value |
|---|---|
| Token | `billing.credit_lead_account.v1` |
| Method · Path | `POST /billing/lead-account/credit-lead-account` |
| Actor | **User leg** (`can_manage_billing`) — org credit purchase; System credit leg in-process (R11) |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` required (`Doc-4I §H.8`; dedup `[ESC-BILL-POLICY]`) |
| Audit | `[ESC-BILL-AUDIT]` — lead-credit movement not §9-enumerated; nearest by pointer (`Doc-4I §HB-4.1`/§H.6) |
| Events | None emitted (`Doc-4I §H.7`). System leg consumes lead-access signal `[ESC-BILL-EVENT]` (DF-BILL-4) — in-process only |

**Request body** (User leg; `direction=credit` fixed by the contract slug; `organization_id` = Controlling Org, server-derived):

```json
{
  "amount":            "numeric — minor units (required; > 0; Doc-4I §HB-4.1)",
  "source_invoice_id": "UUIDv7 | null — links the credit to a BC-BILL-5 platform invoice (optional, Doc-4I §HB-4.1)"
}
```

**Response `200`** — `Doc-4I §HB-4.1` output, §3.9 `result`+`reference_id` envelope:

```json
{
  "transaction_id":  "UUIDv7",
  "organization_id": "UUIDv7",
  "direction":       "credit",
  "amount":          "numeric",
  "balance":         "numeric"
}
```

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `amount` ≤ 0 / malformed |
| `AUTHORIZATION` | `403` | member without `can_manage_billing` |
| `NOT_FOUND` | `404` | the `lead_credit_accounts` is not the actor's Controlling Org (protected-fact collapse) |
| `REFERENCE` | `422` | `source_invoice_id` does not resolve (`Doc-4I §HB-4.1` stage-7) |

---

#### `billing.debit_lead_account.v1`

| Field | Value |
|---|---|
| Token | `billing.debit_lead_account.v1` |
| Method · Path | `POST /billing/lead-account/debit-lead-account` |
| Actor | **User leg** (`can_manage_billing`) — org-initiated debit; System auto-debit (lead consumption) leg in-process (R11) |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` required; System leg idempotent on `source_event_id` |
| Audit | `[ESC-BILL-AUDIT]` (`Doc-4I §HB-4.1`/§H.6) |
| Events | None emitted; System leg consumes lead-access signal `[ESC-BILL-EVENT]` (DF-BILL-4) |

**Request body** (User leg; `direction=debit` fixed by the slug; org server-derived):

```json
{
  "amount": "numeric — minor units (required; > 0; Doc-4I §HB-4.1)"
}
```

**Response `200`** — `Doc-4I §HB-4.1` output:

```json
{
  "transaction_id":  "UUIDv7",
  "organization_id": "UUIDv7",
  "direction":       "debit",
  "amount":          "numeric",
  "balance":         "numeric"
}
```

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `amount` ≤ 0 / malformed |
| `AUTHORIZATION` | `403` | member without `can_manage_billing` |
| `NOT_FOUND` | `404` | account not the actor's Controlling Org (protected-fact collapse) |
| `BUSINESS` | `422` | debit exceeds available balance — no overdraft per commercial rule (`Doc-4I §HB-4.1` stage-8) |

---

### §7.3 Lead-Credit Reads (User-only)

#### `billing.get_lead_balance.v1`

| Field | Value |
|---|---|
| Token · Method · Path | `billing.get_lead_balance.v1` · `GET /billing/lead-account` |
| Actor | **User** (`can_view_billing`) — `Doc-4I §HB-4.2` User-only; no Admin ([ESC-BILL-ADMINSCOPE]) |
| Disclosure scope | Own-Org singleton (org = Controlling Org; §3.4); cross-org → `404` |
| Audit / Events | Not audited (`Doc-5A §17.1`) / None |

**Response `200`** — `Doc-4I §HB-4.2` output, §3.9 envelope: `{ "organization_id": "UUIDv7", "balance": "numeric" }`.

**Errors:** `AUTHORIZATION 403` (no `can_view_billing`); `NOT_FOUND 404` (not the actor's Controlling Org).

---

#### `billing.list_lead_transactions.v1`

| Field | Value |
|---|---|
| Token · Method · Path | `billing.list_lead_transactions.v1` · `GET /billing/lead-account/transactions` |
| Actor | **User** (`can_view_billing`) — User-only (`Doc-4I §HB-4.2`) |
| Disclosure scope | Own-Org; cross-org → `404` |
| Pagination | `page_size` + `cursor` (§3.9; bounds `[ESC-BILL-POLICY]`) |

**Response `200`** — `Doc-4I §HB-4.2` `items`, §3.9 `items`/`page_info`/`reference_id` envelope:

```json
{
  "transaction_id":    "UUIDv7",
  "direction":         "credit | debit",
  "amount":            "numeric",
  "source_invoice_id": "UUIDv7 | null",
  "occurred_at":       "ISO 8601"
}
```

**Errors:** `VALIDATION 400` (`page_size` over POLICY max); `AUTHORIZATION 403`; `NOT_FOUND 404` (cross-org).

---

## §8 — Platform Invoicing & Payments Surface Realization (BC-BILL-5, 4 caller-facing + record_payment out-of-wire)

### §8.1 Section Purpose & Wire Constraints

BC-BILL-5 owns the Platform Invoice (`platform_invoices` + `platform_payments`). **`billing.platform_invoices ≠ operations.trade_invoices` (FIXED — R6/H.9):** platform fees owed to iVendorz only — no trade invoice, escrow, wallet, fund custody, or buyer↔vendor settlement. `record_payment` (gateway callback) is **out-of-wire** (§10/R8). Invoice machine `issued → paid | overdue | void`; payment machine `initiated → succeeded | failed | refunded` (`Doc-4I §H.5`).

- **Disclosure scope:** `get_platform_invoice` / `list_platform_invoices` → **Own-Org (debtor), User-only** (`Doc-4I §HB-5.4`).
- **Actor side:** `issue_platform_invoice` / `update_invoice_status` → **actor-branched** (User leg wired; System in-process; §3.7).

---

### §8.2 Invoice Commands (User leg)

#### `billing.issue_platform_invoice.v1`

| Field | Value |
|---|---|
| Token · Method · Path | `billing.issue_platform_invoice.v1` · `POST /billing/invoices` |
| Actor | **User leg** (`can_manage_billing`) — org self-serve issue; System issue leg (subscription/ad/microsite) in-process (R11) |
| Success | `201 Created` (+ `Location`) |
| Idempotency | `Idempotency-Key` required |
| Audit | **§9 Financial "platform invoice created"** by pointer (`Doc-4I §HB-5.1`) |
| Events | None emitted; System leg consumes ad/microsite metering `[ESC-BILL-EVENT]` (Marketplace DF-BILL-2) |

**Request body** (User leg; debtor `organization_id` = Controlling Org, server-derived):

```json
{
  "purpose":         "enum<subscription|lead_package|advertising|microsite|service> (required; Doc-4I §HB-5.1)",
  "amount":          "numeric — minor units (required; > 0)",
  "currency":        "string (ISO 4217; required)",
  "subscription_id": "UUIDv7 | null — link when purpose=subscription (optional; → BC-BILL-2)"
}
```

**Response `201`** — `Doc-4I §HB-5.1` output, §3.9 envelope:

```json
{
  "invoice_id": "UUIDv7",
  "human_ref":  "string (INV-P-… — Doc-4I §HB-5.1 / Doc-4B ID-gen)",
  "status":     "issued",
  "amount":     "numeric",
  "currency":   "string (ISO 4217)"
}
```

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `purpose`/`currency` invalid; `amount` ≤ 0 |
| `AUTHORIZATION` | `403` | member without `can_manage_billing` |
| `NOT_FOUND` | `404` | debtor org not the actor's Controlling Org (protected-fact collapse) |
| `REFERENCE` | `422` | `subscription_id` does not resolve (`Doc-4I §HB-5.1` stage-7) |
| `BUSINESS` | `422` | would violate platform-fee scope (misclassified as trade — `≠ operations.trade_invoices` FIXED) |

---

#### `billing.update_invoice_status.v1`

| Field | Value |
|---|---|
| Token · Method · Path | `billing.update_invoice_status.v1` · `POST /billing/invoices/{invoice_id}/update-invoice-status` |
| Actor | **User leg** (`can_manage_billing`) — **`void` only**; System leg drives `paid`/`overdue` in-process (R11/`Doc-4I §HB-5.2`) |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` required |
| Audit | `[ESC-BILL-AUDIT]` — invoice status transition not separately §9-enumerated (`Doc-4I §HB-5.2`) |
| Events | None (`Doc-4I §H.7`) |

**Request body** (User leg = void; `paid`/`overdue` are System-only, not wired):

```json
{
  "target_status":   "void (User leg — the only caller-wire target; Doc-4I §HB-5.2)",
  "expected_status": "enum<issued|overdue> (required; optimistic-concurrency assertion — Doc-4A §14; mismatch → 409 CONFLICT)"
}
```

**Response `200`** — `Doc-4I §HB-5.2` output: `{ "invoice_id": "UUIDv7", "status": "issued | paid | overdue | void" }`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `target_status` not `void` on the User leg |
| `AUTHORIZATION` | `403` | member without `can_manage_billing` |
| `NOT_FOUND` | `404` | invoice debtor not the actor's Controlling Org (User-leg protected-fact collapse; `Doc-4I §HB-5.2` stage-7 User branch) |
| `STATE` | `409` | illegal transition (from terminal `paid`/`void`) |
| `CONFLICT` | `409` | `expected_status` mismatch (lost race) |

---

### §8.3 Invoice Reads (User-only)

#### `billing.get_platform_invoice.v1`

| Field | Value |
|---|---|
| Token · Method · Path | `billing.get_platform_invoice.v1` · `GET /billing/invoices/{invoice_id}` |
| Actor | **User** (`can_view_billing`) — User-only (`Doc-4I §HB-5.4`); no Admin ([ESC-BILL-ADMINSCOPE]) |
| Disclosure scope | Own-Org (debtor); cross-org / absent → `404 NOT_FOUND` |

**Response `200`** — `Doc-4I §HB-5.4` `invoice` output, §3.9 envelope:

```json
{
  "invoice_id":      "UUIDv7",
  "human_ref":       "string (INV-P-…)",
  "organization_id": "UUIDv7",
  "purpose":         "subscription | lead_package | advertising | microsite | service",
  "amount":          "numeric",
  "currency":        "string (ISO 4217)",
  "status":          "issued | paid | overdue | void",
  "payments":        [ { "gateway": "sslcommerz | bkash | nagad | bank", "gateway_ref": "string", "status": "initiated | succeeded | failed | refunded" } ]
}
```

**Errors:** `AUTHORIZATION 403`; `NOT_FOUND 404` (`invoice_id` absent or cross-org — protected-fact collapse).

---

#### `billing.list_platform_invoices.v1`

| Field | Value |
|---|---|
| Token · Method · Path | `billing.list_platform_invoices.v1` · `GET /billing/invoices` |
| Actor | **User** (`can_view_billing`) — User-only |
| Disclosure scope | Own-Org (debtor Controlling Org) |
| Pagination · Filter | `page_size`+`cursor`; `filter` allowlist `{ status?, purpose? }` (`Doc-4I §HB-5.4` / `Doc-4A §9.6`); undeclared → `400 VALIDATION` |

**Response `200`** — `Doc-4I §HB-5.4` `items`, §3.9 list envelope:

```json
{
  "invoice_id": "UUIDv7",
  "human_ref":  "string (INV-P-…)",
  "purpose":    "subscription | lead_package | advertising | microsite | service",
  "amount":     "numeric",
  "currency":   "string (ISO 4217)",
  "status":     "issued | paid | overdue | void"
}
```

**Errors:** `VALIDATION 400` (bad filter / `page_size`); `AUTHORIZATION 403`; `NOT_FOUND 404` (cross-org).

---

## §9 — Rewards & Referrals Surface Realization (BC-BILL-6, 5 caller-facing)

### §9.1 Section Purpose & Wire Constraints

BC-BILL-6 owns the Reward Account (`reward_accounts` head + append-only `reward_transactions` + `referrals`). `credit_reward`, `track_referral`, `advance_referral` are actor-branched (R11). Reward points / referral rewards are **promotional balances — never procurement standing** (firewall). Referral machine `pending → qualified → rewarded` (`Doc-4I §H.5`); the reward on `rewarded` is a separate `credit_reward` movement (`Doc-4I §HB-6.2`).

- **Disclosure scope:** `get_reward_balance` / `list_referrals` → **Own-Org, User-only** (`Doc-4I §HB-6.3`).
- **Actor side:** `credit_reward` / `track_referral` / `advance_referral` → **actor-branched** (User leg wired; System in-process; §3.7).

---

### §9.2 Reward & Referral Commands (User leg)

#### `billing.credit_reward.v1`

| Field | Value |
|---|---|
| Token · Method · Path | `billing.credit_reward.v1` · `POST /billing/reward-account/credit-reward` |
| Actor | **User leg = redemption** (`direction=redeem`; authority `[ESC-BILL-SLUG]` — no enumerated §7 redemption slug); System milestone-credit leg in-process (R11/`Doc-4I §HB-6.1`) |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` required; System leg idempotent on `source_event_id` |
| Audit | `[ESC-BILL-AUDIT]` (reward movement not §9-enumerated; `Doc-4I §HB-6.1`) |
| Events | None (`Doc-4I §H.7` — no §8 reward event exists) |

**Request body** (User leg; org server-derived):

```json
{
  "points": "numeric (required; > 0; Doc-4I §HB-6.1)"
}
```

> **Naming artifact (clarify, do not reject):** the contract-ID / slug is `credit_reward` (Doc-4I §HB-6.1 covers both legs), but its **only caller-wire action is `redeem`** — `direction=redeem`, `reason=redemption` are **server-set from the User leg**, not caller-chosen. The `credit` direction (`reason ∈ profile_completion|review|completion`) is the **System** milestone leg, in-process. Implementers must **not** reject `redeem` on the `credit-reward` route — the token name is the Doc-4I contract-ID, not an action constraint.

**Response `200`** — `Doc-4I §HB-6.1` output:

```json
{
  "transaction_id":  "UUIDv7",
  "organization_id": "UUIDv7",
  "direction":       "credit | redeem",
  "points":          "numeric",
  "balance":         "numeric"
}
```

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `points` ≤ 0; `reason`/`direction` invalid |
| `AUTHORIZATION` | `403` | org redemption without the applicable slug (`[ESC-BILL-SLUG]`) |
| `NOT_FOUND` | `404` | `reward_accounts` not the actor's Controlling Org (protected-fact collapse) |
| `BUSINESS` | `422` | redeem exceeds available balance (`Doc-4I §HB-6.1` stage-8) |
| `REFERENCE` | `422` | Controlling Org does not resolve |

---

#### `billing.track_referral.v1`

| Field | Value |
|---|---|
| Token · Method · Path | `billing.track_referral.v1` · `POST /billing/referrals` |
| Actor | **User leg** (`can_manage_billing`) — org self-initiates; System leg n/a for create (R11) |
| Success | `201 Created` (+ `Location`) |
| Idempotency | `Idempotency-Key` required |
| Audit | `[ESC-BILL-AUDIT]` (`Doc-4I §HB-6.2`) |
| Events | None (`Doc-4I §H.7`) |

**Request body** (`referrer_organization_id` = Controlling Org, server-derived):

```json
{
  "referred_organization_id": "UUIDv7 — the referred org (bare UUID; Doc-4I §HB-6.2)"
}
```

**Response `201`** — `Doc-4I §HB-6.2` output: `{ "referral_id": "UUIDv7", "state": "pending" }`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `referred_organization_id` malformed |
| `AUTHORIZATION` | `403` | member without `can_manage_billing` |
| `NOT_FOUND` | `404` | `referrer_organization_id` not the actor's Controlling Org (protected-fact collapse) |
| `REFERENCE` | `422` | `referred_organization_id` does not resolve (`Doc-4I §HB-6.2` stage-7) |
| `BUSINESS` | `422` | duplicate referrer→referred pair (per commercial rule) |

> `referred_organization_id` failure is `REFERENCE` (definitive), **not** `NOT_FOUND` — this is **Doc-4I §HB-6.2-mandated** (the referred org is a *referenced* entity, not the actor's own protected resource; contrast `referral_id` on `advance_referral`, which **is** user-scoped → `NOT_FOUND`). Realize-never-redecide — not a §7.5 non-disclosure leak.

---

#### `billing.advance_referral.v1`

| Field | Value |
|---|---|
| Token · Method · Path | `billing.advance_referral.v1` · `POST /billing/referrals/{referral_id}/advance-referral` |
| Actor | **User leg** (`can_manage_billing`) — referrer advances its own referral; System milestone leg in-process (R11) |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` required |
| Audit | `[ESC-BILL-AUDIT]` (`Doc-4I §HB-6.2`) |
| Events | None (`Doc-4I §H.7`) |

**Request body:**

```json
{
  "target_state":   "enum<qualified|rewarded> (required; Doc-4I §HB-6.2)",
  "expected_state": "enum<pending|qualified> (required; optimistic-concurrency assertion — Doc-4A §14; mismatch → 409 CONFLICT)"
}
```

**Response `200`** — `Doc-4I §HB-6.2` output: `{ "referral_id": "UUIDv7", "state": "pending | qualified | rewarded" }`.

> On `rewarded`, the reward credit is a **separate** `credit_reward` movement (System leg; `Doc-4I §HB-6.2`/§HB-6.1) — not bundled into this response.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `target_state` invalid |
| `AUTHORIZATION` | `403` | member without `can_manage_billing` |
| `NOT_FOUND` | `404` | `referral_id` not in the referrer org's scope (User-leg protected-fact collapse) |
| `STATE` | `409` | illegal transition (forbidden source) |
| `CONFLICT` | `409` | `expected_state` mismatch (lost race) |

---

### §9.3 Reward / Referral Reads (User-only)

#### `billing.get_reward_balance.v1`

| Field | Value |
|---|---|
| Token · Method · Path | `billing.get_reward_balance.v1` · `GET /billing/reward-account` |
| Actor | **User** (`can_view_billing`) — User-only (`Doc-4I §HB-6.3`); no Admin ([ESC-BILL-ADMINSCOPE]) |
| Disclosure scope | Own-Org singleton; cross-org → `404` |

**Response `200`** — `Doc-4I §HB-6.3` output: `{ "organization_id": "UUIDv7", "balance": "numeric" }`.

**Errors:** `AUTHORIZATION 403`; `NOT_FOUND 404` (cross-org).

---

#### `billing.list_referrals.v1`

| Field | Value |
|---|---|
| Token · Method · Path | `billing.list_referrals.v1` · `GET /billing/referrals` |
| Actor | **User** (`can_view_billing`) — User-only |
| Disclosure scope | Own-Org (referrer Controlling Org) |
| Pagination | `page_size`+`cursor` (§3.9) |

**Response `200`** — `Doc-4I §HB-6.3` `items`, §3.9 list envelope:

```json
{
  "referral_id":              "UUIDv7",
  "referred_organization_id": "UUIDv7",
  "state":                    "pending | qualified | rewarded"
}
```

**Errors:** `VALIDATION 400` (`page_size`); `AUTHORIZATION 403`; `NOT_FOUND 404` (cross-org).

---

## §10 — Out-of-Wire Boundary (6 contracts; R1)

**These 6 contracts have NO caller wire in ANY protocol — no REST, SSE, WebSocket, Webhook, or GraphQL. Flag-and-Halt if any wire surface is proposed (an architecture change). Implementation is code / Doc-6.** They appear here for completeness; they instantiate no §5.7 endpoint template.

| Contract | BC | Nature (Doc-4I) | In-process behavior |
|---|---|---|---|
| `billing.renew_subscription.v1` | BC-BILL-2 | System period-end job (`§HB-2.3`; 21.5) | `active → active`; **emits `SubscriptionRenewed`** (R9; outbox via Doc-4B — in-process, not a wire) |
| `billing.expire_subscription.v1` | BC-BILL-2 | System period-end job (`§HB-2.3`) | `active → expired`; **emits `SubscriptionExpired`** (R9; outbox) |
| `billing.resolve_entitlements.v1` | BC-BILL-2 | Entitlement-resolution authority (`§HB-2.4`; internal-service, R10) | reads org subscription → plan bundle, else Basic profile; output `{ organization_id, entitlements[{slug,type,value}], source<active_subscription\|basic_profile> }`; consumed cross-module (Marketplace/RFQ) via service call |
| `billing.record_usage.v1` | BC-BILL-3 | System metering (`§HB-3.1`) | appends `usage_ledger` (`Response: none`); consumes `QuotationSubmitted` (RFQ, DF-BILL-3) + `[ESC-BILL-EVENT]` signals |
| `billing.enforce_quota.v1` | BC-BILL-3 | Quota-enforcement check (`§HB-3.2`; internal-service, R10) | output `{ allowed, quota_key, limit, used, remaining }`; **never a routing/eligibility/procurement decision** (R5/moat); `QUOTA` when exceeded |
| `billing.record_payment.v1` | BC-BILL-5 | **Payment-gateway callback — inbound infra, NOT a Doc-2 §8 event** (`§HB-5.3`; R8) | writes `platform_payments` (`initiated → succeeded\|failed\|refunded`); on `succeeded` drives invoice `→ paid` (§HB-5.2); idempotent on `(invoice_id, gateway_ref, target_status)`; `Response: none` |

> **R8 fence:** `record_payment` is driven by an inbound payment-gateway callback (infrastructure ingress), explicitly **not** a tenant/caller wire and **not** a Doc-2 §8 domain event. **R10 fence:** `resolve_entitlements` + `enforce_quota` are internal-service authorities consumed in-process by owning modules — no HTTP caller surface; `enforce_quota` is a yes/no gate, never a procurement signal (moat). The `SubscriptionRenewed`/`SubscriptionExpired` emissions are in-process outbox writes (R9), not wires.

---

## §11 — Conformance & Carried Items

### §11.1 Conformance Attestation (against `Doc-5A` Appendix A — the freeze gate)

| Band | Result | Evidence |
|---|---|---|
| Anti-invention (`CHK-5A-121`) | **PASS** | No endpoint/status/header/error-class/slug/POLICY-key/event/score coined. Error classes = `Doc-5A §6.2`; tokens = `Doc-4I` verbatim; `human_ref INV-P-…` is Doc-4I-declared |
| Path grammar (`Doc-5A §5.2/§5.3`) | **PASS** | creates → `POST /resource` → `201`; commands → `POST /resource/{id}/{slug}` (or singleton `/lead-account/{slug}`) → `200`; reads → `GET` → `200`; version = header, never path |
| Error map (`Doc-5A §6.2`; realized in §3.8) | **PASS** | §3.8 table (incl. `DEPENDENCY`=503, `SYSTEM`=500): `VALIDATION`=400, `AUTHORIZATION`=403, `STATE`/`CONFLICT`=409, `REFERENCE`/`BUSINESS`=422, `QUOTA`=403 — no remap |
| Envelope (`Doc-5A §5.6`) | **PASS** | §3.9 `{result|items, page_info, reference_id}`; `reference_id` top-level every response; `201` `Location` |
| Pagination (`CHK-5A-070/071`) | **PASS** | `page_size`+`cursor` only; bounds via `[ESC-BILL-POLICY]`, never literal |
| Prohibited request fields (`Doc-4A §9.7`) | **PASS** | no `org_id`/tenant-selection, no lifecycle-state flag; org = `Iv-Active-Organization` |
| Non-disclosure (`Doc-5A §6.3`) | **PASS** | Own-Org cross-tenant + absent → `404`; reads User-only |
| **Billing firewall** (R5/DG-7; M7-unique) | **PASS** | No lead/invoice/reward/referral state gates trust/verification/eligibility/routing/matching; no BC computes/owns a governance score |
| **Platform-invoice ≠ trade-invoice** (R6/FIXED; M7-unique) | **PASS** | BC-BILL-5 platform fees only; `BUSINESS` guard on misclassification; no trade/escrow/wallet/settlement surface |
| **Gateway-callback** (R8; M7-unique) | **PASS** | `record_payment` out-of-wire (§10); inbound infra, not a §8 event; mutates only M7 state |
| **Entitlement-service-authority** (R10; M7-unique) | **PASS** | `resolve_entitlements`+`enforce_quota` out-of-wire; `enforce_quota` never a routing/eligibility/procurement decision |
| Events (R9/H.7) | **PASS** | Only BC-BILL-2 emits 3 §8 events (Pass-2 §5 + §10); BC-BILL-4/5/6 emit none; metering signals = `[ESC-BILL-EVENT]` consumed in-process |

### §11.2 Carried-Items Register (resolved only via named channels — never here)

| ID | Item | Channel | Freeze gate? |
|---|---|---|---|
| `[ESC-BILL-ADMINSCOPE]` | Structure §3 "Admin reads any org" **conflicts** with `Doc-4I §HB-2.5/3.3/4.2/5.4/6.3` (reads User-only). Doc-4I outranks Doc-5I structure | **Corpus conflict** — additive Doc-4I/structure patch with **human approval**; not locally fixed | **Yes** |
| `[ESC-BILL-ACTIVATE]` | `status` `draft→active` edge (Doc-2 §3.8) has **no realizing Doc-4I BC-BILL-1 contract** | Doc-4I additive (a publish/activate contract or explicit attribution) — **human approval**; not locally fixed | **Yes** |
| `[ESC-BILL-POLICY]` | No `billing` POLICY key (page-size, dedup, dunning, refund, reward/referral rules) | Doc-3 §12.2 additive | Tracked (per-contract; not structural) |
| `[ESC-BILL-FIELD]` | Representation fields beyond Doc-4I `§HB` outputs (e.g. plan `description`, subscription `plan_snapshot`/timestamps) | Doc-4I output extension; never reshaped in Doc-5I | Tracked |
| `[ESC-BILL-SLUG]` | No Doc-2 §7 slug for Admin catalog governance / reward redemption | Doc-2 §7 additive; no slug invented | No |
| `[ESC-BILL-AUDIT]` | Lead-credit / invoice-status / reward / referral movements not separately §9-enumerated | Doc-2 §9 additive; nearest action by pointer | No |
| `[ESC-BILL-EVENT]` | Lead-access (Operations) + ad/microsite (Marketplace) metering signals have no §8 emission event | Doc-2 §8 additive if later required; never coined | No |
| DF-BILL-1…8 | Identity / Marketplace / RFQ / Operations / Trust-boundary / Communication / Admin / Platform Core | Per `Doc-4I PassA §A8/§A10` channels; consumed/by-pointer; no surface realized | No |

> Doc-5I coins nothing. `[ESC-BILL-ADMINSCOPE]` and `[ESC-BILL-ACTIVATE]` are **content-freeze gates** carried unchanged from Pass-2 — both are frozen-corpus matters requiring human-approved additive patches, explicitly **not** resolved locally.

---

## Appendix A — Doc-5I Conformance Attestation (Pass-3 closure)

Per-band attestation for the realized M7 surface is recorded in §11.1 (attestations only — no normative behavior; all binding rules live in §0–§10). Band roll-up (full detail + evidence in §11.1):

- Standard bands — anti-invention · path grammar · error map · envelope · pagination · prohibited request fields · non-disclosure · events — **PASS**.
- M7-unique bands — **billing-firewall** · **platform-invoice-≠-trade-invoice** · **gateway-callback** · **entitlement-service-authority** — **PASS**.

**Partition closure:** 26 caller-facing realized (§4: 8 · §5: 4 · §6: 1 · §7: 4 · §8: 4 · §9: 5) + 6 out-of-wire declared (§10) = **32 Doc-4I contracts** — each assigned exactly once; partition table (`Doc-5I_Structure_v1.0_FROZEN.md`) authoritative.

**Open content-freeze gates:** `[ESC-BILL-ADMINSCOPE]`, `[ESC-BILL-ACTIVATE]` (human-approved additive patch), `[ESC-BILL-POLICY]` (Doc-3 §12.2). A Content Freeze Audit follows once these are dispositioned.

---

*Content Independent Hard Review v1.0 patch applied: m-01 (§3.8 table completed with `DEPENDENCY 503`/`SYSTEM 500`; §11.1 mis-citation fixed), m-02 ("minor units" labeled `[realization convention]` — Pass-2 §4.0 + Pass-3 §7.0), m-03 (placeholder `CHK-5A-04x/0xx` → real section pointers), m-04 (`credit_reward` redeem-on-`credit-reward` naming artifact clarified), n-01 (`direction` server-set per leg), n-02 (System-leg realization → code/Doc-6), n-03 (`track_referral` `REFERENCE` Doc-4I-mandated, not a leak), n-04 (Appendix A band roll-up). Carried ESC unchanged; `[ESC-BILL-ADMINSCOPE]` & `[ESC-BILL-ACTIVATE]` NOT locally fixed — routed for human disposition.*

*Pass-3 complete. §7 (4) + §8 (4 wire + record_payment §10) + §9 (5) + §10 (6 out-of-wire) + §11 + Appendix A authored — all fields/outputs/errors traced to `Doc-4I §HB-4/5/6` verbatim; reads User-only; actor-branched contracts realize the User leg only (System in-process, R11). Carried ESC markers unchanged; `[ESC-BILL-ADMINSCOPE]` & `[ESC-BILL-ACTIVATE]` not locally fixed. Doc-5I content (§0–§11 + Appendix A) is now fully drafted across Pass-1/2/3 — next: Doc-5I Content Independent Hard Review → patch → Content Freeze Audit (gated on the two human-approval ESC items).*
