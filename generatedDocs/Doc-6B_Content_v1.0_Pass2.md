# Doc-6B — M0 Platform Core (`core`) Schema Realization — Content v1.0 **Pass-2** (§3.3 · §3.4 · §3.5 · §5 · §6 + Appendix A)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-2 — Independent Hard Review applied** (1 BLOCKER + 3 MAJOR FIXED, 1 MAJOR verified-correct, 4 MINOR + 2 NITPICK; §Review Disposition). Realizes §3.3/§3.4/§3.5 + §5 + §6 + Appendix A (effective CR4′). Next: Content Freeze Audit |
| Date | 2026-06-26 |
| Builds on | Pass-1 (§0–§2 posture · §3.1 audit · §3.2 outbox · §4 cross-cutting + the shared immutability function) |
| Authority | `Doc-2 §0.1/§7/§10.1/§10.11` (the *what*); `Doc-6A` (the *how*); `Doc-4B §8/§18/§B9` (consumed); `Doc-3 §12` + Patch v1.0 (`core.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.1; 18 POLICY keys verbatim Doc-3 v1.0; physical specifics §2.5-tagged |

> Same binding/choice convention as Pass-1: **[Doc-2 binding]** verbatim; **[§2.5 choice]** for physical specifics. These are the actual `core` tables.

---

## §3.3 — `core.id_sequences` (the human-reference generator)

Realizes Doc-2 §0.1/§10.1/§10.11. **Composite PK `(entity_type, year)`** (CR3/CR6 — Doc-2-noted). Generates `human_ref` `TYPE-YEAR-XXXXX` for the whole platform; **row-locked, gap-tolerant, never-reused** (Doc-2 §10.11; Doc-6A §5.6).

```sql
CREATE TABLE core.id_sequences (
  entity_type text        NOT NULL,                    -- [Doc-2 §10.1] e.g. 'ORG','RFQ','QTN','INV','DOC'
  year        integer     NOT NULL,                    -- [Doc-2 §10.1] year scope
  next_value  bigint      NOT NULL DEFAULT 1,          -- [Doc-2 §10.1] monotonic counter
  created_at  timestamptz NOT NULL DEFAULT now(),      -- [Doc-6A R5]
  updated_at  timestamptz NOT NULL DEFAULT now(),      -- [Doc-6A R5] advances on allocation
  CONSTRAINT id_sequences_pkey PRIMARY KEY (entity_type, year)  -- [Doc-2/CR3] composite PK; name [§2.5]
);
```
- **Allocation (Doc-2 §10.11 — row-locked, gap-tolerant):** a `SECURITY DEFINER` function locks the `(entity_type, year)` row, increments, returns the formatted ref. Concurrency-safe; on caller rollback the consumed value is **not** reclaimed (gap-tolerant, never reused). The format `TYPE-YEAR-XXXXX` (zero-padded) is the realization of Doc-6A §3.2 (`human_ref`). Function name/padding width are [§2.5].

```sql
-- [§2.5] M0-owned allocator (Doc-4B §8 human-ref obligation realized as code)
CREATE FUNCTION core.allocate_human_ref(p_entity_type text, p_year integer)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$   -- SECURITY DEFINER: runs as M0 owner (RR-P2-001)
DECLARE v bigint;
BEGIN
  INSERT INTO core.id_sequences (entity_type, year) VALUES (p_entity_type, p_year)
    ON CONFLICT (entity_type, year) DO NOTHING;
  UPDATE core.id_sequences                              -- row lock via UPDATE … RETURNING
     SET next_value = next_value + 1, updated_at = now()
   WHERE entity_type = p_entity_type AND year = p_year
   RETURNING next_value - 1 INTO v;                      -- allocated = value before increment (first call → 1)
  IF v IS NULL THEN                                      -- RR-P2-002 guard: never emit a malformed ref
    RAISE EXCEPTION 'core.allocate_human_ref: no sequence row for (%, %)', p_entity_type, p_year;
  END IF;
  RETURN format('%s-%s-%s', p_entity_type, p_year, lpad(v::text, 6, '0'));  -- [§2.5] width 6 → ORG-2026-000001
END $$;
```
- **Not soft-deletable; `next_value` mutable; but DELETE-blocked (RR-P2-005):** `next_value`/`updated_at` mutate by design (the counter, via the allocator) — no immutability trigger on UPDATE. **DELETE is blocked** by `id_sequences_block_delete` (`BEFORE DELETE`, using `core.raise_immutable_violation()` with an **empty** protected-column set → DELETE branch only): deleting a sequence row would permit ref **reuse**, violating Doc-2 §10.11 "never reused." No soft-delete tuple (SD=NO).
- **UUIDv7 machine-ID** is a **separate** mechanism (Doc-4B §8 ID service) — this table is only the human-ref counter (CR6).
- **RLS:** platform-staff backstop (§2.2); allocation is via the `SECURITY DEFINER` function, not direct table writes.
- **Prisma [§2.5]:**
```prisma
model IdSequence {
  entityType String   @map("entity_type")
  year       Int
  nextValue  BigInt   @default(1) @map("next_value")
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz
  @@id([entityType, year])
  @@map("id_sequences")
  @@schema("core")
}
```

## §3.4 — `core.system_configuration` (the POLICY store)

Realizes Doc-2 §10.1 + Doc-3 §12. PK `id` (UUIDv7); `key` carries a **plain unique** constraint (SD=NO → no partial-live predicate). Holds every registered POLICY key; read by all modules via the M0 config service (Doc-4B §18).

```sql
CREATE TABLE core.system_configuration (
  id          uuid        NOT NULL,                    -- [Doc-6A §3.1] PK UUIDv7
  key         text        NOT NULL,                    -- [Doc-2 §10.1] full reference form core.system_configuration.core.<key> (Doc-4A §18.2)
  value_jsonb jsonb       NOT NULL,                    -- [Doc-2 §10.1]
  value_type  text        NOT NULL,                    -- [Doc-2 §10.1] integer|duration|enum|… (Doc-3 v1.0)
  updated_by  uuid,                                    -- [Doc-2 §10.1] actor (bare UUID; nullable for seed/System)
  created_at  timestamptz NOT NULL DEFAULT now(),      -- [Doc-6A R5]
  updated_at  timestamptz NOT NULL DEFAULT now(),      -- [Doc-6A R5]
  CONSTRAINT system_configuration_pkey PRIMARY KEY (id),       -- [§2.5] name
  CONSTRAINT system_configuration_key_uq UNIQUE (key)          -- [§2.5] name; plain unique (SD=NO → no partial-live predicate)
);
```
- **Changes audited** (Doc-2 §3.1): every config change writes a `core.audit_records` row (the audit-write obligation, Doc-4B §17/§18); bounded by `core.config_change_reason_min_chars` + `core.config_change_dedup_window` (Doc-3 v1.0).
- **Seed:** the 18 registered `core.*` keys (§5) — by pointer, **no key/value coined** (Doc-6A §9; Doc-3 v1.0 is authority).
- **Not soft-deletable** (SD=NO) → plain unique on `key`, no partial-live index.
- **Prisma [§2.5]:**
```prisma
model SystemConfiguration {
  id          String   @id @db.Uuid
  key         String   @unique
  valueJsonb  Json     @map("value_jsonb") @db.JsonB
  valueType   String   @map("value_type")
  updatedBy   String?  @map("updated_by") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz
  @@map("system_configuration")
  @@schema("core")
}
```

## §3.5 — `core.feature_flags` (rollout control, firewalled)

Realizes Doc-2 §10.1 + Doc-4B §B9. PK `id` (UUIDv7); **unique on `flag_key`**.

```sql
CREATE TABLE core.feature_flags (
  id         uuid        NOT NULL,                     -- [Doc-6A §3.1] PK UUIDv7
  flag_key   text        NOT NULL,                     -- [Doc-2 §10.1]
  enabled    boolean     NOT NULL DEFAULT false,       -- [Doc-2 §10.1] ([§2.5] default false)
  scope_jsonb jsonb,                                   -- [Doc-2 §10.1] rollout scope (e.g. org/percentage)
  created_at timestamptz NOT NULL DEFAULT now(),       -- [Doc-6A R5]
  updated_at timestamptz NOT NULL DEFAULT now(),       -- [Doc-6A R5]
  CONSTRAINT feature_flags_pkey PRIMARY KEY (id),              -- [§2.5] name
  CONSTRAINT feature_flags_flag_key_uq UNIQUE (flag_key)       -- [§2.5] name
);
```
- **Firewall (CR8 / Doc-4B §B9 — binding):** flag evaluation gates **feature visibility / rollout ONLY**; it **MUST NOT gate trust, verification, eligibility, routing fairness, or matching confidence**. Evaluation is code (M0 flag service); this table is the keyed store only.
- **Changes audited**; bounded by `core.flag_change_reason_min_chars` + `core.flag_change_dedup_window` (Doc-3 v1.0).
- **`enabled` is a domain boolean** (rollout on/off) — **not** a soft-delete flag (the §3.3 "never `is_deleted`" rule is about soft-delete, not domain booleans; this table is SD=NO).
- **Prisma [§2.5]:**
```prisma
model FeatureFlag {
  id         String   @id @db.Uuid
  flagKey    String   @unique @map("flag_key")
  enabled    Boolean  @default(false)
  scopeJsonb Json?    @map("scope_jsonb") @db.JsonB
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz
  @@map("feature_flags")
  @@schema("core")
}
```

## §5 — POLICY Seed & Migration

### §5.1 Structural migration (forward-only; Doc-6A §11)
The `core` schema migrates **first** in the program (every module depends on it — DR-6-CORE). Forward-only, non-destructive (Doc-6A §11.2). Order within the `core` migration: (1) `CREATE SCHEMA core`; (2) enums `core.actor_type`, `core.outbox_status`; (3) the shared functions `core.raise_immutable_violation()`, `core.outbox_status_forward_only()`, `core.audit_archive_set_once()`, `core.allocate_human_ref()`; (4) the 5 tables (+ `audit_records` monthly partitions, boundaries materialized here — Pass-1 §3.1); (5) indexes; (6) the immutability/guard triggers; (7) RLS enable + platform-staff policies; (8) the POLICY seed (§5.2). Codegen → `generated-contracts-registry/` (GENERATED, gitignored — Doc-6A §11.4).

### §5.2 POLICY seed (the 18 registered `core.*` keys — Doc-3 v1.0)
Idempotent forward-only seed migration; **upsert on `key`** (re-run safe — Doc-6A §9.5). Seeds **verbatim** from `Doc-3_Policy_Key_Registration_Patch_v1.0` (key, value_type, start value) — **none coined, no default invented** (Doc-6A §9; Doc-3 is authority):

`core.audit_query_page_size_max` · `core.audit_query_rate_window` · `core.audit_query_rate_reset` · `core.audit_lookup_rate_window` · `core.audit_lookup_rate_reset` · `core.audit_redactable_fields_max` · `core.audit_redaction_reason_min_chars` · `core.redaction_dedup_window` · `core.outbox_dispatch_max_attempts` · `core.outbox_dispatch_backoff` · `core.outbox_dispatch_dedup_window` · `core.outbox_dlq_policy` · `core.outbox_archive_retention` · `core.outbox_archive_dedup_window` · `core.config_change_reason_min_chars` · `core.config_change_dedup_window` · `core.flag_change_reason_min_chars` · `core.flag_change_dedup_window` (**18**).

Seed pattern (idempotent upsert — Doc-6A §9.5; one row per registered key, values verbatim from Doc-3 v1.0):
```sql
INSERT INTO core.system_configuration (id, key, value_jsonb, value_type)
VALUES (<uuidv7>, 'core.<key>', '<value>'::jsonb, '<value_type>')   -- per Doc-3 v1.0 §3 (key, type, start value)
ON CONFLICT (key) DO UPDATE
   SET value_jsonb = EXCLUDED.value_jsonb, value_type = EXCLUDED.value_type, updated_at = now();
```
`updated_by` on seed rows is `NULL` (System/seed); reference form `core.system_configuration.core.<key>` (Doc-4A §18.2). **No role/permission seed here** — roles are `identity`/Doc-6C (Doc-2 §7 / A-08).

## §6 — Conformance & Carried Items
- Doc-6B coins nothing; realizes the 5 Doc-2 §10.1 tables + the shared infra functions + the 18-key seed. `[ESC-6-POLICY]` (core) **already cleared** (Doc-3 v1.0). Carried: `DR-6-CORE` (resolved — this is the owner), `DR-6-API` (Band H — Doc-5B reads persistable), `[ESC-6-SCHEMA]` — **none**: `archived_at` / `event_time` / `allocate_human_ref` are §2.5 realization choices (column/function names) of Doc-2-stated concepts (Doc-2 §10.1 archive flag, §9 `timestamp`, §0.1 human-ref allocation) — no Doc-2-undeclared entity, no coinage. On any conflict, flag-and-halt (the CR4 → CR4′ patch is the worked example).

---

## Appendix A — Doc-6B Conformance Attestation (Doc-6A `CHK-6-xxx`, 10 bands / 37 checks)

| Check | Disposition | Evidence |
|---|---|---|
| **A** CHK-6-001 `id UUIDv7` PK | **PASS (w/ CR3)** | 3 tables `id UUIDv7`; `audit_records`=`audit_id` (UUIDv7), `id_sequences`=composite — Doc-2-noted (CR3) |
| A CHK-6-002 `human_ref` only where Doc-2 mandates | **N/A** | core is infra-only (CR2) — no `core` entity is customer-facing; `id_sequences` *generates* `human_ref`, carries none. **Downstream: Doc-6C/6D/6E/6F MUST attest CHK-6-002 PASS** — organizations/vendor_profiles/rfqs/quotations carry `human_ref` (Doc-2 §0.1) |
| A CHK-6-003 timestamp tuple; actor stamps where Doc-2 declares | **PASS** | all 5 carry `created_at`/`updated_at`; `updated_by` only on `system_configuration` (Doc-2 §10.1) |
| A CHK-6-004 soft-delete tuple; no `is_deleted` | **N/A** | all SD=NO (CR4); `feature_flags.enabled` is a domain bool, not soft-delete |
| A CHK-6-005 partial-unique on soft-deletable | **N/A** | SD=NO → plain unique (`system_configuration.key`, `feature_flags.flag_key`) |
| **B** CHK-6-010 schema=namespace; one Prisma ns | **PASS** | `core`; `@@schema("core")` (R3a/b) |
| B CHK-6-011 no cross-schema FK | **PASS** | refs (`actor_id`/`organization_id`/`entity_id`/`aggregate_id`/`updated_by`) bare UUID |
| B CHK-6-012 cross-module ref = bare UUID, service-validated | **PASS** | §4.2/§4.3 |
| B CHK-6-013 no cross-schema JOIN/RLS traversal | **PASS** | orphan-scan via service (§4.3); RLS platform-staff only |
| **C** CHK-6-020 RLS org-anchor | **N/A** | platform-owned (CR2); RLS = platform-staff backstop |
| C CHK-6-021 materialized grantees | **N/A** | no vendor/cross-party access in `core` |
| C CHK-6-022 non-disclosure byte-equiv | **N/A** | no tenant surface in `core` |
| C CHK-6-023 authz app-layer; RLS no business authz | **PASS** | §2.2 platform-staff backstop; authz app-layer |
| **D** CHK-6-030 no hard-DELETE on authoritative | **PASS** | DELETE blocked on audit + outbox (§4.1, CR4′) **and `id_sequences`** (`id_sequences_block_delete` — never-reused, Doc-2 §10.11); `system_configuration`/`feature_flags` are mutable configuration (DELETE permitted for admin ops), not authoritative history |
| D CHK-6-031 versioned tables immutable once bound | **N/A** | no versioned table in `core` |
| D CHK-6-032 history INSERT-only; System-actor scores | **PASS** | audit append-only (CR4′); no score tables in `core` |
| D CHK-6-033 only `ai.*` TTL hard-delete | **PASS (N/A by design)** | `core` hard-deletes nothing; not the `ai` schema |
| **E** CHK-6-040 transactional write+emit | **PASS** | §3.2/§4 outbox one-transaction (Doc-6A §7.1) |
| E CHK-6-041 no event coined; consumer effects own-schema | **PASS** | Doc-2 §8/Doc-4J/Doc-4L by pointer |
| E CHK-6-042 audit append-only, immutable; redaction-as-new; cols per §9 | **PASS** | §3.1 + §4.1 (CR4′) |
| E CHK-6-043 audited-action coverage; none coined | **PASS** | config/flag changes audited via the **Doc-4B §17 audit-write obligation** (code, CR9 — core supplies the rows + the audit table; the write mechanism is realized in Doc-4B, not here); actions by pointer, none coined |
| **F** CHK-6-050 multi-currency NUMERIC+currency | **N/A** | no monetary column in `core` |
| **G** CHK-6-060 `system_configuration` realized; keys seeded; none coined | **PASS** | §3.4/§5.2 — 18 `core.*` keys (Doc-3 v1.0) |
| G CHK-6-061 page-size/idempotency via POLICY key, not literal | **PASS** | outbox/audit bounds via `core.*` keys (§3.1/§3.2) |
| G CHK-6-062 role/permission seed per Doc-2 §7/A-08 | **N/A** | roles = `identity`/Doc-6C, not `core` |
| **H** CHK-6-070 Doc-5x reads persistable | **PASS** | Doc-5B audit query/correlation + config/flag reads supported (§3.1 indexes) |
| H CHK-6-071 deterministic sort-key index per list | **PASS** | audit `(org, event_time)`/`(entity, event_time)`; outbox `(status, created_at)` |
| H CHK-6-072 idempotency-dedup persisted | **PASS** | dedup windows are `core.*` POLICY keys; dispatch/redaction dedup per Doc-4B |
| H CHK-6-073 non-persistable → `[ESC-6-API]` | **PASS** | none raised |
| **I** CHK-6-080 nothing coined; traces to Doc-2 | **PASS** | 5 tables Doc-2 §10.1; columns §9/§10.1; keys Doc-3 v1.0 |
| I CHK-6-081 physical specifics §2.5-attributed | **PASS** | types/names/triggers/partitioning/GUC tagged |
| I CHK-6-082 no out-of-DB artifact as table | **PASS** | no blob/search/realtime table (Doc-6A §12) |
| I CHK-6-083 `[ESC-6-*]` routed to named channel | **PASS** | §6; none open |
| **J** CHK-6-090 extends B.1 base model + B.2 types | **PASS** | std columns + type catalog applied |
| J CHK-6-091 no shared enum coined; B.3 reused | **PASS** | `actor_type` reuses B.3 shared enum; `outbox_status` is M0-owned infra |
| J CHK-6-092 B.4 naming registry followed | **PASS** | `_pkey`/`_uq`/`_idx`/trigger names per B.4 |
| J CHK-6-093 B.5 conventions (multi-schema/migration) | **PASS** | §5 migration; one Prisma ns |

**Result: 0 FAIL.** PASS where applicable; N/A dispositions justified by `core`'s platform-owned / infra-only / no-money / no-versioned / no-roles nature. **Doc-6B is Appendix-A conformant.**

---

## Review Disposition (Independent Hard Review — Pass-2)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Verified CORRECT: id_sequences/config/flags columns + composite PK (Doc-2 §10.1; CR3), the **18 POLICY keys verbatim** (Doc-3 v1.0), allocator arithmetic (first ref `000001`), BigInt mapping, no cross-schema FK, CR8 firewall, timestamp tuples. 

| Finding | Sev | Disposition |
|---|---|---|
| **RR-P2-001** allocator prose claims `SECURITY DEFINER`, DDL omits it | BLOCKER | **FIXED** — `SECURITY DEFINER` added to the DDL. |
| **RR-P2-002** allocator silent-NULL if UPDATE returns 0 rows → malformed ref | MAJOR | **FIXED** — `IF v IS NULL THEN RAISE` guard added. |
| **RR-P2-005** `id_sequences` DELETE not blocked (never-reused invariant) | MAJOR | **FIXED** — `id_sequences_block_delete` (`BEFORE DELETE`, generic fn, empty protected set) added; CHK-6-030 evidence clarified (audit+outbox+id_sequences blocked; config/flags mutable). |
| **RR-P2-003** CHK-6-002 N/A doesn't signal downstream-PASS | MAJOR | **FIXED** — evidence now states Doc-6C/6D/6E/6F MUST attest PASS (human_ref carriers). |
| **RR-P2-004** 18-key count | MAJOR | **VERIFIED CORRECT** — no action (all 18 match Doc-3 v1.0 §3 verbatim). |
| **RR-P2-006** SECURITY DEFINER attribution | MINOR | **FIXED** — folded into RR-P2-001. |
| **RR-P2-007** seed idempotency SQL not shown | MINOR | **FIXED** — inline `INSERT … ON CONFLICT (key) DO UPDATE` upsert added (§5.2). |
| **RR-P2-008** config "unique on key" prose | MINOR | **FIXED** — "`key` plain unique (SD=NO → no partial-live predicate)." |
| **RR-P2-009** Appendix-A config/flag audit split-responsibility | MINOR | **FIXED** — CHK-6-043 evidence notes audit-write is a Doc-4B §17 obligation (code, CR9). |
| **RR-P2-010** composite-PK notation | NIT | **NOTED** — already cites CR3/CR6/Doc-2 §10.1; left as-is. |
| **RR-P2-011** `[ESC-6-SCHEMA]` wording | NIT | **FIXED** — §6 rephrased ("none; §2.5 realizations of Doc-2 concepts, no coinage"). |

**Net:** 1 BLOCKER + 3 MAJOR fixed (SECURITY DEFINER, NULL guard, id_sequences DELETE-block + CHK-6-030, CHK-6-002 downstream signal); 1 MAJOR verified-correct; MINOR/NIT applied. DDL now correct + complete. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6B Content Pass-2 (§3.3 · §3.4 · §3.5 · §5 · §6 + Appendix A) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the 3 keyed tables + the human-ref allocator + the 18-key POLICY seed + the migration order + full Appendix-A attestation (0 FAIL). Columns verbatim Doc-2 §10.1; keys verbatim Doc-3 v1.0; physical specifics §2.5-attributed; coins nothing. With Pass-1, Doc-6B content is complete (all 5 `core` tables). Next: Content Hard Review (full Pass-1+2) → Content Freeze Audit → `Doc-6B_SERIES_FROZEN`.*
