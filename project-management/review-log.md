# Review Log — Team-4 QCT

**Owner:** Team-4 (Quality & Conformance). **Reviews only** `🔵 Ready for Review` pages; **never
edits implementation** (Raise ≠ Accept — CLAUDE.md §13). Each review gets a sequential **`RV-####`**.

## Governance (per CLAUDE.md §13)

- **Severity ladder:** `BLOCKER` · `MAJOR` · `MINOR` · `NIT` · `OBS`.
- **Gate to Approve:** `BLOCKER = 0 · MAJOR = 0 · MINOR = 0`. NIT/OBS never block.
- **Raise ≠ Accept:** the reviewer raises findings with a severity; the **author/authority rules**
  on each via the Validate-Findings gate (Valid? Applicable? Best for product? Corpus-consistent?).
- Verdict is exactly `PASS` or `PATCH REQUIRED` (with numbered findings).

## Entry template

```
### RV-0001 · P-<ID> · <Page title> · Team-<n>
- Date: YYYY-MM-DD
- Verdict: PASS | PATCH REQUIRED
- Findings:
  1. [BLOCKER|MAJOR|MINOR|NIT|OBS] <one-line defect> — <file:line if applicable>
- Disposition (author/authority): <accepted/deferred/rejected + why>
- Result: page → ✅ Approved | 🟥 Patch Required
```

---

## Reviews

### RV-0001 · P-AUTH-02 · Signup · Team-1
- Date: 2026-07-01 · Reviewed: `app/(auth)/signup/{page,signup-form}.tsx` (screenshots: `governanceReviews/milestones/team1-auth-02-signup/`)
- Verdict: **PATCH REQUIRED**
- Findings:
  1. [MAJOR] `[ESC-7-API-SIGNUP]` cited (page.tsx:7, signup-form.tsx:5) is **not in `esc_registry.md`** — invented handle (guardrail: cite a real registry handle, never invent). Registry has `ESC-7-API-{CATNAV,PRODDETAIL,ADS}`, `/upload`, … — no signup/provision handle.
  2. [MINOR] Interim notice uses deprecated `text-iv-info-base` on `bg-iv-info-subtle` (signup-form.tsx:62) — 4.65:1 (clears AA on white but fragile + off-convention). Post-P-4 convention is `text-iv-info-muted` (10.34:1).
  3. [NIT] Terms checkbox is a native hand-rolled control (no kit primitive; a11y-correct) — form comment claims "composes the kit"; kit gap cites no ESC handle. (signup-form.tsx:122)
  4. [NIT] Terms/Privacy links → `/` placeholders (P-PUB-21/-22 unbuilt) — honest but dead.
  5. [OBS] Otherwise strong: RSC/client split, `FormField` a11y wiring, autocomplete tokens, honest interim (fabricates no account), responsive.
- Disposition (author/authority = Team-1): register `ESC-7-API-SIGNUP` in `esc_registry.md` OR re-cite the correct existing handle (MAJOR); switch to `text-iv-info-muted` (MINOR).
- Result: page → 🟥 Patch Required. Queue NOT advanced; returned to Team-1.

### RV-0002 · P-BUY-17 · Award · Team-2
- Date: 2026-07-01 · Reviewed: `app/(app)/(buyer)/rfqs/[rfqId]/award/{page,loading}.tsx`, `_components/award/*` (no screenshots captured)
- Verdict: **PATCH REQUIRED**
- Findings:
  1. [MAJOR] Core award UX is **not presentable**. `page.tsx:27` seeds `candidates: []` (only the empty state ever renders); `AwardView` is a Server Component with inert `Continue`/`Confirm` buttons (no client handler/href), so the `T-WIZARD` select→confirm never advances (`?step=confirm` falls through without a `selectedQuotationId`). No screenshots. Fails DoD "Mock data realistic". → seed realistic mock shortlisted candidates (System order, unranked) AND wire client-side select→continue→confirm so the award UX is reviewable (as the sibling pages do).
  2. [MINOR] Candidate radio group has no programmatic group label — no `<fieldset>`/`<legend>` or `role="radiogroup"` + `aria-label` (award-view.tsx:199-212). SR users get per-option labels but not the group purpose.
  3. [OBS] Governance EXEMPLARY: R6/Inv#12 honored — explicit, unranked, 1:1, "no recommended winner", System order never re-ranked; irreversibility + org-threshold + money-boundary (R8) notices; firewall (no trust/score/tier); not-found byte-identical; grounded `rfq.award_rfq.v1` (Doc-4E §E8.4) honestly parked; strong reuse; good loading skeleton.
- Disposition (author/authority = Team-2): seed mock candidates + wire the wizard nav (MAJOR); add the radio group label (MINOR).
- Result: page → 🟥 Patch Required. Queue NOT advanced; returned to Team-2.

### RV-0003 · P-ADM-01 · Admin dashboard · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/{page,layout}.tsx`, `_components/admin/admin-shell-vm.ts`
- Verdict: **PASS**
- Findings:
  1. [MINOR — deferred] Reuses `DashboardSection` + `PipelineLinks` from `_components/vendor/dashboard/` (page.tsx:11) — generic components now consumed by a 2nd surface (admin). Reuse (not duplication) is correct; placement is the issue → extract to a neutral shared dashboard location (2nd-consumer promotion trigger).
  2. [NIT] Sidebar + `PipelineLinks` point to `/admin/*` sub-routes (P-ADM-02…29) not yet built → 404 until they land (expected, dashboard-first).
  3. [OBS] Governance exemplary: no Trust/Performance/Tier, no fabricated counts (honest EmptyStates), R5 honored (routes into queues, owns no effect), firewall respected. Shell correctly wired (`admin/layout.tsx` mounts `AppShell` + `ADMIN_SHELL_VM`); heading order h1→h2 correct (PageHeader + CardTitle); responsive grid.
