# Doc-4G_PassA_Patch_v1.0.md

## Status

**Approved Pass-A Patch** — applies the Architecture-Board-approved corrections to `Doc-4G_PassA_Content_v1.0.md`. Surgical, contract-level patching only — no rewrite, no redesign.

| Field | Value |
|---|---|
| Applies to | `Doc-4G_PassA_Content_v1.0.md` |
| Produces | `Doc-4G_PassA_Content_v1.0` as amended by this patch (canonical input to Pass-A Freeze / Pass-B) |
| Review authority | `Doc-4G_PassA_Independent_Hard_Review_v0.1` |
| Board adjudication | **Mandatory:** F4G-PA-MA1, F4G-PA-M1, F4G-PA-M2. **Optional:** F4G-PA-N1 — applied. |
| Scope | §B.4 confirmed-slug inventory completion (MA1, M1); §G11 + Appendix D alignment (MA1); `trust.assign_verification.v1` dependency correction DG-1→DG-5 for `verification_task_id` (M2); freeze/reactivate event-attribution clarity (N1). |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G Structure FROZEN — all FROZEN |
| Application model | Additive amendment. Each item quotes the exact **Before** text present verbatim in the base and gives the **After**. Anchors verified verbatim against the base. |

This patch **introduces no aggregate, bounded context, event, permission slug, audit action, or POLICY key**. Both authority findings resolve via **Option A (confirmed in frozen Doc-2 §7)** — no slug invented, no ESC substitution needed. Ownership, aggregate boundaries, bounded contexts, the trust firewall, the procurement moat, event ownership, audit ownership, lifecycle ownership, and escalation markers are preserved unchanged.

---

# 1. Exact Changes

> Each change quotes the **Before** text exactly as it appears in `Doc-4G_PassA_Content_v1.0.md` and gives the **After**.

---

### F4G-PA-MA1 — §B.4 + §G11 + Appendix D — `can_submit_verification` slug authority

**Authority determination — Option A (confirmed).** `can_submit_verification` **is present in frozen Doc-2 §7** — Permission Mapping row "Ownership transfer / org delete / verification submission → Owner-only: `can_transfer_ownership`, `can_delete_organization`, `can_submit_verification`". It is a confirmed slug; **Option A applies** (add to the §B.4 confirmed inventory; align §G11 and Appendix D). No ESC-TRUST-SLUG escalation required for this slug; no slug invented.

#### F4G-PA-MA1·a — §B.4 confirmed-slug inventory

**Before:**

```
- **B.4 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** for tenant actions; **platform-staff slug** for §5.6 staff actions. **Slugs only** (§6.2), from the Doc-2 §7 catalog; **no slug invented**. Trust **consumes** Identity's `check_permission` and org/membership/active-org resolution and the platform-staff slugs (Doc-4C, FROZEN — DG-1); **no shadow authorization** implemented. The Doc-2 §7 Trust slugs are `staff_can_verify` (Verification Admin), `staff_can_ban` (ban/fraud), `can_submit_review` (buyer post-award review; engagement required). **Score computation runs under the System actor — no tenant slug** (scores are auto-calculated, never hand-edited; Doc-4A §5.2). Where a required staff action lacks a §7 slug, carry **`[ESC-TRUST-SLUG]`** (Doc-2 §7 additive channel; **no slug invented**).
```

**After:**

```
- **B.4 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** for tenant actions; **platform-staff slug** for §5.6 staff actions. **Slugs only** (§6.2), from the Doc-2 §7 catalog; **no slug invented**. Trust **consumes** Identity's `check_permission` and org/membership/active-org resolution and the platform-staff slugs (Doc-4C, FROZEN — DG-1); **no shadow authorization** implemented. **Confirmed Doc-2 §7 Trust-used slug inventory:** `can_submit_verification` (Owner-only — verification submission; Doc-2 §7 "Ownership transfer / org delete / verification submission" row), `can_submit_review` (buyer post-award review; engagement required), `staff_can_verify` (Verification Admin), `staff_can_ban` (ban/fraud), and `staff_super_admin` (platform-staff, "all; every action audited+flagged") for super-admin-scoped staff actions — all present in Doc-2 §7. **Score computation runs under the System actor — no tenant slug** (scores are auto-calculated, never hand-edited; Doc-4A §5.2). Where a required staff action lacks a §7 slug, carry **`[ESC-TRUST-SLUG]`** (Doc-2 §7 additive channel; **no slug invented**).
```

#### F4G-PA-MA1·b — §G11 Authorization Surface alignment

**Before:**

