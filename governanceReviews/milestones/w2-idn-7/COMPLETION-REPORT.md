# COMPLETION REPORT — Agent M1 · W2-IDN-7

## 0. Header
- **Role / Work item:** Agent M1 — Identity & Organization · `W2-IDN-7` (POLICY seed + catalog 43→45 + durationToMs/clock canonicalization + M1 module conformance gate) · packet: `governanceReviews/milestones/w2-idn-7/ACTIVATION-PACKET.md`
- **Outcome:** COMPLETE
- **Checkpoint SHA:** `e5225c8` (canonicalization) · `20928c1` (seeds + conformance) · `e9ff0b8` (module README/gate) — the review target is `e9ff0b8` · branch: `wave/2-core-platform`

## 1. Summary
Seeded the 2 owner-ruled routing-governance staff slugs (catalog 43→45 = 36 tenant + 9 staff) and the 7 `identity.*` POLICY keys into `core.system_configuration`; unified the three byte-identical M1 duration parsers into one domain value-object (behavior-preserving); and ran the M1 module conformance gate (8C+8D+8E green). Full suite 368/31→381/33, zero regressions. The gate validated the full M1 surface INCLUDING the concurrent owner `_validation.ts` refactor (`1ff8ed0`) — confirmed green, no drift. The M1 module DoD is MET; the remaining close blockers are owner/Board-gated and surfaced (not decided) below.

## 2. Files changed
**Added (7):**
- `src/modules/identity/domain/value-objects/policy-duration.ts` (the unified interpreter)
- `src/modules/identity/README.md` (module-close DoD artifact)
- `prisma/migrations/20260710160000_identity_routing_slugs_seed/migration.sql`
- `prisma/migrations/20260710170000_identity_policy_key_seed/migration.sql`
- `tests/integration/identity-policy-keys-seed.test.ts`
- `tests/unit/policy-duration.test.ts`
- `generatedDocs/Doc-6C_Patch_v1.0.3.md` (count overlay 43→45; additive, no base edit)

**Modified (7):**
- `src/modules/identity/application/commands/create-delegation-grant.command.ts` (bind unified parser)
- `src/modules/identity/application/commands/expire-invitations.command.ts` (bind unified parser)
- `src/modules/identity/infrastructure/data/command-dedup.repository.ts` (bind unified parser)
- `src/modules/identity/contracts/services.ts` (re-export `policyDurationToMs`)
- `src/modules/identity/application/queries/list-permissions.query.ts` (truthful comment 43→45)
- `tests/integration/identity-permission-catalog-seed.test.ts` (45/36/9 + routing-slug-not-on-bundle)
- `tests/integration/role-wire-slice.test.ts` (list_permissions 45/36/9)

**Deleted:** None.

## 3. Contracts changed
`src/modules/identity/contracts/services.ts` — **additive only**: one re-export `export { policyDurationToMs } from "../domain/value-objects/policy-duration"`. No existing export changed/broken; no wire contract, DTO, service signature, or ID touched. It surfaces an internal pure utility for the conformance suites (the eslint `boundaries` test-access rule; the established pattern the file already uses for `findCommandDedupRecord` etc.). No cross-module coupling.

