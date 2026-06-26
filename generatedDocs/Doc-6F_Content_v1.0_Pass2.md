# Doc-6F — M4 Operations (`operations`) Schema Realization — Content v1.0 **Pass-2** (§3.3 Engagement + post-award documents)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-2 — Independent Hard Review applied** (1 BLOCKER + 3 MAJOR + 2 MINOR dispositioned; §Review Disposition). Realizes §3.3. Next: Pass-3 |
| Date | 2026-06-26 |
| Realizes | the **Engagement aggregate** — `engagements` (two-sided party-column RLS) + `lois`/`purchase_orders`/`challans`/`work_completion_certificates` (versioned `DOC-…`) + `trade_invoices` (`INV-…`; **≠ `billing.platform_invoices`**) + `payment_records` (**records only; no funds custody**) |
| Authority | `Doc-2 §6/§8/§10.5/§10.11` (the *what*); `Doc-6A` (the *how*); `Doc-6B §3.3/§4` (consumed); `Doc-6E` (rfq UUID + award event); `Doc-4F` (M4 ownership); `Doc-3 v1.4` (`operations.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.5; `engagement`/`trade_invoice`/`payment` state sets verbatim; `currency` per value field = R9/§0.4; `ENG-`/`DOC-`/`INV-` prefixes (`ENG-` = §2.5-carried) |
| DDL note | PostgreSQL 15+; Prisma `@@schema("operations")`. `template_version_id` → `template_versions` (Pass-3) = deferred FK. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.3 — The Engagement aggregate (two-sided; money boundary)

### §3.3.1 `operations.engagements` (AR; two-sided party columns; `status`; award snapshot)
Realizes Doc-2 §10.5. Party columns `buyer_organization_id` + `vendor_controlling_org_id` (both → M1, bare UUID); `rfq_id`/`vendor_profile_id` bare UUID → M3/M2; `human_ref` (`ENG-…`); YES SD (close/archive). **Created on the M3 award event** (`closed_won`).

```sql
CREATE TYPE operations.engagement_status AS ENUM ('open','in_delivery','completed','closed');  -- [Doc-2 §10.5 binding]

CREATE TABLE operations.engagements (
  id uuid NOT NULL,
  human_ref text NOT NULL,                                      -- [Doc-2 §10.5] ENG-YYYY-NNNNNN via core.allocate_human_ref('ENG', year) — 'ENG' prefix [§2.5]
  rfq_id uuid NOT NULL,                                         -- [Doc-2 §10.5] bare UUID → M3
  buyer_organization_id uuid NOT NULL,                          -- [Doc-2 §10.5] bare UUID → M1 — PARTY column (RLS)
  vendor_profile_id uuid NOT NULL,                              -- [Doc-2 §10.5] bare UUID → M2
  vendor_controlling_org_id uuid NOT NULL,                      -- [Doc-2 §10.5] bare UUID → M1 — PARTY column (RLS)
  status operations.engagement_status NOT NULL DEFAULT 'open',  -- [Doc-2 §10.5]
  award_value numeric,                                          -- [Doc-2 §10.5] award value snapshot
  award_currency char(3) NOT NULL DEFAULT 'BDT',               -- [Doc-6A R9 / Doc-2 §0.4] currency per value field
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §10.5] SD = close/archive
  CONSTRAINT engagements_pkey PRIMARY KEY (id),
  CONSTRAINT engagements_human_ref_uq UNIQUE (human_ref)
);
CREATE INDEX engagements_buyer_idx  ON operations.engagements (buyer_organization_id, status) WHERE deleted_at IS NULL;        -- [§2.5] Band H
CREATE INDEX engagements_vendor_idx ON operations.engagements (vendor_controlling_org_id, status) WHERE deleted_at IS NULL;    -- [§2.5] two-sided list
```
- **Two-sided RLS (OP-CR3):** `active_org IN (buyer_organization_id, vendor_controlling_org_id)` OR admin (§3.x) — both parties + platform staff. **Created on the M3 award event** (consumer; M4's own schema); `closed`→ M5 performance/public-review eligibility (emit). **`status`**: `open→in_delivery→completed→closed`; service/event. **Prisma [§2.5]:** `Engagement`, enum `EngagementStatus`.

### §3.3.2 `operations.lois` · `purchase_orders` · `challans` · `work_completion_certificates` (versioned `DOC-…`)
Realizes Doc-2 §10.5. In-module FK → `engagements`; `template_version_id` → `template_versions` (Pass-3, **deferred FK**); `human_ref` `DOC-…`; **NO SD; versioned** (column-scoped immutability — only `is_active_revision` toggles). Identical shape for all four.

```sql
-- representative: operations.lois (purchase_orders / challans / work_completion_certificates are structurally identical)
CREATE TABLE operations.lois (
  id uuid NOT NULL,
  human_ref text NOT NULL,                                      -- [Doc-2 §10.5] DOC-… via core.allocate_human_ref('DOC', year)
  engagement_id uuid NOT NULL,                                  -- [Doc-6A §5.2] in-module FK
  template_version_id uuid,                                     -- [Doc-2 §10.5] in-module → template_versions (Pass-3; deferred ALTER, DDL-1)
  counterparty_organization_id uuid,                            -- [Doc-2 §10.5] bare UUID → M1 (the counterparty)
  version_no integer NOT NULL DEFAULT 1,                        -- [Doc-2 §10.5]
  content_jsonb jsonb,                                          -- [Doc-2 §10.5]
  storage_ref text,                                            -- [Doc-2 §10.5]
  revision_reason text,                                        -- [Doc-2 §10.5]
  is_active_revision boolean NOT NULL DEFAULT true,            -- [Doc-2 §10.5] only mutable column
  issued_by uuid,                                              -- [Doc-2 §10.5] bare UUID → M1
  issued_at timestamptz,                                       -- [Doc-2 §10.5]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT lois_pkey PRIMARY KEY (id),
  CONSTRAINT lois_human_ref_uq UNIQUE (human_ref),
  CONSTRAINT lois_engagement_fk FOREIGN KEY (engagement_id) REFERENCES operations.engagements(id)
  -- NOTE (DDL-1): template_version_id FK deferred (template_versions is Pass-3); added by ALTER in §7 migration.
);
-- column-scoped immutability (Doc-2 §10.11 #6; Doc-6D spec_documents pattern) — content frozen; only is_active_revision toggles; DELETE blocked:
CREATE TRIGGER lois_immutable BEFORE UPDATE OR DELETE ON operations.lois FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','human_ref','engagement_id','template_version_id','counterparty_organization_id','version_no','content_jsonb',
    'storage_ref','revision_reason','issued_by','issued_at','created_at','created_by');  -- [Doc-6B §4]
