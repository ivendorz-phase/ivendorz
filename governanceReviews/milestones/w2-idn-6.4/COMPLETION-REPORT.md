# COMPLETION REPORT — Agent M1 · W2-IDN-6.4

## 0. Header
- **Role / Work item:**    Agent M1 — Identity & Organization · `W2-IDN-6.4` · packet: `governanceReviews/milestones/w2-idn-6.4/ACTIVATION-PACKET.md`
- **Outcome:**             COMPLETE
- **Checkpoint SHA:**      `e4894a6` (the stable review target) · branch: `wave/2-core-platform`

## 1. Summary
Wired the six Doc-4C §C7 Role & Permission contracts on their Doc-5C §5.1 routes (rows 17–22): two
reads (`list_permissions` — the genuinely-dual-actor wire read; `list_roles` — User/active-org) and
four writes (`create_role` 201+Location, `update_role` PATCH, `set_role_permissions` POST,
`delete_role` DELETE/ADR-012 soft-delete). Realized the Invariant #2 firewall on the WRITE side —
`staff_*` never assignable to an org role, permission set ⊆ the assignable tenant catalog and never
ownership-class (consumes the ratified `OWNERSHIP_CLASS_SLUGS`, DC-CR7), the 4 system bundles
immutable — all service-layer and discriminating-tested (RV-0147 widening/forgery-reject idiom).
Every write is audited to the ENUMERATED Doc-2 §9 "role/permission change" action; the two reads are
unaudited. Full suite green (347/29; +10/+1 vs the 337/28 baseline), zero regressions; tsc/ESLint/
Prettier green.

## 2. Files changed
**Added (13):**
- `src/modules/identity/domain/policies/role-composition.policy.ts`
- `src/modules/identity/infrastructure/data/role.repository.ts`
- `src/modules/identity/application/queries/list-permissions.query.ts`
- `src/modules/identity/application/queries/list-roles.query.ts`
- `src/modules/identity/application/commands/create-role.command.ts`
- `src/modules/identity/application/commands/role-management.command.ts`
- `src/modules/identity/api/role.handler.ts`
- `src/server/identity/role.route-handler.ts`
- `app/api/identity/permissions/route.ts`
- `app/api/identity/roles/route.ts`
- `app/api/identity/roles/[id]/route.ts`
- `app/api/identity/roles/[id]/set_role_permissions/route.ts`
- `tests/integration/role-wire-slice.test.ts`

**Modified (4):**
- `src/modules/identity/contracts/services.ts` (additive — §C7 callables + wire-face re-exports)
- `src/modules/identity/contracts/types.ts` (additive — §C7 input/result/outcome/view types)
- `src/modules/identity/domain/audit-actions.ts` (additive — `ROLE_ENTITY_TYPE` + `RoleAuditAction`)
- `src/server/identity/index.ts` (additive — 6 handler exports)

**As-built route table (Doc-5C §5.1 rows 17–22, verified verbatim):**

| # | Contract | Method · Path | Success | Actor / Scope |
|---|---|---|---|---|
| 17 | `identity.list_permissions.v1` | `GET /identity/permissions` | 200 | User / internal-service · authenticated (dual-actor) |
| 18 | `identity.list_roles.v1` | `GET /identity/roles` | 200 | User · active-org |
| 19 | `identity.create_role.v1` | `POST /identity/roles` (+`Location`) | 201 | User · active-org · `can_manage_users` |
| 20 | `identity.update_role.v1` | `PATCH /identity/roles/{id}` | 200 | User · active-org · `can_manage_users` |
| 21 | `identity.set_role_permissions.v1` | `POST /identity/roles/{id}/set_role_permissions` | 200 | User · active-org · `can_manage_users` |
| 22 | `identity.delete_role.v1` | `DELETE /identity/roles/{id}` (ADR-012 soft-delete) | 200 | User · active-org · `can_manage_users` |

## 3. Contracts changed
`src/modules/identity/contracts/{services,types}.ts` — **additive only**; existing exports unbroken
(tsc + full suite confirm). Surface added: 6 callables (`listPermissions`, `listRoles`, `createRole`,
`updateRole`, `setRolePermissions`, `deleteRole`) + their input/result/outcome/error/view types + the
6 M1-owned wire mappers + context/deps shapes + realization-bound constants. No cross-module import
beyond `@/modules/core/contracts` (type-only `AppendAuditRecord`). One module, one owner respected.

