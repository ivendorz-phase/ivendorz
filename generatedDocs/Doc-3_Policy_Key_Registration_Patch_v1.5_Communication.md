# Doc-3 — POLICY Key Registration Patch v1.5 (Module 6 Communication API-Realization Keys)

| Field | Value |
|---|---|
| Patch ID | Doc-3-Policy-Key-Registration-Patch-v1.5-Communication |
| Applies To | `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` — §12.2 POLICY key inventory (additive domain block only) |
| Patch Authority | API Governance Board / human owner approval (2026-06-26); clears the **`[ESC-COMM-POLICY]`** content-freeze gate (`Doc-5H_Structure_v1.0_FROZEN` §9; `CHK-5A-121/071`) for Doc-5H content freeze |
| Patch Type | **Additive registration only** — registers two `communication.*` POLICY keys referenced by the frozen-candidate Doc-5H (Module 6) wire realization. No validation-semantic, routing, trust, procurement, money, delivery-firewall, or ownership change. No existing key modified or removed. |
| Sole Purpose | Satisfy **Doc-4A §18.2** ("a POLICY key MUST exist in Doc-3 §12.2") for the two `communication.*` API-realization-infrastructure keys referenced by Doc-5H under the `[ESC-COMM-POLICY]` marker. |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4H v1.0 (FROZEN), Doc-5A v1.0 (FROZEN) |
| Linked Document | `Doc-5H_Structure_v1.0_FROZEN.md` (§9 carried-item `[ESC-COMM-POLICY]`); `Doc-5H_Content_v1.0_Pass1…3` (CHK-5A-071/080/081/121) + `Doc-5H_Freeze_Readiness_Audit_v1.0`. Precedent: `…Patch_v1.0` (`core.*`), `…v1.1_RFQ` (`rfq.*`), `…v1.2_Marketplace` (`marketplace.*`), `…v1.3_Trust` (`trust.*`), `…v1.4_Operations` (`operations.*`). |
| Status | **APPROVED — additive Doc-3 §12.2 registration** (human owner, 2026-06-26). Architecture-affecting registration ratified by human owner per CLAUDE.md §8; the `[ESC-COMM-POLICY]` content-freeze gate is **CLEARED**. |

---

## §1 — Patch Authority

Doc-5H's caller-facing realization references two `communication.*` POLICY keys (idempotency-replay deduplication window; list-read page-size bound) for which **no `communication` POLICY namespace exists in the Doc-3 §12.2 inventory** — the namespace must be created. Per Doc-4A §18.2, a referenced POLICY key MUST exist in Doc-3 §12.2; inventing keys in a Doc-5 document is a conformance failure (correctly not done — every reference carries the `[ESC-COMM-POLICY]` marker, anti-invention `CHK-5A-121/123` upheld).

This patch registers exactly those two keys as a new additive `communication.*` sub-block of the existing Doc-3 §12.2 POLICY key inventory. It exists **solely** to satisfy the Doc-4A §18.2 registration requirement and clear the Doc-5H content-freeze gate.

**Registry ownership.** **Doc-3 §12.2 remains the sole authority for POLICY-key registration**; Module 6 is the consuming/behavioral owner only. Module 8 governs administrative oversight of changes (Doc-2 §16.2; Board decision D-4) — this patch changes neither.

**This patch does NOT:** invent any communication, messaging, notification, delivery, or support rule; register any delivery-provider, retry/backoff, or rate value (those are out-of-wire System-contract concerns — §2 scope note); remove or rename any existing key; modify any validation semantic, gate, threshold, or state machine; change Doc-3 ownership or any module boundary; alter the FIXED/POLICY/ORG trichotomy (Doc-3 §12.1/§12.3); couple to the delivery-only firewall (R6) or the non-disclosure firewall (R10). Both keys are **POLICY** (tunable without deploy; changes admin-permissioned and audited per Doc-3 §12.4) and govern **Module 6 API-realization transport infrastructure** (idempotent-replay deduplication and list-read pagination) only.

---

## §2 — Scope Statement

This patch adds one new domain sub-block to the Doc-3 §12.2 POLICY key inventory:

| Action | Detail |
|---|---|
| Add domain | **Communication API Realization (Module 6)** — domain prefix `communication.*` (new namespace; none exists today) |
| Register keys | 2 keys (`communication.idempotency_dedup_window` · `communication.list_page_size_max`) — API-realization transport tunables |
| Modify existing keys | **None** |
| Modify semantics/delivery/non-disclosure/governance/ownership | **None** |

No other section of Doc-3 is touched. All existing §12.2 domains are unchanged. This patch is additive to, and independent of, `…v1.0` (`core.*`), `…v1.1_RFQ` (`rfq.*`), `…v1.2_Marketplace` (`marketplace.*`), `…v1.3_Trust` (`trust.*`), and `…v1.4_Operations` (`operations.*`); the six patches register disjoint keys.

**Scope note — minimal registration.** Only the two keys the Doc-5H **caller-facing wire realization references** are registered. The out-of-wire System contracts (`comm.create_delivery_record`, `comm.update_delivery_status`, `comm.retry_delivery`, `comm.create_notification` — Doc-5H §8) reference **retry/backoff/max-attempt/dedup** POLICY needs that are **deliberately not registered here** — they are not on the Doc-5H caller wire surface; registered additively only if a future content pass exposes them on a wire. No key invented (`CHK-5A-121`). (Mirrors the Doc-5G "out-of-wire keys deliberately not registered preemptively" minimal-registration discipline.)

