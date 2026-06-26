# Doc-6G — M5 Trust & Verification (`trust`) Schema Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents + ratified decisions for the `trust` schema realization |
| Freeze Date | 2026-06-26 |
| Supersedes | `Doc-6G_Structure_Proposal_v0.1.md` (effective v0.2 — Independent Hard Review applied, 2 MAJOR + 2 MINOR + 1 NIT; history retained there). Certified by `Doc-6G_Structure_Freeze_Audit_v1.0.md` |
| Module | **M5 — Trust & Verification** (`trust` schema). **The governance-signal OWNER** — the firewall's authoritative side (Trust Score · Performance Score · verified Financial Tier · Capacity verification). M2 reflects; M4 never mutates. **Scores System-written, never hand-edited** |
| Realizes | **Doc-2 §10.6** — **11 tables / 5 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4G (consumed); Doc-3 v1.3 (`trust.*` POLICY — registered, 2 keys); Doc-6B (`core`); Doc-6C/6D/6E/6F (UUID + event); Doc-4L/4M |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.3), Doc-4A v1.0, Doc-4G v1.0 (FROZEN), Doc-4L/4M, Doc-6A/6B/6C/6D/6E/6F v1.0 (FROZEN) |
| Contains | Structure only — section map, 11-table partition, ratified decisions (TR-CR1–CR12), signal-firewall + System-actor-write model, state machines, carried DD, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | **Invariant #6** — owns four firewalled signals, computed **independently**; **Financial Tier never raises Trust; Financial Tier doesn't affect Performance; Buyer Vendor Status (M4) never enters; no secondary signal dominates trust**. Scores **System-written, never hand-edited**. The **public band is M2's reflected read-model** (event-driven) — M5 is platform-internal; the raw score never leaves M5. **Admin decides, Trust owns** (verification). RLS = backstop |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.6 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions ratified at structure freeze (TR-CR-set)

