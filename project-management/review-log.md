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