-- purchase_orders / challans / work_completion_certificates: identical table + trigger (s/lois/<table>/).
```
- **Versioned, never overwritten (Doc-2 §10.5):** new revision = new row; the prior's `is_active_revision` cleared. **RLS:** two-sided via parent engagement (§3.x). **Prisma [§2.5]:** `Loi`/`PurchaseOrder`/`Challan`/`WorkCompletionCertificate`.

### §3.3.3 `operations.trade_invoices` (versioned + status-tracked; `INV-…`; **≠ platform_invoices**)
Realizes Doc-2 §10.5. In-module FK → `engagements`; `human_ref` `INV-…`; `amount`+`currency` (R9); `status` tracked; **NO SD**.

```sql
CREATE TYPE operations.trade_invoice_status AS ENUM ('issued','partially_paid','paid','disputed','cancelled');  -- [Doc-2 §10.5 binding]

CREATE TABLE operations.trade_invoices (
  id uuid NOT NULL,
  human_ref text NOT NULL,                                      -- [Doc-2 §10.5] INV-… via core.allocate_human_ref('INV', year)
  engagement_id uuid NOT NULL,                                  -- [Doc-6A §5.2] in-module FK
  amount numeric NOT NULL,                                      -- [Doc-2 §10.5] (the buyer↔vendor trade amount — NOT platform revenue)
  currency char(3) NOT NULL DEFAULT 'BDT',                     -- [Doc-6A R9 / Doc-2 §0.4]
  status operations.trade_invoice_status NOT NULL DEFAULT 'issued',  -- [Doc-2 §10.5]
  due_date timestamptz,                                         -- [Doc-2 §10.5]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT trade_invoices_pkey PRIMARY KEY (id),
  CONSTRAINT trade_invoices_human_ref_uq UNIQUE (human_ref),
  CONSTRAINT trade_invoices_engagement_fk FOREIGN KEY (engagement_id) REFERENCES operations.engagements(id)
);
CREATE INDEX trade_invoices_engagement_idx ON operations.trade_invoices (engagement_id, status);  -- [§2.5]

