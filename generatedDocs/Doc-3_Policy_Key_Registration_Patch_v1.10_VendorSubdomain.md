# Doc-3 — POLICY Key Registration Patch v1.10 (Module 2 Vendor-Subdomain Reserved Labels)

| Field | Value |
|---|---|
| Patch ID | Doc-3-Policy-Key-Registration-Patch-v1.10-VendorSubdomain |
| Applies To | `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` — §12.2 POLICY key inventory, `marketplace.*` domain (additive key only) |
| Patch Authority | Owner (human Architecture Board) ruling 2026-07-03 (**Final Architecture Board Resolution: APPROVED**); realizes **ADR-024** (Canonical Vendor Subdomain URLs); resolves the reserved-label leg of `[ESC-MKT-CANONICAL-URL]` |
| Patch Type | **Additive registration only** — registers one `marketplace.*` POLICY key referenced by the Doc-2 v1.0.5 Vendor Slug law (PATCH-D2-04 D2-04.2). No validation-semantic, routing, trust, procurement, or ownership change. No existing key modified or removed. |
| Sole Purpose | Satisfy **Doc-4A §18.2** ("a POLICY key MUST exist in Doc-3 §12.2") for the reserved-subdomain-label list the Vendor Slug law consumes at issuance/migration time. |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md (+ ADR-024 carried alongside), Doc-2 v1.0.5, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4D v1.0 (+ CanonicalHost patch v1.0.2), Doc-6D v1.0 (+ VendorSlugSubdomain patch v1.0.1) |
| Linked Document | `Doc-2_Patch_v1.0.5.md` (PATCH-D2-04 — the consuming law); `Doc-4D_CanonicalHost_Patch_v1.0.2.md`; `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1.md` (app-layer-enforcement note); decision record `governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md`. Precedent: `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace.md` (the `marketplace.*` domain registration). |
| Status | **APPROVED — additive Doc-3 §12.2 registration** (human owner/Board ruling 2026-07-03; artifact text gate-confirmed same day) |

---

## §1 — Patch Authority

The Canonical Vendor Subdomain rule (ADR-024; Doc-2 v1.0.5 PATCH-D2-04) blocks **reserved DNS labels** from
ever being issued as Vendor Slugs — reserved labels are **platform-owned namespaces, never issuable to
vendors**. The label list is operational platform-namespace governance: it must grow as the platform adds
services (e.g. a future `status` page or `developer` portal) **without** a corpus change or deploy. Per
Doc-4A §18.2, a referenced POLICY key MUST exist in Doc-3 §12.2; per the anti-invention rule, neither Doc-2
nor any FE document may carry the list as a literal.

This patch registers exactly that one key, and only that key, as an additive entry in the existing Doc-3
§12.2 `marketplace.*` domain (registered by `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace`).

**This patch does NOT:** invent any procurement, routing, matching, fairness, capacity, distribution,
scoring, quotation, or evaluation rule; remove or rename any existing key; modify any validation semantic,
gate, threshold, or state machine; change Doc-3 ownership or any module boundary; alter the
FIXED/POLICY/ORG trichotomy (Doc-3 §12.1/§12.3); change the Vendor Slug **format law** (that is **FIXED**,
owned by Doc-2 v1.0.5 D2-04.2 — only the reserved-label *list* is POLICY). The key governs **slug
issuance/migration validation only** — it feeds no routing, matching, trust, verification, eligibility,
fairness, confidence, or governance signal, and carries no payment/plan/entitlement coupling (R7 firewall
preserved by construction).

---

## §2 — Scope Statement

This patch adds one key to the existing `marketplace.*` domain in the Doc-3 §12.2 POLICY key inventory:

| Action | Detail |
|---|---|
| Add domain | **None** — extends the existing `Marketplace API Realization (Module 2)` domain row |
| Register keys | 1 key (`marketplace.reserved_subdomain_labels`) — platform-namespace governance |
| Modify existing keys | **None** |
| Modify semantics/routing/trust/procurement/ownership | **None** |

No other section of Doc-3 is touched. All existing §12.2 domains and keys are unchanged. This patch is
additive to, and independent of, `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace` (disjoint keys) and
every other v1.x registration.

---

## §3 — Additive Registration Block (Doc-3 §12.2, `marketplace.*` domain)

**Append the following key to the `Marketplace API Realization (Module 2)` domain row** (consistent with
the existing domain→keys style; the row is extended, not replaced):

```
…, marketplace.idempotency_dedup_window, marketplace.list_page_size_max, marketplace.reserved_subdomain_labels
```

