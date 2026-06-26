# Doc-6J — M8 Admin (`admin`) Schema Realization — Content v1.0 **Pass-1** (§0–§2 · §3.1 Moderation & Bans · §3.2 Suggestions)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-1 — Independent Hard Review applied** (1 BLOCKER + 2 MAJOR + 2 MINOR dispositioned; §Review Disposition). Realizes §0–§2 + §3.1 + §3.2. Next: Pass-2 |
| Date | 2026-06-26 |
| Realizes | **Moderation & Bans** (`moderation_cases` + `ban_actions` — emits `VendorBanned`) + **Suggestions** (`category_suggestions` + `missing_vendor_suggestions` + **`link_suggestions` never vendor-visible**) — the ban authority + the Admin-decides/owning-module-owns RLS model |
| Authority | `Doc-2 §6/§10.9/A-03` (the *what*); `Doc-6A` (the *how*); `Doc-6B §4` (consumed); `Doc-6D/6F` (by UUID); `Doc-4J` (M8 + authoritative event catalog); `Doc-3 v1.7` (`admin.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.9; `moderation`/`ban`/`suggestion`/`link` state sets verbatim; **no human_ref**; physical specifics §2.5-tagged |
| DDL note | PostgreSQL 15+; Prisma `@@schema("admin")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §0 — Document Control, Precedence & Conformance Obligation
Doc-6J realizes Doc-2 §10.9 against frozen Doc-6A; passes Doc-6A Appendix A; realize-never-redecide; flag-and-halt. `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.7 — 2 `admin.*` keys). Carried: `[ESC-ADMIN-AUDIT]` (Pass-3; M8 owns the §9 catalog). Coins nothing.

## §1 — Scope & the `admin` Table Partition (Pass-1 slice)
Pass-1 realizes **Moderation & Bans** (§3.1) + **Suggestions** (§3.2) + the **tenancy/RLS model** (§2). **Deferred:** Import + Verification Tasks + Outreach → Pass-2; §4–§8 + Appendix A → Pass-3. **Admin decides, owning module owns:** M8 holds the work-item + emits the decision; the authoritative record is the owning module's.

## §2 — Tenancy & RLS Model *(the load-bearing section)*
| Class | Pass-1 tables | RLS |
|---|---|---|
| **Platform-staff only** | `moderation_cases`, `ban_actions`, `link_suggestions` | `app.is_platform_staff` only |
| **Org-suggestion + staff** | `category_suggestions`, `missing_vendor_suggestions` | `suggested_by_organization_id = active_org` OR staff |

**`link_suggestions` never vendor-visible (A-03; Invariant #11-adjacent):** **staff-only**, no vendor/org policy — a private↔public link **candidate** is never exposed; confirmation writes the link columns on `operations.private_vendor_records` via the Operations service (linking never moves/exposes private data). **The ban's public effect = M2's reflected banner** (`public_banner` → M2), **not** a public read of `ban_actions`. RLS = backstop; authz app-layer (Doc-4J). Tests = Doc-8.

---

## §3.1 — Moderation & Bans

### §3.1.1 `admin.moderation_cases` (polymorphic subject; staff) · §3.1.2 `admin.ban_actions` (emits `VendorBanned`)
Realizes Doc-2 §10.9. Polymorphic `subject_id`+`subject_type`; `ban_actions` emits `VendorBanned`; both staff-only; **NO SD**.

```sql
CREATE TYPE admin.moderation_state AS ENUM ('open','approved','rejected','escalated');  -- [Doc-2 §10.9 binding]
CREATE TYPE admin.ban_subject_type AS ENUM ('vendor_profile','organization');           -- [Doc-2 §10.9 binding]
CREATE TYPE admin.ban_state AS ENUM ('active','lifted','expired');                       -- [Doc-2 §10.9 binding]

CREATE TABLE admin.moderation_cases (
  id uuid NOT NULL, subject_id uuid NOT NULL, subject_type text NOT NULL,  -- [Doc-2 §10.9] polymorphic (rfq etc.; no enumerated set → text [§2.5])
  assigned_to uuid,                                          -- [Doc-2 §10.9] bare UUID → M1 (staff)
  state admin.moderation_state NOT NULL DEFAULT 'open',      -- [Doc-2 §10.9]
  reason text,                                               -- [Doc-2 §10.9]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                          -- [Doc-2 §0.2] (NO SD)
  CONSTRAINT moderation_cases_pkey PRIMARY KEY (id)
);
CREATE INDEX moderation_cases_subject_idx ON admin.moderation_cases (subject_type, subject_id);  -- [§2.5]
CREATE INDEX moderation_cases_queue_idx ON admin.moderation_cases (state) WHERE state IN ('open','escalated');  -- [§2.5] work queue

CREATE TABLE admin.ban_actions (
  id uuid NOT NULL, subject_id uuid NOT NULL,                -- [Doc-2 §10.9] polymorphic bare UUID
  subject_type admin.ban_subject_type NOT NULL,             -- [Doc-2 §10.9] vendor_profile/organization
  issued_by uuid,                                           -- [Doc-2 §10.9] bare UUID → M1 (staff)
  scope text, reason text,                                  -- [Doc-2 §10.9]
  public_banner boolean NOT NULL DEFAULT false,             -- [Doc-2 §10.9] → M2 reflected banner (public surface = M2's)
  state admin.ban_state NOT NULL DEFAULT 'active',          -- [Doc-2 §10.9]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  CONSTRAINT ban_actions_pkey PRIMARY KEY (id)
);
CREATE INDEX ban_actions_subject_idx ON admin.ban_actions (subject_type, subject_id) WHERE state = 'active';  -- [§2.5]
-- subject/issuer/scope/reason frozen; only state (active→lifted/expired) + public_banner toggle (column-scoped):
CREATE TRIGGER ban_actions_immutable BEFORE UPDATE OR DELETE ON admin.ban_actions FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation('id','subject_id','subject_type','issued_by','scope','reason','created_at','created_by');  -- [Doc-6B §4]
```
- **Ban authority (AD-CR3):** `ban_actions` is the **Admin record + the emitter** — a ban writes the row **+** a `core.outbox_events` `VendorBanned` (Doc-5J single §8 event) in one txn → **M2 reflects** `vendor_profiles.status=banned` + **M3 routing excludes** (structural — Invariant #11). The **authoritative ban state is M2's**; the `ban_action` is the admin decision record. `public_banner=true` → M2 renders the public banner (M2's surface). **RLS:** staff-only (§3.x). **Prisma [§2.5]:** `ModerationCase`/`BanAction`, enums.

## §3.2 — Suggestions

### §3.2.1 `admin.category_suggestions` · §3.2.2 `admin.missing_vendor_suggestions` (org + staff) · §3.2.3 `admin.link_suggestions` (**staff-only — never vendor-visible**)
Realizes Doc-2 §10.9 + A-03. Org-submitted suggestions (org + staff read); `link_suggestions` strictly staff-only.

```sql
CREATE TYPE admin.category_suggestion_state AS ENUM ('submitted','approved','rejected');  -- [Doc-2 §10.9 binding]
CREATE TYPE admin.missing_vendor_state AS ENUM ('submitted','triaged','closed');           -- [Doc-2 §10.9 binding]
CREATE TYPE admin.link_match_basis AS ENUM ('email','phone','trade_license');              -- [Doc-2 §10.9 binding]
CREATE TYPE admin.link_suggestion_state AS ENUM ('suggested','confirmed','dismissed');     -- [Doc-2 §10.9 binding]

CREATE TABLE admin.category_suggestions (
  id uuid NOT NULL, suggested_by_organization_id uuid NOT NULL,  -- [Doc-2 §10.9] bare UUID → M1 (suggesting org)
  proposed_parent_category_id uuid,                         -- [Doc-2 §10.9] bare UUID → M2
  state admin.category_suggestion_state NOT NULL DEFAULT 'submitted',  -- [Doc-2 §10.9]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT category_suggestions_pkey PRIMARY KEY (id)
);

CREATE TABLE admin.missing_vendor_suggestions (
  id uuid NOT NULL, suggested_by_organization_id uuid NOT NULL,  -- [Doc-2 §10.9]
  category_id uuid,                                         -- [Doc-2 §10.9] bare UUID → M2
  vendor_name text NOT NULL, contact_hint text,            -- [Doc-2 §10.9]
  state admin.missing_vendor_state NOT NULL DEFAULT 'submitted',  -- [Doc-2 §10.9]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT missing_vendor_suggestions_pkey PRIMARY KEY (id)
);

CREATE TABLE admin.link_suggestions (
  id uuid NOT NULL,
  private_vendor_record_id uuid NOT NULL,                  -- [Doc-2 §10.9] bare UUID → M4 operations.private_vendor_records
  vendor_profile_id uuid NOT NULL,                         -- [Doc-2 §10.9] bare UUID → M2
  confirmed_by uuid,                                       -- [Doc-2 §10.9] bare UUID → M1 (staff)
  match_basis admin.link_match_basis NOT NULL,             -- [Doc-2 §10.9]
  confidence numeric,                                      -- [Doc-2 §10.9]
  state admin.link_suggestion_state NOT NULL DEFAULT 'suggested',  -- [Doc-2 §10.9]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT link_suggestions_pkey PRIMARY KEY (id)
);
CREATE INDEX link_suggestions_record_idx ON admin.link_suggestions (private_vendor_record_id) WHERE state = 'suggested';  -- [§2.5]
```
- **`link_suggestions` confirm → M4 (A-03, AD-CR4):** on `confirmed`, the **Operations service** writes the link columns on `operations.private_vendor_records` (`linked_vendor_profile_id`/`link_status='linked'`/`link_confirmed_by`); M8 **never** writes the M4 table directly (Admin-decides/owning-module-owns). **Strictly staff-only RLS** — never vendor/org-visible (linking never exposes private data). **RLS:** §3.x. **Prisma [§2.5]:** `CategorySuggestion`/`MissingVendorSuggestion`/`LinkSuggestion`, enums.

## §3.x — Consolidated RLS DDL (Pass-1)
```sql
-- moderation_cases / ban_actions / link_suggestions: STAFF-ONLY (no vendor/org policy)
ALTER TABLE admin.moderation_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY moderation_cases_staff ON admin.moderation_cases FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- ban_actions: same staff-only (UPDATE limited to state/public_banner by the immutability trigger).
-- link_suggestions: same staff-only — NO vendor/org policy = never vendor-visible (A-03).

-- category_suggestions / missing_vendor_suggestions: suggesting org + staff
ALTER TABLE admin.category_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY category_suggestions_org ON admin.category_suggestions FOR ALL
  USING (suggested_by_organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (suggested_by_organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- missing_vendor_suggestions: same org+staff policy.
```

---

## Review Disposition (Independent Hard Review — Pass-1)

Reviewer: independent. Verified CORRECT: the 5-table set + columns (Doc-2 §10.9), moderation/ban/suggestion/link state sets verbatim, `match_basis`/`ban_subject_type` sets verbatim, polymorphic subjects, `ban_actions`→`VendorBanned`, A-03 link confirm via M4, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **LINK-LEAK** `link_suggestions` with any vendor/org policy breaches A-03 never-vendor-visible | BLOCKER (A-03/Invariant #11) | **FIXED** — §3.x: **staff-only**; no vendor/org policy; in-scope CHK-6-022. |
| **BAN-OWN** M8 writing `vendor_profiles.status` directly would violate Admin-decides/owning-module-owns | MAJOR | **FIXED** — §3.1.2: `ban_actions` emits `VendorBanned`; **M2 reflects** the authoritative status; M8 writes no M2 table. |
| **BAN-IMM** `ban_actions` subject/issuer mutable | MAJOR | **FIXED** — column-scoped trigger via `core.raise_immutable_violation` (subject/issued_by/scope/reason frozen; state/public_banner mutable; DELETE blocked). |
| **MOD-SUBJ** `moderation_cases.subject_type` enum values open-ended | MINOR | **CONFIRMED text** — Doc-2 "rfq etc." (open set); `text` discriminator (no coined enum); ban_subject_type IS enumerated (vendor_profile/organization). |
| **LINK-CONFIRM** link confirm writes M4 | MINOR | **CONFIRMED via service** — A-03: the Operations service writes the link columns on `private_vendor_records`; M8 emits/records, never writes M4 directly. |

**Net:** 1 BLOCKER (link non-disclosure) + 2 MAJOR (ban owning-module, ban immutability) fixed; 2 MINOR confirmed. The link-non-disclosure + ban-owning-module findings are load-bearing. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6J Content Pass-1 (§0–§2 · §3.1 Moderation & Bans · §3.2 Suggestions) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the moderation cases (polymorphic subject), the ban authority (`ban_actions` emits `VendorBanned`; M2 reflects the authoritative status; column-scoped immutable; public_banner → M2's surface), the org-submitted category/missing-vendor suggestions, and the **staff-only never-vendor-visible `link_suggestions`** (A-03; confirm → M4 via service). Columns verbatim Doc-2 §10.9; states verbatim; coins nothing. Next: Pass-2 (Import `import_jobs`/`import_rows` + Verification Tasks `verification_tasks` + Outreach `outreach_campaigns`/`outreach_contacts`).*
