# Doc-6F — M4 Operations (`operations`) Schema Realization — Content v1.0 **Pass-3** (§3.4 Finance · §3.5 Templates · §3.6 Leads · §4–§8 · Appendix A)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-3 (FINAL) — Independent Hard Review applied** (0 BLOCKER + 3 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Completes §3.4–§3.6 + §4–§8 + Appendix A. Next: Content Hard Review (cross-pass) → Content Freeze Audit |
| Date | 2026-06-26 |
| Realizes | **Finance** (`finance_records`) · **Document Templates** (`document_templates` §5.9 + immutable `template_versions` + `generated_documents`) · **Vendor Leads** (`vendor_leads` on `VendorInvited` + append-only `lead_activities`); §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A (37/37) |
| Authority | `Doc-2 §5.9/§8/§10.5/§10.11` (the *what*); `Doc-6A` (Appendix A gate); `Doc-6B §4` (consumed); `Doc-6E` (`VendorInvited`/award events); `Doc-4F/4L/4M`; `Doc-3 v1.4`; `Doc-5F` |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.5; `record_type`/`format`/§5.9/`stage` sets verbatim. Carried: `[ESC-OPS-AUDIT]` |
| DDL note | PostgreSQL 15+; Prisma `@@schema("operations")`. Closes Pass-2's deferred `template_version_id` FKs. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.4 — `operations.finance_records` (buyer-private structured records)
Realizes Doc-2 §10.5. Buyer `organization_id`; structured text (no file uploads); `amount`+`currency` (R9); YES SD.

```sql
CREATE TYPE operations.finance_record_type AS ENUM ('tax','ait','payment','expense');  -- [Doc-2 §10.5 binding]

CREATE TABLE operations.finance_records (
  id uuid NOT NULL, organization_id uuid NOT NULL,             -- [Doc-2 §10.5] buyer tenant
  record_type operations.finance_record_type NOT NULL,        -- [Doc-2 §10.5]
  period text,                                                -- [Doc-2 §10.5]
  amount numeric NOT NULL,                                    -- [Doc-2 §10.5]
  currency char(3) NOT NULL DEFAULT 'BDT',                   -- [Doc-6A R9]
  note text,                                                 -- [Doc-2 §10.5] structured text (no file uploads)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT finance_records_pkey PRIMARY KEY (id)
);
CREATE INDEX finance_records_org_period_idx ON operations.finance_records (organization_id, record_type, period) WHERE deleted_at IS NULL;  -- [§2.5]
```
- **Buyer-private (non-disclosure class):** `organization_id`-tenant only; no vendor policy. **Prisma [§2.5]:** `FinanceRecord`, enum `FinanceRecordType`.

## §3.5 — Document Templates

### §3.5.1 `operations.document_templates` (§5.9; `organization_id`)
Realizes Doc-2 §10.5 + §5.9. `format` + `status` §5.9; `current_version_no`; YES SD (archive).

```sql
CREATE TYPE operations.document_template_format AS ENUM ('challan','bill','letterhead','quotation','wcc');  -- [Doc-2 §10.5 binding]
CREATE TYPE operations.document_template_status AS ENUM ('draft','active','archived');                      -- [Doc-2 §5.9 binding]

CREATE TABLE operations.document_templates (
  id uuid NOT NULL, organization_id uuid NOT NULL,            -- [Doc-2 §10.5] tenant
  format operations.document_template_format NOT NULL,       -- [Doc-2 §10.5]
  name text NOT NULL,                                        -- [Doc-2 §10.5]
  status operations.document_template_status NOT NULL DEFAULT 'draft',  -- [Doc-2 §5.9]
  current_version_no integer NOT NULL DEFAULT 1,             -- [Doc-2 §10.5]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT document_templates_pkey PRIMARY KEY (id)
);
```
- **§5.9:** `draft→active`, `active→active` (edit → new `template_version`; priors retained), `active→archived→active`. Service transitions. **Prisma [§2.5]:** `DocumentTemplate`, enums.

### §3.5.2 `operations.template_versions` (immutable) · §3.5.3 `operations.generated_documents` (versioned; counterparty grant)
Realizes Doc-2 §10.5. `template_versions`: in-module FK → `document_templates`; **immutable**. `generated_documents`: in-module FK → `template_versions` (nullable); `source_entity_id` polymorphic (rfq/quotation/engagement doc) bare UUID; `human_ref` `DOC-…`; **NO SD versioned**; `organization_id` + optional counterparty visibility.

