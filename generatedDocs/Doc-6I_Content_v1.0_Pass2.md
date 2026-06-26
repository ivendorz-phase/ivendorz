# Doc-6I — M7 Billing (`billing`) Schema Realization — Content v1.0 **Pass-2** (§3.3 Usage · §3.4 Lead Credits · §3.5 Platform Invoicing)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-2 — Independent Hard Review applied** (1 BLOCKER + 2 MAJOR + 2 MINOR dispositioned; §Review Disposition). Realizes §3.3 + §3.4 + §3.5. Next: Pass-3 |
| Date | 2026-06-26 |
| Realizes | **Usage** (`usage_ledger` — append-only; controlling-org attribution) + **Lead Credits** (`lead_credit_accounts` + `lead_credit_transactions`) + **Platform Invoicing** (`platform_invoices` `INV-P-…` + `platform_payments` gateway — the platform's own revenue) |
| Authority | `Doc-2 §8/§10.8` (the *what*); `Doc-6A` (the *how*); `Doc-6B §3.3/§4` (consumed); `Doc-4I` (M7 ownership; R8 `record_payment`=callback); `Doc-3 v1.6` |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.8; `usage_source`/`invoice_status`/`invoice_purpose`/`gateway`/`payment_status` sets verbatim; `currency` per value field = R9; physical specifics §2.5-tagged |
| DDL note | PostgreSQL 15+; Prisma `@@schema("billing")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.3 — `billing.usage_ledger` (append-only; controlling-org attribution; quota)
Realizes Doc-2 §10.8. In-module FK → `entitlements`; `organization_id` (controlling org — attribution); `acting_user_id`/`consuming_entity_id` (M1/polymorphic); **NO SD append-only**.

```sql
CREATE TYPE billing.usage_source AS ENUM ('rfq_response','lead_access','ad_launch');  -- [Doc-2 §10.8 binding]

CREATE TABLE billing.usage_ledger (
  id uuid NOT NULL, entitlement_id uuid NOT NULL,             -- [Doc-6A §5.2] in-module FK
  organization_id uuid NOT NULL,                             -- [Doc-2 §10.8] Controlling Org — attribution ALWAYS to controlling org
  acting_user_id uuid,                                       -- [Doc-2 §10.8] bare UUID → M1
  consuming_entity_id uuid,                                  -- [Doc-2 §10.8] bare UUID (rfq/lead/ad — polymorphic)
  quota_key text NOT NULL, amount numeric NOT NULL,          -- [Doc-2 §10.8] quota units (NOT money)
  period text,                                               -- [Doc-2 §10.8]
  source billing.usage_source NOT NULL,                      -- [Doc-2 §10.8]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.8] (NO SD — append-only)
  CONSTRAINT usage_ledger_pkey PRIMARY KEY (id),
  CONSTRAINT usage_ledger_entitlement_fk FOREIGN KEY (entitlement_id) REFERENCES billing.entitlements(id)
);
CREATE INDEX usage_ledger_org_quota_idx ON billing.usage_ledger (organization_id, quota_key, period);  -- [§2.5] enforce_quota sum
CREATE TRIGGER usage_ledger_immutable BEFORE UPDATE OR DELETE ON billing.usage_ledger FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','entitlement_id','organization_id','acting_user_id','consuming_entity_id','quota_key','amount','period','source','created_at','created_by');  -- [Doc-6B §4]
```
- **Controlling-org attribution (BL-CR6):** every usage row attributes to the **Controlling Org** regardless of the acting representative; `enforce_quota` sums `amount` per `(organization_id, quota_key, period)`. `amount` = quota units, **not money**. **Never a procurement decision** (firewall). **RLS:** org-tenant (§3.x). **Prisma [§2.5]:** `UsageLedger`, enum `UsageSource`.

## §3.4 — Lead Credits

### §3.4.1 `billing.lead_credit_accounts` (balance head; UNIQUE partial) · §3.4.2 `billing.lead_credit_transactions` (append-only)
Realizes Doc-2 §10.8. `organization_id` UNIQUE partial; balance = **credits, not currency**. Transactions credit/debit append-only; `source_invoice_id` → `platform_invoices`.

```sql
CREATE TYPE billing.lead_credit_txn_type AS ENUM ('credit','debit');  -- [Doc-2 §10.8 binding]

