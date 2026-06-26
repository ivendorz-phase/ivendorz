# Doc-6B — M0 Platform Core (`core`) Schema Realization — Content v1.0 **Pass-1** (§0–§2 · §3.1 · §3.2 · §4)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-1 — Independent Hard Review applied** (0 BLOCKER + 3 MAJOR FIXED + 1 MAJOR rejected-false + 3 MINOR + 3 NITPICK; §Review Disposition). Realizes §0–§2 + §3.1 `audit_records` + §3.2 `outbox_events` + §4 cross-cutting (effective CR4′). Next: Pass-2 |
| Date | 2026-06-26 |
| Realizes | the two append-only streams + the `core`-wide posture + the shared immutability function |
| Authority | `Doc-2 §2/§8/§9/§10.1` (the *what*); `Doc-6A` (the *how*, FROZEN); `Doc-4B §16/§17` (consumed obligations); `Doc-3 v1.0` (`core.*` POLICY) |
| Coins | **Nothing.** Columns verbatim from Doc-2 §9/§10.1; PKs Doc-2-noted (CR3); physical types/names/triggers/indexes are §2.5 realization choices (Doc-6A §2.5), tagged inline |
| DDL note | SQL is PostgreSQL 15+; Prisma fragments use `@@schema("core")` (R3b). These are the **actual `core` tables** (this is the realization doc) — not generic templates |

> **Binding vs choice (Doc-6A §2.5).** Every column name/type that traces to Doc-2 is a **[Doc-2 binding]** realized verbatim; every physical specific not stated by Doc-2 (PG types, enum labels, trigger/index names, partitioning mechanism, RLS GUC) is a **[§2.5 choice]**. Tagged throughout.

---

## §0 — Document Control, Precedence & Conformance Obligation

Doc-6B sits at: `Doc-2 · Doc-3 → Doc-4A → Doc-4B → Doc-6A → **Doc-6B** → Code`. It **realizes** Doc-2 §10.1's `core` tables (the *what*) against the frozen **Doc-6A** conventions (the *how*), and **passes Doc-6A Appendix A** (`CHK-6-xxx`) before content freeze. Realize-never-redecide; reference-never-restate; flag-and-halt on any corpus conflict (the CR4 over-tightening was the worked example — `Doc-6B_Structure_Additive_Patch_v1.0`, CR4′ approved). Doc-6B coins nothing.

## §1 — Scope & the `core` Table Partition

Doc-6B governs the **5 platform-owned `core` tables** (Doc-2 §10.1). Pass-1 realizes `audit_records` (§3.1) + `outbox_events` (§3.2) + the cross-cutting layer (§4); Pass-2 realizes `id_sequences` + `system_configuration` + `feature_flags` + seed/migration + conformance. The Doc-4B **obligations** other modules invoke against M0 (audit-write §17, transactional-outbox-write §16.2, ID/human-ref §8, POLICY §18, flag eval) are **code, referenced not re-authored** (CR9). `core` is **DR-6-CORE** — referenced by every module by bare UUID, never re-authored (One Module, One Owner). Infra-only: no business aggregate, no Doc-2 §5 state machine (Doc-2 §2).

## §2 — Schema, Tenancy & Immutability Posture

### §2.1 Schema + standard columns
- Physical schema **`core`** (Doc-6A R3a); one Prisma namespace (`@@schema("core")`, R3b).
- Standard columns per Doc-6A §3.3 / Appendix B.1: `created_at`, `updated_at` on every table; **no actor `*_by` except where Doc-2 declares** (`system_configuration.updated_by`); **no `organization_id` tenant column** on any `core` table (platform-owned — §2.2).

### §2.2 Tenancy posture (CR2 — platform-owned, no org anchor)
All five tables are **platform-owned** (Doc-2 §6). **No org RLS anchor.** RLS is the **platform-staff backstop** (Doc-6A §4.5 — app-layer authz is primary): every `core` table enables RLS with a **platform-staff-scope** policy; org-isolation / materialized-grantee / non-disclosure machinery is **N/A** (CR2). Generic policy (the mechanism is a **[§2.5 choice]**):

