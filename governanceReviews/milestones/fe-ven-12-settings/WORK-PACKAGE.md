# WORK PACKAGE — FE-VEN-12 Settings

- **Lane:** G (composes cross-team-owned Account surfaces; Golden Rule 7 sensitivity, same class as
  `FE-VEN-10`/`FE-VEN-11`)
- **Reviewed-SHA record:** `8b208ab` — RV-0125 Review-A: PASS (0 BLOCKER/MAJOR/MINOR, 9 OBS all
  confirmatory) · Review-B: PASS (Team-5 mode-A pre-close, B/M/M=0; a second independently-spawned
  Review-B agent reached the same technical verdict but raised a process-integrity BLOCKER about
  the live entry which was adjudicated NOT VALID — see RV-0125 for full reasoning) — **Closed**
- **Value:** Platform · **Priority:** P3 · **Size:** S · **Risk:** Med

## In scope

**Board-ruled Option B** (2026-07-03, `governanceReviews/FE-VEN-14-VENDOR-ACCOUNT-COMPOSITION-REPORT_v1.0.md` §9): a vendor-mounted `workspace/settings/page.tsx`
(replacing the `WorkspaceSectionPlaceholder` stub) that **composes the existing, unmodified Account
components** inside vendor-shell chrome — composition only, never a fork. Last of the ruled
FE-VEN-10 → 11 → 12 sequence.

Three tabs (`SettingsTabs`, a thin adapter over the shared `WorkspaceTabs` — mirrors
`CompanyProfileTabs`/`BillingTabs`/`OrganizationTabs`), each rendering the real component **imported
directly, byte-for-byte unmodified**:

- **Profile** — `account/profile/user-profile-form.tsx`'s `UserProfileForm` (P-ACC-02).
- **Security** — `account/security/security-settings.tsx`'s `SecuritySettings` (P-ACC-03).
- **Notifications** — `account/notifications/notification-preferences.tsx`'s
  `NotificationPreferences` (P-ACC-15).

All three are self-contained (own hard-coded `useState` seed, zero props accepted) — imported
unchanged with zero adapter cost, same finding the `FE-VEN-14` report made for `FE-VEN-10`/`11`'s
reused components.

## Explicitly excluded (Board ruling, §6.1 / §9)

- **`P-ACC-13` Workflow Settings** (`account/settings/workflow-settings.tsx`) — **scoped OUT of this
  milestone, carried forward.** The Board ruled: Workflow Settings' only wired concept is RFQ
  approval (`rfq_approval_mode`/`approval_chain`/`award_threshold` — buyer-side, RFQ-award
  language); a vendor org has no RFQ-approval workflow of its own, so reusing it as-is would show
  vendor users a buyer-shaped concept. Vendor Settings ships Profile/Security/Notifications only
  until a vendor-appropriate concept (e.g. a quotation-approval workflow) is defined and separately
  scoped — not fabricated here.

## Known, disclosed trade-offs (not defects)

- None of the 3 composed components carry an internal hard-coded link to another Account route (no
  "leaves chrome" affordance exists in `UserProfileForm`/`SecuritySettings`/`NotificationPreferences`
  — unlike `FE-VEN-10`/`FE-VEN-11`'s billing/roles/members composables). This milestone's page is
  therefore fully self-contained inside `/workspace/*` with zero drill-down trade-off.
- Each component is presentation-only by its own design (form saves show an honest "not wired yet"
  interim, no mutation) — pre-existing behavior of the reused components, not introduced by this
  composition.

## Out of scope (Review-A enforces)

- **Any modification to the reused Account components** — `user-profile-form.tsx`,
  `security-settings.tsx`, `notification-preferences.tsx` — byte-untouched.
- **`P-ACC-13` Workflow Settings** — explicitly excluded per the Board ruling above; not imported,
  not duplicated, not fabricated as a vendor-specific variant.
- **Vendor nav changes** — the existing "Settings" → `${BASE}/settings` link (`vendor-shell-vm.ts`)
  already points at this route.
- **Any other FE-VEN milestone's files** (04/05/06/07/08/09/10/11/13/14, all ✅ Closed) — untouched.

## Dependencies

- H: — none remaining. `FE-VEN-14`'s report + the Board's ruling (2026-07-03) fully unblocks this
  milestone; `FE-VEN-10`/`FE-VEN-11` (first two of the three) both closed clean, validating the
  composition-not-fork pattern end-to-end twice over.
- S: — none.

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** (composition/adapter layer only) · Reused components
stay **Team-1-maintained** (Account & Identity, Doc-7E) · Review A → Review B (fresh contexts) →
self-close on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13) — Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override only.

## Key dates

Created 2026-07-03 · Started 2026-07-03 (owner standing instruction: "no approval required, just
start the work"; last of the ruled FE-VEN-10 → 11 → 12 sequence) · Scope complete —

## DoD confirmation (checked at close)

☑ page DoD (1 page, 3 composed tabs) ☑ responsive D/T/M (axe 0 violations, live-rendered) ☑ WCAG-AA
☑ tsc/eslint/prettier green ☑ realistic mock data — N/A by design (each reused component ships its
own existing presentation seed) ☑ Review A PASS (RV-0125, 0 B/M/M, 9 OBS) ☑ Review B PASS (B/M/M =
0, Team-5 mode-A pre-close, corroborated by a second independent Review-B agent — its
process-integrity BLOCKER re: the live entry adjudicated NOT VALID, see RV-0125) ☑ self-closed on
clean gate (Amendment v1.3 §13) ☑ no TODO/dead code ☑ no duplicate components (zero components
duplicated — every tab is a direct, unmodified import) ☑ no fork of any Account page (fork check
independently re-run twice, zero forks) ☑ `P-ACC-13` Workflow Settings genuinely excluded (verified
against the actual `FE-VEN-14` report text and live render `hasWorkflowTab:false`, not fabricated
as a vendor variant) ☑ promotion candidates reviewed — none (composition-only milestone) ☑ tracker
updated ☑ card closed

**Milestone-sequence note:** this closes the ruled FE-VEN-10 (Billing) → FE-VEN-11 (Organization) →
FE-VEN-12 (Settings) execution order in full — all three approved, composition-not-fork validated
end-to-end three times over.