## 4. Migrations
**None.** The `identity.roles` / `role_permissions` / `permissions` tables + the 43-slug + 4-bundle
seed already exist (Doc-6C §3.4–§3.6 / §5; migration `20260709130000_identity_catalog_seed`). No
schema or seed change was needed or made (packet: Flag-and-Halt if one seemed needed — it did not).

## 5. Events
**Zero.** `[DC-1]` holds — M1 emits no Doc-2 §8 event; no outbox leg authored (Doc-4C §C7 "Events:
none (§8)" on every contract). Nothing added to the 26-name catalog.

## 6. Tests
Doc-8 bands **8C + 8E** — `tests/integration/role-wire-slice.test.ts` (10 tests), all vs REAL
PostgreSQL (`docker compose up -d db`) through the composition surfaces only (never module internals).
- **8C:** §5.6/§6.1 envelope · 201+Location on create · §8.6 list on both reads · per-contract error
  class+status (frozen §C7 registers) · §B.6 REQUIRED-key + the create claim leg + replay identity
  (same `reference_id`, one row, one audit) · actor-scope (`list_permissions` dual-actor/authenticated,
  no active-org; `list_roles` User/active-org; Manager-allowed proving slug-not-identity; Officer 403)
  · non-disclosure (byte-identical 404 collapse; never a foreign tenant's role).
- **8E:** the Invariant #2 / DC-CR7 firewall DISCRIMINATING-tested — staff / ownership-class / unknown
  slug each rejected 422 `identity_permission_slug_unknown` (byte-identical) with **zero staff→custom
  role_permissions written** (DB backstop asserted) · system-bundle immutability (update/set-perms/
  delete on Owner → 422 `identity_role_system_protected`, NOT a 404; bundle untouched) · reserved-name
  409 · in-use 422 then reassign→soft-delete · ADR-012 soft-delete (row retained, `deleted_at` set —
  never hard-deleted) · optimistic-CAS losing write (stale token → 400; two contenders on one token →
  exactly one 200; ETag current-token carriage).
- **Baseline delta:** full suite **347 / 29** vs dispatch baseline **337 / 28** — **+10 tests / +1 file,
  zero regressions** (integration 25→26 files; unit unchanged 3).
- **Discrimination highlights (each FAILS under a wrong implementation):**
  - Staff slug on a role → if the write-side firewall were absent, the seed's `space='tenant'` filter
    at resolution would still hide it, but the test asserts **422 at the WRITE** + zero staff rows in
    `role_permissions` — a permissive write fails both.
  - Ownership-class slug (`can_transfer_ownership`, a REAL tenant slug) accepted → the Owner-only
    invariant breaks; the test pins it to 422, discriminating from a naive "∈ tenant catalog" pass.
  - System bundle mutated / returned 404 → the test pins `identity_role_system_protected` (422), so
    both a 404-collapse and a silent RLS 0-row failure are caught.
  - Hard delete → the test reloads the row and asserts it EXISTS with `deleted_at` set; a `DELETE`
    would return null and fail.
  - Losing write carrying a token on a plain stale-view → the test asserts no ETag on the stale-view
    leg (call-13 discipline).

## 7. Self-review
- Self-check gates run: `/ivendorz-security` lens (org-context server-validated · app-layer authz
  primary · no cross-module table access · non-disclosure collapse) — PASS; `/review-a-lens`
  (projection/coined-token/firewall/scope/contract-grounding) — PASS (self-assessed).
- **Red-Flag scan (CLAUDE.md checklist): CLEAR** — no new module/ownership/signal change; no
  cross-module DB access or FK; imports only another module's `contracts/`; no read-model as source of
  truth; Admin not involved; no ADR override; no FROZEN doc modified.
- **Standing-charter Never-list: no violation** — consumes the IDN-2 catalog (never re-seeds/coins a
  slug); binds frozen §C7 codes + the ENUMERATED §9 audit action by pointer; zero events; interleave-
  real/deterministic concurrency probe (no sleep-offset).
- tsc / lint / prettier: **green** (`tsc --noEmit` clean · `eslint .` exit 0 · `prettier --check` on
  all touched files clean · husky lint-staged passed at commit).
- **Self-severity of residuals** (CLAUDE.md §13 by pointer; Raise ≠ Accept): BLOCKER 0 · MAJOR 0 ·
  MINOR 0 · NIT 0 · OBS 2 — (OBS-1) delete_role→invite_member TOCTOU on role binding is not cross-
  command-locked (see JC-11); (OBS-2) `ESC-WIRE-FIELD-CASING` carried, house shape used (see §8).

## 8. Open questions / ESC
- **`ESC-WIRE-FIELD-CASING`** (🟥 owner-pending) — CARRIED, not resolved. All §C7 result payloads use
  the ratified house shape (camelCase result keys serialized as-is via `successResponse`, the 6.1–6.3
  precedent); no field-casing decision made here. Logged per packet §1 binding carry.
- **`ESC-IDN-LIST-PAGESIZE`** (proposed; the list_delegation_grants precedent) — CITED, not new. No
  `identity.list_page_size_max` POLICY key is registered (Doc-3 v1.9 §Notes); `list_permissions` /
  `list_roles` therefore fail-close a supplied `page_size`/`cursor`/`sort` (400) and return the full
  scoped set with `has_more:false`. Resolve when the key registers (IDN-7 / Doc-4A §18.2).
- **`[ESC-IDN-SLUG]`** — CITED, not new. Role management authz binds the interim `can_manage_users`
  (Doc-4C §C7 PassB:448/:474 — "no dedicated `can_manage_roles` in §7"). Consumed the existing §C6
  `MANAGE_USERS_SLUG` constant; no slug coined.
- No new ESC minted. No audit action / slug / state / POLICY key / event invented.

**Judgment-call log** (every call FOR Review-A adjudication; never self-ratified — §13 Raise ≠ Accept):

1. **Staff-space + ownership-class + unknown slug ALL map to REFERENCE `identity_permission_slug_
   unknown` (byte-identical), for create_role AND set_role_permissions.** Frozen re-read: §C7 registers
   (PassB:479 create / :504 set-perms) author `identity_permission_slug_unknown` (REFERENCE) as the
   ONLY per-slug rejection code and NO dedicated staff/ownership-class code; PassB:447 "roles are
   tenant-owned bundles"; Doc-2 §7 line 645 "Platform-staff slugs (separate space)"; line 635
   ownership-class = Owner-only. The assignable catalog for a tenant custom role is the tenant-space,
   non-ownership-class slugs; staff (separate namespace) and ownership-class (Owner-only reservation)
   are not assignable → the same frozen REFERENCE code, byte-identical (the RV-0147 widening-reject
   idiom + non-disclosure — a staff slug is indistinguishable from a typo). The policy keeps the three
   reasons DISCRIMINATED so the tests prove each guard independently. Why NOT Flag-and-Halt: the two
   packet-named halt-ambiguities (the ownership-class SLUG SET · the dual-actor read SCOPE) are BOTH
   resolved by frozen text; the error-CODE mapping is an implementation detail within the frozen §C7
   register — the delegation command's precedent (mapping its reasons to §C9 codes, DC-CR7) governs.
   Alternative considered + rejected: `identity_role_system_protected` (BUSINESS) for ownership-class
   in set_role_permissions — rejected as inconsistent with create_role (whose register lacks that
   code) and because `system_protected` reads as "the TARGET is a system bundle", not "the SLUG is
   reserved". Recorded for A adjudication.
2. **System-bundle TARGET → BUSINESS `identity_role_system_protected` (422), NOT a 404.** Frozen:
   PassB:492/:504/:517 authorize the system-protection leg; Doc-6C §3.4 `roles_read` makes system
   bundles globally readable (so they are IN scope — a 404 would misrepresent a visible row); §5.2/
   SD-001 "system-bundle slugs immutable". The SCOPE load (`findManageableRole`) returns the visible
   set (own custom ∪ system bundles); a foreign tenant's custom role is NOT in it → the byte-identical
   404 collapse (§7.5). RLS `roles_write` (NULL-org = staff/System only) is the defense-in-depth
   backstop behind this app-layer guard.
3. **`updated_at` = the frozen REQUIRED request-BODY field (NOT `If-Match`); stale arrival → VALIDATION
   400; losing CAS → VALIDATION 400 + `ETag`.** Frozen re-read: update_role/set_role_permissions/
   delete_role (PassB:489/:501/:514) declare `updated_at : required` but — UNLIKE `update_user_profile`
   (PassB:182 "Concurrency: optimistic on updated_at") and `update_organization_profile` (PassB:262
   "optimistic on updated_at") — author NO "Concurrency: optimistic" phrase and NO concurrency-CONFLICT
   code in their registers. The RV-0153 call-1 discipline → the §C6 membership posture (body field, not
   If-Match). Roles have NO STATE code (no §5 machine), so the losing write collapses to VALIDATION
   (not STATE as in §C6), carrying the current token via ETag only on the genuine losing-CAS leg
   (call-13). Why NOT F&H: per-contract declaration is the frozen authority; §B.2's general "optimistic
   concurrency on updates" is the token concept, not the If-Match-CONFLICT wire model.
4. **`delete_role` "no active member still bound" = any LIVE, non-`removed` membership.** Frozen
   PassB:516 "no active member still bound to the role" + AI-note "block deletion while members are
   bound (reassign first)". A `removed` membership is departed/terminal → never "bound"; a live
   invited/pending/active/suspended membership blocks (`identity_role_in_use`, BUSINESS 422).
5. **Reserved system-bundle names blocked case-INSENSITIVELY (Owner/Director/Manager/Officer).** Frozen
   create BUSINESS "not a reserved system-bundle name" (PassB:478) + Doc-6C §5.2 seed names. The DB
   `roles_org_name_live_uq` index does NOT catch it (scoped `organization_id IS NOT NULL`, so a per-org
   "Owner" does not collide with the NULL-org seed) — the service guard is load-bearing. Case-
   insensitive because a lower/upper variant would still shadow the seed for a reader (display-label
   safety).
6. **`list_permissions` runs on the shared client — authenticated scope, NO active-org, NO
   provisioning side effect.** Frozen PassB:452 "Membership n/a; Slug none (reference data); Scope
   authenticated" + Doc-6C §3.5 read-open RLS. `list_roles` runs inside `withActiveOrg` (User/active-
   org). The contrast IS the dual-actor property (a user with no org still gets the catalog; the same
   user gets an empty role list) — asserted in the tests.
7. **Pagination fail-closed (ESC-IDN-LIST-PAGESIZE) on both reads.** No `identity.list_page_size_max`
   key (Doc-3 v1.9 §Notes); Doc-5A §8.5 forbids a literal → reject supplied `page_size`/`cursor`/`sort`
   (400), return the full scoped set with `has_more:false`. The ratified list_delegation_grants
   interim, mirrored (no new escalation).
8. **Realization-convention bounds** `ROLE_NAME_MAX_LENGTH=120`, `ROLE_PERMISSION_SLUGS_MAX=100`,
   `ROLE_DELETE_REASON_MAX_LENGTH=500`, slug shape `/^[a-z][a-z0-9_]*$/`. Frozen §C7 declares the
   fields "bounded" with no numeric bound (the ADMIN_REASON precedent — an unbounded write is a hazard).
   Face-exported for composition/test symmetry.
9. **Audit `entity_type = "role"` for all four writes (including set_role_permissions).** Frozen
   set_role_permissions Mutation-Scope is `identity.role_permissions` (PassB:507), but the audited
   entity is the ROLE aggregate the composition belongs to (the membership/org aggregate-entity
   precedent); the add/removed/effective slug sets ride the payload. `RoleAuditAction` binds by pointer
   to the ENUMERATED Doc-2 §9 Organization "role/permission change" action (NOT `[ESC-IDN-AUDIT]` — the
   action IS enumerated, line 686) — four distinct tokens (create/update/permissions_changed/deleted)
   so the ledger records what happened, nothing coined.
10. **create_role gets the §14.3 CREATE claim leg (RV-0153 F2); update/set-perms/delete get replay-
    lookup only (no claim).** A create has no CAS → the claim is the single-execution guard (the
    invite_member precedent); the three mutators have the `updated_at` CAS as their double-execution
    guard (the 6.3 CAS-covered posture). All four share the generic `identity.command_dedup_window`
    (PassB:481/:493/:506/:518).
11. **`role_permissions` removal = a HARD row delete (SD=NO), captured by the audit; `delete_role`
    leaves the composition rows intact on soft-delete.** Frozen Doc-6C §3.6 (`role_permissions` SD=NO;
    "row removal = revoke, audited") + PassB:503/:509 "removing a slug is an audited revocation". The
    soft-deleted role's links persist harmlessly (no live membership resolves through a soft-deleted
    role, deletion having been blocked while members were bound). OBS-1: a delete_role→concurrent
    invite_member TOCTOU on role binding is not cross-command-locked; the frozen text mandates no such
    lock and roles carry no Last-Owner-style cross-row invariant — noted, not built.

