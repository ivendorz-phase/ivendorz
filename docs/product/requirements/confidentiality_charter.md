# iVendorz Confidentiality Charter

**Status:** v0.2 — **CONTENT APPROVED** (owner Board close 2026-07-10; reviews ratified) ·
**PUBLICATION still gated** (page stays `lastUpdated="Pending"` until an explicit publication go)
**Board close (owner, 2026-07-10):** APPROVED — the charter text and both review-lane folds
(Review-A RA-F1 vendor-scoping · Review-B RB-1 governance/compliance disclosure) are ratified.
This document is now the **specification of record** for the Confidentiality Charter (it
supersedes parent §5.1 for this content). Approval covers the **content and reviews only** —
it does **not** by itself make the public page live/binding; flipping `lastUpdated` off
"Pending" (removing the page's pending-review notice) is a **separate, explicit publication
step** not taken here. Remains NON-AUTHORITATIVE (translates frozen rules; coins nothing).
**Revision v0.2 (2026-07-10):** folded Team-5 Review-B RB-1 MINOR — the honesty note no
longer claims moderation is the *only* reason an RFQ is seen outside invited vendors;
it now discloses the narrow, audited governance/compliance staff access (`staff_super_admin`,
compliance-log visibility) the frozen corpus grants. Public page.tsx updated identically
(doc↔page fidelity preserved). OBS-1 (clause-7 wording) recorded for the publication pass,
no change. Both review lanes now PASS (Review-A RA-F1 folded earlier; Review-B 0·0·0 after
this fold).
**Route ruling (owner, 2026-07-10):** `/legal/confidentiality-charter` — page **P-PUB-26**
minted (FE-PUB-12, coverage 151→152); page built reusing the `LegalDocument` scaffold; the
scaffold's pending-review notice stays until this charter passes publication review.
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
   excluded from AI training. Only anonymized, aggregate analytics are permitted.

7. **Your organization owns its business data.** Your RFQs, quotations received,
   documents, and records belong to your organization — not to the platform.

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
| 7 | ADR-013 data-ownership table |
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

*End — v0.2 DRAFT, 2026-07-10. Coins nothing; publication and route are Board-gated.*
