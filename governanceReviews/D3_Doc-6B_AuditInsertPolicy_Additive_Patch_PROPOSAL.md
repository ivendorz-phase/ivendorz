# Doc-6B — Audit-Records Append-RLS Additive Patch v1.0.1 (CR4′-adjacent append-only INSERT-policy realization for `core.audit_records`)

> **Reading guide.** The **normative** patch is §§"The gap"→"Disposition" (the policy SQL, the binding-condition
> conformance, and the **Deployment Constraint**). The **implementation notes** (RETURNING handling, executor
> surface, facade exposure, System-GUC runbook, D5 test matrix) are **Appendix A — non-normative**, for the D4/D5
> work. The durable *why* (why INSERT is broader than SELECT) lives in **ADR-021** (proposed), not restated here.

| Field | Value |
|---|---|
| Status | **DRAFT — PROPOSED ADDITIVE PATCH; AWAITS HUMAN/BOARD APPROVAL (per CLAUDE.md §7 ranks 0–1 immutable to skills; §8 architecture-adjacent ⇒ human sign-off). NOT folded into the frozen corpus. The frozen `Doc-6B_Structure_v1.0_FROZEN.md` / `Doc-6B_Content_v1.0_Pass1…2.md` / `Doc-4B_Content_v1.0_PassB.md` are unedited; on approval this patch is carried alongside them and folded into `Doc-6B_SERIES_FROZEN`.** |
| Date | 2026-06-30 |
| Raised by | Board Sprint D-series (ESC-W2-AUDIT-RLS) — realizes Board ruling §7 = **R-b** (2026-06-30). Flag-and-halt origin: realization seam caught between the frozen Doc-6B §2.2 platform-staff *read* backstop and the realized tenant-context audit-append path. Disposition rule: **do not resolve locally** (CLAUDE.md §11). |
| Decision of record | **ADR-021 (PROPOSED)** — *Audit-Records RLS Asymmetry (Write-Admission ≠ Read-Disclosure)*. This patch is the **physical realization** of that ADR for `core.audit_records`; the rationale is owned there, referenced here by pointer. |
| Companion | `D2_Doc-4B_AuditAppendRLS_Additive_Patch_PROPOSAL.md` (the Doc-4B §B10/§17.1 posture note). D2 + D3 are a **single linked action**; D3 + D4 are a **single linked deploy unit** (see **Deployment Constraint**). |
| Type | **Realization-model refinement** (physical *how*; not architecture-affecting — no module/ownership/governance/state/event/POLICY-key change; RLS = defense-in-depth backstop per CLAUDE.md §2 / Doc-6A §4.5, not a new authorization rule). The added policy realizes the **write-integrity** of an already-frozen obligation (Doc-4B §B10 audit-append is atomic & runs in the caller's tx; that atomicity resolves to Doc-4A §17.1 "Audit Is Mandatory for Mutations"); it coins no permission, no POLICY key, no ownership, and does **not** alter the read posture. *(Classification deferred to the Board; if recording a tenant-append RLS posture is judged to touch the authorization model, it routes as architecture-affecting — Raise ≠ Accept.)* |
| Patches | `Doc-6B_Structure_v1.0_FROZEN.md` §2.2 (RLS posture) and its §4.1/§5.1 application — adds one **`FOR INSERT`** RLS policy to `core.audit_records`, `core.audit_records_default`, and the per-partition runbook (Doc-6B §3.1). Realizes the write-side of `Doc-4B_Content_v1.0_PassB.md` §B10 (`core.append_audit_record.v1`). The CR4′ immutability policy set (Doc-6B §2.3/§4.1) and the CR2 read posture (§2.2) are **untouched**. Doc-4B is **not** patched (its RLS-write posture text does not exist — RLS lives in Doc-6B; Doc-4B §B10 is referenced by pointer only). |
| Authority | Board ruling **ESC-W2-AUDIT-RLS §7 = R-b** + **ADR-021 (proposed)** (the *what* + the *why*); Doc-6B §2.2 CR2 platform-staff backstop + `app.is_platform_staff` GUC mechanism (read posture); Doc-6B §2.3/§4.1 CR4′ immutability (untouched); Doc-4B PassB §B10 + §B11 O-7 (the atomic in-tx audit-append obligation being write-integrity-bound, resolving to **Doc-4A §17.1**); frozen R-b `WITH CHECK` idiom realized in `identity` (`memberships_insert`, `roles_write`, `buyer_profiles_tenant`). Governance: CLAUDE.md §7, §8, §11, §13. |

---

## The gap

The frozen corpus mandates two things that, as currently realized, **cannot both hold for a tenant-context audit write**:

1. **Doc-4B §B10** (`core.append_audit_record.v1`): the audit-append is invoked **"within [the caller's mutating
   contract's] transaction"** and is **atomic with the caller's mutation** (§B11 O-7) — "audit failure fails the
   business write." That atomicity resolves to **Doc-4A §17.1**. A tenant-context mutation (server guard sets
   `app.is_platform_staff = false`, per `with-active-org.ts`) MUST be able to append its own audit row in-tx.
