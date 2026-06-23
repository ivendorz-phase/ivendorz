# Doc-4I_Structure_Patch_v1.0 — Corrective Structure Patch (Module-7 Billing / Monetization)

| Field | Value |
|---|---|
| Document | Doc-4I_Structure_Patch_v1.0 — corrective structure patch for `Doc-4I_Structure_Proposal_v0.1` |
| Nature | **Structure patch only.** Resolves the accepted Architecture-Board findings **F4I-MA1 (MAJOR)** and **F4I-MA2 (MAJOR)**; **F4I-N1 (NITPICK)** addressed (optional, included). **Not a redesign, not a structure rewrite, not a content pass, not a freeze audit, not a hard review.** |
| Applies to | `Doc-4I_Structure_Proposal_v0.1.md` |
| Finding source | `Doc-4I_Structure_Independent_Hard_Review_v1.0` (Open BLOCKER = 0 · MAJOR = 2 · MINOR = 0 · NITPICK = 1) |
| Board-approved patch scope | **§I4, §I8, §I11 only** (plus §I3 + §I17 parentheticals for optional F4I-N1). No other section changed. |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs; on conflict **FLAG-AND-HALT** |
| Preserved unchanged (frozen at patch) | module identity, `billing` schema, `billing_` namespace, BC inventory (BC-BILL-1…6), aggregate inventory (7), ownership matrix, monetization authority matrix, procurement moat, trust firewall, produced events (`SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired`), escalation-marker inventory (`[ESC-BILL-AUDIT]`/`[ESC-BILL-POLICY]`/`[ESC-BILL-SLUG]`/`[ESC-BILL-EVENT]`), dependency-marker inventory (DF-BILL-1…8) |

---

## 1. Executive Summary

This patch closes the two accepted MAJOR structural-determinism findings on `Doc-4I_Structure_Proposal_v0.1`, plus the optional NITPICK, by editing only §I4, §I8, and §I11 (and the §I3/§I17 BC-BILL-1 parentheticals for F4I-N1).

**F4I-MA1** — the intra-module **BC-BILL-2 → BC-BILL-3 entitlement-read seam** is made structurally explicit: BC-BILL-2 (Subscriptions) is the entitlement-resolution authority; BC-BILL-3 (Usage & Quota) reads entitlement truth from BC-BILL-2 by an **intra-module entitlement-resolution read at enforcement time** (BC-BILL-2 is the sole source; BC-BILL-3 holds no entitlement copy and resolves no entitlement itself), with the exact read-binding (synchronous resolution vs. refreshed read-model — note the frozen Doc-2 §8 "subscription events → entitlement cache refresh" pattern) carried as **`[ESC-BILL-POLICY]`** for Pass-A. No new aggregate, BC, event, or ownership is created; the seam is a within-module read from the existing entitlement authority.

**F4I-MA2** — the two consumption signals lacking a named Doc-2 §8 anchor are **bound to `[ESC-BILL-EVENT]`** with rationale: Doc-2 §8 enumerates **no** Operations lead-access emission event and **no** Marketplace advertising/microsite-purchase emission event (`lead_access` and `ad_launch` are `usage_ledger.source` labels — Doc-2 §10.8 — not §8 events). The third signal, `QuotationSubmitted` (RFQ → usage ledger), **is** a named Doc-2 §8 event and stays named. No event name, ownership, or contract is invented.

**F4I-N1** — §I3 and §I17 gain a parenthetical noting BC-BILL-1 holds two aggregates (Plan + Entitlement), consistent with the authoritative §I5 inventory. No ownership or inventory change.

**Patch Impact:** Ownership Changes = NONE · BC Changes = NONE · Aggregate Changes = NONE · Event Ownership Changes = NONE · Procurement Moat Impact = NONE · Trust Firewall Impact = NONE (full statement in §6).

---

## 2. Patched Text

### Patch P1 — §I4 BC-BILL-3 responsibilities (F4I-MA1) — entitlement-read seam

**Original (§I4, BC-BILL-3 Usage & Quota bullet)**