## 9. Checkpoint
- **`e4894a6`** · `feat(identity): W2-IDN-6.4 wire §C7 role/permission surface (6 contracts)
  [checkpoint]` — bounds the entire W2-IDN-6.4 deliverable: the 17 implementation + test files (3246
  insertions, 0 deletions). ONLY W2-IDN-6.4 files staged; the pre-existing external/coordinator working-
  tree changes (authority map, trust-ladder, page_inventory, fe-wbs, backend tracker, board files,
  Doc-2 patch, 6.3 packet) were NOT touched or staged. `Co-Authored-By: Claude Fable 5`.

## 10. Packet gaps
Read beyond the packet's §2 pointer rows (all necessary to derive the frozen anchors verbatim, per the
"RE-READ VERBATIM" directive): Doc-2 §7 (slug catalog + ownership-class row + staff separate space),
Doc-2 §9 (the ENUMERATED "role/permission change" action — resolves the audit binding WITHOUT
`[ESC-IDN-AUDIT]`), Doc-5C §2.3/§2.5 (the "17 dual-actor read" derivation), Doc-6C §3.4–§3.6/§5 (roles/
permissions/role_permissions DDL + RLS + the 43-slug/4-bundle seed count vs the base-text "45/38"),
Doc-5A §9.5 (concurrency carriage). In-repo precedents consumed: `delegation-grant.policy`
(`OWNERSHIP_CLASS_SLUGS`), `membership-lifecycle.command`/`.repository` (the CAS + guarded house shape),
`identity-permission-catalog-seed.test` (the 43-slug fixture list). Packet was otherwise sufficient;
one paraphrase corrected under verbatim re-read (see §12 carry): "two dual-actor reads" — only
`list_permissions` is dual-actor.

