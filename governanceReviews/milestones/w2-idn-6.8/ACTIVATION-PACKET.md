# ACTIVATION PACKET — Agent M1 · W2-IDN-6.8

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.1). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat.*

## 0. Header

- **Role activated:**       Agent M1 — Identity & Organization (charter: org plan §3 shared charter + M1 row)
- **Work item:**            `W2-IDN-6.8` — Wired API · Workflow-Settings (§6, 2 contracts) · WP defs:
                            `docs/backend/backend_build_plan.md` §4 Stage B + `backend_execution_playbook.md`
                            §5 (corrected IDN-6 header + 6.8 row)
- **Depends on:**           `W2-IDN-1` ✅ (`organization_workflow_settings` table + RLS) · `W2-IDN-3` ✅
                            (authz wire) · `W2-CORE-1` ✅ (`core.config_value_query.v1` POLICY read) ·
                            `W2-IDN-6.2` ✅ closed (org wires) · `W2-IDN-6.6` ✅ closed `c53c531`
                            (context/active-org — the last-closed sibling) — gates checked per org plan §5 ③
- **Priority / Lane:**      P2 · Lane G
- **Model class:**          medium (2 contracts, no ownership/last-owner surface; the risk is the
                            governance-signal firewall + POLICY-bounded validation)
- **Worktree:**             none · **Activation type:** FIRST (fresh context)
- **Date · Packet author:** 2026-07-10 · Orchestrator (Backend-Lead hat: yes)
- **Packet-size attestation:** 5 document pointer rows / ~8 distinct files · §3+§4 entries: 11 ·
                            est. input ~17k tokens — within limits: **YES** (dual count per v1.1)

## 1. TASK

- **Objective:** wire the two §C11 Workflow-Settings contracts on their frozen routes — a
  POLICY-bounded settings update + its read — writing **no governance signal**, with bounds
  resolved from `core.config_value_query.v1` (never a hardcoded literal).

