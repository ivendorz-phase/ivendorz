# Doc-4E_PassB_Part4_Patch_v1.0.md

## Status

**Approved Pass-B Part-4 Patch** — applies the Architecture-Board-accepted findings of `Doc-4E_PassB_Part4_Independent_Hard_Review_v1.0` to `Doc-4E_Content_v1.0_PassB_Part4_QuotationManagement.md`. Targeted surgical patching only — no rewrite.

| Field | Value |
|---|---|
| Applies to | `Doc-4E_Content_v1.0_PassB_Part4_QuotationManagement.md` |
| Produces | Part 4 as amended by this patch (canonical input to Pass-B Part-4 Patch Verification) |
| Board adjudication | **Apply:** PB4-MA1, PB4-MA2, PB4-M1, PB4-M2. **Optional:** PB4-N1, PB4-N2 — see §4 (not applied; no actionable content provided). |
| Scope | One transition-ownership correction (first-quote RFQ edge → owned by `submit_quotation`); one sealed-until-close POLICY binding on quotation reads; one REFERENCE validation row (`invitation_id`); one two-step-flow clarification (late-extension). **No rewrite, no redesign, no Pass-A reopen.** |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN, Doc-4E_PassB_Part1/2/3_v1.0_FROZEN — all FROZEN |
| Application model | Additive amendment document (Board-applied). Each item quotes the exact **Before** text present verbatim in the base Part-4, gives the **After**, and states the rationale. |

