# ADR-021: Audit-Records RLS Asymmetry — Write-Admission ≠ Read-Disclosure

> **✅ FOLDED (2026-06-30).** This proposal was **APPROVED (human)** and carried into the corpus as the individual
> ADR legal record **`generatedDocs/ADR-021_Audit-Records-RLS-Asymmetry.md`** (registered in `00_AUTHORITY_MAP.md`;
> the frozen ADR Compendium is **not** edited in place — Compendium v2 consolidation is a deferred human re-freeze).
> This file is retained as provenance/origin; **the corpus copy is authoritative.**

**Status:** **PROPOSED (DRAFT) — AWAITS HUMAN / ARCHITECTURE-REVIEW-BOARD APPROVAL.** A new ADR is a **new
decision**; per CLAUDE.md §7 the ADR Compendium is **rank 1, immutable to skills** — this proposal is **NOT**
folded into `generatedDocs/ADR_Compendium_v1.md` by any AI action. On approval, a human folds it into the
Compendium (the next free number — **ADR-021**; **ADR-019 stays reserved / do-not-backfill** per Compendium
§B-9, ADR-020 is the last used). Until then this file lives in `governanceReviews/` and is non-authoritative.

| Field | Value |
|---|---|
| Proposed number | **ADR-021** (next free; ADR-019 reserved, ADR-020 last used) |
| Date | 2026-06-30 |
| Raised by | Board Sprint (`BOARD-SPRINT-AUDIT-MECH`) — records the durable rationale of ruling **ESC-W2-AUDIT-RLS §7 = R-b**, at the owner's direction (the "why" should live in an ADR, not only inside the patches). |
| Realized by | `D2_Doc-4B_AuditAppendRLS_Additive_Patch_PROPOSAL.md` (the §B10/§17.1 posture note) + `D3_Doc-6B_AuditInsertPolicy_Additive_Patch_PROPOSAL.md` (the physical `FOR INSERT` policy). This ADR is the **decision**; D2/D3 are its **realization**. |
| Relationship to existing ADRs | **Extends ADR-009** (Audit Trail & Compliance) and **refines ADR-016** (Multi-Tenancy & Authorization — the RLS strategy). **Supersedes nothing.** Consistent with ADR-013 (audit logs = platform-owned data) and ADR-017 (M0 owns `audit_records`; no module may bypass). |
| Authority | CLAUDE.md §7 (authority order; ADR Compendium rank 1), §8 (architecture-affecting → human approval), §11 (Flag-and-Halt), §13 (Raise ≠ Accept). |

---

## Context

Three already-approved decisions collide at the physical RLS layer of `core.audit_records`:

1. **ADR-009 (Audit Trail & Compliance):** *all* business-critical actions generate an **immutable** audit
   record; the audit trail is a platform-wide M0 shared service and **"no module may bypass it."** Every
   mutating contract MUST append.
2. **ADR-013 / ADR-016:** audit logs are **platform-owned data**, and audit **reads** are restricted to
   platform staff / compliance (ADR-016 platform roles: Support / Verification / Super Admin read platform
   data; a tenant has no read claim on the platform audit stream). Tenant-*owned* tables use the **symmetric**
   RLS rule `organization_id = current organization` for **both** read and write (ADR-016 RLS Strategy).
3. **The atomicity requirement (ADR-009 audit obligation; realized as Doc-4B §B10 / Doc-4A §17.1 — §A10 in
   PassA numbering):** the audit append runs **inside the mutating caller's transaction** — atomic with the
   business write; audit failure fails the business write. *(This is the audit obligation, not the event/outbox
   pattern; ADR-014's transactional outbox is a separate, event-side mechanism — ADR-014 explicitly distinguishes
   audit "what happened" from events "what should happen next".)*

The realized M0 schema (`core.audit_records`) gave the table a **single platform-staff `USING` policy** as a
disclosure backstop. Because PostgreSQL reuses a policy's `USING` expression as its `WITH CHECK` when the
latter is omitted (verified, PG 15–18), that one policy **also gated INSERT to platform-staff only** — as a
side effect. The result: a **tenant-context mutation** (server guard sets `app.is_platform_staff = false`)
**cannot append its own audit row**, directly contradicting ADR-009's "every mutation audits, atomically,
in-transaction." Escalated as `ESC-W2-AUDIT-RLS` (BLOCKER); the Architecture Board ruled **R-b**.

