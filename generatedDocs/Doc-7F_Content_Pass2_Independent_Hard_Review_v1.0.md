# Doc-7F — Content Pass-2 (§4–§7) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7F_Content_v1.0_Pass2.md` (§4–§7) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Doc-5F two-sided actor-leg + moat conformance |
| Verdict | **NOT YET PASS** — 1 MAJOR + 2 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Pass-3 |

---

## Anchors verified CORRECT

- §4 observability caller legs (`get_routing_log`/`get_invitation`/`list_invitations`); `get_matching_results` correctly NOT bound — verified `Doc-5E §7`. CORRECT.
- §6 comparison/award (`get_comparison_statement` engine-generated; `award_rfq` explicit; **AI never recommends** — R6) — CORRECT (carries the structure moat guard).
- §7.1 post-award seam — engagement created by System (`create_engagement_on_award`, §9 out-of-wire — `Doc-5F R7`), buyer manages after. CORRECT.
- §7.3 money-boundary R8 (records, not settlement; trade invoice ≠ platform billing). CORRECT.

0 BLOCKER. One two-sided actor-leg misbinding (MAJOR) + two refinements + one nit.

### MAJOR-1 — §7.2 blanket-assigns `issue_*` commands to the buyer; `issue_trade_invoice` is the **vendor** leg
BC-OPS-2 is **two-sided (buyer/vendor)** actor-branched (`Doc-5F` line 42). §7.2 lists **`issue_trade_invoice`** and **`issue_engagement_document` (LOI/PO/WCC)** under the buyer leg — but a **trade invoice is issued by the vendor** (the vendor bills the buyer); the buyer **receives / approves / pays** it (`update_trade_invoice_status`, `record_payment`, `confirm_payment`). Likewise, some engagement documents are **vendor-issued** (e.g. delivery **challan**) while LOI/PO are buyer-issued.
**Required fix:** §7.2 **split BC-OPS-2 by actor leg** — the **buyer leg** binds the documents the **buyer issues** (LOI/PO; possibly WCC sign-off), `update_engagement_status`, `close_engagement`, `record_buyer_feedback`, `update_trade_invoice_status`, `record_payment`, `confirm_payment`; the **vendor leg** (`issue_trade_invoice`, delivery challan, `record_delivery`) is **Doc-7G**. Confirm each command's buyer/vendor leg at content; **`issue_trade_invoice` is NOT buyer-bound** here (bind-or-ESC; the buyer receives/pays, never issues, the vendor's invoice).

### MINOR-1 — §7.4 the UI cannot call `generate_document` (System out-of-wire)
§7.4 says "the UI requests/reads generated documents," but `generate_document` is a **System async job** (§9 out-of-wire) — **not frontend-callable**.
**Required fix:** §7.4 clarify — a **buyer command** (e.g. issuing a document from a template) **triggers** the System async `generate_document`; the UI **never calls `generate_document`** and **reads** the result via the **grant model** (`grant_generated_document`/`get_generated_document`). Generation is System; the UI triggers via the wired command and reads via the grant.

### MINOR-2 — §4 strengthen the routing-log non-disclosure (no view of excluded/non-invited vendors)
§4.3 covers explainability/R5; sharpen: the routing log shows **invited vendors + reasons**, but the buyer **cannot see non-invited / engine-excluded vendors** (those exclusions are protected — `Doc-5E R5`; an excluded vendor's absence is non-disclosed).
**Required fix:** §4.3 state the buyer sees the **positive** routing outcome (who was invited, explainably) but **never** the set of excluded/non-invited vendors or the reasons for exclusion (protected; R5).

### NITPICK-1 — §6.4 confirm Doc-4M `closed_won`/`closed_lost` labels
§6.4 names `closed_won`/`closed_lost` states.
**Required fix:** bind these to the Doc-4M RFQ state labels by pointer (confirm at content); don't coin.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MAJOR-1 `issue_trade_invoice` vendor-leg misbinding | MAJOR | Content Patch — split BC-OPS-2 by leg |
| MINOR-1 `generate_document` not UI-callable | MINOR | Content Patch — trigger-via-command + read-via-grant |
| MINOR-2 routing-log excluded-vendor non-disclosure | MINOR | Content Patch — positive-only view |
| NITPICK-1 Doc-4M closed_won/lost labels | NIT | Content Patch — bind by pointer |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR. 1 MAJOR + 2 MINOR open → **Content Patch required**, then short closure check, then Content Pass-3 (§8–§10 + Appendix).

*End of Content Pass-2 Independent Hard Review. Nothing coined; no frozen document edited. The MAJOR is a two-sided actor-leg misbinding (`issue_trade_invoice` is the vendor's, not the buyer's) caught against the BC-OPS-2 buyer/vendor branch.*
