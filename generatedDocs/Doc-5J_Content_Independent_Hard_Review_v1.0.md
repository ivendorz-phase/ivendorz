# Doc-5J — Admin Operations (M8) — Content Independent Hard Review v1.0

| Field | Value |
|---|---|
| Reviews | `Doc-5J_Content_v1.0_Pass1.md` (§0–§3 + inventory) · `…Pass2.md` (§4–§6) · `…Pass3.md` (§7–§11 + Appendix A) — 34 tokens (32 caller + 2 out-of-wire) |
| Stance | Independent board-level adversarial review. Every token/slug/machine/error/event traced against `Doc-4J_FROZEN_v1.0` (§H + BC-ADM-1…6) and `Doc-5A §5.5/§5.6/§6.2/§8`, `Doc-4A §9.7/§12.2` |
| Verdict | **CONDITIONAL PASS** — 0 BLOCKER · 0 MAJOR · 2 MINOR · 3 NITPICK. Wire-conformant + Doc-4J-traced; **content freeze gated only by `[ESC-ADM-POLICY]`** (the `admin.*` Doc-3 v1.7 registration — a corpus-channel obligation, not a defect) |
| Findings | **0 BLOCKER · 0 MAJOR · 2 MINOR · 3 NITPICK** |

> **Headline:** Doc-5J was authored field-traced from the start (the Doc-5I lesson applied), so the taxonomy/envelope/field defects that plagued Doc-5I Pass-2 are absent here. Error classes, envelope, pagination, prohibited-field discipline, single-actor model, single-event, firewalls (R5/R7/R8), and out-of-wire fencing all hold. Remaining items are field-name precision + the standard POLICY gate.

---

## Verified solid (no change)

- **Partition closure:** 32 caller (§4:5·§5:4·§6:7·§7:4·§8:5·§9:7) + 2 out-of-wire = 34; each token assigned once; matches frozen structure.
- **Single actor / no active-org / no delegation** (R2) — §3.1; org context never carried; actor server-determined (no §9.7 assertion field).
- **Error taxonomy** — §3.8 = `Doc-5A §6.2` verbatim; `REFERENCE`≠`DEPENDENCY`, `STATE`≠`CONFLICT` separated throughout; no `BAD_REQUEST`; `VALIDATION`=400. Per-contract tables list only raisable classes.
- **Envelope/pagination** — §3.9 `{result|items, page_info, reference_id}`; `page_size`+`cursor`; bounds via `[ESC-ADM-POLICY]`; `reference_id` C-05 nominated §4.
- **Slugs** — frozen four + `[ESC-ADM-SLUG]` (12 commands) + `staff_super_admin` override; per-command bound-slug register (§3.7, 19 commands) + per-root suggestion binding (§6.3). No slug coined.
- **Machines** — 8 frozen lifecycles by pointer (§3.4); `expected_state` concurrency → `CONFLICT`; transitions match Doc-4J §H.5.
- **Single event** — only `issue_ban` → `VendorBanned` (M0 outbox); BC-ADM-1/3/4/5/6 No Event; `lift_ban` no event (DD-8 Marketplace-side); moderation decision consumed RFQ-side with no M8 write/event (R7).
- **Firewalls** — R5 (every cross-module write = out-of-wire service leg §10; no domain bypass), R7 (moat; outreach informational), R8 (`verification_tasks ≠ trust.verification_records`; decision via Trust service). All correct.
- **Path grammar** — creates→201 (incl. `submit_import_job` R10, `add_outreach_contact` child), commands→200, reads→200; `run`/`complete_outreach` correctly plain 200 (not async).

---

## MINOR