- Disposition (author/authority): MINOR-1 deferred to a shared-dashboard extraction (cross-surface promotion candidate — NOT a P-ADM-01 code defect; reuse-over-duplication is correct). NIT/OBS non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-02).

### RV-0004 · P-AUTH-02 · Signup · Team-1 (re-review of RV-0001)
- Date: 2026-07-01 · Reviewed: `app/(auth)/signup/signup-form.tsx`, `esc_registry.md`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED] MAJOR (RV-0001#1) — `ESC-7-API-SIGNUP` now registered in `esc_registry.md:30` with a proper entry (out-of-band M1 lazy-provisioning; additive Doc-5C/7E patch). Real handle; no longer invented.
  2. [RESOLVED] MINOR (RV-0001#2) — interim notice now `text-iv-info-muted` (signup-form.tsx:63) → 10.34:1, on-convention.
  3. [OBS] Carried NITs (native checkbox; Terms/Privacy → `/` until P-PUB-21/-22) remain — non-gating. No regression.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-03).

### RV-0005 · P-BUY-17 · Award · Team-2 (re-review of RV-0002)
- Date: 2026-07-01 · Reviewed: `.../award/page.tsx`, `_components/award/award-view.tsx`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED] MAJOR (RV-0002#1) — award UX now presentable: `MOCK_SHORTLIST` (3 vendors) renders; step 0 is a native `<form method="get">` submitting the chosen radio to `?step=confirm&sel=<id>` (server nav, no client state); confirm step reachable. R6 preserved — no default winner (nothing pre-checked).
  2. [RESOLVED] MINOR (RV-0002#2) — radios wrapped in `<fieldset><legend>Choose one vendor to award</legend>` (award-view.tsx:205).
  3. [NIT] Radios not `required` — hitting Continue with nothing selected silently returns to the select step (no hint). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-18).

### RV-0006 · P-ADM-02 · Moderation queue · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/moderation/page.tsx`, `_components/admin/moderation/{moderation-queue-table.tsx,moderation-seed.ts}`
- Verdict: **PASS**
- Findings:
  1. [NIT] No route-level `loading.tsx` skeleton in the moderation route — the sibling award route has one; add before the `J-ADM-01` read is wired (currently synchronous seed, so not observable yet). Non-gating.
  2. [OBS] Promotion watchlist: bespoke `ModerationQueueTable` is the 1st admin worklist table — when a 2nd admin queue lands (P-ADM-07/-10/-12), extract a shared `AdminQueueTable`. Horizontal-scroll on mobile is acceptable (admin desktop-first, PI §13.7).
  3. [OBS] Strong: R5 (queue decides nothing; rows→P-ADM-03), firewall (no Trust/Perf/Tier; status is case-state), no fabricated totals, realistic BD-industrial seed, real `J-ADM-01`; a11y — `<caption>`/`scope="col"`, filter `role="group"`+`aria-current`, sr-only action names; URL-driven filter; kit reuse (PageHeader/StatusChip/PaginationControl/EmptyState).
- Disposition (author/authority): NIT/OBS non-gating; loading skeleton recommended before wiring.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-03).

### RV-0007 · P-AUTH-03 · Org setup (post-signup) · Team-1
- Date: 2026-07-01 · Reviewed: `app/(auth)/org-setup/{page,org-setup-wizard}.tsx`
- Verdict: **PASS**
- Findings:
  1. [NIT] Generic `[ESC-7-API]` marker for "participation not sent" (page.tsx:14, wizard:16) — participation not being a `create_organization` field is a design fact, not a deferred-API gap; cite a specific registered handle or drop the marker.
  2. [NIT] Usage step is a hand-rolled native radio group (no kit RadioGroup primitive) — a11y-correct (fieldset/legend, sr-only radios in labelled cards, focus-within, error wiring). Same kit-gap class as the signup checkbox.
  3. [OBS] EXEMPLARY field discipline: collects only frozen `name`; omits `org_type`/address/contact_info (unenumerated → not invented); `is_personal_org` server-set; usage = onboarding INTENT, never submitted. Functional client wizard; `info-muted` notice (P-4 convention); honest interim (creates no org); binds real `create_organization` (J-BUY-02); `(auth)` group, no sibling-disturbing layout.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-04).

### RV-0008 · P-ADM-03 · Moderation case detail · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/moderation/[caseId]/page.tsx`, `_components/admin/moderation/moderation-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS — reinforces RV-0003 deferred MINOR] Reuses `vendor/dashboard/DashboardSection` + `vendor/shared/{DescriptionList,PresentationFormNote}` — now cross-WORKSPACE (vendor + admin). Reuse-not-duplicate is correct; the shared-extraction promotion candidate (→ neutral shared / platform) grows stronger. Deferred to the shared-extraction pass; non-blocking.
  2. [NIT] No route-level `loading.tsx` for `[caseId]` — add before the `J-ADM-01` read is wired (sync seed today).
  3. [OBS] Strong: R5 (decision affordances rendered-but-DISABLED + `PresentationFormNote`); `notFound()` on unknown id (Inv #11 byte-identical absence); firewall (no Trust/Perf/Tier); shares the P-ADM-02 seed (no duplicate case data); PageHeader h1 → section h2s; `<ol>` activity; good reuse + responsive.
- Disposition (author/authority): OBS-1 deferred (shared extraction, cross-surface promotion — not a P-ADM-03 defect); NIT non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-04).

