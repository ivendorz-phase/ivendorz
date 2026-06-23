# Doc-4G_PassB_Part5_Patch_v1.0.md

## Status

**Approved Pass-B Part-5 Patch** — applies the Architecture-Board-approved corrections to `Doc-4G_PassB_Part5_BC-TRUST-5_Reviews_Admin_Ratings_v1.0.md`. Surgical, contract-level patching only — no rewrite, no redesign.

| Field | Value |
|---|---|
| Applies to | `Doc-4G_PassB_Part5_BC-TRUST-5_Reviews_Admin_Ratings_v1.0.md` |
| Produces | that document as amended by this patch (canonical input to Pass-B Part-5 Freeze) |
| Board adjudication | **Mandatory:** F4G-PB5-MA1, F4G-PB5-MA2, F4G-PB5-M1, F4G-PB5-M2, F4G-PB5-M3. **Recommended:** F4G-PB5-N1, F4G-PB5-N2 — applied. |
| Conforms To | Architecture FINAL · ADR v1 · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A/4B/4C/4D/4E/4F v1.0 · Doc-4G Structure FROZEN · Doc-4G Pass-A FROZEN · Doc-4G PassB Part1/2/3/4 FROZEN — all FROZEN |
| Application model | Additive amendment. Each item quotes the exact **Before** text present verbatim in the base and gives the **After**. Anchors verified verbatim. |

No ownership, aggregate, lifecycle, event, permission, audit, policy-ownership, trust-firewall, or procurement-moat change; no new POLICY key / slug / state / event; F4G-M2 single-writer and F4G-M3 dual-path preserved unchanged. Escalation markers preserved exactly.

---

# 1. Exact Changes

---

### F4G-PB5-MA1 — §H.3 + §G8.2 §5 + §G8.3 §5 + §G8.4 §5 — one authoritative authorization model (current vs future additive)

> **One model, two explicit layers:** (1) **Current authority (TODAY):** confirmed frozen Doc-2 §7 staff-family slugs are used — `staff_can_verify` and `staff_super_admin` for admin-rating set; the broader §7 staff family for review moderation/lifecycle. (2) **Future additive authority:** any dedicated moderation or admin-rating slug not yet present in Doc-2 §7 is governed exclusively by `[ESC-TRUST-SLUG]` (Doc-2 §7 additive channel). The phrase "per role seed" (which implied unspecified runtime selection logic) is removed throughout. No slug invented.

#### F4G-PB5-MA1·a — §H.3

**Before:**

```
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** **Confirmed Doc-2 §7 slugs used in this Part:** **`can_submit_review`** (O,D,M — buyer side, **engagement required**) for public-review submission; **platform-staff** authority for review moderation/publish/remove and for admin-rating set (the Doc-2 §7 staff family — `staff_can_verify` / `staff_super_admin` per role seed). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement = Identity `check_permission` (Doc-4C, consumed; no shadow authorization). **Buyer submission scope** = the buyer's active organization (the `author_organization_id`); **staff actions** are platform-staff (no active-org context, §5.6) and **not delegation-eligible**. Where a required staff action lacks a §7 slug (a dedicated review-moderation or admin-rating slug) → **`[ESC-TRUST-SLUG]`** (Doc-2 §7 additive; no slug invented).
```

**After:**

```
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** **Confirmed Doc-2 §7 slugs used in this Part:** **`can_submit_review`** (O,D,M — buyer side, **engagement required**) for public-review submission; **`staff_can_verify`** and **`staff_super_admin`** (both confirmed Doc-2 §7 platform-staff entries) for admin-rating set and for review moderation/lifecycle operations. Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement = Identity `check_permission` (Doc-4C, consumed; no shadow authorization). **Buyer submission scope** = the buyer's active organization (the `author_organization_id`); **staff actions** are platform-staff (no active-org context, §5.6) and **not delegation-eligible**. **Authorization model — two explicit layers (authoritative):** **(1) Current authority (TODAY):** the above confirmed Doc-2 §7 slugs govern all staff actions in this Part — no additional slug is required today. **(2) Future additive authority:** any dedicated review-moderation slug or dedicated admin-rating slug not yet present in Doc-2 §7 is governed **exclusively** by **`[ESC-TRUST-SLUG]`** (Doc-2 §7 additive channel; **no slug invented**) — this is the only path for future authority extension; it does not affect current operations. No ambiguity between (1) and (2) may be inferred.
```

