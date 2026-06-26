# Doc-6G — M5 Trust & Verification (`trust`) Schema Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-6G Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | **M5 — Trust & Verification** (`trust` schema) — the **governance-signal OWNER** (the firewall's authoritative side: Trust Score · Performance Score · verified Financial Tier · Capacity verification); scores **System-written, never hand-edited**; **Admin decides, Trust owns** |
| Realizes | **Doc-2 §10.6** — **11 tables / 5 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A 37/37); **Doc-2 v1.0.3 = binding *what*-authority**; consistent-with Doc-5G; consumes Doc-6B (`core`) + Doc-6C/6D/6E/6F (UUID + event) |
| Freeze evidence | `Doc-6G_Content_Freeze_Audit_v1.0.md` — PASS; 0 open BLOCKER/MAJOR/MINOR; 7 phases PASS. Cross-pass `Doc-6G_Content_Hard_Review_v1.0.md` — 1 MAJOR (verified-tier immutability) fixed; firewall + System-actor-write verified end-to-end |

---

## Effective set (the authoritative Doc-6G)

| Artifact | Role |
|---|---|
| `Doc-6G_Structure_v1.0_FROZEN.md` | Frozen structure — TR-CR1–CR12, 11-table partition, firewall + System-actor-write model, state machines, Appendix-A map |
| `Doc-6G_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-6G_Content_v1.0_Pass1.md` | §0–§2 firewall/System-actor model · Verification (§5.6; Admin-decides/Trust-owns; verified-tier emits `VendorTierChanged`) |
| `Doc-6G_Content_v1.0_Pass2.md` | Trust + Performance scores (System-written, no write policy; freeze; histories; idempotent `performance_inputs`; firewall) |
| `Doc-6G_Content_v1.0_Pass3.md` | Fraud · Reviews (`public_reviews` post-award + feeds performance; `admin_ratings` internal-only) · §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A (37/37, 0 FAIL) |
| `Doc-6G_Content_Hard_Review_v1.0.md` | Cross-pass review — HR-G1 `verified_financial_tiers` immutability fixed; firewall + System-actor-write + public-band-via-reflection verified end-to-end |
| `Doc-6G_Content_Freeze_Audit_v1.0.md` | Content freeze certification (PASS) |

---

## What Doc-6G realizes (the `trust` schema)

- **11 tables / 5 groupings** (Doc-2 §10.6), columns verbatim: Verification (+decisions/verified-tier), Trust Score (+history), Performance Score (+history/inputs), Fraud, Reviews (+admin-ratings).
- **The governance-signal owner — the firewall's authoritative side** (Invariant #6) — Trust/Performance/verified-Tier/Capacity-verification owned + computed **independently**; **no platform score computed from another, no cross-score FK; Buyer Vendor Status (M4) never enters**. M2 reflects bands (never calculates); M4 never mutates.
- **Scores System-written, never hand-edited** — `trust_scores`/`performance_scores`/`verified_financial_tiers` + histories have **no in-band write policy** (admin read-only); the System scoring service (owner-role/`SECURITY DEFINER`) is the sole writer; `created_by/updated_by` = System actor.
- **The public band is M2's reflected read-model** — **no public read policy on any raw `trust` score table**; the 0–100 score never leaves M5; freeze-state excludes a score from the reflected band. `admin_ratings` is **staff-only — never public/tenant**.
- **Admin decides, Trust owns** — `verification_decisions` reference M8 `verification_tasks` (`verification_task_id`); Admin makes the decision, Trust stores the authoritative record + drives `verification_records.state` (§5.6).
- **`verified_financial_tiers` emits `VendorTierChanged`** (→ M2 `financial_tier_history`); `Declared`-only = **absence** of a row. **`performance_inputs`** = idempotent consumer of M4 Operations events (`UNIQUE(source_type, source_entity_id, input_type)`); only delivered invitations → response/non_response; `min_threshold_met` gates the NULLABLE score (Not Rated).
- **`public_reviews`** post-award only (engagement ref, service-validated); moderation `status`; public read when `published`; a published review feeds a `feedback` `performance_input` **within Trust** (same-module service); M2 displays via service (never table read).
- **Immutability** — append-only histories/`performance_inputs`/`verification_decisions`; column-scoped `verification_records`/`trust_scores`/`performance_scores`/`verified_financial_tiers` (identity frozen, System fields mutable) — via `core.raise_immutable_violation` (Doc-6B §4).
- **No `human_ref`** (Doc-2 §10.6 declares none — CHK-6-002 N/A); module-owned `trust.financial_tier` (no cross-schema enum ref); cross-module = bare UUID; coins nothing.

## Carried items

`DR-6-CORE` (consumed) · `DR-6-STATE` (machines) · `DR-6-API` (Doc-5G Band H) · DD-MKT/OPS/ADMIN · **Invariant #6 firewall** (realized — authoritative side: independent signals, System-written, no Buyer-Vendor-Status ingress, public band via M2 reflection) · **`[ESC-TRUST-AUDIT]`** (score/verification audit actions vs Doc-2 §9 — bind nearest by pointer) · `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.3). Carry-forward to **Doc-8**: RLS positive/negative/cross-tenant + the System-actor-write negative test + internal-signal non-disclosure (Doc-6A §11.5) — schema satisfiable.

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (2 MAJOR — public-band-via-reflection + System-actor-only writes) → v0.2 → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1/2/3 each per-pass-reviewed (verified-tier public leak, no-hand-edit, cross-schema enum, decision immutability, score-write policy, firewall, input idempotency, history immutability, admin_ratings leak, post-award gate, feed-within-Trust) · **cross-pass Content Hard Review** (**HR-G1** — `verified_financial_tiers` missing identity-immutability trigger — found + fixed; firewall + System-actor-write verified end-to-end) · Content Freeze Audit (PASS).

---

*Doc-6G (M5 `trust` schema) is FROZEN. Realizes Doc-2 §10.6's 11 tables on PostgreSQL/Supabase + Prisma `multiSchema` against frozen Doc-6A — the governance-signal owner (the firewall's authoritative side); four signals computed independently; scores System-written never hand-edited (no in-band write policy); the public band is M2's reflection (no public raw-score read); Admin decides, Trust owns; coins nothing. Carried: Invariant #6 firewall (realized) + `[ESC-TRUST-AUDIT]`. On any conflict with Doc-2/Doc-6A or the frozen corpus, the frozen corpus wins; flag-and-halt. Next: Doc-6H (M6 `communication`) — chat/threads/notifications/delivery logs (delivery-only; append-only).*