All frozen ownership boundaries, lifecycle/state machines, event catalog, audit catalog, authorization model, and the procurement moat are preserved. This patch **invents no event, slug, audit action, POLICY key, state, or transition** — `abuse.sealed_until_close` (PB4-MA2) is an existing Doc-3 §12.2 POLICY key; the first-quote edge (PB4-MA1) is the existing Doc-2 §5.4 `vendors_notified → quotations_received` edge, only its *owning contract* is corrected. Carried dependencies DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`, `[ESC-RFQ-SLUG]` carried unchanged.

---

# 1. Patch Summary

| Finding | Severity | Location | Disposition |
|---|---|---|---|
| **PB4-MA1** | MAJOR | §E7.1 State Machine Enforcement + Conformance Summary | **APPLIED** — added the RFQ-head transition `vendors_notified → quotations_received` (first quotation) as **owned by `submit_quotation.v1`**; removed the incorrect "Part-1-owned edge" wording from the Conformance Summary. |
| **PB4-MA2** | MAJOR | §E7.5 (Quotation Reads) | **APPLIED** — bound `abuse.sealed_until_close` (existing Doc-3 §12.2 key): Stage-9 POLICY validation row + response-visibility note + AI-Agent note; sealed cells hide price breakdowns / protected commercial terms from buyer reads before window close. |
| **PB4-M1** | MINOR | §E7.1 Validation Matrix | **APPLIED** — added an explicit Stage-7 REFERENCE row resolving `invitation_id` → `rfq_invitations` (failure `NOT_FOUND`). |
| **PB4-M2** | MINOR | §E7.4 (Late-Quote Extension) | **APPLIED** — clarified the two-step flow (Phase 1 vendor request / Phase 2 buyer approve-deny): actor responsibilities, validation expectations, `buyer_decision` conditionality. |
| **PB4-N1** | (optional) | — | **NOT APPLIED** — no actionable content provided in the request (finding text/location absent); applying blind would risk fabrication. Carried for a future cycle if specified. |
| **PB4-N2** | (optional) | — | **NOT APPLIED** — same reason as PB4-N1. |

PB4-MA1/MA2/M1/M2 applied. PB4-N1/N2 not applied (no content provided — not fabricated). Nothing invented.

---

# 2. Exact Changes

> Each change quotes the **Before** text exactly as it appears in `Doc-4E_Content_v1.0_PassB_Part4_QuotationManagement.md` and gives the **After**. Anchors verified verbatim against the base.

### PB4-MA1 (a) — §E7.1 State Machine Enforcement — add the first-quote RFQ-head transition, owned here

**Location:** §E7.1 `rfq.submit_quotation.v1` — section **6. State Machine Enforcement**.

**Before:**

```
**6. State Machine Enforcement** — Allowed source **`draft`** (or first submit creating the quotation) · Target **`submitted`** (Doc-2 §5.5) · Forbidden: submitting against an already-`submitted`/terminal quotation → `STATE`/`CONFLICT` · Concurrency: **partial `UNIQUE(rfq_id, vendor_profile_id) WHERE state IN ('draft','submitted')`** enforces one active quotation per vendor (Doc-2 §10.4); the invitation advances `→ accepted` on submit (Doc-3 §8.1); a second representative attempting a parallel quote is shown the existing draft/quote (replace/revise/withdraw), conflict surfaced inside the vendor's own house, never to the buyer (Doc-3 §2.8). **No edge invented.**
```

**After:**

```
**6. State Machine Enforcement** — Allowed source **`draft`** (or first submit creating the quotation) · Target **`submitted`** (Doc-2 §5.5) · **RFQ-head transition owned by this contract:** when the submitted quotation is the **first** for the RFQ and the RFQ is in `vendors_notified`, `rfq.submit_quotation.v1` drives **`vendors_notified → quotations_received`** (Doc-2 §5.4) **within the same transaction** as the quotation write + `QuotationSubmitted` outbox insert (single-transaction rule, Doc-4A §16 / Doc-2 §10.11.4; bound to Pass-A §E7). This edge is **owned by `submit_quotation.v1`** (not Part 1) — Part 1 owns the other RFQ-head edges (`expire`, etc.), but the first-quotation trigger originates here. · Forbidden: submitting against an already-`submitted`/terminal quotation → `STATE`/`CONFLICT` · Concurrency: **partial `UNIQUE(rfq_id, vendor_profile_id) WHERE state IN ('draft','submitted')`** enforces one active quotation per vendor (Doc-2 §10.4); the invitation advances `→ accepted` on submit (Doc-3 §8.1); a second representative attempting a parallel quote is shown the existing draft/quote (replace/revise/withdraw), conflict surfaced inside the vendor's own house, never to the buyer (Doc-3 §2.8). **No edge invented** (the `vendors_notified → quotations_received` edge is the existing Doc-2 §5.4 edge; only its owning contract is fixed here).
```

### PB4-MA1 (b) — Conformance Summary — remove the incorrect "Part-1-owned edge" wording

**Location:** Part-4 Conformance Summary table, `rfq.submit_quotation.v1` row.

**Before:**

```
| `rfq.submit_quotation.v1` | 21.4 Command | `draft → submitted` (+ first-quote drives RFQ `vendors_notified → quotations_received`, Part-1-owned edge) | `QuotationSubmitted` | Quotation "submit" | DE-1/DE-7/DE-8 · `[ESC-RFQ-POLICY]` (dedup) |
```

**After:**

```
| `rfq.submit_quotation.v1` | 21.4 Command | `draft → submitted`; **owns `vendors_notified → quotations_received`** on first quotation (Doc-2 §5.4; same transaction) | `QuotationSubmitted` | Quotation "submit" | DE-1/DE-7/DE-8 · `[ESC-RFQ-POLICY]` (dedup) |
```

**Rationale (PB4-MA1 a+b):** The first-quotation RFQ-head transition `vendors_notified → quotations_received` is triggered by quotation submission, so it is correctly **owned by `submit_quotation.v1`**, executed in the same transaction as the quotation write and `QuotationSubmitted` emission (Doc-4A §16 / Doc-2 §10.11.4). The prior wording mislabeled it "Part-1-owned edge"; Part 1 owns the *other* RFQ-head edges, not this trigger. **No edge added or modified** — the `vendors_notified → quotations_received` edge is the existing Doc-2 §5.4 edge; only its owning contract is corrected. Consistent with the Cross-Part Consistency Audit (which already noted this edge as owned by Part-4 submit, not Part-1).

---

### PB4-MA2 — §E7.5 — bind `abuse.sealed_until_close` to quotation reads (sealed-cell confidentiality)

**Location 1:** §E7.5 — section **4. Validation Matrix**, add a Stage-9 POLICY row after the Stage-7 REFERENCE row.

**Before:**

```
| reference | 7 REFERENCE | Doc-4A §9.5 | `quotation_id`/`rfq_id` exists + visible | `NOT_FOUND` |
```

**After:**

```
| reference | 7 REFERENCE | Doc-4A §9.5 | `quotation_id`/`rfq_id` exists + visible | `NOT_FOUND` |
| sealed-until-close (buyer reads) | 9 POLICY | Doc-3 §10.1; §12.2 `abuse.sealed_until_close` (per cell) | when `abuse.sealed_until_close = true` for the RFQ's cell, **buyer** quotation reads MUST NOT expose price breakdowns or protected commercial terms before quotation-window close (quotation detail withheld until close in flagged cells) | `BUSINESS` (read is permitted but the sealed fields are redacted from the projection — not an error; a request that explicitly demands sealed fields pre-close → `BUSINESS`) |
```

**Location 2:** §E7.5 — section **3. Response Schema**, add a visibility note to the `quotation` / `items` row.

**Before:**

```
| `quotation` / `items` | `quotation_projection` (`state`, `current_version_no`, version terms per scope) | 1 / 0..N | Doc-2 §10.4 |
```

**After:**

```
| `quotation` / `items` | `quotation_projection` (`state`, `current_version_no`, version terms per scope) | 1 / 0..N | Doc-2 §10.4 |
| *(sealed-cell note)* | when `abuse.sealed_until_close = true` for the RFQ's cell and the quotation window is **open**, the **buyer-facing** projection **omits** price breakdowns and protected commercial terms (Doc-3 §10.1 / §12.2 `abuse.sealed_until_close`); the vendor's own read of its own quotation is unaffected (vendor isolation already applies) | — | Doc-3 §10.1; §12.2 |
```

**Location 3:** §E7.5 — section **12. AI-Agent Implementation Notes**.

**Before:**

```
**12. AI-Agent Implementation Notes** — **Vendor isolation is absolute:** a vendor reads only its own quotation (`controlling_organization_id` anchor + grantee/visibility); a buyer reads only via `quotation_visibility`; **no vendor ever sees another vendor's quotation** and no-access ≡ not-found (§7.5). One vendor = one active quotation regardless of representative count (Doc-3 §2.8). Filter/sort fields allowlisted (§9.6).
```

**After:**

```
**12. AI-Agent Implementation Notes** — **Vendor isolation is absolute:** a vendor reads only its own quotation (`controlling_organization_id` anchor + grantee/visibility); a buyer reads only via `quotation_visibility`; **no vendor ever sees another vendor's quotation** and no-access ≡ not-found (§7.5). One vendor = one active quotation regardless of representative count (Doc-3 §2.8). Filter/sort fields allowlisted (§9.6). **Sealed-until-close (PB4-MA2):** when `abuse.sealed_until_close = true` for the RFQ's cell (POLICY, per cell — Doc-3 §12.2; behavior Doc-3 §10.1), the **buyer-facing** quotation projection MUST withhold price breakdowns and protected commercial terms **until the quotation window closes** (anti-farming control — quotation detail withheld until close in flagged cells). This is a **read-projection redaction**, not a new state and not a quotation-visibility change; the vendor's own read is unaffected; **bind the POLICY by key, never hardcode the flag**.
```

**Rationale:** Corpus-verified — `abuse.sealed_until_close` is an existing Doc-3 §12.2 POLICY key (Abuse/Econ domain) whose behavior (Doc-3 §10.1) withholds quotation detail until window close in flagged cells, as an RFQ-farming counter. The patch binds it on the buyer read path as a POLICY-keyed projection redaction (Stage-9 POLICY row + response note + AI note). **No behavior invented** (the rule is Doc-3's); no new state, no quotation_visibility change, no new POLICY key. Vendor isolation and the existing visibility model are unchanged.

---

### PB4-M1 — §E7.1 Validation Matrix — add Stage-7 REFERENCE for `invitation_id`

**Location:** §E7.1 — section **4. Validation Matrix**, add a Stage-7 REFERENCE row alongside the existing version-binding REFERENCE row.

**Before:**

```
| version binding | 7 REFERENCE | Doc-2 §5.5; Doc-3 §8.1 | priced against the **current** `rfq_version_id`; a quote opened against an older version forces re-confirm | `REFERENCE` (stale version) |
```

**After:**

```
| `invitation_id` resolves | 7 REFERENCE | Doc-4A §4.5/§9.5; Doc-2 §10.4 (RFQ Invitation aggregate) | `invitation_id` MUST resolve to an existing `rfq_invitations` record for the (RFQ, vendor) | `NOT_FOUND` (protected-fact collapse, §7.5 — a non-resolving or non-visible invitation is indistinguishable from not-found) |
| version binding | 7 REFERENCE | Doc-2 §5.5; Doc-3 §8.1 | priced against the **current** `rfq_version_id`; a quote opened against an older version forces re-confirm | `REFERENCE` (stale version) |
```

**Rationale:** The §E7.1 Request Schema declares `invitation_id`, and the precondition is a delivered invitation, but the Validation Matrix resolved only the `rfq_version_id` at Stage 7. The added Stage-7 REFERENCE row makes the `invitation_id → rfq_invitations` resolution explicit. **Failure-class note:** per Doc-4A §12.4 / §7.5, a non-resolving or non-visible invitation **collapses to `NOT_FOUND`** (preserving vendor isolation), consistent with the Part-3 PB3-M1 treatment of the same pattern in `respond_to_invitation`. No behavior change — the resolution was always implied; this makes it explicit.

---

### PB4-M2 — §E7.4 — clarify the two-step late-extension flow

**Location:** §E7.4 `rfq.request_late_extension.v1` — section **2. Request Schema**, `buyer_decision` row (clarify conditionality + the two phases).

**Before:**

```
| `buyer_decision` | `enum<approve\|deny>` | no | yes (buyer step) | 0..1 | Doc-3 §8.5 (buyer one-tap) |
```

**After:**

```
| `buyer_decision` | `enum<approve\|deny>` | no | yes | 0..1 | Doc-3 §8.5. **Two-step flow (PB4-M2):** **Phase 1 — Vendor Request:** the late vendor invokes with `rfq_id` + `invitation_id` and **omits** `buyer_decision` (null) — this records the extension request only; no window change. **Phase 2 — Buyer Approval/Denial:** the RFQ-owning buyer invokes with `buyer_decision = approve\|deny` — `approve` reopens the window for **all** un-responded invitees (Doc-3 §8.5), `deny` closes the request with no change. `buyer_decision` is **required in Phase 2, null in Phase 1** (conditional on actor/phase). Actor responsibilities: vendor (`can_respond_to_rfq`, invitation grantee) drives Phase 1; buyer (`can_create_rfq`, RFQ owner) drives Phase 2. Validation: Phase 1 validates the invitation/window-closed precondition; Phase 2 validates buyer authority + the `quote.late_extension_max_days` POLICY bound. |
```

**Rationale:** The contract already declared a vendor→buyer two-actor flow and `buyer_decision` as optional, but the **conditionality** (when `buyer_decision` is present vs null) and the **phase responsibilities** were implicit. The clarification makes Phase 1 (vendor request, `buyer_decision` null) and Phase 2 (buyer approve/deny, `buyer_decision` required) explicit, with actor/validation expectations per phase — **without changing contract ownership** (still `rfq.request_late_extension.v1`, BC-4) or the FIXED no-private-window rule. No new field, state, or behavior.

---

# 3. Impact Analysis

| Dimension | Assessment | Evidence |
|---|---|---|
| **Ownership unchanged** | **CONFIRMED** | PB4-MA1 corrects the *labeling* of an existing edge's owning contract (to `submit_quotation`, where the trigger originates); no entity/aggregate moved. All edits stay within BC-4-owned contracts. |
| **Lifecycle unchanged** | **CONFIRMED** | No state/transition added; `vendors_notified → quotations_received` is the existing Doc-2 §5.4 edge (ownership clarified, not created); PB4-M1 is a reference row; PB4-MA2 is a read redaction (no state). |
| **Authorization unchanged** | **CONFIRMED** | No slug added/removed; PB4-M2 names existing `can_respond_to_rfq` / `can_create_rfq` per phase. |
| **Event catalog unchanged** | **CONFIRMED** | No event coined; `QuotationSubmitted` unchanged; the first-quote transition rides its existing emission. |
| **Audit model unchanged** | **CONFIRMED** | No audit action added; PB4-M1 failure is the existing `NOT_FOUND`. |
| **POLICY model unchanged** | **CONFIRMED** | `abuse.sealed_until_close` is an **existing** Doc-3 §12.2 key (registered, not coined); bound by key, no value hardcoded; `[ESC-RFQ-POLICY]` dedup-window posture unchanged. |
| **Procurement moat unchanged** | **CONFIRMED** | RFQ-owns / Marketplace-owns boundary intact; PB4-MA2 strengthens anti-farming confidentiality (Doc-3 §10.1) without touching ownership. |
| **Vendor isolation / confidentiality** | **STRENGTHENED, not changed** | PB4-MA2 adds sealed-cell buyer-read redaction (Doc-3 §10.1); vendor isolation already absolute and unchanged. |

**Regression posture:** surgical/additive only — one edge-ownership correction (existing edge), one POLICY-keyed read redaction (existing key), one reference validation row, one two-step-flow clarification. No entity, slug, event, audit action, POLICY key, state, or transition created; no rewrite; no Pass-A reopen; no carried dependency resolved.

---

# 4. Deferred / Not-Applied Findings

| Finding | Disposition | Reason |
|---|---|---|
| **PB4-N1** | **NOT APPLIED** | The request authorizes PB4-N1 "only if achievable without structural changes" but provides **no finding text, location, or required action**. Applying it would require inventing the finding's content — prohibited (never fabricate). Carried for a future cycle if the finding is specified. No content changed. |
| **PB4-N2** | **NOT APPLIED** | Same as PB4-N1 — no actionable content provided. Carried. No content changed. |

*(This is flagged transparently rather than guessed: the four accepted findings (MA1/MA2/M1/M2) carried explicit instructions and were applied; the two optional ones did not, so they are not fabricated.)*

---

# 5. Freeze Readiness

| Question | Answer |
|---|---|
| **Open BLOCKER** | **NO** — none raised; none introduced. |
| **Open MAJOR** | **NO** — PB4-MA1 and PB4-MA2 applied and closed. |
| **Open MINOR** | **NO** — PB4-M1 and PB4-M2 applied and closed. |
| **Ready for Patch Verification** | **YES** |

**Justification.** All four Board-accepted findings are applied surgically: PB4-MA1 corrects the first-quotation RFQ-head transition to be owned by `submit_quotation.v1` (existing Doc-2 §5.4 edge, same transaction; "Part-1-owned" wording removed); PB4-MA2 binds the existing Doc-3 §12.2 `abuse.sealed_until_close` POLICY key as a buyer-read projection redaction for flagged cells (Doc-3 §10.1), inventing nothing; PB4-M1 adds the explicit Stage-7 REFERENCE row for `invitation_id` (failure `NOT_FOUND` per §7.5/§12.4); PB4-M2 makes the two-step late-extension flow (vendor request / buyer decision) and `buyer_decision` conditionality explicit without changing ownership. The two optional findings (PB4-N1/N2) are not applied because no actionable content was provided — flagged, not fabricated. Impact analysis confirms ownership, lifecycle, authorization, event catalog, audit model, POLICY model, and the procurement moat are unchanged; vendor isolation/confidentiality is strengthened, not changed. The amended Part-4 conforms to `Doc-4E_PassA_v1.0_FROZEN`, the frozen structure, Parts 1–3 (FROZEN), and the frozen corpus, and carries DE-1…DE-8 + `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` / `[ESC-RFQ-SLUG]` unchanged. Part 4 is **ready for Pass-B Part-4 Patch Verification.**

> No conflict with the frozen corpus was encountered during patch application; no flag-and-halt was triggered. `abuse.sealed_until_close` was verified present in Doc-3 §12.2 before binding (PB4-MA2).

---

*End of Doc-4E_PassB_Part4_Patch_v1.0 — applies PB4-MA1 (first-quote edge owned by submit_quotation; existing Doc-2 §5.4 edge) + PB4-MA2 (sealed-until-close buyer-read redaction; existing Doc-3 §12.2 key) + PB4-M1 (Stage-7 REFERENCE invitation_id) + PB4-M2 (two-step late-extension clarification); PB4-N1/N2 not applied (no content provided). Surgical/additive only; no ownership, lifecycle, authorization, event-catalog, audit, POLICY, or moat change; nothing invented. Decision: accepted findings closed; ready for Patch Verification. Canonical input: `Doc-4E_Content_v1.0_PassB_Part4_QuotationManagement.md` as amended by this patch.*