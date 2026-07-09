# iVendorz — Backend Execution Tracker

| Field | Value |
|---|---|
| **Document type** | Living execution tracker · non-authoritative under the frozen corpus |
| **Companion to** | [`backend_build_plan.md`](backend_build_plan.md) (sequence) · [`backend_execution_playbook.md`](backend_execution_playbook.md) (how-to-build) |
| **Updated** | 2026-07-08 |
| **Rule** | Coins nothing. Tracks status only; on any conflict the frozen corpus + the Build Plan win. |

> Live per-work-package status board for the backend build — the backend analog of
> `project-management/execution-board.md`. **One module scope per PR; multiple WP PRs per module.**
> A WP advances only through its full lifecycle (Build Plan §6); it closes at
> `BLOCKER = MAJOR = MINOR = 0` with its required Doc-8 bands green.

## Status legend

| Mark | Meaning |
|---|---|
| ⬜ | Planned — not started (DoR may still be open) |
| 🔍 | Discovery — WP card + grounding in progress |
| 🟡 | In Progress — building |
| 🔵A | Review-A (architecture & governance, fresh context) |
| 🔵B | Review-B (quality & adversarial, fresh context) |
| 🟣 | Board / owner adjudication (Validate-Findings §13) |
| ✅ | Merged into `wave/2-core-platform` |
| ⛔ | Blocked (open dependency or `[ESC-*]`) |

> **Additive amendment — execution-organization sync (2026-07-09).** Rows advance under the
> **AI Engineering Organization v1.0** (`project-management/ai-engineering-organization-plan.md` ·
> `governanceReviews/BOARD-DECISION-AI-ENG-ORG_v1.0.md`). **Team-6 (Security Review) activates per
> the ratified runtime policy** on any security-surfaced WP — it may run **alongside** 🔵B on the
> same SHA; its verdict is required before 🟣 for those rows and is logged in the same RV entry; non-surfaced rows record "N/A" without
> activation (charter: `governanceReviews/TEAM-6-Security-Review-Charter.md`). Legend unchanged;
> governance not restated here.

**Wave-2 gate on close of all rows:** Wave Integration Audit GREEN → one PR `wave/2-core-platform → main` → *Core Platform gated* (Build_Roadmap §9 milestone 3).

---

## Wave 2 — Core Platform (M0 → M1, serial)

### Stage A — M0 `core` (infra-only shape-exception)

| WP | Scope | Depends | Status | A | B | PR | Commit | Suites | ESC | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| **W2-CORE-1** | Config (POLICY) + feature-flag read services on `contracts/` | — (M0 tables done) | ✅ | **PASS** (RV-0143) | **PASS** (post-patch, delta-verified) | (checkpoint commits on wave branch) | `6a2cae6` | 8B ✅ (90/90; leak probes 0/0) | — | **✅ FIRST FULL LIFECYCLE under org v1.0 — proof run COMPLETE** (clean-gate close 2026-07-09; T6 Security PASS 0/0/0, first live charter run); contracts `core.config_value_query.v1` + `core.feature_flag_evaluate.v1`; trail: RV-0143 (3 builder + 5 review activations, 2 accepted MINORs fixed+re-verified, 0 false positives); Board PENDING (non-gating): B-1 severity · OBS a/b · convention · executor-type backlog |
| **W2-CORE-2** | Outbox dispatch hardening + Inngest wiring (`pending→dispatched→archived`) | CORE-1 ✅ | ✅ | **PASS** (RV-0144) | **PASS** (delta re-verify 0/0/0/0/0 at `7ecd284`) | (checkpoints on wave branch) | `7ecd284` · close `cbd02c5` | 8B · 8F ✅ (101/16) | `[D-5]` on Board channel (mechanics built, audit leg waits) | **✅ clean-gate close 2026-07-09** (T6 N/A exercised + re-confirmed by both lenses); §B6 workers on contracts; CAS advance writes (Review-B caught the SELECT-time dedup race, discrimination proven revert-fail/restore-pass); OBS-3 forward: first real consumer = its own transport-leg WP |
| **W2-CORE-3** | M0 conformance gate (CR4′ immutability + outbox observer green) | CORE-2 ✅ | ✅ | **PASS** (RV-0145, combined A+B Lane-L) | **PASS** (same activation; trigger-disable discrimination probe + double-run) | (checkpoint on wave branch) | `f2c9c95` · close `654368f` | 8D ✅ (19 new) · 8B cited · 120/17 | `[D-5]` ✅ ruled → CORE-4 | **✅ clean-gate close 2026-07-09 — M0 STAGE A COMPLETE; M0 Wave-2 module DoD MET** (18 keys ✓ · 8D ✓ · 8B ✓ · BAC ✓ · README absent noted); sub-gating carry: NIT-1 comment + OBS-2 fixture-prefix → W2-CORE-4 |
| **W2-CORE-4** | M0 hardening + **[D-5] audit leg (Option A, Board 2026-07-09)** | CORE-2 ✅, `[D-5]` ✅ | ⬜ | — | — | — | — | 8B · 8D | — | **Minted 2026-07-09** per `BOARD-DECISION-D5-OUTBOX-AUDIT_v1.0.md`: 5 audit legs (created/attempt/success/permanent-failure/archive; CAS-winning attempts only, no retry-scheduling noise), D7-atomic, System-attributed; **action tokens bind by §9 near-pointer — Flag-and-Halt if none** (serialization-patch route); fold-ins: **WI-CAS-FLAKE hardening (✅ approved, 4×)** + RV-0145 NIT-1 + OBS-2. P3 — next M0-adjacent slot, never preempts the IDN chain |

