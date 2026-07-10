import { LegalDocument, type LegalSection } from "../_components/legal-document";

// Public Confidentiality Charter route (`/legal/confidentiality-charter`) — P-PUB-26 (Doc-7D Public
// surface · T-STATIC · TB-NONE; owner Board-minted 2026-07-10, coverage 151→152, FE-PUB-12). A pure
// SERVER COMPONENT mounted in the Doc-7C `(public)` shell. ROUTING + COMPOSITION ONLY.
//
// SCOPE: buyer-facing trust asset — the publishable text of the Confidentiality Charter
// (source of record: docs/product/requirements/confidentiality_charter.md §A; the traceability
// annex §C is internal and NOT rendered). Every commitment translates an already-frozen rule —
// the page coins nothing and binds no Doc-5 contract. PUBLISHED (owner Board close + publication
// authorization 2026-07-10): `published` set + real `lastUpdated`, so the scaffold's pending-review
// notice no longer renders. Wording changes after publication re-enter the review lanes.
//
// FIELD DISCIPLINE (charter annex §C guards): claims stay VENDOR-SCOPED — the moderation stage is
// stated honestly, never denied (Review-A RA-F1); no "who accessed my RFQ" claim (ESC-TRUST-READAUDIT
// open); no deletion/retention promise (Invariant #8 is versioned/soft-delete); audit claim scoped to
// the platform audit model. Canonical trust phrase: "Privacy by Design".
export const metadata = {
  title: "Confidentiality Charter — iVendorz",
  description:
    "How iVendorz protects your procurement information: RFQs are never published and reach only the vendors you invite, competitors never see each other's quotes, and your data never trains public AI models.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "never-published",
    heading: "Your RFQ is never published",
    paragraphs: [
      "There is no public RFQ board on iVendorz — not as a policy we could quietly change, but as a rule built into the platform's architecture. RFQs are delivered to invited vendors; they are never posted, listed, or browsable.",
    ],
  },
  {
    id: "invited-only",
    heading: "Only the vendors you choose to reach can see your RFQ",
    paragraphs: [
      "An RFQ reaches only vendors matched by your routing preferences or explicitly selected by you. No other vendor can open it.",
    ],
  },
  {
    id: "undetectable",
    heading: "Vendors you didn't invite cannot even tell your RFQ exists",
    paragraphs: [
      "The platform answers an un-invited vendor exactly as if the RFQ never existed — no name, no count, no trace, no difference.",
    ],
  },
  {
    id: "no-competitive-disclosure",
    heading: "Competing vendors never see each other's quotations",
    paragraphs: [
      "A vendor sees only its own invitation and its own outcome — never who else quoted, what they quoted, who won, or how you compared them.",
    ],
  },
  {
    id: "private-supplier-decisions",
    heading: "Your private supplier decisions stay private, forever",
    paragraphs: [
      "Which vendors you approve, restrict, or exclude for your own organization is visible to no one else — and a vendor cannot detect it. Your private view never changes anyone's public standing.",
    ],
  },
  {
    id: "no-ai-training",
    heading: "Your procurement data never trains public AI models",
    paragraphs: [
      "Private RFQ content is never used to train public AI models. Only anonymized, aggregate analytics are permitted.",
    ],
  },
  {
    id: "you-own-your-data",
    heading: "Your organization owns its business data",
    paragraphs: [
      "Your RFQs, documents, and records belong to your organization — not to the platform.",
    ],
  },
  {
    id: "you-control-what-leaves",
    heading: "Your organization controls what leaves",
    paragraphs: [
      "Submitting an RFQ is permission-gated within your organization's own roles, and you can require an internal approval step before anything is distributed. Until you distribute, a draft has left nobody's hands.",
    ],
  },
  {
    id: "money-boundary",
    heading: "We never touch your transaction money",
    paragraphs: [
      "No escrow, no wallet, no settlement — payment happens directly between you and your supplier. The platform has no financial stake in who you choose.",
    ],
  },
  {
    id: "actions-recorded",
    heading: "Actions are recorded",
    paragraphs: [
      "Platform actions on your data are recorded according to the platform audit model — an accountable, tamper-resistant record.",
    ],
  },
  {
    id: "what-we-can-see",
    heading: "What we can see — stated honestly",
    paragraphs: [
      "Every RFQ passes a platform moderation check before distribution (for example, to catch contact-detail leaks or implausible listings). That review is performed by authorized platform staff under confidentiality obligations.",
      "It exists to protect the marketplace you're sourcing from — and it is the main reason an RFQ is ever seen outside the vendors you reach. The only other access is narrow, audited platform governance and compliance review by authorized staff. We state this plainly because a privacy promise that hides its own exceptions isn't one.",
    ],
  },
];

export default function ConfidentialityCharterPage() {
  return (
    <LegalDocument
      title="Confidentiality Charter"
      intro="We built iVendorz knowing what an RFQ can reveal: product launches, expansion plans, equipment upgrades, capacity, budgets, preferred suppliers, sourcing strategy. That is confidential business intelligence — and the platform is engineered, not just promised, to treat it that way."
      lastUpdated="10 July 2026"
      published
      sections={SECTIONS}
    />
  );
}