```
  - **BC-BILL-3 Usage & Quota** — *purpose:* meter quota consumption and enforce entitlement-bounded quotas; *ownership:* `usage_ledger` (append-only); *services:* usage recording (`quota_key`, `amount`, `period`, `source` ∈ rfq_response/lead_access/ad_launch), **attribution always to the Controlling Organization** (regardless of acting representative), quota-balance read, entitlement-bounded enforcement; *dependencies:* Identity (Controlling-Org resolution — DH-BILL-1), RFQ (`QuotationSubmitted` quotation-response metering — DH-BILL-3), Operations (lead-access metering — DH-BILL-4), Marketplace (advertising/microsite metering — DH-BILL-2), Platform Core (POLICY, audit — DH-BILL-8). **Records and enforces usage; a quota gate is an entitlement check, never a routing/eligibility decision (moat).**
```

**Replacement**

```
  - **BC-BILL-3 Usage & Quota** — *purpose:* meter quota consumption and enforce entitlement-bounded quotas; *ownership:* `usage_ledger` (append-only); *services:* usage recording (`quota_key`, `amount`, `period`, `source` ∈ rfq_response/lead_access/ad_launch), **attribution always to the Controlling Organization** (regardless of acting representative), quota-balance read, entitlement-bounded enforcement; *entitlement-read seam (F4I-MA1; intra-module, no new ownership):* **BC-BILL-2 (Subscriptions) is the sole entitlement-resolution authority** (entitlement truth resolves from the `active` subscription + the BC-BILL-1 plan→entitlement bundle; Basic profile otherwise — A-11). **BC-BILL-3 reads entitlement truth from BC-BILL-2 by an intra-module entitlement-resolution read at enforcement time** — BC-BILL-3 **holds no entitlement copy, owns no entitlement, and resolves no entitlement itself**; it consumes BC-BILL-2's resolved entitlement to bound the quota gate. The exact read-binding (a synchronous entitlement-resolution read vs. a refreshed read-model — cf. the frozen Doc-2 §8 "subscription events → entitlement cache refresh" pattern) is **carried as `[ESC-BILL-POLICY]` (enforcement-read binding TBD at Pass-A; no projection/snapshot/service contract inferred here)**; *dependencies:* **BC-BILL-2 (entitlement-resolution authority — intra-module read seam, F4I-MA1)**, Identity (Controlling-Org resolution — DF-BILL-1), RFQ (`QuotationSubmitted` quotation-response metering — DF-BILL-3), Operations (lead-access metering — DF-BILL-4), Marketplace (advertising/microsite metering — DF-BILL-2), Platform Core (POLICY, audit — DF-BILL-8). **Records and enforces usage; a quota gate is an entitlement check, never a routing/eligibility decision (moat).**
```

