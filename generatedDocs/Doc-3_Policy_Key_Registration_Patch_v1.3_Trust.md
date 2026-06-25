# Doc-3 — POLICY Key Registration Patch v1.3 (Module 5 Trust API-Realization Keys)

| Field | Value |
|---|---|
| Patch ID | Doc-3-Policy-Key-Registration-Patch-v1.3-Trust |
| Applies To | `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` — §12.2 POLICY key inventory (additive domain block only) |
| Patch Authority | API Governance Board / human owner approval (2026-06-25); resolves the **`[ESC-TRUST-POLICY]`** content-freeze gate (`Doc-5G_Content_v1.0_Pass3.md` §9.2; `CHK-5A-121/071`) |
| Patch Type | **Additive registration only** — registers two `trust.*` POLICY keys referenced by frozen-candidate Doc-5G (Module 5) wire realization. No validation-semantic, routing, trust, procurement, scoring, or ownership change. No existing key modified or removed. |
| Sole Purpose | Satisfy **Doc-4A §18.2** ("a POLICY key MUST exist in Doc-3 §12.2") for the two `trust.*` API-realization-infrastructure keys referenced by Doc-5G under the `[ESC-TRUST-POLICY]` marker. |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4G v1.0 (FROZEN), Doc-5A v1.0 (FROZEN) |
| Linked Document | `Doc-5G_Content_v1.0_Pass1…3.md` (Appendix A CHK-5A-071/080/081/121); `Doc-5G_Freeze_Readiness_Audit_v1.0.md` (the gate this patch clears). Precedent: `Doc-3_Policy_Key_Registration_Patch_v1.0.md` (`core.*`), `…v1.1_RFQ.md` (`rfq.*`), `…v1.2_Marketplace.md` (`marketplace.*`). |
| Status | **APPROVED — additive Doc-3 §12.2 registration** (human owner, 2026-06-25) |

---

## §1 — Patch Authority

Doc-5G's content passes reference two `trust.*` POLICY keys (idempotency-replay deduplication window; list-read page-size bound) that are **absent from the Doc-3 §12.2 inventory** — §12.2 currently registers **no `trust.*` domain at all**. Per Doc-4A §18.2, a referenced POLICY key MUST exist in Doc-3 §12.2; inventing keys in a Doc-5 document is a conformance failure (correctly not done — every reference carries the `[ESC-TRUST-POLICY]` marker, anti-invention `CHK-5A-121/123` upheld).

This patch registers exactly those two keys as a new additive `trust.*` sub-block of the existing Doc-3 §12.2 POLICY key inventory. It exists **solely** to satisfy the Doc-4A §18.2 registration requirement and clear the Doc-5G content-freeze gate.

**Registry ownership.** **Doc-3 §12.2 remains the sole authority for POLICY-key registration**; Module 5 is the consuming/behavioral owner only. Module 8 governs administrative oversight of changes (Doc-2 §16.2; Board decision D-4) — this patch changes neither.

**This patch does NOT:** invent any trust, verification, scoring, performance, fraud, or governance-signal rule; register any score formula, threshold, or weight; remove or rename any existing key; modify any validation semantic, gate, threshold, or state machine; change Doc-3 ownership or any module boundary; alter the FIXED/POLICY/ORG trichotomy (Doc-3 §12.1/§12.3). Both keys are **POLICY** (tunable without deploy; changes admin-permissioned and audited per Doc-3 §12.4) and govern **Module 5 API-realization transport infrastructure** (idempotent-replay deduplication and list-read pagination) only.

---

## §2 — Scope Statement

This patch adds one new domain sub-block to the Doc-3 §12.2 POLICY key inventory:

| Action | Detail |
|---|---|
| Add domain | **Trust API Realization (Module 5)** — domain prefix `trust.*` |
| Register keys | 2 keys (`trust.idempotency_dedup_window` · `trust.list_page_size_max`) — API-realization transport tunables |
| Modify existing keys | **None** |
| Modify semantics/scoring/trust/governance/ownership | **None** |

No other section of Doc-3 is touched. All existing §12.2 domains are unchanged. This patch is additive to, and independent of, `Doc-3_Policy_Key_Registration_Patch_v1.0` (`core.*`), `…v1.1_RFQ` (`rfq.*`), and `…v1.2_Marketplace` (`marketplace.*`); the four patches register disjoint keys.

**Scope note — minimal registration.** Only the two keys the Doc-5G **caller-facing wire realization references** are registered. The **out-of-wire** `trust.*` POLICY keys (score-formula thresholds/weights, verification/tier expiry windows, performance-review windows — consumed only by the §8 System mechanisms `compute_*` / `ingest_performance_input` / `trigger_performance_review` / the expiry timers, never on the Doc-5G wire surface) are **not** registered here. If a future content pass references them, they are registered additively then — never coined preemptively (`CHK-5A-121`).

---

## §3 — Additive Registration Block (Doc-3 §12.2)

**Insert the following row into the §12.2 domain inventory table** (consistent with the existing domain→keys style):

