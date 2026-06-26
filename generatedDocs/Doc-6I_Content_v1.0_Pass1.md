# Doc-6I — M7 Billing (`billing`) Schema Realization — Content v1.0 **Pass-1** (§0–§2 · §3.1 Plans & Entitlements · §3.2 Subscriptions)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-1 — Independent Hard Review applied** (1 BLOCKER + 2 MAJOR + 2 MINOR dispositioned; §Review Disposition). Realizes §0–§2 + §3.1 + §3.2. Next: Pass-2 |
| Date | 2026-06-26 |
| Realizes | **Plans & Entitlements** (`plans` + `entitlements` + `plan_entitlements`) + **Subscriptions** (`subscriptions` §5.7 + `subscription_events`) — the **entitlement model** (never plan-name), the **billing firewall**, the one-active partial-unique |
| Authority | `Doc-2 §5.7/§6/§10.8` (the *what*); `Doc-6A` (the *how*); `Doc-6B §4` (consumed); `Doc-6C` (by UUID); `Doc-4I` (+ `ActivatePlan` patch); `Doc-3 v1.6` (`billing.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.8; `billing_cycle`/`entitlement_type`/`subscription_state` sets verbatim; physical specifics §2.5-tagged |
| DDL note | PostgreSQL 15+; Prisma `@@schema("billing")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §0 — Document Control, Precedence & Conformance Obligation
Doc-6I realizes Doc-2 §10.8 against frozen Doc-6A; passes Doc-6A Appendix A; realize-never-redecide; flag-and-halt. `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.6 — 2 `billing.*` keys). Carried: `[ESC-BILL-AUDIT]` (Pass-3). Coins nothing.

## §1 — Scope & the `billing` Table Partition (Pass-1 slice)
Pass-1 realizes **Plans & Entitlements** (§3.1) + **Subscriptions** (§3.2) + the **tenancy/firewall RLS model** (§2). **Deferred:** Usage + Lead Credits + Platform Invoicing → Pass-2; Rewards/Referrals + §4–§8 + Appendix A → Pass-3.

## §2 — Tenancy, Firewall & RLS Model *(the load-bearing section)*
| Class | Pass-1 tables | RLS |
|---|---|---|
| **Platform catalog** | `plans`, `entitlements`, `plan_entitlements` | public-read (marketing config) + admin-write |
| **Org-tenant** | `subscriptions`, `subscription_events` | `organization_id = active_org` + admin |

**Billing firewall (Invariant #6/#10, binding):** **no billing state gates trust/eligibility/routing/matching** — no `billing` column is read by M3/M5; a subscription state never enters a procurement decision. **Entitlements, never plan-name:** the app resolves entitlements via `resolve_entitlements` (internal service over `entitlements`/`plan_entitlements`), **never** "if plan == X". **Financial Tier (M5) ≠ Subscription Plan (M7).** RLS = backstop; authz app-layer (Doc-4I). Tests = Doc-8.

---

## §3.1 — Plans & Entitlements

### §3.1.1 `billing.plans` (catalog; `activate_plan` Doc-4I patch) · §3.1.2 `billing.entitlements` (slug UNIQUE; type) · §3.1.3 `billing.plan_entitlements` (M:N value)
Realizes Doc-2 §10.8. `plans` marketing config (public-read); `entitlements` typed catalog; `plan_entitlements` the per-plan value.

```sql
CREATE TYPE billing.billing_cycle AS ENUM ('monthly','annual');           -- [Doc-2 §10.8 binding]
CREATE TYPE billing.entitlement_type AS ENUM ('boolean','numeric','enum'); -- [Doc-2 §10.8 binding]

CREATE TABLE billing.plans (
  id uuid NOT NULL, name text NOT NULL,                       -- [Doc-2 §10.8]
  billing_cycle billing.billing_cycle NOT NULL,               -- [Doc-2 §10.8]
  price numeric NOT NULL, currency char(3) NOT NULL DEFAULT 'BDT',  -- [Doc-2 §10.8 / R9]
  is_active boolean NOT NULL DEFAULT false,                   -- [Doc-2 §10.8 / Doc-4I ActivatePlan patch] draft→active = set is_active
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §10.8] SD = retire
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);