```sql
ALTER TABLE core.<table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY <table>_platform_staff ON core.<table>
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);  -- [§2.5] set by src/server guard; never client
```
`core.audit_records.organization_id` is an **audit-context reference column** (Doc-2 §9), **not** a tenant anchor — never an RLS predicate.

### §2.3 Immutability posture (CR4′ — column-scoped)
"Append-only" for `audit_records`/`outbox_events` = **no DELETE + immutable business payload + bounded operational-field updates** (CR4′; Doc-2 §2/§9 + Doc-4B F-03). Realized by a **column-aware immutability trigger** (§4.1), not a blanket UPDATE block. All five tables are **SD=NO** → no soft-delete tuple, no partial-unique-live index (Doc-6A §3.3/§3.5 **N/A**).

### §2.4 N/A-band map (Doc-6A Appendix A)
| Band | Disposition |
|---|---|
| C Tenancy/RLS org-anchor, grantee, non-disclosure byte-equiv | **N/A** — platform-owned (CR2); platform-staff RLS backstop only |
| F Multi-currency | **N/A** — no monetary column in `core` |
| Soft-delete tuple / partial-unique (within A) | **N/A** — SD=NO (CR4′) |
| ai.* TTL hard-delete (within D) | **N/A** — not the `ai` schema |

---

## §3.1 — `core.audit_records` (the immutable audit stream)

Realizes Doc-2 §9/§10.1. PK `audit_id` (CR3 — Doc-2-noted, time-ordered UUIDv7). Columns **[Doc-2 §9 binding]** verbatim; physical types **[§2.5]**.

