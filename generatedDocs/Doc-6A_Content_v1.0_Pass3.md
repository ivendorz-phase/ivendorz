# Doc-6A — Database Realization Metastandard — Content v1.0 **Pass-3** (§10–§13 + Appendix A)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-3 — Independent Hard Review applied** (0 BLOCKER/MAJOR/MINOR + 1 NITPICK FIXED). Realizes §10–§13 + Appendix A of `Doc-6A_Structure_v1.0_FROZEN`. Next: Content Freeze Audit → SERIES FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | §10 Indexing/Pagination/Performance · §11 Migration Strategy & Codegen · §12 Out-of-DB Boundary · §13 Conformance & Carried Items · **Appendix A — `CHK-6-xxx` checklist** (the per-module freeze gate) |
| Authority | `Doc-2 v1.0.3`; `Doc-5A §8` (cursor pagination — consistency cross-check); `Doc-3 §12` (POLICY keys); CLAUDE.md §10 (migrations/codegen); the frozen corpus governs |
| Builds on | Pass-1 §0–§4 (esp. §2.5 attribution) + Pass-2 §5–§9 |
| Coins | **Nothing.** Index/migration/codegen specifics are §2.5 realization choices; Doc-5-consistency is a cross-check (governance §8), never conformance |

> **Scope reminder.** Pass-3 closes the metastandard: how the schema makes the frozen Doc-5 API surface persistable (§10), the migration/codegen discipline (§11), the out-of-DB fence (§12), the carried register (§13), and the **Appendix A checklist** every Doc-6B…6K passes before freeze. Generic conventions only; no module table authored.

---

## §10 — Indexing, Pagination & Performance Realization *(authors no table)*

Realizes the **Doc-5 consistency obligation** (R4; governance §8) + Doc-2 §10 per-module indexes + A-09. **This is a consistency cross-check, not conformance** — Doc-5A holds no authority over Doc-6 (§2.1).

### §10.1 Cursor-pagination indexes (consistent with `Doc-5A §8`)

Every frozen Doc-5x **list** contract is cursor-paginated (`Doc-5A §8` — `page_size` + `cursor`, deterministic order). The schema MUST carry a **deterministic composite sort-key index** matching each list's stable sort (typically `(<sort_col>, id)` so the tiebreaker `id` makes the cursor total-ordered). Convention:

```sql
-- generic convention — NOT a module index
CREATE INDEX <table>_<sortcol>_id_idx
  ON <schema>.<table> (<sort_col>, id)
  WHERE deleted_at IS NULL;   -- live rows only (§3.5)
```

A Doc-6x whose table backs a Doc-5x list MUST realize the sort-key index for that list's order; a list with no backing index is **non-conformant to the consistency obligation** → `[ESC-6-API]` if the order cannot be supported by a Doc-2 column.

### §10.2 Page-size bounds via POLICY key (never a literal)

List page-size upper bounds resolve from the `<ns>.list_page_size_max` POLICY key (§9.3; Doc-3 §12), read from `core.system_configuration` — **never a hard-coded literal** in schema, query, or migration. The DB stores no page-size constant.

### §10.3 Idempotency-dedup persistence

Mutating Doc-5x contracts that declare idempotency use the `<ns>.idempotency_dedup_window` POLICY key (§9.3). The dedup store (idempotency-key → result/within-window) is realized per the owning module's design — a dedicated dedup table or a unique idempotency-key column on the target aggregate (realization choice — §2.5), indexed for the window lookup. The window **duration** is the POLICY key, never a literal.

### §10.4 Full-text search (FTS now; Meilisearch future — §12)

Postgres-FTS reads realize a `tsvector` column + GIN index where Doc-2 models a searchable aggregate; **search follows aggregate ownership** (a module FTS-indexes only its own tables — Doc-2 / CLAUDE.md). The FTS index is a **disposable projection**, not a source of truth (§12). A future Meilisearch move (§12) does not change the authoritative tables.

### §10.5 Denormalization for matching (A-09)

