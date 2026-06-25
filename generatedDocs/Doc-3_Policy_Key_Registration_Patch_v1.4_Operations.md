# Doc-3 — POLICY Key Registration Patch v1.4 (Module 4 Operations API-Realization Keys)

| Field | Value |
|---|---|
| Patch ID | Doc-3-Policy-Key-Registration-Patch-v1.4-Operations |
| Applies To | `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` — §12.2 POLICY key inventory (additive domain block only) |
| Patch Authority | API Governance Board / human owner approval (2026-06-25); pre-clears the **`[ESC-OPS-POLICY]`** content-freeze gate (`Doc-5F_Structure_v1.0_FROZEN` §10; `CHK-5A-121/071`) ahead of Doc-5F content authoring |
| Patch Type | **Additive registration only** — registers two `operations.*` POLICY keys referenced by the frozen-candidate Doc-5F (Module 4) wire realization. No validation-semantic, routing, trust, procurement, money, or ownership change. No existing key modified or removed. |
| Sole Purpose | Satisfy **Doc-4A §18.2** ("a POLICY key MUST exist in Doc-3 §12.2") for the two `operations.*` API-realization-infrastructure keys referenced by Doc-5F under the `[ESC-OPS-POLICY]` marker. |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4F v1.0 (FROZEN), Doc-5A v1.0 (FROZEN) |
| Linked Document | `Doc-5F_Structure_v1.0_FROZEN.md` (§10 carried-item `[ESC-OPS-POLICY]`); the forthcoming `Doc-5F_Content_v1.0_Pass1…3` (CHK-5A-071/080/081/121) + `Doc-5F_Freeze_Readiness_Audit_v1.0`. Precedent: `Doc-3_Policy_Key_Registration_Patch_v1.0.md` (`core.*`), `…v1.1_RFQ.md` (`rfq.*`), `…v1.2_Marketplace.md` (`marketplace.*`), `…v1.3_Trust.md` (`trust.*`). |
| Status | **APPROVED — additive Doc-3 §12.2 registration** (human owner, 2026-06-25) |

---

## §1 — Patch Authority

Doc-5F's caller-facing realization references two `operations.*` POLICY keys (idempotency-replay deduplication window; list-read page-size bound) for which **no `operations` POLICY namespace exists in the Doc-3 §12.2 inventory** — the namespace must be created. Per Doc-4A §18.2, a referenced POLICY key MUST exist in Doc-3 §12.2; inventing keys in a Doc-5 document is a conformance failure (correctly not done — every reference carries the `[ESC-OPS-POLICY]` marker, anti-invention `CHK-5A-121/123` upheld).

This patch registers exactly those two keys as a new additive `operations.*` sub-block of the existing Doc-3 §12.2 POLICY key inventory. It exists **solely** to satisfy the Doc-4A §18.2 registration requirement and pre-clear the Doc-5F content-freeze gate (registered up front, before content authoring).

**Registry ownership.** **Doc-3 §12.2 remains the sole authority for POLICY-key registration**; Module 4 is the consuming/behavioral owner only. Module 8 governs administrative oversight of changes (Doc-2 §16.2; Board decision D-4) — this patch changes neither.

**This patch does NOT:** invent any procurement, engagement, lead, document, finance, CRM, or governance rule; register any money/settlement/funds-movement value (Operations is records-not-rails — R8); remove or rename any existing key; modify any validation semantic, gate, threshold, or state machine; change Doc-3 ownership or any module boundary; alter the FIXED/POLICY/ORG trichotomy (Doc-3 §12.1/§12.3). Both keys are **POLICY** (tunable without deploy; changes admin-permissioned and audited per Doc-3 §12.4) and govern **Module 4 API-realization transport infrastructure** (idempotent-replay deduplication and list-read pagination) only.

---

## §2 — Scope Statement

This patch adds one new domain sub-block to the Doc-3 §12.2 POLICY key inventory:

| Action | Detail |
|---|---|
| Add domain | **Operations API Realization (Module 4)** — domain prefix `operations.*` (new namespace; none exists today) |
| Register keys | 2 keys (`operations.idempotency_dedup_window` · `operations.list_page_size_max`) — API-realization transport tunables |
| Modify existing keys | **None** |
| Modify semantics/procurement/money/governance/ownership | **None** |

No other section of Doc-3 is touched. All existing §12.2 domains are unchanged. This patch is additive to, and independent of, `…Patch_v1.0` (`core.*`), `…v1.1_RFQ` (`rfq.*`), `…v1.2_Marketplace` (`marketplace.*`), and `…v1.3_Trust` (`trust.*`); the five patches register disjoint keys.

**Scope note — minimal registration.** Only the two keys the Doc-5F **caller-facing wire realization references** are registered. Any other `operations.*` POLICY needs (limit windows, retention) are **not** registered here — not referenced on the Doc-5F wire surface; registered additively only if a future content pass references them. No key invented (`CHK-5A-121`).

---

## §3 — Additive Registration Block (Doc-3 §12.2)

**Insert the following row into the §12.2 domain inventory table** (consistent with the existing domain→keys style):

