# ACTIVATION PACKET — Agent M1 · W2-IDN-6.3

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.1). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat.*

## 0. Header

- **Role activated:**       Agent M1 — Identity & Organization (charter: org plan §3 shared charter + M1 row)
- **Work item:**            `W2-IDN-6.3` — Wired API · Membership (§5, 5 contracts) · WP defs:
                            `docs/backend/backend_build_plan.md` §4 Stage B + `backend_execution_playbook.md`
                            §5 (corrected IDN-6 header + 6.3 row)
- **Depends on:**           `W2-IDN-3` ✅ · `W2-IDN-5` ✅ (membership machine + timers + FOR-UPDATE
                            resolver, RV-0150) · `W2-IDN-6.2` ✅ closed `e3eea59`/`7186caa` (RV-0155 —
                            org wires + serialization precedents live) · `W2-IDN-6.5` review-complete
                            (§B.6 store live) — gates checked per org plan §5 ③
- **Priority / Lane:**      P2 · Lane G
- **Model class:**          advanced (Last-Owner surface under concurrency — the empty-lock-set WP)
- **Worktree:**             none · **Activation type:** FIRST (fresh context)
- **Date · Packet author:** 2026-07-10 · Orchestrator (Backend-Lead hat: yes)
- **Packet-size attestation:** 5 document pointer rows / ~10 distinct files · §3+§4 entries: 13 ·
                            est. input ~19k tokens — within limits: **YES** (dual count per v1.1)

## 1. TASK

- **Objective:** wire the five §5 Membership contracts on their frozen routes as audited,
  §B.6-deduped writes — with the Last-Owner-guarded legs serialized through the FOR-UPDATE
  resolver and the **empty-lock-set premise honored as a Flag-and-Halt trigger**.