Where Doc-2 assumption **A-09** permits matching/routing denormalization (the RFQ engine — M3), the denormalized columns/read-models are realized as **disposable projections** rebuilt from the owning aggregate — never a second source of truth (Invariant: read-models are disposable; CLAUDE.md §10). Indexed for the match query. The denormalization set is bound to A-09, never expanded.

### §10.6 General index discipline

Indexes are a §2.5 realization choice; each Doc-6x justifies its non-PK indexes by a query it serves (a Doc-5x read/list, an FK lookup §5.2, a dispatcher poll §7.2, a uniqueness guard §3.5, an RLS anchor §4). No speculative index; no index that would require a cross-schema column (§5.3).

---

## §11 — Migration Strategy & Codegen *(authors no table)*

Realizes R10 + CLAUDE.md §10 + Doc-2 §10.11.

### §11.1 Forward-only, versioned, per-module-owned

Migrations are **forward-only** and **versioned** (ordered, immutable once applied). Each module **owns its schema's migrations** (One Module, One Owner); a migration touches **only its own schema** — never another module's tables (no cross-module DDL). The `multiSchema` layout (R3b) keeps each module's models tagged to one namespace.

### §11.2 Non-destructive on authoritative tables (Invariant #8 — binding)

A migration MUST NOT drop or destructively rewrite an **authoritative** table/column. Schema evolution uses **expand-contract**: add the new shape, backfill, switch reads/writes, retire the old shape only when no authoritative data is lost (IDs never reused — §3.1). The **only** destructive migrations permitted target the regenerable `ai.*` cache (§6.5 / Doc-5K R7). A destructive migration on any authoritative table is **non-conformant** — flag-and-halt.

### §11.3 Seed migrations (§9)

POLICY-key seeds (§9.2/§9.3) and role/permission seeds (§9.4) are **idempotent forward-only seed migrations**, separate from structural migrations, upserting on the natural key (re-run safe — §9.5). Seed values bind to their frozen source (Doc-3 patch / Doc-2 §7); none invented.

### §11.4 Codegen → generated, gitignored registry (CLAUDE.md §10 — binding)

Prisma codegen output lands in **`generated-contracts-registry/`** — **GENERATED, gitignored, never hand-edited**. The Prisma schema (the hand-authored source) realizes the per-module models (Doc-6B…6K) under one namespace each (R3b). Generated artifacts are reproducible from the schema + migrations; they are not authoritative and not reviewed as source.

### §11.5 Migration/RLS tests are Doc-8's gate (by pointer)

The CI obligation — migration apply/rollback-forward checks, and the RLS **positive / negative / cross-tenant byte-equivalence** tests (§4.4) — is **Doc-8's** program, not realized here. Doc-6x MUST make those tests **satisfiable** (the schema exposes no leaking view/column; every tenant-owned table has its RLS policy), but authoring the tests is out of scope (§12 fence / Doc-8).

---

## §12 — Out-of-DB Boundary *(authors no table)*

Realizes R12 + Doc-2 §9 + CLAUDE.md §2 (Storage / Search / Realtime).

### §12.1 File blobs → Supabase Storage; DB holds refs only (Doc-2 §9 — binding)

Document/file **binary** lives in Supabase Storage. The DB stores a **reference only** — a `file_ref` / storage-path / version-id column (named for the artifact, §3.4) — **never a blob column** (`bytea`/large-object). Document versions are referenced **by ID** (Doc-2 §9; audit §8.3). A blob column on any Doc-6x table is **non-conformant** — flag-and-halt.

### §12.2 External search index → projection, not a table

Postgres FTS now (§10.4); Meilisearch (or equivalent) is a **future external index** — a **disposable projection** rebuilt from the owning aggregate, **not** an authoritative Doc-6 table. The authoritative data stays in the owning schema; the external index is derived. Moving from FTS to Meilisearch changes no authoritative table.

### §12.3 Realtime → transport, not a table

Supabase Realtime is a **delivery transport** over changes to existing tables (e.g. via the outbox §7 / change feeds), **not** a Doc-6 table. No "realtime" authoritative table is realized.

### §12.4 The fence (binding)

