# ACTIVATION PACKET — Agent M1 · W2-IDN-6.4

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.1). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat.*

## 0. Header

- **Role activated:**       Agent M1 — Identity & Organization (charter: org plan §3 shared charter + M1 row)
- **Work item:**            `W2-IDN-6.4` — Wired API · Role & Permission (§5, 6 contracts) · WP defs:
                            `docs/backend/backend_build_plan.md` §4 Stage B + `backend_execution_playbook.md`
                            §5 (corrected IDN-6 header + 6.4 row)
- **Depends on:**           `W2-IDN-2` ✅ (permission + bundle catalog seed, 43 slugs, RV-0147) ·
                            `W2-IDN-3` ✅ (check_permission wire) · `W2-IDN-6.2` ✅ closed (wired house
                            shape + §B.6 patterns) · `W2-IDN-6.3` ✅ closed `a9d977e` — gates checked
                            per org plan §5 ③
- **Priority / Lane:**      P2 · Lane G
- **Model class:**          advanced (Invariant #2 firewall + permission-set ⊆-existing surface)
- **Worktree:**             none · **Activation type:** FIRST (fresh context)
- **Date · Packet author:** 2026-07-10 · Orchestrator (Backend-Lead hat: yes)
- **Packet-size attestation:** 5 document pointer rows / ~10 distinct files · §3+§4 entries: 13 ·
                            est. input ~19k tokens — within limits: **YES** (dual count per v1.1)

## 1. TASK

- **Objective:** wire the six §5 Role & Permission contracts on their frozen routes — two
  dual-actor reads + four custom-role writes — with the Invariant #2 firewall
  (`staff_*` slugs never on org bundles) and the permission-set ⊆-existing / never-ownership-class
  guards enforced service-layer, every write audited + §B.6-deduped.

- **In scope:**
  - **6 wired contracts (verbatim ids/methods from playbook §5 6.4 row; routes/registers from
    Doc-5C §5 + Doc-4C's Role/Permission sub-domain section — RE-READ VERBATIM, locate the exact
    § via `CORPUS_INDEX.md`):** `list_permissions.v1` GET·Q · `list_roles.v1` GET·Q ·
    `create_role.v1` POST·C · `update_role.v1` PATCH·C · `set_role_permissions.v1` POST·C ·
    `delete_role.v1` DELETE·C. Playbook row note: "17 dual-actor read" — derive what that means
    from the frozen text (who may read: the two role dimensions).
  - **THE FIREWALL (Invariant #2 — binding, service-layer, discriminating-tested):** a custom
    org role is `organization_id = active_org`, `is_system_bundle = false`; **`staff_*` slugs are
    NEVER assignable to an org role** (the RV-0147 IDN-2 monotonicity + B8 staff-space lineage) ·
    `set_role_permissions` permission-set **⊆ the existing catalog** and **never ownership-class**
    (the DC-CR7 delegation precedent; derive the ownership-class slug set from Doc-2 §7 verbatim) ·
    the 4 system bundles (`Owner/Director/Manager/Officer`, `organization_id = NULL`,
    `is_system_bundle = true`) are **immutable** — create/update/set-perms/delete MUST reject any
    attempt to mutate or delete a system bundle.
  - **State/lifecycle:** roles have no §5 state machine (they are catalog rows, not lifecycle
    entities) — `delete_role` = ADR-012 soft-delete (never hard-delete; Invariant 8); confirm a
    role in use / assigned is handled per the frozen register (reject vs cascade — read verbatim,
    coin nothing).
  - **§B.6 dedup:** Idempotency-Key mandatory on the writes; deps = REQUIRED-field shape
    (RV-0153 OBS-2); claim leg on `create_role` (create-class, the RV-0153 F2 pattern); window
    keys per each contract's frozen declaration (unseeded until IDN-7 — test-scoped-seed precedent).
  - **Wire mechanics:** audited per each contract's frozen Audit declaration (never a blanket —
    the reads are NOT audited); If-Match/ETag ONLY where `Concurrency: optimistic` is
    frozen-declared (`update_role`/`set_role_permissions` likely — verify each); ETag call-13 leg
    discipline; non-disclosure collapse on cross-org role reads; the two reads are dual-actor —
    scope them to what the frozen text authorizes, no wider.
  - **Doc-8:** 8C (registers · idempotency · actor-scope · non-disclosure) + 8E (Invariant #2
    firewall + ⊆-existing + system-bundle-immutability discriminating-tested — the widening/forgery
    idiom from RV-0147).

- **Out of scope:** membership/org/context contracts (6.2/6.3/6.6) · POLICY seed (IDN-7) · the
  catalog SEED itself (IDN-2 — you CONSUME the 43 slugs + 4 bundles, never re-seed) · any M2–M9
  surface · any identity event (`[DC-1]`). Additions = Review-A finding.

- **Acceptance criteria:** 6 contracts on frozen routes/registers (as-built table) · Invariant #2
  firewall + ⊆-existing + never-ownership-class + system-bundle-immutability discriminating-tested
  (forgery/widening inserts rejected — RV-0147 idiom) · reads dual-actor-scoped per frozen text ·
  §B.6 required-deps + claim leg · per-contract audit declarations (reads unaudited), zero
  invented tokens/slugs · byte-identical 404 collapse · full suite green — **baseline at dispatch:
  337 tests / 28 files** · tsc/ESLint/Prettier green.

- **Binding carries (inbound):**
  | Source | Obligation | Class |
  |---|---|---|
  | RV-0147 (IDN-2) B8 lineage | `staff_*` never via org roles — the firewall this WP realizes on the WRITE side | acceptance-criterion |
  | RV-0153 OBS-2 | §B.6 deps = REQUIRED-field `idempotencyKey` on every new composition | acceptance-criterion |
  | `ESC-WIRE-FIELD-CASING` (🟥 owner-pending) | build result payloads in the ratified house shape; log as carried in report §8 | carried handle |
  | RV-0155 F-B1 lesson | any race/concurrency probe must be interleave-real (lock-waiter observation, no sleep-offset) | method constraint |

  No further carries: the serialization contract binds only ownership-guarded commands (none
  here); OBS-B1 binds 6.6. Checked, not omitted.

## 2. DOCUMENTS (pointers only — ≤5 rows; every FROZEN pointer: RE-READ VERBATIM — never trust a paraphrase, including this packet's — FIVE packet paraphrases have dissolved under verbatim re-read this wave)

1. Doc-4C — the Role/Permission sub-domain section (6 contracts: fields, registers, Audit +
   Concurrency + Idempotency declarations, the dual-actor read scope) + Doc-2 §7 (the slug
   catalog + the 4 bundle defaults + the ownership-class slugs) + §9 (audit actions by pointer) —
   locate via `generatedDocs/CORPUS_INDEX.md`.
2. Doc-5C §5 (the 6 role/permission route rows) + §4.3 + Doc-5A §6.2/§9.2/§9.5 + Doc-4A
   §9/§11.2 — via `CORPUS_INDEX.md`.
3. Doc-6C §3 (`roles`/`role_permissions`/`permissions` tables + RLS) + §5 (the seed, as patched
   v1.0.1 — CONSUME, never re-seed) — via `CORPUS_INDEX.md`.
4. `docs/backend/backend_execution_playbook.md` §5 (corrected header + 6.4 row) · §8 + the
   RV-0147/0152/0153/0155/0156 close entries in `project-management/review-log.md` (the B8
   firewall lineage + the §B.6/probe lessons).
5. `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` + in-repo precedents: the IDN-2
   catalog seed (`identity_catalog_seed` migration + `permission-resolution.policy.ts`) + the
   6.2/6.3 wired compositions (house shape) + the 6.5 §B.6 primitives
   (`src/server/identity/command-dedup.ts`).

## 3. CONTRACTS
- `src/modules/identity/contracts/{services,types,index}.ts` — additive only; existing exports unbroken.
- Consumed: `src/modules/core/contracts/` — **consume only, never edit**.

## 4. CODE (§3+§4 ≤15 entries)
- `src/modules/identity/application/commands/` (4 write commands) · `application/queries/`
  (2 reads) · `domain/policies/` (the Invariant #2 + ⊆-existing guards — consume/extend
  `permission-resolution.policy.ts`, no rebuild) · `infrastructure/data/` (role repository legs)
- `src/modules/identity/api/` + `app/api/identity/` + `src/server/identity/` (6 wired faces) ·
  `src/server/authz/` (consume) · `src/shared/http/` (consume)
- `prisma/` — NO migration expected (tables + seed exist); Flag-and-Halt if one seems needed
- `tests/integration/` (new role/permission wire slice) · `tests/_harness/` (reuse)

## 5. CONSTRAINTS
- **Standing charter binds.** **Team-6 pre-flag: YES** — privilege-escalation surface
  (permission-set widening, staff-slug forgery onto org roles, system-bundle tampering).
- **Open gates/ESC:** `[DC-1]` — zero identity events · `[ESC-IDN-AUDIT]` near-pointers only ·
  `ESC-WIRE-FIELD-CASING` carried · POLICY keys unseeded until IDN-7.
- **Task-specific:** contract-first ladder · D7 audited writes (reads unaudited) · per-contract
  declarations · truthful comments (F-B1 lens) · interleave-real probes (F-B1) · **consume the
  IDN-2 catalog, never re-seed or coin a slug**.
- **Halt conditions:** corpus conflict · audit action without a §9 near-pointer · apparent need
  for a migration or event · any ambiguity in the ownership-class slug set or the dual-actor read
  scope that the frozen text does not resolve → Flag-and-Halt via Handoff Note; never resolve
  locally.
- **DB bootstrap:** `docker compose up -d db`. Commit discipline: ONLY W2-IDN-6.4 files,
  `feat(identity): W2-IDN-6.4 … [checkpoint]`,
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never touch coordinator governance
  files or external working-tree changes (buyer-rfq/frontend/motion/trust-ladder).

## 6. EXPECTED OUTPUTS
- Completion Report (v1.1 template) at `governanceReviews/milestones/w2-idn-6.4/COMPLETION-REPORT.md` —
  judgment-call log (EVERY call), as-built route table, the firewall/⊆-existing/immutability
  discrimination evidence, the dual-actor read-scope derivation with citations, ESC dispositions,
  §11 next gate = Review-A with **Team-6 = YES**.
- Checkpoint SHA · 8C+8E + full-suite results vs 337/28 · self-check.

## Frozen Authority Checklist
□ All cited documents are frozen.
□ Every cited section has been re-read verbatim.
□ No draft document is treated as authority.
□ Any uncertainty results in Flag-and-Halt.