```sql
-- shared cross-cutting enum (Appendix B.3; M0-owned). Enum-value lowercase_underscored is a
-- Doc-6A §3.4 binding; the physical labels are [§2.5]. Label = Doc-2 §9 actor type:
-- 'user'=User, 'admin'=Admin, 'system'=System, 'ai_agent'=AI Agent. Logical value set = [Doc-2 §9 binding].
CREATE TYPE core.actor_type AS ENUM ('user', 'admin', 'system', 'ai_agent');

CREATE TABLE core.audit_records (
  audit_id        uuid             NOT NULL,            -- [Doc-2 §9] PK; UUIDv7 time-ordered (CR3)
  actor_id        uuid,                                 -- [Doc-2 §9] nullable: System/automated actions may carry no user actor_id (actor_type then 'system'/'ai_agent'); [§2.5] nullability
  actor_type      core.actor_type  NOT NULL,           -- [Doc-2 §9]
  organization_id uuid,                                 -- [Doc-2 §9] audit-context REFERENCE col, not RLS anchor (CR2); nullable for platform actions
  entity_type     text             NOT NULL,           -- [Doc-2 §9]
  entity_id       uuid             NOT NULL,           -- [Doc-2 §9]
  action          text             NOT NULL,           -- [Doc-2 §9]
  old_value       jsonb,                                -- [Doc-2 §9]
  new_value       jsonb,                                -- [Doc-2 §9]
  event_time      timestamptz      NOT NULL,           -- [Doc-2 §9] logical name = `timestamp`; physical name `event_time` is a [§2.5] reserved-word-avoidance naming choice (Doc-6A §2.5 physical-naming); logical binding preserved
  ip_address      inet,                                 -- [Doc-2 §9] ([§2.5] inet type)
  user_agent      text,                                 -- [Doc-2 §9]
  archived_at     timestamptz,                          -- realizes the Doc-2 §10.1 "soft archive flag" CONCEPT; the column NAME is a [§2.5] choice (Doc-2 states the flag, not a column name); CR4′ permitted update, set-once (§4.1 guard)
  created_at      timestamptz      NOT NULL DEFAULT now(), -- [Doc-6A R5]
  updated_at      timestamptz      NOT NULL DEFAULT now(), -- [Doc-6A R5] advances only on archive (CR4′)
  CONSTRAINT audit_records_pkey PRIMARY KEY (audit_id)  -- [§2.5] name; PK col = [Doc-2/CR3]
) PARTITION BY RANGE (audit_id);                        -- [§2.5/CR10] monthly partitions via UUIDv7 time-order
```
- **Partitioning [§2.5/CR10]:** monthly range partitions; because `audit_id` is a **time-ordered UUIDv7**, month boundaries are the UUIDv7 values at each month edge — so partition-by-`audit_id`-range = partition-by-month while keeping PK = `audit_id` exactly (CR3). Partition creation/rotation (native declarative or `pg_partman`) is a [§2.5] operational detail; the concrete monthly boundary values are materialized in the Pass-2 migration.
- **Immutability (CR4′):** two `BEFORE UPDATE OR DELETE` triggers (§4.1) — the generic `audit_records_block_payload_mutation` (payload + identity immutable: `audit_id, actor_id, actor_type, organization_id, entity_type, entity_id, action, old_value, new_value, event_time, ip_address, user_agent, created_at`) **+** `audit_records_archive_set_once`; **only `archived_at` (set-once, §4.1 guard) + `updated_at` mutable**; **DELETE blocked**. **Redaction = a NEW audit row** (Doc-2 §9), never an in-place payload edit. Prisma `@updatedAt` advances `updated_at` only on the CR4′-permitted writes (the only writes the trigger admits).
- **No blobs** (Doc-6A §12): `old_value`/`new_value` hold field values/diffs; document versions referenced by ID, never binary.
- **Indexes [§2.5]** (serve Doc-5B audit reads — Band H; bounded by `core.audit_query_*` keys): `(organization_id, event_time)` for org-scoped audit queries; `(entity_type, entity_id, event_time)` for the entity correlation lookup (`core.audit_correlation_lookup.v1`). Names: `audit_records_org_time_idx`, `audit_records_entity_time_idx` [§2.5].
- **Prisma [§2.5]:**
```prisma
model AuditRecord {
  auditId        String   @id @map("audit_id") @db.Uuid
  actorId        String?  @map("actor_id") @db.Uuid
  actorType      ActorType @map("actor_type")
  organizationId String?  @map("organization_id") @db.Uuid
  entityType     String   @map("entity_type")
  entityId       String   @map("entity_id") @db.Uuid
  action         String
  oldValue       Json?    @map("old_value") @db.JsonB
  newValue       Json?    @map("new_value") @db.JsonB
  eventTime      DateTime @map("event_time") @db.Timestamptz
  ipAddress      String?  @map("ip_address") @db.Inet
  userAgent      String?  @map("user_agent")
  archivedAt     DateTime? @map("archived_at") @db.Timestamptz
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz
  @@map("audit_records")
  @@schema("core")
}
enum ActorType { user admin system ai_agent  @@schema("core") }
```
- **Audit-write is a Doc-4B §17 obligation** invoked by every module's service in-transaction; Doc-6B realizes the table, not the write logic (CR9).

## §3.2 — `core.outbox_events` (the transactional outbox)

Realizes Doc-2 §8/§10.1. PK `id` (UUIDv7). Columns **[Doc-2 §10.1 binding]** + standard columns (Doc-6A §7.2).

