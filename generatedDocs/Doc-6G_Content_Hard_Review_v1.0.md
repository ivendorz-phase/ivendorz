# Doc-6G — M5 Trust (`trust`) Schema Realization — **Content Hard Review v1.0** (cross-pass, full §0–§8 + Appendix A)

| Field | Value |
|---|---|
| Reviewer | iVendorz **Virtual CTO & Architecture Board** — independent of the pass authors |
| Target | `Doc-6G_Content_v1.0_Pass1/2/3.md` (11 tables; §0–§8 + Appendix A) **read together** |
| Review type | **Cross-pass Content Hard Review** — the integration-seam gate (the **firewall** end-to-end, the **System-actor-write** consistency, immutability vs the *actual* Doc-6B §4 body, the public-band-via-reflection rule) |
| Basis | `Doc-2 v1.0.3 §10.6/§5.6/§6`; `Doc-6A` (Appendix A); **`Doc-6B §4`**; Doc-6D (band reflection) / Doc-6F (Operations inputs); Doc-3 v1.3 |
| Verdict | **1 MAJOR found + FIXED; 0 BLOCKER; 2 MINOR/NIT confirmed.** Firewall + System-actor-write verified end-to-end. **Ready for Content Freeze Audit.** |

> **Method note.** Verified (a) the **Invariant-#6 firewall** across all 11 tables (no cross-signal column/FK; no Buyer-Vendor-Status ingress), (b) the **System-actor-write** rule (no in-band write policy on any score table), (c) the **public-band-via-M2-reflection** rule (no public raw-score read), and (d) every immutability attachment vs the actual Doc-6B §4 body. One consistency gap (`verified_financial_tiers` immutability) found and fixed.

---

## 1 — Coverage (11/11)
| Pass | Tables | n |
|---|---|---|
| Pass-1 | verification_records · verification_decisions · verified_financial_tiers | 3 |
| Pass-2 | trust_scores · trust_score_history · performance_scores · performance_score_history · performance_inputs | 5 |
| Pass-3 | fraud_signals · admin_ratings · public_reviews | 3 |
| **Total** | = **Doc-2 §10.6 exactly** | **11** |

No 12th; none missing. **PASS.**

---

## 2 — Headline verifications

### The firewall (Invariant #6 — the authoritative side)
Traced all 11 tables: **no platform score has a column computed from another, and no cross-score FK exists.** `trust_scores` carries no Performance/Tier column; `performance_scores.components_jsonb` holds performance inputs only (no Tier/Trust); `verified_financial_tiers` is independent. **No `buyer_vendor_status` / Buyer-Vendor-Status reference anywhere** — M4's private signal never enters an M5 table or computation. The four signals are computed independently. **PASS.**

### System-actor-write (scores never hand-edited)
`verified_financial_tiers`, `trust_scores`, `performance_scores`, and both histories + `performance_inputs` have **no `FOR INSERT/UPDATE/DELETE` policy** — admin gets read-only; the System scoring service (owner-role/`SECURITY DEFINER`) is the sole writer. **Verified: there is no in-band path for an admin/user to hand-edit a score.** `created_by/updated_by` = System actor. **PASS.**

### Public band via M2 reflection
**No raw `trust` score table has a public read policy.** The only public read in M5 is `public_reviews` (when `published`). The 0–100 score never leaves M5; the public band is M2's reflected `vendor_matching_attributes` (event-driven). `admin_ratings` is staff-only (never public/tenant). **PASS (CHK-6-022 in-scope).**

---

## 3 — Findings

### MAJOR HR-G1 — `verified_financial_tiers` missing the identity-immutability trigger
**Where:** Pass-1 §3.1.3. **Defect:** `trust_scores` and `performance_scores` (Pass-2) each got a column-scoped trigger freezing `id`/`vendor_profile_id`/`created_at`/`created_by`; `verified_financial_tiers` — the third System-written score-class table — had **none**, so a buggy service write could drift its `vendor_profile_id` or hard-DELETE it (it is NO-SD).
**Fix (applied):** added the identical column-scoped trigger via `core.raise_immutable_violation` (`id`/`vendor_profile_id`/`created_at`/`created_by` frozen; `status`/`tier`/`verified_at`/`next_review_at`/`basis_jsonb` mutable by System; DELETE blocked). Now all three System-written tables are consistent. **VERIFIED** against Doc-6B §4.

### MINOR HR-G2 — `band`/`level`/`signal_type`/`severity`/`subject_type` as `text`
Confirmed **correct (not coined)** — Doc-2 §10.6 names these columns but enumerates **no values**; realized as `text` rather than inventing an enum. §2.5-attributed.

### NIT HR-G3 — `score_freeze_state` reused by both score tables
Confirmed **correct** — one module-owned enum (`trust.score_freeze_state`) defined once (Pass-2 §3.2.1) and reused by `performance_scores`; intra-module reuse, defined before use; §7 creates enums first.

---

## 4 — Cross-pass integration checks (PASS)

| Seam | Result |
|---|---|
| **Immutability vs Doc-6B §4** | `verification_decisions`/histories/`performance_inputs` full append-only (all cols); `verification_records`/`trust_scores`/`performance_scores`/`verified_financial_tiers` [HR-G1] column-scoped (identity frozen, System fields mutable); all pass protected-col `TG_ARGV`; no PERFORM-of-trigger-fn; no empty-args UPDATE-open | PASS |
| **Enum singletons** | each `CREATE TYPE trust.*` once; `score_freeze_state` reused intra-module; §7 enums-first | PASS |
| **Idempotent inputs** | `performance_inputs UNIQUE(source_type, source_entity_id, input_type)` — replay-safe consumer | PASS |
| **Events** | `VendorVerified` (verification approve) + `VendorTierChanged` (verified-tier change) + score-band reflection bound to Doc-2 §8/Doc-4L; none coined; M2 reflects | PASS |
| **No human_ref / no money** | CHK-6-002 N/A (none in §10.6); CHK-6-050 N/A (no monetary column) — both justified | PASS |
| **`public_reviews` → performance** | a `published` review feeds a `feedback` `performance_input` **within Trust** (same-module service), not a cross-module event; M2 displays via service | PASS |
| **Coin-nothing** | nothing coined; `trust.financial_tier` module-owned (not a cross-schema ref); `[ESC-TRUST-AUDIT]` carried | PASS |
| **Appendix A** | 37/37 (Pass-3); N/A 002/033/050/062 justified; 043 PASS-with-carry; 022 in-scope PASS | PASS |

---

## 5 — Decision

**1 MAJOR found + FIXED (`verified_financial_tiers` identity immutability); 0 BLOCKER; 2 MINOR/NIT confirmed-by-design.** The gate caught a real consistency gap (one of three System-written tables lacked the identity guard) and verified the three load-bearing properties — the firewall (independent signals, no Buyer-Vendor-Status ingress), System-actor-write (no in-band hand-edit), and public-band-via-reflection (no public raw-score read) — end-to-end. Coverage 11/11; immutability correct vs Doc-6B §4.

**Authorized next step:** **Content Freeze Audit** → `Doc-6G_SERIES_FROZEN_v1.0` → fold corpus. **Carried:** `[ESC-TRUST-AUDIT]`.

---

*End of Doc-6G Content Hard Review v1.0 (cross-pass). 1 MAJOR (`verified_financial_tiers` immutability) found + FIXED; firewall + System-actor-write + public-band-via-reflection verified end-to-end; immutability matches Doc-6B §4; coverage 11/11. On any conflict, Doc-2 and Doc-6A win; flag-and-halt. Next: Content Freeze Audit → `Doc-6G_SERIES_FROZEN`.*
