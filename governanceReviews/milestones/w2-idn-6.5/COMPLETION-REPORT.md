# COMPLETION REPORT — Agent M1 · W2-IDN-6.5

## 0. Header

- **Role / Work item:** Agent M1 — Identity & Organization · `W2-IDN-6.5` (Wired API ·
  Delegation §5, all 6 contracts + §5.10 boundary realization + §B.6 dedup) · packet:
  `governanceReviews/milestones/w2-idn-6.5/ACTIVATION-PACKET.md`
- **Outcome:** COMPLETE
- **Checkpoint SHA:** `96a31eb` (implementation; the stable review target) · branch:
  `wave/2-core-platform` *(this report lands in a follow-up governance checkpoint — §9)*

## 1. Summary

Wired all six frozen §C9 delegation contracts on their verbatim Doc-5C §5.1 routes (create
201+Location · suspend/reinstate/revoke named POST commands · dual-party get/list), realized the
`Doc-2_Patch_v1.0.7` §5.10 boundary exactly (the `suspended → expired` machine edge; the System
sweep over BOTH non-terminal states with the RV-0149 pin updated as ruling-realization; the real
`reinstate_delegation_grant` replacing `DelegationReinstateGatedError` with the window-open guard
and reject-expired inside the frozen §C9 register; no-resurrection discriminating tests), and built
the §B.6 command-dedup replay store as a frozen-grounded dedicated table (`identity.command_dedup`,
Doc-6A §10.3 vehicle) with the mandatory Idempotency-Key wire leg on the 6.5 commands and the
retro-fit across the four delivered 6.1 §C4 wires. The two authorized user-account-slice test folds
(NIT-Δ1, NIT-Δ2) landed. Full suite 300 tests / 26 files ALL PASS ×3 on the quiet WP surface
(dispatch baseline 278/25; the +22/+1 delta is entirely this WP); tsc/ESLint/Prettier/structure/
cross-schema-FK green. **§B.6 store disposition: BUILT-WITH-GROUNDING** (anchors in §4/§8 call 5).

## 2. Files changed

Added:
- `src/modules/identity/application/queries/get-delegation-grant.query.ts`
- `src/modules/identity/application/queries/list-delegation-grants.query.ts`
- `src/modules/identity/infrastructure/data/command-dedup.repository.ts`
- `src/modules/identity/api/create-delegation-grant.handler.ts`
- `src/modules/identity/api/delegation-grant-lifecycle.handler.ts`
- `src/modules/identity/api/get-delegation-grant.handler.ts`
- `src/modules/identity/api/list-delegation-grants.handler.ts`
- `src/server/identity/command-dedup.ts`
- `src/server/identity/create-delegation-grant.route-handler.ts`
- `src/server/identity/delegation-grant-lifecycle.route-handler.ts`
- `src/server/identity/get-delegation-grant.route-handler.ts`
- `src/server/identity/list-delegation-grants.route-handler.ts`
- `app/api/identity/delegation_grants/route.ts`
- `app/api/identity/delegation_grants/[id]/route.ts`
- `app/api/identity/delegation_grants/[id]/suspend_delegation_grant/route.ts`
- `app/api/identity/delegation_grants/[id]/reinstate_delegation_grant/route.ts`
- `app/api/identity/delegation_grants/[id]/revoke_delegation_grant/route.ts`
- `prisma/migrations/20260710120000_identity_command_dedup/migration.sql`
- `tests/integration/delegation-wire-slice.test.ts`

Modified:
- `src/modules/identity/domain/state-machines/delegation-grant.state-machine.ts` (the patched 7-edge matrix)
- `src/modules/identity/domain/audit-actions.ts` (REINSTATED token — §C9-authored pointer)
- `src/modules/identity/application/commands/reinstate-delegation-grant.command.ts` (scaffold → real command)
- `src/modules/identity/application/commands/suspend-revoke-delegation-grant.command.ts` (losing-write token leg; NaN-date SYNTAX)
- `src/modules/identity/application/commands/expire-delegation-grants.command.ts` (both-states sweep)
- `src/modules/identity/infrastructure/data/delegation-grant.repository.ts` (expirable filter both states; party list read)
- `src/modules/identity/contracts/types.ts` · `contracts/services.ts` (additive; one authorized replacement — §3)
- `src/server/identity/index.ts` (re-exports)
- `src/server/identity/update-user-profile.route-handler.ts` · `update-user-2fa-settings.route-handler.ts` ·
  `deactivate-own-account.route-handler.ts` · `set-user-account-status.route-handler.ts` (§B.6 retro-fit)