### Stage B — M1 `identity`

| WP | Scope | Depends | Status | A | B | PR | Commit | Suites | ESC | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| **W2-IDN-1** | 4 remaining tables (`permissions`, `role_permissions`, `organization_workflow_settings`, `delegation_grants`) + RLS | CORE-3 ✅ | ✅ | **PASS** (RV-0146) | **PASS** (delta re-verify at `e7794e3`) | (checkpoints on wave branch) | `e7794e3` · close (this commit) | 8D ✅ (52) · 172/19 | — | **✅ clean-gate close 2026-07-09** — all 9 identity tables live; **T6 ✅ PASS** (7 hostile-tenant probes; **T6-OBS-1 = binding W2-IDN-3 packet carry**: app-layer role↔org co-tenancy); first Agent M1 activation; carries to IDN-2 checkpoint: line-42 docstring NIT |
| **W2-IDN-2** | Permission + bundle catalog seed — **43 slugs (36t+7s) per `Doc-6C_Patch_v1.0.1`** | IDN-1 ✅ | ✅ | **PASS** (RV-0147; independent cell re-derivation concurs 103) | **PASS** (B-NIT-1 deferred) | (checkpoint on wave branch) | `d1ac201` · close `f2bbcfa` | 8E ✅ (11) · 183/20 | `ESC-IDN-SLUGCOUNT` ✅ | **✅ clean-gate close 2026-07-09** — authz catalog LIVE; T6 ✅ (monotonicity proven, widening/forgery inserts 42501-rejected); **probe B8 → binding IDN-3 carry** (staff-space never via org roles); first Flag-and-Halt lifecycle completed end-to-end |
| **W2-IDN-3** | `check_permission` (3-layer + §6B delegated, out-of-wire) + wire `src/server/authz` | IDN-1 ✅, IDN-2 ✅ | ✅ | **PASS** (RV-0148 + re-verify) | **PASS** (combined delta re-verify at `6f03d83`) | (checkpoints on wave branch) | `6f03d83` · close `e365046` | 8E · 8D ✅ · 219/22 | `ESC-IDN-DISPLAYNAME` (gates IDN-6.1) | **✅ clean-gate close 2026-07-09 — check_permission LIVE** (T6 13-probe hostile suite; B caught the non-isolating no-inheritance test; coordinator defect caught+owned); binding IDN-6 wire expectations accumulated; 2 comment NITs → fold into IDN-4 checkpoint |
| **W2-IDN-4** | Delegation grants (dual-party commands + 5-state machine + expiry worker + refresh port) | IDN-3 ✅ | ✅ | **PASS** (RV-0149 + delta re-verify at `65a4c53`) | **PASS** (delta re-verify at `000b51b`; F-B1 discrimination proven by sabotage-revert — both-layers neuter → F-B1a fails, policy-only → F-B1b fails, restore byte-clean attested) | (checkpoints on wave branch) | `000b51b` · close (this commit) | 8C·8D·8E ✅ · 243/23 | IDN-DELEG-EXPIRY · IDN-AUDIT | **✅ clean-gate close 2026-07-09 — delegation-grant write side LIVE** (first audited-write WP; D7 pattern held); **T6 ✅** (6 live RLS probes incl. forged-controller INSERT rejected · escalation truth-table 9/9 · RV-0147 B8 lineage closed · zero invented audit actions); carries: **IDN-6.5 ← T6-OBS-1 M2-port existence-oracle future-watch + §B.6 dedup** · **IDN-7 ← bind sweep-cadence key + activate validity-default seed** · NIT-6 residual comments → [DC-1] reconciliation |
| **W2-IDN-5** | State machines (org §5.1 · membership §5.2 · user §C4; delegation ✅ IDN-4) | IDN-1 ✅, IDN-4 ✅ | ✅ | **PASS** (RV-0150 + 2 delta re-verifies [first re-verify agent died silently → fresh redispatch]; all 4 builder judgment calls UPHELD vs frozen text; F1 citations + F2 fail-closed patched `0524a2c`) | **PASS** (combined A+B Lane-L at `a6c9cb9`: race sabotage-revert [lock removed → `[true,true]` ownerless-org repro → restore → exactly-one-wins 3/3 stable] · F-B1 confounders discriminate all 4 count-query legs · F-B2 pins source-verified) · **T6 ✅ finding remedied + re-proven** (FOR-UPDATE serialization + documented contract) | (checkpoints on wave branch) | `a6c9cb9` · close (this commit) | 8E ✅ · 262/24 | — | **✅ clean-gate close 2026-07-10 — org/membership/user lifecycle authority LIVE** (Doc-2 §5.1/§5.2 verbatim + §C4-derived user machine; Last-Owner Protection serialized fail-closed — T6 empirically raced check-then-act to an ownerless org pre-fix, remedy re-proven; expire/activate System workers §C6-conformant). Carries: **6.2 ← serialization contract obligation (commands pass their OWN tx)** · **6.6 ← OBS-B1 suspended-org-denies live-path test** · **IDN-7 ← durationToMs canonicalization** · RV-0150 NIT-1 → Team-8 queue |
| **W2-IDN-6.1** | Wired API — User/Account (§C4, 4 contracts) + `display_name` realization | IDN-3 ✅ | ⬜ | — | — | — | — | 8C | IDN-DISPLAYNAME ✅ | **UN-GATED 2026-07-09 (owner Option A)** — packet must carry: forward-only `display_name` migration + Prisma column + `get_user` projection completion + `update_user_profile.v1` wire field (Doc-4A-bounded) per `Doc-2_Patch_v1.0.6`/`Doc-6C_Patch_v1.0.2`; self + Admin-state; no active-org |
| **W2-IDN-6.2** | Wired API — Organization (§4, 7 contracts) | IDN-3, IDN-5 | ⬜ | — | — | — | — | 8C | — | DC-1 cascade out-of-wire |
| **W2-IDN-6.3** | Wired API — Membership (§5, 5 contracts) | IDN-3, IDN-5 | ⬜ | — | — | — | — | 8C | — | |
| **W2-IDN-6.4** | Wired API — Role & Permission (§5, 6 contracts) | IDN-2, IDN-3 | ⬜ | — | — | — | — | 8C | — | |
| **W2-IDN-6.5** | Wired API — Delegation (§5, **all 6 contracts**) + §5.10 boundary realization | IDN-4 ✅ | ⬜ | — | — | — | — | 8C | DELEG-EXPIRY ✅ | **#25 UN-GATED 2026-07-09** (`Doc-2_Patch_v1.0.7`): packet carries — add `suspended→expired` machine edge · extend System sweep to suspended (update the RV-0149 suspended-at-lapse pin, ruling-realization not regression) · real reinstate (reject expired, §C9 registers) · no-resurrection tests (new grant = new UUID + fresh audit) · **T6-OBS-1 M2-port existence-oracle future-watch** · §B.6 dedup |
| **W2-IDN-6.6** | Wired API — Context/Active-Org (§6, 3 contracts) | IDN-3 ✅ | ⬜ | — | — | — | — | 8C | — | switch/get/list context. **Binding carry (RV-0150 OBS-B1):** wiring org context (§C11 "org not suspended") MUST land WITH a discriminating integration test — suspended org → deny through the LIVE check_permission/context path (today org_status is enforced only at the delegation controlling-org read + the IDN-5 activate precondition) |
| **W2-IDN-6.7** | Wired API — Buyer Profile (§6, 2 contracts) | — | ✅ | PASS | PASS | (W1/D7) | — | 8C · 8D | — | **Already delivered** (Wave 1 + D7 audited write); verify under full M1 gate |
| **W2-IDN-6.8** | Wired API — Workflow-Settings (§6, 2 contracts) | IDN-1 | ⬜ | — | — | — | — | 8C | — | POLICY bounds via `core.config_value_query.v1` |
| **W2-IDN-7** | 7 `identity.*` POLICY keys seed + M1 conformance gate | all IDN | ⬜ | — | — | — | — | 8C · 8D · 8E | — | M1 module DoD. **Packet carries:** seed-PK convention = deterministic pre-authored UUIDv4 constants (Board Option A 2026-07-10, by pointer to `BOARD-PACKET-SEED-PK-UUID_v1.0.md`) · bind `identity.delegation_expiry_sweep_cadence` + activate the validity-default seed (RV-0149) · per-bundle slug-SET pins (Board-approved catalog-conformance leg) |

