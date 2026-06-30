# FLAG-AND-HALT — `ESC-W2-AUDIT-RLS` v1.0

| Field | Value |
|---|---|
| **Type** | FLAG-AND-HALT escalation (Raise ≠ Accept — CLAUDE.md §13) |
| **Raised by** | Wave 2 execution, M1 buyer-profile WRITE slice (`upsert_buyer_profile`) |
| **Date** | 2026-06-30 |
| **Severity** | **BLOCKER** — gates **every tenant-scoped business write** that is Audit-Required (M1 `upsert_buyer_profile` and all `update_*`/`create_*` tenant writes; later M2–M9 tenant writes). Platform-wide, not M1-local. |
| **Status** | **OPEN — Board ruled R-b (D1, 2026-06-30); not yet RESOLVED.** See §7. Realization (additive Doc-4B/Doc-6B patches) is **architecture-affecting → awaits HUMAN approval** (§8) before any M0 work; ESC reaches RESOLVED at sprint **D6** after the conformance test. No privilege-elevation mechanism introduced; no required audit omitted. |
| **Authority** | CLAUDE.md §7 (Authority Order), §8 (architecture-affecting → human approval), §11 (Flag-and-Halt), §13 (Raise ≠ Accept); Doc-4B §A10 (audit atomicity); Doc-6B §2.2/§5.1 (audit RLS / platform-staff backstop); Doc-6C §2.1 (tenant GUC context) |
| **Disposition rule** | Do **not** resolve locally. The `upsert_buyer_profile` slice and all Audit-Required tenant writes **park** until ruled. The kit `form-field`, the account read leg, and non-write FE are unaffected but have nothing to drive until the write lands. |

---

## 1. The conflict (cite both sources)

**Source A — the audit obligation (a tenant write MUST append an audit record, atomically).**
- `upsert_buyer_profile` is **Audit-Required: yes** (Doc-4C §C10).
- `core.append_audit_record.v1` is realized to run **inside the caller's transaction** so the audit row is **atomic with the business write** (Doc-4B §A10 / §17.1). In code: `src/modules/core/infrastructure/data/audit-record.service.ts` runs `db.auditRecord.create(...)` on the supplied transaction executor.

**Source B — the audit table RLS permits writes only under platform-staff.**
`core.audit_records` (and its partition default) carries a **single platform-staff `USING` policy** with no separate INSERT policy and no `WITH CHECK` — so, per Postgres, **INSERT requires `app.is_platform_staff IS TRUE`**:

> `prisma/migrations/20260627183528_core_init/migration.sql`
> L236–237: `CREATE POLICY "audit_records_platform_staff" ON "core"."audit_records" USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);`
> L130–132: the same policy on `core"."audit_records_default"` (partitions do not inherit parent RLS).
> (Realizes Doc-6B §2.2/§5.1 — the platform-staff RLS backstop.)

**The collision.** A tenant business write runs under the **server-set tenant context** — `withActiveOrgContext` sets `app.is_platform_staff = false` (Doc-6C §2.1; `src/server/context/with-active-org.ts`). The atomic audit append (Source A) therefore executes with `is_platform_staff = false` and is **denied by the audit RLS** (Source B). A tenant write **cannot** satisfy its Audit-Required obligation through the frozen append path.

**Why this is a genuine gap, not a local choice.** Resolving it requires choosing **how a tenant-scoped write satisfies a platform-owned audit obligation** — privilege elevation, a new INSERT policy, a `SECURITY DEFINER` surface, or async decoupling. Each is **architecture-affecting** (touches RLS / privilege / the audit write path) and so must be **escalated, never resolved locally** (CLAUDE.md §8/§11). Inventing an elevation mechanism inside a feature slice, or silently omitting a required audit, are both prohibited (owner instruction).

## 2. Scope — why this is platform-wide

- **No business command audits today.** The lazy-provisioning command (`provision-identity.command.ts`) never calls `appendAuditRecord` (it runs under a System/staff **bootstrap** elevation for its own `identity` inserts, not for audit), and the concrete `appendAuditRecord` facade is **not even exposed** on `core/contracts/services.ts` (only the `AppendAuditRecord` **type** exists). So tenant-write audit has **never been exercised** — `upsert_buyer_profile` is the first to require it.
- **Every Audit-Required tenant write inherits this collision** — all M1 `update_*`/`create_*`/membership/role/delegation commands, and every later M2–M9 tenant write. The fix belongs in the **platform audit mechanism**, not in M1.

## 3. What is parked until the ruling

- **The `upsert_buyer_profile` command + its facade/mapper/route/server-action/form** (the whole M1 buyer-profile WRITE slice).
- **The M0 `appendAuditRecord` concrete-facade exposure** (deferred with the mechanism — not added speculatively).
- **Unaffected (proceed independently):** the generic `form-field` kit app-component, the account READ leg, the `(public)` shell, and any non-Audit-Required read.

## 4. Options for the Board (recommend candidates; do not decide)

Atomicity-preserving candidates (keep Doc-4B §A10 — audit atomic with the business write):