#### F4G-PB5-MA1·b — §G8.2 §5 Authorization Matrix

**Before:**

```
**5. Authorization Matrix** — Actor **Admin** · **platform-staff moderation authority** (Doc-2 §7 staff family — review moderation is platform-staff per Doc-4G Structure §G12); if a dedicated moderation slug is required beyond the §7 staff set → **`[ESC-TRUST-SLUG]`** (no slug invented) · Scope = platform · Delegation n/a · Enforcement `check_permission`.
```

**After:**

```
**5. Authorization Matrix** — Actor **Admin** · **Current authority (TODAY): `staff_can_verify`** and/or **`staff_super_admin`** (confirmed Doc-2 §7 platform-staff entries; Doc-4G Structure §G12 — review moderation is platform-staff) · **Future additive authority:** a dedicated review-moderation slug not yet in Doc-2 §7 → **`[ESC-TRUST-SLUG]`** (additive channel; no slug invented; does not affect today's operations) · Scope = platform · Delegation n/a · Enforcement `check_permission`.
```

#### F4G-PB5-MA1·c — §G8.3 §5 Authorization Matrix

**Before:**

```
**5. Authorization Matrix** — Actor **Admin** · **platform-staff review-lifecycle authority** (Doc-2 §7 staff family); dedicated slug beyond §7 → **`[ESC-TRUST-SLUG]`** (no slug invented) · Scope = platform · Delegation n/a · Enforcement `check_permission`.
```

**After:**

```
**5. Authorization Matrix** — Actor **Admin** · **Current authority (TODAY): `staff_can_verify`** and/or **`staff_super_admin`** (confirmed Doc-2 §7 platform-staff entries; publish/remove are platform-staff lifecycle operations) · **Future additive authority:** a dedicated review-lifecycle slug not yet in Doc-2 §7 → **`[ESC-TRUST-SLUG]`** (additive channel; no slug invented; does not affect today's operations) · Scope = platform · Delegation n/a · Enforcement `check_permission`.
```

#### F4G-PB5-MA1·d — §G8.4 §4 Validation Matrix row 5 + §G8.4 §5 Authorization Matrix

**Before (§G8.4 §4 row 5):**

```
| platform-staff admin-rating authority | 5 AUTHORIZATION | Doc-2 §7 | staff authority (`staff_can_verify`/`staff_super_admin` per role seed); dedicated admin-rating slug → `[ESC-TRUST-SLUG]` | `AUTHORIZATION` |
```

**After (§G8.4 §4 row 5):**

```
| platform-staff admin-rating authority | 5 AUTHORIZATION | Doc-2 §7 | **Current:** staff holds `staff_can_verify` or `staff_super_admin` (confirmed Doc-2 §7); **Future:** dedicated admin-rating slug → `[ESC-TRUST-SLUG]` (additive; no slug invented; does not affect today) | `AUTHORIZATION` |
```

**Before (§G8.4 §5):**

```
**5. Authorization Matrix** — Actor **Admin** · **platform-staff admin-rating authority** (Doc-2 §7 staff family — `staff_can_verify`/`staff_super_admin` per role seed); a dedicated admin-rating slug is not in §7 → carry **`[ESC-TRUST-SLUG]`** for that case (no slug invented) · Scope = platform · Delegation n/a · Enforcement `check_permission`. **No vendor/buyer path.**
```

**After (§G8.4 §5):**

```
**5. Authorization Matrix** — Actor **Admin** · **Current authority (TODAY): `staff_can_verify`** or **`staff_super_admin`** (both confirmed Doc-2 §7 platform-staff entries; holding either authorizes the operation) · **Future additive authority:** a dedicated admin-rating slug not yet in Doc-2 §7 → **`[ESC-TRUST-SLUG]`** (additive channel; no slug invented; does not affect today's operations) · Scope = platform · Delegation n/a · Enforcement `check_permission`. **No vendor/buyer path.**
```

**Rationale:** Removes the "per role seed" ambiguity throughout. Every location now has two explicitly labeled and non-overlapping authorization layers: (1) confirmed §7 slugs used today; (2) future additive authority exclusively via `[ESC-TRUST-SLUG]`. No slug invented. No permission changed.