```
Tenant write actions check **Membership + Slug + Scope** (Doc-4A §6); platform-staff actions check a **platform-staff slug** (§5.6, no active-org context). Doc-2 §7 slugs used: `can_submit_verification` (verification submission, Owner-only), `can_submit_review` (post-award review, engagement required), `staff_can_verify` (verification decisions, verified-tier, review moderation/lifecycle, history reads, freeze governance), `staff_can_ban` (fraud triage, ban-driven revoke/freeze). **Score computation runs under the System actor — no tenant slug** (auto-calculated, never hand-edited, Doc-4A §5.2). Trust **consumes** Identity `check_permission` + active-org resolution (Doc-4C, FROZEN — DG-1); it implements no shadow authorization. Where a required staff action lacks a §7 slug (e.g., a dedicated review-moderation, score-freeze, or admin-rating slug), carry **`[ESC-TRUST-SLUG]`** — **no slug invented**.
```

**After:**

```
Tenant write actions check **Membership + Slug + Scope** (Doc-4A §6); platform-staff actions check a **platform-staff slug** (§5.6, no active-org context). **Confirmed Doc-2 §7 slugs used** (all present in §7; none invented): `can_submit_verification` (verification submission, Owner-only — Doc-2 §7 "verification submission" row), `can_submit_review` (post-award review, engagement required), `staff_can_verify` (verification decisions, verified-tier, review moderation/lifecycle, history reads, freeze governance), `staff_can_ban` (fraud triage, ban-driven revoke/freeze), `staff_super_admin` (super-admin-scoped staff actions, e.g. admin-rating set). **Score computation runs under the System actor — no tenant slug** (auto-calculated, never hand-edited, Doc-4A §5.2). Trust **consumes** Identity `check_permission` + active-org resolution (Doc-4C, FROZEN — DG-1); it implements no shadow authorization. Where a required staff action lacks a §7 slug (e.g., a dedicated review-moderation, score-freeze, or admin-rating slug not in §7), carry **`[ESC-TRUST-SLUG]`** — **no slug invented**.
```

#### F4G-PA-MA1·c — Appendix D Permissions row alignment

**Before:**

```
| Permissions | Doc-2 §7 (`can_submit_verification`, `can_submit_review`, `staff_can_verify`, `staff_can_ban`) |
```

**After:**

```
| Permissions | Doc-2 §7 — confirmed: `can_submit_verification` (Owner-only, "verification submission" row), `can_submit_review`, `staff_can_verify`, `staff_can_ban`, `staff_super_admin` (all present in §7; none invented) |
```

---

### F4G-PA-M1 — `trust.set_admin_rating.v1` — `staff_super_admin` slug authority

**Authority determination — Option A (confirmed).** `staff_super_admin` **is present in frozen Doc-2 §7** — Platform-staff slugs: "… `staff_super_admin` (all; every action audited+flagged)". It is a confirmed slug; **Option A applies** (confirmed via the authoritative §7 inventory, now reflected in §B.4 per MA1·a and §G11 per MA1·b). No ESC-TRUST-SLUG extension required for this slug; no slug invented. The contract's existing permission line already names `staff_super_admin` and retains its `[ESC-TRUST-SLUG]` carry for any *dedicated* admin-rating slug not in §7; that carry is correct and unchanged.

**Location:** `trust.set_admin_rating.v1` — Permission References.

**Before:**

```
- **Permission References:** Doc-2 §7 platform-staff (`staff_can_verify`/`staff_super_admin` per role seed); dedicated admin-rating slug → `[ESC-TRUST-SLUG]`.
```

**After:**

```
- **Permission References:** Doc-2 §7 platform-staff — confirmed `staff_can_verify` and `staff_super_admin` (both present in §7; `staff_super_admin` = "all; every action audited+flagged"); a *dedicated* admin-rating slug is not in §7 → carry `[ESC-TRUST-SLUG]` for that case only (no slug invented).
```

---

### F4G-PA-M2 — `trust.assign_verification.v1` — `verification_task_id` dependency correction (DG-1 → DG-5)

> `verification_task_id` / the admin task queue reference belongs to **DG-5 (Admin)**, not DG-1. DG-1 (Identity) retains staff identity, membership, and `check_permission`. Ownership unchanged; no dependency redesign.

**Location:** `trust.assign_verification.v1` — Dependency References.

**Before:**

```
- **Dependency References:** DG-1 (staff identity, `verification_tasks` admin ref — Admin/Doc-4J relationship via §10.6 `verification_task_id`); DG-8 (audit).
```

**After:**

```
- **Dependency References:** DG-1 (Identity — staff identity, membership, `check_permission`); DG-5 (Admin — `verification_task_id` / admin task queue reference, Doc-2 §10.6 `verification_task_id`; Admin/Doc-4J owns the task queue, Trust references it read-only); DG-8 (audit).
```

---

### F4G-PA-N1 (optional, applied) — freeze/reactivate event-emission attribution clarity

> Clarify that a freeze/reactivate contract **triggers** the compute contract, which **emits** `TrustScoreUpdated` / `PerformanceScoreUpdated`. Publisher ownership preserved (BC-TRUST-2/BC-TRUST-3 compute contracts remain the emitters). No new event; no publisher change. `PerformanceFrozen` remains emitted by the freeze contract per Doc-2 §8.