CREATE TABLE billing.lead_credit_accounts (
  id uuid NOT NULL, organization_id uuid NOT NULL,           -- [Doc-2 §10.8] tenant
  balance numeric NOT NULL DEFAULT 0,                        -- [Doc-2 §10.8] lead credits (units, not money)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT lead_credit_accounts_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX lead_credit_accounts_org_uq ON billing.lead_credit_accounts (organization_id) WHERE deleted_at IS NULL;  -- [Doc-2 §10.8 binding]

CREATE TABLE billing.lead_credit_transactions (
  id uuid NOT NULL, lead_credit_account_id uuid NOT NULL,    -- [Doc-6A §5.2] in-module FK
  txn_type billing.lead_credit_txn_type NOT NULL,            -- [Doc-2 §10.8] credit/debit
  amount numeric NOT NULL,                                   -- [Doc-2 §10.8] credits
  source_invoice_id uuid,                                    -- [Doc-6A §5.2] in-module FK → platform_invoices (credit purchase)
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.8] (NO SD — append-only)
  CONSTRAINT lead_credit_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT lead_credit_transactions_account_fk FOREIGN KEY (lead_credit_account_id) REFERENCES billing.lead_credit_accounts(id)
  -- NOTE (DDL-1): source_invoice_id FK → platform_invoices added inline (platform_invoices is §3.5, same pass, migrated first per §7)
);
CREATE TRIGGER lead_credit_transactions_immutable BEFORE UPDATE OR DELETE ON billing.lead_credit_transactions FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','lead_credit_account_id','txn_type','amount','source_invoice_id','created_at','created_by');  -- [Doc-6B §4] append-only
```
- **Balance = credits (BL-CR7):** the account `balance` is a **credit count, not money** (lead packages purchased); transactions append-only; the balance is the System-maintained running total (the transactions are the source of truth). **RLS:** org-tenant (§3.x). **Prisma [§2.5]:** `LeadCreditAccount`/`LeadCreditTransaction`, enum.

## §3.5 — Platform Invoicing (the platform's own revenue)

### §3.5.1 `billing.platform_invoices` (`INV-P-…`; status; purpose; **≠ trade_invoices**) · §3.5.2 `billing.platform_payments` (gateway)
Realizes Doc-2 §10.8. `platform_invoices` `human_ref INV-P-…`; `amount`+`currency`; `status`/`purpose`; → `subscriptions` nullable; **NO SD**. `platform_payments` gateway; `record_payment` = callback.

```sql
CREATE TYPE billing.invoice_status AS ENUM ('issued','paid','overdue','void');  -- [Doc-2 §10.8 binding]
CREATE TYPE billing.invoice_purpose AS ENUM ('subscription','lead_package','advertising','microsite','service');  -- [Doc-2 §10.8 binding]
CREATE TYPE billing.payment_gateway AS ENUM ('sslcommerz','bkash','nagad','bank');  -- [Doc-2 §10.8 binding]
CREATE TYPE billing.payment_status AS ENUM ('initiated','succeeded','failed','refunded');  -- [Doc-2 §10.8 binding]

CREATE TABLE billing.platform_invoices (
  id uuid NOT NULL,
  human_ref text NOT NULL,                                   -- [Doc-2 §10.8] INV-P-… via core.allocate_human_ref('INV-P', year)
  organization_id uuid NOT NULL,                             -- [Doc-2 §10.8] tenant + platform
  subscription_id uuid,                                      -- [Doc-6A §5.2] nullable in-module FK
  amount numeric NOT NULL, currency char(3) NOT NULL DEFAULT 'BDT',  -- [Doc-2 §10.8 / R9] PLATFORM revenue (≠ trade)
  status billing.invoice_status NOT NULL DEFAULT 'issued',   -- [Doc-2 §10.8]
  purpose billing.invoice_purpose NOT NULL,                  -- [Doc-2 §10.8]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT platform_invoices_pkey PRIMARY KEY (id),
  CONSTRAINT platform_invoices_human_ref_uq UNIQUE (human_ref),
  CONSTRAINT platform_invoices_subscription_fk FOREIGN KEY (subscription_id) REFERENCES billing.subscriptions(id)
  -- NO FK to operations.* — platform_invoices ≠ operations.trade_invoices (firewall, BL-CR2)
);
CREATE INDEX platform_invoices_org_status_idx ON billing.platform_invoices (organization_id, status);  -- [§2.5]
CREATE TRIGGER platform_invoices_immutable BEFORE UPDATE OR DELETE ON billing.platform_invoices FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','human_ref','organization_id','subscription_id','amount','currency','purpose','created_at','created_by');  -- [Doc-6B §4] money frozen; status mutable; DELETE blocked