```sql
CREATE TABLE operations.template_versions (
  id uuid NOT NULL, document_template_id uuid NOT NULL, organization_id uuid NOT NULL,  -- [Doc-2 §10.5]
  version_no integer NOT NULL,                               -- [Doc-2 §10.5]
  layout_jsonb jsonb NOT NULL,                               -- [Doc-2 §10.5]
  brand_binding_jsonb jsonb,                                 -- [Doc-2 §10.5]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.5] (NO SD — immutable)
  CONSTRAINT template_versions_pkey PRIMARY KEY (id),
  CONSTRAINT template_versions_template_fk FOREIGN KEY (document_template_id) REFERENCES operations.document_templates(id),
  CONSTRAINT template_versions_tmpl_no_uq UNIQUE (document_template_id, version_no)
);
CREATE TRIGGER template_versions_immutable BEFORE UPDATE OR DELETE ON operations.template_versions FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','document_template_id','organization_id','version_no','layout_jsonb','brand_binding_jsonb','created_at','created_by');  -- [Doc-6B §4] full immutable

CREATE TABLE operations.generated_documents (
  id uuid NOT NULL,
  human_ref text NOT NULL,                                   -- [Doc-2 §10.5] DOC-… via core.allocate_human_ref('DOC', year)
  template_version_id uuid,                                  -- [Doc-6A §5.2] nullable in-module FK
  organization_id uuid NOT NULL,                             -- [Doc-2 §10.5] tenant
  counterparty_organization_id uuid,                         -- [Doc-2 §10.5 "+ counterparty grant where shared"] bare UUID → M1 (OP-HR-3)
  source_entity_id uuid,                                     -- [Doc-2 §10.5] polymorphic (rfq/quotation/engagement doc) — NO FK
  doc_kind text NOT NULL,                                    -- [Doc-2 §10.5]
  version_no integer NOT NULL DEFAULT 1,                     -- [Doc-2 §10.5]
  storage_ref text,                                         -- [Doc-2 §10.5]
  generated_by uuid,                                        -- [Doc-2 §10.5] bare UUID → M1
  generation_job_id uuid,                                   -- [Doc-2 §10.5] bare UUID → Inngest job
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.5] (NO SD — versioned/append-only)
  CONSTRAINT generated_documents_pkey PRIMARY KEY (id),
  CONSTRAINT generated_documents_human_ref_uq UNIQUE (human_ref),
  CONSTRAINT generated_documents_template_version_fk FOREIGN KEY (template_version_id) REFERENCES operations.template_versions(id)
);
CREATE TRIGGER generated_documents_immutable BEFORE UPDATE OR DELETE ON operations.generated_documents FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','human_ref','template_version_id','organization_id','counterparty_organization_id','source_entity_id','doc_kind',
    'version_no','storage_ref','generated_by','generation_job_id','created_at','created_by');  -- [Doc-6B §4] append-only generated artifact
```
- **`generated_documents` counterparty grant (OP-HR-3):** tenant `organization_id`-primary; when a generated doc is shared with the counterparty, `counterparty_organization_id` is set → RLS grants that party read (§3.x). A generated document is an **immutable append-only artifact** (a re-generation = a new row). **Prisma [§2.5]:** `TemplateVersion`, `GeneratedDocument`.

## §3.6 — Vendor Leads (vendor-side; created on `VendorInvited`)

### §3.6.1 `operations.vendor_leads` (vendor `controlling_organization_id`; `stage`) · §3.6.2 `operations.lead_activities` (append-only)
Realizes Doc-2 §10.5. `controlling_organization_id` vendor tenant; `vendor_profile_id`/`rfq_id`/`invitation_id` bare UUID → M2/M3; created on `VendorInvited` (idempotent consumer). `lead_activities` append-only.

