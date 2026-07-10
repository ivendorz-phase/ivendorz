# COMPLETION REPORT — Agent M1 · W2-IDN-6.8

## 0. Header
- **Role / Work item:**    Agent M1 — Identity & Organization · `W2-IDN-6.8` (Wired API · §C11
  Workflow-Settings, 2 contracts) · packet:
  `governanceReviews/milestones/w2-idn-6.8/ACTIVATION-PACKET.md`
- **Outcome:**             COMPLETE
- **Checkpoint SHA:**      `<checkpoint — see §9>` · branch: `wave/2-core-platform`

## 1. Summary
Wired the two frozen §C11 Organization-Workflow-Settings contracts on their Doc-5C §6.1 routes: the
active-org POLICY-bounded update (`PATCH`) and the owning-org read (`GET`). The update is an audited,
atomic D7 write under an `updated_at` If-Match CAS (not create-class — absent row → `NOT_FOUND`),
authorized by the REAL Doc-2 §7 slug `can_manage_workflow_settings` (O,D). **THE GATE — the
governance-signal firewall — is proven signal-free by a discriminating 8E test** (the audited write's
field set is exactly the four §C11 workflow keys; no Trust/Performance/Financial-Tier/Capacity/
Buyer-Vendor-Status is written, even under a smuggle). The only POLICY key consumed via
`core.config_value_query.v1` is the real `[DC-5]` dedup window — the frozen text defines **no field-value
POLICY bound** for these settings (derivation + citations in §8), so none was coined. Full suite green,
zero regressions.

## 2. Files changed
**Added (9):**
- `src/modules/identity/domain/read-models/workflow-settings.read-model.ts`
- `src/modules/identity/domain/policies/workflow-settings.policy.ts`
- `src/modules/identity/application/queries/get-workflow-settings.query.ts`
- `src/modules/identity/application/commands/update-workflow-settings.command.ts`
- `src/modules/identity/infrastructure/data/workflow-settings.repository.ts`
- `src/modules/identity/api/workflow-settings.handler.ts`
- `src/server/identity/workflow-settings.route-handler.ts`
- `app/api/identity/organization_workflow_settings/route.ts`
- `tests/integration/workflow-settings-wire-slice.test.ts`

**Modified (4):**
- `src/modules/identity/domain/audit-actions.ts` (added `WORKFLOW_SETTINGS_ENTITY_TYPE` + `WorkflowSettingsAuditAction`)
- `src/modules/identity/contracts/types.ts` (added the §C11 DTOs — additive; existing exports unbroken)
- `src/modules/identity/contracts/services.ts` (added the §C11 facade block — additive)
- `src/server/identity/index.ts` (exported the two §C11 handlers)

## 3. Contracts changed
`src/modules/identity/contracts/{types,services}.ts` — **additive only** (One Module, One Owner). New DTOs
`WorkflowSettingsView`, `GetWorkflowSettingsResult`, `UpdateWorkflowSettingsInput/Result/Outcome`,
`WorkflowSettingsError`, `UpdateWorkflowSettingsDeferredFields`; new facades `getWorkflowSettings(activeOrgId, db)` +
`updateWorkflowSettings(input, ctx, deps, db)`; re-exported the §C11 wire mappers + `MANAGE_WORKFLOW_SETTINGS_SLUG`.
Consumed `@/modules/core/contracts` (`appendAuditRecord`, `configValueQuery` via the §B.6 dedup helper) — consume-only,
never edited. No cross-module import beyond `contracts/`.