---

### F4G-PB5-MA2 — §G8.3 §8 + §G8.3 §9 + §G8.3 §10 + §G8.3 §12 — explicit publish failure-boundary model

> **One authoritative publish model:** publication is a **two-step operation** with an explicit transaction boundary. Step 1: the `public_reviews` row transitions to `published` in a single atomic transaction (audit included). Step 2: the BC-TRUST-3 ingestion service is invoked in-module (Path B, F4G-M2). If Step 2 fails (ingestion service unavailable): the review state is already `published` (Step 1 committed), the ingestion call returns `DEPENDENCY` (retryable), and the publish handler retries the ingestion independently — the review lifecycle is **not rolled back**. No implementation interpretation permitted.

#### F4G-PB5-MA2·a — §G8.3 §8 Event Binding

**Before:**

```
**8. Event Binding** — **Emits NO cross-module event** (H.7 — Doc-2 §8 has no review event) · **On publish:** invoke **`trust.ingest_performance_input.v1`** (BC-TRUST-3) **in-module** to append the Buyer-Feedback input (**Path B**, F4G-M3) — an **in-module service call, not a cross-module event**; **BC-TRUST-3 remains the sole writer of `performance_inputs`** (F4G-M2). Marketplace **displays `published` reviews via service** (DG-2, never table access) — a read projection, not an event. No publisher ambiguity.
```

**After:**

```
**8. Event Binding** — **Emits NO cross-module event** (H.7 — Doc-2 §8 has no review event) · **On publish — two-step model (authoritative, no implementation interpretation permitted):** **(Step 1)** the `public_reviews` row transitions to `published` in a single atomic transaction (audit in the same transaction, Doc-4B). **(Step 2)** the BC-TRUST-3 ingestion service `trust.ingest_performance_input.v1` is invoked **in-module** to append the Buyer-Feedback input (**Path B**, F4G-M3) — an in-module service call, **not** a cross-module event. **Failure boundary:** if Step 2 fails (BC-TRUST-3 ingestion service unavailable), Step 1 is **not rolled back** — the review is `published` (committed) and the ingestion call is retried independently (retryable `DEPENDENCY`); the **review lifecycle outcome is unaffected** by the ingestion service's availability. **BC-TRUST-3 remains the sole writer of `performance_inputs`** (F4G-M2, per §H.9(c)). Marketplace **displays `published` reviews via Marketplace service projection** (DG-2, never table access) — a read projection, not an event. No publisher ambiguity.
```

#### F4G-PB5-MA2·b — §G8.3 §9 Error Register (DEPENDENCY row and Error Boundary)

**Before:**

```
| `DEPENDENCY` | BC-TRUST-3 ingestion service / Doc-4B audit transiently unavailable | true |
```

**After:**

```
| `DEPENDENCY` | BC-TRUST-3 ingestion service transiently unavailable (Step 2 — review already `published`; retry ingestion independently) / Doc-4B audit transiently unavailable (Step 1 — publish rolls back entirely if audit fails) | true |
```

**Before (Error Boundary block):**

```
**Error Boundary block (§12.4/§12.6):** staff surface — missing review → `NOT_FOUND` on identity. **STATE vs CONFLICT:** publish on non-`approved` → `STATE`; stale revision → `CONFLICT`. **REFERENCE vs DEPENDENCY:** an **unavailable ingestion service** is `DEPENDENCY` (retryable) — never `REFERENCE`; a missing review is `NOT_FOUND`.
```

**After (Error Boundary block):**

```
**Error Boundary block (§12.4/§12.6):** staff surface — missing review → `NOT_FOUND` on identity. **STATE vs CONFLICT:** publish on non-`approved` → `STATE`; stale revision → `CONFLICT`. **REFERENCE vs DEPENDENCY:** an **unavailable ingestion service** is `DEPENDENCY` (retryable, Step 2) — never `REFERENCE`; a missing review is `NOT_FOUND`. **Transaction boundary (publish):** Step 1 (state + audit) is atomic — if Doc-4B audit is unavailable, the entire publish rolls back (`DEPENDENCY`, both steps fail cleanly); Step 2 (ingestion) runs after Step 1 commits — failure of Step 2 does **not** roll back the `published` state; ingestion is retried independently.
```

