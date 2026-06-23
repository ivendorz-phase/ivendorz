# Doc-4E_Structure_Patch_v0.1.1.md

## Status

**Approved Structure Patch** — applies the approved Independent Architecture Review findings to the Doc-4E Structure Proposal.

| Field | Value |
|---|---|
| Applies to | `Doc-4E_Structure_Proposal_v0.1.md` |
| Produces | `Doc-4E_Structure_Proposal_v0.1` as amended by this patch (canonical input to Structure Freeze) |
| Review source | `Doc-4E_Structure_Independent_Architecture_Review_v0.1.md` — decision **APPROVE WITH STRUCTURE PATCH** |
| Findings applied | **F-01, F-02, F-03** (direct); **F-05, F-06, F-07** (corpus-verified first); **F-04, F-08** (optional cleanup — trivial, applied) |
| Scope | Pointer / boundary / mapping / notation clarifications + two recorded non-invention verifications + two trivial cleanups. **No structural redesign, no scope expansion, no new architecture, no unaffected-section edits.** |
| Conforms To | Architecture FINAL, ADRs v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0 — all FROZEN |
| Application model | Additive amendment document (Board-applied). Each item quotes the exact **Before** text present verbatim in the base proposal and gives the **After** text; verification items record the corpus check and the resulting action (which may be "no change — do not invent"). The base proposal file correctly still holds pre-application text until the Board re-issues it. |

All frozen architecture decisions, ownership boundaries, DDD boundaries, permission boundaries, lifecycle/state machines, event catalog, audit catalog, and the procurement moat are preserved. This patch invents nothing and resolves no carried dependency.

---

# 1. Patch Summary

| Finding | Severity (review) | Type | Location | Disposition |
|---|---|---|---|---|
| **F-01** | MINOR | Direct | Deliverable B / §E2 | **APPLIED** — added aggregate-root pointer `buyer_vendor_statuses (root: buyer_supplier_relationships)` (Operations, DE-4). Pointer clarification only. |
| **F-02** | MINOR | Direct | §E8 Excluded scope | **APPLIED** — added explicit clarification-thread exclusion (DE-6). Boundary clarification only. |
| **F-03** | MINOR | Direct | Deliverable C / §E3 | **APPLIED** — stated BC-5→§E8, BC-6→§E8 (absorbed), BC-7→§E6. Mapping clarification only. |
| **F-05** | MINOR | Verify-first | §E10 | **VERIFIED → NO INVENTION.** `RFQCancelled` does **not** exist in Doc-2 §8. Event not added; non-invention note recorded in §E10. |
| **F-06** | MINOR | Verify-first | §E10 | **VERIFIED → NO INVENTION.** No quotation-revision event exists in Doc-2 §8. Event not added; non-invention note recorded in §E10. |
| **F-07** | MINOR | Verify-first | §E11 | **VERIFIED → SEPARATE.** `can_view_rfq` and `can_view_all_rfqs` are separate slugs in Doc-2 §7. Kept listed separately; canonical scope notation clarified. |
| **F-04** | NITPICK (optional) | Cleanup | Title | **APPLIED** — removed "Canonical" designation from the title. |
| **F-08** | NITPICK (optional) | Cleanup | §E13 audience | **APPLIED** — added "AI Coding Agents" to the §E13 audience list. |

All open findings (F-01, F-02, F-03, F-05, F-06, F-07) processed; both optional items (F-04, F-08) applied as trivial. No finding deferred.

---

# 2. Corpus Verification Results

Mandatory per the patch request: **F-05, F-06, F-07 verified against the frozen corpus before any action; no assumptions; no invention.**

### F-05 — `RFQCancelled` emitted event?

| Item | Result |
|---|---|
| **Source checked** | Doc-2 v1.0.3 §8 Event Ownership Mapping — `rfq` emitting rows (authoritative event catalog). |
| **Verification result** | **NOT PRESENT.** The `rfq` → `rfqs` row enumerates exactly `RFQCreated, RFQSubmitted, RFQApproved, RFQClosedWon, RFQClosedLost`. No `RFQCancelled` event exists anywhere in Doc-2 §8. Cancellation is represented as a **state-machine transition** (`any active state → cancelled`, Doc-2 §5.4) and an **audit action** (`cancel`, Doc-2 §9), **not** as an emitted domain event. |
| **Action taken** | **No event added (do not invent — Doc-4A §16.4).** A non-invention note is recorded in §E10 documenting that cancellation is a §5.4 transition + §9 audit action, not a §8 event. Consistent with §E10's existing "No event coined" excluded-scope rule. |