- `app/api/identity/users/[id]/route.ts` + the 3 named-command routes (pass `parseIdempotencyKey`)
- `src/shared/http/index.ts` (additive `parseIdempotencyKey` + `IDEMPOTENCY_KEY_MAX_LENGTH` — disclosed, §8 call 11)
- `inngest/functions/expire-delegation-grants.ts` (sweep edge comment/name — both states)
- `prisma/schema.prisma` (the `CommandDedup` model)
- `tests/integration/delegation-grant-slice.test.ts` (ruling-realization pin update + reinstate/no-resurrection coverage)
- `tests/integration/user-account-slice.test.ts` (the two authorized folds ONLY — NIT-Δ1 + NIT-Δ2)

Deleted: none (the scaffold file was rewritten in place; `DelegationReinstateGatedError` removed — §3).

## 3. Contracts changed

`src/modules/identity/contracts/{types,services}.ts` — additive: `DelegationGrantView` (the frozen
§C9 projection, verbatim field set) · `GetDelegationGrantResult` · `ListDelegationGrantsInput/Result` ·
`CommandDedupScope` · `StoredCommandResponse` · `DelegationGrantError.currentUpdatedAt?` (the
losing-write token leg) · facades `getDelegationGrant`/`listDelegationGrants`/
`findCommandDedupRecord`/`persistCommandDedupRecord` · window-key constants
`COMMAND_DEDUP_WINDOW_KEY`/`USER_UPDATE_DEDUP_WINDOW_KEY` (Doc-3 v1.9 names verbatim, reference
form per Doc-4A §18.2) · the six wire-face mapper re-exports · reinstate context/deps types.
**One authorized non-additive change:** `ReinstateDelegationGrant` re-typed real (was
`Promise<never>`) and `DelegationReinstateGatedError` REMOVED — Board decision instrument (c)
verbatim ("the reinstate scaffold's `DelegationReinstateGatedError` is replaced by the real
command") + patch §4; the only consumer (the delegation slice test) updated in the same commit.
Consumed: `@/modules/core/contracts` (audit append + config query) — types/facades only, never edited.

## 4. Migrations

`prisma/migrations/20260710120000_identity_command_dedup/` — one forward-only migration; applies
clean (harness `applyMigrations` + `prisma migrate` output verified: "All migrations have been
successfully applied"). Creates `identity.command_dedup` (M1's OWN schema; NO cross-schema
reference; NO FK — inert operational cache) + `command_dedup_scope_key_uq`
(UNIQUE NULLS NOT DISTINCT over contract/actor/org/key — PG15+, the Doc-6A §0.4 floor) + actor-scoped
RLS (`FOR ALL`, the Doc-6C §6.2a single-scope idiom). **§B.6 store grounding anchors (exact):**
- Doc-4C §B.6 (PassB:58–60) — replay semantics + the §14.3 joint rule (the *what*).
- Doc-6A §10.3 (Pass3:37–39) — "a dedicated dedup table or a unique idempotency-key column on the
  target aggregate (realization choice — §2.5), indexed for the window lookup" (the *vehicle*).
- Doc-6C §6.1 (Pass3:95) — "realized per the owning-module design (Doc-6A §10.3)" + Appendix A
  CHK-6-072 "idempotency-dedup persisted — PASS" (the owning module's frozen adoption).
- Doc-5A §9.3 (Pass6:36–37) — stored result + same status + same ORIGINAL `reference_id`; the
  dedup "mechanism, layer, and window are development-document concerns" (the *column set* + the
  explicit assignment of this design to the implementation layer).
Doc-6C §6.2's 9-table order is untouched — the store is not a Doc-2 §10.2 domain table; it is the
§10.3 operational persistence Doc-6C itself delegates (Doc-6A R2: no domain element introduced).

## 5. Events

**Zero — audited only, per frozen truth** (M1 emits no Doc-2 §8 event; `[DC-1]` held). The M3
refresh-on-revocation/expiry teardown stays the injected NO-OP seam — NOT wired, NOT event-backed.

## 6. Tests

Bands: **8C** (`tests/integration/delegation-wire-slice.test.ts`, 14 tests — envelope · frozen
registers/status · §B.6 replay semantics incl. retro-fit · prohibited fields · dual-party
actor-scope · call-13 ETag discipline · fail-closed pagination) + **8E**
(`tests/integration/delegation-grant-slice.test.ts`, 31 tests — the patched machine: legal edges
exercised, illegal edges rejected-status-unchanged; reinstate boundary both directions;
no-resurrection) + the two 8C folds in `user-account-slice.test.ts` (17 tests). Environment: real
PostgreSQL (docker compose db), harness-applied migrations.

- **Baseline delta:** full suite **300 tests / 26 files ALL PASS ×3 consecutive** vs dispatch
  baseline **278/25** — zero regressions; delta = +22 tests / +1 file, all this WP
  (wire slice +14 · delegation slice +7 net · user-account +1).
- **Discrimination highlights (per guard/leg):**
  - *Sweep both-states pin:* suspended+lapsed asserts `expired` + a System `delegation_grant_expired`
    row with `old_value.status = "suspended"`; suspended+IN-window asserts untouched — a sweep that
    ignores `suspended` OR ignores the window fails one of the pair. Idempotency: second pass = 0.
  - *Reinstate boundary both directions:* one clock tick before `valid_to` → 200/active+audit; at
    `valid_to` → STATE 409, row unchanged, zero audit. Deleting the window guard flips the second;
    deleting the edge flips the first.
  - *No-resurrection:* reinstate-on-expired → STATE; new grant = new UUID (`!==` pinned), its own
    single `delegation_grant_issued` chain; the old instance's chain and `updated_at` byte-stable —
    any revival/reuse fails three separate assertions.
  - *§B.6 single execution:* same-key replay of suspend with the ORIGINAL (stale) token returns the
    STORED 200 (wire-serialized byte-equal, same `reference_id`) — a re-execution would 400/409, so
    a broken replay path cannot pass; audit count pinned at 1 (§14.3 joint rule). Different key →
    two executions (§9.4 row 2); post-window (backdated `executed_at`) → re-execution + overwrite;
    same key from a DIFFERENT actor → independent execution (the §7.5 poisoning guard).
  - *Call-13 ETag legs:* losing-write STATE 409 with token → `ETag` present (mapper-level, via the
    contracts-exported mapper); machine-illegal 409 → ETag ABSENT (wire-level, revoked→suspend);
    reinstate-lapsed 409 → ETag ABSENT; stale-token 400 → ETag ABSENT.
  - *Non-party collapse:* suspend/get probes on a REAL grant vs a random uuid by a slug-holding
    third org — byte-identical modulo the per-response `reference_id`.
  - *Frozen projections:* get asserts the EXACT key set (sorted-equality) — any widened field
    (e.g. `updated_at`) fails; revoke response asserts `"updatedAt" in result === false`.
  - *NIT-Δ1:* deactivate stale-CAS → 409 `identity_user_update_conflict` + ETag = current token,
    row un-departed, zero audit (the leg Review-B's P3 probe showed untested).
  - *NIT-Δ2:* the composition pin now requires ≥2 exact `{ appendAuditRecord }` occurrences —
    an import-only file (no injection) now fails.

## 7. Self-review

- Self-check gates (/ivendorz-security-equivalent sweep): org context server-resolved everywhere
  (no client org/actor input on any new surface; smuggle probe green) · new table has RLS +
  actor scope · no cross-module table access (core config/audit via contracts only; the store is
  identity-schema) · non-disclosure collapses byte-tested · no governance signal touched · no
  money surface.
- Red-Flag scan (CLAUDE.md checklist): **CLEAR** — no new module · no ownership change · no
  event · no cross-schema SQL/FK (script-verified) · contracts-only cross-module imports ·
  read-models untouched · no ADR override · no frozen doc modified.
- Standing-charter Never-list: no violation.
- tsc: green (0 errors) · ESLint (WP surface): green (0 errors, 0 warnings after fix) · Prettier:
  green (WP files; `pnpm-lock.yaml` dirt is the disclosed external working-tree change, untouched) ·
  `check-structure`: PASS · `check-no-cross-schema-fk`: clean (8 migrations).
- **Self-severity of residuals** (§13 ladder by pointer; Raise ≠ Accept): BLOCKER 0 · MAJOR 0 ·
  MINOR 0 · NIT 0 · **OBS 3** —
  - OBS-1: wire concurrency-token bootstrap gap — the frozen §C9 create/get responses carry no
    `updated_at`, so a pure-wire client cannot obtain the first required token (suspend/reinstate
    responses are the only wire sources). Frozen-faithful realization; Doc-4C additive candidate.
  - OBS-2: the deactivate §B.6 stored replay is shadowed post-departure by the 6.1-ratified
    terminal `404` collapse (auth linkage severed before the dedup scope resolves) — §8 call 14.
  - OBS-3: the in-vivo losing-write CAS race (two live transactions) is not deterministically
    triggerable through the contract surface; the leg is discriminated at the mapper level + the
    command's re-read path is code-reviewed (same acceptance shape as 6.1's pre-NIT-Δ1 posture).
  - Inbound future-watch NOTED per packet (RV-0149 T6-OBS-1): the M2 vendor-port
    existence-oracle watch — recorded only, nothing built.

## 8. Open questions / ESC

- `ESC-IDN-DELEG-EXPIRY` — **RESOLVED consumed**: realized exactly `Doc-2_Patch_v1.0.7` + the
  Board decision instruments (a)–(d); nothing beyond the patch.
- `[ESC-IDN-AUDIT]` — near-pointers only, unchanged channel: `delegation_grant_expired` stays on
  it; the NEW `delegation_grant_reinstated` token needs NO channel row — the frozen §C9 reinstate
  Audit declaration itself authors the pointer ("suspend/reinstate pair … covered-by-suspend,
  Patch v1.0.1 PA-02"). Zero invented actions.
- `[DC-1]` — held: zero identity events; the M3 teardown seam stays the no-op port.
- `[DC-5]` — the two window keys read by their Doc-3 v1.9 registered names (reference form);
  unseeded until W2-IDN-7 (test-scoped seeds; production fails loud on the unseeded key — the
  IDN-4 posture, no literal fallback).
- **NEW handle proposal: `ESC-IDN-LIST-PAGESIZE`** (coordinator to register) — the frozen §C9
  `list_delegation_grants` `page_size` bound is a `[DC-5]` POLICY key that was never registered;
  `Doc-3_Policy_Key_Registration_Patch_v1.9` §Notes (verbatim): "No `identity.list_page_size_max`.
  … that is a separate escalation ([ESC-6-API] / Doc-4A §18.2) — not coined here." Required Board
  action: register an identity page-size key (one additive Doc-3 §12.2 row) or ratify the interim.
  Interim realization is FAIL-CLOSED (§8 call 15).

**Judgment-call log** (every call FOR Review-A adjudication — none self-ratified):
1. **§C9 `updated_at` = required BODY field, not If-Match; stale mismatch stays VALIDATION 400.**
   Re-read: PassB:592/605/618 (request contracts) · PassB:597/610/623 (B.6 lines — NO
   `Concurrency: optimistic`, contrast §C4:182 / §C5:262 / §C10:681 / §C11:723) · the §C9 registers
   (PassB:595/608/621 — NO CONFLICT code) · Doc-5C §4.3/§5.4 ("If-Match … **where optimistic**") ·
   Doc-5A §9.5 Pass6:55 ("Where a contract declares `Concurrency: optimistic`") · Doc-5A §6.6
   (never invent a code). Not F&H: no conflict — the frozen texts compose to exactly one
   literal-free realization; the IDN-4-ratified command semantics (RV-0149 clean close) stand.
   Consequence: the packet's "stale-token 409s" phrase realizes as the losing-write 409 only (the
   packet's own never-trust-a-paraphrase rule applied).
2. **Losing-write CAS leg = STATE 409 CARRYING the §9.5 ETag.** Re-read: Doc-5A §9.4 Pass6:48
   (the losing concurrent request is the concurrency model's) + §9.5 Pass6:56–57 + the RV-0152
   call-13 delta-verified discipline (token on token-mismatch/losing-write legs only). Not F&H:
   the class is register-forced (STATE is §C9's only 409 row); the token carriage is the
   frozen-realized §9.5 standard on a genuine losing write.
3. **Reinstate lapsed-window rejection = STATE `identity_delegation_state_invalid` (409).**
   Re-read: Patch v1.0.7 rules 1–3 · Board decision instrument (c) verbatim ("error surface stays
   inside the frozen §C9 registers") · the reinstate register (PassB:608) · §B.4 stage map. Not
   F&H: the frozen matrix's BUSINESS stage has no register code; the Board instrument directs the
   in-register realization; a window-lapsed grant is expired-pending-sweep — a temporal-state
   illegality, the STATE row's own meaning.
4. **`delegation_grant_reinstated` audit token.** Re-read: PassB:611 (the §C9 reinstate Audit
   declaration authors the pointer; PA-02 covered-by-suspend) · Doc-2 §9:685. Not F&H: the
   pointer is frozen-authored; the distinct token is the ratified ledger-truth serialization
   precedent (suspend ≠ reinstate; the user-account SUSPENDED/REINSTATED pair).
5. **§B.6 vehicle = dedicated table; BUILD, not halt.** Re-read: the four §4 anchors verbatim.
   Not F&H: Doc-6A §10.3 concretely names the vehicle and assigns the choice to the owning
   module's design (§2.5); Doc-6C adopts it by pointer and attests persistence (CHK-6-072); the
   packet's halt condition ("if … do not ground a concrete realization vehicle") is therefore NOT
   met. Between the two named vehicles the choice is DISCRIMINATED, not preferred: the
   aggregate-column vehicle cannot store the §9.3 replay payload, cannot dedup creates (no row
   yet), and would alter frozen Doc-6C table shapes.
6. **Dedup scope key = (contract, actor, org-context, key), NULLS NOT DISTINCT.** Re-read: Doc-5A
   §9.2 Pass6:31 (key format/length/semantics = development-document concerns) · Doc-4A §7.5. Not
   F&H: a §2.5-class physical choice; scoping is the non-disclosure-mandated poisoning guard
   (probed by test).
7. **Success-only caching.** Re-read: Doc-4A §14.7 (`Idempotency: required` ⇒ CONFLICT
   `retryable: true` via the replay mechanism) · Doc-5A §9.6 (re-read-retry). Not F&H: caching an
   error (esp. a 409) would freeze the frozen retry flow; a failed request has no side effect so
   re-execution satisfies §14.3 trivially; error-caching is nowhere mandated.
8. **Post-window overwrite (upsert; `executed_at` re-anchors).** Re-read: Doc-5A §9.3 Pass6:50
   ("§9 asserts no outcome" post-window; the window is development-owned). Not F&H: a bounded
   operational update of a non-authoritative replay cache (the outbox-status class); Invariant #8
   governs authoritative records, which this is not (Doc-6A R2).
9. **Concurrent same-key overlap → the concurrency model, not the store.** Re-read: Doc-5A §9.4
   Pass6:48 row 3 (verbatim assignment). Not F&H: the corpus itself routes overlapping in-flight
   duplicates to §9.5; the commands' CAS legs own that race (tested at IDN-4/6.1).
10. **Missing Idempotency-Key → per-domain SYNTAX VALIDATION 400.** Re-read: Doc-5C §4.3 ("the
    `Idempotency-Key` header is **mandatory**") · Doc-4A §11.2 category 1 (presence) · §9.8 (a
    transport concept is a contract-level input). Not F&H: the mandatory-element failure is
    SYNTAX; each domain's frozen `*_invalid_input` VALIDATION row realizes it; no code coined.
11. **`IDEMPOTENCY_KEY_MAX_LENGTH = 200` [realization convention], face-exported.** Re-read:
    Doc-5A §9.2 Pass6:31 (length = development-document concern). Not F&H: explicitly assigned to
    this layer; disclosed + bound-tested (the ADMIN_REASON_MAX_LENGTH / RV-0152 NIT-1+NIT-B3
    precedent). Home = `src/shared/http` (platform wire mechanics; the 6.1 OBS-5-precedent
    disclosed additive edit).
12. **Tri-state wire key (`string | null | undefined`).** Not F&H: §B.6 governs the WIRE legs;
    the wire always supplies `string | null` (routes call `parseIdempotencyKey`); `undefined`
    marks an off-wire in-process caller — this keeps the ratified 6.1 slice tests valid without
    exceeding the two authorized test-only fold touches, while the mandatory-header rule is
    enforced end-to-end from every route.
13. **Deactivate + set_user_account_status persist POST-COMMIT; profile/2FA/delegation persist
    in-tx.** Re-read: Doc-4C §C4 (state effects) · the RV-0150 T6-F1 serialization contract
    (deactivate owns its locking tx). Not F&H: the cache write cannot join a command-private tx
    without re-opening ratified 6.1 command deps; the unprotected window is duplicate-safe BY THE
    MACHINE (deactivate re-execution meets terminal `soft_deleted` → the ratified 404 collapse,
    one audit — 6.1-pinned; set-status re-execution meets same-state → the frozen
    `identity_user_status_conflict` 409, no second side effect). §14.3's no-duplicate obligations
    hold on every path.
14. **Post-departure replay = the ratified terminal 404 collapse (shadows §9.3 replay identity).**
    Re-read: Doc-4A §7.5/§12.4 · the 6.1-ratified terminal-replay pin. Not F&H: the subject's
    auth linkage is severed and the departed record is non-disclosable; non-disclosure is the
    §11.2-ordered disclosure control and outranks replay-response fidelity. OBS-2 records it.
15. **List pagination FAIL-CLOSED (`page_size`/`cursor`/`sort` → 400; full party-scoped set,
    `has_more: false`).** Re-read: Doc-3 v1.9 §Notes (verbatim — no identity page-size key, "not
    coined here", separate escalation) · Doc-5A §8.5 (bounds POLICY-keyed, "never a literal") ·
    §8.2 (a cursor only ever comes from a prior response — none is ever issued) · §8.4 (no
    sortable allowlist declared in §C9). Not F&H: the frozen registration patch pre-names the
    escalation channel; the fail-closed interim is the RV-0152 F1 (preferences/recovery_method)
    ratified posture — escalate-never-widen, never a literal. Handle proposed (above).
16. **Get/list projections = the frozen §C9 field set EXACTLY (no `updated_at`).** Re-read:
    PassB:648/659. Not F&H: frozen text wins over Doc-4A §10.2's general canonical-representation
    rule (the module register is the specific frozen declaration); the resulting wire
    token-bootstrap gap is OBS-1, escalation candidate — never widened locally.
17. **`windowToMs` private copy in the dedup repository.** Not F&H: the durationToMs
    CANONICALIZATION is packet-assigned to W2-IDN-7 ("binds IDN-7"); a cross-layer import from
    application→infrastructure would invert layers; the copy is comment-flagged for the IDN-7
    unification (carry re-emitted, §12).
18. **Sweep per-grant edge assertion (`grant.status → expired`).** Re-read: Patch v1.0.7 machine
    block. Not F&H: the literal realization of the patched two-edge expiry; the audit token stays
    the existing `delegation_grant_expired` (old_value discriminates the source state — no new
    action).
19. **suspend/revoke SYNTAX now rejects a NaN `updated_at` as "updated_at is required".** Not
    F&H: same frozen class+code as before (VALIDATION/`identity_delegation_invalid_input`);
    message-truth hardening for the body-carried required field (an absent field previously
    surfaced as the stale-mismatch message).
20. **`Location` on the create 201 [realization convention].** Re-read: Doc-5C §5.1 row
    (*"+`Location`"*) · Doc-5A §4.0/§5.5 (standard infrastructure-header class). Not F&H:
    frozen-flagged on the route row; value = the frozen item route.
21. **No-context collapse shape: item faces → 404; the list face → empty 200.** Re-read: Doc-5A
    §6.6 · §8.7 (exclusion consistency) · the `withActiveOrg` fail-closed deny/empty doctrine.
    Not F&H: a collection route's existence is not a protected fact; the empty set is the
    non-disclosing deny/empty realization and §8.7 holds trivially; item faces keep the ratified
    404 collapse.

## 9. Checkpoint

- `96a31eb` — `feat(identity): W2-IDN-6.5 delegation wired API (6 contracts) + §5.10 boundary
  realization + §B.6 dedup store [checkpoint]` — bounds the ENTIRE WP surface (41 files: domain +
  application + infrastructure + contracts + api + server + app routes + migration + schema +
  inngest comment + the three test files, incl. the two authorized user-account-slice folds).
  Coordinator governance files and the external frontend/motion working-tree changes untouched
  (verified via `git status` before staging; `docs/backend/backend_execution_tracker.md` left
  dirty as found — coordinator-owned).
- *(this report + the activation packet land as a follow-up governance checkpoint — SHA in the
  final return message)*

## 10. Packet gaps

Files read beyond the packet's §2–§4 lists (each minimal, reason given):
- `generatedDocs/Doc-3_Policy_Key_Registration_Patch_v1.9_Identity.md` — needed to resolve the
  list `page_size` `[DC-5]` bound; its §Notes turned out to be the governing text for call 15.
  RECOMMEND: any future list-wiring packet should cite it.
- `generatedDocs/Doc-5A_Content_v1.0_Pass5.md` (§8) — the list-response/pagination wire grammar;
  needed to realize `list_delegation_grants` (packet cited §6.2/§9.2/§9.5 but not §8).
- `generatedDocs/Doc-6A_Content_v1.0_Pass1.md` (§2.5) — the realization-choice attribution rule
  §10.3 points at; needed for the store-vehicle adjudication.
- `src/server/context/*.ts` · `src/modules/core/infrastructure/data/system-configuration.service.ts` ·
  `src/shared/db/index.ts` · `tests/_harness/global-setup.ts` · `app/api/identity/users/[id]/*` —
  house seams the retro-fit had to compose with (packet §4 named the directories; the per-file
  reads are within its envelope).
Otherwise the packet was sufficient; both packet paraphrases that dissolved under verbatim
re-read are logged (calls 1–3) per its own warning.

## 11. Readiness

- **Next gate:** Review-A at `96a31eb` · **Team-6 pre-flag: YES** — surfaces: the second authz
  path (dual-party escalation: controller-only writes vs dual-party reads; §7.5 byte-identical
  collapses probed), the reinstate/expiry temporal boundary (both-directions clock tests), and
  the replay-cache poisoning/bypass surface (actor+org+contract scope key probed cross-actor;
  actor-scoped RLS on the store; key length bound; success-only caching — a cached 409 can never
  wedge the retry flow).
- **Blocked on:** nothing.
- **Suggested next work item:** W2-IDN-6.2 (Organization wire) or W2-IDN-7 (POLICY seed — would
  take the §B.6 legs live end-to-end).

## 12. Carries emitted (outbound)

| Target | Obligation | Class |
|---|---|---|
| Board channel (registry) | Register `ESC-IDN-LIST-PAGESIZE` — the identity list page-size POLICY key gap (Doc-3 v1.9 §Notes' pre-named escalation); until resolved, `list_delegation_grants` pagination stays fail-closed | binding (Board action) |
| `W2-IDN-7` packet | durationToMs canonicalization (inbound carry re-emitted, STRENGTHENED: now two private copies — `create-delegation-grant.command.ts` + `command-dedup.repository.ts` — unify at the seed WP) | binding packet carry |
| `W2-IDN-7` packet | Seeding `identity.command_dedup_window` + `identity.user_update_dedup_window` takes the §B.6 wire legs live (production currently fails loud on the unseeded key — verify the end-to-end leg at seed time) | binding packet carry |
| `W2-IDN-6.2/6.3/6.4/6.6/6.8` packets | Every new wired mutation composes the landed §B.6 wrap (mandatory `Idempotency-Key` + replay/persist via `src/server/identity/command-dedup.ts`; per-contract frozen window key) — the store is built once, consumed per sub-WP | fold-in |
| `W2-IDN-6.7` verify row | `upsert_buyer_profile` (§C10, `command_dedup_window`) was NOT retro-fitted (packet scope = the §C4 wires); fold its §B.6 wrap at the 6.7 full-M1-gate verify | fold-in |
| Doc-4C additive channel | OBS-1 wire concurrency-token bootstrap gap (§C9 create/get responses carry no `updated_at`) — additive-patch candidate, never widened locally | future-watch |
| Team-6 / future-watch | OBS-2 deactivate post-departure replay shadowed by the terminal collapse · OBS-3 in-vivo losing-write race not deterministically triggerable (mapper-level discrimination stands) | future-watch |

*Board-ratified permanent section (owner/Board approval of WP-GOV-B, 2026-07-09) — verbatim;
the assignee confirms it held for the whole activation.*

## Frozen Authority Checklist

Before execution, the assignee confirms:

☑ All cited documents are frozen. *(Doc-4C §C9+§B.6 PassB · Doc-2 §5.10:581–590 + §9:677–695 ·
Doc-2_Patch_v1.0.7 + BOARD-DECISION-IDN-DELEG-EXPIRY · Doc-5C Pass1 §2.3 + Pass2 §4.3/§4.4/§5/§7 ·
Doc-5A Pass3 §6 + Pass5 §8 + Pass6 §9 · Doc-4A Pass3 §9/§11.2 · Doc-6A Pass1 §2.5 + Pass3 §10.3 ·
Doc-6C Pass3 §6.1/§6.2/§6.2a · Doc-3 v1.9)*
☑ Every cited section has been re-read verbatim. *(Three packet-level paraphrases dissolved under
verbatim re-read and are logged as judgment calls 1–3.)*
☑ No draft document is treated as authority. *(Playbook/tracker consumed as living pointers only;
every load-bearing bind is to the frozen text.)*
☑ Any uncertainty results in Flag-and-Halt. *(None met the F&H bar; all 21 frozen-text judgment
calls are logged above FOR adjudication, none self-ratified.)*

---

## RV-0153 fix-forward amendment (2026-07-10 — additive; the sections above are unchanged)

**Provenance:** RV-0153 Review-A at `96a31eb` — 🟠 0 BLOCKER · 2 MAJOR · 0 MINOR · 0 NIT · 4 OBS;
19/21 judgment calls CONCUR. F1 (wire result-payload casing vs Doc-5A §3) = program-level
Flag-and-Halt class, escalated on `ESC-WIRE-FIELD-CASING` with a Board packet — **NOT resolved
here; every wire shape left exactly as-built per the coordinator's directive.** F2 (MAJOR,
accepted) fixed forward below.

### (a) F2 remedy — Doc-4A §14.3 in-flight protection on `create_delegation_grant`

**Patch:** `fix(identity): W2-IDN-6.5 §14.3 in-flight create protection (RV-0153 F2) [checkpoint]`.
Files: `src/modules/identity/infrastructure/data/command-dedup.repository.ts` (claim/release
primitives + pending-sentinel + defensive pending-skip in the lookup) ·
`src/modules/identity/contracts/services.ts` (claim/release facades) ·
`src/server/identity/command-dedup.ts` (`claimStoredReplay`/`releaseStoredClaim` wrappers) ·
`src/server/identity/create-delegation-grant.route-handler.ts` (the claim leg) ·
`tests/integration/delegation-wire-slice.test.ts` (the two-racing-creates discriminating probe).

**Design shape chosen (both coordinator-offered shapes fused): a PRE-EXECUTION CLAIM inside the
business transaction + lose-the-claim re-read.** Doc-4A §14.3 (Pass4:159, re-read verbatim): "A
replay arriving while the original execution is still in-flight MUST NOT begin a second execution
of the command's business logic … duplicate business outcomes — a second state transition, a
second audit record, a second outbox event — are prohibited under all timing conditions
(completed, in-progress, or concurrent)." Realization: after the replay-lookup miss, the create
composition INSERTs a PENDING claim row on the scope key (sentinel `response_status = 0`,
`ON CONFLICT … DO UPDATE … WHERE executed_at + window <= now()` — the conditional reclaim keeps
the §9.4 post-window re-execution alive while a WITHIN-WINDOW row can never be overwritten) —
BEFORE the command runs, on the SAME transaction as the business write. A concurrent same-key
contender blocks on the uncommitted claim's unique-index entry (PostgreSQL speculative-insertion
wait), loses once the winner commits (`affected = 0`, transaction stays healthy — no exception),
re-reads, and returns the winner's stored §9.3 payload; **its business logic never begins** (the
§14.3 letter). Success → the existing persist completes the claim in place; error OUTCOME → the
claim is explicitly released (errors stay uncached, the key never wedges); a THROWN failure rolls
the claim back with the transaction (crash-safe — no wedged key, the reason the claim rides the
business tx rather than a §14.3-literal pre-transaction write; the "before any transaction begins"
sentence governs replay DETECTION, and §14.3 assigns the detection/handling mechanism to
development documents — logged as call 22 below). A lost claim whose re-read resolves nothing is
unreachable by construction (pending rows never commit) and FAILS CLOSED with a throw rather than
risk a second execution.

**Red-direction proof (verified live, red-then-green):** the racing-creates test was written and
run BEFORE the fix, against the as-built `96a31eb` code path — observed RED (the byte-equality
assertion failed: two executions produced two envelopes/reference_ids; under as-built it also
fails on grant count 2, T2's reader invoked, and the winner's dedup record overwritten). After the
claim landed: GREEN (15/15 wire slice). The test pins: exactly ONE grant · exactly ONE
`delegation_grant_issued` audit · both callers byte-equal wire envelopes incl. the ORIGINAL
`reference_id` + equal `Location` · the winner's injected M2 reader called exactly once · **the
loser's reader called ZERO times** (its business logic never began). Interleave = the RV-0150
serialization-test idiom (deliberate in-flight window via a slow injected reader + a 120 ms
stagger); every scheduling order converges to the same assertions (non-flaky by construction).

**Scope discipline held:** zero change to any frozen wire shape/register (F1 surfaces untouched);
every OTHER mutation's CAS/machine coverage untouched (the claim is create-only; the lifecycle/
§C4 legs keep their upheld §9.4-row-3 assignment); the §7.5 poisoning-guard scope-key semantics
survive verbatim (the claim keys on the same contract × actor × org × key tuple).

### (b) §8 judgment-call log amendments

- **Call 9 — CONCESSION (RV-0153 F2 partial):** the §9.4-row-3 "concurrency model owns the
  overlap" assignment was upheld for the CAS/machine-covered mutations but was INCOMPLETE for
  create, which has no CAS leg — the §14.3 in-flight clause (Pass4:159) governs there and was
  unrealized at `96a31eb`. Conceded and fixed forward (above).
- **Call 22 (NEW — the F2 fix's design call, FOR adjudication):** pre-execution claim INSIDE the
  business transaction (not a separate committed pre-transaction claim write). Frozen authority
  re-read: Doc-4A §14.3 Pass4:157 ("applied at the application layer before any transaction
  begins. A replay is detected and the stored result returned without initiating a new write
  transaction") + Pass4:159 ("The specific detection and handling mechanism belongs in
  development documents"). Reading: the pre-transaction sentence governs replay DETECTION (the
  lookup — realized: a detected replay initiates no write); the in-flight mechanism is explicitly
  development-owned. The same-tx claim was chosen over a committed pre-claim because a crash
  between a COMMITTED pre-claim and its completion would wedge the key for the whole window,
  whereas the same-tx claim self-releases on rollback — strictly safer, same §14.3 outcome. Not
  F&H: no conflict; the mechanism choice is corpus-assigned to this layer.
- **Call 23 (NEW):** pending-claim sentinel `response_status = 0` + defensive lookup skip +
  error-outcome release. Not F&H: an internal store encoding (§2.5-class physical realization of
  a development-owned mechanism); committed pending rows are unreachable by construction; the
  release keeps the upheld success-only-caching call 7 true on the claim path.
- **Call 7 — citation completion (RV-0153 disposition; reviewer's completion adopted):**
  success-only caching is additionally grounded by Doc-4A §11.3 ("A validation failure has no
  effect … no audit record of the business action") — a failed attempt is not an execution
  outcome the §14.3 joint rule obligates the store to reproduce — alongside the already-cited
  §14.7/§9.6 retry-liveness ground. The residual §14.4-row-1 ("after the original … failed
  definitively" → "return stored result") ↔ §11.3/§14.7 frozen-internal tension is RV-0153 OBS-1,
  an upstream additive candidate — not resolvable here.

### (c) Suite state at the patch

Full suite **301 tests / 26 files ALL PASS** vs the 300/26 reactivation baseline — delta = +1
(the racing-creates probe), zero regressions. tsc 0 · ESLint clean · Prettier clean (WP surface).
Next gate: Review-A delta re-verify at the patch SHA → Review-B ∥ Team-6 (pre-flag YES — F2 sits
on the pre-flagged replay surface); 6.5 close additionally awaits the owner's F1 gating ruling
(`ESC-WIRE-FIELD-CASING` Board packet §6 ask 2).
