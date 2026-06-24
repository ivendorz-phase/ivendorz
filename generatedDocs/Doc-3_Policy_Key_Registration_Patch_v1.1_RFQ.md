# Doc-3 — POLICY Key Registration Patch v1.1 (Module 3 RFQ API-Realization Keys)

| Field | Value |
|---|---|
| Patch ID | Doc-3-Policy-Key-Registration-Patch-v1.1-RFQ |
| Applies To | `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` — §12.2 POLICY key inventory, `rfq.*` (Lifecycle) domain (additive keys only) |
| Patch Authority | API Governance Board / human owner approval (2026-06-24); resolves the **`[ESC-RFQ-POLICY]`** freeze gate (`Doc-5E_Freeze_Readiness_Audit_v1.0 §4`) |
| Patch Type | **Additive registration only** — registers two existing-by-intent `rfq.*` POLICY keys referenced by frozen-candidate Doc-5E (Module 3) wire realization. No validation-semantic, routing, trust, procurement, or ownership change. No existing key modified or removed. |
| Sole Purpose | Satisfy **Doc-4A §18.2** ("a POLICY key MUST exist in Doc-3 §12.2") for the two `rfq.*` API-realization-infrastructure keys referenced by Doc-5E under the `[ESC-RFQ-POLICY]` marker. |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4E v1.0 (FROZEN), Doc-5A v1.0 (FROZEN) |
| Linked Document | `Doc-5E_Content_v1.0_Pass3.md` (Appendix A CHK-5A-071/080/081/121); `Doc-5E_Freeze_Readiness_Audit_v1.0.md` (the §4 gate this patch clears). Precedent: `Doc-3_Policy_Key_Registration_Patch_v1.0.md` (the `core.*` Module-0 registration). |
| Status | **APPROVED — additive Doc-3 §12.2 registration** (human owner, 2026-06-24) |

---

## §1 — Patch Authority

The Doc-5E Freeze Readiness Audit (§4) confirmed that two `rfq.*` POLICY keys are referenced by Module 3's API-realization (Doc-5E) but are **absent from the Doc-3 §12.2 inventory** (the `rfq.*` Lifecycle row registers procurement-lifecycle keys only). Per Doc-4A §18.2, a referenced POLICY key MUST exist in Doc-3 §12.2; inventing keys in a Doc-5 document is a conformance failure (correctly not done — every reference carries the `[ESC-RFQ-POLICY]` marker, anti-invention `CHK-5A-121/123` upheld).

This patch registers exactly those two keys, and only those two keys, as additive entries in the existing Doc-3 §12.2 `rfq.*` domain. It exists **solely** to satisfy the Doc-4A §18.2 registration requirement and clear the Doc-5E `[ESC-RFQ-POLICY]` freeze gate.

**This patch does NOT:** invent any procurement, routing, matching, fairness, capacity, distribution, scoring, quotation, or evaluation rule; remove or rename any existing key; modify any validation semantic, gate, threshold, or state machine; change Doc-3 ownership or any module boundary; alter the FIXED/POLICY/ORG trichotomy (Doc-3 §12.1/§12.3). Both keys are **POLICY** (tunable without deploy; changes admin-permissioned and audited per Doc-3 §12.4) and govern **Module 3 API-realization transport infrastructure** (idempotent-replay deduplication and list-read pagination) only — neither feeds routing, matching, trust, verification, eligibility, fairness, confidence, or any governance signal (Doc-3 §12.1 FIXED; Doc-4A §18.3, §4B). The keys carry **no payment/plan/entitlement coupling** — the R7 firewall is preserved by construction.

---

## §2 — Scope Statement

This patch adds two keys to the existing `rfq.*` domain in the Doc-3 §12.2 POLICY key inventory:

| Action | Detail |
|---|---|
| Add domain | **None** — extends the existing `rfq.*` (Lifecycle) domain |
| Register keys | 2 keys (`rfq.idempotency_dedup_window` · `rfq.list_page_size_max`) — API-realization transport tunables |
| Modify existing keys | **None** |
| Modify semantics/routing/trust/procurement/ownership | **None** |

No other section of Doc-3 is touched. All existing §12.2 domains and the existing `rfq.*` lifecycle keys are unchanged. This patch is additive to, and independent of, `Doc-3_Policy_Key_Registration_Patch_v1.0` (the `core.*` registration); the two patches register disjoint keys.

---

