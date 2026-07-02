# Team-3 Queue — Vendor / Verification / Admin

**Owns:** `P-VND-*` (Doc-7G) · `P-ADM-*` (Doc-7H). Titles + bindings are the **source record** in
[`page_inventory.md`](../page_inventory.md). Vendor surface is ~complete; the bulk of remaining work
is **Admin (29 pages)**. Every Admin page **invokes** a wired Admin command; the **owning module owns
the effect** (R5) — no page writes Trust/Performance/Tier scores or makes matching/award decisions.
Verification = `P-VND-28` + `P-PUB-18` (Team-1) + `P-ADM-12/13`.

## Vendor Workspace — `P-VND-*` (Doc-7G)

| ID | Title | Priority | Dependency | Status | Notes |
|---|---|---|---|---|---|
| P-VND-01 | Vendor dashboard | P1 | Ready | 🟩 Built | |
| P-VND-02 | Profile editor | P1 | Ready | 🟩 Built | claim lifecycle (Inv. #3) |
| P-VND-03 | Capacity profile | P1 | Ready | 🟩 Built | |
| P-VND-04 | Declared financial tier | P1 | Ready | 🟩 Built | declared ≠ verified |
| P-VND-05 | Microsite editor (draft) | P1 | Ready | 🟩 Built | no draft leaks |
| P-VND-06 | Microsite preview | P1 | Ready | 🟩 Built | |
| P-VND-07 | Products | P1 | Ready | 🟩 Built | |
| P-VND-08 | Product create/edit | P1 | Ready | 🟩 Built | versioned |
| P-VND-09 | Spec library | P2 | Ready | ⬜ | wired write (not upload) |
| P-VND-10 | Spec documents | P2 | Waiting API | ⬜ | `ESC-7-API/upload` |
| P-VND-11 | Category assignment | P1 | Ready | 🟩 Built | admin-governed categories |
| P-VND-12 | Ads | P2 | Ready | ⬜ | placeholder page exists |
| P-VND-13 | Ad create/edit | P2 | Ready | ⬜ | |
| P-VND-14 | Ad submission / status | P2 | Ready | ⬜ | admin reviews |
| P-VND-15 | Invitations inbox | P1 | Ready | 🟩 Built | received-only |
| P-VND-16 | Invitation detail | P1 | Ready | 🟩 Built | decline = no penalty |
| P-VND-17 | Quotations | P1 | Ready | 🟩 Built | visibility-gated |
| P-VND-18 | Quotation create/edit | P1 | Ready | 🟩 Built | versioned |
| P-VND-19 | Quotation version history | P2 | Ready | 🟩 Built | |
| P-VND-20 | Quotation actions | P2 | Ready | 🟩 Built | withdraw = zero penalty |
| P-VND-21 | Leads pipeline | P1 | Ready | 🟩 Built | system-created leads |
| P-VND-22 | Lead detail | P1 | Ready | 🟩 Built | |
| P-VND-23 | Engagements (vendor) | P1 | Ready | 🟩 Built | |
| P-VND-24 | Engagement detail (vendor) | P1 | Ready | 🟩 Built | |
| P-VND-25 | Delivery challan | P2 | Ready | 🟩 Built | upload path → `ESC-7-API/upload` |
| P-VND-26 | Trade invoice issue | P2 | Ready | 🟩 Built | records only (DF-6) |
| P-VND-27 | Finance / payments (vendor) | P2 | Ready | ⬜ | placeholder today |
| P-VND-28 | Trust & performance | P1 | Waiting Decision | ⬜ | `ESC-7G-SCORE-DISPLAY` — **band-only, read-only** |

## Admin Console — `P-ADM-*` (Doc-7H · no active-org)

| ID | Title | Priority | Dependency | Status | Notes |
|---|---|---|---|---|---|
| P-ADM-01 | Admin dashboard | P1 | Ready | ✅ Approved | RV-0003 PASS (Team-4). Deferred MINOR: relocate DashboardSection/PipelineLinks to a shared dashboard folder (2nd consumer) |
| P-ADM-02 | Moderation queue | P1 | Ready | ✅ Approved | RV-0006 PASS (Team-4). NIT: add route-level `loading.tsx` before `J-ADM-01` wiring. OBS: extract shared `AdminQueueTable` at 2nd admin queue |
| P-ADM-03 | Moderation case detail | P1 | Ready | ✅ Approved | RV-0008 PASS (Team-4). R5 (actions disabled), notFound() Inv #11, firewall, shares P-ADM-02 seed. OBS: vendor/dashboard+vendor/shared reuse now cross-workspace → shared-extraction candidate. NIT: loading.tsx |
| P-ADM-04 | RFQ moderation | P1 | Ready | ✅ Approved | RV-0013 PASS (re-review). `className`/`headerClassName` split → headers sans again; P-ADM-02 byte-identical to approved (diff-verified); tsc green. `AdminQueueTable` now canonical for all admin queues |
| P-ADM-05 | Bans | P2 | Ready | ✅ Approved | RV-0016 PASS (Team-4). PLATFORM bans ≠ buyer-private blacklist (Inv #11, documented); firewall; R5; 3rd `AdminQueueTable` consumer (patched table = sans headers). NIT: loading.tsx |
| P-ADM-06 | Ban detail / issue | P2 | Ready | ✅ Approved | RV-0018 PASS (Team-4). R5 (Lift/Re-issue/Extend disabled, emits `VendorBanned`); notFound Inv #11; platform-ban≠blacklist; extends P-ADM-05 seed. OBS: cross-workspace reuse (promotion candidate). NIT: loading.tsx |
| P-ADM-07 | Vendor approval queue | P1 | Ready | ✅ Approved | RV-0020 PASS (Team-4). FIREWALL — profile-status≠trust/tier (M5 owns score); R5 (Approve/Reject disabled, `set_vendor_profile_status`→M2); claim lifecycle Inv #3; 4th `AdminQueueTable` consumer. NIT: loading.tsx |
| P-ADM-08 | Category management | P1 | Ready | ✅ Approved | RV-0027 PASS (re-review). Action-map = frozen linear edges `{draft:[Approve], active:[Retire], retired:[]}` (retired terminal, Doc-4D); terminal cell "—". All RV-0023 + RV-0026 findings resolved; enum draft/active/retired, no specialized, slug; 5th AdminQueueTable consumer; firewall/R5/loading.tsx. NIT (carry-fwd): none open |
| P-ADM-09 | Category editor | P1 | Ready | ✅ Approved | RV-0029 PASS (Team-4). `create_category` request bound VERBATIM (Doc-4D: name/slug req, parent_id opt ≤4-level, level 1–4); new = draft (Doc-2 §3.3), approved later via `set_category_status`. R5 — Create disabled (M2-owned, DD-4) + PresentationFormNote; firewall clean. Boundary discipline exemplary — native `<select>` not buyer Select (surfaces decoupled). OBS: shared-atom promotion (DashboardSection/PresentationFormNote) + kit Select watchlist. Wiring: `staff_can_manage_categories`, no active-org |
| P-ADM-10 | Ad review queue | P2 | Ready | ✅ Approved | RV-0032 PASS (Team-4). `advertisements` fields verbatim (Doc-2:749: creative_ref [no human_ref], placement enum, schedule, status §5.8); status subset pending_review→scheduled/rejected (`review_advertisement`, Admin, on P-ADM-11 — R5 Review disabled); FIREWALL §B.11 exact (ads never gate trust/eligibility/routing/matching); 6th AdminQueueTable consumer; loading.tsx; no fabricated total. Wiring: review slug `[ESC-MKT-SLUG-note]` |
| P-ADM-11 | Ad review detail | P2 | Ready | ⬜ | |
| P-ADM-12 | Verification queue | P1 | Ready | ⬜ | M8 queues |
| P-ADM-13 | Verification task detail | P1 | Ready | ⬜ | → M5 owns score (**firewall**) |
| P-ADM-14 | Import jobs | P2 | Ready | ⬜ | |
| P-ADM-15 | Import job — new / detail | P2 | Ready | ⬜ | create-then-poll (async) |
| P-ADM-16 | Outreach campaigns | P3 | Ready | ⬜ | acquisition only |
| P-ADM-17 | Campaign detail | P3 | Ready | ⬜ | |
| P-ADM-18 | Outreach contacts | P3 | Ready | ⬜ | |
| P-ADM-19 | Routing rules | P2 | Ready | ⬜ | stage-gated |
| P-ADM-20 | Routing rule editor | P2 | Ready | ⬜ | |
| P-ADM-21 | Matching results (internal) | P2 | Ready | ⬜ | internal-service leg only |
| P-ADM-22 | Plan management | P2 | Ready | ⬜ | |
| P-ADM-23 | Plan editor | P2 | Ready | ⬜ | `activate_plan` admin-only |
| P-ADM-24 | Entitlements / bundles | P2 | Ready | ⬜ | |
| P-ADM-25 | Identity ops — orgs | P2 | Ready | ⬜ | no active-org |
| P-ADM-26 | Identity ops — users | P2 | Ready | ⬜ | |
| P-ADM-27 | Suggestion triage | P3 | Ready | ⬜ | non-disclosure |
| P-ADM-28 | Link triage | P3 | Ready | ⬜ | non-disclosure |
| P-ADM-29 | Support reads | P3 | Ready | ⬜ | support scope |