- **(R-a) M0 audit service elevates `app.is_platform_staff` transaction-local for its own platform-owned insert.** Rationale: `core.audit_records` is **platform-owned** (M0/`core` schema); `app.is_platform_staff` is defined to **gate platform-owned writes** (Doc-6C §2.1). The audit row records the user as `actor_id`/`actor_type` but the physical append is a **platform** operation. *Tradeoff:* requires the discipline that **audit is the last write in the transaction** (or that the service save/restore the GUC), else subsequent writes in the same tx leak staff privilege. Additive Doc-4B §A10 / Doc-6B note pinning the mechanism + the ordering rule.
- **(R-b) Add a dedicated append-only INSERT policy on `core.audit_records`** permitting an authenticated principal to INSERT with a `WITH CHECK` that **binds the row to the request context** (e.g. `actor_id = app.user_id`, `organization_id = app.active_org`), while SELECT stays platform-staff-only and UPDATE/DELETE remain blocked by the existing immutability triggers (Doc-6B §4.1). *Tradeoff:* widens INSERT; the `WITH CHECK` must be tight enough to prevent forged/cross-tenant audit rows. Additive Doc-6B §2.2 patch (+ every partition, per the L130–132 note).

Listed for completeness (carry a known conflict):

- **(R-c) `SECURITY DEFINER` audit-append function** owned by M0 (a privileged routine performing the controlled insert, bypassing RLS). *Tradeoff:* introduces a `SECURITY DEFINER` surface (elevated review burden / injection-hardening). Additive Doc-6B.
- **(R-d) Decouple audit from the business tx** (enqueue an audit intent on the M0 outbox; a System drainer appends under staff context). *Conflict:* breaks Doc-4B §A10 / §17.1 **atomicity** (audit becomes eventually-consistent and can diverge from the business write) — likely **non-viable**; recorded only to be ruled out explicitly.

## 5. Requested action

An Architecture Board ruling selecting a mechanism (an **additive** Doc-4B/Doc-6B patch — never an edit that reopens a frozen decision), after which:
1. the platform audit-write mechanism is realized once (M0), and the `appendAuditRecord` concrete facade is exposed;
2. `upsert_buyer_profile` resumes — wiring the audit append per the ruling — and ships with audit;
3. this ESC is marked **RESOLVED** with the ruling recorded in §7 (mirroring `ESC-W1-OUTBOX`).

Until then the slice is **BLOCKED**; the owner has directed pause-and-escalate (no local elevation, no omitted audit).

---

## 6. Board deliberation (D1 session — 2026-06-30)

Convened per `BOARD-SPRINT-AUDIT-MECH` §8 (eight-role platform panel; no FE/UI seats). The panel
adjudicated R-a…R-d against the frozen anchors and the realized migration.

**Decisive finding — the realization over-restricts INSERT relative to the frozen intent.** The frozen
posture for `core.audit_records` is **append-only** (Doc-6B CR4 — "INSERT-only; UPDATE/DELETE
trigger-blocked") with RLS as a **platform-staff *backstop*** (Doc-6B §2.2 / Doc-6A §4.5; app-layer authz
is primary — CR2), while **audit-write is a Doc-4B §17 obligation of every business write** (Doc-6B CR9)
performed **atomically inside the caller's tenant transaction** (Doc-4B §A10/§17.1). Those three frozen
facts can only hold together if the staff backstop governs **disclosure (SELECT)** — audit is sensitive,
only platform-staff may read it — while the **append (INSERT)** path is expected to work for any
authorized in-transaction business write. The migration collapsed both into a single `USING` policy;
because Postgres uses a policy's `USING` as the `WITH CHECK` when the latter is omitted, INSERT became
staff-only as a **side effect** — narrower than the frozen architecture intends. Correcting that is
**additive and corrective toward the frozen posture, not a weakening of a frozen decision.**

**Option adjudication:**
- **R-a (transaction-local staff elevation) — REJECTED.** Introduces a privilege-elevation primitive into
  the hot path of *every* tenant write; correctness depends on a fragile "audit is the last write / save-
  restore the GUC" discipline, and any violation silently leaks `is_platform_staff = true` to later writes
  in the same transaction (an RLS-bypass footgun). Contrary to least-privilege and to the owner directive
  "no privilege-elevation mechanism introduced."
- **R-c (`SECURITY DEFINER` routine) — REJECTED (retained only as fallback).** Achieves the same result as
  R-b but adds a privileged routine carrying elevated review / injection-hardening burden. Unnecessary:
  R-b expresses the control declaratively in the **already-frozen RLS idiom** — `identity` realizes the
  exact pattern today (`memberships_insert`, `buyer_profiles_tenant`: `WITH CHECK (organization_id =
  app.active_org OR is_platform_staff)`; `20260627202753_identity_init` L215/L226). R-c is reserved only if
  a context-bound `WITH CHECK` proves inexpressible — it does not.
- **R-d (async/outbox decoupling) — REJECTED (non-viable).** Breaks Doc-4B §A10/§17.1 atomicity; audit
  becomes eventually-consistent and can diverge from a committed business write. Ruled out explicitly.