#### F4G-PB5-MA2·c — §G8.3 §10 Idempotency Rules

**Before:**

```
**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`); a publish replay re-invokes the BC-TRUST-3 ingestion service **idempotently** (the ingestion service dedups the Path-B input on its key — F4G-M2/M3), so **no duplicate `performance_inputs` row** and no duplicate audit; re-publish of a `published` review / re-remove of a `removed` review is a no-op. `expected_revision` guards races.
```

**After:**

```
**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`); a publish replay (same idempotency key within the dedup window) is absorbed before Step 1 executes — no second state write, no duplicate audit, no duplicate ingestion invocation; a genuinely new publish request against a non-`approved` review → `STATE` (not idempotency-absorbed, per §6). A Step-2 retry (ingestion independently re-invoked after a prior `DEPENDENCY`) is idempotent on the BC-TRUST-3 ingestion key — **no duplicate `performance_inputs` row** results (F4G-M2/M3). Re-remove of a `removed` review is a no-op. `expected_revision` guards concurrent Step-1 races.
```

#### F4G-PB5-MA2·d — §G8.3 §12 AI-Agent Notes

**Before:**

```
**12. AI-Agent Implementation Notes** — **on publish, invoke the BC-TRUST-3 ingestion service; do NOT write `performance_inputs` directly** (F4G-M2 — BC-TRUST-3 is the sole writer). This is **Path B** of the Buyer-Feedback dual-path (Path A = Operations `BuyerFeedbackRecorded`); both feed one component, **de-dup at BC-TRUST-3 computation** (F4G-M3) — never naive-sum. An unavailable ingestion service is `DEPENDENCY` (retryable), not `REFERENCE`. Marketplace reads `published` reviews **via service**, never by direct table access. Emits no cross-module event.
```

**After:**

```
**12. AI-Agent Implementation Notes** — **on publish, execute the two-step model (§8):** Step 1 — transition the review to `published` atomically (with audit); Step 2 — invoke `trust.ingest_performance_input.v1` (BC-TRUST-3) in-module for Path B (F4G-M2/M3). **Do NOT write `performance_inputs` directly** (BC-TRUST-3 is the sole writer — §H.9(c)). **If Step 2 fails:** the review is already `published` (Step 1 committed); do **not** roll back the review state; retry the ingestion independently (`DEPENDENCY`, retryable). An unavailable ingestion service is `DEPENDENCY` (retryable), **never** `REFERENCE` and **never** a reason to roll back the review lifecycle. Both Buyer-Feedback paths (Path A = Operations `BuyerFeedbackRecorded`; Path B = this ingestion call) feed one component — **de-dup at BC-TRUST-3 computation** (F4G-M3), never naive-sum. Marketplace reads `published` reviews **via Marketplace service projection**, never by direct table access. Emits no cross-module event.
```

**Rationale:** Defines the one authoritative two-step publish model with explicit transaction boundary, ingestion failure behavior, and retry semantics. Review lifecycle outcome is deterministic and independent of BC-TRUST-3 ingestion availability. No lifecycle redesign; no F4G-M2/M3 change.

---

### F4G-PB5-M1 — Review visibility phrase standardized

> Single authoritative phrase: **"public via Marketplace service projection"** — applied consistently to all locations that describe how published reviews reach the public surface. No behavior change.

#### F4G-PB5-M1·a — §G8.3 §6 State Machine Enforcement

**Before:**

```
`publish`: allowed source **`approved`** → **`published`** (public via Marketplace service; feeds Buyer-Feedback Path B)
```

**After:**

```
`publish`: allowed source **`approved`** → **`published`** (public via **Marketplace service projection**; feeds Buyer-Feedback Path B)
```

#### F4G-PB5-M1·b — §G8.5 §3 Response Schema

**Before:**

```
*get_review / list_reviews (public via service):* `published` review fields (`rating`, `body`, `vendor_profile_id`, published timestamp) — **only `published` reviews are public**; non-published states are not exposed publicly.
```

**After:**

```
*get_review / list_reviews (public via **Marketplace service projection**):* `published` review fields (`rating`, `body`, `vendor_profile_id`, published timestamp) — **only `published` reviews are public**; non-published states are not exposed publicly.
```