## 4. Migrations
Two forward-only idempotent DATA migrations (no DDL), applied clean (`prisma migrate deploy` — "successfully applied"), re-run safe (`ON CONFLICT` upserts):
- `20260710160000_identity_routing_slugs_seed` — +2 `staff`-space slugs to `identity.permissions`; NO `role_permissions` rows (Inv #2). Deterministic UUIDv4 PKs.
- `20260710170000_identity_policy_key_seed` — 7 `identity.*` rows into `core.system_configuration`; deterministic UUIDv4 PKs.

DB verified post-apply: `identity.permissions` = 45 (tenant 36 / staff 9); 2 routing slugs `space='staff'`; staff→bundle mappings = 0; 7 `identity.*` config rows with values 24h/24h/24h/14d/365d/1h/7d (all `duration`). `prisma/schema.prisma` — untouched (no table change; Flag-and-Halt not triggered).

## 5. Events
**Zero.** M1 emits no §8 events (frozen truth; `[DC-1]`). No outbox write in this WP. Nothing attributed to `identity` outside the Doc-2 §8 26-name catalog.

## 6. Tests
Doc-8 bands: **8C** (contract/API — `role-wire-slice` list_permissions envelope + counts) · **8D** (schema/RLS/immutability — unaffected, all green) · **8E** (domain invariants — catalog Inv #2 + POLICY-key seed conformance). Run env: local ephemeral Postgres (`docker compose up -d db`); `prisma migrate deploy` in global-setup.
- **Baseline delta:** full suite **381 / 33 files** vs dispatch baseline **368 / 31** — **zero regressions**. Delta = +2 files (`identity-policy-keys-seed` 4 tests, `policy-duration` 7 tests) + 2 routing-slug cases in the catalog suite = +13 tests.
- **8C/8D/8E gate:** all green. tsc 0 · ESLint 0 · Prettier clean.
- **Discrimination highlights (each new test fails under a wrong impl):**
  - catalog-45 pin — `toHaveLength(45)`; a missing/extra routing slug reddens.
  - routing-slug-not-on-bundle (per-slug `it.each`) — a routing slug wrongly mapped to any bundle makes `rolePermission.count(permissionId)` non-zero → red (Inv #2 firewall, pinned per slug).
  - POLICY-key-seeded — each key resolved via `core.config_value_query.v1` must equal its seeded row (value + value_type); a missing/mis-typed key reddens; the value is also fed through the unified `policyDurationToMs` (a non-duration value throws).
  - durationToMs-unified — all arms (s/m/h/d + integer-seconds), the 5 real seeded values, whitespace tolerance, throw-on-uninterpretable, and each former call site's VERBATIM throw message reproduced via the context label.

## 7. Self-review
- Self-check: manual `/ivendorz-security`-equivalent (org-context untouched · no RLS regression · no cross-module DB access · seed writes to M0 store are the frozen Doc-6C §5/§6 realization, not app-layer cross-module access) · `/review-a-lens`-equivalent (scope · contracts additive · signals untouched · invariants · no invented slug/key/token).
- **Red-Flag scan (CLAUDE.md):** CLEAR — no new module · no ownership change · no governance-signal change · no Users-Act/Orgs-Own change · no cross-module DB access (seed = frozen realization; consumers use the M0 read contract) · no cross-module FK · imports only own-module internals + `@/modules/core/contracts` + `shared` · no workflow-owns-state · no read-model-as-truth · Admin bypasses nothing · no ADR override · **no FROZEN base-doc edit** (the Doc-6C overlay is an additive patch, pre-authorized).
- **Standing-charter Never-list:** no violation.
- tsc / ESLint / Prettier: **green** (tsc 0 errors at HEAD; ESLint `.` = 0; Prettier clean on all changed files).
- **Self-severity of residuals (self-assessment; Raise ≠ Accept):** BLOCKER 0 · MAJOR 0 · MINOR 0 · NIT 0 · OBS 1 — OBS: the window-clock source split (find JS vs claim SQL `now()`) is preserved, not unified (behavior-preserving mandate; see §8 call 2).

## 8. Open questions / ESC
**Surfaced-only M1-close blockers (owner/Board-gated — NOT decided here):**
- `ESC-WIRE-FIELD-CASING` (🟥) — the wired `result` camelCase envelope shape; gates the 6.5 close (RV-0153 F1). Not re-cased.
- Realize-vs-defer ruling on the §C11 deferred pair (`default_routing_mode`/`buyer_courtesy_options`) + `ESC-IDN-ORG-PROFILE-FIELDS` (RV-0159 F1). No column realized, no bound coined.
- Workflow-settings first-row provisioning locus (RV-0159 OBS-1). No provisioning contract built (none frozen).
- Non-gating Board ESC queue (fail-closed interims): `2FA-RECOVERY` · `PREF-KEYS` · `LIST-PAGESIZE` (Doc-3 v1.9 §5 — no identity page-size key) · `INVITE-ACCOUNT` · `CTX-SUSPENDED-DOWNSTREAM`.
- `[ESC-IDN-AUDIT]` (delegation serialization-token pinning — near-pointer interim) · `[DC-1]` (zero events).

**Judgment-call log (every call FOR Review-A adjudication; none self-ratified):**
1. **Routing-slug seed-PKs = deterministic UUIDv4** (not `gen_random_uuid()` like the live 43). Authority RE-READ: `BOARD-PACKET-SEED-PK-UUID_v1.0.md:64-71` (Option A, forward-binding; names W2-IDN-7) + packet §5 "seed-PK deterministic UUIDv4 (never runtime-random)". The existing 43 keep `gen_random_uuid()` (grandfathered — the ruling re-keys no live row; natural key = `slug`). Not Flag-and-Halt: the ruling explicitly forward-binds new seeds; harmless (idempotent on `slug`).
2. **Window-clock (RV-0153 OBS-Δ3) NOT unified; duration PARSER unified.** Authority RE-READ: packet §1(c)/§4 ("if it would change any observable behavior, STOP and hand back") + RV-0153 OBS-Δ3 ("boundary-microscopic, fail-closed", non-gating) + code (`command-dedup.repository.ts` find = injectable JS clock `deps.now`, claim = atomic SQL `now()` in the `ON CONFLICT` guard). Evidence: the production caller `src/server/identity/command-dedup.ts` injects only `{configValueQuery}` (never `now`); no test injects `deps.now` for the dedup path. Making find use SQL `now()` (or claim use JS) changes the window reference clock (an observable, if untested, behavior change) and/or the atomic guard. Per the packet's STOP condition I preserved both paths byte-identically and unified only the duplicated parser. Not Flag-and-Halt of the WP: the parser unification (the substantive dedup) is delivered; the clock split is surfaced as a behavior-change carry (§12). NOT resolved locally.
3. **Authored the Doc-6C count overlay `Doc-6C_Patch_v1.0.3.md`.** Authority RE-READ: packet §1 in-scope ("Doc-6C count-overlay per the `Doc-6C_Patch_v1.0.1` precedent") + `Doc-2_Patch_v1.0.8.md:57-60` §4(a) (carries the "Doc-6C count-assertion overlay … at W2-IDN-7") + `BOARD-DECISION-RFQ-SLUG_v1.0.md:50-54`. It is additive (no frozen base edit), pre-authorized, coins nothing — NOT the Red-Flag "modify a FROZEN document" (which means editing the base in place; `Doc-6C_Patch_v1.0.1/1.0.2` are the same additive mechanism). Did NOT register it in `00_AUTHORITY_MAP.md` (coordinator governance file). Discardable if the owner/coordinator prefers to author it.
4. **Created `src/modules/identity/README.md`** (no module-README precedent exists). Authority RE-READ: packet §4 CODE ("README (module) — update per §10 DoD") + playbook §10:233 ("README updated"). M1 is the first module to reach its conformance gate; the README is the module-close artifact. Reference-never-restate.
5. **POLICY-key test re-seeds in `beforeAll` (idempotent).** Sibling suites (`delegation-*`, `membership-*`, alphabetically earlier) seed these SAME keys test-scoped and `deleteMany` them in teardown (a pre-seed pattern). Re-applying the migration's own INSERT guarantees order-independence and doubles as a re-runnability proof. Not a behavior change to any consumer.
6. **Shared helper home = `domain/value-objects/`, re-exported via `contracts/`.** The parser is a pure value interpretation (both application + infrastructure depend inward on domain — layer-legal). NOT `src/shared/` (would invite coupling M0's separate `parseDurationMs`, out of scope). Tests reach it via `contracts/` (the eslint `boundaries` test-access surface).
7. **Sweep-cadence binding (RV-0149 OBS-7) NOT implemented.** The `identity.delegation_expiry_sweep_cadence` key is now seeded, but binding the Inngest cron to the POLICY cadence is (a) out of the packet's §1 scope (a–d) and (b) a behavior change (Inngest cron is registration-fixed; an in-function cadence gate skips ticks). Surfaced as a carry (§12) + packet gap (§10).
8. **Error-message marker `(W2-IDN-7 seed)` preserved verbatim** in the unified parser template. Behavior-preserving (the test regex `/not an interpretable duration/` unaffected); now that the keys ARE seeded the marker reads as "an uninterpretable value is a seed defect" — kept exact to guarantee byte-identical throws.

## 9. Checkpoint
- `e5225c8` — `feat(identity): W2-IDN-7 unify durationToMs POLICY-duration interpreter [checkpoint]` — bounds the canonicalization (6 files: the value-object, 3 rewired consumers, the contracts re-export, the unit test).
- `20928c1` — `feat(identity): W2-IDN-7 seed catalog 43->45 + 7 identity POLICY keys [checkpoint]` — bounds the seeds + conformance (7 files: 2 migrations, Doc-6C overlay, catalog/policy-key/role-wire tests, list-permissions comment).
- `e9ff0b8` — `feat(identity): W2-IDN-7 M1 module conformance-gate README [checkpoint]` — the module-close README.
All three end `Co-Authored-By: Claude Fable 5`. Staged by explicit path; `1dc0edb..HEAD` = exactly these 14 files; ZERO external/coordinator files swept (verified — the concurrent FE `_validation`/landing dirt + the coordinator tracker stay uncommitted, RV-0159 lesson honored).

## 10. Packet gaps
- Read beyond §3/§4: the RV-0149/0153/0159 review-log close entries (provenance for OBS-Δ3 / OBS-7 / the deferred-field + provisioning carries — packet §2 row 4 pointed here); `system-configuration.service.ts` (to confirm the `core.system_configuration.` prefix-strip so the seeded `key` column matches the live consumer strings); the wire-slice/command tests (to find the sibling POLICY-key seed/teardown interaction). All within the packet's spirit; feeds no template gap.
- **Packet gap surfaced:** the RV-0149 OBS-7 sweep-cadence binding ("W2-IDN-7 or the first WP after the seed binds the sweep to the POLICY cadence") is a standing carry the packet's §1 scope (a–d) does not list; it is a behavior change and Inngest-registration-fixed. Left unimplemented + carried (§12) rather than silently actioned.

## 11. Readiness
- **Next gate:** Review-A at `e9ff0b8`. **Team-6 pre-flag = YES** (the catalog seed is the authz substrate — a mis-seeded staff slug on an org bundle = Inv #2 breach; the conformance gate is the module-wide security assertion; the POLICY seed feeds the live dedup/timer windows).
- **Blocked on:** nothing for the WP deliverables. The M1 *module close* is blocked on the owner/Board-gated items in §8 (surfaced, not this WP's to resolve).
- **Suggested next work item (coordinator decides):** the owner/Board rulings on §8 (wire-casing, realize-vs-defer, provisioning locus), then the M1 module-close gate; separately, register `Doc-6C_Patch_v1.0.3` in `00_AUTHORITY_MAP.md`.

## 12. Carries emitted (outbound)
- **Coordinator / `00_AUTHORITY_MAP.md`** · register `Doc-6C_Patch_v1.0.3` (Doc-6C series row → v1.0.3 + patch-chain row) + close the `ESC-RFQ-SLUG` registry row's Doc-6C-overlay leg · class: **channel (governance-file edit)**.
- **M1 module-close gate / Board** · rule the §8 items (wire-casing 🟥 · realize-vs-defer deferred pair + org-profile fields · provisioning locus · the non-gating ESC queue) before M1 closes · class: **binding (owner/Board)**.
- **Next M1 timer WP (post-seed)** · bind the delegation expiry sweep to `identity.delegation_expiry_sweep_cadence` (RV-0149 OBS-7 — the "never a literal" mandate; behavior change, own authorization) · class: **binding packet carry**.
- **Behavior-change channel** · unify the `command_dedup` window-clock source (RV-0153 OBS-Δ3) — requires a behavior-change authorization (non-gating; fail-closed today) · class: **future-watch**.

*Board-ratified permanent section (owner/Board approval of WP-GOV-B, 2026-07-09) — verbatim; the assignee confirms it held for the whole activation.*

## Frozen Authority Checklist

Before execution, the assignee confirms:

☑ All cited documents are frozen. (Doc-2 base + Patch v1.0.8 · Doc-3 v1.9 · Doc-6C + patches v1.0.1/1.0.3 · Doc-8C/D/E · the Board decision/packet records; the review-log/playbook are living companions, cited as such, never as frozen authority.)
☑ Every cited section has been re-read verbatim. (The 2 routing slugs from Doc-2 v1.0.8:22/55; the 7 POLICY key names+values from Doc-3 v1.9 §3:30-36; the 36-tenant+7-staff base from ESC-IDN-SLUGCOUNT Option A; the seed-PK convention from BOARD-PACKET-SEED-PK-UUID:64-71; the prefix-strip from `system-configuration.service.ts:49`.)
☑ No draft document is treated as authority.
☑ Any uncertainty results in Flag-and-Halt. (No Flag-and-Halt fired: the Doc-2 v1.0.8↔Doc-6C delta is the AUTHORIZED +2-staff carry, not a conflict; the canonicalization's behavior-sensitive clock leg was preserved + surfaced, not forced.)
