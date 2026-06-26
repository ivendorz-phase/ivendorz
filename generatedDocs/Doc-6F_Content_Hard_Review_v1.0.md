# Doc-6F — M4 Operations (`operations`) Schema Realization — **Content Hard Review v1.0** (cross-pass, full §0–§8 + Appendix A)

| Field | Value |
|---|---|
| Reviewer | iVendorz **Virtual CTO & Architecture Board** — independent of the pass authors |
| Target | `Doc-6F_Content_v1.0_Pass1/2/3.md` (19 tables; §0–§8 + Appendix A) **read together** |
| Review type | **Cross-pass Content Hard Review** — the integration-seam gate (cross-pass DDL ordering, immutability vs the *actual* Doc-6B §4 body, two-sided party RLS, and the **end-to-end non-disclosure + money-boundary verification**) |
| Basis | `Doc-2 v1.0.3 §10.5/§5.9/§10.11`; `Doc-6A` (Appendix A); **`Doc-6B §4`** (the realized `core.raise_immutable_violation` body); Doc-6D (column-scoped lesson); Doc-6E (two-sided RLS lesson); Doc-3 v1.4 |
| Verdict | **1 MAJOR found + FIXED; 0 BLOCKER; 2 MINOR/NIT confirmed.** Non-disclosure + money-boundary verified end-to-end. **Ready for Content Freeze Audit.** |

> **Method note.** Verified (a) the **non-disclosure** property across the whole private-CRM surface, (b) the **money-boundary** (no-funds-custody) across every monetary table, (c) every immutability attachment against the **actual Doc-6B §4 body**, and (d) the two-sided party-column RLS termination. One immutability gap (`trade_invoices`) found and fixed.

---

## 1 — Coverage (19/19)
| Pass | Tables | n |
|---|---|---|
| Pass-1 | private_vendor_records · notes · ratings · buyer_supplier_relationships · buyer_vendor_statuses · vendor_favorites | 6 |
| Pass-2 | engagements · lois · purchase_orders · challans · work_completion_certificates · trade_invoices · payment_records | 7 |
| Pass-3 | finance_records · document_templates · template_versions · generated_documents · vendor_leads · lead_activities | 6 |
| **Total** | = **Doc-2 §10.5 exactly** (lois/po/challan/wcc = 4) | **19** |

No 20th; none missing. **PASS.**

---

## 2 — Headline verifications

### Non-disclosure (Invariant #11, the OWNING side; CHK-6-022)
The private CRM (`private_vendor_records`/`notes`/`ratings`), the blacklist (`buyer_vendor_statuses`), the relationship (`buyer_supplier_relationships`/`vendor_favorites`), and `finance_records` all carry a **single `organization_id` tenant policy — no vendor policy, no admin-all**. **Verified:** no `operations` surface exposes a buyer's vendor-status/private-record to the vendor side or to blanket staff. A blacklisted vendor's status is structurally undetectable (served to M3 only via the CRM service — Doc-6E §5, which returns a routing decision, never the row). The two-sided engagement surface (Pass-2) shares only **post-award** facts both parties already know — never the buyer's private CRM. **CHK-6-022 PASS (in-scope).**

### Money boundary (no funds custody)
Every monetary table — `engagements.award_value`, `trade_invoices.amount`, `payment_records.amount`, `finance_records.amount`, `vendor_leads.value_estimate` — is `NUMERIC` + an adjacent currency column. **Verified: no balance, no gateway, no escrow, no wallet, no settlement column anywhere.** `trade_invoices ≠ billing.platform_invoices` (no link to M7). `payment_records` records an off-platform payment; the platform holds no money. **PASS.**

---

## 3 — Findings