No out-of-DB artifact (blob, external search index, realtime channel) is an authoritative Doc-6 table. **Flag-and-halt if one is proposed as such.**

---

## §13 — Conformance & Carried Items

### §13.1 Doc-6A self-statement

Doc-6A authors **no module table** and coins **no** domain element (table/column/entity/relationship/state/event/audit-action/POLICY-key/index-name-as-Doc-2-fact). Every convention binds a Doc-2 pointer or is a §2.5-attributed realization choice. Doc-6A defines the **per-module freeze gate** (Appendix A) that Doc-6B…6K pass.

### §13.2 Carried register (resolved only via named channels)

| ID | Item | Channel | Per-module freeze gate? |
|---|---|---|---|
| `DR-6-CORE` | M0 owns `outbox_events`/`audit_records`/`id_sequences`/`system_configuration` | Realized in Doc-6B; others reference by pointer | No |
| `DR-6-API` | Doc-5 surface persistability | Consistency cross-check (§10); `[ESC-6-API]` on a gap | Per-module cross-check |
| `DR-6-STATE` | State machines (Doc-4M / Doc-2 §5) as state columns + enforcement | By pointer; §5.4/§6 | No |
| `[ESC-6-SCHEMA]` | A physical need with no Doc-2 §10/§10.11 source | Additive Doc-2 patch (human-approved) | Possible |
| `[ESC-6-POLICY]` | Unregistered POLICY key (incl. open **M1 `identity`** namespace — §9.2) | Additive Doc-3 §12.2 patch | Possible (Doc-6C cross-check) |
| `[ESC-6-API]` | A frozen Doc-5x surface not persistable by any Doc-2 table | Board → additive Doc-2 patch; never local (governance §8) | Possible |

### §13.3 Per-module freeze obligation

Each Doc-6B…6K, before freeze: (1) **passes Appendix A** (`CHK-6-xxx`, below); (2) **clears every `[ESC-6-*]`** it raises via the named additive channel (human-approved) — never locally; (3) updates `CORPUS_INDEX.md` + `00_AUTHORITY_MAP.md` + the roadmap on freeze.

---

## Appendix A — Doc-6 DB Realization Conformance Checklist (`CHK-6-xxx`) — the per-module freeze gate

Every Doc-6B…6K attests to each check (PASS / N/A-with-reason) before freeze. The DB-program analog of Doc-5A Appendix A. Bands and check IDs:

### Band A — Standard-column (R5 / §3)
- **CHK-6-001** every table has `id UUIDv7` PK from the M0 ID service (§3.1).
- **CHK-6-002** `human_ref` present **only** where Doc-2 §0.1 mandates; format/year-scoping per §3.2; from `core.id_sequences`.
- **CHK-6-003** timestamp tuple (`created_at`,`updated_at`) on every table; actor stamps where Doc-2 declares (§3.3).
- **CHK-6-004** soft-delete tuple (`deleted_at`,`deleted_by`,`delete_reason`) on every soft-deletable table; **no `is_deleted` boolean** (§3.3).
- **CHK-6-005** every unique constraint on a soft-deletable table is a partial unique index `WHERE deleted_at IS NULL` (§3.5).

### Band B — Schema isolation (R3 / §5.3)
- **CHK-6-010** physical schema = canonical namespace; one Prisma namespace per module (R3a/R3b).
- **CHK-6-011** **no foreign key crosses a schema boundary** (§5.3).
- **CHK-6-012** cross-module references are bare UUID columns named for the entity, service-validated, orphan-scan-reconciled (§5.3/§5.5).
- **CHK-6-013** no cross-schema JOIN or cross-schema RLS traversal (§4.3/§5.3).

### Band C — Tenancy / RLS (R8 / §4)
- **CHK-6-020** RLS enabled on every tenant-owned table, anchored on `organization_id` (server-validated active org) (§4.2).
- **CHK-6-021** vendor/cross-party access anchors on materialized grantee rows / explicit party columns; refresh-on-revocation (§4.3).
- **CHK-6-022** non-disclosure byte-equivalence; `buyer_vendor_statuses`/`link_suggestions` never exposed in any view/log/error (§4.4).
- **CHK-6-023** authorization is app-layer; RLS carries no business authz logic as the primary gate (§4.5).