### m-01 — `add_outreach_contact` request field `vendor_ref_id` is not the Doc-4J field name
**Where:** Pass-3 §9.2 `add_outreach_contact` request — `"vendor_ref_id": "uuid …"`.
**Authority:** `Doc-4J` BC-ADM-6 contract precision states the target as **`vendor_*_id`** (a wildcard — the exact field name is not pinned in Doc-4J). Coining `vendor_ref_id` invents a field name not in the frozen contract.
**Fix:** name it the Doc-4J `vendor_*_id` target reference by pointer, or carry `[ESC-ADM-FIELD]` pending the Doc-4J PassB exact field — do not coin `vendor_ref_id`. (Same caution as Doc-5I's `[ESC-BILL-FIELD]`.)

### m-02 — `submit_import_job` `201`-vs-`202` resolved without quoting the Doc-4J response shape verbatim
**Where:** Pass-3 §7.2 + §11.1 assert lean `201` per R10.
**Authority:** Structure R10 mandates "confirm the exact success code **from the Doc-4J response** at content; `202` only if Doc-4J models no synchronous resource." Doc-4J BC-ADM-4 response = `job_id`, `state=queued`, `reference_id` — a synchronous resource → `201` is correct. But the content does not **quote** that response shape at the decision point; it asserts the conclusion.
**Fix:** add the one-line Doc-4J response quote (`job_id` + `state=queued`) as the explicit `201` justification, so the resolution is auditable, not asserted. (No status change — `201` stands.)

---

## NITPICK

### n-01 — `filter` allowlists cite read-model views, not a per-field Doc-4J anchor
§4.3/§5.3/§7.3/§8.3/§9.3 list filter dimensions (`state`, `subject_type`, `assigned_to`, `job_type`, `root`). These trace to the Doc-4J "admin search view" read models, but the content cites them generically. Add the `Doc-4J` read-model pointer per list (cheap; strengthens the trace).

### n-02 — `create_outreach_campaign` request body is `{ "...": "campaign attributes" }`
Doc-4J itself is vague here ("campaign attributes"). Acceptable, but flag `[ESC-ADM-FIELD]` (like m-01) so the placeholder is not read as a final schema; resolve against Doc-4J PassB field registry at implementation.

### n-03 — `scope` field on `issue_ban` carries no type
Pass-2 §5.2 `issue_ban` request lists `"scope": "(required; Doc-4J BC-ADM-2)"` with no type. Doc-4J names `scope` without a pinned enum/type. Annotate as Doc-4J-typed-at-PassB or `[ESC-ADM-FIELD]`; minor precision.

---

## Content-freeze gate (not a finding — corpus channel)

**`[ESC-ADM-POLICY]` — the single content-freeze gate.** The wire-referenced `admin.*` POLICY keys (idempotency dedup-window, list page-size) must be registered via an additive `Doc-3 §12.2` patch before the Content Freeze Audit certifies. **Next free version = `v1.7`** (v1.0–v1.6 taken: core/rfq/marketplace/trust/operations/communication/billing). Content-pass flag (per structure): confirm registration under `admin.*` vs the already-named `moderation.*` set (`Doc-4J §H.8`/App B). Every prior module cleared its `[ESC-*-POLICY]` this way — same path here.

---

## Required actions before Content Freeze Audit

1. **m-01 / n-02 / n-03:** replace coined/placeholder field names (`vendor_ref_id`, "campaign attributes", untyped `scope`) with Doc-4J pointers or `[ESC-ADM-FIELD]` — never coin a field.
2. **m-02:** quote the Doc-4J `submit_import_job` response shape as the `201` justification.
3. **n-01:** add per-list Doc-4J read-model pointers for filter allowlists.
4. **Gate:** create `Doc-3_Policy_Key_Registration_Patch_v1.7_Admin` (`admin.*` keys) → clears `[ESC-ADM-POLICY]`.

---

*Independent review. Doc-5J content is Doc-5A-conformant and traces verbatim to Doc-4J; the field-traced-from-the-start discipline kept it clean (0 BLOCKER/MAJOR). The only freeze blocker is the standard `[ESC-ADM-POLICY]` Doc-3 v1.7 registration; the MINOR/NITPICK items are field-name precision, fixable additively in the content pass.*