#### F4G-PB5-M1·c — §G8.5 §5 Authorization Matrix (`get_review`/`list_reviews` entry)

**Before:**

```
- **`trust.get_review.v1` / `trust.list_reviews.v1`** — Actor **User / internal-service via public projection** · Authorization **none** (published reviews are public via the Marketplace service projection; Doc-2 §10.6) · Scope **public** (per `vendor_profile_id`) · Visibility **`published` reviews only** — non-published states never exposed publicly; served via service, never direct table access.
```

**After:**

```
- **`trust.get_review.v1` / `trust.list_reviews.v1`** — Actor **User / internal-service via public projection** · Authorization **none** (published reviews are public via **Marketplace service projection**; Doc-2 §10.6) · Scope **public** (per `vendor_profile_id`) · Visibility **`published` reviews only, via Marketplace service projection** — non-published states never exposed publicly; never direct table access.
```

#### F4G-PB5-M1·d — §G8.5 §12 AI-Agent Notes

**Before:**

```
**Reviews and Admin Ratings are separate** (H.9a): published reviews are **public via service** (only `published` state); admin ratings are **staff-only, never tenant-visible** — collapse non-staff admin-rating access to `NOT_FOUND` (§7.5). Marketplace reads `published` reviews **via service projection**, never by direct table access.
```

**After:**

```
**Reviews and Admin Ratings are separate** (H.9a): published reviews are **public via Marketplace service projection** (only `published` state); admin ratings are **staff-only, never tenant-visible** — collapse non-staff admin-rating access to `NOT_FOUND` (§7.5). Marketplace reads `published` reviews **via Marketplace service projection**, never by direct table access.
```

#### F4G-PB5-M1·e — §G8.Z Non-disclosure/Visibility ledger row

**Before:**

```
| Non-disclosure | Doc-4A §7.5; Doc-2 §3.6 — admin ratings staff-internal (never tenant-visible/public); only `published` reviews public, via Marketplace service |
```

**After:**

```
| Non-disclosure | Doc-4A §7.5; Doc-2 §3.6 — admin ratings staff-internal (never tenant-visible/public); only `published` reviews public, **via Marketplace service projection** |
```

**Rationale:** Single authoritative phrase "via Marketplace service projection" throughout. No behavior change.

---

### F4G-PB5-M2 — Admin Rating lifecycle wording normalized

> Single authoritative lifecycle description for Admin Rating: **"create/update + soft delete (Doc-2 §10.6 SD=YES)"** — applied consistently across §H.5, §G8.4 §6, and §G8.Z. No behavior change.

#### F4G-PB5-M2·a — §H.5 (Admin Rating lifecycle)

**Before:**

```
**Admin Rating** (`admin_ratings`): **simple** (no multi-state machine; Doc-2 §3.6) — set/update with soft-delete (SD=YES).
```

**After:**

```
**Admin Rating** (`admin_ratings`): **create/update + soft delete** (Doc-2 §10.6 SD=YES; no multi-state machine).
```

#### F4G-PB5-M2·b — §G8.4 §6 State Machine Enforcement

**Before:**

```
**6. State Machine Enforcement** — **Simple** (no multi-state machine; Doc-2 §3.6) — set creates the `admin_ratings` row; update asserts `expected_revision`; soft-delete supported (Doc-2 §10.6 SD=YES) · Forbidden: no public/tenant write path · Concurrency: optimistic on update; lost race → `CONFLICT`.
```

**After:**

```
**6. State Machine Enforcement** — **create/update + soft delete** (Doc-2 §10.6 SD=YES; no multi-state machine) — create writes a new `admin_ratings` row; update asserts `expected_revision`; soft delete marks the row deleted (SD=YES) · Forbidden: no public/tenant write path · Concurrency: optimistic on update; lost race → `CONFLICT`.
```

#### F4G-PB5-M2·c — §G8.Z Lifecycle ledger row (Admin Rating entry)

**Before:**

```
| Lifecycle | Doc-2 §3.6/§10.6 — Public Review `submitted → approved → published | rejected | removed` (SD=YES, removed=hidden); Admin Rating **simple** (SD=YES) |
```

**After:**