-- money facts immutable once issued; only status + due_date may change (column-scoped; HR-F1):
CREATE TRIGGER trade_invoices_immutable BEFORE UPDATE OR DELETE ON operations.trade_invoices FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','human_ref','engagement_id','amount','currency','created_at','created_by');  -- [Doc-6B §4] amount/currency/ref frozen; status/due_date mutable; DELETE blocked
```
- **Firewall (OP-CR4, Doc-2 §10.5):** `trade_invoices` is the **buyer↔vendor** document — **`≠ billing.platform_invoices`** (the platform's own revenue, M7). The platform records the trade invoice; it **never settles or holds funds** for it. `status` is service-driven (`issued→partially_paid→paid`, or `disputed`/`cancelled`). **RLS:** two-sided via engagement (§3.x). **Prisma [§2.5]:** `TradeInvoice`, enum `TradeInvoiceStatus`.

### §3.3.4 `operations.payment_records` (records only — **no funds custody**)
Realizes Doc-2 §10.5. In-module FKs → `trade_invoices` (optional) + `engagements`; `amount`+`currency`; `status(recorded/confirmed)`; **NO SD; records only**.

```sql
CREATE TYPE operations.payment_status AS ENUM ('recorded','confirmed');  -- [Doc-2 §10.5 binding]

CREATE TABLE operations.payment_records (
  id uuid NOT NULL,
  engagement_id uuid NOT NULL,                                  -- [Doc-6A §5.2] in-module FK
  trade_invoice_id uuid,                                        -- [Doc-6A §5.2] optional in-module FK
  amount numeric NOT NULL,                                      -- [Doc-2 §10.5] recorded amount (NOT a settlement)
  currency char(3) NOT NULL DEFAULT 'BDT',                     -- [Doc-6A R9]
  paid_at timestamptz,                                          -- [Doc-2 §10.5]
  method_note text,                                            -- [Doc-2 §10.5]
  status operations.payment_status NOT NULL DEFAULT 'recorded', -- [Doc-2 §10.5]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT payment_records_pkey PRIMARY KEY (id),
  CONSTRAINT payment_records_engagement_fk FOREIGN KEY (engagement_id) REFERENCES operations.engagements(id),
  CONSTRAINT payment_records_invoice_fk FOREIGN KEY (trade_invoice_id) REFERENCES operations.trade_invoices(id)
);
-- money facts immutable, only status (recorded→confirmed) toggles (column-scoped):
CREATE TRIGGER payment_records_immutable BEFORE UPDATE OR DELETE ON operations.payment_records FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','engagement_id','trade_invoice_id','amount','currency','paid_at','method_note','created_at','created_by');  -- [Doc-6B §4]
```
- **No funds custody (OP-CR4; Doc-2 §10.5):** `payment_records` is a **record of an off-platform payment** — there is **no** gateway, escrow, wallet, or balance column. The platform **never holds buyer↔vendor money**. `status` confirms a record, not a settlement. **RLS:** two-sided via engagement (§3.x). **Prisma [§2.5]:** `PaymentRecord`, enum `PaymentStatus`.

## §3.x — Consolidated RLS DDL (Pass-2 — two-sided party columns)
```sql
-- ===== engagements: two-sided (both party columns) + admin =====
ALTER TABLE operations.engagements ENABLE ROW LEVEL SECURITY;
CREATE POLICY engagements_parties ON operations.engagements FOR ALL
  USING (current_setting('app.active_org', true)::uuid IN (buyer_organization_id, vendor_controlling_org_id)
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.active_org', true)::uuid IN (buyer_organization_id, vendor_controlling_org_id)
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- ===== child docs (lois/po/challans/wcc/trade_invoices/payment_records): two-sided via parent engagement (intra-schema EXISTS) =====
-- pattern (shown for trade_invoices; the five others identical, s/trade_invoices/<table>/):
ALTER TABLE operations.trade_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY trade_invoices_parties ON operations.trade_invoices FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM operations.engagements e WHERE e.id = trade_invoices.engagement_id
                      AND current_setting('app.active_org', true)::uuid IN (e.buyer_organization_id, e.vendor_controlling_org_id)))
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM operations.engagements e WHERE e.id = trade_invoices.engagement_id
                      AND current_setting('app.active_org', true)::uuid IN (e.buyer_organization_id, e.vendor_controlling_org_id)));
