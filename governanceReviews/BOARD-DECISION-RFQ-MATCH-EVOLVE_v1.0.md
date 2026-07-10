# BOARD DECISION — ESC-RFQ-MATCH-EVOLVE · Matching-Engine Evolution (M3 Moat)

**Status:** ✅ APPROVED — owner/Architecture Board ruling, 2026-07-10
**Channel:** `esc_registry.md` → `ESC-RFQ-MATCH-EVOLVE` (CLOSED by this record)
**Intake adjudicated:** `governanceReviews/MATCHING-ENGINE-RECONCILIATION_v1.0.md` §4 (the four asks)
**Immediate instrument:** none required (existing governance confirmed).
**Deferred instrument:** Doc-3 §12.2 policy-profile registration patch — authored at **Wave-4
Definition of Ready**, as the next increment in the Doc-3 patch series at that time (series tail
today = `Doc-3_Policy_Key_Registration_Patch_v1.11_PublicReadRateLimit.md`).

## Ruling (owner, 2026-07-10)

1. **Firewall rejections CONFIRMED.** Subscription/plan/entitlement input to matching rank stays
   **REJECTED** (`Doc-3 §11.8`/`§12.1`, Doc-4A §4B, Invariant #10 — "Payment buys access; payment
   never buys trust"). Hand-weighted raw 0–100 trust/performance inputs stay **REJECTED** —
   matching consumes governance signals as **bands via events** (`Doc-3 §6`,
   `vendor_matching_attributes`), never raw scores.
2. **Configurable Matching Policy layer ADOPTED IN PRINCIPLE** (reconciliation §2): named
   per-RFQ-type policies (Standard / Urgent / High-Value / OEM) that vary **Phase-C ranking
   emphasis only** — **Phase-A gates stay fixed across all policies**, parameters resolve from
   `core.system_configuration` by POLICY key, never inlined (Doc-4E §E6.6). The realizing Doc-3
   §12.2 registration patch is the deferred instrument above; no key, weight, or contract is
   coined today.
3. **Industry / business-type ranking signals stay DEFERRED** pending Track-1 taxonomy
   ratification (`ESC-CLASS-INDUSTRY`, `ESC-MKT-VENDORTYPE`); on landing, each enters as its own
   additive Phase-C signal patch (M3 owner + Board). Never a gate.
4. **M9 stays advisory-only** (Invariant #12; Doc-4K BC-AI-1). AI recommends; the M3 routing
   module decides. No autonomous rank mutation, no rank-to-winner, no auto-decision.

**Rationale (owner):** the frozen pipeline (Doc-3 §2/§3/§6 gates → geography → deterministic
confidence scoring at [start] POLICY values) *is* the rule-based MVP; evolution happens by
configuration and additive patches, never by weakening the gate-before-score order, the
selection doctrine, or the monetization↛matching firewall. Confirming the rejections preserves
the trust asset the marketplace runs on.

## Governance executed today (docs only)

1. This decision record.
2. `esc_registry.md` → `ESC-RFQ-MATCH-EVOLVE` marked ✅ RESOLVED (ruling + this record's pointer).
3. `docs/backend/backend_execution_tracker.md` — W4 row carries the deferred instrument
   (policy-profile patch @ W4 DoR).

## Implementation carried (explicitly NOT done today)

- **Doc-3 §12.2 policy-profile registration patch** — authored at Wave-4 Definition of Ready
  (deferred instrument above). Until it folds, no policy layer exists; the frozen [start]
  POLICY configuration is the only matching configuration.
- **Industry / business-type Phase-C signal patches** — blocked on Track-1
  (`ESC-CLASS-INDUSTRY` / `ESC-MKT-VENDORTYPE`, both still Board-pending).
- **M3 build itself** — Wave 4, unchanged; this ruling adjusts no wave sequencing.

## Notes

- Gates-stay-fixed is the binding constraint on ruling 2: a policy may tighten a gate only where
  Doc-3 already provides for it (e.g., High-Value verification/tier bands, A5/A6); no policy may
  relax or reorder Phase A.
- The sibling classification decisions (`ESC-RFQ-PROCCAT`, `ESC-MKT-VENDORTYPE`,
  `ESC-IDN-BUYERTYPE`, `ESC-CLASS-INDUSTRY`) are NOT ruled by this record and remain open on
  their own channels.
- Companion ruling of the same sitting: `governanceReviews/BOARD-DECISION-RFQ-SLUG_v1.0.md`
  (routing-governance staff slugs, `ESC-RFQ-SLUG`).