2. **Doc-6B §2.2** (CR2): `core.audit_records` carries a **platform-staff read backstop** — the realized parent and
   DEFAULT-partition policies are `audit_records_platform_staff` / `audit_records_default_platform_staff`, both
   **`USING (...)`-only, `FOR ALL`** (`current_setting('app.is_platform_staff', true)::boolean IS TRUE`).

The seam is a PostgreSQL-semantics interaction the frozen text did not adjudicate: for a `FOR ALL` policy with **no**
`WITH CHECK`, Postgres copies the `USING` expression into the INSERT `WITH CHECK` position (verified PG 15–18). So the
realized `USING`-only policy **implicitly gates INSERT to `is_platform_staff IS TRUE` only** → a tenant-context append
(`is_platform_staff = false`) is **rejected at INSERT**, and the mandated atomic in-tx audit write (§B10) is unwritable
from tenant code. Doc-6B §2.2 frames its policy explicitly as a **read/disclosure backstop** ("platform-staff
backstop"; "app-layer authz is primary"; `organization_id` "never an RLS predicate") — it does **not** rule on a
write-side INSERT policy. That adjudication is the Board's (**ESC-W2-AUDIT-RLS §7 = R-b**), with the durable rationale
recorded in **ADR-021** (why a platform-owned, write-once, mandatory-on-mutation stream has **broad write-admission**
but **narrow read-disclosure**). This patch realizes it additively.

*(A second PG fact — `INSERT … RETURNING` is forced through the SELECT policy — also bears on the realization; it is a
D4 obligation, covered in **Appendix A**, not a property of the policy itself.)*

## The additive realization (the policy) — NORMATIVE

Per R-b / ADR-021: add **one NEW permissive `FOR INSERT` RLS policy** whose `WITH CHECK` binds the inserted row to the
server-set request context. The existing `audit_records_platform_staff` / `audit_records_default_platform_staff`
policies stay **byte-for-byte untouched**. Because PostgreSQL OR-combines permissive policies of the same command
(verified PG 15–18), the **effective INSERT admission** becomes `(staff) OR (context-bound tenant)` — monotonic
widening, never narrowing; SELECT/UPDATE/DELETE are unaffected because the new policy is `FOR INSERT` only.

This is the **same frozen R-b idiom already realized in `identity`** (`memberships_insert` is
`FOR INSERT WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)`);
this patch coins nothing beyond applying that idiom to the audit stream, with an added `actor_id`/`actor_type`
write-integrity binding to prevent cross-actor audit forgery.

> **Enum-label binding (load-bearing).** The `actor_type` leg pins the frozen `core.ActorType` label `'user'` —
> **lowercase**, exactly as defined in `core_init/migration.sql` (`CREATE TYPE "core"."ActorType" AS ENUM
> ('user','admin','system','ai_agent')`), mirrored by `schema.prisma` and the contract type `CoreActorType =
> "user" | "admin" | "system" | "ai_agent"`. There is no `'User'` label; `'User'::"core"."ActorType"` would raise
> `22P02` at migration time and reject every tenant append. The literal below is therefore `'user'`, not `'User'`.

### Parent table — `core.audit_records`

```sql
CREATE POLICY "audit_records_context_append" ON "core"."audit_records" FOR INSERT
  WITH CHECK (
    -- Tenant-user leg: row is bound to the server-set request context (write-integrity,
    -- not read-tenancy — CR2 read posture unchanged). Fail-closed: unset GUC -> NULL -> false.
    (
      "organization_id" = current_setting('app.active_org', true)::uuid
      AND "actor_id"     = current_setting('app.user_id', true)::uuid
      AND "actor_type"   = 'user'::"core"."ActorType"
    )
    -- System / drainer / admin / bootstrap leg (System actor, no active-org context).
    OR current_setting('app.is_platform_staff', true)::boolean IS TRUE
  );
```

### DEFAULT partition — `core.audit_records_default`

RLS policies **do not inherit** from the partitioned parent to partitions (PG; load-bearing comment already in
`20260627183528_core_init/migration.sql` L124–129). The new INSERT policy MUST be applied to the DEFAULT partition
explicitly, alongside the existing `…_default_platform_staff` policy (which remains untouched):

```sql
CREATE POLICY "audit_records_default_context_append" ON "core"."audit_records_default" FOR INSERT
  WITH CHECK (
    (
      "organization_id" = current_setting('app.active_org', true)::uuid
      AND "actor_id"     = current_setting('app.user_id', true)::uuid
      AND "actor_type"   = 'user'::"core"."ActorType"
    )
    OR current_setting('app.is_platform_staff', true)::boolean IS TRUE
  );
```

### Runbook rule — every future monthly partition (binding)

The frozen partition-rotation runbook (Doc-6B §3.1; realized comment `20260627183528_core_init/migration.sql`
L124–129) already mandates that every operationally-provisioned monthly partition run `ENABLE ROW LEVEL SECURITY` +
create its own `…_platform_staff` policy, because RLS does not propagate to partitions. This patch **extends that same
runbook rule additively**: every future monthly partition `core.audit_records_YYYY_MM` MUST also receive the
context-append INSERT policy. A partition that has the platform-staff policy but **not** the context-append policy is a
direct-to-partition append-bypass for tenant code (the tenant append silently fails at that partition's implicit INSERT
gate). Per-partition template:

```sql
-- For each operationally-provisioned monthly partition core.audit_records_YYYY_MM:
ALTER TABLE "core"."audit_records_YYYY_MM" ENABLE ROW LEVEL SECURITY;            -- (existing runbook step)
CREATE POLICY "audit_records_YYYY_MM_platform_staff"  ON "core"."audit_records_YYYY_MM"  -- (existing, untouched)
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "audit_records_YYYY_MM_context_append"  ON "core"."audit_records_YYYY_MM" FOR INSERT  -- (NEW)
  WITH CHECK (
    (
      "organization_id" = current_setting('app.active_org', true)::uuid
      AND "actor_id"     = current_setting('app.user_id', true)::uuid
      AND "actor_type"   = 'user'::"core"."ActorType"
    )
    OR current_setting('app.is_platform_staff', true)::boolean IS TRUE
  );
```

## Binding-condition conformance (Board ruling §7, conditions 1–7)

1. **Read backstop unchanged** — SELECT stays staff-only; the new policy is `FOR INSERT`, so it adds no `USING`/SELECT leg. ✓
2. **Append-only INSERT context-bound** — tenant leg binds `organization_id`+`actor_id`+`actor_type='user'` (lowercase frozen label) to the GUCs; staff leg admits System/drainer/admin/bootstrap. ✓
3. **Immutability untouched** — no RLS allow for UPDATE/DELETE; the CR4′ triggers (`audit_records_block_payload_mutation`, `audit_records_archive_set_once`) remain the sole UPDATE/DELETE guard. ✓
4. **Fail-closed** — `current_setting(..., true)` returns NULL when the GUC is unset; `NULL = x` → NULL → not-true, and `NULL::boolean IS TRUE` → false. No GUC ⇒ append rejected. The tenant leg's NULL-equality also fail-closes a tenant attempt to forge a NULL-`organization_id`/NULL-`actor_id` System-looking row. ✓
5. **Per-partition application** — parent + DEFAULT + every future monthly partition (runbook rule above). ✓
6. **No privilege elevation / no SECURITY DEFINER** — rejects R-a (no GUC flip) and R-c (no definer function); no tenant-table RLS weakened; coins nothing beyond the INSERT policy. ✓
7. **Atomicity preserved** — append stays the in-tx insert on the caller's executor (Doc-4B §B10, resolving to Doc-4A §17.1); no new connection/role/out-of-band write introduced. ✓ — **subject to the Deployment Constraint + Appendix A (RETURNING + executor surface).**

## Deployment Constraint (normative — SHALL)

> **The D3 migration SHALL NOT be deployed** to any environment that carries (or will carry) tenant traffic
> **unless the D4 implementation has already eliminated `INSERT … RETURNING`** from the audit-append path — i.e.
> `db.auditRecord.create` has been replaced by an **app-generated-UUIDv7, non-`RETURNING`** insert on the caller's
> executor (Appendix A.2).
>
> **Rationale (normative).** Until `RETURNING` is removed, a tenant-context append — though it passes the new INSERT
> `WITH CHECK` — is forced through the **staff-only SELECT** policy at the `RETURNING` step and **aborts with SQLSTATE
> 42501**, rolling back the caller's business transaction (verified PG 15–18). Deploying the policy without the D4
> change does **not** unblock tenant audit and can **mask** the defect behind a green migration.
>
> **Sequencing (SHALL).** D4's `RETURNING` elimination lands **before, or atomically with,** the D3 migration; D3 + D4
> are a **single linked deploy unit**. The append **SHALL NOT** be unblocked by **widening the staff-only SELECT
> surface** or by **privilege elevation / `SECURITY DEFINER`** — both breach R-b and ADR-021 → **Flag-and-Halt**
> (CLAUDE.md §11), escalate for fresh human/Board approval as architecture-affecting.

## Blast radius

- **Doc-6B §2.2** — adds a write-side INSERT policy to the audit table's RLS realization. The CR2 **read** posture
  (platform-staff scope; `organization_id` never an RLS *read* predicate) is **unchanged**; `organization_id` appears
  here only in an INSERT `WITH CHECK` as a **write-integrity** binding (see "What is unchanged"). No change to the
  other four `core` tables. *PG-semantics note:* the pre-existing `audit_records_platform_staff` (FOR ALL, `USING`-only)
  already contributes an *implicit* INSERT `WITH CHECK` equal to its `USING`; so the OR-combined **effective INSERT
  check** is `(tenant-context, new) OR (staff, new) OR (staff, implicit existing)` — the duplicated staff leg is
  benign and purely widening.
- **Doc-6B §5.1** — migration step (7) gains an **additive** sub-step: after the platform-staff policy on
  `audit_records` + `audit_records_default`, create the two `…_context_append` INSERT policies. Ordering otherwise unchanged.
- **Doc-6B §3.1 partition runbook** — gains the additive per-partition `…_context_append` policy step (above).
- **Doc-4B §B10** — **not edited, not reopened.** The §B10 obligation (atomic, in-caller's-tx audit-append; resolving
  to Doc-4A §17.1) is the *what* this patch makes physically achievable from tenant context; referenced by pointer.
  Doc-4B carries no RLS-write-posture text, so there is nothing in Doc-4B to patch.
- **Realized migration** — a new forward-only migration adds the policies to the existing `audit_records` /
  `audit_records_default` (and the runbook updates the partition-rotation script). No table/column/trigger/index change.

## What is unchanged

- **CR2 read posture (Doc-6B §2.2).** Audit RLS read scope stays **platform-staff** only. `audit_records.organization_id`
  remains an **audit-context reference column, never a read-tenancy anchor**. Its appearance in the new INSERT
  `WITH CHECK` is a **write-integrity** binding — it constrains *which row a tenant may forge*, not *which rows a tenant
  may read*. A tenant still cannot SELECT any audit row (own or others'). **CR2 is therefore not violated.**
- **CR4′ immutability (Doc-6B §2.3/§4.1).** No RLS allow for UPDATE or DELETE; payload/identity columns immutable;
  `archived_at` set-once; redaction = new audit row. The triggers remain the sole UPDATE/DELETE guard. Untouched.
- **CR9 / ownership.** Audit-write remains a Doc-4B §17 obligation realized as code, owned by M0; no cross-module
  access, no FK, no `contracts/`-boundary change. One Module, One Owner intact.
- **Governance signals, POLICY keys, events, state machines, permissions, templates.** None added or altered. Audit is
  M0-owned but is **not** one of the five firewalled governance signals — the Red-Flag "change a governance signal"
  does not trip.
- **The platform-staff policies** `audit_records_platform_staff` / `audit_records_default_platform_staff` (and
  per-partition equivalents) — **byte-for-byte unchanged.**

## Disposition requested

The presiding authority (Board, CLAUDE.md §7) is asked to **approve or reject** this additive patch, which realizes
ruling ESC-W2-AUDIT-RLS §7 = R-b and the proposed **ADR-021**. On approval: the patch is carried alongside the unedited
frozen `Doc-6B_Structure_v1.0_FROZEN.md` and folded into `Doc-6B_SERIES_FROZEN`; D4 realizes the policies + the
non-returning append + the `appendAuditRecord` facade in a forward-only migration and service change under the
**Deployment Constraint** + the Appendix-A obligations; the partition-rotation runbook is amended. **Owning-doc
filing:** this is a **Doc-6B** patch — the RLS posture lives in Doc-6B (the physical schema doc), and Doc-4B carries no
RLS-write text and is not edited. File as **`Doc-6B_Structure_Additive_Patch_v1.0.1.md`** (the next free decimal on
Doc-6B's existing additive-patch series, whose `v1.0` is the CR4′ patch — **confirm against `00_AUTHORITY_MAP.md`
before folding**). The Doc-4B `v1.0.1` filename is **not** used (it would collide with the existing
`Doc-4B_Freeze_Patch_v1.0.1.md`, and Doc-4B is the wrong owning doc). **Do not resolve locally.**

---

## Appendix A — Implementation notes (D4 / D5) — non-normative **except the MUST/SHALL clauses**, which bind D4

The new INSERT policy is **necessary but not sufficient** for a tenant-context append, because of the
`INSERT … RETURNING` ↔ SELECT-policy interaction. These notes bind the D4 realization and the D5 proof; they are
recorded here (out of the normative body) for readability, **not** softened — the **Deployment Constraint** above makes
the RETURNING elimination a SHALL.

### A.1 — The RETURNING problem (verified PG 15–18)

`db.auditRecord.create(...)` compiles to `INSERT … RETURNING "audit_id"`. `RETURNING` forces the just-inserted row
through the relation's **SELECT** policies; if it fails them, PG **throws `42501`** (rows are never silently dropped).
Under a tenant context, the row passes the new INSERT `WITH CHECK` but **fails the staff-only SELECT** posture at
`RETURNING` → the whole INSERT aborts → the caller's business transaction rolls back. **The INSERT policy alone does
NOT unblock the tenant append.**

### A.2 — D4 obligation: remove the RETURNING/SELECT coupling **without** broadening SELECT (required to preserve CR2)

Because CR2 / binding condition (1) keeps SELECT staff-only, the read posture must **not** be widened. The conforming
remedy is to **eliminate the read-back**, not to add a tenant SELECT policy:

- M0 already generates the `audit_id` (UUIDv7) **application-side** before the insert (`audit-record.service.ts`:
  `const auditId = uuidv7()`), so the DB-returned key is not needed. D4 SHOULD replace the `db.auditRecord.create`
  call with a **non-returning** insert on the caller's executor — e.g. ``db.$executeRaw`INSERT INTO
  "core"."audit_records" (...) VALUES (...)` `` — which emits **no `RETURNING`**, never consults the SELECT policy, and
  keeps audit **write-only to tenants** (CR2 read posture fully preserved). The app-generated `audit_id` is returned
  from the service unchanged.
- **Do NOT** adopt the "add a tenant SELECT policy" remedy: it would broaden the read posture and **violate CR2** /
  condition (1) → Flag-and-Halt. Flagged so D4 does not reach for the smallest-diff option that breaks the read firewall.

### A.3 — Executor-surface seam (must reconcile to preserve atomicity, Board condition 7)

The `CoreServiceExecutor` contract type exposes only `$queryRawUnsafe`; the concrete service already casts
`CoreServiceExecutor → DbExecutor` to reach `.auditRecord.create`. The non-returning insert MUST run on the **same
caller-supplied executor** (the Prisma interactive-tx `tx` handed in by `with-active-org.ts`, which does carry
`$executeRaw`). D4 may either (a) widen the `CoreServiceExecutor` contract surface to expose a non-returning exec
method, or (b) retain the existing `as DbExecutor` cast and call `db.$executeRaw`. D4 MUST NOT reach for the shared
`prisma` client (breaks in-tx atomicity), and MUST NOT keep `create()` (re-introduces the 42501 abort). Keep passing
`?? null` for the nullable `actor_id` / `organization_id`.

### A.4 — D4 obligation: expose the `appendAuditRecord` concrete facade (mirror `allocateHumanReference`)

`appendAuditRecord` is currently declared in `core/contracts/services.ts` **only as a type** (no `export const`). D4
MUST add the concrete facade following the same-module contracts→infrastructure binding pattern used for
`allocateHumanReference`: `import { appendAuditRecord as appendAuditRecordImpl } from "../infrastructure";` then
`export const appendAuditRecord: AppendAuditRecord = appendAuditRecordImpl;`. Cross-module surface stays
`contracts/`-only; this coins nothing.

### A.5 — D4 / runbook obligation: every System/background append path sets the staff GUC in-tx

The staff leg admits a System/drainer/admin/bootstrap append **only** when the executing transaction has actually `SET
app.is_platform_staff = 'true'` (transaction-local). Known System paths already do this (outbox drainer; identity
provisioning). Any **new** System/Inngest/background path that calls `appendAuditRecord` MUST set
`app.is_platform_staff = 'true'` within the same transaction as the append, or it hits the fail-closed leg (NULL →
false), the tenant leg also fails (no `active_org`/`user_id`), and the System append is rejected — rolling back its
business write. Binding runbook obligation, not an implicit property of the staff leg.

### A.6 — D5 obligation: the conformance-test matrix

D5 MUST add tests proving, **per parent AND DEFAULT partition**:
- (a) tenant-context append (`is_platform_staff=false`, matching `app.active_org`/`app.user_id`, `actor_type='user'`)
  **succeeds** and is atomic with the caller's tx;
- (b) tenant-context append with a **mismatched** `organization_id`, `actor_id`, or `actor_type` (forgery attempt) is
  **rejected** by the INSERT `WITH CHECK`;
- (c) staff/System context append (`is_platform_staff=true`, including a legitimate `actor_id=NULL`/`organization_id=NULL`
  System row, `actor_type='system'`) **succeeds**;
- (d) unset GUC ⇒ **rejected** (fail-closed);
- (e) under tenant context, an INSERT with `organization_id=NULL` or `actor_id=NULL` (attempt to smuggle a
  System-looking row) is **rejected** (tenant leg fails NULL-equality, staff leg false);
- (f) tenant context **cannot SELECT** any audit row (read posture intact);
- (g) the append path emits **no `RETURNING`** (regression guard against re-introducing the 42501 abort) — asserted via
  a tenant-context integration test that the append succeeds, not merely a unit stub;
- (h) UPDATE/DELETE remain trigger-blocked;
- (i) **migration-apply smoke test** — the new `CREATE POLICY` DDL applies cleanly against the realized `core.ActorType`
  enum (catches any enum-label-case drift, e.g. a re-introduced `'User'`, before freeze).

---

*Doc-6B Audit-Records Append-RLS Additive Patch v1.0.1 — realizes Board ruling ESC-W2-AUDIT-RLS §7 = R-b and the
proposed **ADR-021** (Audit-Records RLS Asymmetry): adds a permissive `FOR INSERT` context-bound `WITH CHECK` policy to
`core.audit_records` (+ default partition + every monthly partition), leaving the platform-staff read backstop, the
CR4′ immutability triggers, and the CR2 read posture untouched. The `actor_type` leg pins the frozen lowercase
`core.ActorType` label `'user'` (not `'User'`). `organization_id` in the `WITH CHECK` is a write-integrity binding, not
a read-tenancy anchor — CR2 not violated. No architecture/ownership/boundary/permission/POLICY-key/event/state/template
change. The frozen `Doc-6B_Structure_v1.0_FROZEN.md` and `Doc-4B_Content_v1.0_PassB.md` are not edited in place; §B10 is
referenced by pointer, not reopened. **Deployment Constraint (normative):** the D3 migration ships only once D4 has
eliminated `INSERT … RETURNING` (single linked deploy unit) — never by broadening SELECT (→ Flag-and-Halt). Status:
**DRAFT — AWAITS HUMAN/BOARD APPROVAL.***