### F-06 — Quotation revision event?

| Item | Result |
|---|---|
| **Source checked** | Doc-2 v1.0.3 §8 Event Ownership Mapping — `rfq` → `quotations` row (authoritative event catalog); cross-checked §5.5 Quotation machine and §9 audit catalog. |
| **Verification result** | **NOT PRESENT.** The `rfq` → `quotations` row enumerates exactly `QuotationSubmitted, QuotationWithdrawn, QuotationSelected`. No quotation-revision event exists. Revision is represented as a **state-machine transition** (`submitted → submitted` new version, Doc-2 §5.5) and an **audit action** (`edit (new version)`, Doc-2 §9), **not** as an emitted domain event. |
| **Action taken** | **No event added (do not invent — Doc-4A §16.4).** A non-invention note is recorded in §E10 documenting that quotation revision is a §5.5 transition + §9 audit action, not a §8 event. |

### F-07 — `can_view_rfq` vs `can_view_all_rfqs` separate slugs?

| Item | Result |
|---|---|
| **Source checked** | Doc-2 v1.0.3 §7 Permission Mapping — "RFQ view own / all org RFQs" row (authoritative slug catalog). |
| **Verification result** | **SEPARATE, CONFIRMED.** Doc-2 §7 lists them as two distinct slugs with distinct default bundles: `can_view_rfq` (all members) **/** `can_view_all_rfqs` (O,D,M). The base proposal already listed both separately; the only ambiguity was the absence of an explicit scope annotation. |
| **Action taken** | **Kept listed separately; canonical scope notation clarified** (own-RFQ scope vs all-org-RFQ scope) by pointer to Doc-2 §7. No slug invented; no slug removed. |

---

# 3. Exact Changes

> Each change quotes the **Before** text exactly as it appears in `Doc-4E_Structure_Proposal_v0.1.md` and gives the **After** text. Anchors verified verbatim against the base prior to issuing this patch.

### PATCH-4E-S-01 — F-01 — Aggregate-root pointer for `buyer_vendor_statuses` (Deliverable B / §E2)

**Location:** Deliverable B — "Module 3 does NOT own" list, the Operations (DE-4) bullet.

**Before:**

```
- `private_vendor_records` / `buyer_vendor_statuses` (Approved/Conditional/Blacklisted) / `vendor_favorites` / `engagements` / `vendor_leads` → **Operations (Doc-4F) — DE-4**. The buyer's CRM status set (the Buyer Filter universe and blacklist floor, Doc-3 §2.1) is **read via the Operations CRM service only**, under the non-disclosure invariant; post-award `engagements` and vendor-side `vendor_leads` are Operations-owned and created by Operations on RFQ-emitted events.
```

**After:**

```
- `private_vendor_records` / `buyer_vendor_statuses` (**root: `buyer_supplier_relationships`**; Approved/Conditional/Blacklisted) / `vendor_favorites` / `engagements` / `vendor_leads` → **Operations (Doc-4F) — DE-4**. The buyer's CRM status set (the Buyer Filter universe and blacklist floor, Doc-3 §2.1) is **read via the Operations CRM service only**, under the non-disclosure invariant; post-award `engagements` and vendor-side `vendor_leads` are Operations-owned and created by Operations on RFQ-emitted events. (`buyer_vendor_statuses` is a child of the `buyer_supplier_relationships` aggregate root — Doc-2 §2 Module 4, §10.5; ownership unchanged, pointer clarification only.)
```

**Companion (DE-4 register entry, §E0) — for pointer consistency:**

**Before:**

```
- **DE-4 — Operations boundary (buyer CRM + post-award + vendor CRM).** `buyer_vendor_statuses` (Approved/Conditional/Blacklisted), `private_vendor_records`, `vendor_favorites`, `engagements`, `vendor_leads` are owned by **Operations (Module 4 / Doc-4F)**.
```

**After:**

```
- **DE-4 — Operations boundary (buyer CRM + post-award + vendor CRM).** `buyer_vendor_statuses` (**root: `buyer_supplier_relationships`**; Approved/Conditional/Blacklisted), `private_vendor_records`, `vendor_favorites`, `engagements`, `vendor_leads` are owned by **Operations (Module 4 / Doc-4F)**.
```

*Basis:* Doc-2 §2 (Module 4) lists `buyer_supplier_relationships` as the aggregate root with `buyer_vendor_statuses` as a child entity; Doc-2 §10.5 shows `operations.buyer_vendor_statuses → buyer_supplier_relationships`. No ownership change; no new entity; pointer clarification only.

---

### PATCH-4E-S-02 — F-02 — Explicit clarification-thread exclusion (§E8 Excluded scope)

**Location:** §E8 — Buyer Evaluation & Comparison Model, "Excluded scope".

**Before:**

```
- **Excluded scope:** No auto-winner / auto-recommendation (FIXED decision-support boundary); no post-award engagement authored (Operations — DE-4); no cross-tenant buyer-preference leakage (firewall); no notification authored (Communication — DE-6); no multi-award on one RFQ (frozen single-award cardinality).
```

**After:**

```
- **Excluded scope:** No auto-winner / auto-recommendation (FIXED decision-support boundary); no post-award engagement authored (Operations — DE-4); no cross-tenant buyer-preference leakage (firewall); no notification authored (Communication — DE-6); **no clarification-thread entity or Communication contract authored here (DE-6) — clarification/best-and-final threads are a Communication-owned channel; §E8 binds the buyer-evaluation decision-support surface only and references the thread by pointer**; no multi-award on one RFQ (frozen single-award cardinality).
```

*Basis:* Doc-3 §9.3 clarification rounds use the "frozen comm model"; Communication (Module 6 / Doc-4H) owns chat/RFQ-thread channels (Doc-2 §2 Module 6: `threads`/`messages` via `thread_participants`). DE-6 single-authorship already applies; this makes the thread boundary explicit. Boundary clarification only; no Communication ownership change.

---

### PATCH-4E-S-03 — F-03 — Bounded-context → section mapping (Deliverable C / §E3)

**Location:** Deliverable C — the "Cross-cutting surfaces" paragraph immediately following the BC table.

**Before:**

```
Cross-cutting surfaces (not separate contexts; threaded through the above and structured in dedicated sections): **Event surface** (§E10), **Audit surface** (§E12), **Authorization surface** (§E11), **Integration surface** (§E9), **AI-agent constraints** (§E13). The matching/routing **engine** context belongs here (Module 3); vendor **discovery/profile/attribute** context belongs to Marketplace (Doc-4D), referenced not owned — the moat boundary.
```

**After:**

```
**Bounded-context → section mapping (no new section; contract-placement guide for content passes):** BC-1 → §E4; BC-2 → §E5; BC-3 → §E6; **BC-4 → §E7; BC-5 → §E8; BC-6 → §E8 (absorbed — procurement decision & closure contracts share the buyer-evaluation/closure section); BC-7 → §E6 (routing governance & control-plane contracts live in the routing/selection/distribution section).** Each planned contract still lands in exactly one bounded context; the absorption of BC-6 into §E8 and BC-7 into §E6 is a section-placement clarification only — no section added or removed.

Cross-cutting surfaces (not separate contexts; threaded through the above and structured in dedicated sections): **Event surface** (§E10), **Audit surface** (§E12), **Authorization surface** (§E11), **Integration surface** (§E9), **AI-agent constraints** (§E13). The matching/routing **engine** context belongs here (Module 3); vendor **discovery/profile/attribute** context belongs to Marketplace (Doc-4D), referenced not owned — the moat boundary.
```

*Basis:* Removes the ambiguity over where BC-5/BC-6/BC-7 contracts are authored. BC-6 (Procurement Decision & Closure) shares the award/loss/closure surface already structured in §E8; BC-7 (Routing Governance & Control Plane) shares the `routing_rules`/operating-stage surface already structured in §E6. No restructuring; no new section; mapping clarification only.

---

### PATCH-4E-S-04 — F-05 + F-06 — Recorded non-invention notes (§E10)

**Location:** §E10 — Event & Dependency Map, "Emitted events (Doc-2 §8, by pointer)" bullet.

**Before:**

```
  - **Emitted events (Doc-2 §8, by pointer):** `RFQCreated`, `RFQSubmitted`, `RFQApproved`, `RFQClosedWon`, `RFQClosedLost` (rfqs); `RFQMatched`, `RFQRouted` (matching/routing; Architecture Patch v1.0.1 PATCH-06); `VendorInvited` — **fires only on transition to `delivered`**, never on `selected`/`deferred` (undelivered invitations must not create leads or visibility — FIXED); `QuotationSubmitted`, `QuotationWithdrawn`, `QuotationSelected` (quotations).
```

**After:**

```
  - **Emitted events (Doc-2 §8, by pointer):** `RFQCreated`, `RFQSubmitted`, `RFQApproved`, `RFQClosedWon`, `RFQClosedLost` (rfqs); `RFQMatched`, `RFQRouted` (matching/routing; Architecture Patch v1.0.1 PATCH-06); `VendorInvited` — **fires only on transition to `delivered`**, never on `selected`/`deferred` (undelivered invitations must not create leads or visibility — FIXED); `QuotationSubmitted`, `QuotationWithdrawn`, `QuotationSelected` (quotations).
  - **Non-events (verified against Doc-2 §8; recorded so content passes do not coin them):** **RFQ cancellation** has **no** emitted event — it is the `any active state → cancelled` transition (Doc-2 §5.4) and the `cancel` audit action (Doc-2 §9), never an `RFQCancelled` domain event (verified absent from Doc-2 §8 — F-05). **Quotation revision** has **no** emitted event — it is the `submitted → submitted` new-version transition (Doc-2 §5.5) and the `edit (new version)` audit action (Doc-2 §9), never a quotation-revision domain event (verified absent from Doc-2 §8 — F-06). Both remain bound as state-machine + audit effects (§E4, §E12); **no event coined** (Doc-4A §16.4).
```

*Basis:* §2 corpus verification above. This records the verification outcome in the document (as the patch request requires) without inventing any event. Reinforces the existing §E10 "No event coined" rule.

---

### PATCH-4E-S-05 — F-07 — Canonical view-slug scope notation (§E11)

**Location:** §E11 — Authorization Surface, "Buyer-side permissions (Doc-2 §7, by pointer)" bullet.

**Before:**

```
  - **Buyer-side permissions (Doc-2 §7, by pointer):** `can_create_rfq`, `can_approve_rfq`, `can_view_rfq` / `can_view_all_rfqs`, `can_cancel_rfq`, `can_approve_vendor_selection`, `can_award_rfq` (tenant space, buyer controlling org).
```

**After:**

```
  - **Buyer-side permissions (Doc-2 §7, by pointer):** `can_create_rfq`, `can_approve_rfq`, **`can_view_rfq` (own-RFQ scope; all active members) and `can_view_all_rfqs` (all-org-RFQ scope; O,D,M) — two distinct slugs per Doc-2 §7, listed separately, never merged**, `can_cancel_rfq`, `can_approve_vendor_selection`, `can_award_rfq` (tenant space, buyer controlling org).
```

*Basis:* §2 corpus verification (F-07). Doc-2 §7 defines them as separate slugs with distinct default bundles; this clarifies canonical notation/scope without inventing or removing any slug.

---

### PATCH-4E-S-06 — F-04 (optional, trivial) — Title designation cleanup

**Location:** Document title (line 1).

**Before:**

```
# Doc-4E — RFQ Procurement Engine — API & Integration Contracts — Canonical Structure Proposal v0.1
```

**After:**

```
# Doc-4E — RFQ Procurement Engine — API & Integration Contracts — Structure Proposal v0.1
```

*Basis:* F-04 optional cleanup — "Canonical" designation removed (canonicity is conferred at freeze, not at proposal stage; consistent with the Doc-4D/4C convention where the *frozen* artifact, not the proposal, is "Canonical"). Trivial; no content change.

---

### PATCH-4E-S-07 — F-08 (optional, trivial) — §E13 audience addition

**Location:** §E13 — AI-Agent Implementation Considerations, "Ambiguity prevention" closing audience clause.

**Before:**

```
**no event/slug/audit-action/POLICY-key invention** — escalate via the DE / `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` channels. Audience: Claude Code, Cursor, backend, frontend, QA.
```

**After:**

```
**no event/slug/audit-action/POLICY-key invention** — escalate via the DE / `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` channels. Audience: Claude Code, Cursor, backend, frontend, QA, **AI Coding Agents**.
```

*Basis:* F-08 optional cleanup — adds "AI Coding Agents" to the audience list. No behavioral change.

---

# 4. Impact Analysis

| Dimension | Assessment | Evidence |
|---|---|---|
| **No ownership changes** | **CONFIRMED** | F-01 adds an aggregate-root *pointer* (`buyer_supplier_relationships`) for an already-not-owned Operations entity; ownership of every entity is unchanged. No entity moved between modules. |
| **No lifecycle changes** | **CONFIRMED** | No state, transition, or machine added/modified. F-05/F-06 explicitly keep cancellation and revision as existing §5.4/§5.5 transitions; no edge touched. |
| **No authorization changes** | **CONFIRMED** | F-07 confirms two existing Doc-2 §7 slugs and clarifies their scope notation; no slug invented, removed, or rebound. F-02 references a Communication channel without creating any permission. |
| **No audit changes** | **CONFIRMED** | No audit action coined. F-05/F-06 note cancellation/revision as existing §9 audit actions; `[ESC-RFQ-AUDIT]` register unchanged. |
| **No event invention** | **CONFIRMED** | F-05 (`RFQCancelled`) and F-06 (quotation-revision) **verified absent** from Doc-2 §8 → **not added**. Emitted/consumed event set unchanged from the proposal. |
| **No architecture changes** | **CONFIRMED** | No module, bounded context, aggregate, domain, or family-map change. F-03 maps existing BCs to existing sections (no section added/removed). The procurement moat and all DE-1…DE-8 boundaries are intact. |
| **No scope expansion** | **CONFIRMED** | Every change is a pointer/boundary/mapping/notation clarification or a recorded non-invention; two trivial cleanups (title, audience). No new contract group, no behavioral content. |
| **Structure-only discipline** | **CONFIRMED** | No contract, endpoint, payload, validation, or business rule instantiated by this patch. |

**Regression posture:** the patch is purely additive (pointers, one boundary exclusion, one mapping clarification, two recorded verifications, two trivial cleanups). It introduces no entity, event, permission, audit action, state, POLICY key, bounded context, or section, and moves no ownership. No carried dependency (DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`) is resolved, modified, or reopened.

---

# 5. Freeze Readiness Assessment

| Question | Answer |
|---|---|
| **Open BLOCKER** | **NO** — none raised in the review; none introduced. |
| **Open MAJOR** | **NO** — the review raised no MAJOR; all applied findings were MINOR (F-01/F-02/F-03/F-05/F-06/F-07) plus two optional NITPICKs (F-04/F-08), all now closed. |
| **Open MINOR** | **NO** — F-01, F-02, F-03 applied directly; F-05, F-06, F-07 resolved via corpus verification (two non-invention confirmations, one separate-slug confirmation). No MINOR remains open. |
| **Ready for Structure Freeze** | **YES** |

**Justification.** The Independent Architecture Review decision was **APPROVE WITH STRUCTURE PATCH**, with all open findings at MINOR severity and two optional NITPICKs. Every open finding is now closed: F-01/F-02/F-03 by direct additive clarification (aggregate-root pointer, clarification-thread exclusion, BC→section mapping), and F-05/F-06/F-07 by mandatory corpus verification against the frozen Doc-2 §8 and §7 — yielding **no event invention** (RFQCancelled and quotation-revision verified absent and therefore not added) and a confirmed **separate-slug** notation. Both optional cleanups (F-04 title, F-08 audience) were trivial and applied. Impact analysis confirms no change to ownership, lifecycle, authorization, audit, events, or architecture, and no scope expansion. The amended structure remains structure-only, conforms to Doc-4A (§0.3 reference-never-restate, §13, §16.4, §17, §18, §21) and the frozen corpus, and carries DE-1…DE-8 + `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` unchanged through their named channels. Per the lifecycle rule that a module may freeze with **no open BLOCKER/MAJOR/MINOR** (NITPICKs/carried markers deferrable), the Doc-4E structure as amended by this patch is **ready to proceed to Structure Freeze → Pass-A Authoring**.

> No conflict with the frozen corpus was encountered during patch application or verification; no flag-and-halt was triggered.

---

*End of Doc-4E_Structure_Patch_v0.1.1 — applies F-01/F-02/F-03 (direct) and F-05/F-06/F-07 (corpus-verified: no event invented; view-slugs confirmed separate) plus optional F-04/F-08. Additive clarifications only; no ownership, lifecycle, authorization, audit, event, or architecture change. Decision: all findings closed; ready for Structure Freeze. Canonical input: `Doc-4E_Structure_Proposal_v0.1.md` as amended by this patch.*