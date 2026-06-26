# Doc-6G — M5 Trust & Verification (`trust`) Schema Realization — Structure Proposal v0.1

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1 → effective v0.2** — Independent Hard Review applied (2 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). For Structure Freeze Audit → FROZEN |
| Module | **M5 — Trust & Verification** (`trust` schema). **The governance-signal OWNER** — the **authoritative side of the firewall**: Trust Score, Performance Score, verified Financial Tier, Capacity verification. The signals M2 **reflects** (never calculates) and M4 **never mutates**. **Scores auto-calculated under the System actor, never hand-edited** |
| Realizes | **Doc-2 §10.6** — **11 tables / 5 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4G (M5 contracts, consumed); Doc-3 v1.0.2 **+ v1.3 (`trust.*` POLICY — registered, 2 keys)**; Doc-6B (`core`); Doc-6C/6D/6E/6F (UUID + event); Doc-4L/4M |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.3), Doc-4A v1.0, Doc-4G v1.0 (FROZEN), Doc-4L/4M, Doc-6A/6B/6C/6D/6E/6F v1.0 (FROZEN) |
| Contains | Structure only — section map, 11-table partition, ratified decisions (TR-CR1–CR12), the signal-firewall + System-actor-write model, state machines, carried DD, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | **Invariant #6** — the five governance signals are firewalled; M5 owns four of them (Trust/Performance/verified-Tier/Capacity-verification) and computes each **independently**; **Financial Tier never raises Trust; Financial Tier doesn't affect Performance; Buyer Vendor Status (M4) never enters; no secondary signal dominates trust**. Scores **System-written, never hand-edited**. The **public band** lives in M2's reflected read-model (event-driven), not a public read of a `trust` table — M5 is **platform-internal**. **Admin decides, Trust owns** (verification). RLS = backstop |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.6 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions proposed at structure freeze (TR-CR-set)

