# ACTIVATION PACKET — Agent M0 · W2-CORE-2

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.0). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat. Packet-gap fixes from W2-CORE-1 folded: real baseline
figure, DB bootstrap step, Doc-4A pointer.*

## 0. Header
- **Role activated:**       Agent M0 — Platform Core (org plan §3 charter + M0 row; infra-only)
- **Work item:**            `W2-CORE-2` — Outbox dispatch hardening + Inngest wiring · WP defs:
                            `docs/backend/backend_build_plan.md` §4 + `backend_execution_playbook.md` §4
- **Priority / Lane:**      P2 · Lane G (event infrastructure → full A+B chain; Team-6: see §5)
- **Model class:**          advanced → **escalated to Opus-class** per
                            `governanceReviews/BOARD-DISPATCH-BINDING-ADDENDUM_v1.0.md` trigger E2
                            (outbox-event seam)
- **Worktree:**             none (single active builder on `wave/2-core-platform`)
- **Activation type:**      FIRST
- **Date · Packet author:** 2026-07-09 · Orchestrator (Backend-Lead hat: yes)

## 1. TASK
- **Objective:** harden the outbox lifecycle `pending → dispatched → archived` and wire it to
  Inngest as the real event pump, realizing `core.phase2_dispatch_outbox_events.v1` and
  `core.phase2_archive_dispatched_events.v1` per Doc-4B §B6 — **dispatch mechanics only** (the
  audit-granularity leg is `[D-5]` Board-gated and lands with that ruling).
- **In scope:** confirm the existing atomic emit path (`core.write_outbox_event.v1`) untouched ·
  dispatcher realization in `src/modules/core/infrastructure/events/` (extend/replace the existing
  `drain-outbox.service.ts` as Doc-4B §B6 requires — status transition = dedup guard) · Inngest
  wiring (`inngest/functions/dispatch-outbox.ts`) · retry with backoff + max attempts driven by
  the POLICY keys **read via the W2-CORE-1 `core.config_value_query.v1` service, never literals**
  (`core.outbox_dispatch_backoff` · `core.outbox_dispatch_max_attempts` — confirm exact key names
  against the seeded 18; bind by pointer) · dead-letter park (never silently dropped) ·
  reconciliation sweep re-enqueuing stuck `pending` · Doc-8 **8B** outbox-observer tests
  (dispatch + distinct archival) + **8F** write-plus-emit atomicity foundation.
- **Out of scope:** the `[D-5]` audit-granularity leg (per-event OR batch audit of dispatch runs —
  **do not build either**; if the mechanics seem to require it, Flag-and-Halt) · any consumer ·
  any §8 event *definition* (M0 transports, never authors events) · M1 · HTTP surface · schema
  change (unless Doc-4B §B6 mechanics strictly require an additive column — expected NO; if yes,
  Flag-and-Halt first).
- **Acceptance criteria:** Doc-4B §B6 worker semantics realized verbatim (at-least-once,
  idempotent-consumer posture, status-transition dedup, backoff/max-attempts from POLICY,
  dead-letter park, reconciliation) · 8B observer green (dispatch and archival distinctly
  observed) · 8F atomicity foundation green · full suite green (**current baseline: 90 tests /
  14 files** — zero regressions) · tsc/ESLint/Prettier green · zero `[ESC-*]` or properly halted.

## 2. DOCUMENTS (pointers only)
1. `generatedDocs/Doc-4B_Content_v1.0_PassB.md` §B6 (outbox mechanics — the authority; transcribe
   worker ids/semantics verbatim; PassA + Doc-4A only where §B6 references them).
2. `generatedDocs/Doc-2_*` §8 (outbox rule; event catalog is downstream reference only).
3. `docs/backend/backend_execution_playbook.md` §1 (facts 4–5: outbox + `[D-5]`) · §4 `W2-CORE-2`.
4. `docs/backend/backend_build_plan.md` §4 Stage A `W2-CORE-2` (+ §1 constraints).
5. `project-management/ai-engineering-organization-plan.md` §3 (shared charter binds).

## 3. CONTRACTS
- `src/modules/core/contracts/{services,types,index}.ts` (extend for the two workers ONLY if
  Doc-4B §B6 places them on the contract surface — check; workers may be internal
  infrastructure + Inngest entry, not contract facades. Follow §B6, not habit.)

## 4. CODE (≤15 with §3)
- `src/modules/core/infrastructure/events/` (existing `drain-outbox.service.ts`, `index.ts`)
- `inngest/` (existing tree — follow its conventions; `inngest/functions/dispatch-outbox.ts`)
- `src/modules/core/infrastructure/data/system-configuration.service.ts` (READ-ONLY — consume via
  contract)
- `prisma/schema.prisma` (READ-ONLY — `outbox_events` model) · `prisma/migrations/20260627183528_core_init/migration.sql` (READ-ONLY — outbox DDL + POLICY seed truth)
- `tests/_harness/` (reuse) · `tests/integration/` + `tests/unit/` (add 8B/8F suites)

## 5. CONSTRAINTS
- Standing charter binds (org plan §3). Zero §8 event *authorship*; M0 transports envelopes only.
- **`[D-5]` is the live gate on this WP's edges:** build dispatch/archive/retry/dead-letter/
  reconciliation mechanics; NO audit leg of any granularity. A mechanics decision that cannot be
  made without knowing the audit granularity → Flag-and-Halt via Handoff Note.
- POLICY bounds via `core.config_value_query.v1` — never literals, never a coined key.
- **Team-6 pre-flag: N/A — no security surface** (no auth/authz/org-context/RLS/private-data/
  external-input/secret/firewalled-signal change). **Re-flag condition:** if the implementation
  adds payload logging, payload exposure beyond the transport envelope, or any external-input
  surface, the Completion Report §11 MUST re-flag Team-6 = YES with the surface named.
- **DB bootstrap:** ephemeral Postgres via `docker compose up -d db` (Docker Desktop may need
  starting); suites run locally (WP-1.9 CI parked).
- Commit discipline: checkpoint commit(s) of ONLY W2-CORE-2 files, `feat(core): W2-CORE-2 …
  [checkpoint]`, ending `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Halt condition: any Doc-4B §B6 ↔ playbook/plan conflict → Flag-and-Halt, cite both verbatim.

## 6. EXPECTED OUTPUTS
- Completion Report per `governanceReviews/AI-Completion-Report-Template.md` (all sections;
  explicit None/Zero; §5 Events = "Zero authored — transport only"; §11 next gate = Review-A,
  Team-6 N/A unless re-flagged).
- Checkpoint SHA · 8B/8F + full-suite results · self-check (`/ivendorz-security` still self-run —
  its cross-module and immutability points apply even on a non-security-surfaced WP).
