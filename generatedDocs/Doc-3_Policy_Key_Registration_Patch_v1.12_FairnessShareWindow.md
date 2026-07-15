# Doc-3 — POLICY Key Registration Patch v1.12 (Fairness Exposure-Ceiling Rolling Window)

| Field | Value |
|---|---|
| Patch ID | Doc-3-Policy-Key-Registration-Patch-v1.12-FairnessShareWindow |
| Applies To | `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` — §12.2 POLICY key inventory, `Fairness` domain row (additive key only) |
| Patch Authority | Owner/Board ruling 2026-07-15 on `governanceReviews/BOARD-PACKET-RFQ-DISTRIBUTION-POLICY_v1.0.md` (D1 Annex B #9 — observation approved, classified **MAJOR**; registration through the normal Doc-3 §12.2 additive process explicitly directed). |
| Patch Type | **Additive registration only** — registers one `fairness.*` POLICY key that completes the determinism of an existing frozen rule. No new fairness rule, no algorithm, no threshold semantics, no state machine, no ownership change. No existing key modified or removed. |
| Sole Purpose | Doc-3 §3.3 D2 caps a vendor at `fairness.max_share_per_cell` of a category×geo cell's invitations "**per rolling window**" (line 379) — but no POLICY key defines the window length. Without an explicit key, implementations could legitimately choose different periods, breaking deterministic behavior of a frozen rule. This patch registers the missing identifier. |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.8, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4E v1.0 (FROZEN) |
| Linked Document | `governanceReviews/BOARD-PACKET-RFQ-DISTRIBUTION-POLICY_v1.0.md` (the ruling this instrument realizes). Precedent: `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ.md` (start-value-bearing registration style); `…v1.11_PublicReadRateLimit.md` (single-key registration style). |
| Status | **APPROVED — additive Doc-3 §12.2 registration** (human owner/Board, 2026-07-15). |

---

## §1 — Patch Authority

The Board packet `BOARD-PACKET-RFQ-DISTRIBUTION-POLICY_v1.0` raised, and the owner ruling of
2026-07-15 confirmed as a **MAJOR** finding, that the frozen exposure-ceiling rule (Doc-3 §3.3
D2) references a rolling window whose length is defined nowhere: neither §3.3 nor the §12.2
Fairness domain row (`fairness.band_width`, `fairness.max_share_per_cell`,
`fairness.starvation_days`) carries a window-length key. This is a missing policy definition,
not merely a missing default — the frozen rule cannot be evaluated deterministically without
it.

This patch registers exactly that one key, and only that key, as an additive entry in the
existing Doc-3 §12.2 `Fairness` domain row.

**This patch does NOT:** create or alter any fairness, routing, matching, capacity,
distribution, probation, scoring, quotation, or evaluation rule; change the value or semantics
of `fairness.max_share_per_cell` or any other existing key; define the exposure-ratio formula
(owned by Doc-3 §3.3 D2, frozen); modify any state machine, gate, or threshold; change Doc-3
ownership or any module boundary; alter the FIXED/POLICY/ORG trichotomy (Doc-3 §12.1/§12.3).
It supplies the window-length **parameter identifier** the frozen rule already presupposes.

---

## §2 — Scope Statement

| Action | Detail |
|---|---|
| Add domain | **None** — extends the existing `Fairness` domain row |
| Register keys | 1 key (`fairness.share_window_days`) |
| Modify existing keys | **None** |
| Modify semantics/routing/trust/procurement/ownership | **None** |

No other section of Doc-3 is touched. This patch is additive to, and independent of, all prior
v1.x registrations (disjoint keys).

---

## §3 — Additive Registration Block (Doc-3 §12.2, `Fairness` domain)

**Append the following key to the `Fairness` domain row** (the row is extended, not replaced):

```
…, fairness.band_width, fairness.max_share_per_cell, fairness.starvation_days,
fairness.share_window_days
```

**Detailed key registration:**

| Key (`fairness` domain) | Category | Value type | Owner | Purpose | Mutability |
|---|---|---|---|---|---|
| `fairness.share_window_days` | Routing Fairness — Exposure Ceiling Window | duration (days) | Doc-3 POLICY inventory (authoritative registration); Module 3 (RFQ) is the behavioral consumer | Length of the rolling window over which the `fairness.max_share_per_cell` exposure ceiling (Doc-3 §3.3 D2, line 379) is computed. The D2 exposure-ratio recency window ("recent RFQ exposure") MAY explicitly adopt this same key at Wave-4 build — adoption is explicit, never implicit. *[start: 30]* | POLICY |

- **Start value:** `[start: 30]` days — proposed in the packet (Annex B #9) and approved by the
  2026-07-15 ruling; bracketed per the §12.2 `[start: …]` convention, ops-tunable thereafter.
- **Auditability:** every change is admin-permissioned and audited (Doc-3 §12.4; Doc-2 §9
  "system_configuration change"), and — because it affects selection behavior — carries the
  §12.4 versioning discipline where it feeds scored comparisons.
- **Mutability:** POLICY — global scope at launch; per-cell overrides follow the §12.4
  telemetry-first discipline (explicit override records), same as `routing.probation_share`.
- **Firewall:** this key parameterizes the **frozen** fairness mechanism itself — that is its
  legitimate job, exactly like the existing Fairness-row keys. It introduces no new rule and
  carries no payment/plan/entitlement coupling (Doc-4A §4B; Doc-3 §11.8/§12.1 — R7 firewall
  preserved by construction).

---

## §4 — Non-Impact Confirmation

| Aspect | Effect |
|---|---|
| Existing §12.2 keys (all domains) | Unchanged — none modified, renamed, or removed |
| `fairness.*` keys (`band_width`, `max_share_per_cell`, `starvation_days`) | Unchanged — one key appended to the domain row only |
| §3.3 D2 exposure-ceiling / exposure-ratio mechanism | Unchanged — the frozen rule gains its presupposed window parameter, nothing else |
| Routing / matching / capacity / distribution / probation logic | Unchanged |
| State machines (Doc-4M) | Unchanged |
| FIXED/POLICY/ORG trichotomy (§12.1/§12.3) | Unchanged — the new key is POLICY |
| Governance-signal firewall (R7; §12.1) | Unchanged — no signal/payment/plan coupling |
| Doc-3 ownership / module boundaries | Unchanged |
| Prior registrations v1.0–v1.11 | Unchanged — disjoint keys; independent patches |

---

## §5 — Conformance Self-Check

| Check | Result |
|---|---|
| Gap verified against frozen text (§3.3 line 379 "per rolling window", no key in §12.2 Fairness row) | PASS |
| Ruled by human owner/Board before authoring (Raise ≠ Accept honored) | PASS — 2026-07-15 ruling, packet decision record |
| Additive only; no existing key/semantic touched | PASS |
| Registered key is POLICY; firewall preserved | PASS |
| No new fairness rule, formula, or mechanism defined | PASS — parameter identifier + start value only |
| Adoption by the exposure-ratio recency window explicit, not automatic | PASS — Purpose column states MAY-adopt-explicitly |
| Registration style consistent with existing §12.2 | PASS (domain-row extension + detailed table, v1.1/v1.11 convention) |

---

*Doc-3 POLICY Key Registration Patch v1.12 — additive §12.2 registration of 1 `fairness.*` key
(`fairness.share_window_days` *[start: 30]*), completing the deterministic definition of the
frozen §3.3 D2 exposure ceiling. Realizes the MAJOR finding of
`BOARD-PACKET-RFQ-DISTRIBUTION-POLICY_v1.0` (owner ruling 2026-07-15). No semantic, routing,
trust, procurement, or ownership change. Status: APPROVED (additive, human owner, 2026-07-15).*