CREATE TABLE billing.entitlements (
  id uuid NOT NULL, slug text NOT NULL,                       -- [Doc-2 §10.8] slug UNIQUE
  type billing.entitlement_type NOT NULL,                     -- [Doc-2 §10.8]
  default_value jsonb,                                        -- [Doc-2 §10.8] (boolean/numeric/enum default; [§2.5] jsonb)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                           -- [Doc-2 §0.2] (NO SD)
  CONSTRAINT entitlements_pkey PRIMARY KEY (id),
  CONSTRAINT entitlements_slug_uq UNIQUE (slug)               -- [Doc-2 §10.8 binding]
);

CREATE TABLE billing.plan_entitlements (
  plan_id uuid NOT NULL, entitlement_id uuid NOT NULL,        -- [Doc-2 §10.8] composite PK
  value_jsonb jsonb NOT NULL,                                 -- [Doc-2 §10.8] per-plan value
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,
  CONSTRAINT plan_entitlements_pkey PRIMARY KEY (plan_id, entitlement_id),  -- [Doc-2 §10.8]
  CONSTRAINT plan_entitlements_plan_fk FOREIGN KEY (plan_id) REFERENCES billing.plans(id),
  CONSTRAINT plan_entitlements_entitlement_fk FOREIGN KEY (entitlement_id) REFERENCES billing.entitlements(id)
);
```
- **Entitlements not plan-name (BL-CR4):** `resolve_entitlements` reads `plan_entitlements.value_jsonb` (falling back to `entitlements.default_value`) — the gate is the **entitlement value**, never the plan name. **`activate_plan` (Doc-4I patch):** the `draft→active` transition sets `is_active` (service). **RLS:** catalog public-read + admin-write (§3.x). **Prisma [§2.5]:** `Plan`/`Entitlement`/`PlanEntitlement`, enums.

## §3.2 — Subscriptions

### §3.2.1 `billing.subscriptions` (§5.7; one-active partial-unique) · §3.2.2 `billing.subscription_events` (append-only; 3 §8 events)
Realizes Doc-2 §10.8 + §5.7. `organization_id` tenant; `state` §5.7; one active per org. `subscription_events` append-only.

```sql
CREATE TYPE billing.subscription_state AS ENUM ('pending_payment','active','expired');  -- [Doc-2 §5.7 binding]
CREATE TYPE billing.subscription_event_type AS ENUM ('purchase','renew','expire','cancel');  -- [Doc-2 §10.8 binding]

CREATE TABLE billing.subscriptions (
  id uuid NOT NULL, organization_id uuid NOT NULL,            -- [Doc-2 §10.8] tenant
  plan_id uuid NOT NULL,                                      -- [Doc-6A §5.2] in-module FK
  state billing.subscription_state NOT NULL DEFAULT 'pending_payment',  -- [Doc-2 §5.7]
  period_start timestamptz, period_end timestamptz,           -- [Doc-2 §10.8]
  auto_renew boolean NOT NULL DEFAULT true,                   -- [Doc-2 §10.8]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_plan_fk FOREIGN KEY (plan_id) REFERENCES billing.plans(id)
);
CREATE UNIQUE INDEX subscriptions_active_uq ON billing.subscriptions (organization_id) WHERE state = 'active' AND deleted_at IS NULL;  -- [Doc-2 §10.8 binding] one active sub per org