## 11. Readiness
- **Next gate:** **Review-A** at `e4894a6` · **Team-6 = YES** (security surface: privilege-escalation —
  permission-set widening / staff-slug forgery onto org roles / ownership-class composition / system-
  bundle tampering; all guarded service-layer + discriminating-tested, but the surface is exactly
  Team-6's charter and was pre-flagged at dispatch).
- **Blocked on:** nothing.
- **Suggested next work item** (coordinator decides): W2-IDN-6.6 (context/buyer-profile/workflow-
  settings surface) or W2-IDN-7 (POLICY seed — would clear ESC-IDN-LIST-PAGESIZE + the dedup windows).

## 12. Carries emitted (outbound)
| Target | Obligation | Class |
|---|---|---|
| Review-A (this WP) | Adjudicate JC-1 (the slug-rejection code mapping — staff/ownership-class/unknown → `identity_permission_slug_unknown`) against §C7 registers; ratify or redirect | binding packet carry |
| Review-A (this WP) | Adjudicate JC-3 (`updated_at` body-field + VALIDATION losing-write, roles having no STATE code) | binding packet carry |
| W2-IDN-7 packet | `ESC-IDN-LIST-PAGESIZE` (no `identity.list_page_size_max`) + the `identity.command_dedup_window` seed both block the reads' pagination / the writes' real replay window; test-scoped-seeded here | fold-in |
| `ESC-WIRE-FIELD-CASING` channel (Board) | §C7 result payloads built in the house shape; re-case if the owner rules camelCase→snake_case at the wire | checkpoint-targeted carry |
| Team-8 (template/packet hygiene) | Packet paraphrase "two dual-actor reads" dissolved under verbatim re-read — only `list_permissions` (row 17) is dual-actor; `list_roles` is User-only | future-watch |

*Board-ratified permanent section (owner/Board approval of WP-GOV-B, 2026-07-09) — verbatim; the
assignee confirms it held for the whole activation.*

## Frozen Authority Checklist

Before execution, the assignee confirms:

☑ All cited documents are frozen. (Doc-2 v1.0.3 · Doc-4A v1.0 · Doc-4C PassB · Doc-5A/5C FROZEN ·
   Doc-6C FROZEN — all under `generatedDocs/`; the `identity_catalog_seed` migration.)
☑ Every cited section has been re-read verbatim. (Doc-4C §B/§C7 · Doc-2 §7/§9/§10.2 · Doc-5C §2.3/
   §2.5/§5 · Doc-6C §3.4–§3.6/§5 · Doc-5A §6.2/§9.5 — line-anchored above.)
☑ No draft document is treated as authority. (Only FROZEN corpus + ratified in-repo precedents.)
☑ Any uncertainty results in Flag-and-Halt. (Zero corpus conflicts / migration / event needs arose;
   the two packet-named halt-ambiguities were both resolved by frozen text — see the derivations below;
   the error-code mappings are logged judgment calls FOR Review-A, not silent local resolutions.)

---

### Appendix — the two packet-mandated derivations (verbatim citations)

**A. Ownership-class slug set (Doc-2 §7 verbatim):**
Doc-2 §7 line 635: *"Ownership transfer / org delete / verification submission | Owner-only:
`can_transfer_ownership`, `can_delete_organization`, `can_submit_verification`"*. Doc-2 §10.2
`delegation_grants` row (line 725): *"never grants ownership-class actions"* (+ Doc-2 §5.10 guard).
⇒ **ownership-class = { `can_transfer_ownership`, `can_delete_organization`, `can_submit_verification` }**
— CONSUMED verbatim from the ratified `OWNERSHIP_CLASS_SLUGS` (`delegation-grant.policy.ts`, DC-CR7),
never re-coined. NOTE: ownership-class (3) ⊊ Owner-only (4) — the 4th Owner-only slug `can_manage_
billing` (Doc-2 §7 line 634) is Owner-only but NOT ownership-class (the seed test confirms Director =
32 = 36 − 4 Owner-only; the DC-CR7 set deliberately excludes `can_manage_billing`).

**B. Dual-actor read scope ("17 dual-actor read"):**
Doc-5C §2.3 inventory **row 17** = `identity.list_permissions.v1`, actor **"User / int-svc"**, org-
scope column **"N (platform catalog)"**. Doc-5C §2.5 note (verbatim): *"Row 17 (`list_permissions`) is
genuinely dual-actor on the wire (Doc-4C §C7 — User / internal-service, no split leg) and stays `User /
int-svc`."* Doc-4C §C7 PassB:450 *"Actor: User / internal-service"*; PassB:452 *"Membership n/a; Slug
none (reference data); Scope authenticated"*. ⇒ **`list_permissions` = THE genuinely-dual-actor wire
read** (User OR internal-service, no split leg), authenticated scope (no active-org, no slug), platform
catalog. By contrast **`list_roles` (row 18)** — Doc-4C §C7 PassB:461 *"Actor: User"*; PassB:463
*"Membership active; Slug none (read); Scope active-org"*; PassB:468 Visibility *"caller's org roles +
platform seeds only"*; Doc-5C §2.3 row 18 org-scope "Y" — is **SINGLE-actor (User), active-org
scoped**. The packet paraphrase "two dual-actor reads" therefore DISSOLVES under verbatim re-read:
exactly one read (`list_permissions`) is dual-actor.

---

## RV-0157 fix-forward amendment (additive — §§1–12 above untouched)

- **Amends:** the original W2-IDN-6.4 checkpoint `e4894a6` per Review-A **RV-0157 F1 (MAJOR, accepted
  → gates either way; fix-forward)**. Verdict was 🟠 — 0 BLOCKER · 1 MAJOR · 0 MINOR · 0 NIT · 4 OBS;
  both load-bearing derivations independently re-derived + CONFIRMED verbatim; all 11 judgment calls
  CONCUR. Only F1 gated.
- **Fix-forward SHA:** `b42e722` · branch `wave/2-core-platform`.

**F1 — `list_permissions` emitted the wrong frozen `error_code`.** Frozen §C7 **PassB:456** (re-read
verbatim) authors *"`identity_permission_invalid_input` (VALIDATION, no)"* for `list_permissions`'
VALIDATION legs — but `handleListPermissions` routed its bad-`space`-enum + fail-closed-pagination
rejections through `roleInvalidInput` (= `identity_role_invalid_input`, the SIBLING contract's token);
the correct token appeared NOWHERE in the tree (grep 0). CLASS (VALIDATION) + status (400) were already
correct — only the frozen token string was a sibling's (a reference-never-restate / frozen-register
deviation, §11). The four writes + `list_roles` correctly use `identity_role_invalid_input`
(PassB:467/:479/:492/:504/:517) and were NOT touched.

**Remedy (zero behavior change beyond the corrected token + new assertions; no payload re-casing —
`ESC-WIRE-FIELD-CASING` stays owner-gated):**
1. `src/modules/identity/api/role.handler.ts` — bound a `permissionInvalidInput` helper on
   `identity_permission_invalid_input` (mirrors `roleInvalidInput`), + the `PERMISSION_INVALID_INPUT_
   CODE` constant.
2. `src/server/identity/role.route-handler.ts` — `handleListPermissions`' TWO error legs now emit
   `permissionInvalidInput`; `paginationReject` was parameterized with the per-read invalid-input
   helper so `list_roles` KEEPS `roleInvalidInput` (unchanged) and `list_permissions` gets the
   permission token (both legs).
3. `src/modules/identity/contracts/services.ts` — re-export `permissionInvalidInput` (contracts-only
   consumption by the composition edge).
4. `tests/integration/role-wire-slice.test.ts` — the `list_permissions` slice now asserts
   `error_code === "identity_permission_invalid_input"` (+ class VALIDATION) on BOTH the fail-closed-
   pagination and the bad-`space`-enum legs (previously status-400 only) — pins the register
   conformance going forward. In-place assertions; no new `it` block → test count unchanged (347).
5. `src/modules/identity/contracts/types.ts` — the `ListPermissionsInput` §C7 code-enumeration comment
   now names `identity_permission_invalid_input` (PassB:456) as the read's own VALIDATION token,
   distinct from the writes'/`list_roles`' `identity_role_invalid_input` (the omission that let the
   deviation go un-logged is closed).

**New judgment call (JC-12, remedying the un-logged F1 deviation) — FOR the delta Review-A.**
`list_permissions`' VALIDATION legs bind the frozen **`identity_permission_invalid_input`** (PassB:456,
re-read verbatim), NOT the `identity_role_invalid_input` the writes/`list_roles` use. The two read
contracts author DISTINCT VALIDATION tokens; `paginationReject` is now per-read-parameterized so each
emits its own register token. Frozen authority: PassB:456 (list_permissions) vs PassB:467
(list_roles). Why NOT Flag-and-Halt: a frozen-register conformance correction inside one module, no
corpus conflict — pure realization fidelity.

