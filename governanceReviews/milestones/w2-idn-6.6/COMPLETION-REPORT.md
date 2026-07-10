# COMPLETION REPORT — Agent M1 · W2-IDN-6.6

## 0. Header
- **Role / Work item:** Agent M1 — Identity & Organization · `W2-IDN-6.6` (Wired API · Context/Active-Org §C8, 3 contracts + the RV-0150 OBS-B1 suspended-org-denial obligation) · packet: `governanceReviews/milestones/w2-idn-6.6/ACTIVATION-PACKET.md`
- **Outcome:** **COMPLETE (frozen-faithful scope)** — the 3 §C8 contracts wired + the OBS-B1 suspended-org denial landed on the SWITCH — **WITH a binding FLAG-AND-HALT** on the packet's ADDITIONAL "downstream `resolveActiveOrg` org-status gate" (part B of THE GATE), which conflicts with the frozen corpus (Doc-4C §C5 + Doc-5C §3.3). Escalated as `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]`; not resolved locally.
- **Checkpoint SHA:** `834ea78` (implementation; the stable review target) · branch: `wave/2-core-platform`

## 1. Summary
Wired the three Doc-4C §C8 / Doc-5C §6 Context/Active-Org contracts on their verbatim frozen routes: `switch_active_organization` (`POST /identity/active_context/switch_active_organization` · 200), `get_active_context` (`GET /identity/active_context` · 200), `list_my_organizations` (`GET /identity/organizations` · 200). Six packet paraphrases dissolved under verbatim re-read (§10). The switch is realized EXACTLY per its frozen §C8 declaration: **side-effect-free** — State Effects: none (PassB:537), **Audit: no** (PassB:539), **idempotent by nature** (PassB:538 — no §B.6 replay store; the mandatory `Idempotency-Key` header is a SYNTAX presence check only), no persisted active-org (there is no such column). The RV-0150 OBS-B1 suspended-org denial is landed on the SWITCH (§C8 BUSINESS "org not suspended", PassB:535) with a discriminating live-path test (switch-to-suspended → 422 BUSINESS, fail-closed, nothing persisted; switch-to-soft-deleted → 404 non-disclosure collapse). **FLAG-AND-HALT:** the packet's part-B obligation — a downstream `resolveActiveOrg` org-status gate — CONFLICTS with frozen Doc-4C §C5 (`soft_delete_organization` requires active-org context on a `suspended` org: STATE `active|suspended → soft_deleted`) and Doc-5C §3.3 (the general active-org predicate is ACTIVE MEMBERSHIP only). I built that gate, it reddened the closed W2-IDN-6.2 soft-delete-from-suspended test, and I **reverted it** and escalated. New 8C+8E slice (16 tests); full suite **363/30** green vs the **347/29** dispatch baseline; zero regressions; tsc/ESLint/Prettier/structure/cross-schema-FK green; `[DC-1]` zero events.

## 2. Files changed
Added:
- `src/modules/identity/infrastructure/data/context.repository.ts`
- `src/modules/identity/application/commands/switch-active-organization.command.ts`
- `src/modules/identity/application/queries/get-active-context.query.ts`
- `src/modules/identity/application/queries/list-my-organizations.query.ts`
- `src/modules/identity/api/switch-active-organization.handler.ts`
- `src/modules/identity/api/get-active-context.handler.ts`
- `src/modules/identity/api/list-my-organizations.handler.ts`
- `src/server/identity/switch-active-organization.route-handler.ts`
- `src/server/identity/active-context.route-handler.ts`
- `src/server/identity/list-my-organizations.route-handler.ts`
- `app/api/identity/active_context/route.ts`
- `app/api/identity/active_context/switch_active_organization/route.ts`
- `tests/integration/active-context-wire-slice.test.ts`

Modified:
- `src/modules/identity/contracts/types.ts` (additive §C8 DTO block)
- `src/modules/identity/contracts/services.ts` (additive §C8 facades + wire-mapper re-exports; existing exports unbroken)
- `src/modules/identity/domain/policies/membership-participation.policy.ts` (comment-only: corrected the `§C11`→`§C8` mislabel citation + the enforcement-home note — NO behavior change, §10 call 7)
- `src/server/context/active-org.ts` (comment-only net change after the revert — the type-doc records the §3.3/§C5 rationale + the escalation pointer; the resolution BEHAVIOR is byte-equivalent to HEAD)
- `src/server/identity/index.ts` (additive §C8 handler exports)

Deleted: none. **`src/server/context/with-active-org.ts` is byte-identical to HEAD** (I added then fully reverted a reason-union widening — the revert restored it exactly; `git status` shows it unmodified).