```sql
CREATE TYPE core.outbox_status AS ENUM ('pending', 'dispatched', 'archived');  -- [Doc-2 §10.1 lifecycle binding]; status col, not §5 machine (CR5)

CREATE TABLE core.outbox_events (
  id            uuid               NOT NULL,            -- [Doc-6A §3.1] PK UUIDv7
  aggregate_id  uuid,                                   -- [Doc-2 §10.1 Ref] bare UUID, no cross-schema FK (§5.3)
  event_name    text               NOT NULL,           -- [Doc-2 §10.1/§8]
  event_version integer            NOT NULL,           -- [Doc-2 §10.1/§8]
  payload_jsonb jsonb              NOT NULL,           -- [Doc-2 §10.1] IDs + metadata, no blobs (Doc-6A §12)
  status        core.outbox_status NOT NULL DEFAULT 'pending', -- [Doc-2 §10.1]
  dispatched_at timestamptz,                            -- [Doc-2 §10.1]
  attempts      integer            NOT NULL DEFAULT 0,  -- [Doc-2 §10.1]
  created_at    timestamptz        NOT NULL DEFAULT now(), -- [Doc-6A R5/§7.2]
  updated_at    timestamptz        NOT NULL DEFAULT now(), -- [Doc-6A R5] advances on status/dispatch update
  CONSTRAINT outbox_events_pkey PRIMARY KEY (id)        -- [§2.5] name
);
CREATE INDEX outbox_events_status_created_at_idx       -- [§2.5/Doc-6A §10] dispatcher poll
  ON core.outbox_events (status, created_at);
```
- **Transactional write+emit (Doc-6A §7.1):** every Doc-2 §8 emitter inserts its `outbox_events` row in the **same transaction** as the business write — the one sanctioned write to the M0-owned outbox via Doc-4B §16.2 (not a foreign business-table write). Dispatch is code (Inngest).
- **Immutability (CR4′):** two `BEFORE UPDATE OR DELETE` triggers (§4.1) — the generic `outbox_events_block_payload_mutation` (business payload immutable: `id, aggregate_id, event_name, event_version, payload_jsonb, created_at`) **+** `outbox_events_status_forward_only`; **operational fields mutable by the dispatcher** (`status`, `dispatched_at`, `attempts`, `updated_at`); **`status` forward-only** `pending→dispatched→archived` (enforced by the `outbox_events_status_forward_only` trigger §4.1 — a CHECK cannot compare OLD/NEW); **DELETE blocked** (archived, not deleted — Doc-2 §10.1).
- **Bounded by POLICY** (Doc-3 v1.0): `core.outbox_dispatch_max_attempts`, `core.outbox_dispatch_backoff`, `core.outbox_dlq_policy`, `core.outbox_archive_retention` (+ dedup windows) — read from `system_configuration`, never literals (Doc-6A §10.2).
- **No event coined** (Doc-2 §8 / Doc-4J catalog / Doc-4L flow). Consumer effects persist in the consumer's own schema.
- **Prisma [§2.5]:**
```prisma
model OutboxEvent {
  id            String       @id @db.Uuid
  aggregateId   String?      @map("aggregate_id") @db.Uuid
  eventName     String       @map("event_name")
  eventVersion  Int          @map("event_version")
  payloadJsonb  Json         @map("payload_jsonb") @db.JsonB
  status        OutboxStatus @default(pending)
  dispatchedAt  DateTime?    @map("dispatched_at") @db.Timestamptz
  attempts      Int          @default(0)
  createdAt     DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime     @updatedAt @map("updated_at") @db.Timestamptz
  @@index([status, createdAt])
  @@map("outbox_events")
  @@schema("core")
}
enum OutboxStatus { pending dispatched archived  @@schema("core") }
```

## §4 — Cross-Cutting `core` Realization

### §4.1 The shared column-aware immutability function (CR4′ / Doc-6A §6.3/§6.4)
One M0-owned function, **parameterized by the protected-column set** (passed as trigger arguments) — realizes append-only at **column granularity**, not a blanket block. Every other module's immutability triggers (Doc-6A §6.3) reference this function. Column comparison uses the **`->` json operator (native jsonb value comparison)**, not `->>` (text) — so jsonb payload columns (`old_value`/`new_value`/`payload_jsonb`) compare by value, not lossy text (RR-F6).

```sql
-- [§2.5] M0-owned shared function (Doc-6A §6.3 names it; realized here)
CREATE FUNCTION core.raise_immutable_violation() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE col text; o jsonb; n jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN                               -- DELETE branch first; on a DELETE-only trigger
    RAISE EXCEPTION 'core: % is append-only; DELETE forbidden (CR4'')', TG_TABLE_NAME;  -- (empty TG_ARGV) this raises and the FOREACH never runs
  END IF;
  o := to_jsonb(OLD); n := to_jsonb(NEW);               -- only reached on UPDATE (OLD/NEW both populated)
  -- TG_ARGV = the protected (immutable) column names; any change raises.
  -- `->` (jsonb) compares by value across all column types (jsonb-safe — RR-F6).
  FOREACH col IN ARRAY TG_ARGV LOOP
    IF (o -> col) IS DISTINCT FROM (n -> col) THEN
      RAISE EXCEPTION 'core: %.% is immutable (CR4'' payload/identity)', TG_TABLE_NAME, col;
    END IF;
  END LOOP;
  RETURN NEW;
END $$;
```
The generic function covers **DELETE-block + immutable-payload**. Two **table-specific operational guards** (RR-F5/RR-F12) realize the bounded-update rules CR4′ requires — they are dedicated functions, not asserted-in-prose:

