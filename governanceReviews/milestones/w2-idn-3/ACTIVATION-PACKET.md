# ACTIVATION PACKET — Agent M1 · W2-IDN-3

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.0). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat. **This packet carries two binding security
obligations minted by Team-6 reviews (RV-0146 · RV-0147) — they are acceptance criteria, not
suggestions.***

## 0. Header
- **Role activated:**       Agent M1 — Identity & Organization (org plan §3 charter + M1 row;
                            Inv #5 is this module's product — and this WP realizes it)
- **Work item:**            `W2-IDN-3` — `check_permission` + active-org resolution (out-of-wire) ·
                            WP defs: `docs/backend/backend_build_plan.md` §4 Stage B +
                            `backend_execution_playbook.md` §5
- **Priority / Lane:**      P2 · Lane G (THE authorization core)
- **Model class:**          **Opus** per dispatch-binding **E3** (contracts/ surface change — the
                            out-of-wire contracts land on `src/modules/identity/contracts/`)
- **Worktree:**             none · **Activation type:** FIRST
- **Date · Packet author:** 2026-07-09 · Orchestrator (Backend-Lead hat: yes)

## 1. TASK
- **Objective:** realize the three-layer authorization resolution — **active Membership +
  Permission Slug + Resource Scope, OR an active Delegation Grant (the §6B five-condition
  delegated-access check)** — as app-layer, out-of-wire services (Doc-4C §C3), and **wire
  `src/server/authz/index.ts` to it** (no re-derivation, no shadow authz).
- **In scope:**
  - `application/queries` for the 4 out-of-wire auth-root reads — `get_user` · `get_organization`
    · `get_membership` · `check_permission` (Doc-5C §7.1: **no HTTP method/path — proposing a
    wire = architecture change per §7.5**).
  - `domain/policies` for the resolution logic (three-layer OR delegated-access); reads over the
    substrate built in IDN-1/IDN-2 (RLS-scoped via the established GUC context).
  - `contracts/` exposure of the four (out-of-wire service contracts — identifiers verbatim from
    Doc-4C; follow the M0 facade precedent).
  - **Wire `src/server/authz/index.ts`** (the seam that has been empty by design since Wave 1)
    to `identity.check_permission` — the app layer consumes the contract; zero local re-derivation.
  - **Doc-8:** 8E Invariant #5 (users act, orgs own) + 8D RLS-as-backstop (an app-bypassed
    negative path — prove RLS alone still fails closed when the app layer is circumvented).
  - Resolve or channel the carried `ESC-W1-CONTEXT-RESOLVE` / `ESC-W1-AUTH-401` handles (cite
    their registry rows; if resolution requires a contract the corpus lacks → Flag-and-Halt).
- **BINDING SECURITY OBLIGATIONS (Team-6 carries — each needs code + a discriminating test):**
  1. **[RV-0146 T6-OBS-1(a)] Org-anchored resolution:** `check_permission` resolves
     `role_permissions` anchored on `organization_id = active_org` (or the NULL system-bundle
     leg via the member's role) — **never by `role_id` alone**. Test: a forged org-scoped
     composition row pairing ANOTHER org's role_id (the RV-0146 P1 shape — the DB admits it)
     must grant NOTHING to anyone: not to the forging org's members (their membership doesn't
     bind that role), not to the role-owning org's members (row invisible/mis-anchored).
  2. **[RV-0147 T6-OBS-1 / probe B8] Staff-space firewall:** `check_permission` must **never
     resolve a staff-space slug through org-role membership** — staff capability derives only
     from the platform-staff channel (Doc-4C's model), regardless of what rows exist. Test:
     insert (elevated, rolled back) a tenant org-scoped composition row mapping a `staff_*`
     slug — `check_permission` for that org's member on that slug returns DENY.
- **Out of scope:** delegation grant/revoke **commands** (`W2-IDN-4` — but the delegated-access
  READ leg of resolution is IN scope over existing rows) · any wired HTTP API (`W2-IDN-6`) ·
  the composition write-service validation (RV-0146 T6-OBS-1(b) → `W2-IDN-6.4`) · state machines
  (`W2-IDN-5`) · POLICY seed (`W2-IDN-7`) · M0 files.
- **Acceptance criteria:** Doc-4C §C3 semantics verbatim (three layers + §6B five conditions —
  transcribe the five conditions from Doc-4C, never paraphrase) · out-of-wire (grep: no route
  file references these) · authz seam bound, zero shadow authz (no other code path re-derives
  permission logic — grep for it) · obligations 1+2 proven by discriminating tests · 8E + 8D
  bands green · full suite green (**current baseline: 183 tests / 20 files**, zero regressions)
  · tsc/ESLint/Prettier green.

## 2. DOCUMENTS (pointers only)
1. `generatedDocs/` **Doc-4C §C3** (+ §6B five-condition delegated check) — the resolution
   authority; locate via `CORPUS_INDEX.md`; transcribe conditions verbatim.
2. `generatedDocs/` Doc-5C §3.5/§7.1/§7.5 (out-of-wire law).
3. `docs/backend/backend_execution_playbook.md` §5 `W2-IDN-3` · §6 (out-of-wire list) ·
   `backend_build_plan.md` §4 Stage B.
4. `esc_registry.md` rows `ESC-W1-CONTEXT-RESOLVE` · `ESC-W1-AUTH-401` (the carried handles) +
   `src/server/context` + `src/server/authz/index.ts` (the live seams).
5. `project-management/ai-engineering-organization-plan.md` §3 (shared charter binds).

## 3. CONTRACTS
- `src/modules/identity/contracts/{services,types,index}.ts` (add the 4 out-of-wire contracts —
  additive; existing exports unbroken).

## 4. CODE (≤15 with §3)
- `src/modules/identity/{application/queries,domain/policies}/` (new)
- `src/modules/identity/infrastructure/data/` (repos as needed — own schema only)
- `src/server/authz/index.ts` (wire) · `src/server/context/` (READ-ONLY — the GUC seam)
- `tests/integration/` + `tests/unit/` (8E/8D suites) · `tests/_harness/` (reuse)

## 5. CONSTRAINTS
- Standing charter binds. `check_permission` is **app-layer, not a DB function** (Doc-4C §C3;
  CHK-6-023) — no SQL `check_permission()`.
- Zero §8 events; reads not audited; no migration expected (substrate complete — needing one =
  Flag-and-Halt).
- **Team-6 pre-flag: YES** (this IS the authorization model). Self-run `/ivendorz-security`.
- DB bootstrap: `docker compose up -d db`. Note `vitest.config.ts` `fileParallelism: false`.
- Commit discipline: checkpoint commits of ONLY W2-IDN-3 files, `feat(identity): W2-IDN-3 …
  [checkpoint]`, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Halt condition: Doc-4C §C3/§6B ambiguity on any resolution condition, or a needed contract
  identifier the corpus lacks → Flag-and-Halt / Handoff Note; never coin, never paraphrase a
  condition set.

## 6. EXPECTED OUTPUTS
- Completion Report per `governanceReviews/AI-Completion-Report-Template.md` (§5 Events = "Zero —
  frozen truth"; §6 must show the two obligations' discriminating tests + how each would fail
  under a wrong implementation; §11 next gate = Review-A with **Team-6 = YES**).
- Checkpoint SHA · 8E/8D + full-suite results · ESC-handle dispositions · self-check results.
