# Doc-4F_PassB_Part1_Patch_v1.0 — Remediation Patch (BC-OPS-1 Buyer Private CRM)

| Field | Value |
|---|---|
| Document | Doc-4F_PassB_Part1_Patch_v1.0 — minimal governance-compliant remediation patch for `Doc-4F_PassB_Part1_BC-OPS-1_Buyer_Private_CRM_v1.0` |
| Nature | **Remediation patch — not a redesign, not a refactor, not a content expansion.** Applies only the findings the Patch Verification Report classified **VALID**. |
| Authority | Doc-4_Governance_Note_v1.0; Doc-4A v1.0 (FROZEN) governs; corpus precedence applies; on conflict **FLAG-AND-HALT** |
| Review inputs (authoritative) | `Doc-4F_PassB_Part1_Independent_Hard_Review_v1.0`, `Doc-4F_PassB_Part1_Patch_Verification_Report_v1.0` (board-provided; the VALID/INVALID/ESCALATION classification is the patch authorization) |
| Applies to | `Doc-4F_PassB_Part1_BC-OPS-1_Buyer_Private_CRM_v1.0.md` |
| Scope discipline | No new contract, aggregate, bounded context, ownership change, authorization redesign, event, slug, audit action, or POLICY key. Ownership, lifecycle, permissions, events, audit model, escalation model, procurement moat, and non-disclosure guarantees preserved. |
| Escalations | `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` carried unchanged — not resolved, not renamed, not replaced. |

**Patch posture.** Six authorized VALID patches (P-01…P-06) are applied as minimal, exact-anchored edits. The conditional patch (P-07) is evaluated against Doc-4A §11.1 authority and **rejected** (the condition resolves against patching — see P-07). The prohibited findings (AD-01, AD-02, AD-03 = CORPUS ESCALATION; AD-05 = INVALID) are **not** touched. No verification or freeze audit is performed here (patch only).

---

## P-01 — Resolve AD-04 · `ops.set_buyer_vendor_status.v1` · add explicit Stage 6 STATE row for the SET path

**Finding ID:** AD-04 (VALID). **Location:** §F4.5 — `ops.set_buyer_vendor_status.v1` · Validation Matrix (Section 4).

**Issue (per verification report):** the Validation Matrix declares a Stage 6 STATE row only for the CLEAR path ("open status (clear)"); the SET path has no explicit Stage 6 STATE row, leaving the SET state-precondition implicit.

**Original Text**

```
| `vendor_profile_id` | 7 REFERENCE | Doc-4A §4.5; DF-2 | vendor profile exists via Marketplace service (read-only) | `REFERENCE` |
| open status (clear) | 6 STATE | Doc-2 §3.5/§10.5 | clear requires an open current status (`effective_to NULL`) | `STATE` |
| append-only history | 8 BUSINESS | Doc-2 §10.5 | set appends a new row; clear closes current (`effective_to` set); never overwrite | `BUSINESS` (if overwrite attempted) |
```

**Replacement Text**

```
| status precondition (set) | 6 STATE | Doc-2 §3.5/§10.5 | **applicable** — SET is legal from any current relationship status (`none` or an existing open status); a SET that supersedes an open status appends a new history row and closes the prior (`effective_to` set) — never an illegal-source-state failure (the `none → approved\|conditional\|blacklisted` and supersede edges are all legal, Doc-2 §3.5) | — (pass; no `STATE` failure on the SET path) |
| open status precondition (clear) | 6 STATE | Doc-2 §3.5/§10.5 | clear requires an open current status (`effective_to NULL`) | `STATE` |
| `vendor_profile_id` | 7 REFERENCE | Doc-4A §4.5; DF-2 | vendor profile exists via Marketplace service (read-only) | `REFERENCE` |
| append-only history | 8 BUSINESS | Doc-2 §10.5 | set appends a new row; clear closes current (`effective_to` set); never overwrite | `BUSINESS` (if overwrite attempted) |
```

**Rationale.** Adds the explicit Stage 6 STATE row for the SET path, stating its **applicability** ("applicable") and the **rationale** (every SET source-state is legal per the Doc-2 §3.5 machine — `none → approved/conditional/blacklisted` and the supersede edge), so the SET path's STATE evaluation is no longer implicit. The CLEAR STATE row is retained unchanged; REFERENCE/BUSINESS rows are reordered after STATE to preserve the §11.2 canonical category sequence (STATE=6 before REFERENCE=7 before BUSINESS=8). **No lifecycle altered** — the rows describe the frozen Doc-2 §3.5 edges only; no new edge, no state change.

