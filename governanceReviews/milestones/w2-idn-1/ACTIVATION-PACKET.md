# ACTIVATION PACKET — Agent M1 · W2-IDN-1

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.0). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat. **First activation of the Agent M1 role.***

## 0. Header
- **Role activated:**       Agent M1 — Identity & Organization (org plan §3 charter + M1 row;
                            Inv #5 is this module's product)
- **Work item:**            `W2-IDN-1` — complete the identity schema: 4 remaining tables + RLS ·
                            WP defs: `docs/backend/backend_build_plan.md` §4 Stage B +
                            `backend_execution_playbook.md` §5
- **Priority / Lane:**      P2 · Lane G (schema + RLS = security-critical)
- **Model class:**          advanced (Sonnet default per dispatch-binding — no E1–E6 trigger:
                            schema/RLS realization; state-machine *logic* is `W2-IDN-5`, not this WP)
- **Worktree:**             none · **Activation type:** FIRST
- **Date · Packet author:** 2026-07-09 · Orchestrator (Backend-Lead hat: yes)

## 1. TASK
- **Objective:** realize the 4 remaining `identity` tables — `permissions`, `role_permissions`,
  `organization_workflow_settings`, `delegation_grants` — with org-anchor RLS, as ONE forward-only
  migration in the Doc-6C §6.2 order, bringing all 9 identity tables to explicit existence.
- **In scope:**
  - **Migration (single transaction, FK-valid order per Doc-6C §6.2):** enums first (incl.
    `permission_space`, `rfq_approval_mode`, `delegation_grant_status`) → tables in the §6.2
    order → partial-unique-live + Band-H indexes → RLS enable + policies → (seeds are `W2-IDN-2`,
    NOT this WP — structure only here).
  - **Prisma models** for the 4 tables (schema.prisma, `identity` schema, multiSchema).
  - **RLS per Doc-6C §6.2a verbatim** (the playbook §5 table transcribes it — verify against
    Doc-6C itself before realizing):
    `permissions`: `permissions_read` FOR SELECT `USING (true)` + `permissions_staff_write` FOR
    ALL (staff). `role_permissions`: SPLIT policies — `_read` SELECT (org=active_org OR org IS
    NULL OR staff), `_insert`/`_delete` (org=active_org OR staff), **no UPDATE policy**.
    `organization_workflow_settings`: `ows_tenant` FOR ALL (org=active_org OR staff).
    `delegation_grants`: DUAL-PARTY — `_party_read` SELECT (active_org ∈ {controlling,
    representative} OR staff) + `_controlling_insert/_update/_delete` split (controlling OR staff).
  - **Constraints/indexes:** `permissions_slug_uq UNIQUE(slug)` · `role_permissions` composite PK
    `(role_id, permission_id)` + org idx · `ows_org_live_uq(organization_id) WHERE deleted_at IS
    NULL` · `delegation_grants` 3 partial indexes (`_controlling_idx`, `_representative_idx`,
    `_expiry_idx(status, valid_to)` all `WHERE deleted_at IS NULL`) + CHECK
    `delegation_grants_validity_chk (valid_to IS NULL OR valid_to > valid_from)`.
  - **Binding negatives:** `delegation_grants.vendor_profile_id` carries **NO FK** (M2 reference =
    bare UUID; a cross-module FK is a Red-Flag) · **NO CR4′ immutability trigger on any of the 4**
    (identity versions/hard-deletes nothing; CHK-6-031/032 N/A) · the only deferred FK stays the
    existing `memberships_role_fk` — the 4 new tables use inline FKs (parents precede them).
  - **Doc-8 8D tests:** schema-constraint coverage (uniques/CHECK/FK behavior) + **org-anchor RLS
    positive / negative / cross-tenant** for each policy class above (use the harness GUC pattern
    from existing identity RLS tests; note `vitest.config.ts` `fileParallelism: false`).
- **Out of scope:** the 45-slug/4-bundle seed (`W2-IDN-2`) · `check_permission` (`W2-IDN-3`) ·
  delegation commands/state machine (`W2-IDN-4/5`) · any wired API (`W2-IDN-6`) · POLICY keys
  (`W2-IDN-7`) · any M0 file · any contracts/ change (none expected for a schema WP — needing one
  = dispatch-binding E3 → suspend).
- **Acceptance criteria:** migration applies clean forward-only on a fresh DB AND on top of the
  existing chain · Prisma client regenerates clean · 8D green (constraints + RLS pos/neg/
  cross-tenant) · full suite green (**current baseline: 120 tests / 17 files**, zero regressions)
  · tsc/ESLint/Prettier green · zero coined slug/enum/policy-name (every name verbatim from
  Doc-6C).

## 2. DOCUMENTS (pointers only)
1. `generatedDocs/` Doc-6C Content (M1 schema) — §3.5/§3.6/§3.7/§3.9 (the 4 tables) · §6.2
   (migration order) · §6.2a (RLS verbatim). Locate the exact file via `generatedDocs/CORPUS_INDEX.md`;
   transcribe names/policies verbatim — this is the oracle.
2. `docs/backend/backend_execution_playbook.md` §5 `W2-IDN-1` (the condensed table — cross-check
   against Doc-6C; on ANY mismatch, Doc-6C wins and you Flag-and-Halt the mismatch).
3. `docs/backend/backend_build_plan.md` §4 Stage B `W2-IDN-1` + §1 constraints.
4. `prisma/migrations/` — the existing `identity_init` 5-table migration (naming/RLS/GUC
   conventions to follow) + `20260627183528_core_init` (house migration style).
5. `project-management/ai-engineering-organization-plan.md` §3 (shared charter binds).

## 3. CONTRACTS
- None to change (schema WP). `src/modules/identity/contracts/` is READ-ONLY context.

## 4. CODE (≤15 with §3)
- `prisma/schema.prisma` (add the 4 identity models)
- `prisma/migrations/<ts>_identity_authz/` (the new migration — one dir)
- Existing identity RLS/GUC tests in `tests/integration/` (convention source — e.g. the
  buyer-profile/provisioning suites) · `tests/_harness/`
- `tests/integration/` (add the 8D suite) · `tests/unit/` (if constraint logic warrants)

## 5. CONSTRAINTS
- Standing charter binds (org plan §3). **Inv #5 discipline:** RLS policies anchor on the
  server-set active-org GUC exactly as the existing 5 tables do — never a client-supplied value.
- Forward-only migration (Doc-6A §11) — no down-migration; a mistake is fixed by a compensating
  forward migration (which would be a new dispatch).
- **Team-6 pre-flag: YES** (RLS + permission substrate = core security surface). Self-run
  `/ivendorz-security` before handoff; report results in §7.
- DB bootstrap: `docker compose up -d db`. Prisma: regenerate client (`npm run db:generate`),
  never hand-edit generated output.
- Commit discipline: checkpoint commit(s) of ONLY W2-IDN-1 files,
  `feat(identity): W2-IDN-1 … [checkpoint]`, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Halt condition: playbook ↔ Doc-6C mismatch, or any needed name/policy the corpus doesn't define
  → Flag-and-Halt / Handoff Note; never coin.

## 6. EXPECTED OUTPUTS
- Completion Report per `governanceReviews/AI-Completion-Report-Template.md` (all sections;
  §4 Migrations = the new dir + apply-clean evidence both paths (fresh + on-top); §5 Events =
  "Zero — frozen truth: M1 emits no §8 events"; §11 next gate = Review-A with **Team-6 = YES**).
- Checkpoint SHA · 8D + full-suite results · self-check results.