**Verification (fix-forward):** tsc `--noEmit` clean · `eslint .` exit 0 · Prettier clean · full suite
**347 / 29 ALL PASS** (unchanged count — assertions added in place; zero regressions vs the RV-0157
build 347/29). Red-Flag scan CLEAR; only W2-IDN-6.4 files touched; no payload re-casing; no new
event/slug/audit action/POLICY key/migration.

**RV-0157 OBS (reviewer future-watch — no action required, logged for the record):** OBS-A
losing-CAS-with-ETag only conditionally asserted (single-connection harness catches the loser pre-CAS;
sound by construction) · OBS-B `can_manage_billing` correctly NOT blocked from custom-role composition
(only the 3 line-635 slugs hard-reserved — matches JC-1/derivation A) · OBS-C delete_role↔invite_member
TOCTOU benign/fail-closed (a membership bound to a soft-deleted role resolves to zero perms) · OBS-D
ETag rides a 400 not 409 (follows necessarily from §C7 lacking a concurrency class — correct per
register, matches JC-3).

**Next gate (unchanged):** delta Review-A at `b42e722` → Review-B ∥ Team-6 (Team-6 = YES —
privilege-escalation surface).

---

## RV-0157 Review-B fold amendment (additive — §§1–12 + the fix-forward amendment above untouched; TEST-ONLY)

