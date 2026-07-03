# Doc-3 — POLICY Key Registration Patch v1.11 (Module 2 Public-Read Rate Limit) — PROPOSAL

| Field | Value |
|---|---|
| Patch ID | Doc-3-Policy-Key-Registration-Patch-v1.11-PublicReadRateLimit |
| Applies To | `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` — §12.2 POLICY key inventory, `marketplace.*` domain (additive key only) |
| Patch Authority | `ESC-7-API-PRODDETAIL` Board Resolution **`R-ESC7-PRODDETAIL-FREEZE`** (owner Board, 2026-07-03), Annex E Decision #6 — authorized this instrument; names/values marked **"Pending batch"** at resolution time. This document is that pending batch, submitted for human owner approval. |
| Patch Type | **Additive registration only** — registers one `marketplace.*` POLICY key referenced by the not-yet-frozen Doc-4D v1.0.3 / Doc-5D v1.0.1 proposals. No validation-semantic, routing, trust, procurement, ownership, enforcement-mechanism, or algorithm content. No existing key modified or removed. |
| Sole Purpose | Satisfy **Doc-4A §18.2** ("a POLICY key MUST exist in Doc-3 §12.2") for the intended identifier reserved (unregistered) by `Doc-4D_PublicProductDetail_Patch_v1.0.3_PROPOSAL.md` and `Doc-5D_PublicProductDetail_Patch_v1.0.1_PROPOSAL.md` §Rate-Limiting, unblocking their contract-freeze gate (instrument **E-1**). |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.5, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4D v1.0 (+ pending `PublicProductDetail_Patch_v1.0.3_PROPOSAL`), Doc-5D v1.0 (+ pending `PublicProductDetail_Patch_v1.0.1_PROPOSAL`) |
| Linked Document | `governanceReviews/Doc-4D_PublicProductDetail_Patch_v1.0.3_PROPOSAL.md`; `governanceReviews/Doc-5D_PublicProductDetail_Patch_v1.0.1_PROPOSAL.md`; `governanceReviews/ESC-7-API-PRODDETAIL_Product_Detail_Architecture_Plan_v1.0_PROPOSAL.md` (the resolution this instrument realizes). Precedent: `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace.md` and `Doc-3_Policy_Key_Registration_Patch_v1.10_VendorSubdomain.md` (both extend the same `marketplace.*` domain row). |
| Status | **DRAFT — pending human owner approval.** No dedicated decision record yet ratifies this key's specific name/value/fields (unlike the v1.10 precedent, which had a prior `BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN` ruling before drafting). Staged as a PROPOSAL alongside its sibling E-1 instruments, not folded into `generatedDocs/`. |

---

## §1 — Patch Authority

`marketplace.get_public_product_detail.v1` (instrument E-1) and the existing frozen
`marketplace.get_public_vendor_profile.v1` are Marketplace public read endpoints requiring
platform-managed throughput control. Per Doc-4A §18.2, a referenced POLICY key MUST exist in
Doc-3 §12.2; per the anti-invention rule, neither Doc-4D nor Doc-5D may carry an operational
throughput value as a literal — the identifier must be registered here.

This patch registers exactly that one key, and only that key, as an additive entry in the
existing Doc-3 §12.2 `marketplace.*` domain (registered by
`Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace`, previously extended by
`…v1.10_VendorSubdomain`).

**This patch does NOT:** define an enforcement mechanism or algorithm; define HTTP headers;
define Redis or any other storage/caching mechanism; define throttling mechanics; define
middleware; prescribe response status codes; invent any procurement, routing, matching,
fairness, capacity, distribution, scoring, quotation, or evaluation rule; remove or rename any
existing key; modify any validation semantic, gate, threshold, or state machine; change Doc-3
ownership or any module boundary; alter the FIXED/POLICY/ORG trichotomy (Doc-3 §12.1/§12.3).
Those are separate, later instruments. The key governs **throughput-control configuration
only** — it feeds no routing, matching, trust, verification, eligibility, fairness, confidence,
or governance signal, and carries no payment/plan/entitlement coupling (R7 firewall preserved by
construction).

---

## §2 — Scope Statement

This patch adds one key to the existing `marketplace.*` domain in the Doc-3 §12.2 POLICY key
inventory:

| Action | Detail |
|---|---|
| Add domain | **None** — extends the existing `Marketplace API Realization (Module 2)` domain row |
| Register keys | 1 key (`marketplace.public_read_rate_limit`) — API-realization throughput control |
| Modify existing keys | **None** |
| Modify semantics/routing/trust/procurement/ownership | **None** |

No other section of Doc-3 is touched. All existing §12.2 domains and keys are unchanged. This
patch is additive to, and independent of, `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace`
and `…v1.10_VendorSubdomain` (disjoint keys) and every other v1.x registration.

---

## §3 — Additive Registration Block (Doc-3 §12.2, `marketplace.*` domain)

**Append the following key to the `Marketplace API Realization (Module 2)` domain row**
(consistent with the existing domain→keys style; the row is extended, not replaced):