- **TR-CR1 — 11 tables / 5 groupings (Doc-2 §10.6), coin nothing.** Verification (`verification_records`+`verification_decisions`+`verified_financial_tiers`) · Trust Score (`trust_scores`+`trust_score_history`) · Performance Score (`performance_scores`+`performance_score_history`+`performance_inputs`) · Fraud (`fraud_signals`) · Reviews (`public_reviews`+`admin_ratings`). A 12th is non-conformant.
- **TR-CR2 — The governance-signal OWNER (Invariant #6).** Trust Score (0–100), Performance Score (0–100), verified Financial Tier (A–E), Capacity verification owned + computed here, **independently**. M2 reflects bands never calculates; M4 never mutates. No cross-signal dependency in schema.
- **TR-CR3 — Scores System-written, NEVER hand-edited (Invariant #6).** `trust_scores`/`performance_scores`/`verified_financial_tiers` + histories written **only** by the System scoring engine (`SECURITY DEFINER` service); **no user/admin write policy**; `created_by`/`updated_by` = System actor; reads platform-internal. **The public band is M2's reflected read-model**, never a public read of a `trust` table.
- **TR-CR4 — The firewall (binding — Invariant #6).** Financial Tier **never** raises Trust; Financial Tier does **not** affect Performance; **Buyer Vendor Status (M4) never enters**; no secondary signal dominates trust. Each score table independent (no cross-score FK / computed-from-another-score column); inputs = `performance_inputs` + verification facts, never another platform score.
- **TR-CR5 — Freeze state + band-public-unless-frozen.** `trust_scores`/`performance_scores` carry `freeze_state(none/frozen)`+`freeze_reason`/`frozen_at`; a frozen score is excluded from the M2 reflected band + matching (reflected via the score event). "Band public unless frozen" = M2's event-gated reflection, not a public `trust` policy.
- **TR-CR6 — Verification §5.6 + "Admin decides, Trust owns."** `verification_records.state` §5.6 (`requested/in_review/approved/rejected/expired/revoked`); `verification_decisions` append-only (`decided_by` staff; `verification_task_id` → M8 — Admin decides via `admin.verification_tasks`, Trust stores). `verified_financial_tiers.status`(`pending_verification/verified/suspended/expired`, 24-month review) + **emits `VendorTierChanged`** (M2 reflects). `Declared`-only = **absence** of a verified-tier row.
- **TR-CR7 — `performance_inputs` = idempotent Operations consumer.** Append-only (corrections audited); `input_type(response/decline/non_response/delivery/feedback/dispute/completion)`; only delivered invitations → `response`/`non_response`; `delivery`/`feedback`/`dispute`/`completion` written as an idempotent consumer of M4 events (`DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`). `performance_scores.min_threshold_met` (5 responses OR 2 projects) gates `score` (NULL = Not Rated).
- **TR-CR8 — Reviews + Admin Ratings.** `public_reviews`: post-award only (engagement ref, service-validated); `status(submitted/approved/published/rejected/removed)`; author org writes; **public read when `published`**; **published feed `performance_inputs` (Buyer Feedback) within Trust**; **Marketplace displays via service — never table access**. `admin_ratings`: **internal only — never public, never tenant-visible**.
- **TR-CR9 — Polymorphic subjects (bare UUID + type, no FK).** `verification_records.subject_id`+`subject_type`; `fraud_signals.subject_id`+`subject_type`; `performance_inputs.source_entity_id`+`source_type` — bare-UUID + discriminator, no FK.
- **TR-CR10 — POLICY: registered (Doc-3 v1.3); `[ESC-6-POLICY]` CLEARED.** 2 `trust.*` keys; read from `core.system_configuration`.
- **TR-CR11 — Append-only + status-tracked + score uniqueness.** Histories/`performance_inputs`/`verification_decisions` append-only (immutable); `trust_scores`/`performance_scores` `UNIQUE(vendor_profile_id)`; `verified_financial_tiers` partial-unique; score update = update head (System) + append history snapshot.
- **TR-CR12 — No `human_ref`; events; indexing.** No human_ref (Doc-2 §10.6 declares none — CHK-6-002 N/A). Emits `VendorVerified` + `VendorTierChanged`. Cursor/UNIQUE/current indexes; partial `WHERE deleted_at IS NULL` (SD: `admin_ratings`/`public_reviews`). Carried: DD-MKT/OPS/ADMIN, **`[ESC-TRUST-AUDIT]`**.

## The `trust` schema partition (the structural spine)

| Doc-2 §10.6 table | Grouping | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `verification_records` | Verification | platform-internal (admin/System) | NO | **§5.6** | §3.1 |
| `verification_decisions` | ↳ | platform-internal | NO (append-only) | `decision` | §3.1 |
| `verified_financial_tiers` | ↳ | platform; band/badge via M2 reflection | NO (status) | `status` | §3.1 |
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
Governs 11 tables / not (vendor profile/bands display = M2; matching = M3; CRM/blacklist = M4; verification *decision* = M8 — by UUID/event/service). Signal-firewall (#6), System-actor-write, Admin-decides-Trust-owns. **Deps:** `Doc-2 §2/§10.6`; `Doc-4G`; `Doc-6A §1`.

## §2 — Tenancy, Firewall & System-Actor RLS Model *(load-bearing)*
Classes: platform-internal (verification/scores/history/inputs/fraud/admin_ratings — admin/System read; System-only write for scores); author-write/public-read (`public_reviews` published). Public band = M2 reflection (event-driven), not a public `trust` read. Firewall (#6): no cross-signal dependency; Buyer Vendor Status never enters; scores never hand-edited (System actor). `admin_ratings` strictly internal. RLS = backstop; authz app-layer (Doc-4G). Tests = Doc-8. **Deps:** `Doc-2 §6/§10.6`; `Doc-6A §4`; `Doc-4G`.

## §3 — Per-Aggregate Realization
§3.1 Verification (§5.6; Admin-decides/Trust-owns; verified-tier emits `VendorTierChanged`) · §3.2 Trust Score (System-written; freeze; history; emits `VendorVerified`/score events) · §3.3 Performance Score (System-written; `performance_inputs` idempotent Operations consumer; min-threshold gate; history) · §3.4 Fraud · §3.5 Reviews (`public_reviews` post-award + moderation + feeds performance; `admin_ratings` internal-only). **Deps:** `Doc-2 §5.6/§10.6`; `Doc-4G`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3/§4`.

## §4 — State Machine Realization
`verification_records.state` §5.6 · `verified_financial_tiers.status` · `trust_scores`/`performance_scores.freeze_state` · `fraud_signals.state` · `public_reviews.status`; enum + CHECK; service/System/event transitions; verified-tier change emits `VendorTierChanged`; verification approval emits `VendorVerified`; transitions → `core.outbox_events` (Doc-2 §8). **Deps:** `Doc-2 §5.6/§8/§10.6`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-MKT/OPS/ADMIN)
Bare-UUID + service + event: M5 emits `VendorVerified`/`VendorTierChanged` (M2 reflects); consumes M4 Operations events into `performance_inputs`; consumes M8 verification-task decisions. Firewall (#6): no platform score reads another; Buyer Vendor Status never enters; public band = M2 reflection. No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8`; `Doc-4G`; `Doc-4L`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H); `UNIQUE(vendor_profile_id)` scores; `verified_financial_tiers` partial-unique; current/history indexes; `performance_inputs(vendor_profile_id, input_type, occurred_at)`; partial `WHERE deleted_at IS NULL` (SD tables); page-size via `trust.*` POLICY. **Deps:** `Doc-5G`; `Doc-6A §10/§12`; `Doc-3 v1.3`.

## §7 — POLICY & Migration
Forward-only migration (schema → enums → verification → verified_tiers → trust_scores/history → performance_scores/history/inputs → fraud → admin_ratings → public_reviews → indexes → triggers → RLS); POLICY = Doc-3 v1.3 (CLEARED). **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.3`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (Band C firewall/System-actor/internal-only; Band D append-only; Band E score/verification events; CHK-6-002 N/A no human_ref); carried register (DD-MKT/OPS/ADMIN, `[ESC-TRUST-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.6`.

## Appendix A — Doc-6G Conformance Attestation (Doc-6A `CHK-6-001…093`)
Highlights: **Band C PASS** (platform-internal + System-only score writes + `admin_ratings` never-tenant; `public_reviews` published-public; public band = M2 reflection; CHK-6-020/022/023) · Band D PASS (append-only histories/`performance_inputs`/`verification_decisions`; scores under System) · Band E PASS (CHK-6-040 transitions+outbox; CHK-6-041 `VendorVerified`/`VendorTierChanged`; `[ESC-TRUST-AUDIT]` at 043) · **CHK-6-002 N/A** (no human_ref) · CHK-6-005 PASS (score UNIQUE; verified-tier partial-unique) · CHK-6-050 N/A (no monetary column). **Deps:** `Doc-6A Appendix A`; `Doc-5G`.

---

## Open Carried Items
| ID | Item | Doc-6G handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-STATE / DR-6-API | core consumed / machines / Doc-5G persistable | by pointer / enum+CHECK+service-event / Band H | No |
| DD-MKT / DD-OPS / DD-ADMIN | band reflection / performance event inputs / verification tasks | emit/consume events; service | No |
| **Invariant #6 firewall (authoritative side)** | four signals independent; System-written; no cross-mutation | no cross-score dependency; no user write; Buyer Status never enters | **Load-bearing** |
| **`[ESC-TRUST-AUDIT]`** | score/verification audit actions vs Doc-2 §9 | bind nearest §9 by pointer; none invented | No (content: bind) |
| `[ESC-6-POLICY]` | `trust.*` keys | **CLEARED** — Doc-3 v1.3 | No |
| `[ESC-6-SCHEMA]`/`[ESC-6-API]` | physical/Doc-5G gap | none expected | Possible (none expected) |

## Fences / Out of scope
Any non-`trust` table · vendor profile/band display (M2) · matching (M3) · CRM/blacklist (M4) · verification *decision* authority (M8) · coining any element · a cross-schema FK · cross-schema RLS traversal · **a hand-edited score** · **one platform score computed from another** · **Buyer Vendor Status entering an M5 computation** · a public read of a raw `trust` score table · DDL/Prisma/migration bodies (content passes).

---

*End of Doc-6G Canonical Structure v1.0 (FROZEN). Frozen 2026-06-26; supersedes the Proposal (v0.2, 2 MAJOR + 2 MINOR + 1 NIT applied); certified by `Doc-6G_Structure_Freeze_Audit_v1.0.md`. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6G realizes the 11 `trust` tables verbatim from Doc-2 §10.6 against frozen Doc-6A — the governance-signal owner (the firewall's authoritative side); four signals computed independently; scores System-written never hand-edited; the public band is M2's reflection; Admin decides, Trust owns; coins nothing. Carried: Invariant #6 firewall (load-bearing) + `[ESC-TRUST-AUDIT]`. Next: content passes → Content Hard Review → Content Freeze Audit → `Doc-6G_SERIES_FROZEN`.*
