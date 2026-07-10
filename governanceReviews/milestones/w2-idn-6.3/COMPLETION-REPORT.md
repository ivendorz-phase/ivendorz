# COMPLETION REPORT — Agent M1 · W2-IDN-6.3

## 0. Header
- **Role / Work item:**    Agent M1 — Identity & Organization · `W2-IDN-6.3` (Wired API · Membership §5, 5 contracts) · packet: `governanceReviews/milestones/w2-idn-6.3/ACTIVATION-PACKET.md`
- **Outcome:**             COMPLETE
- **Checkpoint SHA:**      `a9d977e` (code + tests; the stable review target) · branch: `wave/2-core-platform` (base = the 6.2 close `7186caa`)
- **Continuity note:**     activation was terminated mid-run by an API session limit and RESUMED per the coordinator's resume instruction; §11 carries the resume re-verification.

## 1. Summary
Wired the five Doc-4C §C6 membership contracts on their frozen Doc-5C §5.1 routes (rows 12–16) as audited, §B.6-deduped writes: `invite_member` (201+Location, the RV-0153 F2 create-claim leg), `accept_invitation` (the frozen `membership_id + identity match` alternative leg, pre-membership, on a composition-owned Doc-6C §6.2a transaction), `set_membership_status`, `remove_member`, `revoke_invitation`. The §5.5 Last-Owner-guarded set was re-derived from the frozen text (= `remove_member` + the `set_membership_status` SUSPEND leg — §3 of this report) and each guarded leg honors the RV-0150 T6-F1 serialization contract (own tx → `resolveOwnerRemovalFacts` FOR-UPDATE → pure policy → same-tx write). The RV-0155 O1 empty-lock-set premise was checked and HOLDS — no Flag-and-Halt fired. 14 new 8C+8E tests (incl. 3 interleave-real race probes, zero sleep-offset shapes); full suite 337/28 ALL PASS vs the 323/27 dispatch baseline.

## 2. Files changed
Added:
- `src/modules/identity/application/commands/invite-member.command.ts`
- `src/modules/identity/application/commands/accept-invitation.command.ts`
- `src/modules/identity/application/commands/membership-lifecycle.command.ts` (set_membership_status · remove_member · revoke_invitation — the 6.5 shared-shape idiom)
- `src/modules/identity/api/membership.handler.ts` (the five §C6 wire faces)
- `src/server/identity/membership-tenant.route-handler.ts` (invite claim-leg composition + the three lifecycle compositions)
- `src/server/identity/accept-invitation.route-handler.ts` (the §6.2a pre-membership composition)
- `app/api/identity/memberships/route.ts`
- `app/api/identity/memberships/[id]/accept_invitation/route.ts`
- `app/api/identity/memberships/[id]/set_membership_status/route.ts`
- `app/api/identity/memberships/[id]/remove_member/route.ts`
- `app/api/identity/memberships/[id]/revoke_invitation/route.ts`
- `tests/integration/membership-wire-slice.test.ts` (14 tests)

Modified:
- `src/modules/identity/contracts/services.ts` (additive §C6 section: 5 service exports · context/deps types · mappers · `MANAGE_USERS_SLUG` + 3 bound constants + validator · `MEMBERSHIP_INVITE_DEDUP_WINDOW_KEY`)
- `src/modules/identity/contracts/types.ts` (additive §C6 DTO section: `MembershipError` + 5 × Input/Result/Outcome)
- `src/modules/identity/domain/audit-actions.ts` (additive: `MembershipAuditAction.INVITED/ACCEPTED/SUSPENDED/REINSTATED`; existing `ACTIVATED`/`REMOVED` untouched in value)
- `src/modules/identity/infrastructure/data/membership-lifecycle.repository.ts` (additive §C6 read/write legs: `findMembershipInOrg` · `findMembershipForInvitee` · `findLiveUserIdByEmail` · `findInvitableRole` · `findLiveMembershipForUserInOrg` · `tombstoneRemovedMembership` · `insertInvitedMembership` · `readMembershipUpdatedAt`; the resolver/PREMISE block byte-untouched)
- `src/server/identity/index.ts` (additive §C6 handler exports)

