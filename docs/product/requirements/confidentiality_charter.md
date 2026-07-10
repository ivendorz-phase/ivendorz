# iVendorz Confidentiality Charter

**Status:** v0.3 — **PUBLISHED** (owner Board close + publication authorization 2026-07-10;
post-publication corpus-fidelity corrections folded — see Revision v0.3)
**Board close (owner, 2026-07-10):** APPROVED — the charter text and both review-lane folds
(Review-A RA-F1 vendor-scoping · Review-B RB-1 governance/compliance disclosure) are ratified.
This document is the **specification of record** for the Confidentiality Charter (it supersedes
parent §5.1 for this content).
**Publication (owner, 2026-07-10):** authorized live. The public page **P-PUB-26**
(`/legal/confidentiality-charter`) now renders published — `LegalDocument` called with
`published` + a real `lastUpdated` (10 July 2026), so the scaffold's pending-review notice no
longer shows. Post-publication wording changes re-enter the review lanes (§B). Remains
NON-AUTHORITATIVE (translates frozen rules; coins nothing) — publication makes the buyer-facing
commitments live, it does not elevate this doc above the frozen corpus.
**Revision v0.3 (2026-07-10):** post-publication wording changes (re-entered the review lanes
per the publication rule) — folded fresh-context Review-A findings that landed after publication:
**F1** SEO metadata reworded off the absolute "only invited vendors can see them" (SERP strips the
honesty note) → distribution-framed "reach only the vendors you invite"; **F2** clause 6 body
restored the frozen "public" qualifier ("never used to train public AI models" — ADR-013 bars only
*public* AI-model training on private RFQ content, not all AI use); **F3** clause 7 dropped
"quotations received" from the buyer-ownership list (ADR-013 assigns quotations to the Creator
Organization = the vendor). Public `page.tsx` updated identically (doc↔page fidelity preserved).
This resolves RB OBS-1 (clause-7). Owner ruled fix-forward 2026-07-10; Review-B re-run on the
corrected live page.
**Revision v0.2 (2026-07-10):** folded Team-5 Review-B RB-1 MINOR — the honesty note no
longer claims moderation is the *only* reason an RFQ is seen outside invited vendors;
it now discloses the narrow, audited governance/compliance staff access (`staff_super_admin`,
compliance-log visibility) the frozen corpus grants. Public page.tsx updated identically
(doc↔page fidelity preserved). OBS-1 (clause-7 wording) recorded for the publication pass,
no change. Both review lanes now PASS (Review-A RA-F1 folded earlier; Review-B 0·0·0 after
this fold).
**Route ruling (owner, 2026-07-10):** `/legal/confidentiality-charter` — page **P-PUB-26**
minted (FE-PUB-12, coverage 151→152); page built reusing the `LegalDocument` scaffold. The
scaffold gained an opt-in `published` prop (default off — siblings P-PUB-21/22 stay pending);
this page passes it, so the pending-review notice no longer renders.
**Parent:** `trust_adoption_ladder_planning_and_design.md` §5.1 (specification of record
until this document is approved; on conflict during draft, §5.1 governs)
**Audience:** Buyers — factories, plants, EPC contractors, procurement teams. This is the
**publishable buyer-facing text**; the traceability annex (§C) is internal and is dropped
from any public rendering.
**Authority:** NON-AUTHORITATIVE. Every commitment below is a plain-language translation
of an already-frozen platform rule (annex §C); this document creates no rule and coins
nothing. The public route/page for this content is a separate Board decision
(page-universe governance) — this document is the content, not the page.

---

## A. The Charter (publishable text)

# Your procurement information is confidential. By design.

We built iVendorz knowing what an RFQ can reveal: product launches, expansion plans,
equipment upgrades, capacity, budgets, preferred suppliers, sourcing strategy. That is
confidential business intelligence — and the platform is engineered, not just promised,
to treat it that way.

**Our commitments:**

1. **Your RFQ is never published.** There is no public RFQ board on iVendorz — not as a
   policy we could quietly change, but as a rule built into the platform's architecture.
   RFQs are delivered to invited vendors; they are never posted, listed, or browsable.

2. **Only the vendors you choose to reach can see your RFQ.** An RFQ reaches only vendors
   matched by your routing preferences or explicitly selected by you. No other vendor
   can open it.