```
| Operations API Realization (Module 4) | operations.idempotency_dedup_window, operations.list_page_size_max  (all values tunable without deploy; changes audited per §12.4) |
```

**Detailed key registration** (key name, category, value type, owner, purpose, mutability; start values bracketed per the existing §12.2 `[start: …]` convention — **initial registration values, operator-tunable, not immutable; POLICY ≠ FIXED**):

| Key (`operations` domain) | Category | Value type | Owner | Purpose | Mutability |
|---|---|---|---|---|---|
| `operations.idempotency_dedup_window` | API Realization | duration | Doc-3 inventory; Module 4 behavioral consumer | Idempotency-replay deduplication window for `Idempotency: required` Module 4 mutations — within this window a replayed `Idempotency-Key` returns the cached original result with no duplicate audit record and **no re-emitted outbox event** (`Doc-5A §9.7`; Doc-5F §4–§8 commands) *[start: 24h]* | POLICY |
| `operations.list_page_size_max` | API Realization | integer | Doc-3 inventory; Module 4 behavioral consumer | Maximum page size for Module 4 list reads (`list_private_vendors`, `list_engagements`, `list_leads`, `list_templates`, `list_generated_documents`, `list_finance_records`) cursor pagination (`Doc-5A §8`; Doc-5F Appendix A CHK-5A-071) *[start: 100]* | POLICY |

- **Mutability:** both keys are **POLICY** — platform-operator tunable without deploy; every change is admin-permissioned and audited (Doc-3 §12.4; Doc-2 §9 "system_configuration change"). Neither is FIXED; neither is ORG. The bracketed `[start: …]` values are **initial registration defaults**, not fixed constants.
- **Firewall (M4 is records-not-rails + stores no governance signal — local authority first):** these keys tune Module 4 API-transport behavior (replay deduplication, list pagination) only. They **MUST NOT** influence any governance signal (trust/performance/verification/tier — Operations stores none, R6), any matching/eligibility (RFQ — DF-3), any money movement/settlement (Operations is records-not-rails, R8), or the non-disclosure firewall (R5) — **`Doc-3 §12.1` FIXED, then `Doc-4A §18.3`/§4B** — and by construction they do not. No payment/plan/entitlement coupling.
- **Start values** are initial operational defaults (Architecture §17.3: "configuration holds the numbers"), tunable by ops within this registration; they introduce no behavioral Operations rule and are bracketed per the existing §12.2 `[start: …]` convention.

---

## §4 — Non-Impact Confirmation

| Aspect | Effect |
|---|---|
| Existing §12.2 keys (all domains) | Unchanged — **no existing POLICY key modified, renamed, or removed** |
| Procurement / engagement / lead / document / finance / CRM logic | Unchanged |
| State machines (Doc-2 §3.5/§5.9/§10.5 / Doc-4M) | Unchanged |
| FIXED/POLICY/ORG trichotomy (§12.1/§12.3) | Unchanged — both new keys are POLICY |
| Non-disclosure (R5) + governance-signal (R6) + money-boundary (R8) firewalls (§12.1 FIXED) | Unchanged — neither key couples to a signal, a match, funds movement, or a protected fact |
| Doc-3 ownership / module boundaries | Unchanged — Doc-3 §12.2 is the sole registration authority; Module 4 is the consuming/behavioral owner; Module 8 governs change oversight (D-4) |
| `…v1.0` (`core.*`) / `…v1.1_RFQ` / `…v1.2_Marketplace` / `…v1.3_Trust` | Unchanged — disjoint keys; independent patches |

---

## §5 — Conformance Self-Check

| Check | Result |
|---|---|
| Satisfies Doc-4A §18.2 (referenced key now registered in §12.2) | PASS — both `operations.idempotency_dedup_window` and `operations.list_page_size_max` registered |
| No key invented in a Doc-5 document (anti-invention CHK-5A-121/123) | PASS — Doc-5F uses the `[ESC-OPS-POLICY]` marker; this patch performs the registration |
| Only wire-referenced keys registered | PASS — limit/retention keys excluded (§2 scope note) |
| Additive only; no existing key/domain/semantic touched | PASS |
| All registered keys are POLICY; non-disclosure/governance/money firewalls preserved | PASS |
| Doc-3 §12.2 affirmed as sole registration authority | PASS (§1) |
| Registration style consistent with existing §12.2 | PASS (new domain row + detailed table) |
| Pre-clears the Doc-5F `[ESC-OPS-POLICY]` content-freeze gate | PASS — keys present ahead of Doc-5F content Freeze Audit (CHK-5A-071/121) |

---

*Doc-3 POLICY Key Registration Patch v1.4 — additive §12.2 registration of 2 Module 4 `operations.*` API-realization keys (idempotent-replay dedup window · list page-size bound; new `operations` POLICY namespace). Pre-clears the Doc-5F `[ESC-OPS-POLICY]` content-freeze gate (Doc-4A §18.2). No semantic, procurement, money, governance, or ownership change. Status: APPROVED (additive, human owner, 2026-06-25).*
