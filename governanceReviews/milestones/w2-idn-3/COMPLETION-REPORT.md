# COMPLETION REPORT — Agent M1 · W2-IDN-3

*Returned by Agent M1 (Opus per E3), validated by the Orchestrator 2026-07-09. NOTE (RV-0148
Finding 5): this file was absent at Review-A time due to a coordinator shell defect (a failed
command guard silently skipped the write); persisted now, content verbatim from the agent's
return. Format: `governanceReviews/AI-Completion-Report-Template.md`.*

## 0. Header
- **Role / Work item:** Agent M1 · `W2-IDN-3` (`check_permission` + active-org resolution, out-of-wire) · packet: `governanceReviews/milestones/w2-idn-3/ACTIVATION-PACKET.md`
- **Outcome:** COMPLETE
- **Checkpoint SHA:** `f301d4bb57355b6aff4f163be6c3cdead52d764a` · branch: `wave/2-core-platform`

## 1. Summary
Doc-4C §C3 authorization root realized as app-layer, out-of-wire M1 services: three-layer membership resolution (Doc-4A §6.1) OR the Doc-4A §6B.2 five-condition delegated-access check — pure `domain/policies` decision function + org-anchored `infrastructure/data` repository + four `application/queries` + four `contracts/` facades (`get_user`/`get_organization`/`get_membership`/`check_permission`). `src/server/authz` seam wired to `identity.check_permission`, zero shadow authz in the WP surface. Both Team-6 binding obligations (RV-0146 org-anchored resolution; RV-0147 staff-space firewall) + the 8D RLS backstop proven by discriminating tests. Full suite 212/22 green.

## 2. Files changed
Added: `src/modules/identity/domain/policies/permission-resolution.policy.ts` · `src/modules/identity/infrastructure/data/authz.repository.ts` · `src/modules/identity/application/queries/{get-user,get-organization,get-membership,check-permission}.query.ts` · `tests/integration/identity-check-permission.test.ts` · `tests/integration/authz-rls-backstop.test.ts`
Modified: `src/modules/identity/contracts/{types,services}.ts` · `src/server/authz/index.ts`

## 3. Contracts changed
Additive only: four §C3 out-of-wire facades + DTOs, internal-service `denyReason` (wire collapses per Doc-5C §7.5), `VendorProfileStateReader` port (§6B.2 condition 5, injected — never an M2 import). No HTTP wire.

## 4. Migrations
None ("No pending migrations"). `check_permission` app-layer, not a DB function (CHK-6-023).

## 5. Events
Zero — frozen truth: M1 emits no §8 events; §C3 services are unaudited reads.

## 6. Tests
8E + 8D. `identity-check-permission.test.ts` (24): membership path, NULL system-bundle leg, unknown-slug/not-held/no-membership denies, RV-0146 both legs, RV-0147, all five §6B conditions (allow + each failing), delegation staff-firewall, wired seam, §C3 reads, explicit Inv #5 cross-org assertion. `authz-rls-backstop.test.ts` (5): restricted-role NOBYPASSRLS proof the forged cross-org row is invisible under tenant context. **212/22 PASS (baseline 183/20, +29, zero regressions).** Failure modes: role_id-only resolution flips RV-0146 denies; a space-ungated resolution flips RV-0147; USING(true) flips the 8D 0-rows.

## 7. Self-review
`/ivendorz-security` 8-point: PASS (org-anchored reads-only; RLS backstop proven; uniform decision shape; no cross-schema SQL; M2 injected port; no signal read; no secrets/PII; deletedAt excluded; N/A money). Red-Flag: CLEAR. Never-list: no violation (pure-domain unit test removed rather than bypass the boundaries guardrail). tsc/ESLint/Prettier 0/0/0.

## 8. Open questions / ESC
`ESC-W1-CONTEXT-RESOLVE` channeled-unchanged (Board-deferred stands; `organizationId` is a server-validated input, context not resolved here). `ESC-W1-AUTH-401` N/A (out-of-wire). Judgment calls (post-review status per RV-0148): (a) `get_user` omits `display_name` — no realized column; adjudicated FAITHFUL, divergence now minted as `ESC-IDN-DISPLAYNAME`; (b) `get_organization` omits `verification_level` — **overturned by RV-0148 MAJOR-1** (frozen-REQUIRED, incl. `participation_flags`); (c) `denyReason` internal diagnostic — adjudicated corpus-consistent with a binding W2-IDN-6 wire-collapse verification expectation.

## 9. Checkpoint
`f301d4b` — `feat(identity): W2-IDN-3 check_permission + §C3 auth-root reads (out-of-wire) [checkpoint]` — 11 files, explicit staging.

## 10. Packet gaps
The five delegated-access conditions are authored in **Doc-4A §6B.2** (Doc-4C §C3/§C9 bind them by pointer); the packet cited Doc-4C as their source — Team-8 template note. Also read Doc-4A §6.1 + substrate migrations + both ESC records.

## 11. Readiness
Post-RV-0148: 🟠 fix-forward patch (MAJOR-1 projection fields · MAJOR-2 resourceScope disposition · MINOR-3 `department` · MINOR-4 ESC pointer) → Review-A delta re-verify → then Review-B ∥ Team-6 at the patched SHA (Team-6 = YES).