CREATE TABLE billing.platform_payments (
  id uuid NOT NULL, platform_invoice_id uuid NOT NULL,       -- [Doc-6A §5.2] in-module FK
  gateway billing.payment_gateway NOT NULL,                  -- [Doc-2 §10.8]
  gateway_ref text,                                          -- [Doc-2 §10.8]
  status billing.payment_status NOT NULL DEFAULT 'initiated',-- [Doc-2 §10.8]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT platform_payments_pkey PRIMARY KEY (id),
  CONSTRAINT platform_payments_invoice_fk FOREIGN KEY (platform_invoice_id) REFERENCES billing.platform_invoices(id)
);
CREATE TRIGGER platform_payments_immutable BEFORE UPDATE OR DELETE ON billing.platform_payments FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','platform_invoice_id','gateway','created_at','created_by');  -- [Doc-6B §4] gateway frozen; status/gateway_ref mutable (callback); DELETE blocked
```
- **Platform's own revenue (BL-CR2):** `platform_invoices` is the **platform** charging its customer (subscription/lead-package/advertising/microsite/service) — **`≠ operations.trade_invoices`** (no FK to `operations`; firewalled). `platform_payments` = the **gateway** collecting **platform money** (the platform DOES handle its own revenue; the untouched flow is buyer↔vendor TRADE, M4). **`record_payment` = gateway callback (Doc-5I R8)** — it advances `platform_payments.status` (and on success the invoice `→paid`); **not a §8 event**. **No `amount` on `platform_payments`** (Doc-2 §10.8 lists none; the invoice carries the amount; not coined). **RLS:** org-tenant read + System (gateway) write (§3.x). **Prisma [§2.5]:** `PlatformInvoice`/`PlatformPayment`, enums.

## §3.x — Consolidated RLS DDL (Pass-2)
```sql
-- usage_ledger / lead_credit_accounts / lead_credit_transactions / platform_invoices: org-tenant + admin
ALTER TABLE billing.usage_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY usage_ledger_tenant ON billing.usage_ledger FOR ALL
  USING (organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- lead_credit_accounts: same org-tenant policy.
-- platform_invoices: same org-tenant policy (+ platform staff).
-- lead_credit_transactions: via parent account (org or admin); append-only (trigger blocks UPDATE/DELETE).
-- platform_payments: org read via parent invoice + admin; System (gateway) writes (record_payment callback):
ALTER TABLE billing.platform_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY platform_payments_read ON billing.platform_payments FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM billing.platform_invoices i WHERE i.id = platform_payments.platform_invoice_id
                      AND i.organization_id = current_setting('app.active_org', true)::uuid));
CREATE POLICY platform_payments_admin ON billing.platform_payments FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (the gateway callback writes payments via the System/owner-role service path; status/gateway_ref advance under the immutability trigger.)
```

---

## Review Disposition (Independent Hard Review — Pass-2)

Reviewer: independent. Verified CORRECT: the 5-table set + columns (Doc-2 §10.8), `usage_source`/`invoice_status`/`invoice_purpose`/`gateway`/`payment_status` sets verbatim, `INV-P-` human_ref, lead-account UNIQUE partial, `≠ trade_invoices` firewall, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **INV-LINK** any FK from `platform_invoices` to `operations.trade_invoices` breaches the firewall | BLOCKER (BL-CR2) | **FIXED** — §3.5.1: **no `operations` FK**; `platform_invoices` is platform revenue, firewalled from the buyer↔vendor trade invoice. |
| **MONEY-IMM** invoices/payments money facts freely mutable | MAJOR | **FIXED** — column-scoped triggers: invoice `amount`/`currency`/`human_ref`/`purpose` frozen (status mutable); payment `gateway` frozen (status/gateway_ref mutable, callback); DELETE blocked. |
| **LEDGER-IMM** `usage_ledger`/`lead_credit_transactions` "append-only" without guards | MAJOR | **FIXED** — full append-only triggers via `core.raise_immutable_violation` (all cols). |
| **PAY-AMOUNT** `platform_payments` amount column | MINOR | **CONFIRMED no-coin** — Doc-2 §10.8 lists no amount on `platform_payments`; the invoice carries the amount; platform invoices are paid-in-full (no `partially_paid` status, unlike trade); none invented. |
| **CREDIT-MONEY** lead-credit balance as currency | MINOR | **CONFIRMED units** — lead credits are a **count**, not money (no currency column); transactions are the source of truth. |

**Net:** 1 BLOCKER (invoice firewall link) + 2 MAJOR (money immutability, ledger immutability) fixed; 2 MINOR confirmed. Platform revenue firewalled from trade; money facts immutable. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6I Content Pass-2 (§3.3 Usage · §3.4 Lead Credits · §3.5 Platform Invoicing) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the append-only usage ledger (controlling-org attribution; enforce_quota), the lead-credit account + append-only transactions (credits, not money), and the platform invoicing (`INV-P-…`; **`≠ operations.trade_invoices`**, no FK; gateway payments; `record_payment` = callback, not a §8 event; money facts column-scoped immutable). Columns verbatim Doc-2 §10.8; states verbatim; `currency` per value field; coins nothing. Next: Pass-3 (Rewards/Referrals + §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A).*