```
…, marketplace.idempotency_dedup_window, marketplace.list_page_size_max,
marketplace.reserved_subdomain_labels, marketplace.public_read_rate_limit
```

**Detailed key registration:**

| Key (`marketplace` domain) | Category | Value type | Owner | Purpose | Mutability |
|---|---|---|---|---|---|
| `marketplace.public_read_rate_limit` | API Realization — Throughput Control | rate (composite: integer request-count per duration window) | Doc-3 POLICY inventory (authoritative registration); Module 2 (Marketplace) is the behavioral consumer | Platform-configurable throughput control for Marketplace public read endpoints that explicitly adopt this key. Consumers: `marketplace.get_public_vendor_profile.v1` (frozen, Doc-4D PassA §21.3 Public Discovery Reads); `marketplace.get_public_product_detail.v1` (pending — binds once Doc-4D v1.0.3 / Doc-5D v1.0.1 freeze under E-1); future Marketplace public read endpoints that explicitly adopt this POLICY key (no automatic/implicit adoption). | POLICY |

- **Default:** Platform-defined operational default. Initial operational value established
  through the platform's authorized configuration process; not fixed by this registration
  patch. POLICY-tunable without corpus modification. No numeric value is committed here — Doc-3
  registers that the POLICY exists, not an unratified operational number.
- **Auditability:** every change is admin-permissioned and audited (Doc-3 §12.4; Doc-2 §9
  "system_configuration change") — same as all §12.2 POLICY keys.
- **Mutability:** POLICY — platform-operator tunable without deploy; not FIXED (the operational
  value is expected to change with platform load and policy); not ORG (platform-wide, never
  per-tenant). Changes to the effective runtime value do not modify the API contract or require
  API versioning.
- **Consumers:** see Purpose column above. Adoption is explicit and per-endpoint — this key does
  not automatically or implicitly govern any endpoint that does not name it.
- **Firewall:** this key tunes throughput-control configuration only. It **MUST NOT** influence
  routing fairness, matching confidence, eligibility, trust, verification, capacity,
  distribution, or any governance signal (Doc-3 §12.1 FIXED; Doc-4A §18.3, §4B) — and by
  construction it does not. No payment/plan/entitlement input (R7 firewall preserved).

---

## §4 — Non-Impact Confirmation

| Aspect | Effect |
|---|---|
| Existing §12.2 keys (all domains) | Unchanged — none modified, renamed, or removed |
| `marketplace.*` API-realization keys (v1.2/v1.10) | Unchanged — one key appended to the domain row only |
| Procurement / routing / matching / fairness / capacity / scoring logic | Unchanged |
| State machines (Doc-4M) | Unchanged |
| FIXED/POLICY/ORG trichotomy (§12.1/§12.3) | Unchanged — the new key is POLICY |
| Governance-signal firewall (R7; §12.1) | Unchanged — no signal/payment/plan coupling |
| Doc-3 ownership / module boundaries | Unchanged — Doc-3 owns the POLICY inventory; Module 2 is the consuming/behavioral owner; Module 8 governs change oversight (D-4) |
| Prior registrations v1.0–v1.10 | Unchanged — disjoint keys; independent patches |
| Enforcement mechanism / algorithm / HTTP behavior / middleware / Redis | **None defined** — this patch registers the identifier only (Doc-4A §18.2 scope); enforcement is a separate future instrument |
| API contract (Doc-4D / Doc-5D) | **None created by this registration** — Doc-3 remains the POLICY inventory only; contract definition stays with Doc-4D/Doc-5D |

---

## §5 — Conformance Self-Check

| Check | Result |
|---|---|
| Satisfies Doc-4A §18.2 (referenced key registered in §12.2) | PASS — `marketplace.public_read_rate_limit` registered |
| No key invented in a Doc-4/Doc-5/FE document (anti-invention) | PASS — Doc-4D v1.0.3 / Doc-5D v1.0.1 reference the key by name only; no value or mechanism carried there |
| Additive only; no existing key/semantic touched | PASS |
| Registered key is POLICY; firewall preserved | PASS |
| No operational default number committed by this registration | PASS — Default field defers to the platform's authorized configuration process |
| Consumer adoption is explicit, not automatic | PASS — Purpose column names adopting endpoints only |
| No enforcement mechanism, algorithm, HTTP behavior, or status code prescribed | PASS |
| No API contract created by this registration | PASS |
| Registration style consistent with existing §12.2 | PASS (domain-row extension + detailed table, matching v1.2/v1.10 convention) |

---

*Doc-3 POLICY Key Registration Patch v1.11 — additive §12.2 registration of 1 Module 2
`marketplace.*` throughput-control key (`marketplace.public_read_rate_limit`), realizing
instrument E-2 of the `ESC-7-API-PRODDETAIL` resolution (`R-ESC7-PRODDETAIL-FREEZE` Annex E
Decision #6). No semantic, routing, trust, procurement, ownership, enforcement, or API-contract
change. Status: DRAFT — pending human owner approval.*
