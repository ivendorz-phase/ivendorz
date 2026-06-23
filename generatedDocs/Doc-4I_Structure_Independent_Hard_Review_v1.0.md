# Doc-4I_Structure_Independent_Hard_Review_v1.0 — Architecture Board Independent Hard Review (Module 7 — Billing / Monetization)

| Field | Value |
|---|---|
| Document | Doc-4I_Structure_Independent_Hard_Review_v1.0 — Independent Architecture Board Hard Review |
| Document Under Review | `Doc-4I_Structure_Proposal_v0.1` |
| Review Objective | Determine whether the proposed structure for Module 7 — Billing / Monetization is ready to proceed toward Structure Freeze without modification. This is a Defect Discovery Review. |
| Nature | Hard review. Not a patch review, not a consolidation review, not a freeze audit. |
| Authority (precedence) | Architecture/ADRs (FROZEN) · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A (FROZEN) · Doc-4B (FROZEN) · Doc-4C (FROZEN) · Doc-4D (FROZEN) · Doc-4E (FROZEN) · Doc-4F (FROZEN) · Doc-4G (FROZEN) · Doc-4H (FROZEN) · Doc-4I_Structure_Proposal_v0.1 (under review). On conflict: **FLAG-AND-HALT** (no conflict requiring halt encountered). |
| Review constraints | Review only. No redesign. No new BCs. No new aggregates. No reopening frozen decisions. No slug invented. No structural change. No ownership change. No lifecycle change. No event invented. |
| Severity vocabulary | BLOCKER · MAJOR · MINOR · NITPICK |

---

## Architecture Board — Independent Hard Review

### Executive Verdict — **PATCH REQUIRED**

Doc-4I_Structure_Proposal_v0.1 is coherent, well-bounded, and correctly preserves the procurement moat, Trust firewall, and Platform Invoice integrity at the structural level. All six BCs, all seven aggregates, all three produced events, all four escalation markers, and all 15 required sections are present and correctly formed. Two MAJOR findings prevent advancement to Structure Freeze without amendment. One NITPICK is noted. No BLOCKER. No MINOR.

---

## Domain Determinations

**1. Module Identity Integrity — PASS.**

Doc-4I = Module 7, Billing/Monetization, `billing` schema, `billing_` namespace. The document header, §I1 Module Overview, §I4 Context Responsibilities, §I9 Ownership Matrix, and §I17 Structure Summary all state this consistently and without conflict. Verified against Doc-4A §1.3 family map (Doc-4I = Billing, Module 7) and Appendix B (`billing_` namespace). Doc-2 §0.3 fixes `billing` = Module 7. The corpus-authority chain is stated correctly in the document preamble. No identity conflict. No namespace conflict. No family-map conflict. ✓

**2. Bounded Context Integrity — PASS.**

Six BCs declared and individually assessed:

| BC | Responsibility | Aggregate(s) |
|---|---|---|
| BC-BILL-1 Plans & Entitlements | Platform plan catalog + entitlement bundle definitions | Plan, Entitlement |
| BC-BILL-2 Subscriptions | Per-org subscription lifecycle; entitlement resolution source of truth; Doc-2 §8 event producer | Subscription |
| BC-BILL-3 Usage & Quota | Metering and quota enforcement against entitlement-bounded limits | Usage Ledger |
| BC-BILL-4 Lead Credits | Lead-credit balance tracking and movement ledger | Lead Credit Account |
| BC-BILL-5 Platform Invoicing & Payments | Platform invoices and gateway payment records (`billing.platform_invoices ≠ operations.trade_invoices` FIXED) | Platform Invoice |
| BC-BILL-6 Rewards & Referrals | Reward points and referral lifecycle tracking | Reward Account |

No responsibility overlap between contexts. No monetization surface missing from the Doc-2 §2 Module-7 aggregate set — every defined aggregate is distributed to exactly one BC. BC-BILL-1 owns two aggregates (Plan and Entitlement); §I3 explicitly co-locates them as platform-owned catalog-level definitions with a shared commercial reason. The §I5 Aggregate Inventory correctly enumerates all seven aggregates. See NITPICK finding N1 below regarding §I3/§I17 presentation. ✓

**3. Aggregate Ownership Integrity — PASS.**

Seven aggregates, one owner BC each, no duplicate or shared ownership:

| Aggregate | Root table(s) | Owner BC | Uniqueness |
|---|---|---|---|
| Plan | `plans` + `plan_entitlements` | BC-BILL-1 | unique ✓ |
| Entitlement | `entitlements` | BC-BILL-1 | unique ✓ |
| Subscription | `subscriptions` + `subscription_events` | BC-BILL-2 | unique ✓ |
| Usage Ledger | `usage_ledger` (append-only) | BC-BILL-3 | unique ✓ |
| Lead Credit Account | `lead_credit_accounts` + `lead_credit_transactions` | BC-BILL-4 | unique ✓ |
| Platform Invoice | `platform_invoices` + `platform_payments` | BC-BILL-5 | unique ✓ |
| Reward Account | `reward_accounts` + `reward_transactions` + `referrals` | BC-BILL-6 | unique ✓ |

`operations.trade_invoices` explicitly excluded and listed in the §I9 NOT-owned set with a pointer to Doc-4F. No aggregate from another module claimed. No alias ownership. No hidden shared ownership. ✓

**4. DDD Boundary Integrity — PASS WITH MAJOR FINDINGS.**

The two MAJOR structural boundary gaps are identified here:

**(a) BC-BILL-2 ↔ BC-BILL-3 intra-module entitlement read mechanism (→ F4I-MA1).**

BC-BILL-3 enforces "entitlement-bounded quotas" — quota enforcement is structurally load-bearing on BC-BILL-2's entitlement resolution. §I4 states BC-BILL-2 is the "entitlement resolution source of truth" and BC-BILL-3 enforces "quota against entitlement-bounded limits." The mechanism by which BC-BILL-3 reads BC-BILL-2's entitlement truth is undefined at structure level: the document does not declare whether this is a synchronous service call, a read-model/projection, a cached snapshot, or an event-driven denormalization. Without this seam definition, content-pass authors for every BC-BILL-3 contract face an unresolved cross-context structural dependency — the enforcement function cannot be specified without knowing the read mechanism. This is an under-specification at structure depth. **→ F4I-MA1 (MAJOR).**

**(b) Lead-access and advertising/microsite consumption signals not anchored to named Doc-2 §8 events (→ F4I-MA2).**

§I11 Event Consumption Map and §I8 DF-BILL-2/DF-BILL-3/DF-BILL-4 carry three distinct consumption signals for BC-BILL-3 and BC-BILL-4: (1) `QuotationSubmitted` from RFQ/Doc-4E — correctly named as a specific Doc-2 §8 event ✓; (2) "lead-access signal" from Operations (→ BC-BILL-3 / BC-BILL-4); (3) "advertising/microsite launch signal" from Marketplace (→ BC-BILL-3 / BC-BILL-5). Signals (2) and (3) are identified only by `usage_ledger.source` values, with verification deferred to "confirmed at content authoring against Doc-2 §8/§10.8." A structure document must name or escalate every cross-module consumption seam to a verifiable Doc-2 §8 anchor or carry an explicit escalation marker. These two signals are load-bearing for BC-BILL-3 contract authors (quota gate cannot be specified without the triggering event contract) and for BC-BILL-4 (credit sourcing mechanism). The consumption mechanism is underspecified at structure depth. **→ F4I-MA2 (MAJOR).**

Apart from these two gaps: no boundary leakage across BCs, no ownership drift, no hidden aggregate ownership, no cross-context table ownership claimed. All cross-context references in §I4 and §I9 are correctly limited to UUID references (no cross-schema FK). ✓

**5. Procurement Moat Integrity — PASS.**

§I7 Monetization Authority Matrix explicitly states: "Billing MUST NEVER influence Trust, Verification, Eligibility, Routing fairness, or Matching confidence via any plan/entitlement/quota/credit (moat)." The influence boundary is explicitly bounded: "paid plans may influence only Visibility, Lead volume, Analytics, Advertising, and Microsite capabilities." DF-BILL-3 (§I8): "no quota gate alters routing/eligibility (moat)" is an explicit negative assertion. DF-BILL-5 is a firewall negative assertion (see Domain 6). §I16 AI-Agent Safety Notes repeats the moat boundary for implementers. No BC owns vendor discovery, matching, routing, ranking, quotation evaluation, supplier selection, or award decisions. No quota or credit mechanism is permitted to influence eligibility or matching confidence. Moat structurally intact. ✓