## 3. Contracts changed
`src/modules/identity/contracts/{types,services}.ts` — **ADDITIVE ONLY** (M1-owned; full suite green is the regression proof):
- New DTO families: `SwitchActiveOrganizationInput/Context/Result/Outcome` · `ActiveContextView` · `GetActiveContextResult` · `MyOrganizationView` · `ListMyOrganizationsInput/Result` (frozen §C8 field sets by pointer; camelCase house shape, `ESC-WIRE-FIELD-CASING` carried).
- New facades: `switchActiveOrganization` · `getActiveContext` · `listMyOrganizations` + the three wire mappers (`mapSwitchActiveOrganization`/`contextInvalidInput` · `mapGetActiveContext` · `mapListMyOrganizations`).
- The org-half predicate `organizationParticipatesInAccessFormula` was ALREADY re-exported on the contracts face (pre-existing); no new export added (a duplicate I first wrote was removed).
Consumed only: `@/modules/core/contracts` (unchanged — the switch/reads touch NO M0 contract; no audit, no ID allocation, no config read).

## 4. Migrations
**None.** Zero `prisma/` change of any kind (8 migration files, unchanged; `check-no-cross-schema-fk` clean). The packet's "NO migration expected" held — there is no persisted active-org column (Doc-2 §10.2 / the schema; `grep` confirmed absent), and the switch is side-effect-free by frozen declaration, so no store was introduced. The Flag-and-Halt migration condition never triggered.

## 5. Events
**Zero** (frozen truth: M1 emits no Doc-2 §8 event — `[DC-1]`; every §C8 contract states `Events: none`). No outbox write anywhere in the diff. The `[DC-1]` cascade/notification effects stay out-of-wire.