## 4. Migrations
**None.** The `organization_workflow_settings` table + RLS exist from W2-IDN-1 (Doc-6C §3.7). No column
was added (the two §C11 fields with no realized column are deferred/fail-closed, §8 call #2). No schema
change was needed or authored.

## 5. Events
**Zero** — `[DC-1]` (frozen truth: Module 1 emits no Doc-2 §8 event; Doc-4C §C12.4 "Module 1 produces no
domain events"). The update writes ONLY `organization_workflow_settings` (+ the atomic `core.audit_records`
row + the `identity.command_dedup` idempotency row). No outbox write.

## 6. Tests
Doc-8 bands **8C + 8E**, real PostgreSQL via the composition surfaces only (`docker compose up -d db`).
New slice: `tests/integration/workflow-settings-wire-slice.test.ts` (4 tests).
- 8C — GET (present 200 + six-key object [4 realized + 2 deferred null] + ETag; absent 404; 401) · PATCH
  (Owner+Director 200 with old/new audit; Officer 403; absent row 404; stale If-Match 409+ETag; deferred
  400; empty 400; bad enum 400; bad jsonb 400; missing If-Match 400; absent Idempotency-Key 400) · §B.6
  replay (stored 200, one mutation, one audit; the `[DC-5]` window read via the REAL
  `identity.command_dedup_window` POLICY key through `config_value_query.v1`, no literal).
- 8E — the governance-signal firewall, DISCRIMINATING (§8 firewall evidence).
- **Baseline delta:** full suite **367 tests / 31 files** vs dispatch baseline **363 / 30** — exactly
  +4 tests / +1 file (this slice); **zero regressions**.
- **Discrimination highlights:**
  - 8E Discriminator 1 REDs if any governance-signal (or any extra) key enters the audited write —
    `Object.keys(newValue).sort()` must equal exactly `[approval_chain, financial_permissions,
    notification_rules, rfq_approval_mode]`.
  - 8E Discriminator 2 REDs if the write touches the org's Trust-reflected `verification_level` or any
    sibling identity table (snapshots unchanged across the write).
  - 8E Discriminator 3 (SMUGGLE) REDs if a governance-signal-shaped input field ever widens the write —
    a body carrying `trust_score/performance_score/financial_tier/capacity_profile/buyer_vendor_status`
    still yields exactly the four workflow keys in the audit and none of the smuggled VALUES in the row.
  - PATCH stale-If-Match REDs (200 not 409) if the CAS token is not enforced; §B.6 replay REDs (a second
    audit row / a re-executed `multi_step`) if the dedup store or window read is dropped.

**RV-0159 B-1 fix-forward amendment (2026-07-10 — TEST-ONLY, zero production-code change; `git diff` non-
test/non-report set EMPTY):**
- **B-1 (MINOR, accepted) — `buyer_courtesy_options` deferred fail-close pinned.** Added the twin
  assertion in the PATCH slice mirroring `default_routing_mode`:
  `deferredFields:{ buyerCourtesyOptionsSupplied:true } → 400 + error_code identity_workflow_invalid_input
  + /deferred/ message` (also added the `error_code` pin to the `default_routing_mode` sibling for
  symmetry). **Non-vacuous:** the policy's reject operand is `defaultRoutingModeSupplied ||
  buyerCourtesyOptionsSupplied`; dropping the `buyerCourtesyOptionsSupplied` half lets the frozen-declared
  field WRITE (200) instead of reject (400) — the `toBe(400)` REDs (Review-B probe-2 confirmed the drop was
  previously undetected). Closes the RV-0157 MINOR-B1 twin-unpinned class. Runtime behavior UNCHANGED (the
  deferred pair stays Board-carried to IDN-7 for realize-vs-defer; §12 F1 row).
- **B-2 (NIT, folded) — dead `strip` helper removed.** Deleted the copy-paste `strip` helper (was kept
  alive only by `void strip;`); the replay byte-compare uses `wireJson`. No behavior touched.
- **T6-OBS-2 (folded) — nested-jsonb firewall assertion added (8E Discriminator 4).** A request nesting
  governance-signal NAMES inside legitimately-writable jsonb (`financial_permissions:{financial_tier:"A",
  trust_score:99, …}` + `notification_rules:{performance_score:99, …}`) → 200; the audit `newValue`
  TOP-LEVEL keys are EXACTLY the four workflow keys (no signal key promoted); the nested values persist
  VERBATIM as inert org-config in the jsonb columns; the org's `verification_level` is UNCHANGED. Pins what
  Team-6's P1 probe proved structurally (the jsonb-passthrough risk is contained — no signal consumer reads
  this table). REDs if a nested key were ever flattened into the audited top-level or routed to a signal.
- **OBS-B (folded — it was cheap) — delegation-ineligibility pinned.** Added a DB-free command-direct test
  (new `it` block): an injected `check_permission` returning `{decision:"allow", satisfiedBy:"delegation"}`
  → the command REJECTS `403 identity_workflow_forbidden` (the §C11:716 `satisfiedBy!=='membership'` guard,
  upstream of any write). Non-vacuous: dropping the guard operand lets a delegation-allow proceed (404/200),
  not 403. (Trivial via the injectable `authorize` dep — no delegation-grant seeding needed.)
- **Test delta:** slice 4 → **5 tests** (+1 = the OBS-B block; B-1 + T6-OBS-2 added assertions into existing
  tests). Full suite **368 / 31** (was 367 / 31), zero regressions. tsc / ESLint / Prettier green. (The one
  first-run failure was the documented unrelated `outbox-dispatch-hardening` CAS timing flake — "CAS flake
  dormant" per both RV-0159 entries; deterministic PASS on re-run; the workflow slice is 5/5 both runs.)

## 7. Self-review
- Self-check gates run: manual `/ivendorz-security` lens (org context server-resolved; explicit org
  anchor RV-0146; no RLS-only gate; no cross-module access; firewall) · `/review-a-lens` (projection /
  coined-token / firewall / non-disclosure / contract-grounding / invented-route).
- Red-Flag scan (CLAUDE.md checklist): **CLEAR** — no new module/ownership/signal/event/migration/
  cross-module-access/FK; imports only `contracts/`; no ADR override; no frozen-doc edit.
- Standing-charter Never-list: **no violation** (Team-6 pre-flag surface addressed — firewall proven
  signal-free; POLICY-bound not bypassed — no field bound exists, none coined).
- tsc / lint / prettier: **green** (ESLint 0 errors 0 warnings; tsc clean; prettier clean).
- **Self-severity of residuals** (§13 ladder BY POINTER; Raise ≠ Accept): BLOCKER 0 · MAJOR 0 · MINOR 0
  · NIT 0 · OBS 2 — (OBS-1) settings-row first-provisioning has no §C11 contract and no org-create
  path writes it (§8 call #3, out of scope); (OBS-2) `identity_workflow_policy_violation` is wired but
  unreachable-by-construction under the realized additive-only field model (§8 call #6).

## 8. Open questions / ESC
**Carried handles (no new ESC coined):** `ESC-WIRE-FIELD-CASING` (🟥 owner-pending) — result payloads built
in the ratified house shape (Doc-5A §5.6 envelope; snake_case audit-payload keys mirror the frozen §C11
wire field names) — logged as carried. `[DC-5]` window unseeded until W2-IDN-7 (consumed as the real key,
test-scoped seed). `[DC-1]` zero events. `[ESC-IDN-AUDIT]` — **not applicable here** (the §9 action is
enumerated; near-pointer used, nothing on the interim channel).

**Judgment-call log** (every call — FOR Review-A adjudication, never self-ratified):

1. **No field-value POLICY bound exists for the workflow-settings fields; NOT a Flag-and-Halt; the real
   `config_value_query.v1` consumption is the `[DC-5]` dedup window.** — Frozen re-read: §C11 update POLICY
   leg (Doc-4C PassB:720) "bounds resolved via Doc-4B `core.config_value_query.v1` **where Doc-3 §12.3
   defines**"; Doc-3 §12.3 (line 783, verbatim) enumerates the ORG-setting CATEGORIES ("RFQ approval mode
   and chain; financial/award approval thresholds; notification rules; default routing mode; buyer-courtesy
   options") but defines **no POLICY-key ceiling/floor**; Doc-3 §12.2 contains **no** key that bounds a
   workflow field (the `rfq.approval_reminder_hours`/`rfq.approval_stale_days` keys are M3 approval-flow
   TIMERS, consumed by the M3 gate, not identity-write field bounds); Doc-3 v1.9 Identity patch §3 = 7
   `identity.*` keys, **all idempotency/timer/validity windows** (§5: "Doc-6C registers exactly the Doc-4C-
   referenced set" — no field bound); Doc-4A §18.4 (Pass5:79) "**Whether** the setting is bounded by a
   POLICY key (**most** ORG settings have POLICY-defined ceiling/floor)" — "most", not all → an ORG setting
   with no POLICY bound is conformant. **Why NOT Flag-and-Halt:** the packet's halt trigger is "a §C11-
   referenced POLICY key not registered anywhere" — §C11 references **no** concrete field-bound key (it
   names only the mechanism + "where §12.3 defines"), and §12.3 defines none, so there is no unregistered
   referenced key and no ambiguity the frozen text leaves open (§18.4 explicitly permits an unbounded ORG
   setting). Doc-4A §18.2 (Pass5:46) forbids INVENTING a bound — so none is coined. The one real POLICY key
   consumed via `config_value_query.v1` is `identity.command_dedup_window` (Doc-3 v1.9 key #1; §C11
   PassB:723 "dedup `…identity.command_dedup_window` `[DC-5]`") — read as the real key, test-scoped seed,
   no literal fallback (the IDN-4/IDN-5 precedent). **Divergence flagged:** the packet's paraphrase
   "POLICY-bounded field validation the core discipline" over-reads §C11; per the packet's own instruction
   (distrust paraphrase, derive from frozen text), the derivation yields no field-value bound.
2. **`default_routing_mode` + `buyer_courtesy_options` are deferred/fail-closed.** — Frozen re-read: §C11
   Request/Response (Doc-4C PassB:707/:718) lists SIX fields; Doc-6C §3.7 DDL realizes FOUR columns
   (`rfq_approval_mode`, `approval_chain_jsonb`, `financial_permissions_jsonb`, `notification_rules_jsonb`);
   Doc-2 §10.2 line 723 lists the same four. The two unrealized fields have no column. Write: a supplied
   value is VALIDATION-rejected (the `update_organization_profile` deferred-field precedent — silently
   dropping fabricates success; adding a column needs a migration this WP must not author). Read: surfaced
   as `null` to preserve the frozen six-key "always" response shape without fabricating a value. **Why NOT
   Flag-and-Halt:** the writable-field set IS resolved by the frozen text (the org-profile deferred-field
   pattern is ratified; no migration/ambiguity).
3. **The update is a pure CAS-update; absent row → `identity_workflow_not_found`; NOT create-class; first-
   row provisioning is out of scope.** — Frozen re-read: §C11 update Request has `updated_at : required`
   (a CAS token cannot compare against a non-existent row); §C11 State Effects "simple", error register
   carries `identity_workflow_not_found`; Doc-5C §6.2 (Pass2:170) "`upsert` creates on first call" names the
   buyer-profile UPSERT specifically (kind = "upsert"), whereas `update_workflow_settings` is kind =
   "update" (Doc-5C §6.1). No `create_workflow_settings` contract exists in the §C11 inventory. **Why NOT
   Flag-and-Halt:** the two contracts are fully buildable against the "row exists" model; the first-row
   provisioning locus is a separate concern (OBS-1), not a corpus conflict.
4. **Audit `entity_type` = `organization_workflow_settings` (verbatim table/entity name).** — Frozen re-read:
   §C11 Mutation-Scope / Appendix A name the entity `organization_workflow_settings`. Precedent: table-
   singular (`buyer_profiles`→`buyer_profile`). "settings" is a collective noun with no natural singular →
   the verbatim entity name is the least-inventive serialization (Doc-4C-class token; a rename touches
   Doc-4C + the constant, never Doc-2). **Why NOT Flag-and-Halt:** a serialization choice within Doc-4C
   authority, grounded in the frozen entity name; nothing coined.
5. **Audit action `workflow_settings_changed` binds to the ENUMERATED Doc-2 §9 action "workflow settings
   change" — NOT `[ESC-IDN-AUDIT]`.** — Frozen re-read: Doc-2 §9 line 686 (Organization domain) enumerates
   "… ownership change/succession, **workflow settings change**, subscription change, …"; §C11 Audit
   (PassB:724) "yes; Domain Organization "workflow settings change" (§9)"; Doc-4C Appendix A (PassB:792)
   carries only `DC-5` on `update_workflow_settings` (no `A` marker). The role/permission-change enumerated-
   action precedent. **Why NOT Flag-and-Halt:** the §9 near-pointer exists (enumerated); no action invented.
6. **§6.2 FIXED-authz floor holds by construction; `identity_workflow_policy_violation` is the reserved
   guard.** — Frozen re-read: Doc-4A §6.2 (Pass2:175) "A workflow setting may add required approvals; it may
   never remove a required slug"; Doc-5C §6.3 (Pass2:176) "enforced upstream (BUSINESS → 422)". The realized
   additive-only fields cannot express a slug-removal (no "bypass slug X" field; `rfq_approval_mode='none'`
   is the DB DEFAULT = "no mandatory extra step", not a FIXED-slug removal). The guard is wired
   (currently unreachable-by-construction — the `identity_org_*` QUOTA-unreachable precedent; `void patch`
   is the future-schema seam). **Why NOT Flag-and-Halt:** the frozen BUSINESS rule is realized (structurally
   satisfied); a richer approval_chain schema would activate the guard.
7. **Explicit `activeOrgId` org anchor (RV-0146), not RLS-reliance, on the repository read/write.** — Frozen
   re-read: `authz.repository.ts` doctrine (Doc-6C §6.2a / RV-0146): "carries its OWN explicit org anchor …
   does NOT rely on RLS for correctness (a local/superuser connection bypasses RLS entirely)". Empirically
   confirmed during build: the test harness bypasses RLS (a `findFirst({deletedAt:null})` returned another
   org's singleton). **Why NOT Flag-and-Halt:** correctness + doctrine alignment; the org-lifecycle repo
   precedent; RLS remains the backstop.
8. **`get_workflow_settings` emits an `ETag` (current `updated_at`) response header.** — Frozen re-read:
   Doc-5C §6.4 (Pass2:182) update carries `If-Match (updated_at)`, §9.5/§4.0 ETag is an HTTP infrastructure
   header (not a Doc-5A application field). The ETag hands the client the token the update's REQUIRED
   If-Match consumes. **Why NOT Flag-and-Halt:** the frozen six-key response BODY is unchanged; an HTTP §4.0
   header is a benign realization convention (the org-profile conflict-ETag precedent).

**Governance-signal firewall — discrimination evidence (THE GATE; the write proven signal-free):**
The five governance signals (Trust Score, Performance Score, Financial Tier, Capacity Profile, Buyer-Vendor
Status — CLAUDE.md §4) are owned by M5/M2/M4 in separate schemas with no cross-module FK; **Module 1 has no
code path to write them** — the update command's dependency set is `{ workflow-settings repository,
core.appendAuditRecord, the §B.6 dedup store }`, containing **no signal service**, and the write column set
is closed to the four Doc-6C §3.7 columns + the server-set `updated_by` (`§B.7`/`§C12.6` default `none`).
Proven — not asserted — by the 8E test's three discriminators (§6 highlights): (1) the audited write's
field set is EXACTLY the four workflow keys; (2) the org's Trust-reflected `verification_level` + sibling
identity tables are untouched; (3) a governance-signal-shaped SMUGGLE never enters the write. Each REDs
under a firewall breach. (The M1 test DB migrates only core+identity — the signal tables do not exist —
so the test is self-contained within the accessible schemas; this is the architectural firewall made
observable, not a tautology. Comments are truthful and tested — RV-0158 F1/F-B1.)

## 9. Checkpoint
Single checkpoint on `wave/2-core-platform`, ONLY the 13 W2-IDN-6.8 files (§2) + this report:
`feat(identity): W2-IDN-6.8 §C11 workflow-settings wired (update+read, firewall-tested) [checkpoint]`
(ends `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`). SHA recorded in the final message.
No coordinator-governance or external working-tree file touched (buyer-rfq / frontend / motion /
trust-ladder / confidentiality / esc_registry / authority map left untouched).

## 10. Packet gaps
Files read beyond the packet's §2–§4 pointer list (all to derive frozen anchors the packet demanded be
re-read, or to mirror ratified precedents): Doc-4A §18 (Pass5) for the FIXED/POLICY/ORG standard §18.2/§18.4;
Doc-3 §12 for §12.2/§12.3 verbatim; Doc-3 v1.9 Identity POLICY-key patch (the registered `identity.*` block);
Doc-6C §3.7 (Pass2) DDL for the realized column set; Doc-2 §9/§10.2 for the enumerated audit action + columns;
Doc-4A §6.2 (Pass2) for the "required slug" rule; the seed migration `20260709130000_identity_catalog_seed`
to confirm the `can_manage_workflow_settings` O,D mapping; in-repo precedents (`update-organization-profile`
command/repo, `upsert-buyer-profile`, `get-buyer-profile` read wire, `invite-member` real-slug authz,
`command-dedup`, `organization-tenant`/`organization.handler` wire). Packet was otherwise sufficient; the one
substantive gap is the packet's "POLICY-bounded field validation" paraphrase (judgment-call #1) — the packet
pre-authorized deriving this from frozen text and flagged the halt condition, which the derivation cleared.

## 11. Readiness
- **Next gate:** **Review-A at `<checkpoint SHA>`** · **Team-6 pre-flag = YES** (security surface: the
  governance-signal firewall [Invariant #6] + the POLICY-bound discipline — both realized and
  discriminating-tested; §8 firewall evidence). Review-A → Team-5 Review-B → then the M1 conformance gate
  (IDN-7).
- **Blocked on:** nothing.
- **Suggested next work item** (coordinator decides): **W2-IDN-7** (M1 conformance gate + the `identity.*`
  POLICY-key seed that seeds `identity.command_dedup_window` this contract consumes) — this was the last
  wired §C sub-domain before the gate.

## 12. Carries emitted (outbound)
| Target | Obligation | Class |
|---|---|---|
| W2-IDN-7 (POLICY seed) | seed `identity.command_dedup_window` (the `[DC-5]` window this §C11 update reads via `config_value_query.v1`; consumed as the real key, no literal) | binding packet carry |
| W2-IDN-7 / M1 gate (OBS-1) | the `organization_workflow_settings` first-row provisioning has no §C11 contract and no org-create path writes it — decide the provisioning locus (org-create default row / seed / a future additive) so `update_workflow_settings` is reachable in production | future-watch |
| Review-A (judgment-call #1) | adjudicate the "no field-value POLICY bound defined; consumed key = `[DC-5]` dedup window; not Flag-and-Halt" derivation vs the packet's "POLICY-bounded field validation" paraphrase | fold-in (review) |
| `ESC-WIRE-FIELD-CASING` (🟥 owner-pending) | result payloads built in the ratified house shape; carried, not resolved | carried handle |
| W2-IDN-7 / M1 conformance gate (RV-0159 F1) | the §C11 deferred pair `default_routing_mode`/`buyer_courtesy_options` (declared writable §C11:707/:718 but no Doc-6C §3.7 column) is realized fail-closed; the M1 gate/Board must rule realize-columns vs formal-defer (parity with the org-profile `ESC-IDN-ORG-PROFILE-FIELDS` deferred fields) | binding fold-in (IDN-7) |

*RV-0159 F1 amendment (2026-07-10, report-only — no code/test change): appended the deferred-pair
forward carry above (last row) per the accepted MINOR — precedent parity with the org-profile
`ESC-IDN-ORG-PROFILE-FIELDS` carry (judgment-call #2 handled the pair fail-closed but did not forward it);
the coordinator has also recorded this as a binding IDN-7 tracker obligation. Existing rows untouched.*

*Board-ratified permanent section — the assignee confirms it held for the whole activation.*

## Frozen Authority Checklist

□ All cited documents are frozen. — **YES** (Doc-2 v1.0.3, Doc-3 v1.0.2 + v1.9 patch, Doc-4A v1.0, Doc-4C
  FROZEN PassB, Doc-5C FROZEN, Doc-6C FROZEN; all `generatedDocs/`).
□ Every cited section has been re-read verbatim. — **YES** (§C11, §B.4–B.10, §6.2, §18.2/§18.4, §12.2/§12.3,
  v1.9 §3/§5, Doc-2 §9 line 686 / §10.2 line 723, Doc-6C §3.7 DDL, Doc-5C §6.1–§6.4/§7.3 — cited by exact
  line/pointer above).
□ No draft document is treated as authority. — **YES** (frozen artifacts only; the packet's paraphrase was
  distrusted and re-derived).
□ Any uncertainty results in Flag-and-Halt. — **YES** (the one candidate — the absent field-value POLICY
  bound — was resolved by frozen text [§18.4 "most", not all; §18.2 escalate-never-invent], not by coining a
  bound; no residual uncertainty).
