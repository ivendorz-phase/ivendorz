# Doc-6D_VendorSlugSubdomain_Patch_v1.0.1.md

> **✅ STATUS: APPROVED (human — owner/Board ruling 2026-07-03; artifact text gate-confirmed same day) + FOLDED into the corpus.**
> This is the corpus copy `generatedDocs/Doc-6D_VendorSlugSubdomain_Patch_v1.0.1.md`,
> registered in `00_AUTHORITY_MAP.md`, carried **alongside** the unedited frozen Doc-6D passes — **no frozen
> file edited in place.**
> Origin/provenance: `governanceReviews/Doc-6D_VendorSlugSubdomain_Additive_Patch_PROPOSAL.md`. **Linked set** with `Doc-2_Patch_v1.0.5` (PATCH-D2-04, the business semantics this
> realizes at the DDL layer), `Doc-4D_CanonicalHost_Patch_v1.0.2`, and
> `Doc-3_Policy_Key_Registration_Patch_v1.10_VendorSubdomain` — folded together. Decision record:
> `governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md`; decision: **ADR-024**.

## Status

Approved Patch — FOLDED 2026-07-03 (human-approved: owner/Board ruling + same-day gate confirmation)

| Field | Value |
|---|---|
| Applies to | Doc-6D (M2 `marketplace` schema realization) — `Doc-6D_Content_v1.0_Pass1.md` (vendor_profiles DDL) + `Doc-6D_Content_v1.0_Pass2.md` (profile-experience DDL + RLS) |
| Produces | Doc-6D **v1.0 (+ additive patch v1.0.1)** — first post-freeze Doc-6D patch |
| Scope | **DDL realization of PATCH-D2-04 — nothing else**: (a) one additive CHECK constraint on `marketplace.vendor_profiles.slug`; (b) one new table `marketplace.vendor_slug_history` + RLS + Prisma note. No existing column, index, constraint, policy, enum, or table is modified or removed. |
| Purpose | Realize the Doc-2 v1.0.5 Vendor Slug format law and the `vendor_slug_history` child entity in the `marketplace` schema. |
| Raised by | Owner directive (2026-07-03) + CTO-review adjudication (4 rounds); **Final Architecture Board Resolution 2026-07-03: APPROVED**. |
| Authority | CLAUDE.md §7 (Doc-6D = rank 0 realization), §8, §11, §13; Doc-6A conventions (R5 timestamps, §5.2 intra-schema FK, §4.6 RLS split); Doc-2 v1.0.5 D2-04.2/D2-04.5 (the law this realizes — referenced, never restated). |

---

# PATCH-6D-VSS-01 — Vendor Slug DDL realization

## 6D-VSS-01.1 — Additive CHECK on `marketplace.vendor_profiles.slug`

Additive constraint (the column, its `vendor_profiles_slug_live_uq` partial-unique index, and every other
`vendor_profiles` constraint are **untouched**):

```sql
ALTER TABLE marketplace.vendor_profiles
  ADD CONSTRAINT vendor_profiles_slug_format_ck
  CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
         AND char_length(slug) BETWEEN 3 AND 40
         AND slug NOT LIKE 'xn--%');   -- [Doc-2 v1.0.5 D2-04.2] Vendor Slug format law (FIXED); ASCII/punycode rejection
```

- The regex + length + `xn--` rejection realize the **FIXED** format law verbatim from Doc-2 v1.0.5
  D2-04.2 (defined there once; this is its DDL binding, not a second definition).
