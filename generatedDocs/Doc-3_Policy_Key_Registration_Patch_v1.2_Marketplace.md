# Doc-3 — POLICY Key Registration Patch v1.2 (Module 2 Marketplace API-Realization Keys)

| Field | Value |
|---|---|
| Patch ID | Doc-3-Policy-Key-Registration-Patch-v1.2-Marketplace |
| Applies To | `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` — §12.2 POLICY key inventory (additive domain block only) |
| Patch Authority | API Governance Board / human owner approval (2026-06-25); resolves the **DD-6 `[ESC-MKT-POLICY]`-class** content-freeze gate (`Doc-5D_Content_v1.0_Pass3.md` §10.2; `CHK-5A-121/071`) |
| Patch Type | **Additive registration only** — registers two `marketplace.*` POLICY keys referenced by frozen-candidate Doc-5D (Module 2) wire realization. No validation-semantic, routing, trust, procurement, or ownership change. No existing key modified or removed. |
| Sole Purpose | Satisfy **Doc-4A §18.2** ("a POLICY key MUST exist in Doc-3 §12.2") for the two `marketplace.*` API-realization-infrastructure keys referenced by Doc-5D under the DD-6 marker. |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4D v1.0 (FROZEN), Doc-5A v1.0 (FROZEN) |
| Linked Document | `Doc-5D_Content_v1.0_Pass1…3.md` (Appendix A CHK-5A-071/080/081/121); `Doc-5D_Freeze_Readiness_Audit_v1.0.md` (the gate this patch clears). Precedent: `Doc-3_Policy_Key_Registration_Patch_v1.0.md` (`core.*`), `…v1.1_RFQ.md` (`rfq.*`). |
| Status | **APPROVED — additive Doc-3 §12.2 registration** (human owner, 2026-06-25) |

---

## §1 — Patch Authority

Doc-5D's content passes reference two `marketplace.*` POLICY keys (idempotency-replay deduplication window; list-read page-size bound) that are **absent from the Doc-3 §12.2 inventory** — §12.2 currently registers **no `marketplace.*` domain at all**. Per Doc-4A §18.2, a referenced POLICY key MUST exist in Doc-3 §12.2; inventing keys in a Doc-5 document is a conformance failure (correctly not done — every reference carries the DD-6 marker, anti-invention `CHK-5A-121/123` upheld).

This patch registers exactly those two keys as a new additive `marketplace.*` sub-block of the existing Doc-3 §12.2 POLICY key inventory. It exists **solely** to satisfy the Doc-4A §18.2 registration requirement and clear the Doc-5D content-freeze gate.

**This patch does NOT:** invent any presentation, catalog, discovery, or marketplace business rule; remove or rename any existing key; modify any validation semantic, gate, threshold, or state machine; change Doc-3 ownership or any module boundary; alter the FIXED/POLICY/ORG trichotomy (Doc-3 §12.1/§12.3). Both keys are **POLICY** (tunable without deploy; changes admin-permissioned and audited per Doc-3 §12.4) and govern **Module 2 API-realization transport infrastructure** (idempotent-replay deduplication and list-read pagination) only — neither feeds routing, matching, trust, verification, eligibility, fairness, confidence, or any governance signal (Doc-3 §12.1 FIXED; Doc-4A §18.3, §4B). No payment/plan/entitlement coupling.

---

## §2 — Scope Statement

This patch adds one new domain sub-block to the Doc-3 §12.2 POLICY key inventory:

| Action | Detail |
|---|---|
| Add domain | **Marketplace API Realization (Module 2)** — domain prefix `marketplace.*` |
| Register keys | 2 keys (`marketplace.idempotency_dedup_window` · `marketplace.list_page_size_max`) — API-realization transport tunables |
| Modify existing keys | **None** |
| Modify semantics/routing/trust/procurement/ownership | **None** |

No other section of Doc-3 is touched. All existing §12.2 domains are unchanged. This patch is additive to, and independent of, `Doc-3_Policy_Key_Registration_Patch_v1.0` (`core.*`) and `…v1.1_RFQ` (`rfq.*`); the three patches register disjoint keys.

**Scope note — minimal registration.** Only the two keys the Doc-5D **caller-facing wire realization references** are registered. Other marketplace behaviors named in Doc-5D's structure DD-6 (category-assignment caps, advertisement-placement caps, custom-domain verification window) are **not** registered here — they are not referenced as POLICY keys on the Doc-5D wire surface (the domain-verify step is §9 out-of-wire infra). If a future content pass references them, they are registered additively then — never coined preemptively (`CHK-5A-121`).