- **In scope:**
  - **5 wired contracts (verbatim ids/methods from playbook §5 6.3 row; routes/registers from
    Doc-5C §5 + Doc-4C's Membership sub-domain section — RE-READ VERBATIM, locate the exact §
    via `CORPUS_INDEX.md`):** `invite_member.v1` POST·C · `accept_invitation.v1` POST·C ·
    `set_membership_status.v1` POST·C · `remove_member.v1` POST·C · `revoke_invitation.v1`
    POST·C. Actor scope: **active-org** (playbook row note).
  - **THE LOAD-BEARING OBLIGATION (RV-0150 + RV-0155 O1):** derive the Last-Owner-guarded
    command set from the FROZEN text (candidates: `remove_member` and any
    `set_membership_status` leg that can remove/suspend/demote an Owner out of acting
    existence — four packet candidate-lists have dissolved under verbatim re-read this wave;
    derive, don't trust this one). Every guarded command: own tx → the FOR-UPDATE resolver
    (`resolveOwnerRemovalFacts`) with post-lock fact re-reads + a discriminating race probe
    (the RV-0150 idiom; the 6.2 transfer/recovery probes are the house shapes).
    **Flag-and-Halt trigger (the resolver's PREMISE block, `membership-lifecycle.repository.ts`):
    the FOR-UPDATE serialization presumes a non-empty lock set — if ANY realization choice in
    this WP could produce a live org with ZERO active-Owner membership rows, STOP and hand back**
    (that premise carries the recovery path's safety; RV-0155 O1).
  - **State machine + timers:** membership edges via the IDN-5 `membership.state-machine.ts` —
    cite, never rebuild; the `activate_membership`/`expire_invitation` System timers exist
    (IDN-5) — the wires must compose with them, never duplicate their edges. Doc-2 §5.2
    verbatim governs which edge each contract drives (incl. what `accept_invitation` targets
    and `pending`'s frozen behavior).
  - **§B.6 dedup:** Idempotency-Key mandatory; deps = REQUIRED-field shape (RV-0153 OBS-2);
    claim leg on any create-class command per the RV-0153 F2 pattern (derive which — likely
    `invite_member`); window keys per each contract's frozen declaration (unseeded until
    IDN-7 — test-scoped-seed precedent).
  - **Wire mechanics:** audited per each contract's frozen Audit declaration (never a blanket);
    If-Match/ETag ONLY where `Concurrency: optimistic` is frozen-declared; ETag call-13 leg
    discipline; non-disclosure collapse on non-party targets; invitation flows must not
    disclose invitee existence beyond the frozen surface.
  - **Context (RV-0155 OBS-Δ2, carried context):** transfer-to-dormant-owner is a
    frozen-conformant residual governed by recovery — do NOT add unfrozen conjuncts to
    membership legs to "fix" it; realize exactly the frozen text.
  - **Doc-8:** 8C (registers · idempotency/replay · actor-scope · non-disclosure) + 8E
    (membership edges + Last-Owner guards discriminating-tested incl. the race shapes).

- **Out of scope:** context/active-org contracts (6.6 — incl. suspended-org live-path denial,
  the RV-0150 OBS-B1 carry) · roles (6.4) · POLICY seed (IDN-7) · machine changes · any
  M2–M9 surface · any identity event (`[DC-1]`; the invite notification fan-out has NO §8
  emitter — Flag-and-Halt if a wire seems to need one).

- **Acceptance criteria:** 5 contracts on frozen routes/registers (as-built table) · guarded
  set frozen-derived with serialization + race probes (exactly-one-wins; never ownerless) ·
  machine/timers consumed · §B.6 required-deps + claim leg · per-contract audit declarations,
  zero invented tokens · byte-identical 404 collapse · full suite green — **baseline at
  dispatch: 323 tests / 27 files** · tsc/ESLint/Prettier green.

- **Binding carries (inbound):**
  | Source | Obligation | Class |
  |---|---|---|
  | RV-0150 close + RV-0155 O1 | serialization contract on the guarded set + **the empty-lock-set premise as a Flag-and-Halt trigger** | acceptance-criterion |
  | RV-0153 OBS-2 | §B.6 deps = REQUIRED-field `idempotencyKey` on every new composition | acceptance-criterion |
  | `ESC-WIRE-FIELD-CASING` (🟥 owner-pending) | build result payloads in the ratified house shape; log as carried in report §8 | carried handle |
  | RV-0155 OBS-Δ2 | dormant-owner residual = recovery-governed; no unfrozen membership conjuncts | boundary context |
  | RV-0147 B8 lineage | staff-space never via org roles — applies only if any leg is Admin-scoped (derive from frozen text) | conditional |

  No further carries: OBS-B1 binds 6.6; the comment one-liners bind the next command touch
  (fold them if you touch those files anyway — disclose if so). Checked, not omitted.

## 2. DOCUMENTS (pointers only — ≤5 rows; every FROZEN pointer: RE-READ VERBATIM — never trust a paraphrase, including this packet's)

1. Doc-4C — the Membership sub-domain section (5 contracts: fields, registers, Audit +
   Concurrency + Idempotency declarations, actor scopes) + Doc-2 §5.2 (membership machine +
   co-conditions) + §9 (audit actions by pointer) — locate via `generatedDocs/CORPUS_INDEX.md`.
2. Doc-5C §5 (the 5 membership route rows) + §4.3 + Doc-5A §6.2/§9.2/§9.5 + Doc-4A
   §9/§11.2/§14.3 — via `CORPUS_INDEX.md`.
3. Master Architecture §5.5 (Last-Owner law) + Doc-4M membership rows (as patched v1.0.1) —
   via `CORPUS_INDEX.md`.
4. `docs/backend/backend_execution_playbook.md` §5 (corrected header + 6.3 row) · §8 + the
   RV-0150/0153/0155 close entries in `project-management/review-log.md` (carry provenance —
   esp. the RV-0155 O1 premise + OBS-Δ2 paragraphs).
5. `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` + in-repo precedents: the IDN-5
   membership set (`membership.state-machine.ts` · `activate-membership.command.ts` ·
   `expire-invitations.command.ts` · `last-owner-protection.policy.ts` +
   `membership-lifecycle.repository.ts` [the PREMISE block]) + the 6.2 wired compositions
   (transfer/soft-delete = guarded-command shapes; the org wire slice race probes = test idiom)
   + the 6.5 §B.6 primitives (`src/server/identity/command-dedup.ts`).

## 3. CONTRACTS
- `src/modules/identity/contracts/{services,types,index}.ts` — additive only; existing exports unbroken.
- Consumed: `src/modules/core/contracts/` — **consume only, never edit**.

## 4. CODE (§3+§4 ≤15 entries)
- `src/modules/identity/application/commands/` (5 new/extended) · `domain/` (consume) ·
  `infrastructure/data/` (membership repository legs)
- `src/modules/identity/api/` + `app/api/identity/` + `src/server/identity/` (5 wired faces;
  house shape) · `src/server/context/` + `src/server/authz/` (consume) · `src/shared/http/` (consume)
- `prisma/` — NO migration expected; Flag-and-Halt if one seems needed
- `tests/integration/` (new membership wire slice) · `tests/_harness/` (reuse)

## 5. CONSTRAINTS
- **Standing charter binds.** **Team-6 pre-flag: YES** — member-removal/lockout + Last-Owner
  under concurrency + invitation lifecycle (invitee-existence non-disclosure) + replay surface.
- **Open gates/ESC:** `[DC-1]` — zero identity events (invite fan-out has NO emitter; the
  notification leg stays unbuilt — Flag-and-Halt if a wire needs it) · `[ESC-IDN-AUDIT]`
  near-pointers only · `ESC-WIRE-FIELD-CASING` carried · POLICY keys unseeded until IDN-7.
- **Task-specific:** contract-first ladder · D7 audited writes · per-contract declarations ·
  truthful comments (the F-B1 lens) · **probes must be interleave-real** (the RV-0155 F-B1
  lesson: no sleep-offset race probes — gate every step on an observed state; the 6.2 rebuilt
  probe is the house shape).
- **Halt conditions:** corpus conflict · audit action without near-pointer · apparent need for
  a migration or event · **any path to a live org with zero active-Owner rows** → Flag-and-Halt
  via Handoff Note; never resolve locally.
- **DB bootstrap:** `docker compose up -d db`. Commit discipline: ONLY W2-IDN-6.3 files,
  `feat(identity): W2-IDN-6.3 … [checkpoint]`,
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never touch coordinator governance
  files or external working-tree changes.

## 6. EXPECTED OUTPUTS
- Completion Report (v1.1 template) at `governanceReviews/milestones/w2-idn-6.3/COMPLETION-REPORT.md` —
  judgment-call log (log EVERY call), as-built route table, guarded-set derivation with verbatim
  citations, serialization evidence, discrimination statements, ESC dispositions, §11 next gate =
  Review-A with **Team-6 = YES**.
- Checkpoint SHA · 8C+8E + full-suite results vs 323/27 · self-check.

## Frozen Authority Checklist
□ All cited documents are frozen.
□ Every cited section has been re-read verbatim.
□ No draft document is treated as authority.
□ Any uncertainty results in Flag-and-Halt.