### RV-0009 · P-BUY-18 · Close lost · Team-2
- Date: 2026-07-01 · Reviewed: `.../close-lost/{page,loading}.tsx`, `_components/close-lost/{close-lost-view.tsx,close-lost-view-models.ts}`
- Verdict: **PASS**
- Findings:
  1. [OBS] `reason_code` enum is VERBATIM-correct vs frozen Doc-4E §E8.5 POLICY list — `budget_dropped|requirement_changed|no_suitable_quotes|sourced_off_platform|other` (exact, in order; labels presentation-only); `reason_text` required-iff-`other` captured. Coins nothing.
  2. [OBS] Non-penalizing (Doc-3 §9.5) EXEMPLARY: uniform closure note on both steps ("no penalty to any vendor… never told a buyer 'chose someone else'… for your own records"); no per-vendor outcome; no firewalled signal. `notFound()` byte-identical (Inv #11); `loading.tsx` present; functional GET-form confirm; inert destructive Close honestly parked.
  3. [NIT] Conditional-required `reason_text` (iff `other`) and the reason `Select` are not natively `required` — submitting empty returns to the form (server is authoritative; UI states the rule via description). Consistent with the award GET-form pattern. Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-19).

### RV-0010 · P-AUTH-04 · Password reset — request · Team-1
- Date: 2026-07-01 · Reviewed: `app/(auth)/forgot-password/{page,forgot-password-form}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] Non-disclosure EXEMPLARY (Doc-7A §4.3/§8): a valid submit ALWAYS resolves to the uniform "If an account exists…" confirmation — existence never checked or revealed (no account-existence side-channel). Presentation-only (sends nothing; honest "nothing was sent"); `text-iv-success-muted`; `role="status"`; page h1 present (success h2 nested correctly); FormField a11y + autocomplete; binds Supabase Auth recovery.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-05).

### RV-0011 · P-BUY-19 · Engagements · Team-2
- Date: 2026-07-01 · Reviewed: `app/(app)/(buyer)/engagements/{page,engagements-list-view,loading}.tsx`, `_components/engagement-list-view-models.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] Projection discipline EXEMPLARY: VM + view render EXACTLY the 3 frozen `ops.list_engagements.v1` fields {engagement_id, human_ref, status} (Doc-4F §F5.8) — no coined counterparty/value/rfq_id/date (detail-only, P-BUY-20). Party-scoped genuine-empty (Inv #11); cursor pagination, no grand total (GI-03); contract order never re-ranked (GI-04); NO free-text search (status-enum filter only). PageHeader h1, DataListTable reuse, loading.tsx, honest empty variants.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-20).

### RV-0012 · P-ADM-04 · RFQ moderation · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/rfq-moderation/page.tsx`, `_components/admin/admin-queue-table.tsx`, `_components/admin/moderation/moderation-queue-table.tsx` (refactor), `.../rfq-moderation/rfq-moderation-seed.ts`
- Verdict: **PATCH REQUIRED**
- Findings:
  1. [MINOR] Shared `AdminQueueTable` applies each column's `className` to BOTH `<th>` and `<td>` (admin-queue-table.tsx:52,66), so cell-oriented classes leak onto headers: the `ref` column's `font-mono` renders the "Case"/"RFQ" HEADERS in monospace. For P-ADM-02 this is a visual REGRESSION vs the approved pre-extraction table (sans header) — the "render-equivalent" refactor claim is falsified; for P-ADM-04 it's an unintended monospace header. Fix: apply `className` to `<td>` only + add an optional `headerClassName`. High-leverage — every future admin queue inherits this table.
  2. [OBS] Otherwise excellent and exactly the recommended extraction: `AdminQueueTable` correctly placed in the shared admin location (not a feature folder), generic over row type, RSC, composes kit Card; P-ADM-04 honors R5 (Pass/Reject rendered-but-DISABLED; PASS→matching / REJECT→draft), firewall (no signal), URL filter, cursor pagination, EmptyState; P-ADM-02 refactor otherwise reproduces the prior cells faithfully.
- Disposition (author/authority = Team-3): patch the th/td className handling (restores P-ADM-02 equivalence + removes monospace headers).
- Result: page → 🟥 Patch Required. Queue NOT advanced; returned to Team-3.

### RV-0013 · P-ADM-04 · RFQ moderation · Team-3 (re-review of RV-0012)
- Date: 2026-07-01 · Reviewed: `_components/admin/admin-queue-table.tsx` (patch), `.../moderation/moderation-queue-table.tsx`, `admin/rfq-moderation/page.tsx`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED] MINOR (RV-0012) — `AdminQueueColumn` now splits `className` (td-only) from `headerClassName` (th-only); header = `cn("px-4 py-3 font-medium", col.headerClassName)`, and NO column sets `headerClassName` → every header is `px-4 py-3 font-medium` (sans). Diff-verified: P-ADM-02's "Case" header is byte-identical to its approved pre-extraction markup (equivalence restored); P-ADM-04's "RFQ" header no longer monospace. `tsc --noEmit` EXIT 0. Page + column configs untouched.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-05). P-ADM-02 stays ✅ Approved (render restored).

