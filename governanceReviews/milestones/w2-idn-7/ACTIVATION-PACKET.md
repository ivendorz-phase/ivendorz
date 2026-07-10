# ACTIVATION PACKET — Agent M1 · W2-IDN-7

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.1). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat.*

## 0. Header

- **Role activated:**       Agent M1 — Identity & Organization (charter: org plan §3 shared charter + M1 row)
- **Work item:**            `W2-IDN-7` — 7 `identity.*` POLICY keys seed + catalog 43→45 (ESC-RFQ-SLUG)
                            + `durationToMs`/clock canonicalization + **M1 conformance gate (module DoD)** ·
                            WP defs: `docs/backend/backend_build_plan.md` §4 Stage B + `backend_execution_playbook.md` §5 (IDN-7 row)
- **Depends on:**           ALL IDN wired sub-domains ✅ closed (6.1–6.6 + 6.7 Wave-1 + 6.8 `2389e85`;
                            6.5 review-complete, owner-gated on `ESC-WIRE-FIELD-CASING` only) · `W2-CORE-1` ✅
                            (`core.config_value_query.v1`) · `W2-IDN-2` ✅ (the 43-slug catalog seed) — gates
                            checked per org plan §5 ③
- **Priority / Lane:**      P2 · Lane G (the module conformance gate)
- **Model class:**          advanced (module DoD + seed conformance + the durationToMs canonicalization)
- **Worktree:**             none · **Activation type:** FIRST (fresh context)
- **Date · Packet author:** 2026-07-10 · Orchestrator (Backend-Lead hat: yes)
- **Packet-size attestation:** 5 document pointer rows / ~11 distinct files · §3+§4 entries: 14 ·
                            est. input ~20k tokens — within limits: **YES** (if the seed+canonicalization+gate
                            proves larger than one packet, HAND BACK a split proposal — do not sprawl)

## 1. TASK

- **Objective:** seed the remaining `identity.*` POLICY keys + grow the permission catalog 43→45
  per the owner-ruled `ESC-RFQ-SLUG`, canonicalize the duplicated `durationToMs`/window-clock
  logic, and run the **M1 module conformance gate (8C+8D+8E)** — asserting M1's Definition of
  Done and surfacing (never deciding) the owner-gated close blockers.