```sql
CREATE TYPE operations.vendor_lead_stage AS ENUM ('received','quoted','negotiation','won','lost','follow_up');  -- [Doc-2 §10.5 binding]

CREATE TABLE operations.vendor_leads (
  id uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                           -- [Doc-2 §10.5] bare UUID → M2
  controlling_organization_id uuid NOT NULL,                 -- [Doc-2 §10.5] vendor tenant (RLS anchor)
  rfq_id uuid NOT NULL,                                      -- [Doc-2 §10.5] bare UUID → M3
  invitation_id uuid NOT NULL,                               -- [Doc-2 §10.5] bare UUID → M3
  stage operations.vendor_lead_stage NOT NULL DEFAULT 'received',  -- [Doc-2 §10.5]
  value_estimate numeric, value_currency char(3) NOT NULL DEFAULT 'BDT',  -- [Doc-2 §10.5 / R9] estimate + currency
  next_action_at timestamptz,                               -- [Doc-2 §10.5]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT vendor_leads_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_leads_invitation_uq UNIQUE (invitation_id)  -- [§2.5] one lead per invitation (idempotent VendorInvited consumer)
);
CREATE INDEX vendor_leads_org_stage_idx ON operations.vendor_leads (controlling_organization_id, stage) WHERE deleted_at IS NULL;  -- [§2.5]

CREATE TABLE operations.lead_activities (
  id uuid NOT NULL, vendor_lead_id uuid NOT NULL, controlling_organization_id uuid NOT NULL,  -- [Doc-2 §10.5]
  actor_user_id uuid,                                       -- [Doc-2 §10.5] bare UUID → M1
  activity_jsonb jsonb NOT NULL,                            -- [Doc-2 §10.5] activity log entry ([§2.5] jsonb)
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.5] (NO SD — append-only)
  CONSTRAINT lead_activities_pkey PRIMARY KEY (id),
  CONSTRAINT lead_activities_lead_fk FOREIGN KEY (vendor_lead_id) REFERENCES operations.vendor_leads(id)
);
CREATE TRIGGER lead_activities_immutable BEFORE UPDATE OR DELETE ON operations.lead_activities FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','vendor_lead_id','controlling_organization_id','actor_user_id','activity_jsonb','created_at','created_by');  -- [Doc-6B §4]
```
- **Created on `VendorInvited` (idempotent — Doc-2 §10.5):** the lead is created when the M3 invitation reaches `delivered`; `UNIQUE(invitation_id)` makes the consumer idempotent (a replayed event writes no second lead). **RLS:** vendor `controlling_organization_id` tenant (§3.x). **Prisma [§2.5]:** `VendorLead`, `LeadActivity`, enum `VendorLeadStage`.

## §3.x — Consolidated RLS DDL (Pass-3)
```sql
-- finance_records / document_templates / template_versions: buyer/tenant organization_id only
ALTER TABLE operations.finance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY finance_records_tenant ON operations.finance_records FOR ALL
  USING (organization_id = current_setting('app.active_org', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid);
-- document_templates + template_versions: same tenant policy (s/finance_records/<table>/); admin-all OK for templates (not private CRM).

-- generated_documents: tenant OR counterparty (where shared) OR admin
ALTER TABLE operations.generated_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY generated_documents_party ON operations.generated_documents FOR ALL
  USING (organization_id = current_setting('app.active_org', true)::uuid
         OR counterparty_organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);  -- writes by owner/admin (not counterparty)

-- vendor_leads / lead_activities: vendor controlling_organization_id tenant
ALTER TABLE operations.vendor_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_leads_tenant ON operations.vendor_leads FOR ALL
  USING (controlling_organization_id = current_setting('app.active_org', true)::uuid)
  WITH CHECK (controlling_organization_id = current_setting('app.active_org', true)::uuid);
-- lead_activities: same (s/vendor_leads/lead_activities/); UPDATE/DELETE blocked by immutability trigger.
```

## §4 — State Machine Realization
| Machine | Table | Owner |
|---|---|---|
| `engagements.status` (open/in_delivery/completed/closed) | Pass-2 | service; created on M3 award; `closed`→ M5 performance/public-review eligibility (emit) |
| `document_templates.status` §5.9 (draft/active/archived) | §3.5.1 | service; edit → new `template_version` |
| `trade_invoices.status` · `payment_records.status` · `buyer_vendor_statuses.status` | Pass-1/2 | service |
| `vendor_leads.stage` (received/quoted/negotiation/won/lost/follow_up) | §3.6.1 | service; created on `VendorInvited` |
| `private_vendor_records.link_status` | Pass-1 | M8-suggested / M4-service-confirmed |

**Transition = outbox (Doc-2 §8):** emitter transitions write the business row + `core.outbox_events` in one txn; event slugs bound to Doc-2 §8/Doc-4L (none coined). `engagements` consumes the M3 award event; `vendor_leads` consumes `VendorInvited` (idempotent via `UNIQUE(invitation_id)`). Buyer feedback / engagement completion feed **M5 performance** as consumer effects in M5's schema (DD-TRUST) — M4 writes no M5 table.

