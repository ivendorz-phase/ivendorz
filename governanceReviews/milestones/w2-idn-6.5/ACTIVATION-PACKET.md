# ACTIVATION PACKET — Agent M1 · W2-IDN-6.5

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.1). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat.*

## 0. Header

- **Role activated:**       Agent M1 — Identity & Organization (charter: org plan §3 shared charter + M1 row)
- **Work item:**            `W2-IDN-6.5` — Wired API · Delegation (§5, **all 6 contracts**) + §5.10
                            boundary realization + §B.6 dedup · WP defs: `docs/backend/backend_build_plan.md`
                            §4 Stage B + `backend_execution_playbook.md` §5 (IDN-6 header AS CORRECTED
                            at RV-0152 + 6.5 row)
- **Depends on:**           `W2-IDN-4` ✅ (delegation write side + machine + sweep, RV-0149) ·
                            `W2-IDN-6.1` ✅ closed at `f0443c5` (house wired shape: handler/route/If-Match/ETag) ·
                            `ESC-IDN-DELEG-EXPIRY` ✅ RESOLVED (owner ruling 2026-07-09 →
                            `Doc-2_Patch_v1.0.7` executed; contract #25 UN-GATED) — gates checked per org plan §5 ③
- **Priority / Lane:**      P2 · Lane G
- **Model class:**          advanced (ruling realization on the 2nd authz path + §B.6 store design)
- **Worktree:**             none (no parallel activation mutates files at dispatch)
- **Activation type:**      FIRST (fresh context)
- **Date · Packet author:** 2026-07-10 · Orchestrator (Backend-Lead hat: yes)
- **Packet-size attestation:** 5 document pointer rows / ~12 distinct files · §3+§4 entries: 14 ·
                            est. input ~20k tokens — within limits: **YES** (dual count per v1.1)

## 1. TASK

- **Objective:** wire all six §C9 delegation contracts on their frozen routes, realize the
  §5.10 suspended-at-expiry boundary exactly per `Doc-2_Patch_v1.0.7` (machine edge · sweep
  extension · real reinstate · no-resurrection), and realize the §B.6 command-dedup store with
  its Idempotency-Key wire leg (incl. retro-fit across the 6.1 §C4 wires).

- **In scope:**
  - **6 wired contracts (verbatim ids/methods from playbook §5 6.5 row; routes/registers from
    Doc-5C §5 — RE-READ VERBATIM):** `create_delegation_grant.v1` POST·C ·
    `suspend_delegation_grant.v1` POST·C · `reinstate_delegation_grant.v1` POST·C (#25, now real) ·
    `revoke_delegation_grant.v1` POST·C · `get_delegation_grant.v1` GET·Q ·
    `list_delegation_grants.v1` GET·Q. Dual-party authority + guards are IDN-4-realized — wire,
    never re-derive.
  - **§5.10 boundary realization (the patch is freeze-level — RE-READ VERBATIM):**
    (a) `suspended → expired` edge added to the realized transition matrix;
    (b) System expiry sweep extended to cover `active` AND `suspended` — **the RV-0149
    suspended-at-lapse test pin updates as ruling-realization, not regression** (cite the
    RV-0148→6.1 pin-update precedent in your report);
    (c) real `reinstate_delegation_grant` replaces `DelegationReinstateGatedError`: valid ONLY
    for a currently `suspended`, NON-expired grant (window open at reinstate time); reject
    expired per the frozen §C9 registers;
    (d) **no-resurrection discriminating tests**: post-terminal (`expired`/`revoked`) delegation
    requires a NEW grant — new UUID, fresh independent audit trail; grant instances append-only.
  - **§B.6 dedup (RV-0149 close carry):** realize the command-dedup/Idempotency-Key replay
    store per the owning-module design authority — Doc-4C §B.6 + Doc-6C §6.2 ("realized per the
    owning-module design (Doc-6A §10.3)") — RE-READ ALL THREE VERBATIM. Window POLICY =
    `identity.command_dedup_window` via `core.config_value_query.v1` (**unseeded until IDN-7** —
    IDN-4 precedent: real key read, test-scoped seed, never a literal fallback). Wire the
    Idempotency-Key header per Doc-5A §9.2 on the legs §B.6 governs, and **retro-fit the header
    requirement across the delivered 6.1 §C4 wires** (RV-0152 close carry, report §12).
  - **Concurrency legs (RV-0152 F2 standard):** stale-token 409s on 6.5's own PATCH-class/CAS
    legs carry the current-token `ETag` per Doc-5A §9.5 with the call-13 leg discipline
    (token-mismatch/losing-write legs only; never machine-illegal-edge conflicts).
  - **AUDITED WRITES:** per each contract's frozen §C9 Audit declaration (the RV-0152 call-1
    rule — never a blanket), D7-atomic, actions bound by `[ESC-IDN-AUDIT]` near-pointer
    convention (IDN-4 token lineage) — never invent.
  - **Test folds (RV-0152 close carries, test-only touches to
    `tests/integration/user-account-slice.test.ts`):** NIT-Δ1 — add the deactivate stale-CAS
    409+ETag test · NIT-Δ2 — strengthen composition-pin assertion (2) into a genuine
    injection-site pin (≥2 occurrences or deps-position match).
  - **Doc-8:** 8C (envelope · registers · idempotency incl. the NEW replay semantics ·
    prohibited fields · actor-scope dual-party) + 8E (the new machine edge: legal-edge exercised,
    illegal edges rejected-status-unchanged — the IDN-4 matrix idiom).

- **Out of scope:** other IDN-6 sub-domains · POLICY seed (IDN-7) · the M3
  refresh-on-revocation teardown (service/event-ported, `[DC-1]`-blocked — NEVER from identity) ·
  M2 vendor surfaces · any identity-originated event. Additions = Review-A finding.

- **Acceptance criteria:** all 6 on frozen routes/registers (as-built table for reviewer
  cross-derivation) · §5.10 patch realized exactly (all 4 binding rules discriminating-tested) ·
  sweep both-states + System-attributed + idempotent · reinstate boundary (suspended+non-expired
  only) proven both directions · no-resurrection proven (new UUID + fresh audit) · §B.6 store
  frozen-grounded with replay discriminating-tested (same key+window → single execution; the
  6.1 wires honor the header post-retro-fit) · ETag legs per call-13 discipline · zero invented
  action/slug/state/route/event · full suite green — **baseline at dispatch: 278 tests / 25 files**
  (3× quiet-tree proven at `f0443c5`) · tsc/ESLint/Prettier green.

- **Binding carries (inbound):**
  | Source | Obligation | Class |
  |---|---|---|
  | Tracker 6.5 row + `Doc-2_Patch_v1.0.7` §4 | machine edge · sweep extension (+ RV-0149 pin update = ruling-realization) · real reinstate · no-resurrection tests | acceptance-criterion |
  | RV-0149 close (tracker W2-IDN-4 row) | §B.6 dedup realization · **T6-OBS-1 M2-port existence-oracle future-watch** (note in report §OBS — no build) | acceptance-criterion / future-watch |
  | RV-0152 close (report §12 + review-log) | Idempotency-Key retro-fit across the 6.1 §C4 wires once the store lands · §9.5 ETag output leg on 6.5's own stale 409s (call-13 discipline) | acceptance-criterion |
  | RV-0152 close (review-log) | NIT-Δ1 deactivate-409 ETag test · NIT-Δ2 injection-site pin strengthen | fold-in (test-only) |

  No further carries: RV-0150 OBS-B1 (suspended-org live-path) binds 6.6; the serialization
  contract binds 6.2; durationToMs canonicalization binds IDN-7. Checked, not omitted.

## 2. DOCUMENTS (pointers only — ≤5 rows, dual count attested in §0)

*Every FROZEN pointer: **RE-READ VERBATIM — never trust a paraphrase, including this packet's.***

1. Doc-4C §C9 (the 6 contracts: fields/registers/audit declarations) + §B.6 (command dedup) +
   Doc-2 §5.10 (base machine + guards line 590) + Doc-2 §9 (audit actions, bind by pointer) —
   locate via `generatedDocs/CORPUS_INDEX.md`.
2. `generatedDocs/Doc-2_Patch_v1.0.7.md` + `governanceReviews/BOARD-DECISION-IDN-DELEG-EXPIRY_v1.0.md`
   — the ruling pair; on §5.10 boundary questions the patch governs.
3. Doc-5C §5 (the 6 delegation route rows) + §4.3 (If-Match) + Doc-5A §6.2 (envelope/status) ·
   §9.2 (Idempotency-Key) · §9.5 (ETag current token) + Doc-4A §9/§11.2 — locate via `CORPUS_INDEX.md`.
4. `docs/backend/backend_execution_playbook.md` §5 (corrected IDN-6 header + 6.5 row) · §8 +
   Doc-6A §10.3 (owning-module store design) + Doc-6C §6.2 (dedup-store realization authority) —
   Doc-6 files via `CORPUS_INDEX.md`.
5. `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` + in-repo precedents: the IDN-4
   delegation set (`domain/state-machines/delegation-grant.state-machine.ts` ·
   `application/commands/{create,suspend-revoke,reinstate,expire}-delegation-grant*.command.ts` ·
   `tests/integration/delegation-grant-slice.test.ts`) + the 6.1 wired house shape
   (`src/modules/identity/api/*.handler.ts` · `app/api/identity/users/**` ·
   `src/server/identity/*.route-handler.ts` · `src/shared/http` If-Match/ETag) + the RV-0152
   close entry in `project-management/review-log.md` (carry provenance).

## 3. CONTRACTS

- `src/modules/identity/contracts/{services,types,index}.ts` — additive only; existing exports unbroken.
- Consumed: `src/modules/core/contracts/` (audit append + config query) — **consume only, never edit**.

## 4. CODE (§3+§4 combined ≤15 entries)

- `src/modules/identity/domain/{state-machines,policies}/` (edge addition; guards consumed) ·
  `application/commands/` (reinstate realization + sweep extension + new wire commands as needed) ·
  `infrastructure/data/` (delegation repository + the §B.6 store leg)
- `src/modules/identity/api/` + `app/api/identity/` + `src/server/identity/` (6 new wired faces;
  6.1 house shape) · `src/server/context/` + `src/server/authz/` (consume)
- `inngest/functions/` (expiry sweep extension per W2-CORE-2/IDN-4 conventions)
- `prisma/schema.prisma` + ONE new forward-only migration **ONLY IF the §B.6 store's realization
  vehicle is frozen-grounded** (see §5 halt condition)
- `src/shared/http/` (consume — If-Match/ETag/Idempotency-Key carriage; additive only if a §9.2
  helper has no home, disclosed per the 6.1 OBS-5 precedent)
- `tests/integration/` (delegation slice extension + the two user-account-slice folds) · `tests/_harness/` (reuse)

## 5. CONSTRAINTS

- **Standing charter binds** (not restated): org plan §3 — Never-list violations are Review-A BLOCKERs.
- **Team-6 pre-flag: YES** — delegation = the second authz path (dual-party escalation surface,
  RV-0149 truth-table lineage) + the reinstate/expiry temporal boundary + replay-cache
  poisoning/bypass surface. Completion Report readiness must match.
- **Open gates/ESC:** `[DC-1]` — zero identity events; the M3 refresh-on-revocation teardown
  stays service/event-ported and out of this WP; Flag-and-Halt if a wire seems to need an event ·
  `[ESC-IDN-AUDIT]` — near-pointers only, never invent · `ESC-IDN-DELEG-EXPIRY` ✅ resolved —
  realize exactly the patch, nothing more · `[DC-5]`/POLICY — `identity.command_dedup_window`
  unseeded until IDN-7 (IDN-4 precedent binds).
- **Task-specific:** contract-first ladder (playbook §3) · audited-write per D7 · forward-only
  migrations · per-contract audit declarations (RV-0152 call-1 rule) · call-13 ETag leg
  discipline · wired-only surface (out-of-wire System sweep stays out-of-wire).
- **Halt conditions:** any corpus conflict → Flag-and-Halt via Handoff Note · a needed audit
  action with no Doc-2 §9 near-pointer → Flag-and-Halt on `[ESC-IDN-AUDIT]` · **the §B.6 store:
  if Doc-6A §10.3 + Doc-6C §6.2 do not ground a concrete realization vehicle (table/shape) —
  Flag-and-Halt with a named handle proposal rather than coin a table** (the
  recovery_method/preferences fail-closed posture, RV-0152 precedent) · if the §B.6 leg proves
  larger than this packet's file envelope, STOP and hand back with a split proposal.
- **DB bootstrap:** `docker compose up -d db`. Commit discipline: checkpoint commits of ONLY
  W2-IDN-6.5 files (+ the two authorized user-account-slice fold touches),
  `feat(identity): W2-IDN-6.5 … [checkpoint]`,
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never touch coordinator governance
  files or the external frontend/motion working-tree changes.

## 6. EXPECTED OUTPUTS

- Completion Report per `governanceReviews/AI-Completion-Report-Template.md` at
  `governanceReviews/milestones/w2-idn-6.5/COMPLETION-REPORT.md` (§5 Events = "Zero — audited
  only, per frozen truth" · judgment-call log · discrimination statements per guard/leg ·
  §11 next gate = Review-A with **Team-6 = YES**).
- Checkpoint SHA · as-built route/method table vs Doc-5C §5 · the §B.6 store design grounding
  (exact frozen anchors) · 8C+8E + full-suite results vs 278/25 · ESC dispositions · self-check
  (`/ivendorz-security`-equivalent).

## Frozen Authority Checklist

Before execution, the assignee confirms:

□ All cited documents are frozen.
□ Every cited section has been re-read verbatim.
□ No draft document is treated as authority.
□ Any uncertainty results in Flag-and-Halt.
