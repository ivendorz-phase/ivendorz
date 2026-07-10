# ACTIVATION PACKET — Agent M1 · W2-IDN-6.6

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.1). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat.*

## 0. Header

- **Role activated:**       Agent M1 — Identity & Organization (charter: org plan §3 shared charter + M1 row)
- **Work item:**            `W2-IDN-6.6` — Wired API · Context/Active-Org (§6, 3 contracts) · WP defs:
                            `docs/backend/backend_build_plan.md` §4 Stage B + `backend_execution_playbook.md`
                            §5 (corrected IDN-6 header + 6.6 row)
- **Depends on:**           `W2-IDN-3` ✅ (check_permission + active-org resolution wire) · `W2-IDN-5` ✅
                            (org/membership machines) · `W2-IDN-6.2` ✅ closed (org status wires) ·
                            `W2-IDN-6.3` ✅ closed (membership wires) — gates checked per org plan §5 ③
- **Priority / Lane:**      P2 · Lane G
- **Model class:**          advanced (the suspended-org denial obligation — a live-path authz gate)
- **Worktree:**             none · **Activation type:** FIRST (fresh context)
- **Date · Packet author:** 2026-07-10 · Orchestrator (Backend-Lead hat: yes)
- **Packet-size attestation:** 5 document pointer rows / ~9 distinct files · §3+§4 entries: 12 ·
                            est. input ~18k tokens — within limits: **YES** (dual count per v1.1)

## 1. TASK

- **Objective:** wire the three §6 Context/Active-Org contracts on their frozen routes — the
  active-org switcher (a command that re-resolves org context) + two dual/self reads — and land
  the **RV-0150 OBS-B1 suspended-org-denies obligation** WITH its discriminating live-path test.