### RV-0014 · P-AUTH-05 · Password reset — confirm · Team-1
- Date: 2026-07-01 · Reviewed: `app/(auth)/reset-password/{page,reset-password-form}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] Non-disclosure EXEMPLARY (Doc-7A §4.3/§8): invalid/expired resolves to a UNIFORM notice with no account-existence wording; the recovery token is server-authoritative (client checks UX-only, never trusts/validates a token). Presentation-only (sets no password; honest "Nothing was changed"); `info-muted`; `role="status"`; each state carries an h1; `new-password` autocomplete + min-length/match UX validation.
  2. [OBS] `?state=` dev preview harness is correctly PROD-GATED (`process.env.NODE_ENV !== "production"`) — a real visitor is never shown a fabricated state. The RIGHT dev-preview pattern (contrast: the committed `previewpf` route flagged in the platform review).
  3. [NIT] In the completed/interim state the page h1 stays "Set a new password" while the panel reads "Almost there — nothing was changed" (slight heading/content mismatch). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-06).

### RV-0015 · P-BUY-20 · Engagement detail · Team-2
- Date: 2026-07-01 · Reviewed: `app/(app)/(buyer)/engagements/[engagementId]/{page,engagement-detail-view,loading,not-found}.tsx`, `_components/engagement-detail-view-models.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] EXEMPLARY field/contract discipline vs frozen `ops.get_engagement.v1` (Doc-4F §F5.8): VM carries only surfaced projected fields; `buyer_organization_id`/`vendor_controlling_org_id` deliberately OMITTED (not coined); `award_value_snapshot`+`currency` → `Money` (currency-driven, BDT never assumed); counterparty = OPAQUE `vendor_profile_id` ref + plain-language "display name isn't shown" (NO coined name); `rfq_id` interim link (not projected); documents section GATED not faked. All three gaps cite REGISTERED handles `ESC-7G-ENG-01/02/03` — kept in-code, never in user copy (self-review leak fixed).
  2. [OBS] MONEY BOUNDARY (DF-6/R8) exemplary: "record only… never holds, escrows, or moves funds… settled directly between the parties." `notFound()` + `not-found.tsx` byte-identical (Inv #11/H.9); party-scoped note; loading.tsx; strong reuse. A model for the remaining detail pages.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-21).

### RV-0016 · P-ADM-05 · Bans · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/bans/page.tsx`, `_components/admin/bans/bans-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] Governance CORRECT — the register shows PLATFORM bans (`VendorBanned`/M8 enforcement, admin-visible by design), explicitly NOT the buyer-private blacklist (Inv #11 governs the M4 CRM; documented in page + seed). Firewall (no Trust/Perf/Tier); R5 (rows→P-ADM-06 detail; the listing issues nothing); no fabricated totals; URL filter; cursor pagination; realistic BD-industrial seed (BAN-2026-* refs).
  2. [OBS] 3rd `AdminQueueTable` consumer — patched table proven: the `ref` column's `font-mono` is td-only, so the "Ban" header stays sans (RV-0013 fix holds); columns-only config, custom `minWidthClassName`, no new table markup; a11y via the shared table.
  3. [NIT] No route-level `loading.tsx` for /admin/bans — consistent with the other admin queues; add before the `J-ADM-04` read is wired (sync seed today). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-06).

### RV-0017 · P-AUTH-06 · 2FA challenge · Team-1
- Date: 2026-07-01 · Reviewed: `app/(auth)/2fa/{page,two-factor-form}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] Server-authoritative + presentation-only (verifies nothing; honest "Nothing was verified"). `?state=` dev harness PROD-GATED (`NODE_ENV !== "production"`). TOTP (6-digit, inputMode numeric, `one-time-code`) + backup-code toggle; uniform `role="alert"` error using `danger-muted`; interim `info-muted` (P-4 convention); h1 per state; FormField a11y; auth-shell reuse.
  2. [NIT] Done/interim state keeps the page h1 "Two-factor authentication" (same benign heading/content mismatch as P-AUTH-05). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-07).

### RV-0018 · P-ADM-06 · Ban detail / issue · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/bans/[banId]/page.tsx`, `_components/admin/bans/bans-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] R5 — Lift/Re-issue/Extend rendered-but-DISABLED (`issue_ban`/`lift_ban` owned by M8, emit `VendorBanned`) + PresentationFormNote; `notFound()` byte-identical (Inv #11); platform-ban ≠ buyer-private blacklist (documented, line 84); firewall (no Trust/Perf/Tier); extends the P-ADM-05 seed (getBan/getBanDetail — no duplicate data); PageHeader h1 → section h2s; activity `<ol>`.
  2. [OBS] Cross-workspace reuse of `vendor/dashboard/DashboardSection` + `vendor/shared/{DescriptionList,PresentationFormNote}` continues (now 4+ admin consumers) — reinforces the RV-0003/0008 deferred shared-extraction promotion candidate. Non-blocking.
  3. [NIT] No route-level `loading.tsx` for `[banId]` — consistent with the other admin details; add before wiring.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-07).

### RV-0019 · P-AUTH-07 · Accept invitation / join org · Team-1
- Date: 2026-07-02 · Reviewed: `app/(auth)/accept-invitation/{page,invitation-view}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] Governance clean: binds real `accept_invitation` (Doc-4C §C6); Org Role uses the FROZEN set (Manager — Inv #2, not invented); Users-act/Orgs-own note (Inv #5 — "Organizations own their records; by joining you act on behalf of this one"). Server-authoritative token (page validates/trusts nothing; org/role/inviter = realistic mock). Non-disclosure: invalid/expired → uniform notice, no org/account leak. `?state=` harness PROD-GATED (NODE_ENV); single h1 per state; `info-muted`/`warning-muted` (P-4); presentation-only accept/decline (honest interim, joins nothing).
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-08).

### RV-0020 · P-ADM-07 · Vendor approval queue · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/vendor-approval/page.tsx`, `_components/admin/vendor-approval/vendor-approval-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] FIREWALL exemplary — approval is a PROFILE-STATUS decision (M2 claim lifecycle + visibility, Inv #3), explicitly NOT a trust/performance score or financial tier (M5 owns the score; verification is separate, P-ADM-12/13). Seed carries no signal (grep-verified). R5: Approve/Reject rendered-but-DISABLED (`set_vendor_profile_status`→M2, real contract Doc-4D). URL filter; no fabricated total; cursor pagination; 4th `AdminQueueTable` consumer (patched table — "Ref" header sans).
  2. [NIT] No route-level `loading.tsx` — consistent with the other admin queues; add before wiring.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-08).

