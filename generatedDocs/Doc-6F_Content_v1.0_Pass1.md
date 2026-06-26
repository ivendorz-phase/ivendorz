# Doc-6F — M4 Operations (`operations`) Schema Realization — Content v1.0 **Pass-1** (§0–§2 · §3.1 Private CRM · §3.2 Relationship)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-1 — Independent Hard Review applied** (1 BLOCKER + 3 MAJOR + 2 MINOR dispositioned; §Review Disposition). Realizes §0–§2 + §3.1 + §3.2. Next: Pass-2 |
| Date | 2026-06-26 |
| Realizes | the **Private Vendor CRM** (`private_vendor_records` + `notes`/`ratings`) + the **Buyer-Supplier Relationship** (`buyer_supplier_relationships` + **`buyer_vendor_statuses` the blacklist** + `vendor_favorites`) — the **non-disclosure owning side** (Invariant #11), the governance-signal-#5 firewall |
| Authority | `Doc-2 §6/§10.5/§10.11` (the *what*); `Doc-6A` (the *how*); `Doc-6B §4` (`core.raise_immutable_violation` consumed); `Doc-6C`/`Doc-6D` (by UUID); `Doc-4F` (M4 ownership); `Doc-3 v1.4` (`operations.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.5; `buyer_vendor_statuses.status`/`link_status`/`source` sets verbatim; physical specifics §2.5-tagged |
| DDL note | PostgreSQL 15+; Prisma `@@schema("operations")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §0 — Document Control, Precedence & Conformance Obligation
Doc-6F realizes Doc-2 §10.5 against frozen Doc-6A; passes Doc-6A Appendix A; realize-never-redecide; flag-and-halt. `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.4 — 2 `operations.*` keys). Carried into content: `[ESC-OPS-AUDIT]` (Pass-3). Coins nothing.

## §1 — Scope & the `operations` Table Partition (Pass-1 slice)
Pass-1 realizes the **Private Vendor CRM** (§3.1) + the **Buyer-Supplier Relationship** (§3.2) + the cross-cutting **tenancy/RLS model** (§2). **Deferred:** Engagement + post-award docs → Pass-2; Finance/Templates/Leads + §4–§8 + Appendix A → Pass-3.

**Non-disclosure (Invariant #11, the OWNING side):** `buyer_vendor_statuses` (the blacklist) + the private CRM are **strictly buyer-private** — `organization_id` tenant; **no vendor policy, no admin-all policy**; never in any vendor-facing surface. Served to M3 routing **only via the CRM service** (M3 reads no `operations` table — Doc-6E §5). **Never mutates platform scores** (firewall, OP-CR11).

## §2 — Tenancy & RLS Realization Model *(the load-bearing section)*

### §2.1 The classes (Doc-6A §4.2; server-set GUC, never client)
| Class | Pass-1 tables | RLS |
|---|---|---|
| **Buyer-private — never disclosed** | `private_vendor_records`/`notes`/`ratings`, `buyer_supplier_relationships`, `buyer_vendor_statuses`, `vendor_favorites` | `organization_id = current_setting('app.active_org', true)::uuid` — **only** (no vendor, no admin-all) |

`current_setting(..., true)` → NULL when unset → fail-closed. The **deliberate absence of an admin-all policy** on the private CRM/blacklist is the realization of "**private to one buyer, forever**" (Invariant #11 / signal #5) — platform staff get **no blanket read** of a buyer's private exclusion list. (Any compliance access is a separate, audited, explicitly-scoped service path — not a blanket RLS grant.) GUC mechanism = **[§2.5]**; the privacy principle = **[Doc-2 §10.11 / Invariant #11 binding]**.

### §2.2 Non-disclosure byte-equivalence (Invariant #11, in-scope CHK-6-022)
No vendor-facing surface in `operations` exposes a buyer's `buyer_vendor_statuses` (approved/conditional/**blacklisted**) or private record. A blacklisted vendor cannot detect its status: there is **no** `operations` read path to the vendor side for these tables, and M3 (the only consumer) receives the exclusion **via the CRM service**, which returns a routing decision — never the status row. Byte-equivalence is structural (no surface), tested by Doc-8.

---

## §3.1 — The Private Vendor CRM

### §3.1.1 `operations.private_vendor_records` (buyer-private; link lifecycle; never disclosed)
Realizes Doc-2 §10.5. Buyer `organization_id` tenant; `linked_vendor_profile_id` nullable bare UUID → M2; **never disclosed**.

```sql
CREATE TYPE operations.private_vendor_source AS ENUM ('manual','email_list','excel');     -- [Doc-2 §10.5 binding]
CREATE TYPE operations.link_status          AS ENUM ('none','suggested','linked');         -- [Doc-2 §10.5 binding]

CREATE TABLE operations.private_vendor_records (
  id                       uuid NOT NULL,                        -- [Doc-6A §3.1] PK UUIDv7
  organization_id          uuid NOT NULL,                        -- [Doc-2 §10.5] buyer tenant (RLS anchor); never disclosed
  linked_vendor_profile_id uuid,                                 -- [Doc-2 §10.5] nullable bare UUID → M2 (set on link)
  name                     text NOT NULL,                        -- [Doc-2 §10.5]
  email                    text,                                 -- [Doc-2 §10.5]
  phone                    text,                                 -- [Doc-2 §10.5]
  details_jsonb            jsonb,                                -- [Doc-2 §10.5]
  source                   operations.private_vendor_source NOT NULL,  -- [Doc-2 §10.5]
  link_status              operations.link_status NOT NULL DEFAULT 'none',  -- [Doc-2 §10.5]
  link_confidence          numeric,                              -- [Doc-2 §10.5] (M8 suggestion confidence)
  linked_at                timestamptz,                          -- [Doc-2 §10.5]
  link_confirmed_by        uuid,                                 -- [Doc-2 §10.5] bare UUID → M1 (confirming user)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT private_vendor_records_pkey PRIMARY KEY (id)
);
CREATE INDEX private_vendor_records_org_idx   ON operations.private_vendor_records (organization_id) WHERE deleted_at IS NULL;  -- [§2.5]
CREATE INDEX private_vendor_records_email_idx ON operations.private_vendor_records (organization_id, lower(email)) WHERE deleted_at IS NULL;  -- [§2.5] link-match feed (NOT unique — same email may recur across a buyer's list)
```
- **Link lifecycle (OP-CR9, DD-ADMIN):** `link_status none→suggested→linked`; **Admin (M8) suggests** (`admin.link_suggestions`), the **Operations service confirms** (writes `linked_vendor_profile_id`/`linked_at`/`link_confirmed_by`/`link_status='linked'`). M4 owns the private record; **never vendor-visible**. `linked_vendor_profile_id` is a bare UUID (no cross-schema FK).
- **RLS:** buyer-tenant only (§3.x). **Prisma [§2.5]:** `PrivateVendorRecord`, enums `PrivateVendorSource`/`LinkStatus`.

### §3.1.2 `operations.private_vendor_notes` · §3.1.3 `operations.private_vendor_ratings` (buyer-private children)
Realizes Doc-2 §10.5. In-module FK → `private_vendor_records`; buyer `organization_id`; YES SD. Ratings are **private** (never feed platform scores — firewall OP-CR11).

```sql
CREATE TABLE operations.private_vendor_notes (
  id uuid NOT NULL, private_vendor_record_id uuid NOT NULL, organization_id uuid NOT NULL,  -- [Doc-2 §10.5]
  body text NOT NULL,                                           -- [Doc-2 §10.5] free-text
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT private_vendor_notes_pkey PRIMARY KEY (id),
  CONSTRAINT private_vendor_notes_record_fk FOREIGN KEY (private_vendor_record_id) REFERENCES operations.private_vendor_records(id)
);
CREATE TABLE operations.private_vendor_ratings (
  id uuid NOT NULL, private_vendor_record_id uuid NOT NULL, organization_id uuid NOT NULL,  -- [Doc-2 §10.5]
  score numeric NOT NULL,                                       -- [Doc-2 §10.5] PRIVATE buyer score — never a platform signal (OP-CR11)
  comment text,                                                 -- [Doc-2 §10.5]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT private_vendor_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT private_vendor_ratings_record_fk FOREIGN KEY (private_vendor_record_id) REFERENCES operations.private_vendor_records(id)
);
```
- **Firewall (OP-CR11):** `private_vendor_ratings.score` is a **buyer-private** signal — it **never** mutates platform Trust/Performance (that is M5, via verified public reviews + performance inputs only). **RLS:** buyer-tenant (§3.x). **Prisma [§2.5]:** `PrivateVendorNote`, `PrivateVendorRating`.

## §3.2 — The Buyer-Supplier Relationship (the blacklist owning side)

### §3.2.1 `operations.buyer_supplier_relationships` (relationship container; partial-unique)
Realizes Doc-2 §10.5. Buyer `organization_id`; `vendor_profile_id` bare UUID → M2; `UNIQUE(organization_id, vendor_profile_id)` partial.

```sql
CREATE TABLE operations.buyer_supplier_relationships (
  id uuid NOT NULL, organization_id uuid NOT NULL,              -- [Doc-2 §10.5] buyer tenant
  vendor_profile_id uuid NOT NULL,                              -- [Doc-2 §10.5] bare UUID → M2
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT buyer_supplier_relationships_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX buyer_supplier_rel_org_vendor_live_uq ON operations.buyer_supplier_relationships (organization_id, vendor_profile_id) WHERE deleted_at IS NULL;  -- [Doc-2 §10.5 binding] partial-unique
```

### §3.2.2 `operations.buyer_vendor_statuses` (**the blacklist**; set/cleared history; non-disclosure)
Realizes Doc-2 §10.5. In-module FK → `buyer_supplier_relationships`; buyer `organization_id`; **NO SD** — set/cleared history; current = `effective_to IS NULL`. **Non-disclosure invariant applies.**

```sql
CREATE TYPE operations.buyer_vendor_status AS ENUM ('approved','conditional','blacklisted');  -- [Doc-2 §10.5 binding]

CREATE TABLE operations.buyer_vendor_statuses (
  id uuid NOT NULL, relationship_id uuid NOT NULL,              -- [Doc-6A §5.2] in-module FK
  organization_id uuid NOT NULL,                                -- [Doc-2 §10.5] buyer tenant — non-disclosure
  status operations.buyer_vendor_status NOT NULL,              -- [Doc-2 §10.5]
  caveat_note text,                                            -- [Doc-2 §10.5]
  effective_from timestamptz NOT NULL DEFAULT now(),           -- [Doc-2 §10.5]
  effective_to   timestamptz,                                  -- [Doc-2 §10.5] NULL = current
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.5] (NO SD — append/close history)
  CONSTRAINT buyer_vendor_statuses_pkey PRIMARY KEY (id),
  CONSTRAINT buyer_vendor_statuses_rel_fk FOREIGN KEY (relationship_id) REFERENCES operations.buyer_supplier_relationships(id),
  CONSTRAINT buyer_vendor_statuses_validity_chk CHECK (effective_to IS NULL OR effective_to > effective_from)  -- [§2.5]
);
CREATE UNIQUE INDEX buyer_vendor_statuses_current_uq ON operations.buyer_vendor_statuses (relationship_id) WHERE effective_to IS NULL;  -- [Doc-2 §10.5] ONE current status per relationship

-- Set/cleared history: rows permanent, payload immutable; only effective_to closes (set-once). Protected cols minus effective_to (HR-1 lesson):
CREATE TRIGGER buyer_vendor_statuses_immutable
  BEFORE UPDATE OR DELETE ON operations.buyer_vendor_statuses FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','relationship_id','organization_id','status','caveat_note','effective_from','created_at','created_by');  -- [Doc-6B §4]
```
- **Set/cleared (Doc-2 §10.5):** a status change **closes** the current row (`effective_to = now()`) and **inserts** a new one; the current-row partial-unique guarantees one open status. The history is **permanent + immutable** (payload frozen; only `effective_to` closes). **Served to M3 routing only via the CRM service** (Doc-6E §5) — never a table read; **byte-equivalence** preserved.
- **RLS:** buyer-tenant only (§3.x) — **the blacklist is invisible to the vendor and to blanket admin**. **Prisma [§2.5]:** `BuyerVendorStatus`, enum `BuyerVendorStatusValue`.

### §3.2.3 `operations.vendor_favorites` (buyer-private flag rows)
Realizes Doc-2 §10.5. In-module FK → `buyer_supplier_relationships`; buyer `organization_id`; YES SD. *(Distinct from M2 `catalog_favorites` — these are the buyer's private vendor-favorites, never platform-wide.)*

```sql
CREATE TABLE operations.vendor_favorites (
  id uuid NOT NULL, relationship_id uuid NOT NULL, organization_id uuid NOT NULL,  -- [Doc-2 §10.5]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT vendor_favorites_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_favorites_rel_fk FOREIGN KEY (relationship_id) REFERENCES operations.buyer_supplier_relationships(id)
);
CREATE UNIQUE INDEX vendor_favorites_rel_live_uq ON operations.vendor_favorites (relationship_id) WHERE deleted_at IS NULL;  -- [§2.5] one favorite flag per relationship
```

## §3.x — Consolidated RLS DDL (Pass-1 tables — buyer-private, no vendor/admin-all)
```sql
-- pattern (shown for private_vendor_records; ALL six Pass-1 tables identical — organization_id-tenant, no vendor policy, no admin-all):
ALTER TABLE operations.private_vendor_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY private_vendor_records_tenant ON operations.private_vendor_records FOR ALL
  USING (organization_id = current_setting('app.active_org', true)::uuid)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid);
-- private_vendor_notes · private_vendor_ratings · buyer_supplier_relationships · buyer_vendor_statuses · vendor_favorites:
--   same single FOR ALL tenant policy (s/private_vendor_records/<table>/).
--   buyer_vendor_statuses: the immutability trigger blocks UPDATE/DELETE beyond effective_to; the tenant policy governs INSERT/SELECT.
--   NO vendor policy + NO admin-all policy on ANY of the six = the non-disclosure realization (Invariant #11; §2.1).
```
- **Why no admin-all:** a blanket platform-staff read of a buyer's private exclusion list would violate "private to one buyer, forever." Compliance access (if ever needed) is a separate explicitly-audited service path, not a standing RLS grant.

---

## Review Disposition (Independent Hard Review — Pass-1)

Reviewer: independent. Verified CORRECT: the 6-table set + columns (Doc-2 §10.5), `buyer_vendor_status`/`link_status`/`source` sets verbatim, `buyer_supplier_relationships` partial-unique, `buyer_vendor_statuses` NO-SD set/cleared + current partial-unique, the firewall (private ratings never feed platform), coin-nothing, §2.5 attribution.

| Finding | Sev | Disposition |
|---|---|---|
| **PVR-LEAK** non-disclosure not enforced if any of the 6 tables carried an admin-all or vendor policy | BLOCKER (Invariant #11) | **FIXED** — §3.x: **single `organization_id` tenant policy only**; **no vendor, no admin-all** on any of the 6; byte-equivalence structural. |
| **BVS-IMM** `buyer_vendor_statuses` set/cleared history needs immutability with a closable `effective_to` | MAJOR | **FIXED** — column-scoped trigger via `core.raise_immutable_violation` (all cols **minus `effective_to`**); current partial-unique; DELETE blocked. (HR-1 lesson: protected cols passed.) |
| **FIRE-1** `private_vendor_ratings.score` could be mistaken for a platform signal | MAJOR | **FIXED** — §3.1.3: private buyer signal only; OP-CR11 firewall; M4 writes no M5 table. |
| **EMAIL-UQ** `private_vendor_records.email` partial-unique would wrongly forbid duplicate emails | MAJOR | **FIXED** — non-unique index `(organization_id, lower(email))` for link-match (a buyer may list the same email twice; no uniqueness). |
| **LINK-FK** `linked_vendor_profile_id` cross-schema FK | MINOR | **CONFIRMED bare-UUID** — → M2, no FK (Doc-2 §0.3); link-confirm writes via service; orphan-scan. |
| **CUR-CHK** `buyer_vendor_statuses` validity interval | MINOR | **FIXED** — `effective_to > effective_from` CHECK. |

**Net:** 1 BLOCKER (non-disclosure RLS) + 3 MAJOR (status immutability, ratings firewall, email-unique) fixed; 2 MINOR applied/confirmed. The non-disclosure finding is load-bearing — M4 is the blacklist's owning side. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6F Content Pass-1 (§0–§2 · §3.1 Private CRM · §3.2 Relationship) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the buyer-private Vendor CRM + the blacklist `buyer_vendor_statuses` (set/cleared immutable history; one current; **non-disclosure — no vendor, no admin-all policy**; served to M3 via CRM service only), the governance-signal-#5 firewall (private ratings never feed platform scores), the M8-suggested/M4-confirmed link lifecycle. Columns verbatim Doc-2 §10.5; states verbatim; coins nothing. Next: Pass-2 (Engagement + post-award docs — two-sided party-column RLS, versioned immutability, the money-record boundary).*