## §3 — Additive Registration Block (Doc-3 §12.2, `rfq.*` domain)

**Append the following two keys to the `rfq.*` "Lifecycle" domain row** (consistent with the existing domain→keys style; the row is extended, not replaced):

```
…, rfq.reissue_won_block_days, rfq.idempotency_dedup_window, rfq.list_page_size_max
```

**Detailed key registration** (key name, category, value type, owner, purpose, mutability; start values bracketed per the existing §12.2 `[start: …]` convention, tunable by ops):

| Key (`rfq` domain) | Category | Value type | Owner | Purpose | Mutability |
|---|---|---|---|---|---|
| `rfq.idempotency_dedup_window` | API Realization | duration | Doc-3 inventory; Module 3 behavioral consumer | Idempotency-replay deduplication window for `Idempotency: required` Module 3 mutations — within this window a replayed `Idempotency-Key` returns the cached original result with no duplicate audit record and **no re-emitted outbox event** (`Doc-5A §9.7`; Doc-5E §4.3/§5.4/§6.4/§7.4) *[start: 24h]* | POLICY |
| `rfq.list_page_size_max` | API Realization | integer | Doc-3 inventory; Module 3 behavioral consumer | Maximum page size for Module 3 list reads (`list_rfqs`, `list_quotations_for_rfq`, `list_invitations`) cursor pagination (`Doc-5A §8`; Doc-5E Appendix A CHK-5A-071) *[start: 100]* | POLICY |

- **Mutability:** both keys are **POLICY** — platform-operator tunable without deploy; every change is admin-permissioned and audited (Doc-3 §12.4; Doc-2 §9 "system_configuration change"). Neither is FIXED; neither is ORG.
- **Firewall:** these keys tune Module 3 API-transport behavior (replay deduplication, list pagination) only. They **MUST NOT** influence routing fairness, matching confidence, eligibility, trust, verification, capacity, distribution, or any governance signal (Doc-3 §12.1 FIXED; Doc-4A §18.3, §4B) — and by construction they do not. No payment/plan/entitlement input (R7 firewall preserved).
- **Start values** are initial operational defaults (Architecture §17.3: "configuration holds the numbers"), tunable by ops within this registration; they introduce no behavioral procurement rule and are bracketed per the existing §12.2 `[start: …]` convention.

---

## §4 — Non-Impact Confirmation

| Aspect | Effect |
|---|---|
| Existing §12.2 keys (all domains) | Unchanged — none modified, renamed, or removed |
| `rfq.*` lifecycle keys | Unchanged — two keys appended only |
| Procurement / routing / matching / fairness / capacity / scoring logic | Unchanged |
| State machines (Doc-4M) | Unchanged |
| FIXED/POLICY/ORG trichotomy (§12.1/§12.3) | Unchanged — both new keys are POLICY |
| Governance-signal firewall (R7; §12.1) | Unchanged — neither key couples to payment/plan/entitlement or any signal |
| Doc-3 ownership / module boundaries | Unchanged — Doc-3 owns the POLICY inventory; Module 3 is the consuming/behavioral owner; Module 8 governs change oversight (D-4) |
| `Doc-3_Policy_Key_Registration_Patch_v1.0` (`core.*`) | Unchanged — disjoint keys; independent patch |

---

## §5 — Conformance Self-Check

| Check | Result |
|---|---|
| Satisfies Doc-4A §18.2 (referenced key now registered in §12.2) | PASS — both `rfq.idempotency_dedup_window` and `rfq.list_page_size_max` registered |
| No key invented in a Doc-5 document (anti-invention CHK-5A-121/123) | PASS — Doc-5E used the `[ESC-RFQ-POLICY]` marker; this patch performs the registration |
| Additive only; no existing key/semantic touched | PASS |
| All registered keys are POLICY; firewall preserved | PASS |
| Registration style consistent with existing §12.2 | PASS (domain-row extension + detailed table) |
| Clears the Doc-5E `[ESC-RFQ-POLICY]` freeze gate | PASS — Doc-5E Audit §4 keys now registered |

---

*Doc-3 POLICY Key Registration Patch v1.1 — additive §12.2 registration of 2 Module 3 `rfq.*` API-realization keys (idempotent-replay dedup window · list page-size bound). Resolves the Doc-5E `[ESC-RFQ-POLICY]` freeze gate (Doc-4A §18.2). No semantic, routing, trust, procurement, or ownership change. Status: APPROVED (additive, human owner, 2026-06-24).*