3. **Vendors you didn't invite cannot even tell your RFQ exists.** The platform answers
   an un-invited vendor exactly as if the RFQ never existed — no name, no count, no
   trace, no difference.

4. **Competing vendors never see each other's quotations.** A vendor sees only its own
   invitation and its own outcome — never who else quoted, what they quoted, who won,
   or how you compared them.

5. **Your private supplier decisions stay private, forever.** Which vendors you approve,
   restrict, or exclude for your own organization is visible to no one else — and a
   vendor cannot detect it. Your private view never changes anyone's public standing.

6. **Your procurement data never trains public AI models.** Private RFQ content is
   never used to train public AI models. Only anonymized, aggregate analytics are
   permitted.

7. **Your organization owns its business data.** Your RFQs, documents, and records
   belong to your organization — not to the platform.

8. **Your organization controls what leaves.** Submitting an RFQ is permission-gated
   within your organization's own roles, and you can require an internal approval step
   before anything is distributed. Until you distribute, a draft has left nobody's
   hands.

9. **We never touch your transaction money.** No escrow, no wallet, no settlement —
   payment happens directly between you and your supplier. The platform has no financial
   stake in who you choose.

10. **Actions are recorded.** Platform actions on your data are recorded according to
    the platform audit model — an accountable, tamper-resistant record.

**What we can see — stated honestly.** Every RFQ passes a platform moderation check
before distribution (for example, to catch contact-detail leaks or implausible listings).
That review is performed by authorized platform staff under confidentiality obligations.
It exists to protect the marketplace you're sourcing from — and it is the main reason an
RFQ is ever seen outside the vendors you reach. The only other access is narrow, audited
platform governance and compliance review by authorized staff. We state this plainly
because a privacy promise that hides its own exceptions isn't one.

---

## B. Where this text is used (post-approval)

Referenceable from: the public trust/legal surface (route per Board ruling), marketing
pages, onboarding flows, RFQ-creation surfaces (the in-product "Privacy by Design"
affordances already carry the same canonical phrase), and enterprise sales materials.
This text goes through the standard review lanes before any public use; wording changes
after approval re-enter review.

## C. Traceability annex (internal — not for public rendering)

| Clause | Frozen anchor |
|---|---|
| 1 | Doc-3 §5.1 FIXED — no public RFQ board; RFQs distributed, never published |
| 2 | ADR-013 Disclosure Rule; Doc-4E grant-scoped reads (`rfq_invitation_grantees`) |
| 3 | Doc-4E / Doc-4A §7.5 — NOT_FOUND collapse; no-access indistinguishable |
| 4 | Doc-7G §7.3 (Content Pass2 Patch v1.0.1) — own-outcome only, no competitive disclosure |
| 5 | Invariant #11; M4 BC-OPS-1 buyer-private CRM; Doc-7G byte-equivalence rule |
| 6 | ADR-013 AI Data Usage Rule |
| 7 | ADR-013 data-ownership table (quotations owned by the **Creator Organization** = vendor; buyer-ownership claim scoped to RFQs/documents/records per Review-A F3) |
| 8 | Doc-2 §9 RFQ internal approve/reject (org-conditional); M1 roles & delegation |
| 9 | Money boundary — CLAUDE.md §1; Master System Architecture |
| 10 | M0 audit; Invariant #8 — scoped per RA-F3/`ESC-TRUST-READAUDIT` (no read-audit claim) |
| Honesty note | Doc-2 §5.4 moderation stage; Doc-4E `rfq.moderate_rfq.v1` (Admin actor) — Review-A RA-F1. "Narrow, audited governance/compliance access" = `staff_super_admin` (Doc-2 §7, all-actions-audited) + compliance-log visibility (Doc-4E Part3) — Review-B RB-1 |

**Deliberately NOT claimed** (corpus-accuracy guards): no "who accessed my RFQ" visibility
(open `ESC-TRUST-READAUDIT`); no absolute "only your org + invited vendors can see it"
(moderation staff visibility exists — clause honesty note instead); no deletion/retention
promises (Invariant #8 is versioned/soft-delete); no claim that budget/field disclosure
is buyer-configurable (open `ESC-TRUST-FIELD-DISCLOSURE`).

---

*End — v0.3 PUBLISHED, 2026-07-10. Coins nothing; non-authoritative under the frozen corpus.*