**Authority Reference.** Doc-2 §3.5 (`buyer_vendor_statuses` machine `none → approved|conditional|blacklisted → cleared`); Doc-2 §10.5 (append-only history; current = `effective_to NULL`); Doc-4A §11.2 (canonical stage order 6 STATE → 7 REFERENCE → 8 BUSINESS).

---

## P-02 — Resolve IR-01 · `ops.set_private_vendor_rating.v1` · add explicit Stage 8 BUSINESS score rule, carrying `[ESC-OPS-POLICY]`

**Finding ID:** IR-01 (VALID). **Location:** §F4.4 — `ops.set_private_vendor_rating.v1` · Validation Matrix (Section 4, shared with `add_private_vendor_note`).

**Issue (per verification report):** the rating `score` has no declared validation rule; the corpus fixes no authoritative score bound, so the bound must be carried as an escalation, not invented.

**Original Text**

```
| parent exists/readable | 7 REFERENCE | Doc-4A §4.5 (in-schema) | parent record id resolves within the org | `NOT_FOUND` (collapse) |
| (state) | 6 STATE | Doc-2 §3.5 | parent `active` (notes/ratings on an active record) | `STATE` |
```

**Replacement Text**

```
| parent `active` (state) | 6 STATE | Doc-2 §3.5 | parent record is `active` (notes/ratings on an active record) | `STATE` |
| parent exists/readable | 7 REFERENCE | Doc-4A §4.5 (in-schema) | parent record id resolves within the org | `NOT_FOUND` (collapse) |
| `score` bound (rating only) | 8 BUSINESS | Doc-2 §10.5 (`private_vendor_ratings` = private score + comment); **`[ESC-OPS-POLICY]`** (Doc-3 §12.2 additive — no authoritative score bound registered) | the `score` numeric range/precision is **POLICY-bound**; the corpus fixes **no** score range — the bound key is carried as `[ESC-OPS-POLICY]` and referenced by name, **never invented** here | `VALIDATION` (when the resolved POLICY bound is violated) |
```

**Rationale.** Adds the explicit Stage 8 BUSINESS rule for `score`, and — because **no authoritative score bound exists in the corpus** — carries **`[ESC-OPS-POLICY]`** for the bound rather than inventing a range, numeric limit, or threshold. The STATE/REFERENCE rows are reordered to canonical sequence (6 STATE → 7 REFERENCE → 8 BUSINESS). The note path is unaffected (the rule is scoped "rating only"). **No score range, numeric limit, or business threshold invented.**

**Authority Reference.** Doc-2 §10.5 (`private_vendor_ratings` = "private score + comment" — no range specified); Doc-3 §12.2 (no `operations` POLICY namespace → `[ESC-OPS-POLICY]` additive channel); Doc-4A §11.1 (every rule cites a source; a rule with no source is rejected — the source here is the POLICY key carried under the marker); Doc-4A §11.2 (Category 8 BUSINESS / Category 9 POLICY semantics).

---

## P-03 — Resolve IR-03 · separate REFERENCE from DEPENDENCY error handling · `ops.set_buyer_vendor_status.v1` · `ops.confirm_vendor_link.v1` · `ops.read_crm_status_for_routing.v1`

**Finding ID:** IR-03 (VALID). **Location:** §F4.5, §F4.7, §F4.8 · Error Register (Section 9).

**Issue (per verification report):** REFERENCE-failure (a reference does not exist/resolve) and DEPENDENCY-failure (the owning service is transiently unavailable) are conflated in a single Error Register row (`REFERENCE … false (true if service transiently DEPENDENCY)`), making the retryable semantics ambiguous. They must be distinct entries with preserved semantics; no new error class is introduced (both `REFERENCE` and `DEPENDENCY` already exist in the Doc-4A §12 closed set).

### P-03a — §F4.5 `ops.set_buyer_vendor_status.v1`

**Original Text**

```
| `REFERENCE` | `vendor_profile_id` not found (Marketplace service) | false (true if service transiently `DEPENDENCY`) |
| `STATE` | clear with no open status | false |
| `BUSINESS` | overwrite/delete of a history row | false |
| `DEPENDENCY` | Marketplace/Doc-4B service transiently unavailable | true |
```

**Replacement Text**