The naïve resolutions are both wrong:
- Apply the **symmetric tenant rule** (ADR-016 `org = current org`) to audit reads **and** writes → leaks the
  **platform-owned** audit stream to tenants (violates ADR-013/016).
- Keep the **symmetric staff-only** rule on reads **and** writes → audit is unwritable by the very tenant
  mutations ADR-009 requires it to record (the realized defect).

Neither symmetric pattern fits a **platform-owned, write-once, mandatory-on-every-mutation** stream. That is
the gap this ADR closes.

## Decision

`core.audit_records` uses **asymmetric Row-Level Security**: the **write-admission (INSERT) surface is broader
than the read-disclosure (SELECT) surface.**

- **READ (SELECT) — narrow (platform-staff only).** Audit disclosure stays platform-staff/compliance-scoped
  (ADR-013/016). A tenant principal may **not** read audit rows — not even its own appends. Unchanged from the
  realized backstop.
- **WRITE-ADMISSION (INSERT) — broad, but self-attributed.** **Any** server-authenticated principal may
  **append** an audit row, provided the row is **truthfully *attributed* to its own server-resolved request
  context**: `organization_id = app.active_org` **AND** `actor_id = app.user_id` **AND** `actor_type = 'user'`
  (the tenant-user leg — `'user'` is the **lowercase** frozen `core.ActorType` label; this corrects the Board
  ruling §7(2)'s verbatim `'User'`, which would raise `22P02` against the realized enum, exactly as the D2/D3
  patches do), **OR** `app.is_platform_staff IS TRUE` (the System / staff / drainer / admin / bootstrap leg —
  which also carries legitimate `NULL`-org / `System`-actor rows). **Scope of the binding:** the `WITH CHECK`
  constrains the **attribution** columns (`actor_id` / `organization_id` / `actor_type`) — *who* appends and
  *on whose behalf* — and **not** the **content** columns (`entity_type` / `entity_id` / `action` / `old_value`
  / `new_value`). Content-integrity of the audited payload is a **separate** guarantee: the append is invoked
  only by the owning module's mutating contract (app-layer; ADR-009 "no module may bypass"), and the row is
  immutable once written (CR4′ / ADR-009/010/012). RLS secures *attribution*, not *semantic truth of the act*.
  **These two legs are exhaustive for every legitimate producer:** a tenant-context mutation always runs with a
  server-set `active_org`/`user_id` (tenant leg); every pre-active-org or System/background producer (e.g.
  first-login provisioning) runs staff-elevated transaction-local (staff leg). A non-staff, no-active-org audit
  producer would satisfy **neither** leg — that is a **Flag-and-Halt** (CLAUDE.md §11), never a local widening.
- **UPDATE / DELETE — closed.** Immutability remains enforced solely by the column-aware triggers (no RLS
  allowance), per ADR-009 ("immutable"), ADR-010 (no overwrite), ADR-012 (no hard delete). Redaction stays a
  **new audit event** (ADR-009 §B-3).

### Why INSERT is broader than SELECT (the load-bearing rationale)

The asymmetry is **forced**, not chosen — it is the only realization that satisfies ADR-009 **and**
ADR-013/016 at once:

- **The writer of an audit row is, by definition, whoever performed the audited action.** ADR-009 makes audit
  **mandatory on every mutation**, and the append is **atomic inside the actor's own transaction**. Across the
  platform, that actor is *every* tenant principal who mutates anything. So the set of legitimate **writers**
  is **as wide as the set of authorized mutators** — necessarily broad.
- **The reader of an audit row is a steward, not a participant.** Audit is platform-owned (ADR-013); its value
  is tamper-evidence and compliance, and exposing it cross-tenant would leak who-did-what across the tenant
  boundary (ADR-016 data-leakage rule). So the set of legitimate **readers** is **narrow** (platform staff /
  compliance).
- **Wide admission ≠ unconstrained admission — but the constraint is on *attribution*, not *content*.** The
  INSERT `WITH CHECK` binds every appended row's **attribution** to the **server-set** context (`app.active_org`
  / `app.user_id`, never client input — ADR-015/016 "Users act, Organizations own"; the active org is
  server-resolved, never trusted from the client). A principal can therefore only append a row **truthfully
  attributed to itself and its own org** — it cannot forge another actor's attribution or inject a cross-tenant
  attribution. It does **not** follow that the row's *content* (`entity_type`/`entity_id`/`action`/payload) is
  thereby guaranteed truthful: those columns are not in the `WITH CHECK`. Content-correctness is enforced
  *above* RLS — only the owning module's command appends, with the correct entity/action — and *after* the
  write by immutability (CR4′). Breadth is in *who may append*; the integrity RLS adds is *truthful WHO and
  on-whose-behalf*, not *truthful WHAT*.
