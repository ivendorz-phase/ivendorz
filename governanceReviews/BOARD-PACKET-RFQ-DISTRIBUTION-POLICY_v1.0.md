# Board Packet — RFQ Distribution Control · POLICY Launch Values + `ESC-RFQ-POLICY` / `ESC-RFQ-AUDIT`

**Date:** 2026-07-15 · **Raised by:** Owner planning request ("control which vendor gets how many
RFQs") · **Drafted by:** AI Engineering Orchestrator · **Decision:** HUMAN OWNER/BOARD (POLICY
value governance = Doc-3 §12.4; key registration = additive Doc-3 §12.2 channel; audit-action
enumeration = additive Doc-2 §9 channel — all rank-0-adjacent, human-approved only).
**Status: OPEN — no option pre-selected.** Registration implies NO acceptance (Raise ≠ Accept,
CLAUDE.md §13).

---

## 1. Framing — what is decidable here and what is not

**The mechanism is frozen and is NOT on the table.** Which vendors receive an RFQ and how many
RFQs each vendor receives is fully specified by the frozen corpus and bound by pointer
everywhere (Doc-4E PassB Part3 §17-header: "The selection/fairness/wave/throttle/capacity math
is owned by Doc-3 §3.3–§3.6/§4/§5/§7 and bound by pointer — never re-derived"):

| Control | Frozen mechanism | Source |
|---|---|---|
| Which vendors | Gate-before-score pipeline → confidence → capacity → exposure-fairness (D2) → probation allocation (D3) → final selection with equivalence-band LRR rotation + salted tie-break | Doc-3 §3.3 (D1–D4) |
| How many per RFQ | Wave sizing `ceil(target_quotes / expected_rr)` clamped to `[min_wave, max_wave]`; replenishment waves at checkpoints; relevance floor | Doc-3 §5.3, §5.5 |
| How many per vendor | `effective_intake = min(vendor_declared, entitlement_quota, system_throttle)`; defer-not-exclude; deferred-queue drain; per-buyer share cap | Doc-3 §4.1–§4.3, §5.1 |
| What money may do | Lead **volume** only — never eligibility, fairness, confidence, or selection | Doc-4A §4B; Doc-3 §11.8/§12.1; Doc-4I §HB-3.2 |
| Who turns knobs | Platform staff via `rfq.manage_routing_rule.v1`, parameters by POLICY key only, audited; slugs `staff_can_view_routing` / `staff_can_manage_routing` (Doc-2 Patch v1.0.8, PATCH-D2-07) | Doc-4E §E6.6/§H.3; Doc-3 §12.4 |

**What IS decidable** — three items, all inside sanctioned channels:

- **D1** — every POLICY value in Doc-3 is a `*[start: …]*` placeholder, not a ratified default
  (Doc-3 §12.2/§12.4). Confirm (or amend) launch values for the distribution-control key set,
  and rule on the keys whose start values are qualitative or absent.
- **D2** — resolve **`ESC-RFQ-POLICY`**: `respond_to_invitation` and `manage_routing_rule` carry
  `Idempotency: required` with a dedup window whose **authority is unresolved — implementation-
  blocked** until a `rfq.*` dedup-window key is registered via the Doc-3 §12.2 additive channel
  (Doc-4E §H.8; `core.*_dedup_window` keys are Module-0 infrastructure, firewalled from RFQ use
  per Doc-3 §12.1 / Doc-4A §18.3).
- **D3** — resolve **`ESC-RFQ-AUDIT`**: the Part-2 `incremental_rematch` flag and human-assist
  annotations audit under an **interim nearest-§9 pointer** ("routing run") because Doc-2 §9
  enumerates no dedicated action (Doc-4E §H.6/§E6.5).

**Explicitly out of scope** (declared so this packet cannot creep):
mechanism/pipeline changes of any kind (Golden Rules #7–#9); demand-side keys (`abuse.*`,
`moderation.*`, lifecycle `rfq.*` composer keys); quotation/eval keys (`quote.*`, `eval.*`);
M7 plan design — guaranteed-lead counts and quota amounts are **plan entitlements, not system
configuration** (Doc-3 §12.2 Leads row) and belong to a separate commercial exercise; per-cell
overrides — §12.4 discipline is telemetry-first, one lever at a time, so launch is global-scope
only.

---

## 2. D1 — Launch values for the distribution-control key set

### 2.1 Group A — keys with concrete frozen start values (Annex A, 24 keys)

The start values already sit in frozen Doc-3 text, owner-authored. The gap is purely formal:
"[start:]" is defined as a starting point for telemetry-driven tuning, never ratified as the
launch seed.

- **Option A1 — Confirm-as-seed (cheapest).** Board confirms in this packet's decision record
  that the Doc-3 verbatim start values ARE the launch seed for `core.system_configuration` at
  M3 build (Wave 4). No frozen-doc patch needed — values are read from Doc-3 verbatim at seed
  time; every later change flows through §12.4 governance (audited, versioned, dashboard).
- **Option A2 — Amend now.** Owner edits specific values before build; instrument = additive
  Doc-3 §12.2 value-registration patch (precedent:
  `Doc-3_Policy_Key_Registration_Patch_v1.11_PublicReadRateLimit`).
- **Option A3 — Defer wholesale to Wave-4 kickoff.** Cost: this exercise repeats on the build
  critical path; D2 (a genuine build blocker) would sensibly still be ruled now.

### 2.2 Group B — keys with qualitative or absent start values (Annex B, 10 items)

These cannot be seeded without a ruling. Each Annex-B row carries a drafted recommendation or
an explicit defer-to-stage disposition for individual accept/reject. Two flagged highlights:

- **`capacity.system_throttle[tier]`** — no start value exists anywhere in Doc-3. Drafted
  recommendation: launch with the platform leg **unset (no platform throttle)** so
  `effective_intake = min(vendor_declared, entitlement_quota)` until telemetry justifies a
  tier curve — a thin launch marketplace is starvation-risk, not overload-risk.
- **Observed key gap (OBS → Board):** Doc-3 §3.3 D2 caps a vendor at
  `fairness.max_share_per_cell` of a cell's invitations "**per rolling window**" — but no key
  defines the window length. Registering one (drafted name `fairness.share_window_days`,
  proposed start 30) belongs to the same additive Doc-3 §12.2 patch as D2 if the Board agrees
  the gap is real. **No key is coined by this packet; it exists only if the Board patches it.**

---

## 3. D2 — Resolve `ESC-RFQ-POLICY` (dedup-window keys — implementation blocker)

Carried by Doc-4E §H.8 and esc_registry row 37; blocks `rfq.respond_to_invitation.v1` and
`rfq.manage_routing_rule.v1` implementation at Wave 4. Registry-recorded resolution path:
"Additive Doc-3 §12.2 patch (Board)."

- **Option B1 — One module-scoped window key.** Register `rfq.mutation_dedup_window_hours`
  *(drafted start: 24)* covering both contracts. Mirrors the Module-0 `core.*_dedup_window`
  shape at module scope without breaching the §12.1 firewall. Simplest to govern.
- **Option B2 — Per-contract keys.** `rfq.response_dedup_window_hours` +
  `rfq.routing_rule_dedup_window_hours` *(drafted start: 24 each)*. Finer tuning; two keys to
  govern for no currently-known divergent need.
- **Option B3 — Defer to Wave-4 kickoff.** Carries a known implementation blocker into the
  build wave's critical path.

**Class sweep note:** registry row 37 couples `ESC-OPS-POLICY` (same defect class, M4
contracts). Per the fix-forward-sweeps-the-class discipline, the same patch (or a twin) should
register the M4 window key(s) in the same act — the Board may rule the pattern once and apply
it to both namespaces.

---

## 4. D3 — Resolve `ESC-RFQ-AUDIT` (audit-action enumeration)

Carried by Doc-4E §H.6/§E6.5: `incremental_rematch` runs and human-assist annotations audit
under the interim nearest pointer — Doc-2 §9 RFQ **"routing run (mode, filter reference)"**.

- **Option C1 — Ratify the interim as permanent (Board note, no patch).** "Routing run" is
  already parameterized by mode + filter reference; an incremental rematch and a human-assist
  annotation are routing runs with distinguishing mode/rationale fields. Precedent:
  `ESC-RFQ-PROCCAT` ("Confirm (no patch expected) — Board note").
- **Option C2 — Enumerate dedicated actions.** Additive Doc-2 §9 patch adding e.g. an
  incremental-rematch action and a human-assist-annotation action (precedent:
  `ESC-COMM-AUDIT` Path A — new §9 enumeration + Doc-4H token patch). Buys per-action audit
  analytics at the cost of a rank-0 additive patch.

---

## 5. Realization map (if ruled)

| Ruling | Instrument | Registered where |
|---|---|---|
| D1-A1 + Annex-B rows | Decision record below (+ additive Doc-3 §12.2 patch ONLY for rows the owner amends or the OBS window key) | `00_AUTHORITY_MAP.md` if patched |
| D2 | `generatedDocs/Doc-3_Policy_Key_Registration_Patch_v1.x` (additive §12.2) | Authority Map + esc_registry row 37 → RESOLVED |
| D3-C1 | Board note in this packet | esc_registry row (new RESOLVED entry) |
| D3-C2 | `generatedDocs/Doc-2_Patch_v1.0.x` (additive §9) | Authority Map + esc_registry |

Sequencing: **nothing here un-gates the M3 build early** — Wave 3 (M2·M5·M6·M7) remains the
active wave and the gated sequence stands (`Build_Roadmap_v1.0.md`). This packet clears the
known M3-entry blockers so Wave-4 kickoff starts clean. The Doc-4E/Doc-5E slug-binding flips
from `ESC-RFQ-SLUG` remain separately carried @ W4 (esc_registry row 38).

---

## Annex A — Group A: frozen start values proposed as launch seed (verbatim from Doc-3 v1.0.1)

| # | POLICY key | Start value | Doc-3 anchor (line) |
|---|---|---|---|
| 1 | `matching.max_retries` | 3 | §2.3 (127) |
| 2 | `matching.empty_hold_days` | 3 | §2.3 (128) |
| 3 | `routing.probation_share` | 20% (global; per-cell override capable) | §2.6 (251) |
| 4 | `probation.max_active` | 3 | §2.6 (252) |
| 5 | `probation.value_cap` | one tier band below declared tier, floor Tier A (rule as written) | §2.6 (252) |
| 6 | `probation.min_response_rate` | 30% | §2.6 (253) |
| 7 | `suspension.allow_open_responses` | true | §2.7 (257) |
| 8 | `tier.use_verified_when_present` | true | §3.2 (343) |
| 9 | `fairness.band_width` | 5 points | §3.3 (378) |
| 10 | `fairness.max_share_per_cell` | 40% per rolling window (window length = Annex B #9 / OBS) | §3.3 (379) |
| 11 | `fairness.starvation_days` | 30 | §3.3 (380) |
| 12 | `capacity.engagement_gate_enabled` | false (advisory) | §4.1 (426) |
| 13 | `capacity.min_response_runway_hours` | 48 | §4.2 (436) |
| 14 | `capacity.suggest_down_rr` | 50% | §4.4 (445) |
| 15 | `capacity.auto_soft_reduce` | true | §4.4 (445) |
| 16 | `distribution.target_quotes[value_band]` | 3–5 (per-band mapping = Annex B #7) | §5.3 (465) |
| 17 | `distribution.rr_floor` | 0.25 | §5.3 (467) |
| 18 | `distribution.min_wave` | 3 | §5.3 (469) |
| 19 | `distribution.max_wave` | 12 | §5.3 (469) |
| 20 | `distribution.replenish_check_hours` | 24 | §5.3 (477) |
| 21 | `distribution.max_buyer_share_of_vendor` | 50% | §5.5 (491) |
| 22 | `confidence.max_group_weight` | 35% (dominance cap) | §6 (511) |
| 23 | `econ.exposure_gini_alarm` | 0.6 | §10 (677) |
| 24 | `stage_a.release_sla_hours` | 8 business hours | §0.2 (32) |

## Annex B — Group B: qualitative/absent start values (per-row ruling requested)

| # | Key / item | Corpus state | Drafted recommendation (Board may reject per-row) |
|---|---|---|---|
| 1 | `capacity.system_throttle[tier]` | key inventoried (§12.2), no start value | launch **unset** (no platform throttle leg) until telemetry; revisit at first Gini/starvation review |
| 2 | Confidence group-weight blocks (4 groups) | POLICY blocks named §6, no published starts | **defer to Wave-4 kickoff**; requires Doc-3 §6 group inventory in hand; 35% dominance cap binds whatever is set |
| 3 | `geo.weight_by_work_nature` | qualitative start ("service/fabricate high, supply low, consult minimal", §7 line 556) | defer numeric multipliers to Wave-4 with the qualitative ordering binding |
| 4 | `routing.secondary_pass_mode` | key only | defer to Wave-4 (mode enum lives with the pipeline build) |
| 5 | `coverage.min_eligible_vendors` | key only | drafted start: 3 (aligned to `distribution.min_wave`) |
| 6 | `human_routing.criteria_thresholds` | "unset values" by design | keep unset at launch — Stage A releases are manually approved anyway (§0.2) |
| 7 | `distribution.target_quotes[value_band]` per-band map | range 3–5 only | drafted: low band 3 · mid 4 · high 5 (more quotes where evaluation stakes are higher) |
| 8 | `distribution.relevance_floor` | "band-relative cutoff" (§5.5 line 490) | defer — requires the versioned band functions (§12.2 Confidence row) to exist first |
| 9 | Rolling-window length for `fairness.max_share_per_cell` | **no key exists** (OBS gap, §3.3 line 379) | if Board agrees gap is real: register `fairness.share_window_days`, start 30, in the D2 patch |
| 10 | `platform.operating_stage` | key global + per-cell | launch = **Stage A (Founder Assisted)** per §0.2 stage table |
| 11 | Verification value-band thresholds | qualitative (§2.5 lines 241–243: Low ≤ Tier A ceiling / Mid = Tier B–C / High ≥ Tier D) | confirm the tier-band binding as written; numeric BDT ceilings arrive with the tier tables |

---

*Append-only Board packet. Conforms upward; coins nothing — every proposed key/value exists
only if and when the Board rules and the additive patch is authored. Decision record to be
appended below this line by/for the owner.*

## DECISION RECORD (owner/Board, 2026-07-15)

**RULINGS:**

- **D1 — APPROVED, Option A1 (confirm-as-seed) with one patch.** Annex A's 24 frozen start
  values ARE the launch seed for `core.system_configuration` at M3 build (Wave 4) — read from
  Doc-3 verbatim at seed time; no restatement patch. Annex B dispositions **adopted as
  drafted**, including #1 (launch with **no platform-throttle leg** — `effective_intake =
  min(vendor_declared, entitlement_quota)` until telemetry justifies a tier curve; early
  marketplaces are liquidity-starved, not overloaded) and #10 (launch = Stage A). Annex B **#9
  ruled a genuine architecture gap, severity MAJOR** (missing policy definition → deterministic
  behavior at risk): register the window key through the normal Doc-3 §12.2 additive process.
- **D2 — APPROVED, Option B1** (one module-scoped dedup-window key; one concern, one module,
  one governance point; split later only on telemetry evidence).
- **D3 — APPROVED, Option C1** (interim "routing run (mode, filter reference)" pointer ratified
  permanent; an incremental rematch is another routing execution; reuse the canonical audit
  action unless a materially different business event exists).

**REALIZATION VERIFICATION NOTE (D2 — no duplicate key authored).** Pre-authoring verification
against the Authority Map found the B1 substance **already realized**:
`Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ.md` (APPROVED 2026-06-24) registered
**`rfq.idempotency_dedup_window` *[start: 24h]*** covering ALL `Idempotency: required` Module-3
mutations — which is exactly `respond_to_invitation` + `manage_routing_rule` — matching the
drafted value. The Doc-4E §H.8 statement "no `rfq.*` dedup-window POLICY key exists in Doc-3
§12.2" was true at Doc-4E's freeze and is **superseded by that registration** (no frozen-doc
edit; the §H.8 binding note lands with the W4 Doc-4E binding flips already carried from
`ESC-RFQ-SLUG`). D2 therefore closes **by confirmation**: `rfq.idempotency_dedup_window` is THE
module-scoped window; no new key. The §3 class-sweep leg closes the same way —
`operations.idempotency_dedup_window` (Patch v1.4_Operations) already covers `ESC-OPS-POLICY`.

**Executed at close of this packet:**
- `generatedDocs/Doc-3_Policy_Key_Registration_Patch_v1.12_FairnessShareWindow.md` authored
  (additive §12.2 registration of `fairness.share_window_days` *[start: 30]* — the D1 #9 MAJOR)
  and registered in `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`.
- `esc_registry.md`: `ESC-RFQ-POLICY` / `ESC-OPS-POLICY` row → **RESOLVED-BY-CONFIRMATION**
  (v1.1_RFQ / v1.4_Operations + this ruling); `ESC-RFQ-AUDIT` row added → **RESOLVED (C1,
  Board note — no patch)**.
- No M3 build un-gated: Wave-3 sequencing stands; Wave-4 kickoff inherits a clean blocker
  slate for BC-3/BC-7 plus the confidence-group-weight and `routing.secondary_pass_mode`
  values deliberately deferred to Definition of Ready (with the `ESC-RFQ-MATCH-EVOLVE`
  policy-profile registration already parked there).
