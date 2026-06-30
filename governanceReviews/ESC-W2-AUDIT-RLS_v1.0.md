# FLAG-AND-HALT — `ESC-W2-AUDIT-RLS` v1.0

| Field | Value |
|---|---|
| **Type** | FLAG-AND-HALT escalation (Raise ≠ Accept — CLAUDE.md §13) |
| **Raised by** | Wave 2 execution, M1 buyer-profile WRITE slice (`upsert_buyer_profile`) |
| **Date** | 2026-06-30 |
| **Severity** | **BLOCKER** — gates **every tenant-scoped business write** that is Audit-Required (M1 `upsert_buyer_profile` and all `update_*`/`create_*` tenant writes; later M2–M9 tenant writes). Platform-wide, not M1-local. |
| **Status** | **OPEN — awaiting Architecture Board ruling.** Do not resolve locally; no privilege-elevation mechanism introduced and no required audit omitted (owner instruction, 2026-06-30). |
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

*Raised under Raise ≠ Accept (CLAUDE.md §13): a claim with a severity, adjudicated by the presiding authority (Architecture Board, §7). The reviewer raises; the Board rules; only a validated, additive resolution is implemented.*
