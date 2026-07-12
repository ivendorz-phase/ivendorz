# Wave 3 — Independent Domains (M2 · M5 · M6 · M7) — Integration Audit + Exit Gate — **v0.1 DRAFT (PREP)**

| Field | Value |
|---|---|
| **WP** | Wave-3 Integration Audit [W3-AUDIT-001] |
| **Date** | 2026-07-11 |
| **Status** | **PREP — read-only governance audit COMPLETE for the delivered branches; combined build/suite + merge HELD** (owner Plan A: "prepare now, gate when all 4 ready"). This is the DRAFT; it becomes v1.0 when the full gate runs. |
| **Scope** | M2 `marketplace` · M5 `trust` · M6 `communication` · M7 `billing` — the four Wave-3 independent domains, each on its own branch cut from `main` (`4bf4645`), merging at this exit gate (Wave-2 single-wave-exit precedent). |
| **Method** | Mirrors `Wave-2_Integration_Audit_and_Exit_Gate_v1.0.md`. Read-only per-branch analysis done on the shared tree without integrating (active parallel sessions + shared test DB → no full-suite runs yet, per `[[review-concurrency-contamination]]`). |
| **Verdict** | **NOT YET GATED — blocked on M5 delivery + M2/M7 session-complete confirmation + quiet-DB window.** Gate **shape RULED** (Board 2026-07-11): **DELIVERED-SLICE EXIT GATE, APPROVED** (§0.1). The delivered branches (M2/M6/M7) pass every *read-only* governance clause. The *combined* build/migrate/suite/CHK-8-024 clauses are HELD until integration. |

> **Wave 3 ≠ Wave 2 in shape.** Wave 2 asserted complete M0+M1 **module DoDs**. Wave 3's committed work is **per-module slices with explicit deferrals** (M2: discovery reads, TrustIndicators/products/search deferred; M6: support-ticket pilot, event-consumer BCs deferred; M7: plan/entitlement catalog, ~of 33 contracts; M5: verification substrate WP1).

### §0.1 Gate shape — RULED (Board, 2026-07-11) — **DELIVERED-SLICE EXIT GATE · APPROVED**

This gate asserts the **delivered surface**, not full-module DoDs. Evaluation criteria (the six load-bearing clauses):

1. **Delivered-surface conformance** — each committed slice conforms to its frozen contracts/API/DB anchors.
2. **Cross-module integrity** — boundaries, contracts-only imports, signal firewall, no cross-schema FK/table access.
3. **Shared-infrastructure reconciliation** — the 5 shared files (`schema.prisma`, `AUTHORITY_MAP`, `esc_registry`, `db.ts`, `backend_build_plan`) union-merge cleanly; combined schema/migrations coherent.
4. **Combined build/test integrity** — build · lint · format · structure · migrate · **full suite** · CHK-8-024 all green on the integration branch.
5. **Governance completeness** — zero frozen-corpus drift; every corpus change additive-patch + Authority-Map-registered; ESCs recorded with disposition.
6. **No regression** — Wave-0…2 inherited behavior + suites still green.

**Explicitly EXCLUDED from this gate:** (a) full-module Definition of Done; (b) deferred capabilities scheduled for later waves (M2 trust-indicators/search, M6 event-consumer BCs, M7 remaining contracts, M5 remaining Trust WPs). These are carried (§D), not gating.

---

## §0. Delivery + readiness state

| Module | Branch (worktree) | Ahead | Delivered | Session state |
|---|---|---|---|---|
| **M2 marketplace** | `wave/3-marketplace` | +3 | W3-MKT-1 (slug + profile read) · W3-MKT-2 (vendor directory) | delivered; **session-complete UNCONFIRMED** |
| **M6 communication** | `wave/3-communication` | +1 | W3-COMM-1 (support-ticket pilot) | **delivery-complete** (remainder deferred, owner-ruled) ✅ |
| **M7 billing** | `wave/3-billing` (`iVendorz-m7-billing`) | +4 | W3-BILL-1 (plan-catalog reads) · W3-BILL-2 (plan lifecycle writes) · W3-BILL-3 (entitlement/bundle writes) | delivered; **session-complete UNCONFIRMED** |
| **M5 trust** | **`wave/3-trust` = 0**; real work `wave/3-trust-wp1` (`iVendorz-m5-trust`) | +2 | W3-TRUST-1 WP1 (verification substrate) | **MID-BUILD ⚠️ — not on its wave branch** |

