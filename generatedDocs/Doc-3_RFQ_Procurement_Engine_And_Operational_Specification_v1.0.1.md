# Doc-3: RFQ Procurement Engine & Operational Specification

| Field | Value |
|---|---|
| Document | Doc-3 — RFQ Procurement Engine & Operational Specification |
| Version | 1.0.1 |
| Status | Implementation-Ready Operational Specification — CANONICAL |
| Date | 2026-06-12 |
| Supersedes | Doc-3 v1.0 (Doc-3_Patch_v1.0.1, PATCH-04A Vendor Selection, and Doc-3_Patch_v1.0.1_Extension fully integrated) |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md (+ Architecture Patch v1.0.1) and Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md — both FROZEN, immutable constraints |
| Scope | Operational behavior only — no API design, no database design, no UI design, no architectural change |

**How to read this document.** Doc-1 defines what the system is. Doc-2 defines what the data is. Doc-3 defines **how the marketplace behaves**: the policies, gates, windows, escalations, and human processes that turn the frozen structures into a functioning procurement marketplace. Every rule herein is expressed against entities, states, and events that already exist in Doc-2; no new module, entity, or ownership is introduced. Rules are classified throughout as **FIXED** (invariant — never configurable, enforced in code and CI), **POLICY** (configurable in `core.system_configuration`, with a recommended starting value marked *[start]*), or **ORG** (per-organization workflow setting). Section 12 consolidates the full classification. Where a policy choice was genuinely contestable, the alternatives are stated and one is recommended with reasoning.

**Operating doctrine (applies everywhere):**

1. The marketplace sells *matched, metered, high-intent leads* — not exposure. Every policy defends lead quality for vendors and response quality for buyers.
2. Numbers are policy; mechanisms are architecture. This document designs mechanisms and names the configuration keys; it recommends starting values but never hardcodes them into the design.
3. Every gate must fail silently and indistinguishably where the non-disclosure invariant applies, and loudly and explainably everywhere else.
4. Every policy is evaluated against its abuse case before adoption. A rule that can be gamed cheaper than it can be enforced is redesigned, not patched.

---

## SECTION 0 — Marketplace Operating Context

### 0.1 Operating Stages

The marketplace operates at three maturity stages. The active stage is a **platform-wide operational decision** (never a tenant decision), held in POLICY `platform.operating_stage` and changed only by platform governance.

| Stage | Marketplace status | Operational characteristics |
|---|---|---|
| **A — Founder Assisted** | Low buyer count, low vendor count, sparse category coverage | System generates routing recommendations; final release may be approved manually (release SLA POLICY `stage_a.release_sla_hours` *[start: 8 business hours]*); manual vendor sourcing; founder intervention allowed within the limits of 0.1.1 |
| **B — Assisted Marketplace** | Growing vendor base and RFQ volume | Automated routing; exception-based human review (Section 3.6 criteria); strategic buyer and vendor support |
| **C — Autonomous Marketplace** | Sufficient category liquidity, stable routing confidence | Fully automated routing; human intervention by exception only |

Stage transitions may also be set **per category cell** (a mature Dhaka pumps cell can run Stage C while an emerging Khulna fabrication cell runs Stage A) via per-cell POLICY override.

#### 0.1.1 Stage Authority Limits (FIXED)

No stage — including Founder Assisted — permits any human, founder included, to: bypass the blacklist, bypass eligibility gates, bypass verification gates, override trust restrictions, or breach the non-disclosure invariant. Stages change *who confirms* routing output and *how much human sourcing effort* applies; they never change the rules the output must satisfy. Founder expertise supplements marketplace intelligence; it does not replace governance.

### 0.2 Marketplace Creation vs Marketplace Optimization

Two phases with different objective priorities:

- **Phase 1 — Creation:** vendor onboarding, buyer acquisition, category liquidity, supply depth.
- **Phase 2 — Optimization:** fairness efficiency, conversion, capacity utilization.

**Rule:** creation objectives take priority while category liquidity remains below platform targets (POLICY `platform.liquidity_targets`, per cell). A perfectly optimized marketplace with insufficient participants is still an unsuccessful marketplace.

**Conflict resolution (binding):** creation-priority is implemented exclusively by **tuning POLICY values** (wider probation share, broader geography bands, heavier sourcing effort) — never by suspending FIXED rules. Fairness mechanics, gates, and firewalls are stage- and phase-invariant.

### 0.3 AI Assistance Layer (advisory only)

AI assists users and operations; it is never a decision authority (frozen: AI suggests, business modules decide).

| Side | Functions |
|---|---|
| Buyer | RFQ drafting assistance, category suggestion, specification extraction, duplicate RFQ detection |
| Vendor | Profile completion assistance, category recommendation, quotation drafting assistance |
| Operations | Missing-vendor identification, category gap analysis, routing anomaly detection, abuse detection assistance |

**FIXED:** AI recommendations are advisory only; final authority remains with users, administrators, and approved workflows. AI assistance respects all permission boundaries and reads only data the requesting organization already has access to.

### 0.4 Strategic Account Operations

Certain organizations create disproportionate marketplace value (high-volume buyers, strategic vendors, industry anchors, enterprise accounts). They receive **enhanced support, never enhanced rules**.

- **Workflow:** qualification review → strategic account flag → enhanced support → periodic review (POLICY `strategic.review_cadence_days` *[start: 180]*) → retention or removal.
- **Services:** dedicated support, faster issue resolution, onboarding assistance, verification assistance (priority queue, not relaxed standards), marketplace education.
- **FIXED restrictions:** strategic accounts may not receive routing preference, trust preference, verification bypass, eligibility bypass, or capacity bypass. Support quality may vary; marketplace fairness may not.
- **Success metrics:** RFQ activity, vendor engagement, category development, marketplace contribution.

---

## SECTION 1 — RFQ Lifecycle Specification

### 1.1 Canonical States (frozen in Doc-2 §5.4)

```
draft → [pending_internal_approval] → submitted → under_review → matching
      → vendors_notified → quotations_received → buyer_reviewing
      → shortlisted → closed_won | closed_lost
vendors_notified | quotations_received | buyer_reviewing → expired   (system actor)
any active state → cancelled                                          (audited reason)
```

This section defines the operational meaning of each transition: who may trigger it, what must be true before it, what must happen after it, and what the clock does to it.

### 1.2 State-by-State Specification

#### draft