```
| Lifecycle | Doc-2 §3.6/§10.6 — Public Review `submitted → approved → published | rejected | removed` (SD=YES, removed=hidden); Admin Rating **create/update + soft delete** (Doc-2 §10.6 SD=YES; no multi-state machine) |
```

**Rationale:** Single authoritative lifecycle phrase for Admin Rating. No behavior change.

---

### F4G-PB5-M3 — Admin Rating visibility phrase standardized

> Single authoritative Admin Rating visibility phrase: **"staff-only — never tenant-visible, never public, never exposed externally (Doc-2 §3.6; Doc-4A §7.5); non-staff access collapses to `NOT_FOUND`"** — applied consistently across Response Schema, Authorization Matrix, AI-Agent Notes, and ledger. No behavior change.

#### F4G-PB5-M3·a — §G8.4 §3 Response Schema

**Before:**

```
**3. Response Schema** — `admin_rating_id : uuid (1)`, `reference_id : uuid (1)`. **No public/tenant projection of any kind** (internal-only).
```

**After:**

```
**3. Response Schema** — `admin_rating_id : uuid (1)`, `reference_id : uuid (1)`. **Visibility: staff-only — never tenant-visible, never public, never exposed externally (Doc-2 §3.6; Doc-4A §7.5); non-staff access collapses to `NOT_FOUND`.**
```

#### F4G-PB5-M3·b — §G8.4 §5 Authorization Matrix (add visibility)

In the **After** text already produced for MA1·d (§G8.4 §5), the visibility clause is absent. Add the authoritative phrase to that §5 entry:

**Before (§G8.4 §5 After from MA1·d — completing with visibility):**

```
**5. Authorization Matrix** — Actor **Admin** · **Current authority (TODAY): `staff_can_verify`** or **`staff_super_admin`** (both confirmed Doc-2 §7 platform-staff entries; holding either authorizes the operation) · **Future additive authority:** a dedicated admin-rating slug not yet in Doc-2 §7 → **`[ESC-TRUST-SLUG]`** (additive channel; no slug invented; does not affect today's operations) · Scope = platform · Delegation n/a · Enforcement `check_permission`. **No vendor/buyer path.**
```

**After (MA1·d §5 with M3 visibility clause added):**

```
**5. Authorization Matrix** — Actor **Admin** · **Current authority (TODAY): `staff_can_verify`** or **`staff_super_admin`** (both confirmed Doc-2 §7 platform-staff entries; holding either authorizes the operation) · **Future additive authority:** a dedicated admin-rating slug not yet in Doc-2 §7 → **`[ESC-TRUST-SLUG]`** (additive channel; no slug invented; does not affect today's operations) · Scope = platform · **Visibility: staff-only — never tenant-visible, never public, never exposed externally (Doc-2 §3.6; Doc-4A §7.5); non-staff access collapses to `NOT_FOUND`** · Delegation n/a · Enforcement `check_permission`. **No vendor/buyer path.**
```

#### F4G-PB5-M3·c — §G8.4 §12 AI-Agent Notes

**Before:**

```
**Internal-only, never public, never tenant-visible, never exposed externally** (Doc-2 §3.6; §7.5) — collapse non-staff access to `NOT_FOUND`.
```

**After:**

```
**Visibility: staff-only — never tenant-visible, never public, never exposed externally (Doc-2 §3.6; Doc-4A §7.5); non-staff access collapses to `NOT_FOUND`.**
```

#### F4G-PB5-M3·d — §G8.5 §5 Authorization Matrix (`list_admin_ratings` entry)

**Before:**

```
- **`trust.list_admin_ratings.v1`** — Actor **Admin** (platform-staff, §5.6) · Authorization **`staff_can_verify`** (Doc-2 §7) · Scope **platform** · Visibility **staff-only — admin ratings are internal-only, never tenant-visible, never public** (Doc-2 §3.6; §7.5); non-staff access collapses to `NOT_FOUND`.
```

**After:**

```
- **`trust.list_admin_ratings.v1`** — Actor **Admin** (platform-staff, §5.6) · Authorization **`staff_can_verify`** (Doc-2 §7) · Scope **platform** · **Visibility: staff-only — never tenant-visible, never public, never exposed externally (Doc-2 §3.6; Doc-4A §7.5); non-staff access collapses to `NOT_FOUND`.**
```