- **In scope:**
  - **Catalog 43→45 (owner-ruled `ESC-RFQ-SLUG`, Doc-2 Patch v1.0.8 / PATCH-D2-07 — RE-READ
    VERBATIM):** a forward-only catalog-seed migration adding the two staff routing slugs
    `staff_can_view_routing` + `staff_can_manage_routing` (both `space='staff'`), consuming the
    frozen Doc-2 §7 (as patched v1.0.8) enumeration — never coin. **The target is 45 = 36 tenant
    + 9 staff** (T6-OBS-3, RV-0159: the Doc-6C §3.5 PROSE "45 (38/7)" is STALE — cite the REAL
    arithmetic; the count grew from the 43=36+7 `ESC-IDN-SLUGCOUNT` baseline by +2 staff). Bundle
    assignment per Doc-2 §7 (routing slugs are staff-space — NOT on any org bundle, Invariant #2).
    Idempotent `ON CONFLICT`. Doc-6C count-overlay per the `Doc-6C_Patch_v1.0.1` precedent.
  - **7 `identity.*` POLICY key seeds (Doc-3 v1.9 §Identity — RE-READ VERBATIM the exact key
    names + values):** including the consumed-live keys `identity.command_dedup_window`
    (6.1/6.5/6.8 consumers) · `identity.membership_invite_dedup_window` (6.3) ·
    `identity.delegation_validity_default` + `identity.delegation_expiry_sweep_cadence` (RV-0149).
    Seed into `core.system_configuration` via the frozen key form; **seed-PK convention =
    deterministic pre-authored UUIDv4 constants** (Board Option A, by pointer to
    `BOARD-PACKET-SEED-PK-UUID_v1.0.md` — never `Math.random`/runtime). Idempotent.
  - **`durationToMs` canonicalization + window clock-source unification (RV-0153 OBS-Δ3 +
    RV-0149 F-B3/OBS-4):** the duplicated `durationToMs` copies + the mixed JS-lookup-vs-SQL-`now()`
    window-clock evaluation (RV-0153 OBS-Δ3) are unified to one source; **behavior-preserving
    refactor — every existing test stays green, no contract/behavior change** (interleave-real if
    any concurrency re-test; the RV-0155 F-B1 lesson). If canonicalization would change any
    observable behavior → STOP and hand back.
  - **M1 MODULE CONFORMANCE GATE (the module DoD — Build Plan §6 + Playbook §9/§10):** run/assert
    **8C** (all wired contracts: envelope/registers/idempotency/actor-scope/non-disclosure —
    completeness ≡ the frozen Doc-5C surface) + **8D** (schema constraints · CR4′ immutability ·
    RLS positive/negative/cross-tenant/byte-equivalence · migration forward-only) + **8E**
    (domain invariants · the §4 firewall · Doc-4M state-machine edge coverage). Assert the module
    DoD: **18 `core.*` + the identity POLICY keys seeded · the 45-slug catalog · 8C+8D+8E green ·
    Build Artifact Checklist · zero unresolved `[ESC-*]` on named channels · README**. The gate
    validates the FULL current M1 surface — **note that the command layer was refactored
    post-close by a concurrent owner commit (`1ff8ed0`, `_validation.ts` UUID_PATTERN extraction
    over 14 command files); the conformance run is the safety net — confirm it green and flag any
    drift from the closed-WP behavior.**

- **Out of scope / SURFACE-ONLY (never decide — these are owner/Board-gated, the gate REPORTS
  them as the remaining M1-close blockers):**
  - `ESC-WIRE-FIELD-CASING` (🟥) — gates 6.5's close; the whole wired surface is camelCase house
    shape. **Do NOT re-case anything.** Report it as blocker #1 to the M1 module close.
  - The **realize-vs-defer ruling** on the deferred fields (`default_routing_mode`/
    `buyer_courtesy_options` §C11 + the `ESC-IDN-ORG-PROFILE-FIELDS` org-profile fields) — the
    Board rules realize-columns-vs-formal-defer; a silent contract↔schema gap must NOT close M1.
    Report it; do not realize a column or coin a bound.
  - The non-gating Board ESC queue (`2FA-RECOVERY`/`PREF-KEYS`/`LIST-PAGESIZE`/`INVITE-ACCOUNT`/
    `CTX-SUSPENDED-DOWNSTREAM`) — surface each with its fail-closed interim status.
  - The workflow-settings first-row provisioning locus (RV-0159 OBS-1) — surface; do not build a
    provisioning contract (none is frozen).

- **Acceptance criteria:** catalog = 45 (36 tenant + 9 staff), the 2 routing slugs seeded staff-
  space + on NO org bundle (Invariant #2 discriminating-tested) · the identity POLICY keys seeded
  (deterministic UUIDv4 PKs) · `durationToMs`/clock unified behavior-preserving (all prior tests
  green) · **8C+8D+8E green — the M1 module DoD asserted** · zero invented slug/key/token · full
  suite green ZERO regressions — **baseline at dispatch: 368 tests / 31 files** · tsc/ESLint/
  Prettier green · **an M1 Module DoD report** listing what is MET vs the surfaced owner-gated
  close blockers.

- **Binding carries (inbound):** the full accumulated IDN-7 obligation set is the tracker's
  W2-IDN-7 row (seed-PK · the 4+ POLICY keys · catalog 43→45 with the T6-OBS-3 arithmetic ·
  durationToMs/clock · the surfaced Board queue). Every item above traces to it; re-read the
  tracker row + the RV-0149/0153/0155/0159 close entries for provenance. Checked, not omitted.

## 2. DOCUMENTS (pointers only — ≤5 rows; RE-READ VERBATIM — the wave dissolved 7 packet
paraphrases; cite the exact frozen line for every slug/key/count claim)

1. `generatedDocs/Doc-2_Patch_v1.0.8.md` (PATCH-D2-07, the 2 routing slugs — the count delta) +
   Doc-2 §7 (the slug catalog + bundle defaults) + Doc-3 v1.9 §Identity (the 7 POLICY keys — exact
   names/values) — locate via `CORPUS_INDEX.md`.
2. Doc-6C §5 (the catalog seed, as patched v1.0.1 — the count overlay precedent) + §3 (the tables) +
   Doc-8 §8C/§8D/§8E (the conformance bands) — via `CORPUS_INDEX.md`.
3. `governanceReviews/BOARD-DECISION-RFQ-SLUG_v1.0.md` (the ESC-RFQ-SLUG ruling) +
   `BOARD-PACKET-SEED-PK-UUID_v1.0.md` (the deterministic-PK convention) +
   `BOARD-PACKET-IDN-SLUGCOUNT_v1.0.md` (the 43=36+7 baseline).
4. `docs/backend/backend_execution_playbook.md` §5 (IDN-7 row) · §9 (test→Doc-8 band mapping) ·
   §10 (Definition of Complete) + the tracker W2-IDN-7 row + the RV-0149/0153/0155/0159 close
   entries in `project-management/review-log.md`.
5. In-repo: the `identity_catalog_seed` migration (the 43-slug seed to extend) + the
   `durationToMs` copies (grep `durationToMs` across `src/modules/identity` + `src/server` +
   `inngest`) + `src/modules/core/contracts/` (`config_value_query`) + the existing 8D/8E suites
   to extend.

## 3. CONTRACTS
- `src/modules/identity/contracts/{services,types,index}.ts` — additive only if the canonicalization
  needs a shared face; existing exports unbroken.
- Consumed: `src/modules/core/contracts/` — **consume only, never edit**.

## 4. CODE (§3+§4 ≤15 entries)
- `prisma/migrations/` — ONE forward-only catalog-seed migration (2 routing slugs) + the POLICY-key
  seed (migration or seed script per the CORE-1/IDN-2 precedent) · `prisma/schema.prisma` (only if a
  seed needs it — Flag-and-Halt if a table change seems needed)
- the `durationToMs` shared module (canonicalize the copies) + its consumers (behavior-preserving)
- `src/modules/identity/domain/` (the catalog/POLICY conformance leg) · the 8C/8D/8E suites to extend
- `tests/integration/` (the M1 conformance additions: catalog-45 pin · routing-slug-not-on-bundle ·
  POLICY-key-seeded · durationToMs-unified) · `tests/_harness/` (reuse)
- `docs/backend/` — NO (coordinator-owned) · README (module) — update per §10 DoD

## 5. CONSTRAINTS
- **Standing charter binds.** **Team-6 pre-flag: YES** — the catalog seed is the authz substrate
  (a mis-seeded staff slug on an org bundle = Invariant #2 breach); the conformance gate is the
  module-wide security assertion.
- **Open gates/ESC:** `[DC-1]` zero events · `[ESC-IDN-AUDIT]` near-pointers only ·
  `ESC-WIRE-FIELD-CASING` + the deferred-field ruling + the ESC queue = **SURFACE-ONLY, owner/Board
  gated** (report, never decide/realize/coin) · seed-PK deterministic UUIDv4 (never runtime-random).
- **Task-specific:** contract-first · idempotent seeds · behavior-preserving canonicalization
  (all prior tests green) · consume the frozen catalog/keys, never coin a slug/key/value · truthful
  comments (the RV-0158 F1/F-B1 lens) · the T6-OBS-3 arithmetic (45 = 36+9, not the stale 38/7 prose).
- **Halt conditions:** corpus conflict · a Doc-3 v1.9 key whose name/value the frozen text does not
  fix · any catalog/count mismatch between Doc-2 v1.0.8 and Doc-6C · canonicalization that changes
  observable behavior · the WP proving larger than one packet → **Flag-and-Halt / hand back a split**;
  never resolve locally, never coin.
- **DB bootstrap:** `docker compose up -d db`. Commit discipline: ONLY W2-IDN-7 files,
  `feat(identity): W2-IDN-7 … [checkpoint]`, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
  **NOTE the concurrent-session working-tree dirt** (FE/`_validation` refactor, committed at
  `1ff8ed0`) — stage ONLY your W2-IDN-7 files; never touch external changes; if `git add` sweeps
  external files, unstage them (the RV-0159 lint-staged lesson).

## 6. EXPECTED OUTPUTS
- Completion Report (v1.1 template) at `governanceReviews/milestones/w2-idn-7/COMPLETION-REPORT.md` —
  judgment-call log (EVERY call), the catalog-45 + POLICY-key derivations with verbatim citations,
  the canonicalization behavior-preservation evidence, **the M1 Module DoD assertion (what is MET)
  + the surfaced owner-gated close blockers (wire-casing · realize-vs-defer · the ESC queue ·
  provisioning locus)**, §11 next gate = Review-A with **Team-6 = YES**.
- Checkpoint SHA · 8C+8D+8E + full-suite results vs 368/31 · the M1 DoD checklist · self-check.

## Frozen Authority Checklist
□ All cited documents are frozen.
□ Every cited section has been re-read verbatim.
□ No draft document is treated as authority.
□ Any uncertainty results in Flag-and-Halt.