### Band D — Immutability (R7 / §6)
- **CHK-6-030** no hard-DELETE on a soft-deletable/authoritative table; soft-delete propagation intra-schema only (§6.2).
- **CHK-6-031** versioned tables immutable once bound (trigger/constraint); new row per revision (§6.3).
- **CHK-6-032** history/snapshot tables INSERT-only; score/tier writes under the System actor (§6.4).
- **CHK-6-033** the **only** hard-delete is the regenerable `ai.*` TTL cache (Doc-5K R7); enumerated, no other schema (§6.5).

### Band E — Outbox / Audit (R6 / §7 / §8)
- **CHK-6-040** state-transition emitters write business row + `core.outbox_events` row in **one transaction** (§7.1).
- **CHK-6-041** no event coined; event set/flow bound to Doc-2 §8 / Doc-4J / Doc-4L; consumer effects in the consumer's own schema (§7.3).
- **CHK-6-042** `core.audit_records` append-only, immutable; redaction-as-new-event; column list per Doc-2 §9 (§8.1/§8.2).
- **CHK-6-043** audited-action coverage per Doc-2 §9; no audit action coined; gaps `[ESC-6-*]` (§8.4).

### Band F — Multi-currency (R9 / §3.6)
- **CHK-6-050** every monetary amount is `NUMERIC` + explicit adjacent currency column, default BDT; no bare-amount money column (§3.6).

### Band G — POLICY / seed (R11 / §9)
- **CHK-6-060** `core.system_configuration` realized; the registered keys (v1.0–v1.8) seeded; no key coined, no default value invented (§9.1/§9.3).
- **CHK-6-061** page-size bounds + idempotency windows resolve from POLICY keys, never literals (§10.2/§10.3).
- **CHK-6-062** role/permission seeds bound to Doc-2 §7 / A-08; idempotent forward-only seed migration (§9.4/§11.3).

### Band H — Doc-5 consistency (R4 / §10) — *cross-check, not conformance (governance §8)*
- **CHK-6-070** every frozen Doc-5x read/list/command is persistable by this schema (§10.1).
- **CHK-6-071** each Doc-5x list has a deterministic composite sort-key index (§10.1).
- **CHK-6-072** idempotency-dedup persisted where a Doc-5x contract declares it (§10.3).
- **CHK-6-073** any non-persistable Doc-5x surface raised as `[ESC-6-API]` (never resolved locally) (§10.1/§13.2).

### Band I — Realize-never-redecide (R2 / §0.2)
- **CHK-6-080** no table/column/relationship/state/event/audit-action/POLICY-key coined; every element traces to a Doc-2 pointer.
- **CHK-6-081** every physical specific not stated by Doc-2 is attributed as a §2.5 realization choice (not implied as Doc-2 fact).
- **CHK-6-082** no out-of-DB artifact (blob/external index/realtime) realized as an authoritative table (§12).
- **CHK-6-083** all `[ESC-6-*]` raised by the module are registered by pointer and routed to a named additive channel (§13.2).

*(Check IDs are stable identifiers for the freeze gate; new checks append, never renumber — consistent with the stable-ID + reserved-gap allocation strategy of Doc-5A Appendix A (`Doc-5A_Content_v1.0_Pass11 §A.0`).)*

---

*End of Doc-6A Content Pass-3 (§10–§13 + Appendix A). Completes the Doc-6A metastandard content (Pass-1 §0–§4 · Pass-2 §5–§9 · Pass-3 §10–§13 + App A). Realizes the frozen structure; coins nothing; Doc-5 is a consistency cross-check (governance §8), never conformance; physical specifics attributed per §2.5. Generic conventions only — no module table authored. Next: Content Hard Review (full §0–§13 + App A) → Content Freeze Audit → `Doc-6A_SERIES_FROZEN` → Doc-6B (M0 `core`).*