> **IDN-6 = 35 caller-facing Doc-5C contracts across 8 frozen sub-domains** (§C4–§C11); 6.7 already
> delivered. Per-contract routes + command/query + audit flags are in the Execution Playbook §5/§6.

---

## Waves 3–6 (placeholder — populated at wave entry)

| Wave | Modules | Status |
|---|---|---|
| **W3** | M2 `marketplace` · M5 `trust` · M6 `communication` · M7 `billing` (parallel) | ⬜ blocked on Wave 2 |
| **W4** | M3 `rfq` (the moat) | ⬜ blocked on W3 (M2/M5/M7) |
| **W5** | M4 `operations` · M8 `admin` (parallel) | ⬜ blocked on W4 (M3) |
| **W6** | M9 `ai` (advisory) | ⬜ |

---

## Open cross-cutting items

| Item | Kind | Status |
|---|---|---|
| WP-1.9 infra (Supabase + Vercel + push `main` + branch-protection) | Board-parked | ⛔ external — suites run locally until unparked (Build Plan §3) |
| **`[DC-1]`** — identity cross-module effects have no §8 emitter | Open escalation | **Do not build identity-originated events; Flag-and-Halt if a WP needs one** (Playbook §1/§11) |
| **`[D-5]`** — Outbox Audit Granularity | Board-pending | Shadows `W2-CORE-2` worker freeze; build dispatch, audit-leg lands with ruling |
| **`[ESC-IDN-DELEG-EXPIRY]`** — `reinstate`/`expire` delegation error boundary | Carried ESC | Gates IDN-6.5 contract #25 (Doc-2 §5.10) |
| **`[ESC-IDN-4M-INDEX]`** — Doc-4M M5 index correction (org/membership rows) | Carried ESC (RV-0150 OBS-1 binding carry) | **Packet on Board channel 2026-07-09** (`governanceReviews/BOARD-PACKET-IDN-4M-INDEX_v1.0.md` + `Doc-4M_Patch_v1.0.1_PROPOSAL.md`); non-blocking — no WP gated; on owner ruling the patch executes to `generatedDocs/` + Authority-Map row and the handle flips RESOLVED |
| `ESC-W1-USER-PROVISION` · `ESC-W1-CONTEXT-RESOLVE` · `ESC-W1-AUTH-401` · `ESC-IDN-BUYERPROFILE-CODE` · `ESC-IDN-AUDIT` · `ESC-IDN-SLUG` | Carried ESC | non-blocking; resolve/channel during Wave 2 |
| **WI-CAS-FLAKE** — CORE-2 lock-barrier race test (`outbox-dispatch-hardening.test.ts`) flakes under full-suite load | Work item (minted 2026-07-09 at IDN-1 close) | **✅ hardening APPROVED (Board batch, 2026-07-09) → folded into W2-CORE-4.** 4× observed (IDN-1 build, RV-0146 A-review, IDN-1 patch, RV-0150 A-review); passes isolated + on re-run every time; poll bound/barrier hardening ships with the [D-5] audit-leg WP |
| **T6-OBS-1 carry** — app-layer role↔org co-tenancy obligations | Binding packet carry (RV-0146) | MUST appear in the `W2-IDN-3` activation packet: (a) `check_permission` anchors `organization_id = active_org`, never role_id alone; (b) composition write-service validates `role.organization_id == active_org` (or NULL system-bundle) at issue; (c) delegation jsonb ⊆-existing/never-ownership-class (DC-CR7) |
</content>
