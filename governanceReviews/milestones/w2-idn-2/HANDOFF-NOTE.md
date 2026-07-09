# HANDOFF NOTE — Agent M1 · W2-IDN-2 · SUSPENDED 2026-07-09

## 0. Header
- **Role / Work item:**   Agent M1 (Identity & Organization) · `W2-IDN-2` · packet: `governanceReviews/milestones/w2-idn-2/ACTIVATION-PACKET.md`
- **Checkpoint SHA:**     `c4c8146` (docstring-only fold-in fix; no seed/migration/test code exists at or before this SHA) · branch: `wave/2-core-platform`
- **Tracker row set to:** ⛔ (this note referenced)

## 1. Current state
Halted at the **first step of the build ladder** (before step 1/8 — before `contracts`/migration authoring begins), during the mandatory Doc-2 §7 verbatim-transcription check the packet requires before writing any seed content. No seed migration, no 8E test, and no application code were written. The only artifact produced is an unrelated, explicitly pre-authorized fold-in (harness docstring fix).

## 2. Completed work
- `tests/_harness/db.ts:38-44` — fixed the stale `RESTRICTED_RLS_ROLE` JSDoc (pre-W2-IDN-1 wording "minimal `USAGE`/`SELECT`/`INSERT` on `identity`" no longer matched the actual grant set below it — full CRUD on 4 `identity_authz` tables + `core.audit_records` grants). Committed at `c4c8146`. Prettier/ESLint clean (lint-staged ran on commit).
- No other files touched. No migration directory created. No 8E suite authored. No tracker-row edits (the pre-existing `docs/backend/backend_execution_tracker.md` diff present at activation was not authored by this agent and was left unstaged).

## 3. Blocker
- **Exact blocker:** Flag-and-Halt — **slug-count mismatch between Doc-2 §7 (content) and Doc-6C §5.1 / `backend_execution_playbook.md` §5 (claim)**.
  - The packet's binding envelope (and Doc-6C §5.1, and the playbook `W2-IDN-2` card) assert **45 permission slugs = 38 tenant + 7 staff**.
  - Doc-2 §7 (`generatedDocs/Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` lines 609-647 — the current authoritative text; Doc-2 is FROZEN at v1.0.5 per `00_AUTHORITY_MAP.md` §3, and v1.0.3/v1.0.4/v1.0.5 patches touch only audit-mapping and Vendor-Slug law, **not** permission slugs), transcribed verbatim, yields:
    - **36 distinct tenant slugs** (`space='tenant'`) — verified by full manual table walk (29 rows) and independently by exhaustive regex extraction of every `` `can_...` `` token in the section (37 occurrences, 1 duplicate — `can_manage_vendor_profile` is cited twice across two different rows, same slug).
    - **7 staff slugs** (`space='staff'`) — matches the claim exactly: `staff_can_moderate_rfq`, `staff_can_verify`, `staff_can_support`, `staff_can_ban`, `staff_can_manage_categories`, `staff_can_redact_audit`, `staff_super_admin`.
    - **Total = 43, not 45.** Tenant count is short by exactly 2.
  - PATCH-10 (`Doc2_Patch_v1.0.2.md` "Permission Slug Additions (M-7)": `can_manage_leads`, `can_manage_products`, `can_manage_ads`, `can_upload_spec_documents`, `can_submit_review`) is **already folded into** the base §7 table read above — it does not add 2 more.
  - Checked and ruled out as sources of the missing 2: `Doc-2_Patch_v1.0.3.md` (audit-mapping only), `Doc-2_Patch_v1.0.4.md` (2 audit business-actions only), `Doc-2_Patch_v1.0.5.md` (Vendor Slug law only) — none touch `identity.permissions`/§7. `Master_System_Architecture_v1.0_FINAL.md` §13.1 ("Canonical slugs include…") and §13.3 (Role Bundles, descriptive prose only) — no additional distinct slug beyond the Doc-2 §7 set.
  - Doc-6C §5.1 itself does not enumerate the 38; it states "the authoritative exhaustive list is Doc-2 §7 (bound by pointer; not restated/closed here)" — i.e. Doc-6C's own 38-count is *also* just an assertion pointing back at Doc-2 §7, and Doc-2 §7 does not substantiate it.