## 6. Tests
Bands: **8C** (envelope · the frozen §C8 registers per contract PassB:536/:549/:560 · idempotency — the switch's idempotent-BY-NATURE / no-side-effect / no-store property discriminating-tested · actor-scope self/active-org · non-disclosure byte-collapse · fail-closed pagination) + **8E** (the RV-0150 OBS-B1 suspended-org denial on the SWITCH, discriminating-tested; only-active-membership-permits-switch; soft-deleted→NOT_FOUND vs suspended→BUSINESS discrimination; the FROZEN-FAITHFUL downstream-behavior test that documents the flag) — `tests/integration/active-context-wire-slice.test.ts`, **16 tests**, real PostgreSQL (`docker compose up -d db`), composition surfaces only + direct `resolveActiveOrg` assertions.
- New slice: **16/16 PASS**.
- **Baseline delta:** full suite **363 tests / 30 files ALL PASS** vs dispatch baseline **347/29** — delta = **+16 tests / +1 file**, all this WP; **zero regressions**. (The known WI-CAS-FLAKE in `outbox-dispatch-hardening.test.ts` — the standing non-deterministic W2-CORE-4 fold — fired in the pre-change baseline run but not in the post-change full run; it is unrelated to this WP.)
- tsc `--noEmit` exit 0 · ESLint 0 problems (20 WP files) · Prettier clean · `check-structure` PASS · `check-no-cross-schema-fk` clean · `check-no-secrets` clean.
- **Discrimination highlights:**
  - *OBS-B1 on the switch (LIVE PATH):* switch-to-suspended (active member) → 422 BUSINESS `identity_context_state_invalid`, org status byte-unchanged, ZERO audit rows. switch-to-active → 200. org-status is the discriminator: the switch command reads the live org row (`readOrganizationLifecycle`) + applies the domain policy `organizationParticipatesInAccessFormula` — not a shadow (the frozen §C8 BUSINESS check reading live DB state).
  - *soft-deleted ≠ suspended:* switch-to-soft-deleted (cascade-tombstoned membership) → 404 collapse (non-disclosure), NOT the 422 BUSINESS leg (which would reveal the org exists-but-suspended). The two frozen legs are separately pinned.
  - *only-active-membership-permits:* switch where the caller's membership in the (active) target is `suspended` → 404 (§C8 "only an active membership permits the switch"). A realization that consulted the org alone turns this red.
  - *switch idempotent BY NATURE:* same key twice → byte-identical result (`{ organizationId }`), and audit-count + command_dedup-count UNCHANGED across both calls — proving State Effects: none / Audit: no / no §B.6 store. A store or audit write reddens the count assertion.
  - *effective_permission_summary provenance:* get_active_context's summary EQUALS the granted tenant-slug set (`role_permissions` NULL-org tenant rows) — the same set `check_permission` resolves (not re-derived); the EXACT frozen field set is pinned (`Object.keys` sorted-equality — no widened field).
  - *list self-scope + order:* another user's org NEVER appears; items ordered by org name (AAA before ZZZ) with the frozen tiebreaker; `state_filter=active` excludes a suspended membership, `all` includes it.
  - *fail-closed pagination:* `page_size`/`cursor`/`sort`/bad `state_filter` each → 400 `identity_context_invalid_input` (ESC-IDN-LIST-PAGESIZE).
  - *RED-THEN-GREEN (the reverted downstream gate):* before reverting, I temporarily removed the org-status conjunct from `resolveActiveOrg` and the two DOWNSTREAM tests went RED (`resolve.resolved` true-not-false; the multi-org selector picked the older SUSPENDED org) — proving the downstream gate WAS a real live-path gate (not a shadow). But that same gate reddened the closed W2-IDN-6.2 soft-delete-from-suspended test (404≠200) — the frozen §C5 conflict — so it was reverted (see §8).

## 7. Self-review
- Self-check (`/ivendorz-security`-lens, manual sweep): the switch/reads server-resolve the principal (`resolveSelfUser` / `withActiveOrg`) — the client-supplied `organization_id` is validated against the caller's own memberships, NEVER adopted (Invariant #5; the switch is the only surface taking a client org id, and it is server-validated at every leg). Reads self-scoped (`get_active_context` = own context; `list_my_organizations` = own memberships, self-anchored on `user_id` at the app-composition edge — the `resolveActiveOrg`/`resolveSelfUser` precedent; the `memberships_read` own-leg + `memberships_user_idx` Band-H index exist for exactly this). No governance-signal read/write. No cross-module table access, import, or FK (the context repo touches `identity.memberships`/`identity.organizations` only; M0 not consumed).
- Red-Flag scan (CLAUDE.md checklist): **CLEAR** — no new module · no ownership change · no signal touch · no cross-module DB access/FK · no event · no frozen-doc edit · workflows own no state · reads are disposable projections · Admin bypasses nothing · no ADR override.
- Standing-charter Never-list: no violation.
- tsc/ESLint/Prettier/structure/FK/secrets: green (§6).
- **Self-severity of residuals** (CLAUDE.md §13 by pointer; Raise ≠ Accept): BLOCKER 0 · MAJOR 0 · MINOR 0 · NIT 0 · **OBS 3 + 1 escalation** —
  - **`[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]` (the FLAG-AND-HALT, §8):** the packet's downstream-gate obligation conflicts with the frozen corpus; escalated, not resolved. (Class: corpus conflict — the gating item for THE GATE part B.)
  - OBS-1: the switch requires the `Idempotency-Key` header (declared `Idempotency: required` + Doc-5C §6.4 / CHK-5A-080) but has NO dedup store to key it against (idempotent by nature) — the header is validated-present then unused (call 3).
  - OBS-2: `list_my_organizations` resolves the caller's memberships on the bare app-edge client (self-anchored `user_id`) rather than under an RLS-scoped tx, because the read spans ALL the caller's orgs and `organizations_member_visible` (state='active') would hide `state_filter=all` non-active-membership orgs (call 9).
  - OBS-3: with the downstream gate reverted (frozen-required), the Wave-1 DEFAULT resolveActiveOrg selector CAN still auto-pick a suspended org as the default context (a stopgap-model artifact; the real model uses the `Iv-Active-Organization` header + the switch gate). Not a frozen violation — get_active_context is a self-read, not a business-access grant; the switch is the adoption gate (call 6).

## 8. Open questions / ESC

### `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]` — the FLAG-AND-HALT (Handoff Note; NOT resolved locally)
**The conflict.** The packet's THE GATE has two parts: (A) `switch-to-suspended → DENY` and (B) "the resolved context downstream cannot treat a suspended org as active — a live authz gate, NOT a shadow check in the command", realized in `src/server/context/resolveActiveOrg`. Part (A) is frozen-faithful and delivered (the §C8 switch BUSINESS check). Part (B) — a **blanket org-status gate in the GENERAL context resolver** — **conflicts with the frozen corpus:**
- **Doc-4C §C5 `soft_delete_organization` (PassB:283/287, verbatim):** "Authorization: Membership active … Scope active-org … Validation Matrix: … CONTEXT (active-org) → AUTHZ (`can_delete_organization`, Owner) → SCOPE → **STATE (Doc-2 §5.1 `active|suspended → soft_deleted`)**". → an Owner MUST be able to hold a **suspended** org as active-org context to soft-delete it. Doc-2 §5.1: "`active|suspended → soft delete [Owner or admin; cascade …]`".
- **Doc-5C §3.3 (PassB:180, verbatim):** "the server **MUST** validate that the principal holds an **active membership** in the named organization **before** any business processing". → the GENERAL active-org context predicate is **active membership**, NOT "org not suspended". "org not suspended" is the SWITCH's own BUSINESS stage (§C8 PassB:535), not a property of every context resolution.
**The proof.** I built the part-(B) blanket gate in `resolveActiveOrg`. It reddened the **closed W2-IDN-6.2** test "DELETE: Owner soft-deletes (active AND suspended sources — the §5.1 edges): 200" → the suspended-source soft-delete collapsed to 404 (no resolvable active context). That is a direct violation of the frozen §C5 STATE edge — surfaced by a regression, exactly the case the W2-IDN-6.2 close-carry pre-flagged ("`resolveActiveOrg` still resolves a suspended org as active context (exercised in the 6.2 DELETE-from-suspended test) — the enforcement leg is 6.6's").
**Why not resolvable locally.** A frozen-faithful part-(B) would need to be OPERATION-AWARE (deny business access to a suspended org, but EXEMPT the §5.1-permitted-from-suspended lifecycle edges: soft_delete by Owner, reinstate by Admin). `resolveActiveOrg` (and `check_permission`) are generic — a blanket gate there breaks §C5; adding a lifecycle-slug exemption would COIN an authorization classification not in the frozen text (a Red-Flag). The frozen text does not specify how the downstream context gate exempts the §5.1 edges → the packet's halt condition ("any ambiguity in the §C11 active-context precondition the frozen text doesn't resolve → Handoff Note, never resolve locally").
**What I delivered instead (frozen-faithful).** The org-status enforcement lives in the SWITCH (§C8 BUSINESS "org not suspended") — the frozen enforcement point for adopting active context. This DISCHARGES the binding review-log OBS-B1 obligation verbatim: "when 6.x wires org context (§C11), a discriminating integration test (suspended org → deny through the live path) MUST land with it" — the switch (the live path for org-context wiring) denies a suspended org, discriminating-tested. `resolveActiveOrg` stays membership-only (§3.3), so §C5 is preserved.
**The ask (coordinator / Board).** Adjudicate whether part (B) is truly required beyond the switch. If yes, it needs a frozen decision (an operation-aware context/participation model or a §C5-exempting rule) — an additive corpus patch, not a code decision. Registry row NOT written by me (coordinator-owned file).

### Other ESC dispositions (cited; none coined)
- **`ESC-WIRE-FIELD-CASING` (🟥 owner-pending) — CARRIED as instructed:** all §C8 result payloads built in the ratified camelCase house shape (the 6.1/6.2/6.3/6.5 wires; the delegation-list `pageInfo:{hasMore}` precedent). Conditional casing sweep lands with the owner's ruling.
- **`ESC-IDN-LIST-PAGESIZE` (🟠) — conditional carry CONSUMED:** `list_my_organizations` paginates; realized fail-closed (page_size/cursor/sort → 400 citing the handle; full self-scoped set with `hasMore:false`) — the 6.5 `list_delegation_grants` posture, no coined bound.
- **`[ESC-IDN-AUDIT]` — N/A this WP:** all three §C8 contracts are UNAUDITED by frozen declaration (switch Audit:no PassB:539; the two reads are queries §17.1). Zero audit tokens introduced; zero §9 near-pointers needed.
- **`[DC-1]`** — held: zero identity events; no cross-module call/cascade.
- **`[DC-5]`** — no window key read (the switch has no dedup store; the reads are unaudited). The IDN-7 seed carry is untouched by this WP.

**Judgment-call log** (EVERY call FOR Review-A adjudication; none self-ratified):
1. **The Context sub-domain is Doc-4C §C8, not §C11 (packet + code mislabel — dissolved).** Verbatim: `§C11` is "Organization Workflow Settings Contracts" (PassB:699); the 3 context contracts + the "org not suspended" precondition are §C8 (PassB:525–563). The `membership-participation.policy` also cited `§C11` (corrected, call 7). Not F&H — a paraphrase dissolved (the packet's own predicted class); the frozen text is unambiguous.
2. **The switch is SIDE-EFFECT-FREE — no write, no audit, no §B.6 store.** Verbatim §C8: State Effects "none (session context; no entity §5 transition)" (:537); Audit "**no** … not a Doc-2 §9 business action (§17.1)" (:539); Idempotency "**idempotent by nature** … replay → same context, **no side effect**" (:538); and `grep` confirms NO persisted active-org column. So the packet's "Audited per its frozen Audit declaration" resolves to UNAUDITED, and "claim leg if create-class" resolves to NO claim/NO store (not create-class — State Effects: none). The switch is a pure validate-and-echo; the active org is carried in the `Iv-Active-Organization` header (Doc-5C §3.3), re-validated per request. Not F&H — the frozen declaration is explicit.
3. **The `Idempotency-Key` header is nonetheless MANDATORY on the switch (SYNTAX presence), then unused.** Re-read: §C8 declares `Idempotency: required` (:538); Doc-5C §6.4 (mutations `Idempotency: required` → header mandatory) + CHK-5A-080. So the wire requires the header (400 if absent) even though no store keys it (idempotency is intrinsic). OBS-1. Not F&H — conforms to the declaration + checklist; the store is unnecessary per "no side effect".
4. **§C8 active-context precondition — DERIVED (which org states may be active context; what the switcher rejects):** WHICH: ONLY `active` (Doc-2 §5.1 org states; §C8 BUSINESS "org not suspended for the user's access" :535). REJECTS: (a) not an active member of the target → NOT_FOUND collapse `identity_context_not_found` (:535 SCOPE "NOT_FOUND collapse if not a member"; :536); (b) active member but org NOT active → BUSINESS `identity_context_state_invalid` (:535 BUSINESS; :536). Non-disclosure split: a **soft-deleted** org's cascade tombstones the membership → resolves as not-a-member → NOT_FOUND (never reveals it exists-but-suspended); a **suspended** org (member is live) → BUSINESS, surfaced to the party. Grounded, not assumed.
5. **The switch's org-half enforcement binds the SAME domain predicate `organizationParticipatesInAccessFormula` the STATEMENT policy holds** (M1 domain) — resolving the OBS-B1 "statement-vs-enforcement split" AT the switch (the frozen enforcement point), reading the live org row. Not a shadow: it is the frozen §C8 BUSINESS check over live DB state.
6. **The DOWNSTREAM gate is FLAG-AND-HALT, not delivered (§8).** The frozen §C5 (soft_delete from suspended) + §3.3 (general context = active membership) preclude a blanket org-status gate in `resolveActiveOrg`; proven by the 6.2 regression. `resolveActiveOrg` stays membership-only. OBS-3 (the Wave-1 default selector can still auto-pick a suspended org) is a stopgap-model residual, not a frozen violation.
7. **Comment-only correction of the `membership-participation.policy` citation (`§C11`→`§C8`) + the enforcement-home note** (truthful-comment discipline, the F-B1 lens) — the false frozen citation on the very policy the switch binds would mislead; the function BEHAVIOR is byte-identical (full suite green). Not F&H — a comment fix, not a rebuild; disclosed because it touches a domain file.
8. **`get_active_context` composes `check_permission`'s granted-slug read (`resolveGrantedTenantSlugs`), not a re-derivation** — the frozen §C8 says the summary is "from `check_permission` resolution, not re-derived" (:547/:552). Runs inside `withActiveOrg` (org-status-aware only via §3.3 = membership; NOT_FOUND collapse when no active context).
9. **`list_my_organizations` resolves on the bare app-edge client (self-anchored `user_id`), NOT under an RLS-scoped tx.** Re-read: §C8 CONTEXT stage is "authenticated" only (:559) — the list is the switcher SOURCE, so it must resolve across ALL the caller's orgs (incl. before any context is set / when the only org was suspended). The `organizations_member_visible` RLS (state='active') would hide `state_filter=all` non-active-membership orgs; the app-edge self-anchor (the `resolveActiveOrg`/`resolveSelfUser` documented precedent) is primary + complete. OBS-2. Not F&H — the established boundary-legal app-edge tenant-directory read; the schema's `memberships_user_idx` is labelled "Band H (list_my_organizations)".
10. **`state_filter` filters MEMBERSHIP state only, never ORG status** — §C8 `state_filter : enum(active|all)` (:557) + Visibility "only orgs where the caller has a membership" (:561). A member's own suspended org still appears in the list (the switch, not the list, enforces "org not suspended"). Soft-deleted-org cascade-tombstoned memberships (`deleted_at`) are always excluded.
11. **Non-disclosure collapse:** switch not-a-member / no-user → ONE byte-identical `identity_context_not_found` 404 (the `get_delegation_grant` collapse precedent); `list` no-principal → the fail-closed empty list (a collection face's existence is not a protected fact — the 6.5 call 21 realization).
12. **No If-Match/ETag anywhere on §C8** — no §C8 contract declares `Concurrency: optimistic` and no §C8 register authors a CONFLICT code (all three re-read: :536/:549/:560). The switch is side-effect-free; the reads are queries.

## 9. Checkpoint
- `834ea78` — `feat(identity): W2-IDN-6.6 §C8 context/active-org wired API (3 contracts) + switch org-not-suspended enforcement [checkpoint]` — bounds the ENTIRE WP (19 files: contract DTOs → context repo → command + 2 queries → 3 mappers → 3 route-handlers → index → 3 thin routes → the wire slice; + the comment-only domain-policy citation fix). ONLY W2-IDN-6.6 files staged; the external working-tree changes (`docs/backend/backend_execution_tracker.md`, `generatedDocs/00_AUTHORITY_MAP.md`, `generatedDocs/Doc-2_Patch_v1.0.8.md`, all `governanceReviews/**` incl. the coordinator Board-decision/packet files) left untouched and unstaged. `with-active-org.ts` verified byte-identical to HEAD (revert exact).
- (This report + the Handoff Note land as a follow-up governance record — the 6.2/6.5 precedent.)

## 10. Packet gaps
Files read beyond the packet's §2–§4 lists (each needed; none contradicted the packet except the paraphrases below):
- `generatedDocs/Doc-4C_Content_v1.0_PassB.md` §C8 (:525–563) + §C11 header (:699, to confirm the mislabel) + §C5 soft_delete (:281–290, the conflict source) — the load-bearing derivation.
- `generatedDocs/Doc-2 §5.1` (:462–476, org states) — which states may be active context.
- `generatedDocs/Doc-5C Pass1 §2.4/§2.5/§3.3/§3.6` + `Pass2 §4.3/§6.1/§6.2/§6.4/Appendix A` — the routes, the `Iv-Active-Organization` header re-validation semantics (call 9), the Idempotency-Key mandatory rule (call 3), CHK-5A-061/080.
- `prisma/migrations/20260627202753_identity_init/migration.sql` (the `memberships_read` own-leg + `organizations_member_visible` state='active' — call 9) + `prisma/schema.prisma` (OrgStatus enum; the absent active-org column — call 2).
- `project-management/review-log.md` RV-0150 OBS-B1 (:2274, the binding obligation verbatim).
- The W2-IDN-6.2/6.3/6.5 completion reports + `src/server/context/*` + `src/server/authz/*` + `src/modules/identity/application/queries/*` + the delegation wire faces (house precedents).
- **Packet-precision notes for Team-8:** (a) the packet's "§C11" is Doc-4C **§C8** (Doc-4C §C11 = Workflow Settings) — a systematic mislabel also in the packet's Doc-2 "§C6/§C11" rows; (b) the packet's part-B "downstream `resolveActiveOrg` gate" collides with the §C5 soft-delete-from-suspended edge that the 6.2 close-carry ALREADY flagged as living in `resolveActiveOrg` — the packet did not reconcile the two, and the reconciliation is a frozen decision (§8).

## 11. Readiness
- **Next gate:** **Review-A at `834ea78`** · **Team-6 pre-flag: YES** — active-org context is the tenant-boundary authority (Invariant #5). Surfaces for the security lens: the switch's server-validation of a client-supplied target org (no client-trusted org adoption); the org-not-suspended BUSINESS gate + the soft-deleted/suspended non-disclosure split; the self-scoping of both reads (no cross-user context/org disclosure); the fail-closed pagination; and — decisively — **the `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]` FLAG-AND-HALT** (the packet's downstream-gate part-B vs frozen §C5/§3.3): Review-A/Board must rule whether the switch enforcement suffices or a frozen change is required.
- **Blocked on:** the `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]` adjudication (the packet's part-B acceptance criterion cannot be met without violating frozen §C5 — a coordinator/Board decision). `ESC-WIRE-FIELD-CASING` is owner-gated program-wide (carried, non-blocking).
- **Suggested next work item:** W2-IDN-7 (POLICY seed) — takes the §B.6 legs of the OTHER sub-WPs live (this WP added no dedup store).

## 12. Carries emitted (outbound)
| Target | Obligation | Class |
|---|---|---|
| **Coordinator / Board** | `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]`: the OBS-B1 "downstream context cannot treat a suspended org as active" gate conflicts with frozen §C5 (soft_delete from suspended) + §3.3 (general context = active membership). Adjudicate: switch-enforcement-suffices, OR an additive corpus patch (operation-aware participation / §C5 exemption). | **binding (Board action) — the FLAG-AND-HALT** |
| Board channel (owner) | `ESC-WIRE-FIELD-CASING`: the §C8 result faces (`{organizationId}`, `ActiveContextView`, `MyOrganizationView`, `pageInfo:{hasMore}`) added in the camelCase house shape — include in the Option-A sweep if so ruled | carried handle |
| Board channel (registry) | `ESC-IDN-LIST-PAGESIZE`: `list_my_organizations` joins `list_delegation_grants` as a fail-closed-pagination consumer — the identity page-size key remains unregistered | carried handle (existing) |
| Team-8 (pointer hygiene) | The packet's "§C11" = Doc-4C **§C8**; the packet did not reconcile part-B with the 6.2 `resolveActiveOrg`/soft-delete-from-suspended carry (§10) | packet-precision note |
| Future-watch | OBS-3: the Wave-1 default `resolveActiveOrg` selector can auto-pick a suspended org as default context (a stopgap-model residual; the header+switch model supersedes it) | future-watch |

## Frozen Authority Checklist
Before execution, the assignee confirms:

☑ All cited documents are frozen. *(Doc-4C PassB §C8 :525–563 + §C5 :281–290 + §C11 header :699 · Doc-2 §5.1 :462–476 + §9 · Doc-5C Pass1 §2.4/§2.5/§3.3/§3.6 + Pass2 §4.3/§6.1/§6.2/§6.4 + Appendix A CHK-5A-061/080 · Doc-5A §5.6/§6.1/§6.2/§8.5/§8.6/§9.2 · Doc-4A §9/§11.2/§14.3/§14.7 · Doc-6C §2.1/§6.2a · Doc-3 v1.9 §Notes)*
☑ Every cited section has been re-read verbatim. *(SIX packet paraphrases dissolved: §C11→§C8; "Audited"→Audit:no; "§B.6 store/claim"→idempotent-by-nature/no store; "downstream gate"→§C5/§3.3 conflict; "resolved context downstream"→§C5 conflict; "active-context STATE model"→no persisted column, header-carried. Logged as calls 1–3, 6, and §8.)*
☑ No draft document is treated as authority. *(playbook/tracker/review-log consulted as living pointers; every load-bearing bind is to the frozen text; the packet is a coordinator instruction, subordinate to the frozen corpus — hence the Flag-and-Halt.)*
☑ Any uncertainty results in Flag-and-Halt. *(the §C8-vs-§C5 downstream-gate conflict → `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]`, escalated, not resolved locally.)*

---

## RV-0158 F1 fix-forward amendment (additive — originals above untouched)

**Provenance:** RV-0158 Review-A at `834ea78` — 🟠 REVISION, 0 BLOCKER · 0 MAJOR · **1 MINOR (F1, accepted)** · 0 NIT · 3 OBS + the escalation adjudicated. Review-A **vindicated the Flag-and-Halt**: A2 UPHELD (OBS-B1 DISCHARGED at the switch — §C8 live-path), A3 CONFIRMED (part-B frozen-INCOMPATIBLE — §C5 needs a suspended org as active context for soft_delete), A4 as-built byte-faithful (revert exact), A5 `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]` → OWNER/Board **NON-gating** completeness question. **6.6 close blocks ONLY on F1** (the escalation does not gate).

**F1 (MINOR, accepted — truthful-comment / false-invariant):** the reverted **part-B narrative** survived in comment sites asserting a FALSE invariant — "`resolveActiveOrg`/`withActiveOrg` gates `org_status` → a suspended org NEVER resolves → two live enforcement points" — the EXACT OPPOSITE of the as-built (the part-B CODE was reverted, but the narrative was not) and self-contradictory with the SAME commit's ALREADY-correct docstrings (`membership-participation.policy.ts` + `active-org.ts` "DELIBERATELY does NOT gate org_status"), and proven false by the WP's OWN passing test (`active-context-wire-slice.test.ts:451-453` — a suspended org's context `resolved===true` + get_active_context 200).

**Patch (COMMENT-ONLY; ZERO code/test/behavior change): `docs(identity): W2-IDN-6.6 correct reverted part-B comments to frozen-faithful switch-only enforcement (RV-0158 F1) [checkpoint]` — `d1cb2a1`.** `git diff -U0` over the 6 files = comment lines only (verified: the non-comment added/removed set is EMPTY); full suite **363/30** unchanged; tsc/ESLint/Prettier green. The frozen-faithful replacement at every site: **the `switch` (§C8 BUSINESS `identity_context_state_invalid`) is the SOLE live enforcement point of org-not-suspended; `resolveActiveOrg`/`withActiveOrg`/`get_active_context` resolve MEMBERSHIP-ONLY (Doc-5C §3.3) and CAN surface a suspended org — REQUIRED for §C5 `soft_delete_organization` over the §5.1 `active|suspended → soft_deleted` source; the residual is the open `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]` Board item.**

**Corrected sites (the 8 RV-0158 F1 sites + 1 disclosed adjacent, all within the 6 named files):**
1. `src/server/identity/active-context.route-handler.ts` — the `withActiveOrg` "org-status-aware … a suspended org NEVER resolves" header claim → membership-only (§3.3).
2. `src/server/identity/active-context.route-handler.ts` — the `handleGetActiveContext` `404`-collapse docstring "incl. the OBS-B1 suspended-org case, which never resolves" → "no ACTIVE MEMBERSHIP … NOT an org_status check."
3. `src/modules/identity/application/queries/get-active-context.query.ts` — "confirmed ACTIVE membership in an ACTIVE org; … a suspended org never resolves" → membership-only (§3.3) + §C5 rationale.
4. `src/modules/identity/api/get-active-context.handler.ts` — "the OBS-B1 suspended-org case, which never resolves" → membership-only; the switch gates org-not-suspended.
5. `src/modules/identity/application/commands/switch-active-organization.command.ts` — "one policy, **two live enforcement points**" → the switch is the SOLE live enforcement point; the general resolver is membership-only.
6. `src/server/identity/switch-active-organization.route-handler.ts` — "the downstream `resolveActiveOrg` gate enforces … two live points" → the switch is the SOLE point; `resolveActiveOrg` membership-only.
7. `src/modules/identity/contracts/services.ts` — the `getActiveContext` facade docstring "the org-status-aware resolution" → "MEMBERSHIP-ONLY resolution, Doc-5C §3.3 — org_status NOT gated."
8. `src/modules/identity/contracts/services.ts` — the org-half re-export note "binds the SAME rule the switch enforces … one predicate, two live enforcement points" → sole enforcement point = the switch; the seam does NOT bind it.
9. `src/modules/identity/contracts/services.ts` — **(disclosed, adjacent)** the §C8 SECTION HEADER "the downstream CONTEXT resolution (`resolveActiveOrg` … UPSTREAM of §C3 AUTHZ) bind the SAME domain predicate" carried the SAME false-narrative root; corrected for consistency (same file, same finding — no comment may claim the seam binds the predicate).

**Judgment-call log — closing the un-logged call (per RV-0158):** the part-B-narrative claim ("two live enforcement points" / "the downstream `resolveActiveOrg` gate") was authored as an unlogged gloss alongside the correct code (the CODE revert was logged as §8 call 6; the surviving NARRATIVE was not). It is now **RETRACTED as false** and replaced by the frozen-faithful truth above — the switch is the SOLE live enforcement point; the general context resolution is membership-only (Doc-5C §3.3), which is REQUIRED by Doc-4C §C5. This aligns every §C8 comment with the as-built and with the already-correct `membership-participation.policy.ts:38-44` / `active-org.ts:49-55` docstrings.

**Next gate:** A delta re-verify at `d1cb2a1` → Review-B ∥ Team-6 (pre-flag YES). The `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]` Board completeness question is NON-gating (RV-0158 A5).

---

## RV-0158 F-B1 fix-forward amendment (additive — originals above untouched)

**Provenance:** RV-0158 at `d1cb2a1` — **A-delta ✅ PASS** (F1 resolved, comment-only proven) · **Team-6 ✅ PASS** (0/0/0/0 + 2 OBS; tenant-boundary Inv #5 proven strict — S2.3 residual CONTAINED at the switch) · **Review-B 🟠 REVISION (F-B1 MINOR, accepted)**. Review-B's 5 sabotage probes confirmed the as-built CODE frozen-faithful — notably **probe (d): reinstating the reverted part-B org_status gate in `resolveActiveOrg` RED-lit ONLY the frozen-faithful resolver test (switch tests stayed green)** — TEST-PINNING the escalation's core (the resolver must NOT deny; §C5/§3.3). The gate failed solely on a **9th surviving F1-class comment OUTSIDE the F1 6-file set**, plus a root-cause process finding.

**F-B1 (MINOR, accepted — truthful-comment, F1 parity):** `src/server/identity/index.ts:116-117` (the §C8 export-block header, added by `834ea78`, OUTSIDE the F1 6-file set → survived both the F1 fix and the A-delta's file-scoped grep) asserted "the RV-0150 OBS-B1 suspended-org denial's **live-path gate lives in `resolveActiveOrg`** (imported by these compositions)" — FALSE/opposite of as-built (the denial is in the SWITCH command; `resolveActiveOrg` is membership-only; the switch composition imports `resolveSelfUser`, NOT `resolveActiveOrg`), and it contradicted its own sibling `switch-active-organization.route-handler.ts:16-17`.

**Patch (COMMENT-ONLY; ZERO code/test/behavior change): `docs(identity): W2-IDN-6.6 correct final part-B comment in server barrel + whole-surface sweep (RV-0158 F-B1) [checkpoint]` — `c53c531`.** The 3-line §C8 barrel header rewritten to the frozen-faithful truth (switch = SOLE org-not-suspended enforcement §C8; `resolveActiveOrg` membership-only §3.3, does NOT gate org_status, switch composition uses `resolveSelfUser`; residual `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]`) — consistent with the 9 F1 sites. `git diff -U0` non-comment set EMPTY; suite **363/30**; tsc/ESLint/Prettier green. External `app/(public)/_components/landing/hero.tsx` left untouched.

**THE WHOLE-SURFACE SWEEP (RV-0158 Review-B OBS-1 root-cause mandate — grep the ENTIRE 19-file WP surface + paraphrase variants, not enumerated sites). Post-fix result: ZERO false-narrative survivors.** Classification of every candidate hit:

*Pass-1 — `never resolve | never reached | two live | two enforcement | org-status-aware`:* **0 hits** (all eliminated by F1 + F-B1).

*Pass-2 — false-claim shapes (`(gate|denial|enforce) … (resolveActiveOrg|withActiveOrg)` and the inverse), after excluding correct negations:* **0 surviving false claims.**

*Every `resolveActiveOrg` / `withActiveOrg` comment mention across the 19 files, classified:*
| Site | Classification |
|---|---|
| `switch-active-organization.command.ts:22` · `switch-active-organization.route-handler.ts:16` · `services.ts:1149` · `services.ts:1193` · `active-context.route-handler.ts:4` · `get-active-context.query.ts:6` · `services.ts:1171` · `membership-participation.policy.ts:40` · `active-org.ts:55` | **CORRECT NEGATION** (F1-fixed / already-correct: "MEMBERSHIP-ONLY §3.3", "does NOT gate org_status", "escalated") |
| **`src/server/identity/index.ts:116-117`** | **FALSE → FIXED this patch (F-B1)** |
| `services.ts:304/326/399/452/650/760/774/787/901/926/938/950/1020/1031/1044/1056` (16× "MUST … INSIDE `withActiveOrgContext`") | **UNRELATED** — pre-existing 6.1/6.2/6.4/6.5 RLS-tx "invoke inside the tx" instructions; assert NO org_status/denial claim |
| `context.repository.ts:47` · `list-my-organizations.route-handler.ts:7` | **UNRELATED** — the app-edge `resolveActiveOrg`/`resolveSelfUser` precedent for the self-anchored list read; no org_status claim |
| `active-context.route-handler.ts:28` · `get-active-context.handler.ts:5` · `switch-active-organization.command.ts:19-24` (the "SOLE live enforcement point" body) | **CORRECT NEGATION** (F1-fixed) |
| `tests/…:23/430/433` | **CORRECT** — describe the flag/conflict ("Gating org_status in `resolveActiveOrg` breaks that frozen lifecycle edge") |

*Pass-3 — `lives in | enforced by | bound by | binds the | gate lives | imported by`:* the only §C8-relevant hit was `index.ts:117` (fixed); all other hits are frozen-field "bound by pointer" language or generic "the mapper/command lives in M1" placement notes — **UNRELATED.**

**Confirmation:** no comment in the W2-IDN-6.6 surface states or implies the suspended-org denial/gate "lives in" / "is enforced by" / "is bound by" `resolveActiveOrg`/`withActiveOrg`/the context seam; the SWITCH is named as the sole enforcement point everywhere; every resolver mention is a correct membership-only negation or an unrelated RLS-tx/placement note. **Zero survivors — no 10th instance.**

**Next gate:** combined A+B delta re-verify at `c53c531` (both are the comment-lens; Team-6 no re-entry — comment-only, no security behavior) → close.