```
| `REFERENCE` | `vendor_profile_id` does not exist / does not resolve at the Marketplace service (a definitive negative answer) | false |
| `STATE` | clear with no open status | false |
| `BUSINESS` | overwrite/delete of a history row | false |
| `DEPENDENCY` | Marketplace or Doc-4B service transiently unavailable / no definitive answer (retry per outbox/Doc-4A retry semantics) | true |
```

### P-03b — §F4.7 `ops.confirm_vendor_link.v1`

**Original Text**

```
| `REFERENCE` | `vendor_profile_id` or `link_suggestion_id` not found | false (true if transient `DEPENDENCY`) |
| `STATE` | illegal link transition (e.g., re-link without dismiss) | false |
| `CONFLICT` | `expected_revision` ≠ current | true |
| `BUSINESS` | merge attempt (link-not-merge violation) | false |
| `DEPENDENCY` | Marketplace/Admin/Doc-4B transiently unavailable | true |
```

**Replacement Text**

```
| `REFERENCE` | `vendor_profile_id` (Marketplace) or `link_suggestion_id` (Admin) does not exist / does not resolve (a definitive negative answer) | false |
| `STATE` | illegal link transition (e.g., re-link without dismiss) | false |
| `CONFLICT` | `expected_revision` ≠ current | true |
| `BUSINESS` | merge attempt (link-not-merge violation) | false |
| `DEPENDENCY` | Marketplace, Admin, or Doc-4B service transiently unavailable / no definitive answer (retry) | true |
```

### P-03c — §F4.8 `ops.read_crm_status_for_routing.v1`

**Disposition:** **No combined REFERENCE/DEPENDENCY row exists to split.** This query performs **no** REFERENCE validation — its Validation Matrix Section-4 reference row is `(reference) … candidate vendor_profile_ids taken as given (already validated upstream by RFQ)`, and its Error Register already lists `DEPENDENCY` as a **standalone** entry with no conflated `REFERENCE`. To satisfy IR-03's intent (REFERENCE and DEPENDENCY handled distinctly) **without inventing a REFERENCE check the query does not perform**, the existing standalone `DEPENDENCY` row is clarified in place; **no `REFERENCE` row is added** (adding one would invent a validation the contract does not do — prohibited).

**Original Text**

```
| `DEPENDENCY` | Doc-4B/internal transiently unavailable | true |
```

**Replacement Text**

```
| `DEPENDENCY` | Doc-4B / internal status-store transiently unavailable / no definitive answer (retry); this query performs **no** `REFERENCE` validation — candidate `vendor_profile_ids` are validated upstream by RFQ (Section 4), so no `REFERENCE`/`DEPENDENCY` conflation arises | true |
```

**Rationale (P-03).** Splits the conflated REFERENCE/DEPENDENCY semantics into distinct, unambiguous entries for the two contracts that had the combined wording (P-03a/b): `REFERENCE` = a **definitive negative** (the reference does not exist; `retryable: false`), `DEPENDENCY` = a **transient/no-answer** condition (`retryable: true`). For the read-service (P-03c), the report's intent is satisfied by clarifying the already-standalone `DEPENDENCY` row and confirming no REFERENCE check is performed — no REFERENCE row is fabricated. **Existing semantics preserved; no new error class introduced** (both classes are in the Doc-4A §12.2 closed set).

**Scope-boundary note (recorded, NOT patched — for the next verification step).** §F4.6 `ops.set_vendor_favorite.v1` / `ops.clear_vendor_favorite.v1` carries the **identical** conflated wording (`REFERENCE … false (true if transient DEPENDENCY)`), but §F4.6 is **not** in P-03's authorized contract list (the verification report named only `set_buyer_vendor_status`, `confirm_vendor_link`, `read_crm_status_for_routing`). Per "apply only changes authorized by the verification report," §F4.6 is **left unchanged** here — patching it would exceed authorized scope. This residual REFERENCE/DEPENDENCY inconsistency in §F4.6 is **recorded for the next Patch Verification / Hard Review** to classify and authorize (or reject) explicitly; it is **not** resolved in this patch. No corpus conflict is implied (both classes are frozen-set; the wording is editorial), so **no FLAG-AND-HALT** — it is a scope-boundary observation only.