**Detailed key registration** (start values bracketed per the existing §12.2 `[start: …]` convention,
tunable by ops):

| Key (`marketplace` domain) | Category | Value type | Owner | Purpose | Mutability |
|---|---|---|---|---|---|
| `marketplace.reserved_subdomain_labels` | Platform-Namespace Governance | string list | Doc-3 inventory; Module 2 behavioral consumer (Vendor Slug issuance/migration validation — Doc-2 v1.0.5 D2-04.2) | DNS labels that are **platform-owned namespaces, never issuable as Vendor Slugs**. Checked at slug issuance and M8-mediated migration only; **never retroactive** — an active Vendor Slug is never stripped by a list change (Invariant 8 grandfathering, Doc-2 v1.0.5 D2-04.2). *[start: www, www2, admin, api, app, root, system, support, blog, mail, cdn, static, assets, files, media, img, images, upload, uploads, search, jobs, careers, help, docs, status, dev, staging, test, m, shop, store, account, auth, login, signup, billing, pay, email, smtp, ftp, ns1, ns2, ivendorz, platform, dashboard, ai, api-docs, developer, developers, console, gateway, edge, monitor, metrics]* | POLICY |

- **Mutability:** POLICY — platform-operator tunable without deploy; every change is admin-permissioned and
  audited (Doc-3 §12.4; Doc-2 §9 "system_configuration change"). Not FIXED (the list grows with the
  platform); not ORG (platform-wide, never per-tenant).
- **Grandfathering (binding):** the key applies at **issuance/migration time only**. Adding a label to the
  list never invalidates, strips, or migrates an already-active Vendor Slug (Invariant 8: identifiers never
  change). Removing a label re-opens it for future issuance only.
- **Firewall:** this key tunes platform-namespace availability for slug issuance only. It **MUST NOT**
  influence routing fairness, matching confidence, eligibility, trust, verification, capacity,
  distribution, or any governance signal (Doc-3 §12.1 FIXED; Doc-4A §18.3, §4B) — and by construction it
  does not. No payment/plan/entitlement input (R7 firewall preserved).
- **Start values** are the initial operational reserved set (Architecture §17.3: "configuration holds the
  numbers"), tunable by ops within this registration; they introduce no behavioral marketplace rule.

---

## §4 — Non-Impact Confirmation

| Aspect | Effect |
|---|---|
| Existing §12.2 keys (all domains) | Unchanged — none modified, renamed, or removed |
| `marketplace.*` API-realization keys (v1.2) | Unchanged — one key appended to the domain row only |
| Vendor Slug **format law** (regex/length/ASCII) | Unchanged by this key — FIXED, owned by Doc-2 v1.0.5 D2-04.2 |
| Procurement / routing / matching / fairness / capacity / scoring logic | Unchanged |
| State machines (Doc-4M) | Unchanged |
| FIXED/POLICY/ORG trichotomy (§12.1/§12.3) | Unchanged — the new key is POLICY |
| Governance-signal firewall (R7; §12.1) | Unchanged — no signal/payment/plan coupling |
| Doc-3 ownership / module boundaries | Unchanged — Doc-3 owns the POLICY inventory; Module 2 is the consuming/behavioral owner; Module 8 governs change oversight (D-4) |
| Prior registrations v1.0–v1.9 | Unchanged — disjoint keys; independent patches |

---

## §5 — Conformance Self-Check

| Check | Result |
|---|---|
| Satisfies Doc-4A §18.2 (referenced key registered in §12.2) | PASS — `marketplace.reserved_subdomain_labels` registered |
| No key invented in a Doc-5/Doc-7/FE document (anti-invention) | PASS — Doc-2 v1.0.5 D2-04.2 references the key by name; the list literal lives only in this registration |
| Additive only; no existing key/semantic touched | PASS |
| Registered key is POLICY; firewall preserved | PASS |
| Grandfathering (never-retroactive) recorded as binding | PASS — Invariant 8 alignment |
| Registration style consistent with existing §12.2 | PASS (domain-row extension + detailed table + `[start: …]`) |

---

*Doc-3 POLICY Key Registration Patch v1.10 — additive §12.2 registration of 1 Module 2 `marketplace.*`
platform-namespace key (`marketplace.reserved_subdomain_labels`, 54 start labels, grandfathered
never-retroactive). Realizes ADR-024 / Doc-2 v1.0.5 D2-04.2 (reserved-label leg of
`[ESC-MKT-CANONICAL-URL]`). No semantic, routing, trust, procurement, or ownership change. Status:
APPROVED (additive, human owner/Board, 2026-07-03).*