#### F4G-PA-N1·a — `trust.freeze_trust_score.v1` / `trust.reactivate_trust_score.v1` — Event References

**Before:**

```
- **Event References:** `TrustScoreUpdated` (Doc-2 §8) on freeze-state change (band publication suppressed while frozen) via outbox-write.
```

**After:**

```
- **Event References:** publication-state change is reflected via `TrustScoreUpdated` (Doc-2 §8) — **emitted by the compute contract `trust.compute_trust_score.v1` (BC-TRUST-2, publisher of record)**, which the freeze/reactivate contract **triggers** after writing `freeze_state`; the freeze/reactivate contract itself coins no event and is not the publisher (band publication suppressed while frozen). No new event; publisher ownership unchanged (Doc-2 §8 — `trust.trust_scores`).
```

#### F4G-PA-N1·b — `trust.freeze_performance_score.v1` / `trust.reactivate_performance_score.v1` — Event References

**Before:**

```
- **Event References:** `PerformanceFrozen` (Doc-2 §8 — `trust.performance_scores`) on freeze; `PerformanceScoreUpdated` on reactivation-driven change, via outbox-write.
```

**After:**

```
- **Event References:** `PerformanceFrozen` (Doc-2 §8 — `trust.performance_scores`) is emitted by this freeze contract (BC-TRUST-3) on freeze, via outbox-write. On reactivation, the publication-state change is reflected via `PerformanceScoreUpdated` (Doc-2 §8) — **emitted by the compute contract `trust.compute_performance_score.v1` (BC-TRUST-3, publisher of record)**, which the reactivate contract **triggers**; the reactivate contract coins no event and is not the `PerformanceScoreUpdated` publisher. No new event; publisher ownership unchanged.
```

---

# 2. Regression Audit

| Check | Result | Evidence |
|---|---|---|
| **Aggregate Inventory** | **UNCHANGED** | 7 aggregates (Doc-2 §2, Module 5), each one BC-TRUST; no aggregate added/removed/moved. |
| **Contract Inventory** | **UNCHANGED except approved corrections** | 24 contract records intact; MA1/M1 edit only slug-authority wording; M2 edits only one Dependency-References line; N1 edits only two Event-References lines. No contract added/removed/split. |
| **Ownership** | **UNCHANGED** | Every aggregate's owning BC-TRUST unchanged; `verification_task_id` correction is a *dependency-reference* fix (Admin owns the queue — restates existing ownership), not an ownership transfer. |
| **Trust Firewall** | **UNCHANGED** | Scores remain System-actor auto-calculated; Financial Tier/Buyer-Vendor-Status/paid-plan never feed a score; no firewall text altered. |
| **Procurement Moat** | **UNCHANGED** | No matching/routing/ranking/evaluation/selection/award absorbed; RFQ ownership intact; no moat text altered. |
| **Event Ownership** | **UNCHANGED** | All six produced events still owned/emitted by Trust; N1 clarifies the compute contract is the `TrustScoreUpdated`/`PerformanceScoreUpdated` publisher (no publisher change); `PerformanceFrozen` still emitted by the freeze contract; no event created. |
| **Audit References** | **UNCHANGED** | All audit pointers bind Doc-2 §9 Trust/Reviews as before; no audit action added/changed/invented. |
| **Policy References** | **UNCHANGED** | Doc-3 §12.2 pointers and `[ESC-TRUST-POLICY]` carries unchanged; no POLICY key added/invented. |
| **Escalation Markers** | **PRESERVED** | `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]` retained — not renamed, not removed. MA1/M1 resolve via Option A (confirmed §7 slugs), so the `[ESC-TRUST-SLUG]` carries for genuinely-absent dedicated slugs remain valid and unchanged. |
| **No invention** | **CONFIRMED** | `can_submit_verification` and `staff_super_admin` both verified present in Doc-2 §7 before use (Option A); no slug, audit action, event, or POLICY key introduced. |

---

*End of Doc-4G_PassA_Patch_v1.0 — applies F4G-PA-MA1 (`can_submit_verification` confirmed in Doc-2 §7 — Option A; §B.4 inventory completed, §G11 + Appendix D aligned), F4G-PA-M1 (`staff_super_admin` confirmed in Doc-2 §7 — Option A; admin-rating permission clarified), F4G-PA-M2 (`verification_task_id` dependency corrected DG-1 → DG-5 Admin; DG-1 retains staff identity/membership/check_permission), F4G-PA-N1 (freeze/reactivate triggers the compute contract which emits `TrustScoreUpdated`/`PerformanceScoreUpdated`; `PerformanceFrozen` stays freeze-contract-emitted; publisher ownership unchanged). Surgical/contract-level only; aggregate inventory, contract inventory, ownership, trust firewall, procurement moat, event ownership, audit references, and policy references preserved; escalation markers preserved; nothing invented. Canonical input: `Doc-4G_PassA_Content_v1.0.md` as amended by this patch.*