**Authority Reference.** Doc-4A §12.2 (closed class set: `REFERENCE` retryable=false; `DEPENDENCY` retryable=true); Doc-4A §12.4 (REFERENCE = supplied reference failed validation); Doc-4A §4.5 (cross-module reference validated via the owning module's service); Doc-4A §16.7 (transient delivery/availability → retry).

---

## P-04 — Resolve IR-04 · dual-identifier contracts · add explicit Stage 1 SYNTAX "exactly one identifier" rule

**Finding ID:** IR-04 (VALID). **Location:** the BC-OPS-1 contracts whose Request Schema accepts a one-of identifier pair — §F4.5 `clear_buyer_vendor_status` (`vendor_profile_id` **or** `buyer_supplier_relationship_id`), §F4.6 `set/clear_vendor_favorite` (`vendor_profile_id` **or** `buyer_supplier_relationship_id`), §F4.9 `get_buyer_supplier_relationship` (`buyer_supplier_relationship_id` **or** `vendor_profile_id`).

**Issue (per verification report):** contracts accept "one of" two identifiers but do not state the SYNTAX rule for the exactly-one constraint (both-supplied and neither-supplied are undefined). Add an explicit Stage 1 SYNTAX rule applied consistently: both → `VALIDATION`; neither → `VALIDATION`.

**Patch (applied consistently to each affected contract's Validation Matrix, Section 4).** Insert, immediately after the existing Stage 1 SYNTAX row, the rule:

```
| identifier cardinality (one-of) | 1 SYNTAX | Doc-4A §9 (field presence) | **exactly one** of the one-of identifier pair MUST be supplied — both supplied → `VALIDATION`; neither supplied → `VALIDATION` | `VALIDATION` |
```

Applied to:
- **§F4.5 `clear_buyer_vendor_status`** — pair (`vendor_profile_id` | `buyer_supplier_relationship_id`).
- **§F4.6 `set_vendor_favorite` / `clear_vendor_favorite`** — pair (`vendor_profile_id` | `buyer_supplier_relationship_id`).
- **§F4.9 `get_buyer_supplier_relationship`** — pair (`buyer_supplier_relationship_id` | `vendor_profile_id`).

**Rationale.** Makes the exactly-one-identifier constraint an explicit, testable Stage 1 SYNTAX rule (Doc-4A §11.1 testability) applied uniformly across all dual-identifier contracts, with both-supplied and neither-supplied both → `VALIDATION` (SYNTAX category). **No schema field added or removed** — the rule binds the existing one-of request fields. *(The `set_buyer_vendor_status` SET path uses a single required `vendor_profile_id`, not a pair, so it is not in scope.)*

**Authority Reference.** Doc-4A §9 (field presence is a SYNTAX concern); Doc-4A §11.1 (rules must be testable; passing/failing inputs constructible) and §11.2 (Category 1 SYNTAX).

---

## P-05 — Resolve IR-05 · `ops.list_private_vendors.v1` · explicit `filter.is_favorite` behavior for linked vs unlinked records

**Finding ID:** IR-05 (VALID). **Location:** §F4.9 — `ops.list_private_vendors.v1` · Request Schema (Section 2) + Validation Matrix (Section 4).

**Issue (per verification report):** `filter.is_favorite` is offered but its behavior is unspecified for records that are linked vs unlinked to a public profile; the behavior must derive only from the Doc-2 relationship model, introducing no new behavior.

**Original Text**

```
| `page_size` bound | 9 POLICY | Doc-4A §18 | within POLICY bound (`[ESC-OPS-POLICY]`) | `VALIDATION` |
```

**Replacement Text**

```
| `filter.is_favorite` semantics | 1 SYNTAX | Doc-2 §3.5/§10.5 (`vendor_favorites` is a child of `buyer_supplier_relationships`) | `is_favorite` filters on the **`buyer_supplier_relationships` → `vendor_favorites` flag**, which keys on `vendor_profile_id`; it therefore matches **only records whose `link_status = linked`** (an unlinked `private_vendor_records` row has no `vendor_profile_id` and thus no `buyer_supplier_relationships`/`vendor_favorites` row) — unlinked records are **never** returned by an `is_favorite = true` filter; an `is_favorite = false` (or absent) filter applies no favorite constraint | `VALIDATION` (malformed filter value) |
| `page_size` bound | 9 POLICY | Doc-4A §18 | within POLICY bound (`[ESC-OPS-POLICY]`) | `VALIDATION` |
```

**Rationale.** States the `filter.is_favorite` behavior **derived strictly from the Doc-2 relationship model**: `vendor_favorites` is a child of `buyer_supplier_relationships` (Doc-2 §3.5/§10.5), which keys on `vendor_profile_id`; a favorite therefore exists **only** for a record linked to a public profile (`link_status = linked`). Consequently an `is_favorite = true` filter matches only linked records; unlinked records (no `vendor_profile_id`, no relationship row) are never matched. **No new behavior introduced** — the rule is a direct consequence of the frozen Doc-2 child-of-relationship structure.

**Authority Reference.** Doc-2 §3.5 (`vendor_favorites` is a child of Buyer–Supplier Relationship); Doc-2 §10.5 (`buyer_supplier_relationships` keys on `(organization_id, vendor_profile_id)`; `vendor_favorites → buyer_supplier_relationships`); Doc-2 §10.5 (`private_vendor_records.link_status enum<none|suggested|linked>`); Architecture Patch v1.0.1 PATCH-02 (favorites are Operations' `vendor_favorites`).

---

## P-06 — Resolve IR-07 · `ops.read_crm_status_for_routing.v1` · replace "bounded by caller wave size" with explicit `[ESC-OPS-POLICY]`

**Finding ID:** IR-07 (VALID). **Location:** §F4.8 — `ops.read_crm_status_for_routing.v1` · Request Schema (Section 2).

**Issue (per verification report):** the request bound is described informally as "bounded by the caller's wave size," which is not a corpus-anchored limit; replace with an explicit `[ESC-OPS-POLICY]` reference; invent no numeric limit.

**Original Text**

```
**2. Request Schema** — `buyer_organization_id : uuid (1, required)`; `vendor_profile_ids : uuid[] (1..N, required)` (the candidate set for one routing run; bound by the caller's wave size).
```

**Replacement Text**

```
**2. Request Schema** — `buyer_organization_id : uuid (1, required)`; `vendor_profile_ids : uuid[] (1..N, required)` (the candidate set for one routing run; the array's maximum cardinality is **POLICY-bound** and carried as **`[ESC-OPS-POLICY]`** — Doc-3 §12.2 additive; **no numeric limit is invented here**, the bound key is referenced by name once registered, per Doc-4A §9.4 bounded-collection rule).
```

**Rationale.** Replaces the informal "bounded by the caller's wave size" with an explicit **`[ESC-OPS-POLICY]`** reference for the array's maximum cardinality, satisfying the Doc-4A §9.4 requirement that a request collection be bounded — **without inventing a numeric limit** (no `operations` POLICY key exists; the bound is carried to the Doc-3 §12.2 additive channel). The `1..N` minimum (non-empty) is retained.

**Authority Reference.** Doc-4A §9 / §9.4 (request collections MUST declare a bound — fixed-from-corpus or a POLICY key; an unbounded request collection is nonconforming); Doc-3 §12.2 (no `operations` POLICY namespace → `[ESC-OPS-POLICY]` additive channel); Doc-4F Pass-A §F12 / Part-1 §H.8 (`[ESC-OPS-POLICY]` carried, never invented).

---

## P-07 (CONDITIONAL) — IR-02 and IR-06 · validation-matrix physical row order — **REJECTED (condition resolves against patching)**

**Finding IDs:** IR-02, IR-06 (conditional). **Condition:** apply **ONLY IF** Doc-4A §11.1 *explicitly requires physical validation-matrix row order to match canonical stage order.*

**Authority examined (verbatim):** Doc-4A §11.1: *"Rules execute in **declared order**; order **MUST** follow the §11.2 category sequence. Within a category, rule order is the declared order."* Doc-4A §11.2 fixes the canonical category order `1 SYNTAX … 9 POLICY`.

**Determination:** The §11.1 mandate is that the **declared (execution) order MUST follow the §11.2 category sequence**. The Part-1 Validation Matrices **already declare rows in canonical sequence and label each row with its explicit stage number** (`1 SYNTAX … 9 POLICY`), so the declared-order-follows-sequence requirement is **already satisfied**. Doc-4A §11.1 imposes **no additional "physical-row-order" requirement** beyond declared-order-follows-category-sequence, and the matrices already comply. *(Note: the P-01 and P-02 edits independently restore strict ascending stage order where a STATE/REFERENCE/BUSINESS pair had been listed out of ascending sequence — incidental to those VALID findings, not a P-07 action.)*

**Disposition:** **No patch applied.** The condition is not met in the sense that would authorize a change — there is no out-of-canonical-sequence declared order to reorder; the matrices already conform to §11.1/§11.2. IR-02 and IR-06 are therefore **rejected as already-satisfied** (patching would be content-churn with no governance effect, which the directive prohibits).

**Authority Reference.** Doc-4A §11.1 (declared order MUST follow §11.2 category sequence); Doc-4A §11.2 (canonical category order).

---

## Prohibited findings — NOT patched (recorded for completeness)

| Finding | Status | Target / reason | Action |
|---|---|---|---|
| **AD-01** — rating persistence semantics | CORPUS ESCALATION | Doc-2 §10.5 (no local resolution) | **Not patched.** P-02 adds the `score`-bound BUSINESS rule (carrying `[ESC-OPS-POLICY]`) but does **not** touch persistence semantics (in-place vs append); that remains the §F4.4 Idempotency note's "development-doc detail (Doc-2 fixes neither)" — escalation open. |
| **AD-02** — dismiss-path link semantics | CORPUS ESCALATION | Doc-2 §10.5 (no local resolution) | **Not patched.** The §F4.7 link transition wording is unchanged; the dismiss-path semantic gap is carried as a Doc-2 §10.5 escalation. |
| **AD-03** — internal-service actor model | CORPUS ESCALATION | Doc-4A §5.2 / §21.5 (no local resolution) | **Not patched.** The §F4.8 internal-service notation is unchanged (per the frozen Doc-4E precedent); the actor-model question is a Doc-4A escalation. |
| **AD-05** — `current_status` disclosure annotation | INVALID | no patch allowed | **Not patched.** Rejected as INVALID by the verification report. |

---

# Patch Summary

| Patch ID | Finding | Disposition |
|---|---|---|
| P-01 | AD-04 | Applied — explicit Stage 6 STATE row for the status SET path (§F4.5) |
| P-02 | IR-01 | Applied — explicit Stage 8 BUSINESS `score`-bound rule carrying `[ESC-OPS-POLICY]` (§F4.4) |
| P-03 | IR-03 | Applied — REFERENCE/DEPENDENCY split in §F4.5, §F4.7; clarified standalone DEPENDENCY in §F4.8 (no fabricated REFERENCE) |
| P-04 | IR-04 | Applied — explicit Stage 1 SYNTAX "exactly one identifier" rule in §F4.5, §F4.6, §F4.9 |
| P-05 | IR-05 | Applied — `filter.is_favorite` linked/unlinked behavior, derived from Doc-2 relationships (§F4.9) |
| P-06 | IR-07 | Applied — "wave size" replaced with `[ESC-OPS-POLICY]` array bound (§F4.8) |
| P-07 | IR-02, IR-06 | **Rejected** — Doc-4A §11.1 already satisfied (matrices in canonical declared order); no physical-reorder mandate |

---

# Completion Statement

1. **VALID findings patched (6 findings via 6 patches):** AD-04 (P-01), IR-01 (P-02), IR-03 (P-03), IR-04 (P-04), IR-05 (P-05), IR-07 (P-06).
2. **Findings rejected (no patch):** IR-02 and IR-06 (P-07 — Doc-4A §11.1 already satisfied; no reorder authorized); AD-05 (INVALID, per the verification report).
3. **Findings remaining CORPUS ESCALATION (carried, unresolved):** AD-01 (rating persistence → Doc-2 §10.5), AD-02 (dismiss-path link semantics → Doc-2 §10.5), AD-03 (internal-service actor model → Doc-4A §5.2/§21.5). Escalation markers `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` carried unchanged.
4. **Is patch verification now required?** **Yes** — this patch introduces edits to the Part-1 contract specification and SHOULD pass a Patch Verification step (confirming each applied edit binds only to the cited frozen authority, no Pass-A decision changed, no entity/event/slug/audit-action/POLICY-key invented, escalations intact) before Part-1 proceeds to its Freeze Audit. **Verification is not performed in this document** (patch only).

---

*End of Doc-4F_PassB_Part1_Patch_v1.0. Remediation patch only — no verification, no freeze audit, no redesign. Six VALID findings patched (AD-04, IR-01, IR-03, IR-04, IR-05, IR-07); IR-02/IR-06 rejected (Doc-4A §11.1 already satisfied); AD-05 rejected (INVALID); AD-01/AD-02/AD-03 remain CORPUS ESCALATION to their owning documents. Ownership, aggregates, lifecycle, permissions, events, audit model, escalation model, procurement moat, and non-disclosure guarantees preserved; no contract/aggregate/bounded-context/slug/event/audit-action/POLICY-key created. Escalation markers carried unchanged. Patch verification required next; not performed here.*
