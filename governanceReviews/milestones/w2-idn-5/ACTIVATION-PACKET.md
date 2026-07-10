# ACTIVATION PACKET — Agent M1 · W2-IDN-5

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.0). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat.*

## 0. Header
- **Role activated:**       Agent M1 — Identity & Organization (org plan §3 charter + M1 row)
- **Work item:**            `W2-IDN-5` — state machines (org · membership · users lifecycle) ·
                            WP defs: `docs/backend/backend_build_plan.md` §4 Stage B +
                            `backend_execution_playbook.md` §5
- **Priority / Lane:**      P2 · Lane G (lifecycle authority for every org/membership mutation)
- **Model class:**          **Opus** per dispatch-binding **E1** (frozen state machines)
- **Worktree:**             none · **Activation type:** FIRST (fresh context)
- **Date · Packet author:** 2026-07-09 · Orchestrator (Backend-Lead hat: yes)

## 1. TASK
- **Objective:** realize the org and membership state machines (transition matrices service-layer,
  DR-6-STATE), their service-layer guards — **Last-Owner Protection, ownership succession,
  "only `active` participates"** — the simple users lifecycle, and the two out-of-wire System
  timers (`activate_membership` · `expire_invitation`), every mutation an audited atomic write
  per the D7 canonical pattern.
- **In scope:**
  - **State machines (Doc-4M + Doc-2 §5.1/§5.2 — RE-READ VERBATIM; never trust a paraphrase,
    including this packet's):** org `active|suspended|soft_deleted` · membership
    `invited|pending|active|suspended|removed` · users simple lifecycle. Enums + CHECKs exist
    (IDN-1); this WP realizes the transition matrices in `domain/state-machines/` (the IDN-4
    delegation machine is the house shape — copy it). **Delegation machine = DONE (IDN-4): cite,
    never rebuild.**
  - **Guards (service-layer, each with a discriminating test):** Last-Owner Protection (the last
    Owner can never be removed/suspended/demoted out of existence — exact rule from the frozen
    text, not from memory) · ownership succession (transfer preconditions) · "only `active`
    participates" (non-active org/membership never satisfies participation predicates) · any
    §5.1/§5.2 co-conditions the frozen matrices attach to edges.
  - **System timers (out-of-wire):** `activate_membership` · `expire_invitation` — Inngest
    workers per the W2-CORE-2/IDN-4 conventions; invitation window POLICY-keyed via
    `core.config_value_query.v1` (`identity.*` keys are **unseeded until W2-IDN-7** — follow the
    IDN-4 validity-default precedent exactly: read the real key, test-scoped seed + sweep, never
    a literal fallback window without a frozen default).
  - **AUDITED WRITES (binding law):** every status mutation via `core.append_audit_record.v1`
    atomically in-transaction (copy `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md`);
    System timer mutations System-attributed (`actor_type=system`, IDN-4 sweep precedent); audit
    actions bind by pointer to Doc-2 §9 via the `[ESC-IDN-AUDIT]` channel convention — **never
    invent an action name**. Zero §8 events (M1 frozen truth).
  - **Doc-8:** 8E Doc-4M edge coverage (`CHK-8-040…042`) — every legal edge exercised, every
    illegal edge rejected-with-status-unchanged (the IDN-4 matrix-test idiom), guards
    discriminating-tested, timer sweeps scoped + idempotent + System-attributed, atomicity both
    rollback directions on at least one representative path per machine.
- **Out of scope:** the wired management API (`W2-IDN-6.x` — commands land on contracts only,
  if commands are needed at all beyond the timers; the §C4 wired faces like `transfer_ownership.v1`
  are 6.2's) · POLICY seed (`W2-IDN-7`) · delegation machine (done) · DC-1 cascade (§7.4,
  out-of-wire, 6.2's) · any M2–M9 surface.
- **Acceptance criteria:** matrices verbatim vs Doc-4M/Doc-2 §5.1/§5.2 (state your transcription
  in the report — reviewers re-derive independently) · Last-Owner Protection + succession +
  only-active-participates discriminating-tested · every write audit-atomic per D7 · timers
  active-scope-correct + idempotent · full suite green (**current baseline: 243 tests /
  23 files**, zero regressions) · tsc/ESLint/Prettier green · zero invented audit
  action/slug/state/event.

## 2. DOCUMENTS (pointers only)
1. `generatedDocs/` **Doc-4M** (state-machine authority) + **Doc-2 §5.1/§5.2** (org/membership
   machines + co-conditions) + Doc-2 §9 (audit actions — bind by pointer) — locate via
   `CORPUS_INDEX.md`.
2. `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` — the canonical audited write.
3. `docs/backend/backend_execution_playbook.md` §5 `W2-IDN-5` · `backend_build_plan.md` §4 ·
   `esc_registry.md` (the `ESC-IDN-*` rows).
4. IDN-4 precedents in-repo: `src/modules/identity/domain/state-machines/` (machine shape) ·
   `application/commands/expire-delegation-grants.command.ts` (System sweep shape) ·
   `tests/integration/delegation-grant-slice.test.ts` (matrix-test + POLICY-key idioms).
5. `project-management/ai-engineering-organization-plan.md` §3 (shared charter binds).

## 3. CONTRACTS
- `src/modules/identity/contracts/{services,types,index}.ts` — additive only if the timers or
  guards need a contract face; existing exports unbroken.

## 4. CODE (≤15 with §3)
- `src/modules/identity/{domain/state-machines,domain/policies,application/commands,infrastructure/data}/`
- `src/modules/core/contracts/` (READ-ONLY — audit + config services)
- `inngest/functions/` (the two timers + `index.ts` registration, W2-CORE-2 conventions)
- `tests/integration/` (new slice suite) · `tests/_harness/` (reuse)

## 5. CONSTRAINTS
- Standing charter binds. **Team-6 pre-flag: YES** (lifecycle authority + Last-Owner Protection =
  account-takeover/lockout surface). Self-run `/ivendorz-security`.
- Halt conditions: any Doc-4M vs Doc-2 §5.1/§5.2 edge mismatch → **Flag-and-Halt** (frozen-vs-
  frozen, the ESC-IDN-SLUGCOUNT precedent) · a needed audit action with no Doc-2 §9 near-pointer
  → Flag-and-Halt on `[ESC-IDN-AUDIT]` · an invitation-window default nowhere frozen →
  Flag-and-Halt rather than coin one.
- DB bootstrap: `docker compose up -d db`. Commit discipline: checkpoint commits of ONLY W2-IDN-5
  files, `feat(identity): W2-IDN-5 … [checkpoint]`,
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## 6. EXPECTED OUTPUTS
- Completion Report per `governanceReviews/AI-Completion-Report-Template.md` (§5 Events = "Zero —
  audited only, per frozen truth"; §6 discrimination statements; §11 next gate = Review-A with
  **Team-6 = YES**).
- Checkpoint SHA · 8E + full-suite results · ESC dispositions · your verbatim matrix
  transcriptions (for reviewer cross-derivation) · self-check results.