- **Reserved-label enforcement is app-layer** — validated at issuance/migration against POLICY key
  `marketplace.reserved_subdomain_labels` (Doc-3 v1.10), mirroring the DD-5 posture ("the DB stores the
  domain + status only; the gate is app-layer" — Doc-6D Pass-2 custom_domains note). A POLICY-tunable list
  cannot live in a CHECK constraint (list changes are admin-permissioned config, never DDL migrations).
- **Existing-row safety:** current seed/FE slugs are kebab-case and conform; the constraint is validated at
  fold-into-migration time (implementation wave). If any pre-existing row ever fails it, that is resolved by
  M8 admin migration (Doc-2 v1.0.5 D2-04.4), never by weakening the law.

## 6D-VSS-01.2 — New table: `marketplace.vendor_slug_history`

```sql
CREATE TABLE marketplace.vendor_slug_history (
  id                uuid NOT NULL,                                 -- [Doc-6A] UUIDv7
  vendor_profile_id uuid NOT NULL,                                 -- [Doc-6A §5.2] intra-schema FK
  old_slug          text NOT NULL,                                 -- [Doc-2 v1.0.5 D2-04.5] never reused (Invariant 8)
  new_slug          text NOT NULL,
  reason            text NOT NULL,
  approved_by       uuid NOT NULL,                                 -- M8 admin actor (attribution)
  migrated_at       timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),  -- [Doc-6A R5]
  created_by uuid, updated_by uuid,                                -- [Doc-2 §0.2] actor
  CONSTRAINT vendor_slug_history_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_slug_history_profile_fk FOREIGN KEY (vendor_profile_id)
    REFERENCES marketplace.vendor_profiles(id),
  CONSTRAINT vendor_slug_history_old_slug_uq UNIQUE (old_slug)     -- GLOBAL (non-partial): a retired slug is never reused by anyone
);
```

- **No soft-delete columns** (`deleted_at`/`deleted_by`/`delete_reason` deliberately absent): the record is
  **append-only and permanent**, mirroring `marketplace.vendor_ownership_history` ("NO (permanent)" — Doc-2
  §10.3). History is never edited, never deleted (Invariant 8).
- `old_slug` uniqueness is **global and non-partial** (unlike the live-slug partial index): never-reuse
  holds forever, not merely while live.
- **No event coined**; the write is audited under the Doc-2 v1.0.5 §9 business action "slug migration
  (admin-mediated)" (wire token deferred with the migration contract — `[ESC-MKT-SUBDOMAIN-MIGRATE]`).

## 6D-VSS-01.3 — RLS

```sql
ALTER TABLE marketplace.vendor_slug_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_slug_history_public_read ON marketplace.vendor_slug_history FOR SELECT
  USING (true);                                                    -- old→new slug mappings are public facts (they serve public 301 resolution)
-- No INSERT/UPDATE/DELETE policy for tenant roles: writes are System/service-role only
-- (the M8-mediated migration path), mirroring the derived/system-write posture (Doc-6D Pass-1 conventions).
```

- **Public SELECT is deliberate and safe:** a retired slug's permanent 301 is public behavior (anyone
  hitting the old Platform-issued Vendor Subdomain observes the redirect), so the mapping discloses nothing
  beyond what the redirect itself already discloses. It reveals **no** exclusion, matching, or governance
  fact (Invariant 11 intact — unknown slugs still 404 byte-identically; only *migrated* slugs 301).
- **No tenant write path:** the vendor cannot write its own slug history (vendor-immutable — Doc-2 v1.0.5
  D2-04.4).

## 6D-VSS-01.4 — Prisma note (Doc-6A §2.5 convention)

Model `VendorSlugHistory` (fields per 6D-VSS-01.2; no soft-delete mixin). No enum added.

## 6D-VSS-01.5 — Appendix-A posture

**No CHK-6-xxx posture changes.** All existing Doc-6D Appendix-A checks stand unchanged; this patch adds
one CHECK constraint and one append-only table with the standard RLS split — no existing policy, index, or
constraint is modified.

---

# Non-impact confirmation

| Aspect | Effect |
|---|---|
| `vendor_profiles` columns / indexes / existing constraints | Unchanged — one additive CHECK only |
| `vendor_profiles_slug_live_uq` (live-unique slug) | Unchanged |
| `custom_domains` table / enum / RLS / DD-5 entitlement posture | Unchanged |
| All other `marketplace` tables, RLS policies, enums | Unchanged |
| Soft-delete conventions (Doc-2 §0.2) | Followed — deliberately absent here per the permanent-history precedent (`vendor_ownership_history`) |
| Events / contracts / projections | None coined (Doc-4D v1.0.2 confirms the wire side coins nothing) |

---

*End of Doc-6D_VendorSlugSubdomain_Patch_v1.0.1 — DDL realization of the Vendor Slug law (format CHECK
incl. punycode rejection) + the permanent `vendor_slug_history` table (global never-reuse,
public-read/system-write RLS). Reserved-label enforcement stays app-layer via the Doc-3 v1.10 POLICY key.
Linked set with Doc-2 v1.0.5 · Doc-4D v1.0.2 · Doc-3 v1.10; decision ADR-024. **APPROVED & FOLDED into the
corpus (human, owner/Board ruling 2026-07-03).***