- **Amends:** the checkpoint `b42e722` per **RV-0157 Review-B 🟠** (Team-5, at `b42e722` — 0 BLOCKER ·
  0 MAJOR · **1 MINOR** · 0 NIT · 3 OBS; all 5 governance-pin sabotages RED-in-place, house-shape +
  comment-truthfulness confirmed) **and Team-6 ✅ PASS** (at `b42e722` — 0/0/0/0/5 OBS; Invariant #2
  firewall verified live at EVERY layer incl. the resolution-side 2nd layer + DB backstop). **ZERO
  production-code change** — the code was verified-correct by both reviews; this fold is test-thoroughness
  only.
- **Fold SHA:** `c80c309` · branch `wave/2-core-platform`.

**MINOR-B1 — pin `list_roles`' own frozen register token.** The F1 fix (JC-12) pinned
`list_permissions`' `identity_permission_invalid_input` but left its TWIN read `list_roles` undetectable
to the same bug class: its sole frozen VALIDATION token `identity_role_invalid_input` (PassB:467) was
never asserted (every `handleListRoles` test used valid/empty input). Code was already correct
(`handleListRoles` passes `roleInvalidInput` to `paginationReject`; the bad-enum leg uses
`roleInvalidInput`). **Remedy (test-only):** the `list_roles` slice now asserts `error_code ===
"identity_role_invalid_input"` (+ class VALIDATION) on the bad-`include_system`-enum leg AND the
fail-closed-pagination leg. **Non-vacuous proof (empirical mutation test, reverted):** temporarily
flipping `handleListRoles`' bad-enum leg to `permissionInvalidInput` RED the assertion with
*"expected 'identity_permission_invalid_input' to be 'identity_role_invalid_input'"* — exactly the F1
bug class — then `git checkout --` restored the production file byte-clean (confirmed empty status).
JC-12 ("each read emits its own register token") is now true-and-pinned for BOTH reads.