- **The symmetric tenant rule (ADR-016) is correct for tenant-owned tables and wrong here.** ADR-016's
  `org = current org` (read == write scope) governs **tenant-owned** records, whose reader and writer are the
  same tenant. `audit_records` is **platform-owned and write-once**, so its reader (steward) and writer
  (actor) are deliberately **different populations** — hence asymmetric RLS, not symmetric.

In one line: **everyone may append only rows truthfully *attributed* to themselves; only stewards read them**
(the *content* of the act is secured above RLS, by the appending contract and by immutability).

### What this decision is NOT

- **Not a privilege elevation.** The tenant append runs under the tenant's **own** context on the **caller's**
  transaction; the platform never flips the tenant to `is_platform_staff` (rejected alternative R-a).
- **Not a `SECURITY DEFINER` surface.** No privileged routine bypasses RLS (rejected alternative R-c).
- **Not a relaxation of audit immutability or disclosure.** UPDATE/DELETE stay closed; SELECT stays
  staff-only. Only INSERT-admission widens.
- **Not a change to ADR-016's tenant-table rule.** Tenant-owned tables keep symmetric org-scoped RLS. This ADR
  defines the RLS pattern for the **platform-owned, write-once** class (audit today; any future immutable
  platform stream tomorrow) — it does not touch the tenant class.

## Consequences

- `core.audit_records` carries **two permissive policies** combined by Postgres with `OR`: the existing
  platform-staff backstop (governing SELECT, and the staff INSERT leg) **plus** a new context-bound
  `FOR INSERT` policy (the tenant-append leg). Adding a permissive policy only **widens** admission, never
  narrows it. The policies must be replicated on **every partition** (RLS does not inherit to partitions).
- Because `INSERT … RETURNING` forces the new row through the **SELECT** policy (and would fail the staff-only
  read → SQLSTATE 42501), the audit append **must not use `RETURNING`**: the `audit_id` is generated
  application-side (UUIDv7). This is how the write stays wide while the read stays narrow **simultaneously**.
- **Generalization (the *asymmetry* generalizes; the predicate does not).** A future **platform-owned,
  write-once, mandatory-on-mutation** stream should follow this **READ-narrow / WRITE-wide asymmetry**, not
  ADR-016's symmetric tenant pattern. **But the `WITH CHECK` predicate is NOT reusable verbatim** — each stream
  must bind **its own** attribution columns, and **content-integrity of the appended payload remains a separate
  app-layer + immutability concern**, never an RLS guarantee. Caution by example: a financial **ledger** is a
  *poor* fit for "RLS secures it," because a ledger's integrity is **content-shaped** (amount, counterparty,
  balance) — precisely what this pattern does **not** secure; a ledger needs additional content controls beyond
  the asymmetric-RLS precedent. This ADR is the reusable precedent **for the read/write asymmetry only.**
- **Realization** is carried by the D2 (Doc-4B posture) and D3 (Doc-6B policy) additive patches and the D4
  M0 implementation (the non-`RETURNING` append + the `appendAuditRecord` facade) under the
  `BOARD-SPRINT-AUDIT-MECH` D-series, each human-approved before freeze.

## Firewall / invariant check (no governance signal touched)

Audit is **M0 infrastructure**, **not** one of the five firewalled governance signals (Trust · Capacity ·
Financial Tier · Performance · Buyer Vendor Status — Compendium §A). This ADR adds **no** permission slug, **no**
POLICY key, **no** module/ownership change, **no** event, **no** state machine, and weakens **no** tenant-table
RLS. It records an RLS *posture* for one platform-owned table.

---

**Principle:** *Audit admission is wide and self-attributed; audit disclosure is narrow. Everyone may append
only rows truthfully attributed to themselves (their own actor / org); only stewards read them — and the truth
of the act itself is secured above RLS, by the appending contract and by immutability.*

*ADR-021 (PROPOSED / DRAFT) — extends ADR-009, refines ADR-016, supersedes nothing. Records the durable
rationale of ESC-W2-AUDIT-RLS §7 = R-b; realized by the D2/D3 additive patches. Awaits human/Board approval;
not folded into the frozen ADR Compendium by any AI action (CLAUDE.md §7 rank 1 immutable to skills).*