#### F4G-PB5-M3·e — §G8.Z Non-disclosure ledger row (Admin Rating visibility)

The MA1·e ledger row (from M1) handles the phrase for public reviews. The Admin Rating visibility portion of the same ledger row is updated:

**Before (Admin Rating portion of Non-disclosure row, as updated by M1):**

```
admin ratings staff-internal (never tenant-visible/public)
```

**After:**

```
admin ratings: **staff-only — never tenant-visible, never public, never exposed externally (Doc-2 §3.6; Doc-4A §7.5); non-staff access collapses to `NOT_FOUND`**
```

**Rationale:** Single authoritative Admin Rating visibility phrase across all four surfaces. No behavior change.

---

### F4G-PB5-N1 (recommended, applied) — centralize "BC-TRUST-5 never writes `performance_inputs`" to §H.9(c)

> §H.9(c) is the authoritative location for the F4G-M2 single-writer rule as applied to BC-TRUST-5. Per-contract occurrences that restate the rule inline are updated to reference §H.9(c). No behavior change.

#### F4G-PB5-N1·a — §H.9(c)

**Before:**

```
 (c) **F4G-M2 single-writer:** `performance_inputs` is BC-TRUST-3-owned; **BC-TRUST-5 invokes the ingestion service on publish, never writes `performance_inputs` directly.**
```

**After:**

```
 (c) **F4G-M2 single-writer (authoritative):** `performance_inputs` is BC-TRUST-3-owned; **BC-TRUST-5 invokes `trust.ingest_performance_input.v1` (BC-TRUST-3) on publish and never writes `performance_inputs` directly — this is the single authoritative statement of the F4G-M2 rule for this Part.** All per-contract references to this rule cite §H.9(c).
```

#### F4G-PB5-N1·b — §G8.3 §11 Cross-Module References

**Before:**

```
**Intra-module (B.9b / F4G-M2):** `trust.ingest_performance_input.v1` (BC-TRUST-3) on publish — Path B Buyer-Feedback; **BC-TRUST-5 never writes `performance_inputs`**.
```

**After:**

```
**Intra-module (B.9b / F4G-M2):** `trust.ingest_performance_input.v1` (BC-TRUST-3) on publish — Path B Buyer-Feedback; F4G-M2 single-writer rule per **§H.9(c)**.
```

#### F4G-PB5-N1·c — §G8.Z Carried dependencies (BC-TRUST-3 intra-module entry)

**Before:**

```
**Intra-module (F4G-M2/M3):** `trust.ingest_performance_input.v1` (BC-TRUST-3) invoked on publish (Path B) — BC-TRUST-5 never writes `performance_inputs`.
```

**After:**

```
**Intra-module (F4G-M2/M3):** `trust.ingest_performance_input.v1` (BC-TRUST-3) invoked on publish (Path B) — F4G-M2 single-writer rule per §H.9(c).
```

**Rationale:** §H.9(c) is the single authoritative location for the F4G-M2 rule. Inline restatements are replaced with §H.9(c) pointers. No behavior change.

---

### F4G-PB5-N2 (recommended, applied) — centralize "BC-TRUST-5 emits no event" to §H.7

> §H.7 is the authoritative location for the no-event rule. The §G8.Z Firewall posture restatement is replaced with a §H.7 pointer. Per-contract Event Binding sections already cite (H.7) and are unchanged. No behavior change.

#### F4G-PB5-N2·a — §G8.Z Firewall, separation & moat posture (event clause)

**Before:**

```
**BC-TRUST-5 emits no event** (Doc-2 §8 has none)
```

*(in the context of the full Firewall posture sentence)*

**After:**

```
**BC-TRUST-5 emits no event (per §H.7)**
```

**Rationale:** The no-event rule is stated authoritatively once at §H.7; the §G8.Z posture block references it instead of restating. No behavior change.

---

# 2. Regression Audit

