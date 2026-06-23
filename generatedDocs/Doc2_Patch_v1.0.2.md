# Doc2_Patch_v1.0.2.md

## Status

Approved Patch

Purpose: resolve the Doc-2 v1.0.1 schema-generation readiness findings (B-1…B-3, M-1…M-8). No architectural redesign. All frozen architecture decisions preserved.

---

# PATCH-01 — Public Reviews Entity (B-1)

New entity: `trust.public_reviews`. Owner: **Trust & Verification Module** (score derivation, review moderation, and buyer-feedback ingestion are trust domain).

Structure: `id, vendor_profile_id, author_organization_id, engagement_id, rating(1–5), body, status(submitted/approved/published/rejected/removed), moderated_by, moderated_at`.

Rules: post-award only (an engagement reference is required); published reviews are public; authorship is organization-scoped; moderation decisions audited; published reviews feed `performance_inputs` (Buyer Feedback component) internally within Trust; Marketplace displays reviews via service, never by table access.

---

# PATCH-02 — RFQ Document Grants (B-2)

New entity: `rfq.rfq_document_grants` — child-table grant pattern identical to `rfq_invitation_grantees`.

Structure: `id, rfq_id, spec_document_id, organization_id, source_invitation_id, created_at`.

Rules: written at invitation delivery together with invitation grantee rows; removed on delegation-grant revocation or invitation expiry (removals audited); the **only** vendor-side RLS anchor for buyer-uploaded specification documents attached to an RFQ version. RLS never traverses ownership cross-schema.

---

# PATCH-03 — RFQ Expired State (B-3)

Add to the RFQ state machine: `vendors_notified | quotations_received | buyer_reviewing → expired` (system actor) when the RFQ validity window lapses. The window is `core.system_configuration` policy. Expiry is audited and resolves the dangling Quotation `expired` trigger ("rfq cancelled/expired").

---

# PATCH-04 — VendorTierChanged Payload (M-1)

`VendorTierChanged` payload must include `tier_type(declared/verified)` plus vendor_profile_id, old_tier, new_tier. Emitters: Marketplace (declared), Trust (verified). Consumers branch on `tier_type`.

---

# PATCH-05 — Vendor Ownership Transfer Event (M-2)

Add `VendorOwnershipTransferred` to the event catalog. Emitter: Marketplace (on transfer approval). Consumers: Trust (Trust Protection freeze workflow), matching refresh, analytics. Satisfies the audit + event requirement for ownership changes.

---

# PATCH-06 — Operations Event Catalog (M-3)

Add operations-owned events: `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded`.

Trust consumes these (idempotently) to populate `performance_inputs` (Delivery Performance, Buyer Feedback, Dispute Record components). This replaces any synchronous Operations→Trust ingestion call.

---

# PATCH-07 — Subscription Cancellation Semantics (M-4)

Cancellation sets `auto_renew = false`; the subscription **remains `active` until period end**, then transitions to `expired`. The `cancelled` state is removed from the machine. States: `pending_payment / active / expired`. Assumption A-06 updated accordingly.

---

# PATCH-08 — Declared Tier Cardinality (M-5)

`vendor_profile → declared_financial_tier` is **0..1**, not 1:1 (seeded profiles have no declared tier). A vendor profile without a declared tier fails the Financial Tier gate and is not routable. Declaring a tier is part of claim/profile completion.

---

# PATCH-09 — Comparison Statement Cardinality (M-6)

One RFQ version → **many** comparison statements (versioned). Buyers revise comparisons. Remove the 0..1-per-version relationship entry.

---

# PATCH-10 — Permission Slug Additions (M-7)

Add: `can_manage_leads` (vendor pipeline), `can_manage_products` (vendor catalog), `can_manage_ads`, `can_upload_spec_documents`, `can_submit_review` (post-award buyer review).

---

# PATCH-11 — Engagement Audit Coverage (M-8)

Add to the audit mapping: engagement open / status change / close; LOI, PO, challan, WCC issue and revision; dispute recorded; buyer feedback submitted. Required for dispute evidence.

---

# Result

BLOCKER: 0 · Expected MAJOR: 0 · Schema Readiness: YES. After integration, Doc-2 v1.0.2 is the freeze candidate.
