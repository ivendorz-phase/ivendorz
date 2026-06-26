# Doc-7F — Content Pass-2 **Patch v1.0.1** (applies Pass-2 Independent Hard Review) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7F_Content_v1.0_Pass2.md` (§4–§7) |
| Applies | `Doc-7F_Content_Pass2_Independent_Hard_Review_v1.0.md` (1 MAJOR + 2 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-2 **+ this patch** = clean §4–§7 |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Pass-3 (§8–§10 + Appendix) |
| Discipline | Additive; nothing coined; two-sided actor legs corrected against the frozen surface |

---

## Changes

### C-1 — closes **MAJOR-1** (BC-OPS-2 split by actor leg; `issue_trade_invoice` is vendor)
§7.2 amended — BC-OPS-2 split by the two-sided actor branch (`Doc-5F` line 42):
- **Buyer leg (bound here):** `update_engagement_status`, `close_engagement`, `record_buyer_feedback`, **buyer-issued** `issue_engagement_document`/`revise_engagement_document` (LOI/PO; WCC sign-off where the buyer certifies), `update_trade_invoice_status` (buyer approves/updates), **`record_payment`/`confirm_payment`** (buyer records that money moved — R8), + reads (`get_engagement`/`list_engagements`/`get_engagement_document`).
- **Vendor leg (Doc-7G, NOT here):** **`issue_trade_invoice`** (the vendor bills the buyer), vendor-issued documents (delivery **challan**), **`record_delivery`**.
- **`issue_trade_invoice` is NOT buyer-bound.** Each command's buyer/vendor leg is confirmed at content (bind-or-ESC); the buyer **receives/approves/pays** the vendor's invoice, never issues it.

### C-2 — closes **MINOR-1** (`generate_document` trigger vs call)
§7.4 amended: **`generate_document` is a System async job (§9 out-of-wire) — never frontend-callable.** A **buyer command** (issuing a document from a template) **triggers** the System generation; the UI **reads** the result via the **grant model** (`grant_generated_document`/`revoke_generated_document_grant`/`get_generated_document`/`list_generated_documents`). The UI never calls `generate_document`.

### C-3 — closes **MINOR-2** (routing-log non-disclosure)
§4.3 amended: the routing log shows the **positive outcome** — invited vendors + explainable reasons — but the buyer **never sees the set of non-invited / engine-excluded vendors or the exclusion reasons** (protected; `Doc-5E R5`). An excluded vendor's absence is non-disclosed.

### C-4 — closes **NITPICK-1** (Doc-4M labels)
§6.4 amended: `award_rfq` → the Doc-4M `closed_won` state and `close_lost_rfq` → `closed_lost` are bound to the **Doc-4M RFQ state labels by pointer** (confirmed at content); not coined.

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MAJOR-1 issue_trade_invoice vendor-leg | MAJOR | C-1: split BC-OPS-2; buyer receives/pays, vendor issues (→ 7G) | **CLOSED** — wrong-actor binding eliminated |
| MINOR-1 generate_document | MINOR | C-2: command triggers System async; UI reads via grant | **CLOSED** |
| MINOR-2 routing-log non-disclosure | MINOR | C-3: positive-only; excluded vendors non-disclosed | **CLOSED** |
| NITPICK-1 Doc-4M labels | NIT | C-4 | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** Two-sided actor legs respected (buyer receives/pays the vendor's trade invoice; the vendor issues it — Doc-7G); System async generation triggered-not-called; routing non-disclosure sharpened. Nothing coined.

**Next pass:** Content Pass-3 (§8–§10 + Appendix) — buyer-private CRM never leaks (§8), state-machine/firewall/non-disclosure (§9), composition/data/authz/baseline/conformance (§10), view/contract-binding skeleton (Appendix).

*End of Content Pass-2 Patch v1.0.1 + Short Closure Check. Effective §4–§7 = Pass-2 + this patch. Additive; nothing coined; actor legs corrected.*