```sql
-- [§2.5] outbox: forward-only status (RR-F5). pending→dispatched→archived; same-state idempotent.
CREATE FUNCTION core.outbox_status_forward_only() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status <> OLD.status AND NOT (
       (OLD.status = 'pending'    AND NEW.status = 'dispatched') OR
       (OLD.status = 'dispatched' AND NEW.status = 'archived')
     ) THEN
    RAISE EXCEPTION 'core.outbox_events: illegal status transition % -> % (forward-only, CR4'')',
      OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END $$;

-- [§2.5] audit: archive flag is set-once (RR-F12). archived_at, once set, never changes/clears.
CREATE FUNCTION core.audit_archive_set_once() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.archived_at IS NOT NULL AND NEW.archived_at IS DISTINCT FROM OLD.archived_at THEN
    RAISE EXCEPTION 'core.audit_records: archived_at is set-once (CR4'')';
  END IF;
  RETURN NEW;
END $$;
```
- **`core.audit_records`** — `BEFORE UPDATE OR DELETE`: `audit_records_block_payload_mutation` (generic, protecting the full payload+identity set: `audit_id, actor_id, actor_type, organization_id, entity_type, entity_id, action, old_value, new_value, event_time, ip_address, user_agent, created_at`) **+** `audit_records_archive_set_once` (the set-once guard). Mutable: `archived_at` (set-once), `updated_at`. DELETE blocked.
- **`core.outbox_events`** — `BEFORE UPDATE OR DELETE`: `outbox_events_block_payload_mutation` (generic, protecting `{id, aggregate_id, event_name, event_version, payload_jsonb, created_at}`) **+** `outbox_events_status_forward_only` (the forward-only guard). Mutable: `status` (forward-only), `dispatched_at`, `attempts`, `updated_at`. DELETE blocked.
- Trigger names [§2.5] (Doc-6A B.4 naming family).

**Trigger attachments [§2.5]** (events are load-bearing — the OLD-deref guards attach `BEFORE UPDATE` only, so they never fire on INSERT; the payload-mutation guard covers `DELETE`):
```sql
-- core.audit_records
CREATE TRIGGER audit_records_block_payload_mutation
  BEFORE UPDATE OR DELETE ON core.audit_records FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'audit_id','actor_id','actor_type','organization_id','entity_type','entity_id',
    'action','old_value','new_value','event_time','ip_address','user_agent','created_at');
CREATE TRIGGER audit_records_archive_set_once
  BEFORE UPDATE ON core.audit_records FOR EACH ROW
  EXECUTE FUNCTION core.audit_archive_set_once();

-- core.outbox_events
CREATE TRIGGER outbox_events_block_payload_mutation
  BEFORE UPDATE OR DELETE ON core.outbox_events FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','aggregate_id','event_name','event_version','payload_jsonb','created_at');
CREATE TRIGGER outbox_events_status_forward_only
  BEFORE UPDATE ON core.outbox_events FOR EACH ROW
  EXECUTE FUNCTION core.outbox_status_forward_only();
```
(BEFORE-ROW triggers on the partitioned `audit_records` parent propagate to all partitions — PG 11+.) The `id_sequences` DELETE-block trigger is attached in §3.3 (Pass-2). RLS enable + the §2.2 platform-staff policy are applied to all 5 tables in the §5.1 migration (Pass-2).