| Check | Result | Evidence |
|---|---|---|
| **Ownership** | **UNCHANGED** | Public Review → BC-TRUST-5; Admin Rating → BC-TRUST-5; BC-TRUST-3 owns `performance_inputs`; no aggregate added/moved. MA1 changes authorization wording only. MA2 defines the transaction boundary of an existing two-step call — no aggregate change. |
| **Aggregate definitions** | **UNCHANGED** | `public_reviews` and `admin_ratings` schemas/fields untouched. |
| **Review Lifecycle** | **UNCHANGED** | `submitted → approved → published | rejected | removed` intact; MA2 defines the transaction boundary of the existing publish step — no state, no edge added; N/A rows unchanged. |
| **Admin Rating Lifecycle** | **UNCHANGED** | M2 normalizes the description to "create/update + soft delete" — the behavior (set/update/soft-delete) is identical; no state machine added. |
| **Permissions** | **UNCHANGED** | `can_submit_review`, `staff_can_verify`, `staff_super_admin` used as before; MA1 labels the current/future layers explicitly without adding or removing any slug; `[ESC-TRUST-SLUG]` preserved for future additive authority only. |
| **Event Ownership** | **UNCHANGED** | BC-TRUST-5 still emits no event (Doc-2 §8 has none); N2 normalizes the §G8.Z pointer to §H.7; nothing coined. |
| **Audit Ownership** | **UNCHANGED** | Review mutations still bind Doc-2 §9 enumerated actions; admin-rating set still carries `[ESC-TRUST-AUDIT]`; no action invented. |
| **Trust Firewall** | **UNCHANGED** | Neither reviews nor admin ratings mutate Trust Score/Performance/Verification/Fraud/Tier; no Billing influence; §H.9 unchanged except §H.9(c) authoritativeness note (N1). |
| **Procurement Moat** | **UNCHANGED** | Reviews are informational signals only; no matching/routing/ranking/evaluation/selection/award; RFQ authoritative; §H.9(g) unchanged. |
| **F4G-M2 Single Writer** | **UNCHANGED** | BC-TRUST-3 remains sole writer of `performance_inputs`; BC-TRUST-5 invokes the ingestion service on publish, never writes directly; MA2 makes the transaction boundary explicit — no write path added. |
| **F4G-M3 Dual Path** | **UNCHANGED** | Path A (Operations `BuyerFeedbackRecorded`) and Path B (BC-TRUST-5 publish → ingestion) remain distinct; de-dup at BC-TRUST-3 computation; no path merged or removed. |
| **Escalation Markers** | **PRESERVED EXACTLY** | `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]` retained — not removed, not renamed, not reinterpreted; MA1 strengthens the `[ESC-TRUST-SLUG]` governance language (future additive only) without replacing the marker; N1/N2 add §H.9(c)/§H.7 pointers without removing the markers. |
| **No invention** | **CONFIRMED** | No new contract, event, state, slug, audit action, POLICY key, or aggregate introduced. |

---

*End of Doc-4G_PassB_Part5_Patch_v1.0 — applies F4G-PB5-MA1 (two-layer authorization model: current confirmed Doc-2 §7 slugs labeled TODAY; future additive exclusively via `[ESC-TRUST-SLUG]`; "per role seed" removed throughout), F4G-PB5-MA2 (explicit two-step publish model: Step 1 = state+audit atomic; Step 2 = BC-TRUST-3 ingestion; ingestion failure → `DEPENDENCY` retryable, review not rolled back; deterministic transaction boundary across §8/§9/§10/§12), F4G-PB5-M1 (single authoritative visibility phrase "via Marketplace service projection" throughout), F4G-PB5-M2 (single Admin Rating lifecycle phrase "create/update + soft delete" across §H.5/§G8.4 §6/§G8.Z), F4G-PB5-M3 (single Admin Rating visibility phrase "staff-only — never tenant-visible, never public, never exposed externally; non-staff collapses to `NOT_FOUND`" across §3/§5/§12/ledger), F4G-PB5-N1 (§H.9(c) as authoritative F4G-M2 single-writer statement; per-contract inline restatements replaced with §H.9(c) pointer), F4G-PB5-N2 (§G8.Z Firewall posture references §H.7 for the no-event rule). Surgical/contract-level only; ownership, aggregate, lifecycle, events, permissions, audit ownership, trust firewall, procurement moat, F4G-M2, and F4G-M3 preserved unchanged; escalation markers preserved exactly; nothing invented. Canonical input: `Doc-4G_PassB_Part5_BC-TRUST-5_Reviews_Admin_Ratings_v1.0.md` as amended by this patch.*