---

## §3 — Additive Registration Block (Doc-3 §12.2)

**Insert the following row into the §12.2 domain inventory table** (consistent with the existing domain→keys style):

```
| Communication API Realization (Module 6) | communication.idempotency_dedup_window, communication.list_page_size_max  (all values tunable without deploy; changes audited per §12.4) |
```

**Detailed key registration** (key name, category, value type, owner, purpose, mutability; start values bracketed per the existing §12.2 `[start: …]` convention — **initial registration values, operator-tunable, not immutable; POLICY ≠ FIXED**):

| Key (`communication` domain) | Category | Value type | Owner | Purpose | Mutability |
|---|---|---|---|---|---|
| `communication.idempotency_dedup_window` | API Realization | duration | Doc-3 inventory; Module 6 behavioral consumer | Idempotency-replay deduplication window for `Idempotency: required` Module 6 mutations — within this window a replayed `Idempotency-Key` returns the cached original result with **no duplicate audit record** (M6 emits no Doc-2 §8 outbox event — R11) (`Doc-5A §9.7`; Doc-5H §4–§7 commands) *[start: 24h]* | POLICY |
| `communication.list_page_size_max` | API Realization | integer | Doc-3 inventory; Module 6 behavioral consumer | Maximum page size for Module 6 list reads (`list_threads`, `list_notifications`, `get_delivery_status` list mode, `list_tickets`) cursor pagination (`Doc-5A §8`; Doc-5H Appendix A CHK-5A-071) *[start: 100]* | POLICY |

- **Mutability:** both keys are **POLICY** — platform-operator tunable without deploy; every change is admin-permissioned and audited (Doc-3 §12.4; Doc-2 §9 "system_configuration change"). Neither is FIXED; neither is ORG. The bracketed `[start: …]` values are **initial registration defaults**, not fixed constants.
- **Firewall (M6 is delivery-only + stores no governance signal — local authority first):** these keys tune Module 6 API-transport behavior (replay deduplication, list pagination) only. They **MUST NOT** influence any governance signal (trust/performance/verification/tier — Communication stores none, R6), any matching/eligibility/routing (RFQ — DH-3), any delivery-gating that touches trust/eligibility (delivery-only firewall, R6/DH-5/DH-6), or the non-disclosure firewall (R10) — **`Doc-3 §12.1` FIXED, then `Doc-4A §18.3`/§4B** — and by construction they do not. No payment/plan/entitlement coupling.
- **Start values** are initial operational defaults (Architecture §17.3: "configuration holds the numbers"), tunable by ops within this registration; they introduce no behavioral Communication rule and are bracketed per the existing §12.2 `[start: …]` convention.

---

## §4 — Non-Impact Confirmation

| Aspect | Effect |
|---|---|
| Existing §12.2 keys (all domains) | Unchanged — **no existing POLICY key modified, renamed, or removed** |
| Messaging / notification / delivery / support / CRM logic | Unchanged |
| State machines (Doc-2 §3.7/§10.7 / Doc-4M — thread/notification/delivery/ticket) | Unchanged |
| FIXED/POLICY/ORG trichotomy (§12.1/§12.3) | Unchanged — both new keys are POLICY |
| Delivery-only (R6) + non-disclosure (R10) + single-authorship (R5) firewalls (§12.1 FIXED) | Unchanged — neither key couples to a signal, a match, delivery gating, or a protected fact |
| Doc-3 ownership / module boundaries | Unchanged — Doc-3 §12.2 is the sole registration authority; Module 6 is the consuming/behavioral owner; Module 8 governs change oversight (D-4) |
| `…v1.0` / `…v1.1_RFQ` / `…v1.2_Marketplace` / `…v1.3_Trust` / `…v1.4_Operations` | Unchanged — disjoint keys; independent patches |

---

## §5 — Conformance Self-Check

| Check | Result |
|---|---|
| Satisfies Doc-4A §18.2 (referenced key now registered in §12.2) | PASS — both `communication.idempotency_dedup_window` and `communication.list_page_size_max` registered |
| No key invented in a Doc-5 document (anti-invention CHK-5A-121/123) | PASS — Doc-5H uses the `[ESC-COMM-POLICY]` marker; this patch performs the registration |
| Only wire-referenced keys registered | PASS — out-of-wire retry/backoff/dedup keys excluded (§2 scope note) |
| Additive only; no existing key/domain/semantic touched | PASS |
| All registered keys are POLICY; delivery-only/non-disclosure/governance firewalls preserved | PASS |
| Doc-3 §12.2 affirmed as sole registration authority | PASS (§1) |
| Registration style consistent with existing §12.2 | PASS (new domain row + detailed table) |
| Clears the Doc-5H `[ESC-COMM-POLICY]` content-freeze gate | PASS — keys registered; Doc-5H CHK-5A-071/121 now PASS unconditionally |
| Human approval obtained | PASS — human owner, 2026-06-26 (CLAUDE.md §8) |

---

*Doc-3 POLICY Key Registration Patch v1.5 — additive §12.2 registration of 2 Module 6 `communication.*` API-realization keys (idempotent-replay dedup window · list page-size bound; new `communication` POLICY namespace). Clears the Doc-5H `[ESC-COMM-POLICY]` content-freeze gate (Doc-4A §18.2). No semantic, delivery, non-disclosure, governance, or ownership change. Status: APPROVED (additive, human owner, 2026-06-26).*