- **In scope:**
  - **3 wired contracts (verbatim ids/methods from playbook §5 6.6 row; routes/registers from
    Doc-5C §6 + Doc-4C's Context sub-domain section — RE-READ VERBATIM, locate the exact § via
    `CORPUS_INDEX.md`; SIX packet paraphrases have dissolved this wave — cite the exact frozen
    line for actor-scope/register claims, derive don't assume):** `switch_active_organization.v1`
    POST·C · `get_active_context.v1` GET·Q · `list_my_organizations.v1` GET·Q.
  - **THE BINDING OBLIGATION (RV-0150 OBS-B1 — the reason this WP exists as a gate):** wiring org
    context per §C11 "org not suspended" MUST land WITH a discriminating integration test — a
    caller switching to / operating under a **suspended org → DENY through the LIVE
    check_permission / context-resolution path** (today `org_status` is enforced only at the
    delegation controlling-org read + the IDN-5 activate precondition; this WP makes the
    active-org switch itself honor it). Derive the exact precondition from the frozen §C11 /
    Doc-2 §C6/§C11 verbatim — which org states may become active context, and what the switcher
    rejects. The test must fail-closed: switch-to-suspended → the frozen reject register, nothing
    persisted; and confirm the resolved context downstream cannot treat a suspended org as active.
  - **The switcher (§7C seam):** `switch_active_organization` re-resolves org context — it must
    validate the target membership is active AND the target org is a permitted state, server-side
    (client-supplied org id NEVER trusted — Invariant #5). Audited per its frozen Audit
    declaration; §B.6-deduped (required-field deps, RV-0153 OBS-2; claim leg if it is create-class
    — derive) via `core.config_value_query.v1` window key (unseeded until IDN-7 — test-scoped seed).
  - **The two reads:** `get_active_context` (self — the current resolved context) +
    `list_my_organizations` (self — the caller's org memberships); scope each to exactly what the
    frozen text authorizes (self only; no cross-user disclosure); reads UNAUDITED; non-disclosure
    collapse where applicable; pagination fail-closed if `list_my_organizations` paginates
    (the ESC-IDN-LIST-PAGESIZE class — carry, don't coin a bound).
  - **Wire mechanics:** If-Match/ETag ONLY where `Concurrency: optimistic` is frozen-declared
    (the switcher likely has none — verify); interleave-real probes if any concurrency test is
    needed (the RV-0155 F-B1 lesson — lock-waiter observation, no sleep-offset).
  - **Doc-8:** 8C (registers · idempotency · actor-scope · non-disclosure) + 8E (the
    suspended-org denial edge + active-context state coverage discriminating-tested).

- **Out of scope:** other IDN-6 sub-domains · POLICY seed (IDN-7) · machine changes (IDN-5
  authority) · any M2–M9 surface · any identity event (`[DC-1]`). The DC-1 cascade / notification
  effects stay out-of-wire. Additions = Review-A finding.

- **Acceptance criteria:** 3 contracts on frozen routes/registers (as-built table) · **the
  suspended-org denial landed WITH a discriminating live-path test (RV-0150 OBS-B1 discharged) —
  switch-to-suspended fail-closed through check_permission/context resolution, nothing persisted** ·
  switcher server-validates target (Invariant #5, no client-trusted org) · reads self-scoped,
  unaudited · §B.6 required-deps · per-contract audit declarations, zero invented tokens ·
  byte-identical collapse on non-party · full suite green — **baseline at dispatch: 347 tests /
  29 files** · tsc/ESLint/Prettier green.

- **Binding carries (inbound):**
  | Source | Obligation | Class |
  |---|---|---|
  | RV-0150 OBS-B1 (via the 6.2/6.3 carries + tracker 6.6 row) | wiring org context (§C11 "org not suspended") lands WITH a discriminating suspended-org-denies live-path test | acceptance-criterion (THE gate) |
  | RV-0153 OBS-2 | §B.6 deps = REQUIRED-field `idempotencyKey` on the new composition | acceptance-criterion |
  | `ESC-WIRE-FIELD-CASING` (🟥 owner-pending) | build result payloads in the ratified house shape; log as carried in report §8 | carried handle |
  | `ESC-IDN-LIST-PAGESIZE` (🟠) | if `list_my_organizations` paginates, fail-closed pagination (no coined bound) | conditional carry |
  | RV-0155 F-B1 lesson | any concurrency probe interleave-real (lock-waiter observation, no sleep-offset) | method constraint |

  No further carries: the ownership serialization contract binds only Last-Owner-guarded commands
  (none here). Checked, not omitted.

## 2. DOCUMENTS (pointers only — ≤5 rows; every FROZEN pointer: RE-READ VERBATIM — never trust a paraphrase, including this packet's)

1. Doc-4C — the Context/Active-Org sub-domain section (3 contracts: fields, registers, Audit +
   Concurrency + Idempotency declarations, actor scopes) + §C11 (the "org not suspended" active-
   context precondition) + Doc-2 §9 (audit actions by pointer) — locate via `CORPUS_INDEX.md`.
2. Doc-2 §5.1 (org states — which may be active context) + §C6/§C11 (context resolution rules) +
   Doc-7C §3.2 (the active-org resolution seam / `ensureProvisioned`) — via `CORPUS_INDEX.md`.
3. Doc-5C §6 (the 3 context route rows) + §4.3 + Doc-5A §6.2/§9.2 + Doc-4A §9/§11.2 — via `CORPUS_INDEX.md`.
4. `docs/backend/backend_execution_playbook.md` §5 (corrected header + 6.6 row) · §8 + the
   RV-0150 close entry in `project-management/review-log.md` (the OBS-B1 obligation verbatim) +
   the RV-0152…RV-0157 close entries (the §B.6 + interleave-real lessons).
5. `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` + in-repo precedents:
   `src/server/context/{active-org,with-active-org}.ts` + `src/server/context/index.ts` (the
   resolution seam this WP wires the switch onto) + `src/server/authz/` (check_permission) +
   the 6.2/6.3 wired compositions (house shape) + the 6.5 §B.6 primitives
   (`src/server/identity/command-dedup.ts`).

## 3. CONTRACTS
- `src/modules/identity/contracts/{services,types,index}.ts` — additive only; existing exports unbroken.
- Consumed: `src/modules/core/contracts/` — **consume only, never edit**.

## 4. CODE (§3+§4 ≤15 entries)
- `src/modules/identity/application/commands/` (the switch command) · `application/queries/`
  (2 reads) · `domain/` (consume org/membership machines + the context precondition policy —
  no rebuild) · `infrastructure/data/` (context/membership repository legs)
- `src/modules/identity/api/` + `app/api/identity/` + `src/server/identity/` (3 wired faces) ·
  `src/server/context/` (the active-org resolution seam — wire the switch; verify the
  suspended-org denial is honored HERE, the live path) · `src/server/authz/` (consume)
- `prisma/` — NO migration expected; Flag-and-Halt if one seems needed
- `tests/integration/` (new context wire slice + the OBS-B1 discriminating test) · `tests/_harness/` (reuse)

## 5. CONSTRAINTS
- **Standing charter binds.** **Team-6 pre-flag: YES** — active-org context is the tenant-boundary
  authority (Invariant #5 Users-Act-Orgs-Own); a suspended-org context bypass or a client-trusted
  org switch = a tenant-isolation breach.
- **Open gates/ESC:** `[DC-1]` — zero identity events · `[ESC-IDN-AUDIT]` near-pointers only ·
  `ESC-WIRE-FIELD-CASING` carried · `ESC-IDN-LIST-PAGESIZE` conditional carry · POLICY keys
  unseeded until IDN-7.
- **Task-specific:** contract-first ladder · D7 audited write (the switch) / reads unaudited ·
  per-contract declarations · truthful comments (F-B1 lens) · interleave-real probes ·
  **the suspended-org denial is the gate — it MUST be live-path (through check_permission /
  context resolution), not a shadow check in the command; derive the precondition from §C11
  verbatim**.
- **Halt conditions:** corpus conflict · audit action without a §9 near-pointer · apparent need
  for a migration or event · any ambiguity in the §C11 active-context precondition (which org
  states are permitted) that the frozen text does not resolve → Flag-and-Halt via Handoff Note;
  never resolve locally.
- **DB bootstrap:** `docker compose up -d db`. Commit discipline: ONLY W2-IDN-6.6 files,
  `feat(identity): W2-IDN-6.6 … [checkpoint]`,
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never touch coordinator governance
  files or external working-tree changes (buyer-rfq/frontend/motion/trust-ladder/confidentiality).

## 6. EXPECTED OUTPUTS
- Completion Report (v1.1 template) at `governanceReviews/milestones/w2-idn-6.6/COMPLETION-REPORT.md` —
  judgment-call log (EVERY call), as-built route table, **the §C11 active-context precondition
  derivation with verbatim citations + the OBS-B1 suspended-org-denies discrimination evidence
  (the live path proven)**, ESC dispositions, §11 next gate = Review-A with **Team-6 = YES**.
- Checkpoint SHA · 8C+8E + full-suite results vs 347/29 · self-check.

## Frozen Authority Checklist
□ All cited documents are frozen.
□ Every cited section has been re-read verbatim.
□ No draft document is treated as authority.
□ Any uncertainty results in Flag-and-Halt.