**Test-hardening folds (accepted, test-only):**
- **OBS-B2 (system-bundle immutability).** The 8E test passed `now = new Date()` as `updated_at`; since
  `systemBundleGuard` runs BEFORE the stale-view check, a fresh token still hits the guard — but the
  "bundle untouched" backstop did not fire independently (a sabotaged guard would red via a stale-view
  400, not "mutation succeeded"). **Remedy:** read the Owner bundle's REAL current `updated_at` (+ its
  composition) first and pass it, so all three legs reach `systemBundleGuard` on their merits (422
  `identity_role_system_protected`), and the backstop now asserts the bundle row's `updated_at` token
  AND its composition are UNCHANGED — an independent proof the mutation was blocked, not applied.
- **T6-OBS-5 (firewall set shapes).** The firewall tests used single-slug arrays. Added: a MIXED set
  (`[VALID_TENANT_SLUG, STAFF_SLUG]`) → the WHOLE set rejected 422 `identity_permission_slug_unknown`
  (never partially applied; DB backstop `count(space=staff)=0`, no role row) — the per-slug loop rejects
  on the first non-assignable and returns before the write; and a DUPLICATE-slug set
  (`[VALID_TENANT_SLUG, VALID_TENANT_SLUG]`) → the realized `createMany skipDuplicates` behavior = 201
  with the slug present exactly once (asserted via `effectiveSlugs`).