- **TR-CR1 — 11 tables / 5 groupings (Doc-2 §10.6), coin nothing.** Verification (`verification_records`+`verification_decisions`+`verified_financial_tiers`) · Trust Score (`trust_scores`+`trust_score_history`) · Performance Score (`performance_scores`+`performance_score_history`+`performance_inputs`) · Fraud (`fraud_signals`) · Reviews (`public_reviews`+`admin_ratings`). A 12th table is non-conformant.
- **TR-CR2 — The governance-signal OWNER (Invariant #6 — the firewall's authoritative side).** Trust Score (0–100), Performance Score (0–100), verified Financial Tier (A–E), Capacity verification are **owned and computed here**. **M2 reflects bands, never calculates** (Doc-6D); **M4 never mutates** (Doc-6F). The four signals are computed **independently** — no cross-signal dependency in schema.
- **TR-CR3 — Scores auto-calculated under the System actor, NEVER hand-edited (Invariant #6).** `trust_scores`/`performance_scores`/`verified_financial_tiers` + their histories are written **only** by the System scoring engine (service, `SECURITY DEFINER`); **no user/admin write path**; `created_by`/`updated_by` = the System actor. RLS grants **no** user/tenant write to a score; reads are platform-internal (admin/System) — the **public band is M2's reflected read-model**, never a public read of a `trust` table.
- **TR-CR4 — The firewall (binding — Invariant #6).** Financial Tier **never** raises Trust Score; Financial Tier does **not** affect Performance Score; **Buyer Vendor Status (M4) never enters** any M5 computation; no secondary signal dominates trust. Each score table is **independent** (no cross-score FK, no computed-from-another-score column); the formula inputs are `performance_inputs` + verification facts, never another platform score.
- **TR-CR5 — Freeze state + band-public-unless-frozen.** `trust_scores`/`performance_scores` carry `freeze_state(none/frozen)` + `freeze_reason`/`frozen_at`; a **frozen** score is excluded from the M2 reflected public band + matching (the freeze is reflected via the score event). "Band public unless frozen" is realized by M2's event-gated reflection, not a public policy on the `trust` row.
- **TR-CR6 — Verification §5.6 + "Admin decides, Trust owns."** `verification_records.state` §5.6 (`requested/in_review/approved/rejected/expired/revoked`); `verification_decisions` append-only (`decided_by` staff; `verification_task_id` → M8 — **Admin makes the decision via `admin.verification_tasks`; Trust stores the record + decision**). `verified_financial_tiers.status`(`pending_verification/verified/suspended/expired`, 24-month review) + **emits `VendorTierChanged`** (consumed by M2 `financial_tier_history`). `Declared`-only = **absence** of a verified-tier row (one authoritative source).
- **TR-CR7 — `performance_inputs` = idempotent consumer of Operations events.** Append-only (corrections audited); `input_type(response/decline/non_response/delivery/feedback/dispute/completion)`; **only delivered invitations** generate `response`/`non_response`; `delivery`/`feedback`/`dispute`/`completion` written by Trust as an **idempotent consumer** of the M4 events (`DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`). `performance_scores.min_threshold_met` (5 responses OR 2 projects) gates `score` (NULL = Not Rated).
- **TR-CR8 — Reviews + Admin Ratings.** `public_reviews`: **post-award only** (engagement ref required, service-validated); `status(submitted/approved/published/rejected/removed)` moderation; author org writes; **public read when `published`**; **published reviews feed `performance_inputs` (Buyer Feedback) within Trust**; **Marketplace displays via service — never table access**. `admin_ratings`: **internal only — never public, never tenant-visible** (platform-staff only; like M4's blacklist but platform-internal).
- **TR-CR9 — Polymorphic subjects (bare UUID + type, no FK).** `verification_records.subject_id`+`subject_type`(vendor_profile/organization/capacity/declared_tier); `fraud_signals.subject_id`+`subject_type`; `performance_inputs.source_entity_id`+`source_type`(invitation/quotation/engagement/wcc) — all bare-UUID + discriminator, **no FK** (cross-module + polymorphic).
- **TR-CR10 — POLICY: registered (Doc-3 v1.3); `[ESC-6-POLICY]` CLEARED.** 2 `trust.*` keys; read from `core.system_configuration`, never literals.
- **TR-CR11 — Append-only + status-tracked + score uniqueness.** Histories/`performance_inputs`/`verification_decisions` append-only (immutable); `trust_scores`/`performance_scores` `UNIQUE(vendor_profile_id)`; `verified_financial_tiers` `UNIQUE(vendor_profile_id)` partial; score updates = update head + append history snapshot (System).
- **TR-CR12 — No `human_ref`; events; indexing.** **No `human_ref` carrier** (Doc-2 §10.6 declares none — CHK-6-002 N/A). Emits `VendorVerified` (→ M2 claim_state) + `VendorTierChanged` (→ M2 tier history). Cursor indexes (Band H); current/UNIQUE indexes; partial `WHERE deleted_at IS NULL` (only SD tables: `admin_ratings`/`public_reviews`). Carried: DD-MKT (band reflection), DD-OPS (performance event inputs), DD-ADMIN (verification tasks/decisions), **`[ESC-TRUST-AUDIT]`** (score/verification audit actions vs Doc-2 §9 — confirm at content).

## The `trust` schema partition (the structural spine)

| Doc-2 §10.6 table | Grouping | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `verification_records` | Verification | platform-internal (admin/System) | NO | **§5.6** | §3.1 |
| `verification_decisions` | ↳ | platform-internal | NO (append-only) | `decision` | §3.1 |
| `verified_financial_tiers` | ↳ | platform; **band/badge public via M2 reflection** | NO (status) | `status` | §3.1 |
| `trust_scores` | Trust Score | platform-internal; **System-written**; band via M2 | NO | `freeze_state` | §3.2 |
| `trust_score_history` | ↳ | platform-internal | NO (append-only) | — | §3.2 |
| `performance_scores` | Performance | platform-internal; **System-written**; band via M2 | NO | `freeze_state` | §3.3 |
| `performance_score_history` | ↳ | platform-internal | NO (append-only) | — | §3.3 |
| `performance_inputs` | ↳ | platform-internal | NO (append-only; corrections audited) | `input_type` | §3.3 |
| `fraud_signals` | Fraud | platform-internal | NO | `state` | §3.4 |
| `admin_ratings` | Reviews | **internal only — never public/tenant** | YES | — | §3.5 |
| `public_reviews` | ↳ | author-org write; **public read when published** | YES (removed=hidden) | `status` | §3.5 |

---

## §0 — Document Control, Precedence & Conformance Obligation
Precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4G → Doc-6A → Doc-6B/6C/6D/6E/6F → **Doc-6G** → Code); realize-never-redecide; pass Doc-6A Appendix A; flag-and-halt. Carried: DD-MKT/OPS/ADMIN, `[ESC-TRUST-AUDIT]`; `[ESC-6-POLICY]` CLEARED (v1.3). **Deps:** `Doc-6A §0/§13`; `Doc-2 §10.6`; `Doc-4G`.

## §1 — Scope & the `trust` Table Partition
Governs 11 tables / not (vendor profile/bands display = M2; matching = M3; CRM/blacklist = M4; verification *decision* = M8 — by UUID/event/service). The signal-firewall (#6), System-actor-write, Admin-decides-Trust-owns. **Deps:** `Doc-2 §2/§10.6`; `Doc-4G`; `Doc-6A §1`.

## §2 — Tenancy, Firewall & System-Actor RLS Model *(load-bearing)*
Classes: **platform-internal** (verification/scores/history/inputs/fraud/admin_ratings — admin/System read; **System-only write** for scores); **author-write/public-read** (`public_reviews` when `published`). The **public band is M2's reflected read-model** (event-driven), never a public `trust` read. **Firewall (#6):** no cross-signal dependency; Buyer Vendor Status never enters; scores never hand-edited (System actor). `admin_ratings` strictly internal (never tenant/public). RLS = backstop; authz app-layer (Doc-4G). Tests = Doc-8. **Deps:** `Doc-2 §6/§10.6`; `Doc-6A §4`; `Doc-4G`.

## §3 — Per-Aggregate Realization
§3.1 Verification (§5.6; Admin-decides/Trust-owns; verified-tier emits `VendorTierChanged`) · §3.2 Trust Score (System-written; freeze; history snapshots; emits `VendorVerified`/score events) · §3.3 Performance Score (System-written; `performance_inputs` idempotent Operations consumer; min-threshold gate; history) · §3.4 Fraud (`fraud_signals`) · §3.5 Reviews (`public_reviews` post-award + moderation + feeds performance; `admin_ratings` internal-only). **Deps:** `Doc-2 §5.6/§10.6`; `Doc-4G`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3/§4`.

## §4 — State Machine Realization
`verification_records.state` §5.6 · `verified_financial_tiers.status` · `trust_scores`/`performance_scores.freeze_state` · `fraud_signals.state` · `public_reviews.status`; enum + CHECK; service/System/event transitions; verified-tier status change emits `VendorTierChanged`; verification approval emits `VendorVerified`; transitions → `core.outbox_events` (Doc-2 §8). **Deps:** `Doc-2 §5.6/§8/§10.6`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-MKT/OPS/ADMIN)
Bare-UUID + service + event: M5 **emits** `VendorVerified`/`VendorTierChanged` (M2 reflects); **consumes** M4 Operations events into `performance_inputs`; **consumes** M8 verification-task decisions (Admin decides). **Firewall (#6):** no platform score reads another; Buyer Vendor Status (M4) never enters; the public band is M2's reflected read-model. No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8`; `Doc-4G`; `Doc-4L`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for Doc-5G lists; `UNIQUE(vendor_profile_id)` on scores; `verified_financial_tiers` UNIQUE partial; current/history indexes; `performance_inputs` by (vendor_profile_id, input_type, occurred_at); partial `WHERE deleted_at IS NULL` (SD tables); page-size via `trust.*` POLICY. **Deps:** `Doc-5G`; `Doc-6A §10/§12`; `Doc-3 v1.3`.

## §7 — POLICY & Migration
Forward-only migration (schema → enums → verification → verified_tiers → trust_scores/history → performance_scores/history/inputs → fraud → admin_ratings → public_reviews → indexes → triggers → RLS); POLICY = Doc-3 v1.3 (CLEARED). **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.3`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (Band C firewall/System-actor/internal-only; Band D append-only histories/decisions/inputs; Band E score/verification events; CHK-6-002 N/A no human_ref); carried register (DD-MKT/OPS/ADMIN, `[ESC-TRUST-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.6`.

## Appendix A — Doc-6G Conformance Attestation map (Doc-6A `CHK-6-001…093`)
Highlights: **Band C PASS** (platform-internal + System-only score writes + `admin_ratings` never-tenant; `public_reviews` published-public; the public band = M2 reflection, not a public `trust` read; CHK-6-020/022/023) · Band D PASS (append-only histories/`performance_inputs`/`verification_decisions`; scores status-tracked under System) · Band E PASS (CHK-6-040 verification/tier/score transitions+outbox; CHK-6-041 `VendorVerified`/`VendorTierChanged` Doc-2 §8/4L; `[ESC-TRUST-AUDIT]` at 043) · **CHK-6-002 N/A** (no human_ref in §10.6) · CHK-6-005 PASS (score UNIQUE; verified-tier partial-unique). **Deps:** `Doc-6A Appendix A`; `Doc-5G`.

---

## Open Carried Items
| ID | Item | Doc-6G handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-STATE / DR-6-API | core consumed / machines / Doc-5G persistable | by pointer / enum+CHECK+service-event / Band H | No |
| DD-MKT / DD-OPS / DD-ADMIN | band reflection / performance event inputs / verification tasks | emit/consume events; service; no authority | No |
| **Invariant #6 firewall (authoritative side)** | the four signals, independent; System-written; no cross-mutation | no cross-score dependency; no user write; Buyer Status never enters | **Load-bearing** |
| **`[ESC-TRUST-AUDIT]`** | score/verification audit actions vs Doc-2 §9 | bind nearest §9 by pointer; none invented | No (content: bind) |
| `[ESC-6-POLICY]` | `trust.*` keys | **CLEARED** — Doc-3 v1.3 | No |
| `[ESC-6-SCHEMA]`/`[ESC-6-API]` | physical/Doc-5G gap | none expected | Possible (none expected) |

## Fences / Out of scope
Any non-`trust` table · vendor profile/band display (M2) · matching (M3) · CRM/blacklist (M4) · verification *decision* authority (M8 decides; Trust stores) · coining any element · a cross-schema FK · cross-schema RLS traversal · **a hand-edited score** (System actor only) · **one platform score computed from another** (firewall) · **Buyer Vendor Status entering an M5 computation** · a public read of a raw `trust` score table · DDL/Prisma/migration bodies (content passes).

---

## Review Disposition (Independent Hard Review — Structure)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Field-traced to Doc-2 §10.6/§5.6/§6. Verified CORRECT: 11-table set, §5.6 verification state verbatim, verified-tier/fraud/public-review status sets verbatim, the firewall (no cross-signal dependency), `admin_ratings` internal-only, `public_reviews` post-award/published-public, performance-inputs idempotent-consumer set, polymorphic subjects, the 2 `trust.*` keys (Doc-3 v1.3), no human_ref (CHK-6-002 N/A), coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **TR-HR-1** "band public unless frozen" risked a public read policy on the raw `trust_scores`/`performance_scores` row | MAJOR | **FIXED** — TR-CR3/CR5/§2: the public **band** is **M2's reflected read-model** (event-driven), **never** a public read of a `trust` table; M5 is platform-internal; the raw score never leaves M5. |
| **TR-HR-2** System-actor-only score write not made a binding RLS/ownership rule | MAJOR | **FIXED** — TR-CR3: scores/histories/verified-tier **System-written only** (`SECURITY DEFINER` service); no user/admin write policy; `created_by/updated_by` = System; never hand-edited (Invariant #6). |
| **TR-HR-3** firewall could be read as advisory | MINOR | **FIXED** — TR-CR4: binding — no cross-score FK/computed column; Buyer Vendor Status never enters; each signal independent. |
| **TR-HR-4** verification subject visibility to the vendor | MINOR | **CONFIRMED via M2/service** — verification status reaches the vendor through M2's reflected `verified_fields_jsonb` (Doc-6D), not a direct `trust` read; `verification_records` platform-internal. |
| **TR-HR-5** score/verification audit actions vs Doc-2 §9 | NIT | **CONFIRMED carried** — `[ESC-TRUST-AUDIT]`; bind nearest §9 by pointer; none invented. |

**Net:** 2 MAJOR (public-band-via-reflection-not-public-read, System-actor-only writes) + 2 MINOR + 1 NIT fixed/confirmed. The public-band finding is load-bearing — the raw score must never be publicly readable; only M2's reflected band is public. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6G Structure Proposal v0.1 (effective v0.2 — Independent Hard Review applied). For Structure Freeze Audit → FROZEN. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6G realizes the 11 `trust` tables verbatim from Doc-2 §10.6 against frozen Doc-6A — the governance-signal owner (the firewall's authoritative side); scores System-written never hand-edited; the public band is M2's reflection; Admin decides, Trust owns; coins nothing. Next: Structure Freeze Audit.*