**6. Trust Firewall Integrity — PASS.**

DF-BILL-5 (§I8): "Billing computes/owns no score and no plan/entitlement/quota/credit may influence trust/verification/eligibility (firewall) — no reference, no coupling beyond the firewall negative-assertion." Affirmed independently in §I7, §I9 NOT-owned set, §I15 DF-BILL-5, and §I16. No Trust/Performance/Verification/Governance score is computed, owned, read, or modified by any BC in the module. No plan or entitlement seam approaches the Trust boundary. Firewall structurally intact. ✓

**7. Platform Invoice Integrity — PASS.**

`billing.platform_invoices ≠ operations.trade_invoices` is declared FIXED. This distinction appears in: the document preamble (FIXED notation), §I3 BC-BILL-5 reconciliation note, §I4 BC-BILL-5 responsibilities, §I5 Platform Invoice aggregate definition, §I8 DF-BILL-4 exclusion clause, §I9 NOT-owned set (pointer to Doc-4F), §I15 cross-module reference entry, and §I17 Structure Summary — eight independent locations. BC-BILL-5 scope statement: "platform invoices only; never trade invoices." The distinction is preserved without exception across the entire document. ✓

**8. Event Integrity — PASS.**

Three produced events: `SubscriptionPurchased`, `SubscriptionRenewed`, `SubscriptionExpired`. All three are: (a) authored by BC-BILL-2 only (single-authorship per Doc-4A §4.4); (b) enumerated in the Doc-2 §8 billing producer row (exactly these three, no more, no less); (c) listed under §I10 Event Production Map with BC-BILL-2 as sole producer; (d) reflected in DF-BILL-6 as the consumption seam for Communication fan-out. §I10 explicitly names Communication as the downstream consumer for notification dispatch — no gap analogous to prior structure reviews on this surface. `[ESC-BILL-EVENT]` carried for any future event addition. No event coined outside the Doc-2 §8 set. The single-authorship rule is correctly applied: producing module owns the event; downstream BCs own only the derivative effects. `QuotationSubmitted` is correctly identified in §I11 as a consumed (not produced) event. ✓

**9. Dependency Integrity — PASS.**

All eight dependencies assessed for direction, ownership preservation, and inversion:

| Marker | Counterpart | Direction | Assessment |
|---|---|---|---|
| DF-BILL-1 | Identity (Doc-4C) | Consume + read-model (`check_permission`, Controlling-Org resolution) | ✓ No ownership transfer |
| DF-BILL-2 | Marketplace (Doc-4G) | Consume (ad/microsite metering signal, UUID reference) | ✓ No procurement ownership claimed |
| DF-BILL-3 | RFQ (Doc-4E) | Consume (`QuotationSubmitted` for metering); explicit moat clause | ✓ No quota gate alters routing/eligibility |
| DF-BILL-4 | Operations (Doc-4F) | Consume (lead-access signal); `trade_invoices` excluded | ✓ No trade ownership claimed |
| DF-BILL-5 | Trust (Doc-4D) | Negative assertion — no coupling | ✓ Firewall preserved |
| DF-BILL-6 | Communication (Doc-4H) | Emit subscription events; Communication consumes fan-out | ✓ Single-authorship preserved |
| DF-BILL-7 | Admin (Doc-4J — not yet in corpus) | Carried pending Doc-4J; FLAG-AND-HALT if absent at content time | ✓ Correctly deferred |
| DF-BILL-8 | Platform Core (Doc-4B) | Consume (audit outbox, UUIDv7, POLICY, gateway infra) | ✓ Infrastructure direction correct |

No dependency inversion. No circular dependency. No cross-module ownership claimed in either direction. DF-BILL-7's pending state is correctly handled — the document does not invent a Doc-4J contract; it carries the dependency marker until the corpus provides it. ✓

**10. Escalation Marker Integrity — PASS.**

Four markers declared, defined in §I14 with scope, channel, and no-invention rule:

| Marker | Defined scope | §I14 binding | Assessment |
|---|---|---|---|
| `[ESC-BILL-AUDIT]` | Doc-2 §9 Financial/Organization domain lacks per-aggregate Billing coverage | usage/credit/reward mutations | ✓ Correctly scoped; no action invented |
| `[ESC-BILL-POLICY]` | Doc-3 §12.2 has no `billing.*`/`subscription.*`/`usage.*` POLICY namespace | dedup-window keys, quota-gate POLICY hooks | ✓ Correctly scoped; no key invented |
| `[ESC-BILL-SLUG]` | `can_view_billing` / `can_manage_billing` confirmed from Doc-2 §7; unknown slugs not invented | §I12 permission surface unknown slugs | ✓ Correctly scoped; no slug invented |
| `[ESC-BILL-EVENT]` | Three events confirmed from Doc-2 §8; future additions unverified | any future event addition | ✓ Correctly scoped; no event coined |

No marker invented outside the four. No marker applied to resolve a seam that should instead appear as a named structural element. No marker improperly resolved inline. Consistent with `[ESC-OPS-*]` / `[ESC-TRUST-*]` / `[ESC-COMM-*]` precedent across the corpus. ✓

**11. AI-Agent Readiness — MEDIUM (conditional).**

§I16 AI-Agent Safety Notes provides ownership boundaries, revenue/entitlement-only responsibilities, explicit ownership restrictions (no score, no trade invoice, no procurement decision), billing-governance rules, and moat/firewall restatements for implementers. For the surfaces that are fully specified, the document is deterministic and implementation-grade. However, AI-Agent Readiness is reduced by the two MAJOR findings:

- F4I-MA1: BC-BILL-3 quota enforcement contracts cannot be fully specified by a content-pass author without knowing the BC-BILL-2 entitlement read mechanism. The structural seam is a load-bearing ambiguity.
- F4I-MA2: BC-BILL-3 (metering gate) and BC-BILL-4 (credit sourcing) contracts cannot be fully specified without a named Doc-2 §8 event anchor or an explicit escalation for the lead-access and advertising/microsite signals.

Upon resolution of F4I-MA1 and F4I-MA2, AI-Agent Readiness would upgrade to HIGH. Current rating: **MEDIUM**.

**12. Structure Completeness — PASS.**

All 15 required sections verified:

| Required section | Present | §I reference |
|---|---|---|
| Module Charter | ✓ | §I1 |
| Business Objectives | ✓ | §I2 |
| BC Landscape | ✓ | §I3 |
| Context Responsibilities | ✓ | §I4 |
| Aggregate Inventory | ✓ | §I5 |
| Domain Services | ✓ | §I6 |
| Authority Matrix | ✓ | §I7 (Monetization Authority Matrix) |
| Dependency Map | ✓ | §I8 |
| Ownership Matrix | ✓ | §I9 |
| Event Maps | ✓ | §I10 (production) + §I11 (consumption) |
| Permission Surface | ✓ | §I12 |
| State Inventory | ✓ | §I13 |
| Escalation Inventory | ✓ | §I14 |
| AI-Agent Notes | ✓ | §I16 |
| Structure Summary | ✓ | §I17 |

§I15 (Cross-Module Reference Inventory) is a supplementary section beyond the 15-item required list — a useful addition, not a defect. All 15 required sections are present and populated. ✓

---

## Findings

### Governance Defects

**F4I-MA1 — MAJOR**
**Location:** §I4 (BC-BILL-3 Context Responsibilities), §I8 (no DF marker for intra-module BC-BILL-2 seam), §I11 (consumption map)
**Observation:** BC-BILL-3 enforces "entitlement-bounded quotas" — a structurally load-bearing dependency on BC-BILL-2's entitlement resolution. The mechanism by which BC-BILL-3 reads BC-BILL-2's entitlement truth (synchronous service call, read-model/projection, event-driven snapshot, or direct query) is undefined at structure depth. No intra-module seam definition appears in §I8 or §I15. Content-pass authors for all BC-BILL-3 enforcement contracts cannot specify the quota gate without this seam.
**Required action:** §I4 (BC-BILL-3) and/or §I8 must define or escalate the BC-BILL-2 ↔ BC-BILL-3 entitlement-read seam: either (a) name the mechanism (e.g., "BC-BILL-3 reads the Entitlement aggregate via a BC-BILL-2 read-model projection" or "synchronous service call at enforcement time"), or (b) carry a named escalation marker (e.g., `[ESC-BILL-POLICY]` with "enforcement seam TBD at Pass-A"). §I11 consumption map should reflect the resolution.

---