**Readiness blockers to the full gate:** (1) **M5** must complete its Wave-3 scope and land on `wave/3-trust`. (2) **M2 + M7 sessions** must confirm delivery-complete (no more commits incoming). (3) A **quiet-tree window** (no active session using the shared Postgres) is required to run the combined suite without contamination.

---

## §A. Wave Integration Audit (14 items — Wave-2 mirror)

Legend: **✅ PRELIM** = verified read-only, per delivered branch, pre-integration · **⏳ HELD** = requires the integration branch (all 4) + owned DB.

| # | Item | Status | Evidence (read-only, this pass) |
|---|------|--------|--------|
| 1 | Builds (typecheck `tsc`) | ⏳ HELD | each branch self-reported `tsc 0` at delivery; combined re-verify on the integration branch |
| 2 | Lint clean (`eslint` + boundaries) | ⏳ HELD | per-branch reported clean; combined re-verify |
| 3 | Format clean (`prettier --check`) | ⏳ HELD | per-branch reported clean; combined re-verify |
| 4 | Tests pass (`vitest` vs real Postgres); no `.only/.skip` | ⏳ HELD | per-branch reported green (M2 430/430 · M6 423/423 · M7 18/18+ · M5 partial); **combined suite HELD** (needs all 4 + owned DB) |
| 5 | Structure matches (`check-structure.mjs`) | ⏳ HELD | combined check on the integration branch |
| 6 | Import boundaries enforced (`eslint-plugin-boundaries`) | **⚠️ OPEN FINDING** | Re-scan at **M7 +7** (was +4 at prep): M2/M5/M6 touch only their own `src/modules/<m>`+`src/server/<m>` (+ M6's sanctioned `src/server/context` `withStaffContext`). **NEW: M7 `wave/3-billing` (`b8e8518` W3-BILL-4) authors M0-owned surface** — `src/modules/core/{contracts,infrastructure}` + `src/shared/ids` + an **M0-schema migration** `core.write_outbox_event` — see **§E [W3-EXIT-M7-CORE]**. Runtime boundary intact (contract-mediated; M0-calls-own-schema); the open question is AUTHORSHIP/PROVENANCE of M0 surface by M7. **Raised, not resolved.** |
| 7 | Generated artifacts not tracked | ⏳ HELD | combined `git ls-files` check |
| 8 | CI merge-gate present | ✅ | `.github/workflows/ci.yml` on `main` (inherited) |
| 9 | **No architecture drift / FROZEN corpus untouched** | **✅ PRELIM** | **per-branch `git diff main..<b>` over frozen base docs (`_FROZEN`/`_Content_v1.0_`/Doc-2 blueprint/Doc-3/Doc-4B_Content/Master/ADR_Compendium) = 0 in-place edits on ALL FOUR branches.** All `generatedDocs` changes are **additive patches** (new files) — M2: Doc-4D_VendorSlugResolve v1.0.4 + Doc-5D ×3; M6: Doc-2_Patch_v1.0.9 + Doc-4H_SupportTicketAuditToken; M7: Doc-4I_5I_PlanStatusModel + Doc-5I_RetiredVisibility; M5: none. |
| 10 | Combined schema = M2+M5+M6+M7 tables across their 4 namespaces | ⏳ HELD | combined `check-schemas.mjs` after schema.prisma union-merge |
| 11 | Migrations forward-only, apply clean (combined) | ⏳ HELD (⚠ note) | each branch's migrations are own-schema + forward-only. **Timestamp collision: M6 `20260711160000_communication_support_tickets` ⟂ M5 `20260711160000_trust_verification_substrate`** — distinct dir names, different schemas, no cross-dependency → harmless (Prisma orders by full name); **noted**, no rename needed. Combined `migrate deploy` clean-apply HELD. |
| 12 | **`CHK-8-024` MANDATORY (RLS byte-equivalence)** | ⏳ HELD | per-branch RLS suites reported green; the **combined** byte-equivalence pass is the load-bearing gate (M5's staff-RLS + score-firewall; M2 public/anonymous tri-actor; M6 recipient/party; M7 billing firewall) |
| 13 | Secrets + **no cross-schema FK** | **✅ PRELIM** | **cross-schema-FK scan of all four branches' new migrations = CLEAN** (only own-schema FKs + the sanctioned `core.id_sequences` allocator ref). Combined `check-no-secrets.mjs` HELD. |
| 14 | **Repository Ownership Audit** | **⚠️ OPEN FINDING (M7)** | M2/M6 code ⊆ their module + sanctioned shared. **M7 extends M0 (`core` contract + infra + schema migration) — §E [W3-EXIT-M7-CORE]; needs M0-owner ratification + a merge-PR-scoping decision.** Full audit re-run (incl. M5) on the integration branch. |

**Read-only governance sub-verdict (updated 2026-07-12, M5 & M7 both COMPLETE):** **zero frozen-corpus drift, additive-patches-only, no cross-schema FK** across all four branches. **One BLOCKER — [W3-EXIT-M7-CORE]: M5 (`31b997d`) and M7 (`b8e8518`) authored TWO architecturally + contractually incompatible realizations of the M0 `core.write_outbox_event.v1` primitive, on the same `src/modules/core/*` files** (staff/System direct-INSERT vs tenant-context SECURITY DEFINER bypass; divergent result field / error union / executor iface / migration footprint / frozen citation §B10 vs §16). This is a genuine merge collision + an **architecture-affecting decision** (canonical realization + whether tenant-context modules may emit) → **Flag-and-Halt, human/Board ruling required (§E)**; not a mechanical dedup. All other read-only clauses stand; it is the load-bearing blocker to a clean 4-way merge.

---

## §B. Integration reconciliation plan

- **Code merges cleanly** — the four modules' `src/modules/<m>` + `src/server/<m>` trees are **disjoint** (§A item 6). No semantic merge conflict in code.
- **Shared files = additive UNION.** Five shared files each receive additive appends; the integration keeps **every** module's additions:
  - `generatedDocs/00_AUTHORITY_MAP.md`, `esc_registry.md` → predicted **0 conflicts** (append clean).
  - `prisma/schema.prisma`, `tests/_harness/db.ts`, `docs/backend/backend_build_plan.md` → a few **append-region** conflicts as the 3rd/4th branch folds in; **resolve by union** (all models / all RLS grants / all WP records kept). No semantic conflict.
- **Integration procedure (when triggered):** cut `wave/3-integration` from `main`; merge the four module branches in turn (isolated worktree, per `[[parallel-session-branch-coordination]]`); resolve the 5 shared files by union; regenerate Prisma client; run the combined §A HELD clauses (build/lint/format/**migrate**/**full suite**/**CHK-8-024**/structure) on an **owned** test DB during a quiet-tree window.
- **Merge to `main`:** owner-gated, per-module PRs (`Build_Roadmap` "one module scope per PR"), all gated by this exit review — the **outward/owner-authorized** action (Wave-2 WP-1.9 precedent: push + branch-protection + Vercel + Supabase-prod-migrations owner-gated).

---

## §C. Readiness TRIGGER (what unblocks the full gate)

Run the combined integration + §A HELD clauses + Part-B merge **only when ALL of**:
1. ☐ **M5 trust** completes its Wave-3 scope and lands on `wave/3-trust` (currently `wave/3-trust-wp1`, +2, mid-build).
2. ☐ **M2 + M7 sessions** confirm delivery-complete (no further commits to their wave branches).
3. ✅ **Owner ruling on gate shape — RULED: DELIVERED-SLICE EXIT GATE (Board, 2026-07-11, APPROVED).** §0.1 closed; this trigger item is satisfied.
4. ☐ A **quiet-tree window** on the shared Postgres (no active session running suites) — or run the combined suite in an isolated worktree with a throwaway DB.

---

## §D. Carried forward (recorded; non-blocking)

- **M6:** `[ESC-COMM-STAFF-AUTHZ]` (DC-3 roster-time staff hard-gate); M6 event-consumer BCs (Notifications/Delivery/Messaging) deferred to their §8 producers (Waves 4–5, owner-ruled).
- **M7:** `[ESC-BILL-RETIRE-VIS]` was owner-ruled + folded (`Doc-5I_RetiredVisibility_Patch`); confirm no residual billing ESCs at integration.
- **M2:** deferred `trust_indicators`/`profile_experience` projection (needs M5); `search_catalog` unbuilt; program-wide `[ESC-MKT-HUMANREF-ENUM]` + `[ESC-MKT-RATELIMIT-ENFORCE]` (Board-dispositioned non-blocking).
- **M5:** verification substrate WP1 only — remaining Trust WPs pending (its own delivery scope).

---

## §E. Open findings raised during readiness checks (RAISE ≠ ACCEPT — for Board adjudication)

### [W3-EXIT-M7-CORE] — TWO divergent M0 outbox realizations (M5 `31b997d` ∥ M7 `b8e8518`) — **BLOCKER (merge + unsafe) · UNRESOLVED · ARCHITECTURE DECISION**

> **Sharpened 2026-07-12 (readiness re-check):** both M5 **and** M7 independently authored `core.write_outbox_event.v1` inside CLOSED M0, on the **same files** — so this is no longer a single-side provenance question; it is a genuine **merge collision** whose two sides are **architecturally + contractually incompatible**. Cannot be "kept-all" or mechanically deduped.

**What — two realizations of the same frozen M0 contract, on colliding files:**
- **M5 `31b997d`** (W3-CORE-1): direct Prisma `createMany` INSERT into `core.outbox_events`; **no DB migration** (Wave-2 baseline table); **no RLS bypass** — relies on `outbox_events_platform_staff` admitting the write under `app.is_platform_staff=true` (**staff/System emitters only**); contract result `{ outboxEventId }`; defines error `core_outbox_write_failed` + `CoreServiceError` w/ `cause`; executor `$queryRawUnsafe` only. Cites Doc-4B **§B10**.
- **M7 `b8e8518`** (W3-BILL-4): adds `prisma/migrations/20260711180000_core_write_outbox_event/` = **`CREATE FUNCTION "core".write_outbox_event(...) SECURITY DEFINER`**; calls it via `$executeRawUnsafe`; the SD function **deliberately bypasses** the staff RLS so a **tenant-context** emitter (`billing.purchase_subscription`) can write; contract result `{ eventId }`; **removes** `core_outbox_write_failed`; adds `$executeRawUnsafe` to the executor iface. Cites Doc-4B **§16**.

Both also touch `src/shared/ids/index.ts`, `core.module.ts`, `contracts/{services,types}.ts`, `infrastructure/index.ts`.

**Why it is a BLOCKER, not a dedup.** The two contract surfaces are **mutually incompatible** (result field name, error union, executor iface) AND the two realizations encode **different security postures** (staff/System-only INSERT vs tenant-context SECURITY DEFINER bypass). Mechanically "canonicalize on M5's and re-point M7" would **break M7's tenant-context billing emitters** (they run under a buyer's tenant context, which M5's staff-only RLS INSERT rejects) and drop the error/result contract billing depends on. So the choice is an **architecture-affecting decision**, not housekeeping.

**The decision the Board/human must rule (CLAUDE §8 → HUMAN approval; §7 authority; touches M0 contract + RLS/firewall):**
1. **What does frozen Doc-4B actually mandate** — a direct staff/System INSERT (§B10) or a SECURITY DEFINER function (§16)? The **divergent citations themselves are a flag**: the two sessions read different section numbers; verify the frozen text verbatim (it adjudicates upward, §7).
2. **May a tenant-context module emit to the outbox at all**, or must §8 emission be System/staff-context only? M5 says staff/System-only; M7 needs tenant-context emit for user-driven billing. The canonical M0 primitive must serve every Wave-3+ producer's real emit context.
3. If the SD-bypass form is canonical → **CHK-8-024** must confirm the `EXECUTE`/grant is scoped exactly to the intended emitters; likely a **Doc-6B additive patch** for the new function. If the direct-INSERT form is canonical → **M7's inline tenant-context emit is the defect** and billing must emit under a System path (e.g., worker), reworked.
4. **Provenance/merge:** whichever wins, the canonical `core.write_outbox_event` should land as an **M0-owned commit/WP** (not carried inside a module PR — "one module scope per PR"); the other module re-points via `@/modules/core/contracts`.

**Status:** RAISED + sharpened during the readiness re-check; **Flag-and-Halt — not resolved locally (Raise ≠ Accept).** Now **gating**: this is the one item that prevents a clean 4-way merge. Both endpoints are frozen (M5 & M7 done building), so it is ripe for an owner/Board ruling — but as an **architecture decision**, not a session's self-directed canonicalization.

---

*Wave-3 Integration Audit + Exit Gate — v0.1 DRAFT (PREP). Read-only governance clauses verified for the delivered branches; combined build/migrate/suite/CHK-8-024 + merge HELD per owner Plan A. Promote to v1.0 when the §C trigger is met and the full gate runs. Non-authoritative under the frozen corpus; on conflict the frozen doc wins.*