### §4.2 Consumed-by-all obligations (CR9 — referenced, not re-authored)
The audit-write (Doc-4B §17), transactional-outbox-write (§16.2), UUIDv7 + human-ref allocation (§8 / §3.3 Pass-2), POLICY resolution (§18), and flag evaluation are **Doc-4B contracts realized as code**. Doc-6B realizes the **tables** they target; it does not re-author the write logic. Other Doc-6x reference `core.*` by **bare UUID** — no cross-schema FK (Doc-6A §5.3).

### §4.3 Orphan-scan integrity job (Doc-6A §5.5)
`core` hosts **no** cross-module FK; the periodic orphan-scan that reconciles every module's bare-UUID references (Doc-6A §5.5) is M0-adjacent infra (code/Inngest), reading each owner via its service/read-model — never a cross-schema JOIN.

---

## Review Disposition (Independent Hard Review — Pass-1)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Verified CORRECT: audit column set (Doc-2 §9), outbox column set (Doc-2 §10.1), PK exceptions (CR3), CR2 platform-owned/no-org-anchor, no cross-schema FK, no blobs, 18 `core.*` POLICY keys, RLS GUC validity, partition-key⊆PK validity. 0 BLOCKER.

| Finding | Sev | Disposition |
|---|---|---|
| **RR-F5** forward-only outbox status asserted in §3.2 but absent from the §4.1 trigger | MAJOR | **FIXED** — added dedicated `core.outbox_status_forward_only()` trigger function (§4.1); §3.2 now points to it. |
| **RR-F6** `->>` (text) jsonb comparison is lossy for `old_value`/`new_value`/`payload_jsonb` | MAJOR | **FIXED** — generic immutability function now compares with `->` (native jsonb value), jsonb-safe. |
| **RR-F2** `archived_at` attribution cited §9 ("soft archive flag" actually in §10.1); risk of reading as a coined column | MAJOR | **FIXED** — re-anchored to Doc-2 §10.1 "soft archive flag" **concept**; column **name** tagged [§2.5]; not a coinage, not an ESC. |
| **RR-F11** Prisma `status` needs `@db.Enum` | MAJOR | **REJECTED (false)** — `@db.Enum` is not a Prisma attribute; an enum-typed field auto-maps to the native PG enum under `multiSchema`. Current Prisma is correct; the suggested fix would break it. |
| **RR-F12** `archived_at` set-once claimed but not enforced | MINOR | **FIXED** — added `core.audit_archive_set_once()` trigger (§4.1). |
| **RR-F7** actor_id nullability semantics undocumented | MINOR | **FIXED** — DDL comment: nullable for System/automated actors. |
| **RR-F8** partition boundary values not provided | MINOR | **FIXED** — explicitly deferred to the Pass-2 migration (principle sound; boundaries materialized there). |
| **RR-F1** `timestamp`→`event_time` rename justification loose | NIT | **FIXED** — tagged [§2.5] reserved-word-avoidance; logical binding = Doc-2 §9 `timestamp` preserved. |
| **RR-F3** actor_type enum mapping comment imprecise | NIT | **FIXED** — comment now states label=Doc-2 type explicitly; lowercase = Doc-6A §3.4 binding. |
| **RR-F10** Prisma `@updatedAt` vs CR4′ semantics | NIT | **CLARIFIED** — note: `@updatedAt` advances only on the CR4′-permitted writes (the only writes the trigger admits); SQL trigger governs. |

**Net:** 3 MAJOR fixed (forward-only trigger, jsonb-safe comparison, archive attribution); 1 MAJOR rejected as a false Prisma claim; all MINOR/NIT applied. DDL now correct (jsonb-safe immutability + realized forward-only + set-once). 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6B Content Pass-1 (§0–§2 · §3.1 · §3.2 · §4) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the two append-only streams + posture + shared immutability function under CR4′ (column-scoped). Columns verbatim from Doc-2 §9/§10.1; PKs Doc-2-noted (CR3); physical specifics §2.5-attributed; coins nothing. Next: Pass-2 (§3.3 `id_sequences` · §3.4 `system_configuration` · §3.5 `feature_flags` · §5 seed/migration · §6 + Appendix A attestation).*