**F4I-MA2 — MAJOR**
**Location:** §I8 (DF-BILL-2, DF-BILL-4), §I11 (Event Consumption Map)
**Observation:** §I11 and §I8 identify two consumption signals for BC-BILL-3 and BC-BILL-4 without a named Doc-2 §8 event anchor: (1) "lead-access signal" from Operations (→ BC-BILL-3 usage metering + BC-BILL-4 credit sourcing); (2) "advertising/microsite launch signal" from Marketplace (→ BC-BILL-3 usage metering + BC-BILL-5 invoicing trigger). `QuotationSubmitted` (RFQ → BC-BILL-3) is correctly named. These two unnamed signals are load-bearing for BC-BILL-3 and BC-BILL-4 contract authoring. The consumption path verification is deferred to "content authoring against Doc-2 §8/§10.8" without a structural anchor or escalation marker, leaving the cross-module seam underspecified at structure depth.
**Required action:** §I11 and relevant §I8 entries must either (a) name the specific Doc-2 §8 event for each signal (e.g., the Operations lead-access event slug, the Marketplace ad-launch event slug), or (b) explicitly carry `[ESC-BILL-EVENT]` for each unnamed signal with the note "event contract TBD — verify against Doc-2 §8 at content pass" so that the structure document correctly communicates the open seam rather than deferring silently.

---

### Implementation Risks

**F4I-N1 — NITPICK**
**Location:** §I3 (BC Landscape), §I17 (Structure Summary)
**Observation:** BC-BILL-1 owns two aggregates (Plan and Entitlement). §I5 Aggregate Inventory correctly enumerates all seven aggregates with BC-BILL-1 listed twice. However, §I3 BC Landscape and §I17 Structure Summary describe BC-BILL-1 without noting that it holds two aggregates — a first-pass reader consulting only §I3 or §I17 may infer a one-to-one BC-to-aggregate relationship across the module. No structural correctness impact (§I5 is authoritative), but the omission is a minor readability inconsistency.
**Suggested action:** Add a parenthetical to §I3 and §I17 for BC-BILL-1: e.g., "(2 aggregates: Plan + Entitlement)" consistent with the §I5 inventory.

---

## Final Assessment

```
Open BLOCKER  = 0
Open MAJOR    = 2  (F4I-MA1, F4I-MA2)
Open MINOR    = 0
Open NITPICK  = 1  (F4I-N1)
```

---

## Approval Question

**Can Doc-4I_Structure_Proposal_v0.1 proceed directly to Doc-4I_Structure_Freeze_Audit_v1.0?**

**NO**

**Justification.** Two MAJOR findings prevent advancement. F4I-MA1 leaves the BC-BILL-2 ↔ BC-BILL-3 entitlement-read seam undefined — every BC-BILL-3 enforcement contract will be underspecified at content pass without structural resolution. F4I-MA2 leaves two of three consumption signals unnamed against Doc-2 §8 — BC-BILL-3 and BC-BILL-4 contract authors have no structural anchor for the metering gate and credit-sourcing triggers. Both findings require a targeted patch to §I4, §I8, and §I11. The patch is narrow and does not require BC restructuring, aggregate reassignment, or lifecycle revision. Upon resolution of F4I-MA1 and F4I-MA2 — with F4I-N1 addressed at the author's discretion — Doc-4I_Structure_Proposal (patched) may proceed to the Structure Freeze Audit.

The following surfaces are confirmed structurally sound and do not require revisitation at patch time: module identity, all six BC boundaries, all seven aggregate ownerships, all three produced events, all four escalation markers, procurement moat, Trust firewall, Platform Invoice integrity, dependency direction and ownership for all eight DF-BILL markers, all 15 required sections.

---

*End of Doc-4I_Structure_Independent_Hard_Review_v1.0. Independent hard review only — no redesign, no new BCs, no new aggregates, no reopening of frozen decisions. Open BLOCKER = 0 · Open MAJOR = 2 (F4I-MA1, F4I-MA2) · Open MINOR = 0 · Open NITPICK = 1. Proceed to Doc-4I_Structure_Freeze_Audit_v1.0: NO. Patch required: §I4 + §I8 + §I11 (F4I-MA1 and F4I-MA2). Corpus at this verdict: Architecture/ADRs (FROZEN) · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A through Doc-4H (all FROZEN) · Doc-4I_Structure_Proposal_v0.1 (under review).*
