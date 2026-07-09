# ACTIVATION PACKET — Agent M0 · W2-CORE-1

*Authored per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.0) — the first
operational activation under the AI Engineering Organization v1.0 (Board close RV-0142,
2026-07-09). Coordinator: AI Engineering Orchestrator, Backend-Lead hat.*

## 0. Header
- **Role activated:**       Agent M0 — Platform Core / Shared Kernel (charter: org plan §3 shared
                            charter + M0 row; shape-exception: infra-only, no business `domain/`)
- **Work item:**            `W2-CORE-1` — Config (POLICY) & feature-flag read services on
                            `contracts/` · WP definition: `docs/backend/backend_build_plan.md` §4
                            Stage A + `docs/backend/backend_execution_playbook.md` §4
- **Priority / Lane:**      P2 (planned wave work; first Wave-2 WP, DoR satisfied) · Lane G
                            (data-access surface → full review chain)
- **Model class:**          advanced (module implementation)
- **Worktree:**             none (single active builder; work on `wave/2-core-platform`)
- **Activation type:**      FIRST
- **Date · Packet author:** 2026-07-09 · Orchestrator (Backend-Lead hat: yes)

## 1. TASK
- **Objective:** expose `system_configuration` (POLICY) reads and `feature_flags` reads on M0
  `contracts/`, so every module reads POLICY values and flags **via M0's contract surface, never
  its own schema access** — realizing `W2-CORE-1` exactly as the Build Plan/Playbook define it.
- **In scope:**
  - `contracts/types.ts` + `contracts/services.ts` additions for the two read services (POLICY
    value read by key; feature-flag read by key/scope) with names/semantics bound **verbatim from
    Doc-4B** (e.g. `core.config_value_query.v1` — confirm the flag-read contract id in Doc-4B;
    never coin a name).
  - `infrastructure/data/` reader implementations over the existing `core.system_configuration` /
    `core.feature_flags` tables (own schema only), exported through `contracts/index.ts`.
  - Doc-8 **8B**-band tests (harness) proving both readers against the seeded 18 `core.*` POLICY
    keys + flag rows; existing suites stay green.
  - Checkpoint commit(s) at completion.
- **Out of scope:** outbox work (`W2-CORE-2`) and anything `[D-5]`-shadowed · any write service ·
  any migration or schema change (tables exist) · any HTTP `api/` route (these are out-of-wire
  infra services consumed by modules) · any event (M0 emits **zero** §8 events) · M1/identity
  files · the M0 conformance gate roll-up (`W2-CORE-3`).
- **Acceptance criteria:**
  1. Both read services exist on `contracts/` with Doc-4B-verbatim identifiers and semantics;
     reads respect Doc-6B §3.4/§3.5 (POLICY reads open per POLICY; **flags firewalled** —
     visibility semantics honored, no broader exposure than Doc-6B grants).
  2. No literal POLICY values anywhere — values come from the table via the service.
  3. **8B** harness tests green + full existing suite green (Wave-1 baseline 58/58 must not
     regress) on the real test Postgres (local ephemeral, per Build Plan §3 CI note).
  4. `tsc` / ESLint / Prettier green; zero `TODO`/dead code; zero `[ESC-*]` raised (or
     Flag-and-Halt if one becomes necessary).
  5. Build Artifact Checklist (infra-only shape) satisfied for the touched layers.

## 2. DOCUMENTS (pointers only — read the cited sections, not the whole docs)
1. `generatedDocs/Doc-4B_Content_v1.0_PassB.md` (+ PassA where PassB references it) — the M0
   contract surface; locate `config_value_query` / feature-flag read contract + semantics by
   search, transcribe identifiers verbatim.
2. `generatedDocs/Doc-6B_Content_v1.0_Pass2.md` §3.4 (`system_configuration`) · §3.5
   (`feature_flags`) — schema truth + visibility/firewall semantics.
3. `docs/backend/backend_execution_playbook.md` §1 (load-bearing Wave-2 facts: zero events,
   `[D-5]`/`[DC-1]`) · §2 (file-map) · §3 (build ladder) · §4 `W2-CORE-1`.
4. `docs/backend/backend_build_plan.md` §1 (governing constraints) · §4 Stage A `W2-CORE-1`.
5. `project-management/ai-engineering-organization-plan.md` §3 (Module-Agent shared charter —
   binds this activation).

## 3. CONTRACTS (own module — extend, never break existing exports)
- `src/modules/core/contracts/services.ts`
- `src/modules/core/contracts/types.ts`
- `src/modules/core/contracts/index.ts`

## 4. CODE (≤15 with §3; exact scope)
- `src/modules/core/infrastructure/data/` (new readers beside `audit-record.service.ts` /
  `human-reference.service.ts` — follow their established conventions)
- `src/modules/core/infrastructure/index.ts` · `src/modules/core/core.module.ts`
- `prisma/schema.prisma` (READ-ONLY reference — the `core` models; no edits)
- `tests/_harness/` (READ to reuse) · `tests/integration/` + `tests/unit/` (add the 8B suites)

## 5. CONSTRAINTS
- **Standing charter binds** (org plan §3): own module only · no cross-module/schema access · no
  invention of any contract id, POLICY key, event, or audit action · Flag-and-Halt on corpus
  conflict.
- **Open gates on adjacent scope:** `[D-5]` (outbox audit granularity) and `[DC-1]` (no
  core/identity events) are **not** in this WP — if this task appears to need either, STOP and
  suspend via Handoff Note.
- **Task-specific:** infra-only shape (no `domain/`, no `application/` unless Doc-4B demands
  orchestration — readers are expected to be thin `infrastructure/data/` + contract facades) ·
  reads are not audited (only writes are) · bind the 18 `core.*` POLICY keys by pointer (seeded;
  never re-seed, never coin key #19).
- **Commit discipline:** checkpoint commit(s) on `wave/2-core-platform` containing **only
  W2-CORE-1 files**, message `feat(core): W2-CORE-1 <what> [checkpoint]`; final state = one named
  checkpoint SHA.
- **Security pre-flag: Team-6 = YES** (data-visibility surface — firewalled flag reads). Self-run
  the `/ivendorz-security` checklist (`.claude/skills/ivendorz-security-checklist/SKILL.md`)
  before handoff; record results in the report §7.
- **Halt condition:** any conflict between Doc-4B/Doc-6B and this packet or the playbook →
  Flag-and-Halt (cite both sources verbatim in the Handoff Note); never resolve locally.

## 6. EXPECTED OUTPUTS
- **Completion Report** per `governanceReviews/AI-Completion-Report-Template.md` — all 12
  sections, explicit "None"/"Zero" where applicable (§5 Events must read "Zero — frozen truth:
  M0 emits no §8 events").
- Checkpoint SHA on `wave/2-core-platform` · suite results (8B + full run) · self-check results.
- Next gate per report §11: Review-A, with Team-6 pre-flagged YES.