CREATE TABLE billing.subscription_events (
  id uuid NOT NULL, subscription_id uuid NOT NULL,            -- [Doc-6A §5.2] in-module FK
  event_type billing.subscription_event_type NOT NULL,       -- [Doc-2 §10.8]
  occurred_at timestamptz NOT NULL DEFAULT now(), payload_jsonb jsonb,  -- [Doc-2 §10.8] ([§2.5] payload)
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.8] (NO SD — append-only)
  CONSTRAINT subscription_events_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_events_subscription_fk FOREIGN KEY (subscription_id) REFERENCES billing.subscriptions(id)
);
CREATE TRIGGER subscription_events_immutable BEFORE UPDATE OR DELETE ON billing.subscription_events FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation('id','subscription_id','event_type','occurred_at','payload_jsonb','created_at','created_by');  -- [Doc-6B §4] append-only
```
- **§5.7 (BL-CR5):** `pending_payment→active` (payment confirmed); `active→active` (cancel = auto_renew false, runs to period end; renew); `active→expired` (period end + no-renew/payment-fail); `expired→pending_payment` (repurchase). Entitlements resolve only from `active` (else Basic — A-11). **3 §8 events (Doc-5I R9):** the subscription lifecycle emits `SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired` (write the business row + `core.outbox_events` in one txn); `subscription_events` logs all transitions (incl. cancel). **RLS:** org-tenant (§3.x). **Prisma [§2.5]:** `Subscription`/`SubscriptionEvent`, enums.

## §3.x — Consolidated RLS DDL (Pass-1)
```sql
-- plans / entitlements / plan_entitlements: catalog public-read + admin-write
ALTER TABLE billing.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY plans_public_read ON billing.plans FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY plans_admin ON billing.plans FOR ALL USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- entitlements / plan_entitlements: same (public-read catalog + admin-write).

-- subscriptions / subscription_events: org-tenant + admin
ALTER TABLE billing.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_tenant ON billing.subscriptions FOR ALL
  USING (organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- subscription_events: read via parent subscription (org or admin); append-only (trigger blocks UPDATE/DELETE)
ALTER TABLE billing.subscription_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscription_events_tenant ON billing.subscription_events FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM billing.subscriptions s WHERE s.id = subscription_events.subscription_id
                      AND s.organization_id = current_setting('app.active_org', true)::uuid))
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM billing.subscriptions s WHERE s.id = subscription_events.subscription_id
                      AND s.organization_id = current_setting('app.active_org', true)::uuid));
```

---

## Review Disposition (Independent Hard Review — Pass-1)

Reviewer: independent. Verified CORRECT: the 5-table set + columns (Doc-2 §10.8), §5.7 state set verbatim, `billing_cycle`/`entitlement_type`/`event_type` sets verbatim, entitlement slug UNIQUE, subscription one-active partial-unique, composite PK on `plan_entitlements`, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **PLAN-NAME** if `resolve_entitlements` keyed on plan name, Invariant #10 breached | BLOCKER (Invariant #10) | **FIXED** — §3.1.1/§2: the gate is the **entitlement value** (`plan_entitlements.value_jsonb` / `default_value`), never the plan name; `entitlement_type` typed. |
| **ACTIVE-UQ** subscriptions one-active partial-unique missing | MAJOR | **FIXED** — `UNIQUE(organization_id) WHERE state='active' AND deleted_at IS NULL`. |
| **EVT-IMM** `subscription_events` "append-only" without a guard | MAJOR | **FIXED** — full append-only trigger via `core.raise_immutable_violation` (all cols); DELETE blocked. |
| **FIREWALL** no billing state read by M3/M5 | MINOR | **CONFIRMED** — §2: billing firewall; no cross-schema read; subscription state never gates procurement. |
| **§8-EVT** only 3 subscription §8 events | MINOR | **CONFIRMED** — Doc-5I R9: `SubscriptionPurchased`/`Renewed`/`Expired`; `subscription_events` logs all; none coined. |

**Net:** 1 BLOCKER (plan-name gate) + 2 MAJOR (one-active unique, event immutability) fixed; 2 MINOR confirmed. Entitlements-not-plan + firewall intact. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6I Content Pass-1 (§0–§2 · §3.1 Plans & Entitlements · §3.2 Subscriptions) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the entitlement catalog (slug UNIQUE; typed value; **resolve by value, never plan-name** — Invariant #10), the §5.7 subscription machine (one-active partial-unique; 3 §8 events), and the append-only subscription events. The billing firewall (no billing state gates procurement) is the load-bearing §2 posture. Columns verbatim Doc-2 §10.8; states verbatim; coins nothing. Next: Pass-2 (Usage `usage_ledger` + Lead Credits + Platform Invoicing — the money, gateway, `INV-P-…`, record_payment=callback).*
