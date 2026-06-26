# Doc-6F — M4 Business Operations (`operations`) Schema Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-6F Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | **M4 — Business Operations** (`operations` schema) — the **private Vendor CRM (the blacklist's owning side — non-disclosure #11)** + the **two-sided engagement (party-column RLS)** + the **money-record boundary (no funds custody)** |
| Realizes | **Doc-2 §10.5** — **19 tables / 6 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A 37/37); **Doc-2 v1.0.3 = binding *what*-authority**; consistent-with Doc-5F; consumes Doc-6B (`core`) + Doc-6C/6D/6E (UUID + event/service) |
| Freeze evidence | `Doc-6F_Content_Freeze_Audit_v1.0.md` — PASS; 0 open BLOCKER/MAJOR/MINOR; 7 phases PASS. Cross-pass `Doc-6F_Content_Hard_Review_v1.0.md` — 1 MAJOR (trade_invoices money immutability) fixed; non-disclosure + money-boundary verified end-to-end |

---

## Effective set (the authoritative Doc-6F)

| Artifact | Role |
|---|---|
| `Doc-6F_Structure_v1.0_FROZEN.md` | Frozen structure — OP-CR1–CR12, 19-table partition, non-disclosure + two-sided-party RLS model, state machines, money-boundary firewall, Appendix-A map |
| `Doc-6F_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-6F_Content_v1.0_Pass1.md` | §0–§2 RLS model · Private Vendor CRM + Relationship (the blacklist `buyer_vendor_statuses`; non-disclosure) |
| `Doc-6F_Content_v1.0_Pass2.md` | Engagement + post-award docs (two-sided party RLS; versioned immutability; money-record boundary; `trade_invoices` ≠ platform_invoices) |
| `Doc-6F_Content_v1.0_Pass3.md` | Finance · Document Templates · Vendor Leads · §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A (37/37, 0 FAIL) |
| `Doc-6F_Content_Hard_Review_v1.0.md` | Cross-pass review — HR-F1 `trade_invoices` money immutability fixed; non-disclosure + money-boundary verified end-to-end across 19 tables |
| `Doc-6F_Content_Freeze_Audit_v1.0.md` | Content freeze certification (PASS) |

---

## What Doc-6F realizes (the `operations` schema)

- **19 tables / 6 groupings** (Doc-2 §10.5), columns verbatim: Private CRM (+notes/ratings), Relationship (+blacklist/favorites), Engagement (+lois/po/challans/wcc/trade_invoices/payment_records), Finance, Templates (+versions/generated), Leads (+activities).
- **Non-disclosure — the OWNING side** (Invariant #11; governance signal #5) — the blacklist `buyer_vendor_statuses` + the private CRM + finance are **strictly `organization_id`-tenant: no vendor policy, no admin-all**; byte-equivalence in-scope (CHK-6-022); served to M3 routing **only via the CRM service**. **Buyer Vendor Status + private ratings never mutate platform scores** (firewall). `buyer_vendor_statuses` = set/cleared immutable history (current `WHERE effective_to IS NULL`).
- **Two-sided engagement RLS via PARTY COLUMNS** (Doc-2 §6) — `engagements` + post-award docs shared via `buyer_organization_id` + `vendor_controlling_org_id`; RLS = `active_org IN (…)` OR admin; children anchor on the parent engagement (intra-schema, terminates). The second two-sided pattern (M3 = grant rows; M4 = named party columns).
- **Money-record boundary — no funds custody** — `trade_invoices`/`payment_records`/`finance_records`/`engagements`/`vendor_leads` all `NUMERIC`+currency; **no balance/gateway/escrow/wallet/settlement column anywhere**; `trade_invoices ≠ billing.platform_invoices`; money facts immutable (column-scoped). The platform never holds buyer↔vendor money.
- **Versioned post-award documents** — `lois`/`purchase_orders`/`challans`/`work_completion_certificates`/`trade_invoices`/`generated_documents` versioned + column-scoped immutability (content frozen; only `is_active_revision`/`status` toggles); `template_versions`/`lead_activities` full append-only — via `core.raise_immutable_violation` (Doc-6B §4).
- **State machines** — engagement `status`, document-template §5.9, trade-invoice/payment/buyer-vendor-status, vendor-lead `stage`, private-record `link_status`; enum + CHECK; `engagements` on M3 award; `vendor_leads` on `VendorInvited` (idempotent via `UNIQUE(invitation_id)`).
- **`human_ref` carriers** — `engagements` (`ENG-…`, §2.5), post-award docs + `generated_documents` (`DOC-…`), `trade_invoices` (`INV-…`) via `core.allocate_human_ref`.
- **Cross-module = bare UUID, no cross-schema FK** (`vendor_profile_id`/`linked_vendor_profile_id`→M2; `rfq_id`/`invitation_id`→M3; `organization_id`/party-orgs/user-ids→M1; polymorphic `source_entity_id`); in-module FKs; M8-suggested/M4-confirmed link lifecycle; coins nothing.

## Carried items

`DR-6-CORE` (consumed) · `DR-6-STATE` (machines) · `DR-6-API` (Doc-5F Band H) · DD-MKT/RFQ/TRUST/ADMIN · **Invariant #11** (realized — non-disclosure owning side, in-scope CHK-6-022) · **Money boundary** (realized — no funds custody) · **`[ESC-OPS-AUDIT]`** (post-award/finance audit actions vs Doc-2 §9 — bind nearest by pointer) · `ENG-` `human_ref` prefix (§2.5) · `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.4). Carry-forward to **Doc-8**: RLS positive/negative/cross-tenant + the in-scope non-disclosure byte-equivalence + two-sided party tests (Doc-6A §11.5) — schema satisfiable.

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (2 MAJOR — non-disclosure scope + two-sided party-column clarity) → v0.2 → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1/2/3 each per-pass-reviewed (non-disclosure RLS, status immutability, ratings firewall, no-funds-custody, invoice firewall, doc immutability, counterparty grant, lead idempotency) · **cross-pass Content Hard Review** (**HR-F1** — `trade_invoices` money fields freely mutable — found + fixed; non-disclosure + money-boundary verified end-to-end) · Content Freeze Audit (PASS).

---

*Doc-6F (M4 `operations` schema) is FROZEN. Realizes Doc-2 §10.5's 19 tables on PostgreSQL/Supabase + Prisma `multiSchema` against frozen Doc-6A — the private Vendor CRM (blacklist owning side, non-disclosure #11: no vendor / no admin-all), the two-sided engagement (party-column RLS), the money-record boundary (no funds custody; `trade_invoices ≠ platform_invoices`); governance signal #5 never mutates platform scores; coins nothing. Carried: Invariant #11 + money boundary (realized) + `[ESC-OPS-AUDIT]`. On any conflict with Doc-2/Doc-6A or the frozen corpus, the frozen corpus wins; flag-and-halt. Next: Doc-6G (M5 `trust`) — the governance-signal owner (the firewall's authoritative side).*