| Aspect | Rule |
|---|---|
| Entry | Any user with `can_create_rfq` in the active buyer organization. |
| Validation on entry | None beyond category existence. Drafts are deliberately permissive: friction at draft kills demand. |
| Exit criteria | Submit (→ `pending_internal_approval` if the org's workflow requires approval, else → `submitted`); discard (soft delete). |
| Validation on exit (submission gate) | **FIXED set:** category present and active (leaf or any level — see 1.3); `work_nature` non-empty; `estimated_value` present, > 0, BDT; delivery geography at least to district level; routing mode selected; at least one specification attachment **or** an explicit "no formal spec" flag with free-text scope ≥ a minimum length (POLICY `rfq.min_scope_chars` *[start: 200]*); attached specs reference an active document revision. |
| Timeout | Dormant drafts auto-archive after POLICY `rfq.draft_dormancy_days` *[start: 90]*; archival is reversible (soft state, not the state machine). |
| Escalation | None. |

#### pending_internal_approval (only when ORG workflow requires)

| Aspect | Rule |
|---|---|
| Entry | Submission by a user lacking `can_approve_rfq`, in an org whose `rfq_approval_mode ≠ none`. A user who holds approval authority and submits self-approves in one step — recorded as both creator and approver. |
| Exit | Approve (`can_approve_rfq`, per the org's configured chain) → `submitted`; reject → `draft` with mandatory reason; cancel. |
| Timeout | Reminder to pending approver after ORG-configurable interval (default POLICY `rfq.approval_reminder_hours` *[start: 24]*); after POLICY `rfq.approval_stale_days` *[start: 7]* the creator and org Owner are notified; the RFQ never auto-approves. **FIXED:** silence never equals consent for financial-relevant actions. |
| Escalation | Multi-step chains escalate stepwise per `organization_workflow_settings.approval_chain`. If an approver's membership becomes inactive mid-flight, the approval task re-routes to the next holder of `can_approve_rfq`; if none exists, to the Owner. |

#### submitted → under_review (platform moderation)

| Aspect | Rule |
|---|---|
| Purpose | Protect vendors from junk demand. Moderation is the demand-side quality gate and one of the strongest anti-abuse controls (Section 10). |
| Mode | Tiered: auto-pass, auto-flag, manual queue. POLICY `moderation.mode` per buyer trust level: organizations with verification level ≥ Verified **and** historical RFQ closure rate ≥ POLICY `moderation.trusted_closure_rate` *[start: 0.5]* auto-pass with async spot-checks; new or Unverified organizations enter the manual queue. |
| Checks | Contact-leak scrubbing (emails/phones/URLs in scope text — see 1.5); duplicate detection (same org, same category, similar scope within POLICY `moderation.dup_window_days` *[start: 14]*); value plausibility (estimated_value vs category norms — flag, never silently edit); prohibited content; RFQ quality banding (1.7) — High-quality RFQs get moderation priority. |
| Outcomes | Cleared → `matching`. Rejected → returned to `draft` with reason (audited); repeated rejections feed the buyer abuse score (Section 10.2). |
| SLA / Timeout | Manual queue SLA POLICY `moderation.sla_hours` *[start: 4 business hours]*; breach escalates to admin lead and surfaces on the ops dashboard. **FIXED:** an RFQ may never sit in `under_review` silently beyond the SLA without an operational alert. |

#### matching

| Aspect | Rule |
|---|---|
| Behavior | The routing pipeline (Section 3) executes asynchronously. Target completion is minutes, not hours. |
| Failure handling | Pipeline error → retry with backoff; after POLICY `matching.max_retries` *[start: 3]*, park the RFQ in `matching` with an ops alert. Never silently drop. |
| Empty-pool outcome | If zero vendors survive the gates: (a) in restricted modes (Approved Only / Approved+Conditional) the buyer is notified immediately with the offer to widen the mode — the RFQ holds in `matching` for POLICY `matching.empty_hold_days` *[start: 3]* before auto-expiry warning; (b) in Open Market, the empty cell triggers the Coverage Recovery Workflow (Section 11.4): coverage gap record, vendor recruitment tasks, buyer notified honestly ("we are sourcing suppliers for this requirement"). **FIXED:** the buyer is never shown fake matching activity. |

#### vendors_notified

| Aspect | Rule |
|---|---|
| Entry | First invitation wave delivered (Section 5.3). `VendorInvited` events fire per delivered invitation. |
| Quotation window | Every RFQ carries a quotation window: buyer-selected within POLICY bounds `rfq.quote_window_min_days` / `max_days` *[start: 3 / 21]*, defaulted by category norms. The window is visible to vendors on the invitation. |
| Exit | First quotation → `quotations_received`. Window lapse with zero quotations → replenishment waves first (Section 5.3); if exhausted, → `expired`. |
| Buyer edits | Edits create a new RFQ version (frozen rule: versions immutable once quoted — pre-quote edits also version, with revision reason). Material edits (spec, value, work_nature, geography, window) re-notify all invited vendors and **reset the response clock** for vendors who have not yet responded (POLICY `rfq.edit_clock_reset` *[start: true]*). |

#### quotations_received → buyer_reviewing

| Aspect | Rule |
|---|---|
| Transition | `buyer_reviewing` begins when the buyer first opens the comparison statement, or automatically at window close — whichever first. The distinction matters operationally: vendor-facing status shows "under evaluation" only from `buyer_reviewing`. |
| Late quotations | Governed by Section 8.5. |
| Buyer inactivity | Nudge at POLICY `review.nudge_days` *[start: 5]* after window close; second nudge + account-manager task at *[start: 10]*; auto-expiry per 1.4 if no action by the RFQ validity limit. Buyers who habitually let RFQs rot are scored down (Section 10.2) — vendor effort is the marketplace's scarcest resource. |

#### shortlisted

| Aspect | Rule |
|---|---|
| Entry | Buyer marks ≥1 quotation as shortlisted (`can_approve_vendor_selection`). |
| Behavior | Shortlisted vendors are notified (positive signal). Non-shortlisted vendors are **not** notified at this stage — shortlists churn; premature loss signals create noise and resentment. They are notified only at terminal close (Section 9.5). |
| Exit | Award (→ `closed_won`, `can_award_rfq`), close-without-award (→ `closed_lost` with reason), cancel, or expiry per 1.4. |

#### closed_won / closed_lost (terminal)

- `closed_won` requires exactly one selected quotation (frozen: single award; partial-award handling in Section 9.4). Records award value; emits `RFQClosedWon`; creates the engagement; all non-selected invitees receive a uniform closure notification (Section 9.5).
- `closed_lost` requires a structured reason code (POLICY-managed list: budget dropped, requirement changed, no suitable quotes, sourced off-platform, other+text). Reason quality feeds demand analytics and the buyer's closure-rate metric. **FIXED:** terminal states never reopen.

#### expired (terminal, system actor)

- Fired by the validity clock (1.4). All open invitations → `expired`; undelivered deferred invitations are discarded without performance effect; open quotations → `expired` (no performance penalty to the vendor — the buyer went silent, not the vendor).

#### cancelled (terminal)

- Buyer-initiated from any active state (`can_cancel_rfq`), mandatory reason, audited. Vendors who already responded receive the closure notification with "cancelled by buyer". Habitual post-quote cancellation feeds the buyer abuse score.

### 1.3 Category-Level Rule

RFQs should target the deepest sensible category. POLICY `rfq.category_min_level` *[start: 2]* — an RFQ at level 1 ("Mechanical") is too broad to route well; the composer requires at least level 2 and recommends level 3–4. Routing at a non-leaf category matches all vendor assignments at or below that node.

### 1.4 The Validity Clock (timeout architecture)

One master clock per RFQ, started at `vendors_notified`:

```
rfq_validity = quote_window + review_allowance + decision_allowance
```

- `review_allowance` POLICY `rfq.review_allowance_days` *[start: 14]*; `decision_allowance` POLICY `rfq.decision_allowance_days` *[start: 14]*.
- The buyer may extend the clock (visible to invitees) up to POLICY `rfq.max_extensions` *[start: 2]* times; further extension requires the buyer to re-confirm intent, which resets vendor expectations honestly.
- Clock lapse → `expired`. **Why a hard expiry exists:** zombie RFQs poison vendor trust in lead quality. A vendor who quotes into silence three times stops quoting. Expiry converts silence into a clean, explainable signal and frees vendor active-capacity slots (Section 4).

### 1.5 Contact-Leak Policy (disintermediation control)

The platform's revenue does not depend on transaction cuts, so full anti-disintermediation paranoia is unnecessary — but pre-award contact leakage destroys the comparison discipline and the RFQ data asset. Rule set:

- **FIXED:** RFQ scope text and quotation documents are scrubbed/flagged for raw contact details pre-award; clarification threads are the sanctioned channel.
- Post-award, full contact exchange is expected and unimpeded (deals settle off-platform by design).
- Moderation flags, never silently edits, buyer text (trust through transparency); repeated deliberate leakage feeds abuse scoring on either side.

### 1.6 Reopening Rules

- **FIXED:** terminal states (`closed_won`, `closed_lost`, `cancelled`, `expired`) never transition back. The state history is evidence.
- Operational reopening = **re-issue**: the buyer creates a new RFQ pre-filled from the old one (new identity, new version chain, fresh routing). The new RFQ records a `reissued_from` reference for analytics. Re-issue from `closed_won` is blocked for the same scope within POLICY `rfq.reissue_won_block_days` *[start: 30]* unless the engagement was cancelled — prevents award-then-reshop pressure tactics against the winning vendor.

### 1.7 RFQ Quality Assessment

Not all RFQs provide equal vendor value. Each RFQ receives an operational quality band at moderation:

- **Inputs:** specification detail, drawings attached, estimated value provided, delivery requirements defined, timeline defined (thresholds POLICY `quality.band_thresholds`).
- **Bands:** High Quality · Standard · Low Quality.
- **Usage:** moderation priority (high quality fast-tracks), buyer coaching (low quality triggers composer guidance and, for repeat low-quality submitters, an ops touch), and routing-confidence interpretation (a low-quality RFQ widens the confidence uncertainty band — ops reads its routing telemetry accordingly).
- **FIXED:** RFQ quality is operational metadata. It is never a public score, never shown as a buyer rating, and never a routing gate — a vague RFQ from a real buyer is still demand; the response is coaching, not exclusion.

---

## SECTION 2 — Vendor Eligibility Framework

Eligibility is binary and evaluated per (RFQ version, vendor profile). A vendor is eligible only if **every** gate passes. Gates are evaluated in the pipeline order of Section 3; this section defines each gate's semantics.

### 2.1 Buyer Filter Gate (first, always)

- Routing mode resolves the candidate universe: Approved Only / Approved+Conditional → the buyer's CRM list intersected with all other gates; Approved+Open Market / Open Market → category universe.
- **FIXED (non-disclosure invariant):** Blacklisted vendors are removed before any other processing, in every mode. No artifact of any kind — no matching_result row, no invitation, no lead, no count, no log visible outside buyer-org/compliance scope — may distinguish a blacklisted vendor from an ordinary non-match.
- An organization may never receive its own RFQ: **FIXED** self-match exclusion (buyer org = vendor controlling org, or vendor profile is a representative of the buyer's own profile). This is also an anti-farming control (Section 10.1).

### 2.2 Category Gate

- Vendor must hold an **active** category assignment at or below the RFQ's category node.
- Primary assignments qualify at full weight; Secondary assignments qualify at reduced weight (frozen: 100%/40%). **Operational choice:** Secondary assignments *pass the gate* but carry their weight penalty into scoring. *Alternative considered:* Secondary passes only when primary supply is insufficient. *Recommended:* always pass — supply thinness in Bangladesh's industrial categories makes hard secondary exclusion too aggressive; the 40% weight already prices the difference. Revisit per-category via POLICY `routing.secondary_pass_mode`.
- Assignments under admin review (`proposed`) do not qualify.

### 2.3 Capability Gate and Work-Nature Gate (hard exclusions — frozen)

- Capability Gate: the vendor's effective capability flags (preset + overrides) must be a **superset** of the RFQ's `work_nature` set. A supply+service RFQ requires both flags.
- Work-Nature Gate is the per-element check of the same rule, kept separate (frozen pipeline) so that gate telemetry distinguishes "wrong vendor type" from "partially capable".
- **FIXED:** failing vendors never enter scoring, sorting, throttling, or routing, and never appear in `matching_results`.

### 2.4 Geography Evaluation

- **Frozen:** geography is a confidence modifier, not a hard exclusion — unless the RFQ explicitly requires it (`rfq.geography_required` flag set by the buyer, e.g., on-site service work where remote supply is meaningless).
- Proximity bands (same industrial zone > same district > same division > national) map to score modifiers in Section 6. Service/fabricate work natures weight geography more heavily than pure supply (POLICY band multipliers).

### 2.5 Verification Gate

Layered, value-scaled. **Design question:** should unverified vendors receive RFQs at all? Total exclusion kills cold-start; total inclusion kills trust.

| RFQ value band (POLICY thresholds) | Eligible vendors |
|---|---|
| Low band *[start: ≤ Tier A ceiling]* | claimed + contact-verified (phone/email) |
| Mid band *[start: Tier B–C range]* | business-verified (trade license/BIN/TIN reviewed) or probation-pool members |
| High band *[start: ≥ Tier D range]* | business-verified **and** organization-verified; factory verification strongly weighted in scoring |

- `seeded`/`invited` (unclaimed) records are **never routable** — they exist for directory and outreach only. A vendor profile with no declared tier is never routable (frozen Doc-2 rule).
- Suspended verification (fraud review) = gate failure for new RFQs; see 2.7.

### 2.6 Probation Pool

- **Definition:** a vendor enters probation when it is claimed, contact-verified, has a complete matching surface (capability flags, ≥1 primary category, declared tier, capacity profile, geography), and has not yet met the performance minimum-data threshold (5 responses or 2 completed projects).
- **Exposure:** probation vendors fill the reserved routing share (frozen mechanism; ratio POLICY `routing.probation_share` *[start: 20%]*) — they compete within the probation slot, not against established vendors.
- **Per-vendor probation caps:** max concurrent probation invitations POLICY `probation.max_active` *[start: 3]* and value ceiling POLICY `probation.value_cap` *[start: one tier band below declared tier, floor Tier A]*. Rationale: limit the damage radius of an unproven vendor while still generating the data that proves them.
- **Exit:** upward — minimum-data threshold met with performance ≥ Not-Poor → normal pool. Downward — response rate < POLICY `probation.min_response_rate` *[start: 30%]* across first N invitations, or a verified complaint → probation pause + re-onboarding outreach (human process: ops contact, profile coaching). Probation is a runway, not a right.

### 2.7 Suspension Behavior

- Suspended vendor profile (admin action or org cascade): fails eligibility for **new** routing immediately; existing delivered invitations may still be responded to (POLICY `suspension.allow_open_responses` *[start: true]* — buyers already invested evaluation effort); open engagements continue (post-award is contract land, not marketplace land); directory listing hidden or banner'd per ban policy.
- Banned: everything suspended does, plus public ban banner, plus open invitations cancelled with uniform "vendor unavailable" signal to buyers.

### 2.8 Representative Access Behavior

- Eligibility is always computed against the **vendor profile** — never against representative organizations.
- On delivery, invitation grantee rows materialize access for the controlling org and every representative org whose active delegation grant covers RFQ access (frozen mechanism).
- One vendor = one active quotation per RFQ regardless of how many representatives act (frozen). Operationally: the second representative attempting a parallel quote is shown the existing draft/quote with replace/revise/withdraw options — the conflict is surfaced inside the vendor's own house, never to the buyer.
- Representative misconduct attributes to the vendor profile's performance/trust (the profile is the market identity) **and** is recorded against the representative org for the controlling org's visibility. Owners chose their representatives; the market judges the profile.

### 2.9 Financial Tier Lifecycle (operational)

Tier influences eligibility (gate A6) and wave value-banding; its operational lifecycle:

```
No Tier → Declared → Pending Verification → Verified → Upgrade Review → Verified (higher tier)

Downgrade path:   Verified → Review Trigger → Reassessment → Downgrade (audited, evented)
Suspension path:  Verified → Compliance Concern → Suspended → Review → Reinstated | Downgraded
```

- **No Tier:** profile not routable (frozen rule). Declaring a tier is part of claim/profile completion.
- **Declared:** the marketplace-owned claim; immediately effective for gating, subject to value-banded verification gates (2.5).
- **Verified statuses** (pending_verification / verified / suspended / expired) live in the trust domain; absence of a verification record = Declared Only (frozen).
- **Upgrade triggers:** additional documentation, increased completed-project history, win history above current tier (frozen suggestion threshold), independent verification, expanded commercial-capacity evidence (the optional turnover range is *evidence*, never the tier basis — tiers are project-value-based, frozen).
- **Downgrade triggers:** expired documents, failed re-verification, material risk findings, sustained capacity contradiction.
- All transitions: audited, versioned tier history, `VendorTierChanged` with `tier_type`, matching refresh. **Principle:** Financial Tier reflects verified capability, not marketing claims.

### 2.10 Vendor Claim & Ownership Workflow (operational)

Transition from seeded / imported / buyer-added identity to an authoritative marketplace-owned vendor profile:

```
Vendor identity exists (seeded | imported | buyer-added link candidate)
→ Claim request submitted → Identity verification (contact ownership; business match)
→ Ownership validation (claiming organization legitimacy; one-profile-per-org rule)
→ Claim approved → Vendor ownership established (controlling organization set)
→ Trust review → Verification lifecycle begins (2.5 gates open progressively)
```

Ownership **transfer** (post-claim) follows the frozen protection workflow:

```
Ownership change requested → Eligibility validation → Transfer approval
→ Ownership history recorded → Trust Freeze triggered → Compliance review window
→ Trust recalculation → Transfer finalized
```

Rules (frozen, restated operationally): transfers are auditable, evented (`VendorOwnershipTransferred`), history-preserving, and always trust-protected. Vendor reputation survives ownership changes; trust protection prevents reputation laundering. Contested claims (two organizations claiming one seeded identity) park the profile in admin review — never first-come-wins on contested industrial identities.

### 2.11 Buyer-Supplied Vendor Workflow

Buyers may bring their own vendors — simultaneously procurement support and the platform's highest-conversion vendor-acquisition engine:

```
Buyer adds vendor (email/contact/company info, at RFQ creation or in CRM)
→ Email validation → Private vendor record created (buyer-org scoped)
→ Buyer-directed invitation sent (outreach channel, carrying the RFQ opportunity)
→ Vendor registration opportunity → Claim/link opportunity (link, never merge)
→ Marketplace participation:  Private record → Invited → Registered → Claimed → Verified
```

**Reconciliation rules (binding):**

- A buyer-directed outreach invitation is **not platform routing**: it bypasses no gate because the buyer is exercising its own private vendor relationship, and it carries no marketplace matching endorsement. The recipient must register and claim before responding on-platform; from that point normal eligibility applies to *future* routed RFQs.
- Buyer-supplied records remain private vendor records (buyer-org visibility only) and never auto-convert to public profiles. The conversion path runs through registration + claim + link (frozen link-not-merge).
- Buyer-directed outreach invitations are **not valid leads** for guarantee accounting (11.6) — the buyer sourced them, not the platform.

---

## SECTION 3 — RFQ Routing Engine

### 3.1 Canonical Pipeline (reconciling the frozen orderings)

The architecture fixes two orderings: the governance order (buyer filter first; tier gate before confidence) and the matching-pipeline refinement (eligibility validation → category → capability → work nature → geography → scoring → sorting → throttling → routing). Merged, the canonical operational pipeline is:

```
PHASE A — HARD GATES (binary; order FIXED; failures leave no vendor-visible trace)
  A0  RFQ Eligibility Validation   — RFQ itself routable: cleared moderation, valid version,
                                      value present, window set, buyer org in good standing
  A1  Buyer Filter                 — routing mode universe + blacklist floor + self-match exclusion
  A2  Category Gate                — active assignment at/below RFQ node
  A3  Capability Gate              — flags ⊇ work_nature
  A4  Work-Nature Gate             — per-element coverage check
  A5  Verification Gate            — value-banded (2.5) + probation membership resolution
  A6  Financial Tier Gate          — RFQ value ≤ vendor tier ceiling (declared, or verified if
                                      stricter and POLICY tier.use_verified_when_present [start: true])
  A7  Capacity Pre-Gate            — vendor not capacity-exhausted (Section 4); exhausted vendors
                                      are deferred, not excluded

PHASE B — GEOGRAPHY EVALUATION (modifier computation; hard only if RFQ requires)

PHASE C — SCORING       Matching Confidence per survivor (Section 6) → matching_results

PHASE D — SELECTION (Vendor Selection & Fair Distribution Framework)
  D1  Capacity Adjustment     — soft priority reduction for vendors approaching configured
                                capacity thresholds (hard exhaustion already deferred at A7)
  D2  Exposure Fairness       — exposure_ratio = recent RFQ exposure / allowed capacity;
                                disproportionately exposed vendors receive a fairness penalty
                                (prevents routing concentration)
  D3  Probation Allocation    — reserved share of wave slots for probation vendors
  D4  Final Selection         — highest-ranked after confidence + capacity + fairness +
                                probation allocation; equivalence-band rotation and salted
                                tie-breaks (3.3, 6.5)

PHASE E — THROTTLING    Per-vendor delivery metering (Section 4) → selected / deferred

PHASE F — ROUTING       Wave assembly (Section 5) → invitations delivered → grantee +
                        document-grant rows materialized → VendorInvited events
```

**FIXED:** phase order; gate-before-score; blacklist before everything; no gate-failed vendor in any downstream artifact. **POLICY:** every threshold inside the phases.

### 3.2 Pipeline Telemetry (operational requirement)

Every run logs per-phase in/out counts to the routing log (frozen entity). Ops dashboards track: gate attrition profiles per category (which gate kills supply), empty-pool frequency per cell, time-to-first-delivery, deferred-queue depth. This telemetry is the tuning instrument for every POLICY value in this document — without it, configuration is guesswork.

### 3.3 Routing Fairness

The failure mode of naive confidence-ranked routing is **winner-take-all**: the top three vendors in a category absorb every lead, their capacity saturates, their response quality drops, while vendor #4 — nearly identical — starves and churns. Fairness mechanics:

1. **Equivalence bands.** Vendors whose confidence scores fall within POLICY `fairness.band_width` *[start: 5 points]* are treated as equivalent; within a band, selection rotates by least-recently-routed (LRR). Precision beyond the band width is false precision — the data does not support it, so the marketplace should not pretend it does.
2. **Exposure ceiling and exposure ratio.** No vendor receives more than POLICY `fairness.max_share_per_cell` *[start: 40%]* of a category×geo cell's invitations per rolling window — unless the cell has fewer qualified vendors than the wave size (thin-supply override, logged). Below the hard ceiling, the graded mechanism is the **exposure ratio** (`recent RFQ exposure / allowed capacity`, Phase D2): as the ratio climbs, a progressive fairness penalty pulls the vendor down within its band, smoothly diverting demand before the ceiling ever binds.
3. **Anti-starvation floor.** Any qualified, capacity-available vendor not routed anything in POLICY `fairness.starvation_days` *[start: 30]* gets a priority bump in its next band rotation. A vendor that never sees a lead never generates the performance data that could justify routing it — starvation is self-reinforcing and must be actively broken.
4. **Deterministic tie-breaking with logged salt** (Section 6.5) — prevents both bias and gameable predictability.
5. **Selection doctrine (FIXED):** the platform must not always select the same vendors, and must not route purely randomly. Selection permanently balances four objectives: buyer outcome quality, vendor fairness, marketplace growth, and capacity utilization. Best match + fair exposure + sustainable growth — never any one alone.

### 3.4 Cold-Start Vendor Handling

- New vendors ride the probation slot (2.6): guaranteed minority exposure without displacing proven vendors' majority share.
- Scoring with no performance history: Not Rated is **excluded and renormalized** (Section 6.4), never zeroed — mirroring the frozen performance renormalization principle.
- The first invitations a new vendor receives are deliberately **down-banded in value** (probation value cap): small RFQs are cheap proving grounds; a botched 2 Lac job is a lesson, a botched 2 Crore job is a marketplace reputation event.
- Human process: vendors who complete onboarding but fail to respond to their first 2 invitations get a proactive ops touch (call/WhatsApp) before algorithmic demotion — early silence is usually confusion, not negligence.

### 3.5 New-Vendor Exposure Strategy (graduation curve)

```
Stage 0  claimed, incomplete surface      → not routable; onboarding nudges
Stage 1  probation                        → capped count + capped value (2.6)
Stage 2  threshold met, performance ≥ avg → normal pool, full band participation
Stage 3  sustained strong performance     → eligible for priority treatments (Section 7.2)
```

Stage transitions are events-driven (performance updates), audited, and visible to the vendor ("what unlocks next" — transparency converts the curve into a motivation instrument).

### 3.6 Human-Assisted Routing & Founder Review

Bangladesh industrial procurement is relationship-heavy; certain RFQs warrant human assistance regardless of operating stage.

**Human-assist criteria** (POLICY `human_routing.criteria_thresholds`): high-value RFQs, strategic categories, first-time buyers, empty-pool situations, low-confidence matches (best available confidence below threshold).

**Allowed human actions:** suggest additional vendors (who must still pass every gate), validate routing results before release, trigger the sourcing workflow, request buyer clarification.

**Forbidden human actions (FIXED):** bypass the blacklist, bypass eligibility gates, bypass verification gates, override trust restrictions, or create any vendor-visible artifact that breaches non-disclosure. Humans may improve routing quality; humans may not violate marketplace rules.

**Founder review (Stage A):** triggers — first RFQ in a category, strategic RFQ, high-value RFQ, empty-pool RFQ. Founder may approve routing release, request vendor sourcing, request category expansion, or escalate moderation — within the same forbidden-actions wall, under the Stage A release SLA (0.1). Every human routing action is audited with actor and rationale; human-assisted runs are flagged in routing telemetry so their outcomes can be compared against autonomous runs (the data that eventually justifies Stage C).

---

## SECTION 4 — Vendor Capacity Model

Capacity is the marketplace's flow-control system. It exists to protect three parties: the vendor (from lead flooding), the buyer (from invitations to vendors who cannot respond), and the marketplace (from response-rate collapse, its single most fragile health metric).

### 4.1 The Three Capacities (framework)

| Capacity | Definition | Source of the limit |
|---|---|---|
| **Intake capacity** | Max invitations *delivered* per rolling window | `effective_intake = min(vendor_declared, entitlement_quota, system_throttle)` |
| **Active capacity** | Max invitations simultaneously *open* (delivered, not yet responded/expired) | POLICY formula: base by tier + modifier by capacity profile (team size, max_monthly_rfq_capacity) |
| **Monthly engagement capacity** | Max concurrent *won* engagements in delivery | Derived from capacity profile (max_project_value × concurrency evidence); advisory at first (warns, doesn't gate), POLICY `capacity.engagement_gate_enabled` *[start: false — advisory]* |

- *Vendor-declared* is the self-set `max_monthly_rfq_capacity` (frozen field) — a vendor may always throttle itself down (vacation, Eid shutdown, full order book) instantly and without penalty. Self-throttling is a **good** signal and must never be punished; punishing it teaches vendors to ignore leads instead.
- *Entitlement quota* is the monetization layer's `monthly_rfq_limit` (frozen) — consumption attributed to the controlling organization.
- *System throttle* is the platform's per-tier guardrail POLICY `capacity.system_throttle[tier]` — the cap that applies even if a vendor declares infinity.

### 4.2 Exhaustion Behavior

- A vendor at intake or active capacity is **deferred, not excluded**: the invitation enters `deferred` state in the per-vendor queue, ordered by RFQ urgency (window end) then confidence.
- Deferral is invisible to the buyer; the wave simply fills from the next band vendor (Section 5.3). **FIXED:** deferral never blocks a wave from filling.
- Deferred invitations auto-expire un-delivered if the RFQ's window would leave the vendor less than POLICY `capacity.min_response_runway_hours` *[start: 48]* to respond — delivering an impossible deadline manufactures a non-response and unfairly damages the vendor.

### 4.3 Recovery

Capacity slots free on: response (quote or formal decline — both free the active slot immediately, which is itself an incentive to decline formally rather than ignore), invitation expiry, RFQ terminal state. On slot-free, the deferred queue drains automatically (highest priority first), re-checking RFQ liveness and runway before delivery.

### 4.4 Adjustment

- **Vendor-initiated:** down — always, instantly. Up — instantly within the system throttle; beyond it, requires capacity-profile evidence review (human verification task).
- **System-suggested:** the throughput auditor compares declared capacity against observed behavior monthly. Sustained response rate < POLICY `capacity.suggest_down_rr` *[start: 50%]* at current intake → suggest lower intake (and apply a temporary soft reduction POLICY `capacity.auto_soft_reduce` *[start: true]* — protecting the response-rate commons outweighs vendor vanity). Sustained 100% response + high win conversion + fast responses → suggest raising intake.
- All adjustments evented and audited; capacity history is part of the vendor's operational record.

### 4.5 Capacity vs Tier vs Performance (firewall restated operationally)

Capacity limits **how many** leads flow; tier limits **how large**; performance shapes **which vendor first**. The three never substitute for one another: a Tier E vendor with tiny intake capacity is valid (selective giant); a Tier A vendor with huge intake is valid (high-volume small-jobs shop). Any code path that, e.g., raises effective capacity because performance is high must instead route through the suggestion workflow — silent coupling of the signals is a firewall violation.

---

## SECTION 5 — RFQ Distribution Policy

### 5.1 There Is No Public RFQ Board (clarifying a frozen consequence)

RFQs are **distributed**, never published. The architecture's disclosure rule (private until distribution; invited vendors only) plus invitation-grant tenancy means no vendor browses an open RFQ list. *Alternative considered:* a public RFQ board for liquidity. *Rejected (and architecturally foreclosed):* boards invite quote dumping, price-fishing, and farming; the matched-and-metered model **is** the product's moat. "Open Market" routing mode means *open matching universe*, not open visibility.

### 5.2 Wave Sizing (how many vendors)

The target is enough quotations for a meaningful comparison — not maximal coverage. Framework:

```
target_quotes  = POLICY distribution.target_quotes[value_band]      [start: 3–5]
expected_rr    = observed response rate of the candidate cell (rolling), floor POLICY
                 distribution.rr_floor [start: 0.25]
wave_size      = ceil(target_quotes / expected_rr), clamped to
                 [distribution.min_wave, distribution.max_wave]      [start: 3, 12]
```

- Wave size scales with value band: high-value RFQs justify wider competition; micro-RFQs don't deserve 12 vendors' attention (attention is the commons being managed).
- The probation share applies **inside** the wave (e.g., 20% of slots), rounding in favor of established vendors on small waves; a wave of 3 includes a probation vendor only if the cell's probation queue is starving (anti-starvation floor).

### 5.3 Waves and Replenishment

- **Wave 1** delivers at routing completion. **Replenishment waves** fire automatically when, at checkpoints (POLICY `distribution.replenish_check_hours` *[start: 24]*), projected quotes < target (declines + expiries + observed silence), drawing the next band vendors — including drained deferred queues.
- Replenishment stops when: target met, candidate pool exhausted, or remaining window < min runway. Pool exhausted + below target → buyer notified honestly with options (extend window, widen geography, relax a buyer-set constraint).
- **Why waves beat blast:** blast-routing burns the whole cell's attention on every RFQ, trains vendors that leads are cheap, and destroys the scarcity that makes a delivered invitation feel like a real opportunity.

### 5.4 Invitation Rules

- An invitation is a first-class commitment object: delivered with full (granted) RFQ context, spec access, window, and the buyer's organization verification level — vendors deserve to know demand quality just as buyers see supply trust.
- One invitation per (RFQ, vendor profile) ever (frozen uniqueness); re-issued RFQs are new RFQs and may re-invite.
- Vendors respond: quote, formal decline (reason-coded: too busy / out of scope / value too low / geography / other), or silence (expiry). Decline reasons are routing fuel — repeated "out of scope" declines in a category trigger an assignment-review nudge.

### 5.5 Anti-Spam Controls (vendor-protecting)

- Hard metering via capacity (Section 4) — the primary control.
- **Relevance floor:** vendors are never delivered an invitation whose confidence score sits below POLICY `distribution.relevance_floor` *[start: band-relative cutoff]* even if the wave is short — under-filled honest waves beat filled junk waves; junk invitations are the fastest way to teach vendors to ignore the platform.
- Per-buyer pressure valve: one buyer org may not occupy more than POLICY `distribution.max_buyer_share_of_vendor` *[start: 50%]* of any vendor's open active slots — protects vendors from being monopolized by a single demanding buyer.

---

## SECTION 6 — Matching Confidence Framework

### 6.1 Inputs (all frozen signals; no new data invented)

| Input | Source | Nature |
|---|---|---|
| Tier fit | declared/verified tier vs RFQ value | gate-passed already; scored for *closeness* (a Tier B vendor on an 18 Lac RFQ is a snugger fit than Tier E) |
| Capacity evidence consistency | capacity profile vs tier claim | contradiction discount (frozen: Tier = Claim, Capacity = Evidence) |
| Performance score | trust module | renormalized if Not Rated |
| Trust score | trust module | band-mapped |
| Category weight | primary 100% / secondary 40% (frozen) | multiplier on category-derived contribution |
| Geography proximity | profile vs RFQ delivery geography | modifier, work-nature-sensitive (2.4) |
| Buyer preference | Approved status in applicable modes | buyer-scoped bonus **only** in that buyer's sorting (frozen firewall: never a platform signal) |

### 6.2 Weight Categories (structure, not final numbers)

Four weight groups, each a POLICY block in system configuration, with the frozen constraint operationalized as a **dominance cap**: no single group may exceed POLICY `confidence.max_group_weight` *[start: 35%]* of total weight.

```
GROUP 1  Execution Fit        (tier closeness, capacity consistency, category weight)
GROUP 2  Proven Behavior      (performance score, response recency)
GROUP 3  Standing             (trust score, verification depth)
GROUP 4  Context              (geography, buyer preference [buyer-scoped], window feasibility)
```

*Rationale for groups over flat weights:* groups make the dominance cap enforceable and auditable (`formula_version` per frozen scoring rules), and let tuning move within a group without re-balancing the universe.

### 6.3 Normalization

- Every raw input maps to a 0–1 normalized value via **band functions**, not raw linear scaling (bands resist outlier distortion and match the precision the data actually has).
- Scores carry `formula_version`; any change to bands or weights increments the version (frozen explainability requirement).

### 6.4 Missing Data Handling

- **FIXED principle (inherited):** absence of history is never penalized as zero. Missing input → its weight redistributes pro-rata across present inputs within the same group first, then across groups (mirrors the frozen performance renormalization).
- Exception: missing *declared* inputs that the vendor controls (capacity profile fields) are not "missing data" — they are incomplete profiles, and score a completeness discount within Group 1. The distinction: history the vendor couldn't have vs information the vendor chose not to give.

### 6.5 Tie-Breaking (deterministic, fair, ungameable)

Within an equivalence band, order by: (1) capacity headroom (most available first — routes work to vendors who can actually take it), (2) least-recently-routed in the cell, (3) salted hash of (rfq_id, vendor_profile_id) with the salt logged in the routing log. **Why salted-random last:** pure determinism at step 3 would be reverse-engineered ("register a second profile name starting with A"); pure randomness everywhere would erase fairness; salted-random as the final tiebreak is fair, auditable (replayable from the log), and not predictable in advance.

---

## SECTION 7 — Vendor Prioritization Logic

### 7.1 New Vendors

Covered structurally in 2.6 / 3.4–3.5. Prioritization summary: protected minority exposure (probation share), value-capped, count-capped, renormalized scoring, anti-starvation floor, human touch on early silence. **What new vendors never get:** displacement of proven vendors outside the probation share, and high-value RFQs before evidence exists.

### 7.2 High-Performing Vendors

- Earned advantages: top of their equivalence band ordering (via Group 2 weight), eligibility for buyer-visible performance badges, and — where the buyer chose Approved+Open mode — natural compounding with buyer preference.
- **Anti-oligopoly counterweight (essential):** the exposure ceiling (3.3) binds *especially* on high performers. The marketplace's long-term liquidity depends on a deep bench, not three kings. A high performer at the ceiling loses nothing — their capacity is typically the binding constraint anyway — but the policy guarantees band-mates see demand.
- High performance never raises tier or capacity silently (firewall, 4.5): it generates *suggestions* through the proper workflows.

### 7.3 Capacity-Aware Ranking

Headroom is the first tiebreaker (6.5) and a Group 1 sub-input: between equals, the vendor with room wins the slot. Effect: demand naturally flows around saturated vendors without punishing them — saturation is success, not sin; it simply isn't *availability*.

### 7.4 Geographic Preference

Group 4 modifier, work-nature-weighted (2.4). Operational nuance: for `supply`-only RFQs, national vendors with logistics reach should not be down-ranked steeply — Bangladesh's supply trade is Dhaka/Chattogram-centric and over-weighting locality would hollow out thin regional cells. POLICY `geo.weight_by_work_nature` holds per-nature multipliers *[start: service/fabricate high, supply low, consult minimal]*.

### 7.5 Buyer Preference Impact

- In Approved-inclusive modes: Approved vendors receive a buyer-scoped Group 4 bonus and visual priority in the buyer's comparison sorting.
- **FIXED (frozen firewalls):** buyer preference never crosses tenants, never feeds platform scores, never affects other buyers' routing. Conditional status carries its caveat note to the buyer's own views only. Blacklist is not a preference — it is a floor, handled in Phase A1.

---

## SECTION 8 — Quotation Workflow

### 8.1 Submit

- Preconditions: delivered invitation (accepted state optional — submitting implies acceptance), RFQ in a quotable state (`vendors_notified`/`quotations_received`/`buyer_reviewing` before window close), actor holds `can_submit_quote` (own org or via delegation grant), quota available on the controlling org.
- Validation: priced against the **current RFQ version** (a quote opened against v2 cannot submit once v3 exists — the composer forces re-confirmation against v3, frozen version binding); completeness floor (price, validity period, delivery terms; spec-compliance declaration per attached spec revision). Quote completeness is scored (Quote Quality performance component) — the floor blocks only the truly empty.
- Effects: active-capacity slot already consumed by the invitation; quota ledger entry on controlling org; `QuotationSubmitted`; comparison statement refresh; invitation → `accepted`.

### 8.2 Revise

- Vendor-initiated revision allowed while RFQ is pre-award and window open: creates a new quotation version (frozen: never overwrite), reason-coded, buyer notified with a clean diff of changed terms.
- Revision count soft-cap POLICY `quote.max_revisions` *[start: 3]* — beyond it, revisions require a clarification-thread justification. Unlimited silent revisions enable price-signaling games (Section 10.7).
- After window close, revision is **locked** except: (a) buyer-requested best-and-final round (9.3), or (b) buyer reopens the window (visible to all invitees — no private extensions; private extensions are corruption vectors).

### 8.3 Withdraw

- Allowed any time pre-award; reason-coded; buyer notified; comparison updates. The active slot frees; the response still counts as a response (the vendor engaged) but the withdrawal pattern is tracked — habitual late withdrawal (after buyer_reviewing began) carries a Quote Quality discount: it burns buyer evaluation effort.
- Withdrawal after shortlisting triggers an immediate buyer alert + optional replenishment wave if the comparison drops below viable depth.

### 8.4 Decline (formal)

- One-tap, reason-coded, any time before window close. Frees the slot instantly, counts as a **response** (frozen definition), zero negative performance effect, feeds routing relevance.
- Operational goal: make declining easier than ignoring. The marketplace's response-rate metric — its health heartbeat — depends on it.

### 8.5 Late Quotes

- After window close, submission is blocked by default. Options presented to the late vendor: request buyer extension (buyer one-tap approves → window reopens for **all** un-responded invitees, POLICY `quote.late_extension_max_days` *[start: 3]*).
- **FIXED:** no silent late acceptance; no per-vendor private windows. Fairness here is cheap to enforce and expensive to lose.
- If the buyer already shortlisted, late entry requires explicit buyer action and re-notification of shortlisted vendors that comparison reopened (transparency over convenience).

---

## SECTION 9 — Buyer Evaluation Workflow

### 9.1 Comparison Process

- The comparison statement auto-generates at first quotation and re-versions on every quotation event (frozen versioning). Rows: price (normalized to comparable units where the spec defines them), delivery, validity, warranty, spec-compliance declarations, vendor standing (trust band, performance badge, verification depth, tier) — and buyer-private columns (own status/notes) visible only to the buyer.
- Sorting default: buyer-chosen; Approved vendors float in Approved-inclusive modes. **FIXED:** the platform never auto-recommends a winner pre-award (decision-support, not decision — frozen trust principle); the future AI layer summarizes, humans decide.

### 9.2 Shortlisting

- Min 1; soft max POLICY `eval.shortlist_max` *[start: 5]*. Shortlisting notifies the shortlisted (positive engagement) and starts the decision clock (1.4).
- Shortlist edits are free pre-award but audited — the churn pattern feeds buyer behavior analytics.

### 9.3 Clarification Rounds

- RFQ-scoped threads per vendor (frozen comm model). **Fair-information rule:** clarifications that *materially change scope understanding* (spec interpretation, quantity, site conditions) must be broadcast: the buyer is prompted to publish the Q&A (anonymized of the asking vendor) to all active invitees; publishing triggers an optional revision window for all. *Alternative:* keep all clarifications private. *Rejected:* private material clarifications create insider-vendor dynamics and corrupt the comparison; non-material commercial back-and-forth stays private.
- **Best-and-final round (structured negotiation):** buyer may invoke once (POLICY `eval.baf_rounds_max` *[start: 1]*) — all shortlisted vendors simultaneously invited to a final sealed revision with a common deadline. This is the sanctioned pre-award negotiation instrument; per-vendor sequential price-hammering inside threads is discouraged by design (it trains vendors to pad first quotes).

### 9.4 Award Process

- Single award: exactly one selected quotation → `closed_won` → engagement (frozen 1:1).
- **Partial/split needs:** buyer splits scope by re-issuing the remainder as a new RFQ (pre-filled, `reissued_from`), optionally in Approved Only mode targeting the runners-up. *Alternative:* multi-award on one RFQ. *Foreclosed by frozen cardinality — and operationally better anyway:* split scopes deserve split specs, windows, and engagements.
- Award requires `can_award_rfq`; value above the org's configured threshold may require Director/Owner approval (ORG workflow). Award is the moment transaction intelligence (awarded value) is recorded.

### 9.5 Loss Process

- At terminal close, all non-selected responders receive a uniform closure notification. Content POLICY `eval.loss_feedback_level`: *[start: state + structured reason category]* (e.g., "closed — another vendor selected", "closed — requirement cancelled"). Price feedback ("you were 18% above") is **off** by default — it trains quote dumping — but available as an opt-in buyer courtesy with banded, not exact, deltas.
- Losses with engagement feed Win Rate cleanly; expiry-without-buyer-action feeds **nothing** negative for vendors (frozen fairness: buyer silence is not vendor failure).

---

## SECTION 10 — Operational Abuse Prevention

Each threat: scenario → mitigations (layered; no single point of policy failure).

### 10.1 RFQ Farming (price harvesting by competitors)

*Scenario:* a vendor (or its proxy) registers a buyer org and posts realistic RFQs in its own category to harvest competitors' pricing and specs.
*Mitigations:* **FIXED** self-match exclusion (2.1); hybrid-org same-category flag — an org whose vendor profile holds category X posting buyer RFQs in X enters mandatory moderation review (legitimate hybrids exist — flag, review, remember the decision); identity-cluster detection (shared contacts/devices/trade-license fields between the "buyer" org and vendor orgs in the cell → admin link-suggestion + farming case); quotation detail withheld until window close in flagged cells (POLICY `abuse.sealed_until_close` per cell); closure-rate accountability — farms never close; orgs with N RFQs and ~0 closure enter review and lose auto-pass moderation; spec/document watermarking per granted org (generated documents carry the grantee identity — leaked spec PDFs are traceable).

### 10.2 Fake RFQs (junk demand)

*Scenario:* spam, tire-kickers, lead-gen scrapers, or buyers fishing without intent — burning vendor attention.
*Mitigations:* tiered moderation (1.2 under_review); buyer behavior score (internal, ops-facing — closure rate, expiry rate, post-quote cancellation rate, clarification responsiveness); consequences ladder: auto-pass revoked → per-org RFQ rate limit POLICY `abuse.buyer_rfq_rate_limit` → submission requires org verification → suspension. Vendor-side honesty: invitation cards show the buyer's verification level and a coarse buyer responsiveness indicator (POLICY `abuse.show_buyer_signal` *[start: on]*) — vendors price their attention with open eyes. *(This is an internal behavioral signal surfaced as a coarse band — not a public score; it stays within the platform-owned analytics class.)*

### 10.3 Vendor Spam

*Scenario:* vendors mass-contacting buyers, padding category assignments to intercept leads, or pestering via clarification threads.
*Mitigations:* structural — vendors cannot see undistributed RFQs and cannot message a buyer without a live invitation/engagement context (frozen comm scoping); category caps (frozen 10/5) + secondary weight penalty + decline-pattern-triggered assignment review (5.4); thread rate limits + buyer one-tap "irrelevant" flag feeding Quote Quality; repeated irrelevant quoting (quotes that ignore the spec) → Quote Quality discount → confidence drop → fewer leads — the system self-corrects through the score the vendor cares about.

### 10.4 Quote Dumping

*Scenario:* systematic unrealistic lowballing to win awards (then renegotiate post-award) or to poison comparisons.
*Mitigations:* plausibility banding — quotes below POLICY `abuse.lowball_band` of the cell's trailing median are flagged in the comparison ("verify scope coverage"), never hidden (information, not censorship); post-award renegotiation tracking — engagement value vs awarded value deltas are recorded; a pattern of win-low-deliver-high feeds Dispute Record and triggers review; best-and-final structure (9.3) removes the iterative underbidding channel; loss feedback gives banded deltas only (9.5).

### 10.5 Capacity Gaming

*Scenario A (hoarding):* declare huge capacity, absorb leads, respond to the cherry-picked few. *Counter:* throughput auditor (4.4) — sustained low response at declared intake → soft auto-reduction; response rate is the binding truth, declarations are hypotheses.
*Scenario B (artificial scarcity):* big vendor declares minimal capacity so its few invitations always look exclusive, starving the cell. *Counter:* capacity self-throttling is legitimate (4.1) — the cell simply routes around them; no counter needed beyond the fairness floor for others. The design makes this "attack" self-defeating: withheld capacity is withheld revenue.

### 10.6 Tier Gaming

*Scenario:* declaring Tier E with a 5-person workshop to enter big-RFQ pools; or sandbagging to Tier A to farm easy wins.
*Mitigations:* capacity-consistency discount (frozen Tier=Claim/Capacity=Evidence) hits inflated tiers in scoring; verification gate (2.5) keeps unverified claims out of high-value bands entirely; verified-tier review cadence (frozen 24-month) plus event-driven review on contradiction signals; sandbagging counter — tier is a *ceiling*, so under-declaring only shrinks the vendor's own market; the upgrade-suggestion workflow (win-history threshold, frozen) pulls genuinely grown vendors up.

### 10.7 Review Manipulation

*Scenario:* sockpuppet praise, reciprocal review rings, blackmail reviews.
*Mitigations:* **FIXED** (inherited from Doc-2): reviews require a real engagement — no purchase, no voice; one review per engagement; identity-cluster screening between author org and vendor controlling org (shared fingerprints → moderation hold); velocity anomaly detection (review bursts → hold); moderation workflow with audit; review weight in performance is recency-decayed and capped by the Buyer Feedback weight (frozen 15%) — even a successful ring buys limited score movement; retaliation-window rule: a vendor-initiated dispute filed after a negative review does not suppress the review, and vice versa — both facts stand, compliance reviews causality.

### 10.8 Collusion (bid rotation / cartel behavior)

*Scenario:* vendors in a thin cell coordinate — rotating who quotes low, inflating the cell's price level.
*Mitigations:* detection analytics on platform-owned data — co-appearance matrices (same vendor sets repeatedly co-invited and quoting), price-pattern correlation, win-rotation periodicity; wave composition adds rotation noise (fairness bands + salted tiebreaks make membership of the invited set less predictable — cartels need stable membership); buyer instruments: widening geography/mode is one tap; thin-cell price benchmarking surfaces cross-cell comparisons ("similar work in Khulna closed 22% lower"); flagged cells get admin review and become vendor-recruitment priorities (the structural cure for collusion is supply depth, Section 11.4).

---

## SECTION 11 — Marketplace Economics

### 11.1 Vendor Fairness (supply-side retention economics)

A vendor stays when: leads are relevant (relevance floor), winnable (equivalence-band rotation — not always outranked by the same three names), right-sized (tier+capacity gates), and honestly adjudicated (closure signals, no silent losses, expiry costs them nothing). Health metrics ops must watch: per-cell exposure concentration (Gini across invitations — alarm POLICY `econ.exposure_gini_alarm` *[start: 0.6]*), starvation counts, probation graduation rate, response-rate trend.

### 11.2 Buyer Fairness (demand-side retention economics)

A buyer stays when: every RFQ gets a viable comparison (target-quote replenishment, honest empty-cell handling), evaluation effort is low (comparison quality), and award converts smoothly into operations (engagement chain). Health metrics: % RFQs hitting target quotes, time-to-first-quote, expiry rate, buyer repeat rate. **Floor guarantee:** if the platform cannot project ≥ POLICY `econ.min_viable_quotes` *[start: 2]* for an RFQ, it says so before the buyer waits — disappointment forecast beats disappointment delivered.

### 11.3 Growth Balance

The unit of marketplace health is the **cell**: category × geography × value band. Each cell is scored on demand (RFQ flow), supply (qualified, capacity-available vendors), and conversion (quote rate, award rate). The cell grid drives every growth lever: vendor recruitment targeting (sales CRM priorities), category mega-menu curation, buyer acquisition focus, and probation-share tuning per cell (a demand-rich cell can absorb more probation exposure; POLICY override per cell).

**Category maturity model.** Every category carries an operational maturity state — **Emerging → Growing → Established → Saturated** (thresholds POLICY `category.maturity_thresholds`, on liquidity, conversion, and supply depth). Maturity drives: vendor recruitment priority (Emerging cells top the sourcing queue), buyer acquisition priority, probation allocation width (Emerging/Growing cells run wider probation shares), human sourcing effort, and per-cell operating stage (0.1). Marketplace growth is managed at category level, not only platform level.

### 11.4 Supply–Demand Imbalance & Category Coverage Recovery

```
DEMAND-RICH CELL (RFQs starve for quotes)
  → ladder: widen geography band automatically (with buyer consent flag)
  → surface adjacent-category qualified vendors (capability superset match)
  → missing-vendor intake + targeted outreach (seeded vendors in cell get invited
    to claim with "live demand waiting" messaging — the strongest claim trigger)
  → admin sourcing task with cell dossier
  → honest buyer communication throughout

SUPPLY-RICH CELL (vendors starve for leads)
  → fairness mechanics carry more load (bands, rotation, ceilings)
  → probation share narrows (POLICY per-cell) — runway is pointless without demand
  → cell flagged to demand-side growth (buyer acquisition, SEO content for the category)
  → vendor expectation honesty: category-level demand indicators shown at assignment
    time ("low RFQ volume in this category") — recruiting vendors into dead cells
    with implied demand is the fastest way to burn supply-side trust
```

**Coverage Recovery Workflow (formal).** The platform never silently fails when eligible vendors are unavailable. Triggers: zero eligible vendors for an RFQ; eligible count below POLICY `coverage.min_eligible_vendors`; cell liquidity below platform targets; geographic coverage below targets.

```
RFQ created → Eligibility evaluation → Coverage gap detected
→ Coverage Recovery Queue → Admin review → Vendor discovery
→ Vendor outreach → Vendor onboarding → Coverage improved
```

System actions: suggest known vendors from imported (seeded) datasets, from buyer-supplied private records (suggestion to *invite*, never disclosure of private data), from historical RFQs, and from category expansion programs. Operational outputs: coverage gap records, vendor recruitment tasks, category development metrics. **Principle:** an uncovered category is a marketplace growth opportunity, not a routing failure.

### 11.5 Category Governance & Taxonomy Workflow

Taxonomy quality directly impacts routing quality; categories are governed assets across search, routing, matching, and mega-menu navigation.

- **Suggestion workflow:** user suggests category → review queue → admin evaluation → approve / reject / **merge** / defer.
- **Operational lifecycle:** Proposed → Approved → Active → Merged | Retired. (Proposed/Approved are the admin-workflow overlay on the frozen draft→active→retired storage states; Merged is retirement-with-redirect.)
- **Governance rules:** fit the ≤4-level taxonomy, avoid duplication and synonym proliferation, preserve routing quality (a category too broad to route well is split; too thin to ever match is merged).
- **Merge rules:** duplicate categories merge into one canonical category **without data loss** — vendor assignments, RFQ references, and historical analytics re-map to the canonical node with full audit; redirects preserve SEO and deep links.

### 11.6 Lead Qualification Framework

The commercial model includes lead guarantees, so "lead" has a formal definition. A **valid lead** is a delivered invitation satisfying all of:

1. the vendor actually received the RFQ (invitation `delivered`);
2. the buyer identity is valid (organization in good standing, not later voided for fraud);
3. the requirement matches the vendor's category assignments;
4. the requirement matches the vendor's capability flags;
5. the RFQ passed moderation;
6. the RFQ remained active for at least the minimum response window (POLICY `leads.min_response_window_hours`).

**Invalid leads (never count toward guarantees):** fraudulent RFQs, duplicates, wrong-category routing, RFQs from buyers suspended before response opportunity, administrative cancellation before response opportunity, buyer-directed outreach invitations (2.11), deferred-undelivered invitations. **Principle:** the lead guarantee applies to valid leads, never to conversions.

### 11.7 Lead Guarantee Accounting

- **Period:** monthly, aligned to the subscription period.
- **Tracked per vendor (controlling organization):** guaranteed leads (entitlement), delivered valid leads, additional leads (above guarantee), purchased leads (lead credits).
- **Shortfall rule:** if delivered valid leads < guaranteed leads, then lead credit balance increases by `shortfall × lead_credit_value` (POLICY `leads.credit_value`). Resolution per commercial policy: deliver additional leads in the following period **or** issue account credit.
- **Anti-conflict rule (binding):** a guarantee never forces delivery of invalid or irrelevant leads — the relevance floor (5.5) always outranks the guarantee; an honest shortfall paid in credit beats a junk lead delivered to hit a number. Guarantee pressure is a growth signal (the cell needs demand), never a routing override.
- Accounting runs on existing frozen instruments: invitations (delivery facts), usage ledger (consumption), lead credit accounts (balances). Lead delivery is measurable; lead conversion is not guaranteed.

### 11.8 Commercial Entitlement Boundary

Paid plans **may** influence: lead volume (quotas/guarantees), profile visibility products (featured directory placement, microsites), analytics access, advertisement privileges.

Paid plans **may never** influence (FIXED): eligibility gates, trust score, performance score, matching confidence, or the routing fairness ceiling. Payment buys access; payment never buys trust. Selling routing rank would liquidate the trust asset the marketplace runs on; the frozen architecture's separation of monetization from matching is an economic policy, not just a module boundary.

---

## SECTION 12 — Policy Configuration Layer

### 12.1 FIXED (invariant — code + CI enforced, never configuration)

Pipeline phase order and gate-before-score; blacklist floor + non-disclosure indistinguishability; self-match exclusion; one active quotation per vendor per RFQ; version immutability once quoted; no public RFQ visibility; no silent late quotes / no private windows / no private material clarifications; silence never auto-approves; terminal states never reopen; absence-of-history never scores as zero; governance-signal firewalls (tier↛trust, tier↛performance, buyer-status↛platform scores, payment↛matching); capacity self-throttling never penalized; expiry never penalizes vendors; buyer never shown fake matching activity; platform never auto-picks winners pre-award. Additionally: human-assisted routing may never bypass blacklist/eligibility/verification/trust (any stage, founder included); operating stages and creation-phase priority tune POLICY values only, never FIXED rules; stage transitions are platform decisions, never tenant decisions; paid plans never influence gates, scores, confidence, or fairness ceilings; lead guarantees apply only to valid leads and never force irrelevant delivery; AI assistance is advisory only; strategic accounts receive enhanced support, never routing/trust/eligibility/capacity bypass; RFQ quality bands are never public; selection is never pure-repetition and never pure-random.

### 12.2 POLICY (in `core.system_configuration`; key inventory)

| Domain | Keys (all values tunable without deploy; changes audited) |
|---|---|
| Lifecycle | `rfq.min_scope_chars`, `rfq.draft_dormancy_days`, `rfq.approval_reminder_hours`, `rfq.approval_stale_days`, `rfq.category_min_level`, `rfq.quote_window_min/max_days`, `rfq.review_allowance_days`, `rfq.decision_allowance_days`, `rfq.max_extensions`, `rfq.edit_clock_reset`, `rfq.reissue_won_block_days` |
| Moderation | `moderation.mode`, `moderation.trusted_closure_rate`, `moderation.dup_window_days`, `moderation.sla_hours` |
| Matching/Routing | `matching.max_retries`, `matching.empty_hold_days`, `routing.probation_share` (global + per-cell), `routing.secondary_pass_mode`, `tier.use_verified_when_present`, verification value-band thresholds |
| Probation | `probation.max_active`, `probation.value_cap`, `probation.min_response_rate` |
| Fairness | `fairness.band_width`, `fairness.max_share_per_cell`, `fairness.starvation_days` |
| Capacity | `capacity.system_throttle[tier]`, `capacity.min_response_runway_hours`, `capacity.suggest_down_rr`, `capacity.auto_soft_reduce`, `capacity.engagement_gate_enabled` |
| Distribution | `distribution.target_quotes[value_band]`, `distribution.rr_floor`, `distribution.min_wave`, `distribution.max_wave`, `distribution.replenish_check_hours`, `distribution.relevance_floor`, `distribution.max_buyer_share_of_vendor` |
| Confidence | group weight blocks, `confidence.max_group_weight`, band functions (versioned), `geo.weight_by_work_nature` |
| Quotation/Eval | `quote.max_revisions`, `quote.late_extension_max_days`, `eval.shortlist_max`, `eval.baf_rounds_max`, `eval.loss_feedback_level` |
| Abuse/Econ | `abuse.buyer_rfq_rate_limit`, `abuse.sealed_until_close`, `abuse.lowball_band`, `abuse.show_buyer_signal`, `suspension.allow_open_responses`, `econ.exposure_gini_alarm`, `econ.min_viable_quotes` |
| Operating Context | `platform.operating_stage` (global + per-cell), `stage_a.release_sla_hours`, `platform.liquidity_targets`, `category.maturity_thresholds`, `human_routing.criteria_thresholds`, `strategic.review_cadence_days` |
| Quality & Coverage | `quality.band_thresholds`, `coverage.min_eligible_vendors` |
| Leads | `leads.min_response_window_hours`, `leads.credit_value` (guaranteed-lead counts are plan entitlements, not system configuration) |

### 12.3 ORG (per-organization workflow settings — frozen mechanism)

RFQ approval mode and chain; financial/award approval thresholds; notification rules; default routing mode; buyer-courtesy options (loss feedback opt-in, clarification publishing defaults).

### 12.4 Governance of Configuration

Every POLICY change: admin permission, audited (old/new), versioned where it affects scoring (`formula_version` bump), and visible on the ops dashboard with its effective date. Per-cell overrides inherit from global with explicit override records. **Operating rule:** tune one lever at a time per cell, watch the telemetry (3.2) for a full window, then move — the configuration layer is an instrument panel, not a slot machine.

---

*End of Doc-3 v1.0.1 — RFQ Procurement Engine & Operational Specification (canonical; Doc-3_Patch_v1.0.1, PATCH-04A, and Doc-3_Patch_v1.0.1_Extension fully integrated). Downstream consumers: Doc-4 (API + Workflow Map) implements these behaviors as contracts and sequences; engineering implements POLICY keys against `core.system_configuration`; ops adopts Sections 0 and 10–12 as the operating manual.*