- **R-b (append-only INSERT policy, context-bound `WITH CHECK`) — SELECTED.** Preserves atomicity (the
  audit append stays the in-transaction `db.auditRecord.create(...)`), introduces **no** privilege
  elevation and **no** `SECURITY DEFINER` surface, coins nothing (reuses the frozen Doc-6C §2.1 GUC
  contract), and realizes the frozen append-only + read-backstop posture faithfully. This validates the
  owner's recommendation (`BOARD-SPRINT` §4) on independent review — Raise ≠ Accept.

## 7. Resolution (Board ruling — R-b, 2026-06-30)

The Board **rules R-b**: realize the frozen append-only posture by adding a **dedicated append-only INSERT
policy** to `core.audit_records` whose `WITH CHECK` binds the inserted row to the server-set request
context, leaving SELECT staff-only and UPDATE/DELETE trigger-blocked. This is the D1 decision; it
**authorizes** the additive Doc-4B/Doc-6B patches (D2/D3) — it does **not** author or freeze them.

**Binding conditions (verbatim intent):**
1. **Read backstop unchanged.** SELECT on `core.audit_records` stays **platform-staff-only**; the existing
   `audit_records_platform_staff` disclosure posture is preserved. No audit-read surface is widened.
2. **Append-only INSERT, context-bound.** Add an INSERT policy whose `WITH CHECK` admits a row **only** when
   it is truthfully attributable to the request context — the tenant-user leg requires `organization_id =
   app.active_org` **and** `actor_id = app.user_id` — **OR** `app.is_platform_staff IS TRUE` (the
   System/drainer/admin/bootstrap leg, which preserves the existing backstop and the NULL-org / System-actor
   append paths). The exact predicate is authored in the D3 Doc-6B patch (human-approved); the Board
   **recommends** additionally pinning `actor_type = 'User'` on the tenant-user leg as defense-in-depth
   against a tenant caller forging a System/Admin/AI-Agent actor_type.
3. **Immutability untouched.** No RLS allow is added for UPDATE/DELETE; the Doc-6B §4.1 immutability triggers
   (`audit_records_block_payload_mutation`, `audit_archive_set_once`) remain the sole, unchanged guard.
4. **Fail-closed.** Unset GUCs resolve to NULL → the predicate is false (matching the frozen `identity`
   idiom); a write with no resolved org/principal can never append audit.
5. **Every partition.** RLS policies do **not** propagate to partitions. The new INSERT policy MUST be
   created on `core.audit_records_default` **and every operationally-provisioned monthly partition**, exactly
   as the existing platform-staff policy is (`20260627183528_core_init` L124–132). The partition-provisioning
   runbook is updated so future partitions receive **both** policies; a partition with only the parent
   policy is a direct-to-partition append bypass.
6. **No elevation, no weakening.** No privilege-elevation primitive (rejects R-a) and no `SECURITY DEFINER`
   surface (rejects R-c) are introduced; least-privilege preserved. **No tenant-table RLS is weakened**, and
   nothing beyond the additive INSERT policy is coined.
7. **Atomicity preserved.** The audit append remains atomic with the business write inside the caller's
   transaction (Doc-4B §A10/§17.1); R-b only removes the RLS denial — it does **not** touch the atomic write
   path in `src/modules/core/infrastructure/data/audit-record.service.ts`.

**Change class & approval gate (CLAUDE.md §8).** Realization requires an **additive Doc-4B note** (§A10 —
record the audit-append RLS contract: append admitted under a context-bound INSERT policy; read stays
staff-only) and an **additive Doc-6B patch** (§2.2/§4.1 — the append-only INSERT policy + the all-partitions
rule). Both are **architecture-affecting → HUMAN approval required** (AI Coding Supervisor sign-off does not
substitute) and must be frozen via the corpus additive-patch process **before** any M0 realization. **No
frozen document is edited by this ruling.**

**Sequencing (sprint D-series).** D1 ✅ (this ruling). → D2/D3 additive patches authored + **human-approved**
+ frozen. → D4 M0 realizes once (the audit service already inserts on the caller's executor — the change is
the RLS policy, not the service) and exposes the concrete `appendAuditRecord` facade on
`core/contracts/services.ts` (mirroring `allocateHumanReference`). → D5 conformance test: a **tenant-context**
write (`is_platform_staff = false`) appends exactly one audit row **atomically** with the business write, no
staff-privilege leak to later writes, and a **forged/cross-tenant** audit insert is **rejected** by the
`WITH CHECK`. → D6 this ESC marked **RESOLVED**. → D7 `upsert_buyer_profile` resumes and ships **with**
audit; all Audit-Required tenant writes inherit the path.

**Status after D1:** the ESC stays **OPEN — ruled R-b**, not yet RESOLVED (RESOLVED at D6, after the
human-approved patches + the green conformance test). The feature-work freeze (`BOARD-SPRINT` §7) remains in
effect until sprint exit.

---

*Raised under Raise ≠ Accept (CLAUDE.md §13): a claim with a severity, adjudicated by the presiding authority (Architecture Board, §7). The reviewer raises; the Board rules; only a validated, additive resolution is implemented.*