-- (UPDATE/DELETE further constrained by the column-scoped immutability triggers; the policy governs SELECT/INSERT + the mutable columns.)
```
- **Nested-RLS note:** the child `EXISTS(engagements e …)` reads `engagements` under its own two-sided RLS (which the active party satisfies) — terminates at the simple party-column predicate; non-circular.

---

## Review Disposition (Independent Hard Review — Pass-2)

Reviewer: independent. Verified CORRECT: the 7-table set + columns (Doc-2 §10.5), engagement/trade-invoice/payment state sets verbatim, the two-sided party-column pattern, `DOC-`/`INV-` prefixes (Doc-2), the `≠ platform_invoices` firewall, versioned immutability, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **DDL-1** post-award docs' `template_version_id → template_versions` inline but `template_versions` is Pass-3 → migration fails | BLOCKER | **FIXED** — FK removed from `CREATE TABLE`; deferred `ALTER` in §7 (after `template_versions`). Same pattern as Doc-6D/6E. |
| **CUST-1** any settlement/balance/gateway column on `payment_records` would breach no-funds-custody | MAJOR | **FIXED** — §3.3.4: records only (`amount`/`paid_at`/`method_note`/`status`); **no balance/gateway/escrow column**; the platform holds no money. |
| **INV-FIRE** `trade_invoices` could be conflated with `billing.platform_invoices` | MAJOR | **FIXED** — §3.3.3: explicit firewall; buyer↔vendor document ≠ platform revenue (M7); no cross-module link. |
| **DOC-IMM** post-award docs "versioned" needs immutability with toggleable `is_active_revision` | MAJOR | **FIXED** — column-scoped trigger via `core.raise_immutable_violation` (content cols protected; `is_active_revision` toggles; DELETE blocked) on lois/po/challans/wcc; status-aware variant on invoices/payments. |
| **ENG-PFX** `engagements.human_ref` prefix unspecified by Doc-2 | MINOR | **CONFIRMED §2.5-carried** — `'ENG'` chosen; Doc-2 §10.5 gives no engagement prefix; surfaced for confirmation; isolated to one call site. |
| **PAY-FK** `payment_records.trade_invoice_id` optional | MINOR | **CONFIRMED nullable** — Doc-2 §10.5 "→ trade_invoices (optional)"; a payment may reference an engagement without a specific invoice. |

**Net:** 1 BLOCKER (FK ordering) + 3 MAJOR (no-custody, invoice firewall, doc immutability) fixed; 2 MINOR confirmed. The no-funds-custody finding is load-bearing — the platform never handles buyer↔vendor money. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6F Content Pass-2 (§3.3 Engagement + post-award documents) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the two-sided engagement (party-column RLS `active_org IN (buyer, vendor)`), the versioned post-award documents (column-scoped immutability; `DOC-…`/`INV-…`), and the money-record boundary (`trade_invoices ≠ platform_invoices`; `payment_records` records only — **no funds custody**). Columns verbatim Doc-2 §10.5; states verbatim; `currency` per value field (R9); coins nothing. Next: Pass-3 (Finance · Document Templates · Vendor Leads + §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A).*