### MAJOR HR-F1 — `trade_invoices` money fields were freely mutable
**Where:** Pass-2 §3.3.3. **Defect:** `trade_invoices` was created with a mutable `status` and **no immutability trigger** — so `amount`/`currency`/`human_ref` could be silently UPDATEd after issue. For a status-tracked financial document, the money facts must be frozen once issued (a correction = a new document), with only `status`/`due_date` mutable.
**Fix (applied):** added a **column-scoped** trigger via `core.raise_immutable_violation` protecting `id`/`human_ref`/`engagement_id`/`amount`/`currency`/`created_at`/`created_by`; `status`/`due_date` remain mutable; DELETE blocked. Consistent with `payment_records` (money facts frozen, status toggles) and the Doc-6D `spec_documents` pattern. **VERIFIED** against the Doc-6B §4 body (all protected cols passed as `TG_ARGV`).

### MINOR HR-F2 — `generated_documents.source_entity_id` polymorphic, FK-less
Confirmed **bare-UUID by design** — Doc-2 §10.5 makes it a cross-entity reference (rfq/quotation/engagement doc); a single FK is impossible; service-validated + orphan-scan. No change.

### NIT HR-F3 — `vendor_favorites` (M4) vs `catalog_favorites` (M2) name proximity
Confirmed **distinct + correct** — M4 `vendor_favorites` is the buyer's private favorited-vendor flag (relationship-scoped); M2 `catalog_favorites` is the platform-catalog product/category favorite. Different owners, different scope. No change.

---

## 4 — Cross-pass integration checks (PASS)

| Seam | Result |
|---|---|
| **Immutability vs Doc-6B §4** | `buyer_vendor_statuses` column-scoped (minus `effective_to`); post-award docs column-scoped (content frozen, `is_active_revision` toggles); `trade_invoices` column-scoped (minus status/due_date — **HR-F1 fix**); `template_versions`/`generated_documents`/`lead_activities` full append-only — all pass all-cols `TG_ARGV`; no PERFORM-of-trigger-fn; no empty-args UPDATE-open | PASS |
| **Two-sided party RLS terminates** | child docs `EXISTS(engagements e …)` bottoms out at the simple party predicate `active_org IN (buyer_organization_id, vendor_controlling_org_id)`; non-circular | PASS |
| **Enum singletons** | each `CREATE TYPE operations.*` once across the 3 passes; §7 creates all enums first | PASS |
| **Deferred FK closure** | Pass-2 `lois/po/challans/wcc.template_version_id` → `template_versions` (Pass-3) → closed in §7 | PASS |
| **human_ref carriers** | `ENG-` (§2.5-carried) · `DOC-` · `INV-` via `core.allocate_human_ref`; distinct prefixes | PASS |
| **Governance firewall** | private ratings + Buyer Vendor Status never written to any M5 table; buyer feedback → M5 via event only | PASS |
| **Coin-nothing** | nothing coined; `[ESC-OPS-AUDIT]` carried | PASS |
| **Appendix A** | 37/37 (Pass-3); N/A 033/062; 043 PASS-with-carry; 022 in-scope PASS | PASS |

---

## 5 — Decision

**1 MAJOR found + FIXED (`trade_invoices` money immutability); 0 BLOCKER; 2 MINOR/NIT confirmed-by-design.** The gate caught a genuine financial-integrity gap (mutable invoice amounts) the per-pass review missed, and verified the two load-bearing properties — non-disclosure (the blacklist's owning side) and the money-boundary (no funds custody) — end-to-end. Coverage 19/19; immutability correct against Doc-6B §4; two-sided RLS terminates.

**Authorized next step:** **Content Freeze Audit** → `Doc-6F_SERIES_FROZEN_v1.0` → fold corpus. **Carried:** `[ESC-OPS-AUDIT]`; `ENG-` prefix (§2.5).

---

*End of Doc-6F Content Hard Review v1.0 (cross-pass). 1 MAJOR (`trade_invoices` money immutability) found + FIXED; non-disclosure + money-boundary verified end-to-end; immutability matches Doc-6B §4; coverage 19/19. On any conflict, Doc-2 and Doc-6A win; flag-and-halt. Next: Content Freeze Audit → `Doc-6F_SERIES_FROZEN`.*