Deleted: none.

## 3. Contracts changed
`src/modules/identity/contracts/{services,types}.ts` — **additive only; every pre-existing export unbroken** (full suite green is the regression proof). New surface = the five §C6 contract callables + DTOs + wire faces + realized-bound constants, all within M1 (One Module, One Owner). `src/modules/core/contracts` consumed only (`appendAuditRecord`, `configValueQuery` via the §B.6 helpers) — never edited.

**THE LOAD-BEARING DERIVATION — the §5.5 guarded command set, from the FROZEN text (verbatim citations; the packet's candidate list was re-derived, not trusted):**
- `identity.remove_member.v1` — **GUARDED.** Doc-4C §C6 PassB:407: "… → BUSINESS (**Last Owner Protection, §5.5**)"; PassB:408 register: "`identity_org_last_owner_block` (BUSINESS, no)"; PassB:413 AI note: "enforce Last Owner Protection". Master Architecture §5.5:347: "An organization must always have at least one active owner. Before an owner can be removed, ownership must be transferred or a new owner assigned. Organizations must never become ownerless."
- `identity.set_membership_status.v1` — **GUARDED on the SUSPEND leg ONLY.** PassB:393: "… → BUSINESS (**Last Owner Protection — cannot suspend the sole active Owner, §5.5**)"; PassB:394 register carries `identity_org_last_owner_block`; PassB:399 AI note: "cannot suspend the last active Owner (run succession first)". The frozen guard names the suspend DIRECTION; the reinstate leg (`suspended → active`) ADDS an active member, cannot reduce the active-Owner set, and carries no frozen §5.5 stage — guarding or locking it would be an unfrozen conjunct (the RV-0155 OBS-Δ2 lesson).
- `identity.revoke_invitation.v1` — **NOT guarded.** PassB:421 Validation Matrix ends at STATE (no BUSINESS §5.5 stage); PassB:422 register authors NO last-owner code. An `invited` row "grants no access" (Doc-2 §5.2:487) and is never in the active-Owner set. Suite-pinned: an invitation in a SOLE-active-Owner org revokes clean (200, never 422).
- `identity.accept_invitation.v1` / `identity.invite_member.v1` — **NOT guarded.** PassB:365/:350 author no §5.5 stage; neither register carries the block code; both legs only ADD standing (invited/pending rows).

**Serialization evidence (RV-0150 contract, per guarded leg):** both guarded legs run INSIDE the composition's `withActiveOrg` transaction and pass that SAME `tx` to `resolveOwnerRemovalFacts` (the shared `lockActiveOwnerRows` `SELECT … FOR UPDATE`), decide via the pure `evaluateLastOwnerProtection` over the POST-LOCK facts, and apply the CAS write on the same tx — facts and writes never split (`membership-lifecycle.command.ts` step 6/7; the 6.2 transfer passthrough shape). Empirically: three interleave-real probes (§6) — remove∥remove distinct-owners (the T6-F1 shape), suspend∥suspend distinct-owners, and same-row remove∥remove — each gates every step on an OBSERVED state (probe-held `FOR UPDATE` row locks + `pg_stat_activity` waiter counts; ZERO sleep-offset probes, the RV-0155 F-B1 house shape) and each proves exactly-one-wins / never-ownerless / the losing-write `ETag` leg respectively.

**RV-0155 O1 empty-lock-set premise — CHECKED, HOLDS, no Flag-and-Halt:** the resolver's PREMISE block (`membership-lifecycle.repository.ts:315–326`) fires on "a future command that empties the active-Owner ROW set of a LIVE org." Neither realized leg can: the guard BLOCKS the sole-active-Owner suspend/remove (`otherActiveOwnerCount === 0` ⇒ 422, nothing written), so every PERMITTED mutation leaves ≥ 1 active-Owner membership row; the reinstate/accept/invite/revoke legs only add rows or touch non-active-Owner rows. Suite-pinned on both guarded legs (blocked-path row-unchanged + zero-audit) and on both distinct-owner race probes (`activeOwnerCount === 1` post-race).

## 4. Migrations
None. No `prisma/` change of any kind (Flag-and-Halt condition never approached).

## 5. Events
Zero (frozen truth for this module: M1 emits no §8 events — `[DC-1]`). The `invite_member` notification fan-out has NO §8 emitter and stays **UNBUILT** — nothing is dispatched, no seam, no port, no outbox row (Doc-4C §C6 PassB:355 realized verbatim: "do **not** dispatch notifications from this contract").

## 6. Tests
Bands: **8C** (envelope/201+Location · frozen registers re-derived per contract · §B.6 required-key + per-contract windows + claim leg + §9.3 replay identity · actor-scope active-org/pre-membership · byte-identical 404 collapse · fail-closed invitee leg) + **8E** (frozen edge sets through the wire incl. machine-legal-but-wrong-contract rejections · the §5.5 guard discriminating pairs · the three race shapes · pending/suspended ∉ access formula through the LIVE `check_permission` path · D7 rollback direction). Run environment: local real PostgreSQL, per-worker ephemeral DB (Doc-8B harness).
- New slice: `membership-wire-slice.test.ts` — **14/14 PASS** (isolated run ×2, incl. post-prettier).
- **Baseline delta:** full suite **337 tests / 28 files ALL PASS** (×2 consecutive first-run green) vs dispatch baseline **323/27** — exactly the 14 new tests; **zero regressions**.
- tsc `--noEmit` exit 0 · ESLint 0 problems (all 17 WP files) · Prettier clean · `check-structure` PASS · `check-no-cross-schema-fk` clean · `check-no-secrets` clean.
- **Discrimination highlights:**
  - *Guard pairs:* sole-active-Owner suspend AND remove → 422 + row byte-unchanged + zero audit; the SAME mutation with a second active Owner → 200 (each conjunct of `evaluateLastOwnerProtection` flips a pinned case).
  - *remove∥remove race (T6-F1 shape):* with the resolver lock deleted, both commands block at their CAS on the probe's row locks and BOTH commit after release → 0 active Owners → the `activeOwnerCount === 1` + `[200,422]` pins go RED. Interleave is OBSERVED (2 lock-waiters) before release — the winner cannot pre-commit past the contender.
  - *suspend∥suspend race:* chosen over a mixed suspend∥remove shape because under single-leg sabotage the mixed shape has an ordering-dependent green path; with both legs suspend, a lock-stripped world has both guards read `otherActiveOwnerCount = 1` while both are probe-held, then both commit → 0 active Owners → deterministic RED.
  - *Same-row remove∥remove:* pins the losing-write leg — loser = in-register STATE 409 **carrying `ETag` = the row's current token** (call-13: losing-write only; the wrong-contract/machine-illegal 409s are separately pinned `ETag`-ABSENT).
  - *Invite claim race (interleave-real):* winner pinned POST-claim (its membership INSERT queued behind a probe-held uncommitted row) while the contender demonstrably passes its replay lookup and blocks ON the claim; with the claim leg deleted the contender would race the insert and finish 409 — the both-201-byte-identical pin goes RED.
  - *Contract-edge gating:* `pending → active` through the wire (`set_membership_status target=active`) → 409 and the row stays `pending` — a realization that consulted ONLY the machine (where the edge is legal) turns this red; likewise remove-of-invited and revoke-of-active.
  - *Access formula (live path):* suspend flips the real `check_permission` allow→deny; reinstate flips it back; accepted (`pending`) membership denies until the IDN-5 `activate_membership` System command — invoked in-test via the contracts face — flips it (compose-with-timer, never duplicate).
  - *D7 direction 1:* injected failing audit inside the tenant tx → write rolled back, zero audit rows.

## 7. Self-review
- Self-check gates: Red-Flag checklist sweep + §13 self-severity below; `/ivendorz-security`-lens walked manually (org context server-resolved everywhere; no client org input on any new path; RLS legs identified per composition; non-disclosure collapses byte-pinned; no cross-module access).
- Red-Flag scan (CLAUDE.md checklist): **CLEAR** — no new module · no ownership change · no governance-signal touch (§B.7 default none on all five) · Users-Act/Orgs-Own intact (invitee/inviting org always server-resolved) · no cross-module DB access or FK (sole raw SQL added = none; the repository additions are Prisma reads/writes on `identity.memberships`/`identity.users`/`identity.roles` — module-own) · imports = own module + `@/modules/core/contracts` + `src/shared`/`src/server` only · no workflow owns state (commands orchestrate; machine owns edges; repository owns SQL) · no read-model touched · Admin bypasses nothing (no Admin leg in §C6) · no ADR override · no frozen doc edited.
- Standing-charter Never-list: no violation.
- tsc / ESLint / Prettier: green (§6).
- **Self-severity of residuals** (§13 ladder by pointer; Raise ≠ Accept): BLOCKER 0 · MAJOR 0 · MINOR 0 · NIT 0 · **OBS 3** — (1) `check-schemas.mjs` fails against the base `DATABASE_URL` DB (environment: the base DB has not had `migrate deploy` run; zero `prisma/` changes in this WP — the per-worker harness DBs migrate clean, "No pending migrations to apply"); (2) `joined_at` is not set by the IDN-5 `activate_membership` transition (Doc-6C §3.3 comment "set on → active") — a PRE-EXISTING IDN-5 surface this WP composes with and may not modify (machine/timer changes out of scope); future-watch; (3) the invite success/reject dichotomy is an account-existence oracle toward org managers (see judgment call 1 — a frozen-surface consequence, flagged for Team-6's lens).

## 8. Open questions / ESC
- **`ESC-WIRE-FIELD-CASING` (🟥 owner-pending, program handle) — CARRIED as instructed:** the five new §C6 result payloads are built in the ratified house shape (camelCase DTO fields serialized into the §5.6 envelope — the D7/6.1/6.2/6.5 shape). If the owner rules Option A (conform-to-frozen serialization sweep), the sweep must include these five faces.
- **`ESC-IDN-INVITE-ACCOUNT` (PROPOSED handle — Doc-4C §C6 channel / Board):** the no-account invitee leg. The frozen contract identifies the invitee by `email` (auth-managed) while the frozen schema (Doc-6C §3.3 `user_id NOT NULL`) makes an invitation unrealizable without a live `identity.users` row, and the frozen register authors no leg for a non-resolving email. Interim realization = FAIL-CLOSED in-register VALIDATION 400 (judgment call 1). Resolution needs either an additive §C6 leg/register row or a ratified auth-side invite flow (DC-4). Registry row NOT written by me (coordinator-owned file).
- **Judgment-call log** (every call FOR Review-A adjudication; none self-ratified):
  1. **Non-resolving invitee email → fail-closed VALIDATION 400** (`identity_membership_invalid_input`, fixed message, no row written). Frozen re-read: §C6 PassB:348 (`email … invitee identifier (auth-managed)`), PassB:350 (REFERENCE stage names `role_id` ONLY), PassB:351 (register has no user-not-found leg), PassB:354 (Mutation-Scope `identity.memberships`), Doc-6C §3.3:152 (`user_id NOT NULL`), DC-4 (users materialize via provisioning). Why not Flag-and-Halt: a realization GAP, not a frozen-vs-frozen conflict — the exact class RV-0152 F1 resolved fail-closed + ESC (`ESC-IDN-PREF-KEYS` precedent); minting a users row instead would exceed the frozen Mutation-Scope, cross DC-4, and collide with the WP-1.3 email partial-unique provisioning path (an invite-hijack surface).
  2. **Invitee email normalized (trim + lowercase) before resolution** — micro-call; the auth layer stores lower-cased emails; SYNTAX validates format only (PassB:357).
  3. **A live `invited`/`suspended` row also → the frozen CONFLICT `identity_membership_already_exists`.** Frozen conjunct (PassB:350) names "active/pending" only, but the Doc-2 §10.2 partial-unique-live index forecloses ANY second live row; the frozen code's own text ("membership_already_exists") is truthful for every live state. Reinstate/accept are the paths, never a duplicate invite.
  4. **Re-invite after removal = tombstone (marker tuple ONLY) + NEW row, one tx.** Frozen re-read: PassB:413 "removed is terminal — never reopen (**re-invite creates a NEW membership**)" + PassB:427; Doc-2 §10.2 `UNIQUE(user_id, organization_id) WHERE deleted_at IS NULL`; the IDN-5/RV-0150-ratified posture that `→ removed` does NOT set SD markers. The two frozen facts compose only if the superseded terminal row leaves the live index — the 6.2 org-cascade marker precedent (markers ≠ state; `removed` stays byte-untouched; audits retained). Why not Flag-and-Halt: the frozen texts are jointly realizable; nothing contradicts.
  5. **Prisma P2002 on the live index → the frozen CONFLICT code.** Doc-4A §14.6 says business-uniqueness is "never CONFLICT," but the FROZEN §C6 register itself assigns `identity_membership_already_exists` to CONFLICT — the most-specific frozen declaration governs (the RV-0152 OBS-1 ratified posture).
  6. **Accept realized on the frozen ALTERNATIVE leg** — "(or `membership_id` + identity match)" (PassB:363 verbatim). The token leg is unrealizable: the frozen Doc-6C §3.3 schema has no invitation-token column. No third path invented.
  7. **"Invitation not expired/revoked" (accept BUSINESS) realized VIA STATE.** PassB:366 itself binds "already accepted/expired" to `identity_membership_state_invalid` (STATE); expiry's ONLY frozen realization is the `expire_invitation` sweep's `invited → removed` (PassB:429–442). No wall-clock window check added at accept — a lapsed-but-unswept invitation remains acceptable until the sweep runs (the sweep owns expiry; adding a second expiry authority would duplicate the timer).
  8. **Accept composition = the Doc-6C §6.2a staff-GUC transaction (mechanism, not attribution).** The invitee is PRE-membership (Doc-5C §2.2 row 13 "N (pre-membership)"; §2.5 note 13 "the invitation scopes it server-side"); the tenant `memberships_update` RLS leg keys on `app.active_org`, which cannot be established without an active membership (Invariant #5). App-layer identity match is PRIMARY (Doc-6C §6.2a doctrine); audit rows USER-attributed — the deactivate/create-org ratified precedent.
  9. **Accept dedup scope org = `null`** (pre-membership carries no org context — the create-org/set_user_account_status org-less-scope precedent).
  10. **`updated_at` carriage = the RV-0153 call-1 discipline.** NO §C6 contract declares `Concurrency: optimistic` and NO §C6 register authors a CONFLICT code (all five registers re-read; contrast §C5's `identity_org_update_conflict`) ⇒ no If-Match/ETag input leg anywhere on this surface; `updated_at` = the frozen request-BODY field (required on set/remove/revoke, OPTIONAL on accept — PassB:363, absent ⇒ no check per Doc-4A §9.2 update semantics); stale arrival view → in-register VALIDATION 400 (the ratified §C9/restore posture); LOSING concurrent write → in-register STATE 409 carrying the current token → `ETag` (Doc-5A §9.5/§9.6; call-13 losing-write-only leg discipline — machine/contract-illegal 409s carry none).
  11. **Guarded-set derivation + reinstate/revoke exclusions** — §3 above (the packet's own instruction: derive, don't trust).
  12. **Contract-edge source gates (machine-legal ≠ contract-legal):** set_membership_status drives ONLY `active ⇄ suspended` (PassB:395) — `pending → active` is the System activation edge (PassB:373–385) and is wire-rejected; remove_member drives ONLY `active|suspended → removed` (PassB:407) — `invited → removed` belongs to revoke/expire; revoke drives ONLY `invited → removed` (PassB:421/:427). The RV-0150 Adjudication-3 source-gate discipline; each gate discriminating-tested.
  13. **`membership_reinstated` = a DISTINCT serialization token of the ONE §9 "membership suspend" action.** PassB:397 authors the coverage verbatim ("the suspend action records either direction — reinstate inverse-leg covered-by-suspend, per Patch v1.0.1 PA-02"); the token pair is the ratified `delegation_grant_reinstated` covered-by-suspend precedent (RV-0150 Adjudication 2 / RV-0153-confirmed class). NO business action invented; a rename touches Doc-4C + the constant, never Doc-2.
  14. **`membership_removed` SHARED across remove/revoke (and the IDN-5 expire).** All three frozen Audit declarations bind the SAME enumerated §9 action "membership remove" (PassB:411/:425/:439); unlike the reinstate pair, no frozen text authors a distinct revoke serialization — so none was minted; the audited old-state (`invited` vs `active|suspended`) + attribution (User vs System) discriminate the leg in the ledger.
  15. **Uniform §6.6 collapse code = `identity_membership_not_found`** for unresolved-context and foreign-target legs across the surface (in the set/remove/revoke/accept registers; invite's register authors no NOT_FOUND code, but the unresolved-context collapse is the COMPOSITION-level Doc-5A §6.6 safe default preceding any contract register — the 6.2 shared-composition precedent, `identity_` membership-domain segment per §B.5).
  16. **Three [realization convention] bounds, face-exported** (the ADMIN_REASON/RV-0152 NIT-B3 precedent): `INVITE_EMAIL_MAX_LENGTH = 320` (RFC-5321 ceiling; format-only check per PassB:357), `INVITE_DEPARTMENT_MAX_LENGTH = 200`, `MEMBERSHIP_REASON_MAX_LENGTH = 500`.
  17. **`Location: /identity/memberships/{id}`** on the 201 (Doc-5A §5.5; the item address under the frozen collection route — the 6.2 create-org precedent; no GET-item contract exists, same as organizations).
  18. **Guard/lock placement in the frozen §11.2 order:** STATE evaluated on the pre-lock SCOPE-loaded row; the resolver lock sits between STATE and BUSINESS (a mechanism, not a validation stage); BUSINESS decides on POST-LOCK facts; the CAS keyed on the pre-lock source state converts any blocked-window row movement into the losing-write leg — error precedence (SYNTAX→…→STATE→BUSINESS) preserved, and no decision ever consumes a fact read before the lock (the 6.2 transfer post-lock re-read discipline, adapted: here the only post-lock-consumed facts ARE the resolver's).
  19. **Race-probe shapes** (§6 highlights): probe-held `FOR UPDATE` locks + observed `pg_stat_activity` waiters; suspend∥suspend chosen over mixed suspend∥remove for deterministic single-leg sabotage discrimination; the invite claim probe pins the winner post-claim via a probe-held uncommitted conflicting row (rolled back — zero residue).
- The 6.2 comment one-liner carry (RV-0155 OBS-Δ1 `create-organization.command.ts` header nuance): **NOT folded — that file was not touched** by this WP (the carry binds "the next command touch" of that file; disclosed, not omitted).

## 9. Checkpoint
- `a9d977e` — `feat(identity): W2-IDN-6.3 membership wired API — 5 §C6 contracts + §5.5-guarded legs serialized [checkpoint]` — bounds the ENTIRE WP: 12 added + 5 modified files (§2), all layers (domain tokens → repository legs → commands → contracts → api faces → server compositions → thin routes → tests). This report is committed as a follow-up docs checkpoint on the same branch.
- Staging discipline honored: ONLY W2-IDN-6.3 files staged; the external parallel-session edits (`app/(app)/(buyer)/**` rfq files, motion/frontend dirt) and coordinator governance files (tracker, esc_registry, authority map, Board decision files, Doc-2 Patch v1.0.8, the activation packet) left untouched and unstaged.

## 10. Packet gaps
Files read beyond the packet's §3/§4 list (all within its §2 pointer families or house-precedent verification; none contradicted the packet):
- `prisma/migrations/20260627202753_identity_init/migration.sql` (the memberships RLS legs — needed to derive the accept §6.2a mechanism) and `20260709130000_identity_catalog_seed/migration.sql` (`can_manage_users` bundle composition = Owner/Director/Manager — the 403 test actor).
- `prisma/schema.prisma` (Membership/User models — `user_id NOT NULL`, `auth_user_id` nullable: judgment call 1 inputs).
- `src/server/context/{with-active-org,user-self,active-org}.ts`, `src/shared/http/index.ts`, `src/modules/core/infrastructure/data/system-configuration.service.ts` (reference-form prefix), `app/api/identity/organizations/**` (thin-route shape), `suspend-revoke-delegation-grant.command.ts` + `create-delegation-grant.command.ts` + `delegation-grant.repository.ts` + `deactivate-own-account.command.ts` + the 6.2 route-handlers/handlers (house shapes), `user-account.repository.ts` (SD-marker posture), `organization-wire-slice.test.ts` + `membership-org-lifecycle-slice.test.ts` (probe idioms + deps shapes).
- `generatedDocs/Doc-4C_Content_v1.0_PassA.md` (§C6 PassA rows + DC-1/DC-4/DC-5 definitions), `Doc-3_Policy_Key_Registration_Patch_v1.9_Identity.md` (window keys #1/#3 verified REGISTERED), `Doc-6C_Content_v1.0_Pass1.md` §3.3 + `Pass3` §6.2a, `Doc-2` §10.2 + §3 context lines, `Doc-4M_Patch_v1.0.1.md` (the patched membership rows).
- Packet-precision note for Team-8: the packet's §4 could pre-name the accept-leg §6.2a dependency (the pre-membership RLS question is derivable but load-bearing) and the invite no-account-invitee gap (judgment call 1) — both cost re-derivation time.

## 11. Readiness
- **Next gate:** **Review-A at `a9d977e`** · **Team-6 pre-flag: YES** (packet-named surfaces all present: member-removal/lockout + Last-Owner under concurrency + invitation lifecycle incl. the invitee-existence oracle [judgment call 1 / OBS 3] + the replay/claim surface + the accept §6.2a staff-GUC mechanism).
- **Blocked on:** nothing.
- **Suggested next work item:** W2-IDN-6.4 (roles) or 6.6 (context/active-org — carries RV-0150 OBS-B1).
- **(REACTIVATION) Resume re-verification performed:** `git status --porcelain` re-inventoried (all 11 partial W2-IDN-6.3 paths present exactly as left; external dirt identified and quarantined) · HEAD re-confirmed `7186caa` · partial files' content confirmed current in-context (tsc re-run green before continuing) · DB re-verified up (`docker compose ps` healthy) · the `can_manage_users` bundle answer (the interrupted step) re-derived from the catalog-seed migration (Owner/Director/Manager) — nothing trusted from memory without re-verification.

## 12. Carries emitted (outbound)
| Target | Obligation | Class |
|---|---|---|
| Board channel (owner) | `ESC-WIRE-FIELD-CASING`: the five §C6 result faces added in the house camelCase shape — include in the Option-A sweep set if so ruled | carried handle (existing) |
| Doc-4C §C6 channel / Board | `ESC-IDN-INVITE-ACCOUNT` (proposed): ratify the no-account-invitee disposition (additive §C6 leg OR auth-side invite flow); interim = fail-closed VALIDATION 400 | channel escalation (new) |
| Team-6 (this WP's review) | the invitee account-existence oracle (§7 OBS 3) + the accept §6.2a staff-GUC mechanism — both flagged for the security lens | review pre-flag note |
| W2-IDN-7 | seed `identity.membership_invite_dedup_window` alongside the existing window-key seed carry (this WP added its first consumer; test-scoped seed used meanwhile) | fold-in |
| Future-watch (IDN-5 composition) | `joined_at` never set by the `activate_membership` transition (Doc-6C §3.3 "set on → active") — pre-existing; surfaces when any consumer reads `joined_at` | future-watch |
| Next `create-organization.command.ts` touch | RV-0155 OBS-Δ1 header one-liner — still unfolded (file untouched this WP) | fold-in (unchanged) |

## Frozen Authority Checklist

Before execution, the assignee confirms:

☑ All cited documents are frozen.
☑ Every cited section has been re-read verbatim.
☑ No draft document is treated as authority.
☑ Any uncertainty results in Flag-and-Halt.