*(Note: the replacement also corrects the original bullet's `DH-BILL-*` typos to the document-canonical `DF-BILL-*`; consistency-only, no marker added or removed.)*

---

### Patch P2 — §I8 DF-BILL-2 / DF-BILL-3 / DF-BILL-4 (F4I-MA2) — signal anchoring; and the intra-module seam note (F4I-MA1)

**Original (§I8, DF-BILL-2 bullet)**

```
  - **DF-BILL-2 — Marketplace boundary.** Marketplace (Doc-4D, FROZEN) drives **advertising/microsite** purchases (the `usage_ledger.source=ad_launch` metering input; platform-invoice purpose advertising/microsite). Billing **consumes** the metered-action signal for usage/invoicing; references vendor/profile context by UUID; owns no vendor data. **Channel:** consume (metering input). **Direction:** consume.
```

**Replacement**

```
  - **DF-BILL-2 — Marketplace boundary.** Marketplace (Doc-4D, FROZEN) drives **advertising/microsite** purchases (the `usage_ledger.source=ad_launch` metering input — Doc-2 §10.8; platform-invoice purpose advertising/microsite). **Event anchor (F4I-MA2): Doc-2 §8 enumerates NO Marketplace advertising/microsite-purchase emission event** — `ad_launch` is a `usage_ledger.source` label (Doc-2 §10.8), not a §8 event; the Marketplace §8 catalog (`VendorClaimed`/`VendorSuspended`/`VendorTierChanged[declared]`/`Profile*`/`MicrositePublished`/`MicrositeDomainChanged`/`VendorOwnershipTransferred`) contains no advertising/microsite-billing trigger. This consumption seam is therefore **carried as `[ESC-BILL-EVENT]`** (advertising/microsite metering-trigger event contract TBD — verify against Doc-2 §8 at content pass; **no event name, ownership, or contract invented**). Billing **consumes** the metered-action signal for usage/invoicing; references vendor/profile context by UUID; owns no vendor data. **Channel:** consume (metering input — `[ESC-BILL-EVENT]`). **Direction:** consume.
```

**Original (§I8, DF-BILL-3 bullet)**

```
  - **DF-BILL-3 — RFQ boundary (a moat seam).** RFQ (Doc-4E, FROZEN) emits `QuotationSubmitted` — the quotation-response metering input (`usage_ledger.source=rfq_response`; Doc-2 §8 "QuotationSubmitted → … usage ledger"). Billing **consumes** it as a metering input and **records usage / enforces quota**; it makes **no procurement, matching, routing, or award decision** and **the quota gate never alters routing/eligibility** (moat). **Channel:** consume event (metering input); no RFQ decision. **Direction:** consume.
```

**Replacement**

```
  - **DF-BILL-3 — RFQ boundary (a moat seam).** RFQ (Doc-4E, FROZEN) emits **`QuotationSubmitted`** — a **named Doc-2 §8 event** and the quotation-response metering input (`usage_ledger.source=rfq_response`; Doc-2 §8 primary-consumer mapping "QuotationSubmitted → … usage ledger"). **Event anchor (F4I-MA2): bound to the named Doc-2 §8 event `QuotationSubmitted` (no escalation required — the anchor is verified in the frozen catalog).** Billing **consumes** it as a metering input and **records usage / enforces quota**; it makes **no procurement, matching, routing, or award decision** and **the quota gate never alters routing/eligibility** (moat). **Channel:** consume event `QuotationSubmitted` (metering input); no RFQ decision. **Direction:** consume.
```

**Original (§I8, DF-BILL-4 bullet)**

```
  - **DF-BILL-4 — Operations boundary.** Operations (Doc-4F, FROZEN) drives **lead access** (the `usage_ledger.source=lead_access` metering input; `VendorInvited`→vendor_leads in Operations). Billing **consumes** the lead-access signal for usage/lead-credit/invoicing; owns no Operations entity; **`operations.trade_invoices` stays Operations' (≠ platform invoice, FIXED).** **Channel:** consume (metering input). **Direction:** consume.
```

**Replacement**

```
  - **DF-BILL-4 — Operations boundary.** Operations (Doc-4F, FROZEN) drives **lead access** (the `usage_ledger.source=lead_access` metering input — Doc-2 §10.8; lead context originates from `VendorInvited`→vendor_leads in Operations). **Event anchor (F4I-MA2): Doc-2 §8 enumerates NO Operations lead-access emission event** — `lead_access` is a `usage_ledger.source` label (Doc-2 §10.8), not a §8 event; the Operations §8 catalog (`DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`) contains no lead-access metering trigger (and `VendorInvited` is RFQ-owned, consumed for vendor_leads creation — not a billing event). This consumption seam is therefore **carried as `[ESC-BILL-EVENT]`** (lead-access metering-trigger event contract TBD — verify against Doc-2 §8 at content pass; **no event name, ownership, or contract invented**). Billing **consumes** the lead-access signal for usage/lead-credit/invoicing; owns no Operations entity; **`operations.trade_invoices` stays Operations' (≠ platform invoice, FIXED).** **Channel:** consume (metering input — `[ESC-BILL-EVENT]`). **Direction:** consume.
```

---

### Patch P3 — §I11 Event Consumption Map (F4I-MA1 + F4I-MA2)

**Original (§I11, the three signal bullets + the closing structure-level note)**

```
  - **`QuotationSubmitted`** (producer: RFQ / Doc-4E) → **BC-BILL-3 Usage & Quota** records quotation-response usage (`usage_ledger.source=rfq_response`; Doc-2 §8 "QuotationSubmitted → … usage ledger"). Idempotent consumer (Doc-4A §16); Billing owns only the usage effect (single-authorship).
  - **Lead-access signal** (producer: Operations / Doc-4F; lead access on `vendor_leads`) → **BC-BILL-3** (and **BC-BILL-4** lead-credit movement) records lead-access usage (`usage_ledger.source=lead_access`). Ownership direction: Operations owns the lead-access action; Billing owns the usage/credit effect.
  - **Advertising / microsite launch signal** (producer: Marketplace / Doc-4D) → **BC-BILL-3** records ad/microsite usage (`usage_ledger.source=ad_launch`) and **BC-BILL-5** issues the platform invoice (purpose advertising/microsite). Marketplace owns the launch action; Billing owns the usage/invoice effect.
  - **Identity Controlling-Org resolution** (Doc-4C / DF-BILL-1) — consumed read-only to anchor usage attribution; not a §8 event.
```

**Replacement**

```
  - **`QuotationSubmitted`** (producer: RFQ / Doc-4E) → **BC-BILL-3 Usage & Quota** records quotation-response usage (`usage_ledger.source=rfq_response`; Doc-2 §8 "QuotationSubmitted → … usage ledger"). **Event anchor (F4I-MA2): named Doc-2 §8 event `QuotationSubmitted` (verified in catalog; no escalation).** Idempotent consumer (Doc-4A §16); Billing owns only the usage effect (single-authorship).
  - **Lead-access signal** (producer: Operations / Doc-4F; lead access on `vendor_leads`) → **BC-BILL-3** (and **BC-BILL-4** lead-credit movement) records lead-access usage (`usage_ledger.source=lead_access`). **Event anchor (F4I-MA2): NO named Doc-2 §8 lead-access emission event exists → carried as `[ESC-BILL-EVENT]`** (metering-trigger event contract TBD — verify Doc-2 §8 at content pass; no event invented). Ownership direction: Operations owns the lead-access action; Billing owns the usage/credit effect.
  - **Advertising / microsite launch signal** (producer: Marketplace / Doc-4D) → **BC-BILL-3** records ad/microsite usage (`usage_ledger.source=ad_launch`) and **BC-BILL-5** issues the platform invoice (purpose advertising/microsite). **Event anchor (F4I-MA2): NO named Doc-2 §8 advertising/microsite-purchase emission event exists → carried as `[ESC-BILL-EVENT]`** (metering-trigger event contract TBD — verify Doc-2 §8 at content pass; no event invented). Marketplace owns the launch action; Billing owns the usage/invoice effect.
  - **Intra-module entitlement-read seam (F4I-MA1)** — **BC-BILL-2 (Subscriptions, entitlement-resolution authority) → BC-BILL-3 (Usage & Quota)**: BC-BILL-3 reads resolved entitlement truth from BC-BILL-2 at enforcement time to bound the quota gate (intra-module read; BC-BILL-3 owns/copies/resolves no entitlement). This is a **within-module read seam, not a Doc-2 §8 event** (no cross-module event; no event ownership created); the exact read-binding is carried as **`[ESC-BILL-POLICY]`** (enforcement-read binding TBD at Pass-A). 
  - **Identity Controlling-Org resolution** (Doc-4C / DF-BILL-1) — consumed read-only to anchor usage attribution; not a §8 event.
```

---

### Patch P4 — §I3 + §I17 BC-BILL-1 parenthetical (optional F4I-N1)

**Original (§I3, BC-BILL-1 landscape bullet)**

```
  - **BC-BILL-1 — Plans & Entitlements** (Plan + Entitlement aggregates): the platform-owned commercial **Plan** catalog (`plans` + `plan_entitlements`) and the **Entitlement** slug catalog (`entitlements`; boolean/numeric/enum) — the entitlement bundle definitions.
```

**Replacement**

```
  - **BC-BILL-1 — Plans & Entitlements** (**2 aggregates: Plan + Entitlement** — consistent with the §I5 inventory): the platform-owned commercial **Plan** catalog (`plans` + `plan_entitlements`) and the **Entitlement** slug catalog (`entitlements`; boolean/numeric/enum) — the entitlement bundle definitions.
```

**Original (§I17, Structure Summary — BC enumeration clause)**

```
Module 7 — Billing / Monetization (`billing` schema, `billing_` namespace) decomposes into **6 bounded contexts** (BC-BILL-1 Plans & Entitlements · BC-BILL-2 Subscriptions · BC-BILL-3 Usage & Quota · BC-BILL-4 Lead Credits · BC-BILL-5 Platform Invoicing & Payments · BC-BILL-6 Rewards & Referrals) owning **7 aggregates** (Doc-2 §2, Module 7 — Plan, Entitlement, Subscription, Usage Ledger, Lead Credit Account, Platform Invoice, Reward Account), each aggregate in exactly one context (Plan + Entitlement co-located in BC-BILL-1 as the catalog context; no aggregate split).
```

**Replacement**

```
Module 7 — Billing / Monetization (`billing` schema, `billing_` namespace) decomposes into **6 bounded contexts** (BC-BILL-1 Plans & Entitlements **(2 aggregates: Plan + Entitlement)** · BC-BILL-2 Subscriptions · BC-BILL-3 Usage & Quota · BC-BILL-4 Lead Credits · BC-BILL-5 Platform Invoicing & Payments · BC-BILL-6 Rewards & Referrals) owning **7 aggregates** (Doc-2 §2, Module 7 — Plan, Entitlement, Subscription, Usage Ledger, Lead Credit Account, Platform Invoice, Reward Account), each aggregate in exactly one context (Plan + Entitlement co-located in BC-BILL-1 as the catalog context; no aggregate split).
```

---

## 3. F4I-MA1 Resolution

**Finding (accepted).** §I4 names BC-BILL-2 the "entitlement resolution source of truth" and BC-BILL-3 the "entitlement-bounded quota enforcement," but the structure did not define the seam by which BC-BILL-3 obtains entitlement truth from BC-BILL-2 — leaving Pass-A authors to infer a service call / projection / snapshot / read model without authority.

**Resolution (Patch P1 §I4 + P2/P3 §I8/§I11).** The seam is now **structurally defined and bounded**, using approved governance mechanisms and creating no new ownership:

1. **Authority fixed:** **BC-BILL-2 (Subscriptions) is the sole entitlement-resolution authority** — entitlement truth resolves from the `active` subscription + the BC-BILL-1 plan→entitlement bundle (Basic profile otherwise, A-11). This restates existing §I4 ownership; it transfers nothing.
2. **Read direction fixed:** **BC-BILL-3 reads entitlement truth from BC-BILL-2 by an intra-module entitlement-resolution read at enforcement time.** BC-BILL-3 **holds no entitlement copy, owns no entitlement, resolves no entitlement** — it consumes BC-BILL-2's resolved result to bound the quota gate. The seam is explicitly an **intra-module read**, not a cross-module event and not a new dependency marker.
3. **Mechanism escalated (not invented):** the exact read-binding — synchronous entitlement-resolution read vs. a refreshed read-model (the frozen Doc-2 §8 "subscription events → entitlement cache refresh" pattern is noted as the corpus precedent, not adopted as a contract) — is **carried as `[ESC-BILL-POLICY]`** with "enforcement-read binding TBD at Pass-A." No projection, snapshot, or service contract is asserted at structure depth.

This satisfies the Required Resolution: the seam is **defined** (authority + direction) and the residual mechanism choice is **escalated** via an approved marker — delivering structural determinism for Pass-A authors without creating aggregate, BC, or event ownership.

---

## 4. F4I-MA2 Resolution

**Finding (accepted).** §I11 / §I8 carried the **lead-access** (Operations) and **advertising/microsite** (Marketplace) consumption signals identified only by `usage_ledger.source` values, without anchoring them to a verified Doc-2 §8 event or to `[ESC-BILL-EVENT]` — ambiguous for BC-BILL-3 / BC-BILL-4 / BC-BILL-5 contract authors.

**Resolution (Patch P2 §I8 + P3 §I11).** Each signal is now explicitly anchored. The frozen Doc-2 §8 catalog was checked directly:

| Consumption signal | Producer | Named Doc-2 §8 event? | Anchor (this patch) |
|---|---|---|---|
| Quotation-response metering (`source=rfq_response`) | RFQ (Doc-4E) | **Yes — `QuotationSubmitted`** (Doc-2 §8; primary consumer "→ usage ledger") | **Bound to the named Doc-2 §8 event `QuotationSubmitted`** (no escalation) |
| Lead-access metering (`source=lead_access`) | Operations (Doc-4F) | **No** — Operations §8 = `DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`; `lead_access` is a `usage_ledger.source` label (Doc-2 §10.8), not a §8 event (`VendorInvited` is RFQ-owned) | **Bound to `[ESC-BILL-EVENT]`** (metering-trigger event contract TBD — verify Doc-2 §8 at content pass) |
| Advertising/microsite metering (`source=ad_launch`) | Marketplace (Doc-4D) | **No** — Marketplace §8 = `VendorClaimed`/`VendorSuspended`/`VendorTierChanged[declared]`/`Profile*`/`MicrositePublished`/`MicrositeDomainChanged`/`VendorOwnershipTransferred`; none is an advertising/microsite-billing trigger; `ad_launch` is a `usage_ledger.source` label (Doc-2 §10.8) | **Bound to `[ESC-BILL-EVENT]`** (metering-trigger event contract TBD — verify Doc-2 §8 at content pass) |

**Rationale.** Where a named Doc-2 §8 event exists (`QuotationSubmitted`), the signal is bound to it. Where Doc-2 §8 enumerates **no** corresponding emission event (lead-access, advertising/microsite), the only corpus-faithful action is to **carry `[ESC-BILL-EVENT]`** — the structure document now communicates the open seam explicitly rather than deferring silently. **No event name, no event ownership, and no event contract is invented**; `lead_access`/`ad_launch` remain Doc-2 §10.8 `usage_ledger.source` labels.

---

## 5. Optional F4I-N1 Resolution (included)

**Finding (NITPICK).** §I3 and §I17 describe BC-BILL-1 without noting it holds two aggregates (Plan + Entitlement); §I5 already enumerates both correctly. A first-pass reader of §I3/§I17 alone could infer one-to-one BC↔aggregate across the module.

**Resolution (Patch P4).** A parenthetical "**(2 aggregates: Plan + Entitlement)**" is added to the BC-BILL-1 entries in §I3 and §I17, consistent with the authoritative §I5 inventory. **The aggregate inventory (§I5) and the ownership matrix (§I9) are not modified** — this is a readability clarification only; ownership is unchanged.

---

## 6. Patch Impact Assessment

```text
Ownership Changes          = NONE
BC Changes                 = NONE
Aggregate Changes          = NONE
Event Ownership Changes     = NONE
Procurement Moat Impact     = NONE
Trust Firewall Impact       = NONE
```

**Detail (governance confirmation).**

- **Ownership / BC / Aggregate = NONE.** No aggregate added, removed, split, or reassigned (7 aggregates, 6 BCs unchanged); the F4I-MA1 seam is an **intra-module read** from the existing BC-BILL-2 entitlement authority — BC-BILL-3 gains no ownership; F4I-N1 is a parenthetical only (§I5/§I9 untouched).
- **Event Ownership = NONE.** No event created, renamed, or re-owned. `QuotationSubmitted` remains RFQ-owned (consumed by Billing). The lead-access and advertising/microsite seams are bound to `[ESC-BILL-EVENT]` (a permitted carried marker — no event coined). Billing's produced events (`SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired`, BC-BILL-2) are unchanged.
- **Procurement Moat Impact = NONE.** The patch reasserts that a quota gate is an entitlement check that **never alters routing/eligibility** (§I4 P1) and adds no plan/entitlement/quota/credit influence over Trust/Verification/Eligibility/Routing/Matching/Ranking/Supplier-selection/Award. The moat is preserved without exception.
- **Trust Firewall Impact = NONE.** No score is computed, owned, read, or modified; the entitlement-read seam touches no Trust/Verification/Performance/Governance score. The firewall is preserved without exception.
- **Escalation markers.** Only permitted markers used: `[ESC-BILL-POLICY]` (F4I-MA1 read-binding), `[ESC-BILL-EVENT]` (F4I-MA2 lead-access + advertising/microsite). No new marker invented; no marker resolved without authority. The §I14 escalation-marker **inventory** (the four `[ESC-BILL-*]`) is unchanged — these markers were already inventoried; the patch binds two of them to specific seams.
- **Sections changed:** §I4, §I8, §I11 (board-approved scope) + §I3, §I17 (optional F4I-N1 parentheticals). All frozen sections (module identity, schema, namespace, BC inventory, aggregate inventory, ownership matrix, authority matrix, moat, firewall, produced events, escalation-marker inventory, dependency-marker inventory) remain unchanged.

---

*End of Doc-4I_Structure_Patch_v1.0. Structure patch only — resolves F4I-MA1 (BC-BILL-2 → BC-BILL-3 entitlement-read seam: defined intra-module + `[ESC-BILL-POLICY]` for the read-binding) and F4I-MA2 (lead-access + advertising/microsite signals → `[ESC-BILL-EVENT]`; `QuotationSubmitted` → named Doc-2 §8 event), with optional F4I-N1 (BC-BILL-1 two-aggregate parenthetical) addressed. Scope: §I4, §I8, §I11 (+ §I3/§I17 for F4I-N1). No redesign, no structure rewrite, no Pass-A content. Ownership/BC/Aggregate/Event-Ownership/Moat/Firewall impact = NONE. No entity, event, slug, audit action, POLICY key, or ownership invented; only permitted markers `[ESC-BILL-POLICY]`/`[ESC-BILL-EVENT]` bound. Authorized next stage: Doc-4I_Structure_Freeze_Audit_v1.0.*