### RV-0021 · P-AUTH-08 · Email verification · Team-1
- Date: 2026-07-02 · Reviewed: `app/(auth)/verify-email/{page,email-verification-view}.tsx` (untracked; self-contained — stable target; other teams' in-progress work is in unrelated paths)
- Verdict: **PASS**
- Findings:
  1. [OBS] Governance clean: confirmation token is SERVER-AUTHORITATIVE (page validates/trusts nothing; binds Supabase Auth email confirmation — authentication only). Non-disclosure (Doc-7A §4.3/§8): an invalid/expired link → UNIFORM notice, no account-existence signal. The pending view shows the user's OWN pending address (self-disclosure, not a leak; correctly noted as wired-build behavior, mock seed here). Presentation-only: "Resend" sends nothing + honest inline note; no mutation.
  2. [OBS] `?state=` dev harness PROD-GATED (`process.env.NODE_ENV !== "production"`) — matches P-AUTH-05/06/07, the correct pattern (a real visitor never sees a fabricated state). Exactly one h1 per RENDERED state (the two `<h1>` in page.tsx are mutually-exclusive branches); heading tracks the branch (the benign heading/content mismatch NIT from P-AUTH-05/06 does not recur). P-4 inks honored: `iv-success-muted`/`iv-warning-muted`/`iv-info-muted` on `*-subtle` tints. Contrast independently computed: body `muted-foreground` (#5f6f86) = 4.70:1 on success-subtle, 4.75:1 on warning-subtle, 5.12:1 on Card — all AA-pass. All tokens verified to exist (globals.css + tailwind.config.ts); kit composition (BrandLogo/Card/Button); a11y (icons `aria-hidden`, resent note `role="status"`, focus-visible rings, disabled loading button). No route-level `loading.tsx` needed — no server data fetch to suspend on (the spinner is the dev `?state=loading` preview only).
  3. [OBS] Repo hygiene (NOT part of P-AUTH-08): two stray untracked root scripts `_axe-po.mjs` / `_axe-probe2.mjs` appeared in the tree (likely a11y probe scratch). Gitignore or delete before the commit checkpoint so they are not staged. Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-01).

### RV-0022 · P-BUY-21 · Purchase order · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/engagements/[engagementId]/po/{page,purchase-order-view,loading,not-found}.tsx`, `_components/purchase-order-view-models.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] Projection discipline EXEMPLARY — VM carries ONLY the six frozen-projected fields of `ops.get_engagement_document.v1`, VERIFIED verbatim against Doc-4F §F5.8 (`document{ document_id, doc_kind, human_ref, version_no, is_active_revision, storage_ref }`). PO body (`content_jsonb`), monetary total, and a document LIST are all DELIBERATELY omitted with documented reasons — nothing coined; `doc_kind` pinned to the frozen `"po"` enum value. No PO total invented → no BDT/currency assumption (correct: the read projects no amount).
  2. [OBS] `can_approve_po` handled as a DISTINCT slug — confirmed a REAL Doc-2 §7 slug (Doc-2:626; Doc-4F §F5.4 AI-note "do not collapse the two slugs"); gated in PRESENTATION only (both branches: withheld ≠ collapsed), server enforces at wiring; approve affordance DISABLED (Wave-4 write parked). Money boundary (DF-6/R8) standing note — record only, no pay/settle/escrow anywhere. Versioned/immutable (Inv #8) — active revision shown, `revision_reason` on revise, superseded retained.
  3. [OBS] `notFound()` collapse byte-identical (Inv #11/GI-12/H.9): unknown/absent PO AND non-party engagement resolve identically; `not-found.tsx` breadcrumb shows only the `Engagements` ancestor — NO leaf engagement/document ref leaks. `ESC-7G-ENG-03` registered (esc_registry.md:63) and kept in-code only (never user copy). `loading.tsx` present (SK-DETAIL); single h1 (PageHeader) → h2 CardTitles; strong reuse (no new primitive); disabled affordances carry WHY hints; GI-02 data layer parked (Wave 4) — presentation-only honored. A model detail page, on par with P-BUY-20 (RV-0015).
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-22).

### RV-0023 · P-ADM-08 · Category management · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/categories/{page,loading}.tsx`, `_components/admin/categories/categories-seed.ts` · (shared `AdminQueueTable` verified UNCHANGED vs HEAD — `srHeader` pre-existing; no approved-component modification)
- Verdict: **PATCH REQUIRED** (BLOCKER 1 · MAJOR 1 · MINOR 1)
- Findings:
  1. **[BLOCKER] Invented category status vocabulary contradicts the FROZEN state machine.**
     - *Finding:* seed/page define `CategoryStatus = "active" | "hidden" | "archived"` with per-row actions Hide / Activate / Archive / Restore.
     - *Evidence:* Doc-2 §3.3 (line 280) categories `draft → active → retired`; entity columns `name, slug, level(1–4), path` (Doc-2 line 737, "YES (retire)"). Doc-4D `marketplace.set_category_status.v1` = **"Category Status (Approve / Retire)"** — `draft→active` (approve, the DD-4 staff act) and `active→retired` (retire) (Doc-4D PassA §153/§155; PassB §36; Hard-Review §64). Corpus grep for a category `hidden`/`archived` state → **ZERO hits** ("hidden" only appears as "no hidden ownership"; "archive" is RFQ, not categories).
     - *Reason:* `hidden` and `archived` are coined states with no frozen basis; `retired` is renamed to `archived`; **`draft` — the pre-approval state where category governance actually happens — is omitted entirely**; Hide/Activate/Restore are invented transitions. Violates Golden Rule 10 (Frozen Documents Are Authoritative) + frozen-enum-verbatim; misrepresents the real approve/retire governance workflow.
     - *Recommendation:* Model the frozen enum verbatim — `draft | active | retired`; actions **Approve** (`draft→active`) and **Retire** (`active→retired`), rendered-but-disabled (R5). Seed a `draft` (pending-approval) exemplar. Remove Hide/Activate/Archive/Restore.
  2. **[MAJOR] `specialized` rendered as a category attribute — it is an assignment-level flag.**
     - *Finding:* `CategoryVM.specialized` renders a "Specialized" marker on category NODES.
     - *Evidence:* `is_specialized` is a **`category_assignments`** column (vendor↔category) — Doc-2 §10.3 (line 738: `category_assignments | level, is_specialized, status(proposed/active/removed)`); Doc-4D `assign_category` Request `is_specialized : boolean` (PassB §46). The category entity has only `name, slug, level, path` (Doc-2 line 737) — no specialization flag.
     - *Reason:* Attributes an assignment-scoped concept to the taxonomy entity — a coined field on the category read.
     - *Recommendation:* Remove `specialized` from the taxonomy row; it belongs to a vendor's category assignment (e.g. P-VND-11), not the admin tree.
  3. **[MINOR] `code` is not a frozen category field; the frozen ref is `slug`.**
     - *Finding:* `CategoryVM.code` ("CAT-FAB", "CAT-VLV-CTL") drives a "Code" column.
     - *Evidence:* the category entity carries `slug` (Doc-2 line 737; `marketplace_category_slug_conflict`; `update_category` edits name/slug), not a "code."
     - *Reason:* coined display field; the taxonomy's human ref is `slug`.
     - *Recommendation:* use the frozen `slug` (label "Slug") or drop the column.
  4. [OBS] Structure otherwise sound — legitimate 5th `AdminQueueTable` consumer (uses the pre-existing `srHeader` for the actions column, good a11y; shared table byte-unchanged, git-verified); R5 disabled actions; firewall (no Trust/Perf/Tier); `loading.tsx` added (discharges the standing admin-queue NIT); URL status filter with allowlist + `aria-current`; depth-first indentation; no fabricated grand total. Once the status model + `specialized`/`code` are corrected the page is close. Wiring note: the frozen authz slug is `staff_can_manage_categories` (Doc-4D) — Admin/staff, no active-org.
- Result: page → 🟥 Patch Required. NOT advanced; returned to Team-3 (P-ADM-08 stays with Team-3; P-ADM-09 remains blocked until re-review PASS).

### RV-0024 · P-BUY-22 · Payments · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/engagements/[engagementId]/payments/{page,payments-view,loading,not-found}.tsx`, `_components/payment-view-models.ts` (+ additive `view-models.ts` `PaymentStatus`, `state-display.ts` `paymentStatusDisplay`)
- Verdict: **PASS**
- Findings:
  1. [OBS] `payment_records` projection VERIFIED VERBATIM against Doc-2 line 783 / Doc-4F §F5.6 line 37 — `amount, currency, paid_at, method_note, status enum<recorded|confirmed>` — records only, no funds custody. VM carries exactly those fields; nothing coined; state machine `recorded → confirmed` (Doc-2 line 328). No `list_payment_records` read is frozen (ENG-03-class gap) — the list is a presentation stand-in, flagged in-code, no coined list contract.
  2. [OBS] Distinct slugs VERIFIED — Doc-4F §F5.6 line 373/400: `can_record_payments` (record) / `can_approve_payment` (confirm), *"distinct from"*, never collapsed. Record affordance gates on the former (de-duplicated: header XOR empty-state, never twice); per-row Confirm gates on the latter AND only on `recorded` rows (machine edge). MONEY BOUNDARY (DF-6/R8) standing note — records only, no pay/settle/escrow; writes PARKED (Wave 4). `notFound()` byte-identical (Inv #11/GI-12/H.9), no leaf-ref leak; `loading.tsx`.
  3. [OBS] Shared-file touches ALL git-verified safe: `PaymentStatus` (view-models.ts) + `paymentStatusDisplay` (state-display.ts) are PURELY ADDITIVE (no existing export changed; values match the frozen union, honoring the file's "no state without the frozen union" rule). `stickyFirstColumn` is a PRE-EXISTING `DataListTable` prop (file unchanged vs HEAD) — used for WCAG 2.1.1 keyboard-focusable scroll region; no approved-component modification. Model detail page, on par with P-BUY-20/21.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-23).

### RV-0025 · P-ACC-01 · Account overview · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/overview/{page,layout,account-overview-view}.tsx`, `account-nav-model.ts` (+ additive `_components/shell/icons.ts`)
- Verdict: **PASS**
- Findings:
  1. [OBS] Invariant #2 rendered correctly — Platform Participation (Buyer/Vendor badges) and Org Role (StatusChip "Owner") shown DISTINCTLY with explanatory copy ("separate from participation"), never conflated; frozen role set (Owner) + frozen participation set (`buyer|vendor|hybrid|staff`, shell/types.ts:12). Invariant #10 exemplary — entitlements are numeric (seats 8/25, credits 320/500) + enum StatusChip "Active", NEVER a plan-name; nav-model comment reinforces server-side entitlement gating via wired contracts ("hiding a link is convenience only; the server re-validates"). Firewall clean (no Trust/Perf/Tier); Users-act/Orgs-own (Inv #5 — client org id never trusted, server-resolved at wiring).
  2. [OBS] Shell `icons.ts` change git-verified PURELY ADDITIVE (2 lucide imports + 4 NAV_ICONS keys `account/members/roles/delegation`; existing keys untouched) — other nav consumers unaffected; all account-nav icon keys resolve. AppShell/PageHeader own the single h1 → h2 sections; kit reuse (no new primitive). `account-nav-model` grounded in page_inventory §12 nav; layout scoped to `/account/overview` only (does not wrap sibling P-ACC-14).
  3. [OBS] Forward links (Organization/Members/Roles/Delegation/Billing/Workflow) 404 until those P-ACC pages land — the accepted "overview-first / dashboard-first sub-routes" pattern (as P-ADM-01), honestly documented in both the view and the nav-model. Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-02).

### RV-0026 · P-ADM-08 · Category management (re-review of RV-0023 patch) · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/categories/page.tsx`, `_components/admin/categories/categories-seed.ts`
- Verdict: **PATCH REQUIRED** (MAJOR 1) — RV-0023's 3 findings all RESOLVED; 1 new MAJOR surfaced by the corrected vocabulary
- Prior findings — resolved:
  - [RESOLVED BLOCKER RV-0023#1] status enum now FROZEN `draft | active | retired` (Doc-2 §3.3 line 280); META + FILTERS include `draft`; seed carries draft/active/retired exemplars.
  - [RESOLVED MAJOR RV-0023#2] `specialized` removed (it is a `category_assignments` flag, Doc-2 §10.3 — not a category attribute).
  - [RESOLVED MINOR RV-0023#3] `code` → `slug` (frozen `categories.slug`, Doc-2 line 737); slug column `font-mono` is td-only so the "Slug" header stays sans (RV-0013 split holds).
- New finding:
  1. **[MAJOR] `ACTIONS_BY_STATUS` offers transitions outside the frozen state machine.**
     - *Finding:* `draft: ["Approve","Retire"]`, `active: ["Retire"]`, `retired: ["Approve"]`.
     - *Evidence:* Doc-4D `marketplace.set_category_status.v1` — Request `target_status : enum(active|retired)`, STATE validation `draft → active → retired`; **retired is "terminal-for-discovery"** (Doc-4D PassB §38/§39/§41; Hard-Review §64 enumerates exactly two edges: `draft→active` approve, `active→retired` retire). No `draft→retired` and no `retired→active` (reactivate) edge exists; `target_status` cannot be `draft`.
     - *Reason:* "Retire" on a `draft` (draft→retired) and "Approve" on a `retired` (retired→active) are edges the frozen machine forbids — the command would return `STATE`. The page misrepresents the governance transitions available per state (and contradicts its own seed comment "retired is terminal-for-discovery"). Central governance affordance of the page → conformance-degrading (MAJOR), though contained (disabled/presentation, coins no data).
     - *Recommendation:* `ACTIONS_BY_STATUS = { draft: ["Approve"], active: ["Retire"], retired: [] }`; render the retired actions cell as a neutral "—" (as P-BUY-22 does for non-actionable rows). Keep the affordances disabled (R5).
  2. [OBS] Everything else conforms — frozen enum/labels correct, AdminQueueTable reuse (5th consumer; shared table byte-unchanged), R5 disabled, firewall clean, `loading.tsx`, URL filter allowlist + `aria-current`, no fabricated total. A one-map fix from PASS.
- Result: page → 🟥 Patch Required. NOT advanced; returned to Team-3 (fix the action map, then re-review).

### RV-0027 · P-ADM-08 · Category management (re-review of RV-0026 patch) · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/categories/page.tsx`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED MAJOR RV-0026#1] `ACTIONS_BY_STATUS = { draft: ["Approve"], active: ["Retire"], retired: [] }` — now exactly the two frozen linear edges (`draft→active` approve, `active→retired` retire; Doc-4D `target_status enum(active|retired)`); `retired` is terminal, no forward action. The actions cell renders a neutral `—` for the empty (terminal) case (`if (actions.length === 0) return "—"`) — same non-actionable pattern as P-BUY-22; affordances stay disabled (R5). No draft→retired / retired→active edge offered.
  2. [OBS] RV-0023's three findings remain resolved (frozen enum `draft|active|retired`, `specialized` absent, `slug` not `code`); AdminQueueTable reuse (5th consumer, shared table byte-unchanged), firewall clean, `loading.tsx`, URL filter allowlist + `aria-current`, no fabricated total. Clean.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-09).

### RV-0028 · P-BUY-23 · Trade invoice review · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/engagements/[engagementId]/trade-invoice/{page,trade-invoice-view,loading,not-found}.tsx`, `_components/trade-invoice-view-models.ts` (+ additive `view-models.ts` `TradeInvoiceStatus`, `state-display.ts` `tradeInvoiceStatusDisplay`)
- Verdict: **PASS**
- Findings:
  1. [OBS] `trade_invoices` projection VERIFIED VERBATIM — Doc-2 line 782 / Doc-4F §F5.5 line 36/295: `human_ref (INV-…), amount, currency, status enum<issued|partially_paid|paid|disputed|cancelled>, due_date` — **≠ `billing.platform_invoices`**. VM carries exactly those fields; no line-items/breakdown coined. The M4↔M7 boundary (DF-6, no funds) is documented AND rendered (money-boundary note distinguishes trade vs platform invoice).
  2. [OBS] NO coined "approved" status — the VM explicitly flags page_inventory's `approve_trade_invoice`/`get_invoice` as LABELS, not contract IDs; the real writes are `issue_trade_invoice`/`update_trade_invoice_status` (Doc-4F §F5.5) and the machine has no "approved" state. Buyer review transition = a `disputed` raise: `update_trade_invoice_status` `target_status=disputed`, slug **`can_record_payments`** (VERIFIED — §F5.5 Authorization Matrix "slug held (trade invoices / payment records)"), gated `DISPUTABLE={issued,partially_paid}` (non-terminal), disabled/parked. `→ disputed` emits **`DisputeRecorded`** (Trust input DF-4, server-side, line 316) — never a locally-computed score; `disputed` is a trade-invoice status, not an engagement state.
  3. [OBS] Shared-state additions git-verified PURELY ADDITIVE (`TradeInvoiceStatus` in view-models.ts; `tradeInvoiceStatusDisplay` + import in state-display.ts — no existing export changed; values = the frozen union, honoring "no state without the frozen union"). `notFound()` byte-identical (Inv #11/H.9), no leaf-ref leak; `loading.tsx`; single h1 (PageHeader) → h2 CardTitles; reuse (no new primitive); cross-link to Payments (P-BUY-22). Note: exact legal source-states for `→ disputed` are server-enforced at wiring (the disabled affordance can't trigger an illegal edge). Model detail page.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-24).

### RV-0029 · P-ADM-09 · Category editor (create form) · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/categories/new/page.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] `create_category` request bound VERBATIM (Doc-4D CatalogProductSpec §create_category): `name : string : required`, `slug : string : required` (unique), `parent_id : uuid : optional` (self-FK, ≤4-level), `level : integer : required` (1–4). Form fields = exactly those four; nothing missing/coined. New category enters at `draft` (Doc-2 §3.3 `→ draft`; Response `status enum(=draft)`) — page states it's approved later from Category management via `set_category_status`, never here.
  2. [OBS] R5 — Create rendered-but-DISABLED (`create_category` is M2/Marketplace-owned, DD-4 "category approval governance is Admin's; entity Marketplace-owned"; Admin decides, module applies) + `PresentationFormNote`. Firewall clean (no Trust/Perf/Tier). Boundary discipline EXEMPLARY — a native `<select>` styled to the kit Input, explicitly NOT importing the buyer surface's Select (surfaces stay decoupled); no new primitive. Parent select excludes `retired` nodes (safe subset; the frozen REFERENCE rule only requires parent existence — server-authoritative at wiring). PageHeader h1 → DashboardSection; FormField label/id association correct.
  3. [OBS] Cross-workspace reuse of `DashboardSection`/`PresentationFormNote` (vendor/ atoms imported into admin) continues — reinforces the standing shared-atom promotion candidate; a kit `Select` primitive is a promotion-watchlist item if selects proliferate. Wiring note: authz slug `staff_can_manage_categories`, no active-org (§5.6). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-10).

### RV-0030 · P-ACC-02 · User profile · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/profile/{page,layout,user-profile-form}.tsx` (+ shared `account-nav-model.ts` one-line repoint)
- Verdict: **PASS**
- Findings:
  1. [OBS] Field discipline VERIFIED verbatim — edits exactly `update_user_profile.v1` writable fields (Doc-4C §C4 PassB:174–175: `display_name : optional : bounded`, `phone : optional : E.164`); the form's `PHONE_RE` is E.164. EMAIL is auth-managed (DC-4) → rendered READ-ONLY, never mutated ("never password/2FA-secret fields", line 117). Avatar change deferred `[ESC-7-API/upload]` (disabled). Presentation-only: save writes nothing, shows an honest interim; discard-confirm Dialog; save bar only when dirty; single h1 (PageHeader); firewall clean.
  2. [OBS] Shared `account-nav-model.ts` change git-verified = a ONE-LINE href repoint (`Profile` `/account` → `/account/profile`, which now exists as this page); safe — no other consumer breaks, P-ACC-01's layout still resolves. (Forward-consistency nit: P-ACC-01's overview "Edit profile" still points to `/account`/P-ACC-14 — a product call, non-gating.) `--iv-form-max` token is undefined in the design system → team used `max-w-2xl` and flagged it to the token owner (honest; no coined token). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-03).

### RV-0031 · P-BUY-24 · Challan · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/engagements/[engagementId]/challan/{page,challan-view,loading,not-found}.tsx`, `_components/challan-view-models.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] PO-parity (RV-0022 pattern) minus the financial card — VM carries ONLY the 6 `get_engagement_document.v1` projected fields (Doc-4F §F5.8, verified at RV-0022), `doc_kind` pinned to the frozen `"challan"` enum value; challan BODY (`content_jsonb`, delivery line items/quantities) deliberately omitted — nothing coined. READ-ONLY for the buyer: deliveries are recorded by the delivering party via `record_delivery` (slug `can_create_documents`) → `DeliveryRecorded` (a frozen BC-OPS-2 Trust input, DF-4; server-side, no score computed). page_inventory's `get_challan` correctly flagged as a LABEL.
  2. [OBS] Versioned/immutable (Inv #8); `notFound()` byte-identical, no leaf-ref leak (Inv #11/H.9); `loading.tsx`; ZERO shared-file edits; non-financial (no money surface). Structurally a versioned-engagement-document promotion candidate once WCC lands (noted). Model detail page.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-25).

### RV-0032 · P-ADM-10 · Ad review queue · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/ads/{page,loading}.tsx`, `_components/admin/ad-review/ad-review-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] `advertisements` fields VERIFIED verbatim (Doc-2:749 / Doc-4D PassB Advertising:21): `creative_ref` (the identifier — ads have NO human_ref, correctly stated), `placement enum{landing|bottom|search|vendor_profile}`, `schedule`, `status(§5.8)`, optional `vendor_profile_id` (→ advertiser display). Nothing coined. Status subset = the review-relevant `pending_review|scheduled|rejected` (frozen §5.8 machine, `review_advertisement`: `pending_review→scheduled` approve / `→rejected`). R5 — per-row Review DISABLED (decision is `review_advertisement`, Admin, on P-ADM-11 detail; queue invokes nothing).
  2. [OBS] FIREWALL §B.11 EXACT (Doc-4D PassB Advertising:20): "ads are visibility/placement, never gate trust/eligibility/routing/matching" — no governance signal in the queue. 6th `AdminQueueTable` consumer (shared table byte-unchanged); `loading.tsx`; URL filter allowlist + `aria-current`; no fabricated total (GI-03). Wiring note: review slug carries `[ESC-MKT-SLUG-note]` (under-specified in corpus) — server-authoritative at wiring.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-11).