```
| Trust API Realization (Module 5) | trust.idempotency_dedup_window, trust.list_page_size_max  (all values tunable without deploy; changes audited per §12.4) |
```

**Detailed key registration** (key name, category, value type, owner, purpose, mutability; start values bracketed per the existing §12.2 `[start: …]` convention — **initial registration values, operator-tunable, not immutable; POLICY ≠ FIXED**):

| Key (`trust` domain) | Category | Value type | Owner | Purpose | Mutability |
|---|---|---|---|---|---|
| `trust.idempotency_dedup_window` | API Realization | duration | Doc-3 inventory; Module 5 behavioral consumer | Idempotency-replay deduplication window for `Idempotency: required` Module 5 mutations — within this window a replayed `Idempotency-Key` returns the cached original result with no duplicate audit record and **no re-emitted outbox event** (`Doc-5A §9.7`; Doc-5G §4.6/§5.5/§6.4/§7.4) *[start: 24h]* | POLICY |
| `trust.list_page_size_max` | API Realization | integer | Doc-3 inventory; Module 5 behavioral consumer | Maximum page size for Module 5 list reads (`list_verifications`, `list_trust_score_history`, `list_performance_inputs`, `list_performance_score_history`, `list_fraud_signals`, `list_reviews`, `list_admin_ratings`) cursor pagination (`Doc-5A §8`; Doc-5G Appendix A CHK-5A-071) *[start: 100]* | POLICY |

- **Mutability:** both keys are **POLICY** — platform-operator tunable without deploy; every change is admin-permissioned and audited (Doc-3 §12.4; Doc-2 §9 "system_configuration change"). Neither is FIXED; neither is ORG. The bracketed `[start: …]` values are **initial registration defaults**, not fixed constants.
- **Firewall (M5 is the governance-signal owner — local authority first):** these keys tune Module 5 API-transport behavior (replay deduplication, list pagination) only. They **MUST NOT** influence Trust Score, Performance Score, Verification, Verified Tier, fraud disposition, or any governance signal — **`Doc-3 §12.1` FIXED, then `Doc-4A §18.3`/§4B; DG-7** — and by construction they do not. No payment/plan/entitlement coupling (R6/DG-7).
- **Start values** are initial operational defaults (Architecture §17.3: "configuration holds the numbers"), tunable by ops within this registration; they introduce no behavioral trust/scoring rule and are bracketed per the existing §12.2 `[start: …]` convention.

---

## §4 — Non-Impact Confirmation

| Aspect | Effect |
|---|---|
| Existing §12.2 keys (all domains) | Unchanged — **no existing POLICY key modified, renamed, or removed** |
| Trust / scoring / verification / performance / fraud / governance-signal logic | Unchanged — no score formula/threshold/weight registered |
| State machines (Doc-2 / Doc-4M) | Unchanged |
| FIXED/POLICY/ORG trichotomy (§12.1/§12.3) | Unchanged — both new keys are POLICY |
| Governance-signal + Billing firewall (R5/R6; DG-7; §12.1 FIXED) | Unchanged — neither key couples to payment/plan/entitlement or any signal |
| Doc-3 ownership / module boundaries | Unchanged — Doc-3 §12.2 is the sole registration authority; Module 5 is the consuming/behavioral owner; Module 8 governs change oversight (D-4) |
| `…Patch_v1.0` (`core.*`) / `…v1.1_RFQ` (`rfq.*`) / `…v1.2_Marketplace` (`marketplace.*`) | Unchanged — disjoint keys; independent patches |

---

## §5 — Conformance Self-Check

| Check | Result |
|---|---|
| Satisfies Doc-4A §18.2 (referenced key now registered in §12.2) | PASS — both `trust.idempotency_dedup_window` and `trust.list_page_size_max` registered |
| No key invented in a Doc-5 document (anti-invention CHK-5A-121/123) | PASS — Doc-5G used the `[ESC-TRUST-POLICY]` marker; this patch performs the registration |
| Only wire-referenced keys registered; no out-of-wire/score key registered | PASS — score-formula/expiry/review keys deliberately excluded (§2 scope note) |
| Additive only; no existing key/domain/semantic touched | PASS |
| All registered keys are POLICY; governance/Billing firewall preserved | PASS |
| Doc-3 §12.2 affirmed as sole registration authority | PASS (§1) |
| Registration style consistent with existing §12.2 | PASS (new domain row + detailed table) |
| Clears the Doc-5G `[ESC-TRUST-POLICY]` content-freeze gate | PASS — Doc-5G Appendix A CHK-5A-071/121 keys now registered |

---

*Doc-3 POLICY Key Registration Patch v1.3 — additive §12.2 registration of 2 Module 5 `trust.*` API-realization keys (idempotent-replay dedup window · list page-size bound). Resolves the Doc-5G `[ESC-TRUST-POLICY]` content-freeze gate (Doc-4A §18.2). No semantic, scoring, trust, governance, or ownership change. Status: APPROVED (additive, human owner, 2026-06-25).*