- **Why it hard-stops:** the packet's acceptance criteria require "slug set ≡ Doc-2 §7 **exactly** (count + names + spaces — never coin, never rename; a slug you cannot find verbatim in Doc-2 §7 = Flag-and-Halt)" and separately lists "Doc-2 §7 ↔ Doc-6C §5 ↔ playbook mismatch … → Flag-and-Halt citing both sources; never resolve locally" as an explicit halt condition. Seeding 43 slugs would silently contradict the packet's own 45-count mandate and the Doc-6C-realized schema/seed script contract (`Doc-6C_Content_v1.0_Pass2.md` §5.1); seeding 45 by inventing 2 slugs would violate the standing charter's "never coin or rename a slug" rule and Invariant #2. Neither resolution is available to this agent.
- **Escalation filed:** none yet — this note is the first record. Recommend opening on the standing `[ESC-IDN-*]` channel family (e.g. `[ESC-IDN-SLUGCOUNT]`, unopened) or routing through the Doc-2 patch process if the Board determines Doc-2 §7 itself is under-enumerated (2 slugs missing from the frozen table) vs. Doc-6C/playbook over-counting (the "38" is simply wrong and should read "36").

## 4. Dependency
Human/Board ruling required — this is a rank-0 frozen-document content question, not a local judgment call. One of:
(a) Doc-2 §7 is confirmed complete at 36 tenant slugs, and Doc-6C §5.1 + `backend_execution_playbook.md` §5 + this WP's activation packet are corrected (36+7=43) via additive documentation patch; or
(b) Doc-2 §7 is missing 2 tenant slugs that exist elsewhere in the architecture's intent (e.g. an implied bundle-composition slug from Master §13.3 not yet promoted to a `can_*` slug) and Doc-2 receives an additive patch (Doc-2 is rank-0 FROZEN — requires human approval per CLAUDE.md §7/§8) naming the 2 missing slugs verbatim before this WP can seed 45.
Nothing else blocks resumption once (a) or (b) is ruled.

## 5. Next action (first thing the successor does)
Re-run the exact verbatim extraction against the (possibly patched) Doc-2 §7 at reactivation time, confirm the ruled count, then resume the build ladder at step 1 (`contracts/types.ts` is N/A per packet §3 "None to change" — go straight to the data-migration seed files per Doc-6C §5.1/§5.2 SQL templates already quoted in that document).

## 6. Resume instructions
- **Reactivation packet =** original packet (`governanceReviews/milestones/w2-idn-2/ACTIVATION-PACKET.md`) + this note + the ruling artifact (Doc-2 additive patch, or a Doc-6C/playbook correction patch — whichever the Board issues).
- **Files to re-read first:**
  1. `generatedDocs/Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` §7 (lines 609-647) — re-transcribe verbatim, do not trust this note's cached list for names/spaces, only for the count-mismatch fact.
  2. `generatedDocs/Doc-6C_Content_v1.0_Pass2.md` §5 (lines 165-189) — the seed-mechanics SQL templates (`ON CONFLICT` clauses, idempotency) to build against.
  3. Whatever ruling artifact resolved §3/§4 above.
- **Re-verify at resume (do NOT trust this note for these):** whether `Doc-2` has moved past v1.0.5 (check `00_AUTHORITY_MAP.md` §3 current version) while parked; whether the playbook's `W2-IDN-2` card text changed; whether `W2-IDN-1` (schema migration this WP seeds into) has landed and its exact migration path/name (packet cited `prisma/migrations/20260709100000_identity_authz/migration.sql` — confirm it still exists at that path before writing a dependent data migration).
- **Known traps:** the O/D/M/F bundle-default cells in Doc-2 §7 are also loosely worded in places ("M per bundle 'manage team'", "tier change additionally audited" with no explicit O/D/M/F letters, "all active members" for `can_use_messaging`/`can_raise_support_ticket` meaning **all 4 bundles** including Officer) — re-derive the exact per-bundle boolean matrix carefully cell-by-cell once the count is ruled; do not assume the ruling only affects the 2 missing slugs' own bundle mapping, re-check the whole matrix against Doc-2 §7's actual prose since a same-pass Doc-2 patch may also touch bundle defaults.