- **In scope:**
  - **2 wired contracts (verbatim ids/methods from playbook §5 6.8 row; routes/registers from
    Doc-5C §6 + Doc-4C §C11 — RE-READ VERBATIM, locate the exact § via `CORPUS_INDEX.md`;
    NOTE Doc-4C §C11 = "Organization Workflow Settings" (PassB:699) — the 6.6 builder verified
    Context is §C8 and §C11 is THIS sub-domain, so the label is correct here):**
    `update_workflow_settings.v1` PATCH·C · `get_workflow_settings.v1` GET·Q. Actor scope:
    active-org (derive from §C11 verbatim — who may read vs write workflow settings).
  - **POLICY-bounded validation (the core discipline):** the writable settings fields' bounds/
    allowed values come from `core.config_value_query.v1` (the POLICY keys are M8/config-owned —
    derive which keys §C11 references; unseeded until W2-IDN-7 → follow the IDN-4/IDN-5
    precedent: read the REAL key, test-scoped seed, **never a literal fallback bound**). A
    supplied value outside the POLICY bound → the frozen VALIDATION register; if §C11 references
    a POLICY key that is not registered anywhere → Flag-and-Halt (the ESC-IDN-* fail-closed
    precedent), never coin a bound.
  - **THE FIREWALL (binding — Golden Rule 3 / Invariant #6):** `update_workflow_settings`
    **writes NO governance signal** (no Trust/Performance/Financial-Tier/Capacity touch — those
    are M5/M2-owned and auto-calculated under System). Workflow settings are org-operational
    config, not a signal. Verify the write touches only `organization_workflow_settings` and
    emits zero cross-signal effect; a discriminating test that the write leaves every governance
    signal untouched.
  - **Wire mechanics:** audited per the frozen §C11 Audit declaration (verify — likely audited
    as an org-config change; bind the action by Doc-2 §9 near-pointer, never invent); §B.6-deduped
    (required-field deps, RV-0153 OBS-2; the PATCH is not create-class — replay-lookup + the
    `updated_at` CAS is the guard, no claim leg — derive from §C11); If-Match/ETag ONLY if §C11
    declares `Concurrency: optimistic` (verify — the org-profile PATCH did; check this one);
    ETag call-13 leg discipline; the read is self/active-org-scoped + UNAUDITED; non-disclosure
    collapse on cross-org.
  - **Doc-8:** 8C (registers · idempotency · actor-scope · non-disclosure · POLICY-bounded
    validation) + 8E (the governance-signal firewall discriminating-tested).

- **Out of scope:** other IDN-6 sub-domains · POLICY seed (IDN-7 — you CONSUME the config read,
  the keys are seeded there) · machine changes · any M2–M9 surface · any governance signal write
  (firewall) · any identity event (`[DC-1]`). Additions = Review-A finding.

- **Acceptance criteria:** 2 contracts on frozen routes/registers (as-built table) · **POLICY-
  bounded validation via `core.config_value_query.v1`, no literal fallback bound (the real key
  read; Flag-and-Halt if a referenced key is unregistered)** · **the governance-signal firewall
  discriminating-tested (the write touches no Trust/Performance/Tier/Capacity signal)** · audited
  per §C11 declaration, zero invented tokens · read self-scoped/unaudited · byte-identical
  collapse on cross-org · full suite green — **baseline at dispatch: 363 tests / 30 files** ·
  tsc/ESLint/Prettier green.

- **Binding carries (inbound):**
  | Source | Obligation | Class |
  |---|---|---|
  | CLAUDE.md §4 firewall / Invariant #6 | `update_workflow_settings` writes NO governance signal — discriminating-tested | acceptance-criterion |
  | W2-CORE-1 close (POLICY read live) | bounds via `core.config_value_query.v1`, real key, no literal fallback (IDN-4/IDN-5 precedent) | acceptance-criterion |
  | RV-0153 OBS-2 | §B.6 deps = REQUIRED-field `idempotencyKey` on the new composition | acceptance-criterion |
  | `ESC-WIRE-FIELD-CASING` (🟥 owner-pending) | build result payloads in the ratified house shape; log as carried in report §8 | carried handle |
  | RV-0155 F-B1 / RV-0158 F1+F-B1 lessons | truthful comments (no false invariant); any concurrency probe interleave-real | method constraint |

  No further carries: no ownership/last-owner surface here; the suspended-context residual binds
  nothing new (§C11 is active-org-scoped like every write). Checked, not omitted.

## 2. DOCUMENTS (pointers only — ≤5 rows; every FROZEN pointer: RE-READ VERBATIM — never trust a paraphrase, including this packet's — the wave has dissolved 7 packet paraphrases; cite the exact frozen line for actor-scope/register/POLICY-key claims)

1. Doc-4C §C11 (the 2 Workflow-Settings contracts: fields, registers, Audit + Concurrency +
   Idempotency declarations, actor scopes, the referenced POLICY keys) + Doc-2 §9 (audit actions
   by pointer) + Doc-2 §4 firewall (governance signals — what a workflow setting is NOT) — locate
   via `CORPUS_INDEX.md`.
2. Doc-3 v1.9 (the registered POLICY keys — which `identity.*`/config keys §C11's bounds
   reference; whether they exist) + Doc-5C §6 (the 2 route rows) + §4.3 + Doc-5A §6.2/§9.2/§9.5 +
   Doc-4A §9/§11.2 — via `CORPUS_INDEX.md`.
3. Doc-6C §3 (`organization_workflow_settings` table + RLS, as realized in W2-IDN-1) — via `CORPUS_INDEX.md`.
4. `docs/backend/backend_execution_playbook.md` §5 (corrected header + 6.8 row: "POLICY bounds
   via `core.config_value_query.v1`; writes no governance signal") · §8 + the RV-0143 (CORE-1
   POLICY-read) + RV-0152…RV-0158 close entries in `project-management/review-log.md`.
5. `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` + in-repo precedents:
   `src/modules/core/contracts/` (`config_value_query` — the POLICY read to consume) + the
   6.2/6.6 wired compositions (house shape) + the 6.5 §B.6 primitives
   (`src/server/identity/command-dedup.ts`) + `src/modules/identity/domain/read-models/`
   (the buyer-profile read-model shape).

## 3. CONTRACTS
- `src/modules/identity/contracts/{services,types,index}.ts` — additive only; existing exports unbroken.
- Consumed: `src/modules/core/contracts/` (audit append + **`config_value_query`** — the POLICY read) — **consume only, never edit**.

## 4. CODE (§3+§4 ≤15 entries)
- `src/modules/identity/application/commands/` (the update command) · `application/queries/`
  (the read) · `domain/policies/` (the POLICY-bound validation — consume the config read; the
  firewall check) · `infrastructure/data/` (the workflow-settings repository leg)
- `src/modules/identity/api/` + `app/api/identity/` + `src/server/identity/` (2 wired faces) ·
  `src/server/context/` + `src/server/authz/` (consume) · `src/shared/http/` (consume)
- `prisma/` — NO migration expected (table exists from IDN-1); Flag-and-Halt if one seems needed
- `tests/integration/` (new workflow-settings wire slice + the firewall discriminating test) ·
  `tests/_harness/` (reuse)

## 5. CONSTRAINTS
- **Standing charter binds.** **Team-6 pre-flag: YES** — a workflow setting that leaks into a
  governance signal = a firewall breach (Invariant #6); POLICY-bound bypass = an unbounded-config
  injection surface.
- **Open gates/ESC:** `[DC-1]` — zero identity events · `[ESC-IDN-AUDIT]` near-pointers only ·
  `ESC-WIRE-FIELD-CASING` carried · POLICY keys unseeded until IDN-7 (consume the real key,
  test-scoped seed, no literal fallback).
- **Task-specific:** contract-first ladder · D7 audited write (the update) / read unaudited ·
  per-contract declarations · truthful comments (the RV-0158 F1/F-B1 lens — no false invariant;
  if you write a "does NOT touch signal X" comment, it must be true and tested) · interleave-real
  probes · **the firewall is the gate — the write must be provably signal-free**.
- **Halt conditions:** corpus conflict · audit action without a §9 near-pointer · apparent need
  for a migration or event · **a §C11-referenced POLICY key that is not registered anywhere** ·
  any ambiguity in the writable-field set or its bounds that the frozen text does not resolve →
  Flag-and-Halt via Handoff Note; never resolve locally (never coin a bound).
- **DB bootstrap:** `docker compose up -d db`. Commit discipline: ONLY W2-IDN-6.8 files,
  `feat(identity): W2-IDN-6.8 … [checkpoint]`,
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never touch coordinator governance
  files or external working-tree changes (buyer-rfq/frontend/motion/trust-ladder/confidentiality).

## 6. EXPECTED OUTPUTS
- Completion Report (v1.1 template) at `governanceReviews/milestones/w2-idn-6.8/COMPLETION-REPORT.md` —
  judgment-call log (EVERY call), as-built route table, **the writable-field set + POLICY-key
  derivation with verbatim citations + the governance-signal-firewall discrimination evidence
  (the write proven signal-free)**, ESC dispositions, §11 next gate = Review-A with **Team-6 = YES**.
- Checkpoint SHA · 8C+8E + full-suite results vs 363/30 · self-check.

## Frozen Authority Checklist
□ All cited documents are frozen.
□ Every cited section has been re-read verbatim.
□ No draft document is treated as authority.
□ Any uncertainty results in Flag-and-Halt.