---

## §3 — Additive Registration Block (Doc-3 §12.2)

**Insert the following row into the §12.2 domain inventory table** (consistent with the existing domain→keys style):

```
| Marketplace API Realization (Module 2) | marketplace.idempotency_dedup_window, marketplace.list_page_size_max  (all values tunable without deploy; changes audited per §12.4) |
```

**Detailed key registration** (key name, category, value type, owner, purpose, mutability; start values bracketed per the existing §12.2 `[start: …]` convention, tunable by ops):

| Key (`marketplace` domain) | Category | Value type | Owner | Purpose | Mutability |
|---|---|---|---|---|---|
| `marketplace.idempotency_dedup_window` | API Realization | duration | Doc-3 inventory; Module 2 behavioral consumer | Idempotency-replay deduplication window for `Idempotency: required` Module 2 mutations — within this window a replayed `Idempotency-Key` returns the cached original result with no duplicate audit record and **no re-emitted outbox event** (`Doc-5A §9.7`; Doc-5D §4.5/§5.5/§6.4/§7.4) *[start: 24h]* | POLICY |
| `marketplace.list_page_size_max` | API Realization | integer | Doc-3 inventory; Module 2 behavioral consumer | Maximum page size for Module 2 list/discovery reads (`list_products`, `list_categories`, `list_advertisements`, `list_catalog_favorites`, `search_catalog`, `list_vendor_directory`) cursor pagination (`Doc-5A §8`; Doc-5D Appendix A CHK-5A-071) *[start: 100]* | POLICY |

- **Mutability:** both keys are **POLICY** — platform-operator tunable without deploy; every change is admin-permissioned and audited (Doc-3 §12.4; Doc-2 §9 "system_configuration change"). Neither is FIXED; neither is ORG.
- **Firewall:** these keys tune Module 2 API-transport behavior (replay deduplication, list pagination) only. They **MUST NOT** influence routing fairness, matching confidence, eligibility, trust, verification, capacity, distribution, or any governance signal (Doc-3 §12.1 FIXED; Doc-4A §18.3, §4B) — and by construction they do not. No payment/plan/entitlement input.
- **Start values** are initial operational defaults (Architecture §17.3: "configuration holds the numbers"), tunable by ops within this registration; they introduce no behavioral marketplace rule and are bracketed per the existing §12.2 `[start: …]` convention.

---

## §4 — Non-Impact Confirmation

| Aspect | Effect |
|---|---|
| Existing §12.2 keys (all domains) | Unchanged — none modified, renamed, or removed |
| Procurement / routing / matching / fairness / capacity / scoring logic | Unchanged |
| State machines (Doc-4M) | Unchanged |
| FIXED/POLICY/ORG trichotomy (§12.1/§12.3) | Unchanged — both new keys are POLICY |
| Governance-signal firewall (§12.1) | Unchanged — neither key couples to payment/plan/entitlement or any signal |
| Doc-3 ownership / module boundaries | Unchanged — Doc-3 owns the POLICY inventory; Module 2 is the consuming/behavioral owner; Module 8 governs change oversight (D-4) |
| `Doc-3_Policy_Key_Registration_Patch_v1.0` (`core.*`) / `…v1.1_RFQ` (`rfq.*`) | Unchanged — disjoint keys; independent patches |

---

## §5 — Conformance Self-Check

| Check | Result |
|---|---|
| Satisfies Doc-4A §18.2 (referenced key now registered in §12.2) | PASS — both `marketplace.idempotency_dedup_window` and `marketplace.list_page_size_max` registered |
| No key invented in a Doc-5 document (anti-invention CHK-5A-121/123) | PASS — Doc-5D used the DD-6 marker; this patch performs the registration |
| Additive only; no existing key/semantic touched | PASS |
| All registered keys are POLICY; firewall preserved | PASS |
| Registration style consistent with existing §12.2 | PASS (new domain row + detailed table) |
| Clears the Doc-5D DD-6 content-freeze gate | PASS — Doc-5D Appendix A CHK-5A-071/121 keys now registered |

---

*Doc-3 POLICY Key Registration Patch v1.2 — additive §12.2 registration of 2 Module 2 `marketplace.*` API-realization keys (idempotent-replay dedup window · list page-size bound). Resolves the Doc-5D DD-6 content-freeze gate (Doc-4A §18.2). No semantic, routing, trust, procurement, or ownership change. Status: APPROVED (additive, human owner, 2026-06-25).*