- **OBS-B3 (comment truthfulness).** The test FILE-HEADER 8E line conflated a stale-arrival-view (400,
  NO `ETag`) with a genuine losing-CAS (400, CARRIES `ETag`). Corrected to keep the two legs distinct
  (the in-body comments were already precise); the genuine-losing-CAS→ETag carriage stays a logged
  future-watch (RV-0157 OBS-A — needs a 2-connection harness; out of scope).

**New judgment call (JC-13) — FOR the delta review.** DUPLICATE-slug composition is realized as ONE
effective row via `createMany`/`composeRolePermissions` `skipDuplicates` on the `(role_id,
permission_id)` PK (Doc-6C §3.6) — not a duplicate-key error and not a SYNTAX reject. Frozen §C7
authors no de-dup rule for `permission_slugs`/`add_slugs`; the DB PK is the authority, so a repeated
slug is idempotent within the set (the realized outcome the test now pins). No frozen conflict.

**Verification (fold):** tsc `--noEmit` clean · `eslint .`/slice eslint exit 0 · Prettier clean · full
suite **347 / 29 ALL PASS** (unchanged count — assertions added IN PLACE, no new `it` block; the one
transient outbox-dispatch-hardening failure on a first full run was the known pre-existing CAS flake —
9/9 in isolation + green on immediate re-run — NOT a regression from this fold). Red-Flag CLEAR; ONLY
the W2-IDN-6.4 test file touched; zero production-code change; no payload re-casing; no new
event/slug/audit-action/POLICY-key/migration. `list_permissions` NOT touched (F1 already correct).

**Next gate:** delta Review-B ∥ Team-6 already PASSED at `b42e722` — this fold lands the accepted
MINOR-B1 + OBS folds at `c80c309` for the coordinator's final close (B/M/M = 0 after this).