## §5 — Cross-Module Reads & Firewalls (DD-MKT/RFQ/TRUST/ADMIN)
Bare-UUID + service + event. **Money firewall:** `trade_invoices ≠ billing.platform_invoices`; **no funds custody** (`payment_records` records only). **Governance firewall:** Buyer Vendor Status + private ratings **never** mutate platform Trust/Performance/Tier (M5-owned). **Non-disclosure:** the private CRM/blacklist is never vendor-readable; served to M3 via CRM service only. Link suggestions from M8 (`admin.link_suggestions`); M4 service confirms. No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8/§10.11`; `Doc-4F`; `Doc-4L`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for Doc-5F lists; party-column indexes (engagement two-sided); current-status `WHERE effective_to IS NULL` (`buyer_vendor_statuses`); partial `WHERE deleted_at IS NULL`; `buyer_supplier_relationships` partial-unique; `vendor_leads UNIQUE(invitation_id)`; page-size via `operations.*` POLICY. No FTS (M4 is private ops). **Deps:** `Doc-5F`; `Doc-6A §10/§12`; `Doc-3 v1.4`.

## §7 — POLICY & Forward-Only Migration
**POLICY = Doc-3 v1.4 (CLEARED):** 2 `operations.*` keys seeded in `core.system_configuration`; M4 reads, coins none.
**Forward-only order:** (assume core/identity/marketplace/rfq migrated) `CREATE SCHEMA operations` → enums → private CRM → relationships/statuses/favorites → engagements → post-award docs → finance → document_templates → template_versions → generated_documents → vendor_leads/lead_activities → **deferred FKs** (`lois/po/challans/wcc.template_version_id → template_versions`, DDL-1) → indexes → triggers (immutability) → RLS → seeds (none owned by M4). Forward-only, idempotent.

## §8 — Conformance & Carried Items
Coins nothing; every element traces to Doc-2 §10.5 or a §2.5 attribution. Carried: **`[ESC-OPS-AUDIT]`** (post-award/finance audit actions — bind nearest Doc-2 §9 by pointer) · DD-MKT/RFQ/TRUST/ADMIN · Invariant #11 (owning side, realized) · money boundary (realized). `[ESC-6-POLICY]` **CLEARED**.

## Appendix A — Doc-6F Conformance Attestation (Doc-6A `CHK-6-001…093`, 37 checks)

| Band | Check | Verdict | Evidence |
|---|---|---|---|
| **A** | 001 | PASS | every table `id uuid` PK |
| | 002 | PASS | human_refs `ENG-`/`DOC-`/`INV-` via `core.allocate_human_ref` (`ENG-` §2.5-carried) |
| | 003 | PASS | timestamps; append-only/immutable tables omit `updated_at` |
| | 004 | PASS | SD tuple where SD; history/versions/leads-activity correctly no SD |
| | 005 | PASS | `buyer_supplier_relationships` partial-unique; `buyer_vendor_statuses` current partial-unique; `vendor_leads(invitation_id)` |
| **B** | 010 | PASS | physical `operations` namespace; one Prisma `@@schema` |
| | 011 | PASS | **no cross-schema FK** — vendor/rfq/org/user/source all bare UUID |
| | 012 | PASS | refs entity-named, service-validated, orphan-scan |
| | 013 | PASS | no cross-schema JOIN/traversal; party RLS intra-schema |
| **C** | 020 | PASS | RLS on every table; tenant/party anchors server-set, fail-closed |
| | 021 | PASS | two-sided **party columns** (`buyer_organization_id`/`vendor_controlling_org_id`); generated-doc counterparty grant |
| | 022 | **PASS — IN-SCOPE** | **non-disclosure**: private CRM + blacklist `organization_id`-only, **no vendor, no admin-all**; byte-equivalence structural; served to M3 via CRM service |
| | 023 | PASS | authz app-layer (Doc-4F); RLS = backstop |
| **D** | 030 | PASS | no hard-DELETE of authoritative rows |
| | 031 | PASS | versioned post-award docs column-scoped; `template_versions`/`generated_documents`/`lead_activities` append-only; `buyer_vendor_statuses` set/cleared immutable |
| | 032 | PASS | history/snapshot append-only; no derived-cache hard-delete |
| | 033 | **N/A** | no `ai.*` cache |
| **E** | 040 | PASS | engagement/lead transitions + outbox (§4) |
| | 041 | PASS | no event coined; bound Doc-2 §8/4L; M3 award + `VendorInvited` consumers in M4 schema |
| | 042 | PASS | audit via `core.audit_records` |
| | 043 | **PASS-with-carry** | audited-action coverage; post-award/finance gap = **`[ESC-OPS-AUDIT]`** |
| **F** | 050 | PASS | `engagements.award_value`/`trade_invoices.amount`/`payment_records.amount`/`finance_records.amount`/`vendor_leads.value_estimate` all NUMERIC + currency; **no funds-custody column** |
| **G** | 060 | PASS | reads `core.system_configuration`; 2 `operations.*` keys (Doc-3 v1.4) |
| | 061 | PASS | page-size/idempotency from POLICY, never literals |
| | 062 | **N/A** | no role seed in M4 |
| **H** | 070 | PASS | Doc-5F reads/lists persistable (CRM, engagements, docs, leads, finance) |
| | 071 | PASS | composite sort-key indexes (§6) |
| | 072 | PASS | idempotency-dedup persisted (`vendor_leads(invitation_id)`; `operations.idempotency_dedup_window`) |
| | 073 | PASS | no non-persistable Doc-5F surface |
| **I** | 080 | PASS | nothing coined; every element traces to Doc-2 §10.5 |
| | 081 | PASS | physical specifics §2.5-attributed (`ENG-` prefix, party columns, polymorphic `source_entity_id`, counterparty grant) |
| | 082 | PASS | `[ESC-OPS-AUDIT]` via named channel; none resolved locally |
| | 083 | PASS | no Doc-2 decision re-opened |
| **J** | 090 | PASS | extends B.1 base + B.2 types |
| | 091 | PASS | coins no shared enum; reuses B.3 (`actor_type`/`currency`/outbox `status`); M4 enums module-owned |
| | 092 | PASS | B.4 naming followed |
| | 093 | PASS | B.5 conventions realized |

**37/37 — 0 FAIL.** N/A: 033 (no ai), 062 (no role seed). PASS-with-carry: 043 (`[ESC-OPS-AUDIT]`). CHK-6-022 in-scope PASS (non-disclosure owning side).

---

## Review Disposition (Independent Hard Review — Pass-3)

Reviewer: independent. Verified CORRECT: the 6-table set + columns (Doc-2 §10.5), `record_type`/`format`/§5.9/`stage` sets verbatim, the idempotent `VendorInvited` consumer (`UNIQUE(invitation_id)`), `template_versions` immutable, money-currency coverage, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **GEN-CTR** `generated_documents` "counterparty grant where shared" not realized (OP-HR-3 carried) | MAJOR | **FIXED** — `counterparty_organization_id` + RLS (owner OR counterparty OR admin read; owner/admin write). |
| **TV-IMM / GD-IMM / LA-IMM** `template_versions`/`generated_documents`/`lead_activities` immutability asserted without guards | MAJOR | **FIXED** — full append-only triggers via `core.raise_immutable_violation` (all cols; HR-1 lesson); DELETE blocked. |
| **LEAD-IDEM** `vendor_leads` on `VendorInvited` could duplicate on replay | MAJOR | **FIXED** — `UNIQUE(invitation_id)`; idempotent consumer (Doc-2 §10.5 "created on VendorInvited"). |
| **SRC-POLY** `generated_documents.source_entity_id` cross-entity FK | MINOR | **CONFIRMED bare-UUID** — polymorphic (rfq/quotation/engagement doc); no FK; service-validated. |
| **TMPL-ADMIN** `document_templates` admin-all vs private-CRM no-admin | MINOR | **CONFIRMED** — templates are operational config (admin-all OK), **not** the private CRM/blacklist (which stays no-admin, Pass-1). |
| **DEFER-FK** Pass-2 `template_version_id` deferred FKs | NIT | **CONFIRMED closed** — §7 migration adds the ALTERs after `template_versions`. |

**Net:** 0 BLOCKER; 3 MAJOR (counterparty grant, immutability guards, lead idempotency) fixed; 2 MINOR + 1 NIT confirmed. 37/37 Appendix A; non-disclosure + money boundary intact. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6F Content Pass-3 (FINAL) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Completes the `operations` realization: buyer-private finance, the §5.9 document templates (immutable `template_versions`, append-only `generated_documents` with counterparty grant), the vendor-side leads (idempotent `VendorInvited` consumer, append-only activities), the §4 state consolidation, the §5 firewalls (non-disclosure + money boundary + governance), §6 indexing, §7 forward-only migration (closes Pass-2 deferred FKs), and §8 + Appendix A (37/37, 0 FAIL; CHK-6-022 in-scope). Coins nothing; carried `[ESC-OPS-AUDIT]`. Next: Content Hard Review (cross-pass) → Content Freeze Audit → `Doc-6F_SERIES_FROZEN`.*
