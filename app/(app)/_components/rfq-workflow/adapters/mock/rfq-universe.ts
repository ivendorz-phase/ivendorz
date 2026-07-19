// RFQ WORKFLOW — DEVELOPMENT/DEMO fixture universe (presentation stand-in for the wired reads).
// NOT real production RFQ data — every buyer name and amount below is fictional. At wiring the
// adapter swaps to the GI-02 server layer and these fixtures fall away.
//
// BUYER universe: one coherent dataset with an RFQ in every frozen Doc-4M state, extending the
// reviewed "RFQ-2026-000123" fixture world (detail → versions → routing → comparison → award) so
// existing review anchors stay valid. VENDOR universe: a coherent received-only demo set standing in
// for the wired vendor-leg reads (owner directive 2026-07-18: the vendor RFQ Workspace shows data
// from the read path) — see its section note below.
//
// GOVERNANCE:
//  • Every state token is the verbatim frozen set; every `permittedActions` entry is a frozen
//    Doc-5E command reachable from the fixture's state per ./../../transitions.ts — a stand-in for
//    the SERVER-derived GI-10 set, never a client decision.
//  • Vendor rows carry OWN/received facts only (ND-1..ND-8): no competitor count, rank, or
//    outcome tell.
//  • Amounts are BDT with currency stored per value (multi-currency-ready); ids are opaque; human
//    refs are display-only (Inv #5).

import type {
  RfqDetailData,
  RfqListItem,
} from "../../../../(workspace)/buy/_components/rfq-view-models";
import type { RfqVersionHistoryData } from "../../../../(workspace)/buy/_components/rfq-version-view-models";
import type { RoutingInvitationsData } from "../../../../(workspace)/buy/_components/routing-view-models";
import type { AwardData } from "../../../../(workspace)/buy/_components/award";
import type { QuotationDetailData } from "../../../../(workspace)/buy/_components/quotation-view-models";
import type { ComparisonData } from "@/frontend/components/comparison";
import type {
  InboxItemView,
  RfqSnapshotView,
  InvitationView,
  QuotationView,
  QuotaView,
  EngagementHandoffView,
  PriceBreakdownLine,
  FileRefView,
  WindowState,
  WindowUrgency,
} from "../../../vendor/rfq/types";

/** One buyer-leg fixture record — the per-RFQ bundle the buyer reads project from. */
export interface BuyerRfqRecord {
  detail: RfqDetailData;
  /** Multi-revision history where the fixture has one; absent ⇒ the adapter projects a v1-only history. */
  versions?: RfqVersionHistoryData;
  /** Routing/invitation log where routing has run; absent ⇒ the adapter projects an honest empty log. */
  routing?: RoutingInvitationsData;
  /** Comparison statement — exists only from the first quotation onward (absent ⇒ genuine absence). */
  comparison?: ComparisonData;
  /** Award shortlist — candidates only when quotations are shortlisted (absent ⇒ "shortlist first"). */
  award?: AwardData;
  quotationDetails?: QuotationDetailData[];
}

/** Builder working-draft content (S4) — own data only; mirrors QuotationBuilderProps minus quota. */
export interface VendorBuilderSeed {
  rfqHumanRef?: string;
  versionLockedLabel?: string;
  windowState?: WindowState;
  windowDeadlineLabel?: string;
  windowUrgency?: WindowUrgency;
  lines?: PriceBreakdownLine[];
  currency?: string;
  subtotal?: number;
  deliveryTerms?: string;
  warrantyTerms?: string;
  specComplianceDeclaration?: string;
  attachments?: FileRefView[];
}

/** One vendor-leg fixture record — the per-RFQ bundle the vendor reads project from. */
export interface VendorRfqRecord {
  inbox: InboxItemView;
  snapshot: RfqSnapshotView;
  invitation?: InvitationView;
  quotation?: QuotationView;
  builder?: VendorBuilderSeed;
  engagement?: EngagementHandoffView;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Buyer universe — one RFQ per frozen state (deep records on 000123 / 000119 / 000117 / 000318 / 000095).
// ────────────────────────────────────────────────────────────────────────────────────────────────

export const BUYER_RFQ_UNIVERSE: readonly BuyerRfqRecord[] = [
  {
    detail: {
      id: "rfq-000201",
      humanRef: "RFQ-2026-000201",
      title: "Industrial exhaust fans — supply",
      state: "draft",
      value: { amount: 640000, currency: "BDT" },
      summary:
        "Six heavy-duty axial exhaust fans for the finishing shed, including mounting frames.",
      category: "HVAC & Ventilation",
      workNature: ["supply"],
      currentVersionNo: 1,
      deliveryLocation: "Tongi plant",
      neededBy: "2026-09-15",
      createdAt: "2026-07-02T11:20:00+06:00",
      updatedAt: "2026-07-04T09:05:00+06:00",
      permittedActions: [
        { key: "submit_rfq", label: "Submit RFQ", emphasis: "primary" },
        { key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" },
      ],
      lifecycle: [{ id: "l-1", label: "RFQ created", at: "2026-07-02T11:20:00+06:00" }],
    },
  },
  {
    detail: {
      id: "rfq-000205",
      humanRef: "RFQ-2026-000205",
      title: "11kV HT cable 3×185 mm² — supply",
      state: "pending_internal_approval",
      value: { amount: 1980000, currency: "BDT" },
      summary: "1.2 km of 11kV XLPE HT cable for the substation feeder replacement.",
      category: "Cables & Wiring",
      workNature: ["supply"],
      currentVersionNo: 1,
      deliveryLocation: "Bhaluka factory",
      neededBy: "2026-08-25",
      createdAt: "2026-07-01T10:00:00+06:00",
      updatedAt: "2026-07-03T15:45:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-07-01T10:00:00+06:00" },
        { id: "l-2", label: "Sent for internal approval", at: "2026-07-03T15:45:00+06:00" },
      ],
    },
  },
  {
    detail: {
      id: "rfq-000208",
      humanRef: "RFQ-2026-000208",
      title: "Fire hydrant system — annual maintenance",
      state: "submitted",
      value: { amount: 350000, currency: "BDT" },
      summary: "Annual maintenance contract for the plant fire hydrant network and jockey pumps.",
      category: "Fire & Safety",
      workNature: ["service"],
      currentVersionNo: 1,
      deliveryLocation: "Savar plant",
      neededBy: "2026-08-10",
      createdAt: "2026-06-30T09:30:00+06:00",
      updatedAt: "2026-07-04T10:15:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-06-30T09:30:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-07-04T10:15:00+06:00" },
      ],
    },
  },
  {
    detail: {
      id: "rfq-000210",
      humanRef: "RFQ-2026-000210",
      title: "Compressed-air piping revamp — fabricate & install",
      state: "under_review",
      value: { amount: 2250000, currency: "BDT" },
      summary: "Replace 300 m of compressed-air header piping with SS304, including supports.",
      category: "Piping & Fittings",
      workNature: ["fabricate", "service"],
      currentVersionNo: 1,
      deliveryLocation: "Chattogram unit",
      neededBy: "2026-09-30",
      createdAt: "2026-07-01T14:10:00+06:00",
      updatedAt: "2026-07-05T08:40:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-07-01T14:10:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-07-04T16:00:00+06:00" },
        { id: "l-3", label: "Entered platform review", at: "2026-07-05T08:40:00+06:00" },
      ],
    },
  },
  {
    detail: {
      id: "rfq-000212",
      humanRef: "RFQ-2026-000212",
      title: "Forklift 3-ton diesel — supply",
      state: "matching",
      value: { amount: 3400000, currency: "BDT" },
      summary: "One 3-ton diesel forklift with side-shift, including commissioning and training.",
      category: "Material Handling",
      workNature: ["supply"],
      currentVersionNo: 1,
      deliveryLocation: "Narayanganj warehouse",
      neededBy: "2026-08-20",
      createdAt: "2026-07-02T09:00:00+06:00",
      updatedAt: "2026-07-05T11:30:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-07-02T09:00:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-07-04T13:20:00+06:00" },
        { id: "l-3", label: "Review passed — matching", at: "2026-07-05T11:30:00+06:00" },
      ],
    },
  },
  {
    // The vendor-leg deep RFQ (rfq-000318) as its BUYER sees it.
    detail: {
      id: "rfq-000318",
      humanRef: "RFQ-2026-000318",
      title: "MS plate 10 mm — 20 ton, delivered to Savar EPZ",
      state: "vendors_notified",
      value: { amount: 1850000, currency: "BDT" },
      summary: "MS plate 10 mm × 20 ton to BDS 1031 grade, delivered to the Savar EPZ workshop.",
      category: "Steel & Metals",
      workNature: ["supply"],
      routingMode: "approved_conditional",
      currentVersionNo: 1,
      deliveryLocation: "Savar, Dhaka",
      neededBy: "2026-07-28",
      createdAt: "2026-06-29T10:30:00+06:00",
      updatedAt: "2026-07-03T09:20:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-06-29T10:30:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-07-01T09:00:00+06:00" },
        { id: "l-3", label: "Vendors notified", at: "2026-07-03T09:20:00+06:00" },
      ],
      quotations: { items: [], nextCursor: null },
    },
    routing: {
      id: "rfq-000318",
      humanRef: "RFQ-2026-000318",
      state: "vendors_notified",
      routingLog: [
        { routingMode: "approved_conditional", executedAt: "2026-07-03T09:20:00+06:00" },
      ],
      routingNextCursor: null,
      invitations: [
        {
          state: "accepted",
          deliveredAt: "2026-07-03T09:25:00+06:00",
          respondedAt: "2026-07-04T10:10:00+06:00",
        },
        { state: "delivered", deliveredAt: "2026-07-03T09:25:00+06:00" },
        {
          state: "declined",
          deliveredAt: "2026-07-03T09:25:00+06:00",
          respondedAt: "2026-07-03T17:40:00+06:00",
        },
      ],
      invitationsNextCursor: null,
    },
  },
  {
    detail: {
      id: "rfq-000117",
      humanRef: "RFQ-2026-000117",
      title: "Effluent pump spares — supply",
      state: "quotations_received",
      value: { amount: 520000, currency: "BDT" },
      summary: "Impellers, wear plates and mechanical seals for the ETP effluent pumps.",
      category: "Pumps & Compressors",
      workNature: ["supply"],
      currentVersionNo: 1,
      deliveryLocation: "Gazipur plant",
      neededBy: "2026-08-05",
      createdAt: "2026-06-22T10:00:00+06:00",
      updatedAt: "2026-07-02T16:20:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-06-22T10:00:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-06-24T09:00:00+06:00" },
        { id: "l-3", label: "Vendors notified", at: "2026-06-26T11:00:00+06:00" },
        { id: "l-4", label: "Quotation received", at: "2026-07-02T16:20:00+06:00" },
      ],
      quotations: {
        items: [
          {
            id: "q-117-1",
            vendorName: "Chattogram Marine Hardware",
            state: "submitted",
            amount: { amount: 486000, currency: "BDT" },
            validUntil: "2026-07-25T00:00:00+06:00",
            submittedAt: "2026-07-02T16:20:00+06:00",
          },
        ],
        nextCursor: null,
      },
    },
    comparison: {
      rfqId: "rfq-000117",
      humanRef: "RFQ-2026-000117",
      versionNo: 1,
      generatedAt: "2026-07-02T16:25:00+06:00",
      suppliers: [
        {
          quotationId: "q-117-1",
          vendorName: "Chattogram Marine Hardware",
          state: "submitted",
          amount: { amount: 486000, currency: "BDT" },
          delivery: "2 weeks from PO",
          warranty: "6 months on seals",
          validUntil: "2026-07-25T00:00:00+06:00",
          compliance: "OEM-equivalent parts declared",
          attachmentsCount: 1,
        },
      ],
    },
    quotationDetails: [
      {
        id: "q-117-1",
        rfqId: "rfq-000117",
        humanRef: "QTN-2026-000602",
        vendorName: "Chattogram Marine Hardware",
        state: "submitted",
        versionNo: 1,
        amount: { amount: 486000, currency: "BDT" },
        validUntil: "2026-07-25T00:00:00+06:00",
        submittedAt: "2026-07-02T16:20:00+06:00",
        pricing: {
          lines: [
            {
              id: "pl-1",
              label: "Impeller set (CI, machined)",
              amount: { amount: 264000, currency: "BDT" },
              note: "2 sets",
            },
            {
              id: "pl-2",
              label: "Mechanical seals + wear plates",
              amount: { amount: 222000, currency: "BDT" },
              note: "2 sets",
            },
          ],
          total: { amount: 486000, currency: "BDT" },
        },
        delivery: [{ id: "d-1", label: "Lead time", value: "2 weeks from PO" }],
        warranty: [{ id: "w-1", label: "Coverage", value: "6 months on seals" }],
        compliance: [{ id: "c-1", label: "Declaration", value: "OEM-equivalent parts declared" }],
      },
    ],
  },
  {
    detail: {
      id: "rfq-000119",
      humanRef: "RFQ-2026-000119",
      title: "Substation transformer servicing — service",
      state: "buyer_reviewing",
      value: { amount: 780000, currency: "BDT" },
      summary:
        "Oil filtration, BDV testing and gasket replacement for two 1600 kVA distribution transformers.",
      category: "Electrical Services",
      workNature: ["service"],
      currentVersionNo: 1,
      deliveryLocation: "Bhaluka factory",
      neededBy: "2026-08-15",
      createdAt: "2026-06-18T09:00:00+06:00",
      updatedAt: "2026-07-03T10:05:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-06-18T09:00:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-06-20T10:30:00+06:00" },
        { id: "l-3", label: "Vendors notified", at: "2026-06-23T09:15:00+06:00" },
        { id: "l-4", label: "Quotations received", at: "2026-06-29T14:00:00+06:00" },
        { id: "l-5", label: "Review opened", at: "2026-07-03T10:05:00+06:00" },
      ],
      quotations: {
        items: [
          {
            id: "q-119-1",
            vendorName: "Dhaka Power Services Ltd.",
            state: "submitted",
            amount: { amount: 745000, currency: "BDT" },
            validUntil: "2026-07-20T00:00:00+06:00",
            submittedAt: "2026-06-29T14:00:00+06:00",
          },
          {
            id: "q-119-2",
            vendorName: "Eastern Grid Engineering",
            state: "submitted",
            amount: { amount: 799000, currency: "BDT" },
            validUntil: "2026-07-22T00:00:00+06:00",
            submittedAt: "2026-06-30T09:40:00+06:00",
          },
          {
            id: "q-119-3",
            vendorName: "Rupsha Electromech",
            state: "submitted",
            amount: { amount: 712000, currency: "BDT" },
            validUntil: "2026-07-18T00:00:00+06:00",
            submittedAt: "2026-07-01T11:25:00+06:00",
          },
        ],
        nextCursor: null,
      },
    },
    comparison: {
      rfqId: "rfq-000119",
      humanRef: "RFQ-2026-000119",
      versionNo: 1,
      generatedAt: "2026-07-03T10:05:00+06:00",
      suppliers: [
        {
          quotationId: "q-119-1",
          vendorName: "Dhaka Power Services Ltd.",
          state: "submitted",
          amount: { amount: 745000, currency: "BDT" },
          delivery: "Shutdown window of 3 days",
          warranty: "12 months on gaskets",
          validUntil: "2026-07-20T00:00:00+06:00",
          compliance: "IEC 60422 test protocol",
          attachmentsCount: 2,
        },
        {
          quotationId: "q-119-2",
          vendorName: "Eastern Grid Engineering",
          state: "submitted",
          amount: { amount: 799000, currency: "BDT" },
          delivery: "Shutdown window of 2 days",
          warranty: "12 months on workmanship",
          validUntil: "2026-07-22T00:00:00+06:00",
          compliance: "IEC 60422 test protocol",
          attachmentsCount: 3,
        },
        {
          quotationId: "q-119-3",
          vendorName: "Rupsha Electromech",
          state: "submitted",
          amount: { amount: 712000, currency: "BDT" },
          delivery: "Shutdown window of 4 days",
          warranty: "6 months on workmanship",
          validUntil: "2026-07-18T00:00:00+06:00",
          compliance: "In-house test protocol",
          attachmentsCount: 1,
        },
      ],
    },
  },
  {
    // THE buyer deep universe — detail → versions → routing → comparison → award all populated.
    detail: {
      id: "rfq-000123",
      humanRef: "RFQ-2026-000123",
      title: "Boiler feed-water pumps — supply & install",
      state: "shortlisted",
      value: { amount: 2750000, currency: "BDT" },
      summary:
        "Two centrifugal feed-water pumps for the Unit-2 boiler house, including delivery, installation, and commissioning against the attached specification.",
      category: "Pumps & Compressors",
      workNature: ["supply", "service"],
      routingMode: "approved_conditional",
      currentVersionNo: 3,
      deliveryLocation: "Gazipur plant",
      neededBy: "2026-08-31",
      createdAt: "2026-06-20T10:00:00+06:00",
      updatedAt: "2026-07-04T15:10:00+06:00",
      permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-06-20T10:00:00+06:00" },
        { id: "l-2", label: "Submitted for routing", at: "2026-06-22T09:30:00+06:00" },
        { id: "l-3", label: "Vendors notified", at: "2026-06-24T11:15:00+06:00" },
        { id: "l-4", label: "Quotation received", at: "2026-06-30T14:40:00+06:00" },
        { id: "l-5", label: "Review opened", at: "2026-07-02T09:10:00+06:00" },
        { id: "l-6", label: "Shortlist recorded", at: "2026-07-04T15:10:00+06:00" },
      ],
      quotations: {
        items: [
          {
            id: "q-1",
            vendorName: "Meghna Industrial Supplies Ltd.",
            state: "shortlisted",
            amount: { amount: 2695000, currency: "BDT" },
            validUntil: "2026-07-15T00:00:00+06:00",
            submittedAt: "2026-06-30T14:40:00+06:00",
          },
          {
            id: "q-2",
            vendorName: "Padma Engineering Works",
            state: "shortlisted",
            amount: { amount: 2810000, currency: "BDT" },
            validUntil: "2026-07-10T00:00:00+06:00",
            submittedAt: "2026-06-29T16:05:00+06:00",
          },
        ],
        nextCursor: null,
      },
    },
    versions: {
      id: "rfq-000123",
      humanRef: "RFQ-2026-000123",
      state: "shortlisted",
      currentVersionNo: 3,
      versions: [
        {
          versionNo: 1,
          content: {
            title: "Boiler feed-water pumps — supply & install",
            summary: "Two centrifugal feed-water pumps for the Unit-2 boiler house.",
            category: "Pumps & Compressors",
            value: { amount: 2400000, currency: "BDT" },
            deliveryLocation: "Narayanganj plant",
            neededBy: "2026-09-30",
          },
        },
        {
          versionNo: 2,
          content: {
            title: "Boiler feed-water pumps — supply & install",
            summary: "Two centrifugal feed-water pumps for the Unit-2 boiler house.",
            category: "Pumps & Compressors",
            value: { amount: 2750000, currency: "BDT" },
            deliveryLocation: "Narayanganj plant",
            neededBy: "2026-08-31",
          },
        },
        {
          versionNo: 3,
          content: {
            title: "Boiler feed-water pumps — supply & install",
            summary: "Two centrifugal feed-water pumps for the Unit-2 boiler house.",
            category: "Pumps & Compressors",
            value: { amount: 2750000, currency: "BDT" },
            deliveryLocation: "Gazipur plant",
            neededBy: "2026-08-31",
          },
        },
      ],
    },
    routing: {
      id: "rfq-000123",
      humanRef: "RFQ-2026-000123",
      state: "shortlisted",
      routingLog: [
        { routingMode: "approved_only", executedAt: "2026-06-24T11:15:00+06:00" },
        { routingMode: "approved_conditional", executedAt: "2026-06-26T10:00:00+06:00" },
      ],
      routingNextCursor: null,
      invitations: [
        {
          state: "accepted",
          deliveredAt: "2026-06-24T11:20:00+06:00",
          respondedAt: "2026-06-25T09:05:00+06:00",
        },
        {
          state: "accepted",
          deliveredAt: "2026-06-24T11:20:00+06:00",
          respondedAt: "2026-06-25T14:30:00+06:00",
        },
        {
          state: "declined",
          deliveredAt: "2026-06-24T11:20:00+06:00",
          respondedAt: "2026-06-24T16:30:00+06:00",
        },
        { state: "expired", deliveredAt: "2026-06-26T10:05:00+06:00" },
      ],
      invitationsNextCursor: null,
    },
    comparison: {
      rfqId: "rfq-000123",
      humanRef: "RFQ-2026-000123",
      versionNo: 2,
      generatedAt: "2026-07-02T09:10:00+06:00",
      suppliers: [
        {
          quotationId: "q-1",
          vendorName: "Meghna Industrial Supplies Ltd.",
          state: "shortlisted",
          amount: { amount: 2695000, currency: "BDT" },
          delivery: "6 weeks from PO",
          warranty: "18 months from commissioning",
          validUntil: "2026-07-15T00:00:00+06:00",
          compliance: "ISO 5199 compliant",
          attachmentsCount: 3,
        },
        {
          quotationId: "q-2",
          vendorName: "Padma Engineering Works",
          state: "shortlisted",
          amount: { amount: 2810000, currency: "BDT" },
          delivery: "4 weeks from PO",
          warranty: "12 months from commissioning",
          validUntil: "2026-07-10T00:00:00+06:00",
          compliance: "ISO 5199 compliant",
          attachmentsCount: 2,
        },
      ],
    },
    award: {
      rfqId: "rfq-000123",
      humanRef: "RFQ-2026-000123",
      candidates: [
        {
          quotationId: "q-1",
          vendorName: "Meghna Industrial Supplies Ltd.",
          state: "shortlisted",
          amount: { amount: 2695000, currency: "BDT" },
          delivery: "6 weeks from PO",
          validUntil: "2026-07-15",
        },
        {
          quotationId: "q-2",
          vendorName: "Padma Engineering Works",
          state: "shortlisted",
          amount: { amount: 2810000, currency: "BDT" },
          delivery: "4 weeks from PO",
          validUntil: "2026-07-10",
        },
      ],
      aboveThreshold: true,
    },
    quotationDetails: [
      {
        id: "q-1",
        rfqId: "rfq-000123",
        humanRef: "QTN-2026-000587",
        vendorName: "Meghna Industrial Supplies Ltd.",
        state: "shortlisted",
        versionNo: 1,
        amount: { amount: 2695000, currency: "BDT" },
        validUntil: "2026-07-15T00:00:00+06:00",
        submittedAt: "2026-06-30T14:40:00+06:00",
        pricing: {
          lines: [
            {
              id: "pl-1",
              label: "Centrifugal feed-water pump, 45 kW",
              amount: { amount: 2300000, currency: "BDT" },
              note: "2 units",
            },
            {
              id: "pl-2",
              label: "Installation & commissioning",
              amount: { amount: 395000, currency: "BDT" },
            },
          ],
          total: { amount: 2695000, currency: "BDT" },
        },
        delivery: [
          { id: "d-1", label: "Lead time", value: "6 weeks from PO" },
          { id: "d-2", label: "Delivery basis", value: "Delivered to Gazipur plant" },
        ],
        warranty: [{ id: "w-1", label: "Coverage", value: "18 months from commissioning" }],
        compliance: [{ id: "c-1", label: "Standard", value: "ISO 5199 compliant" }],
      },
      {
        id: "q-2",
        rfqId: "rfq-000123",
        humanRef: "QTN-2026-000592",
        vendorName: "Padma Engineering Works",
        state: "shortlisted",
        versionNo: 1,
        amount: { amount: 2810000, currency: "BDT" },
        validUntil: "2026-07-10T00:00:00+06:00",
        submittedAt: "2026-06-29T16:05:00+06:00",
        pricing: {
          lines: [
            {
              id: "pl-1",
              label: "Centrifugal feed-water pump, 45 kW",
              amount: { amount: 2460000, currency: "BDT" },
              note: "2 units",
            },
            {
              id: "pl-2",
              label: "Installation & commissioning",
              amount: { amount: 350000, currency: "BDT" },
            },
          ],
          total: { amount: 2810000, currency: "BDT" },
        },
        delivery: [{ id: "d-1", label: "Lead time", value: "4 weeks from PO" }],
        warranty: [{ id: "w-1", label: "Coverage", value: "12 months from commissioning" }],
        compliance: [{ id: "c-1", label: "Standard", value: "ISO 5199 compliant" }],
      },
    ],
  },
  {
    detail: {
      id: "rfq-000095",
      humanRef: "RFQ-2026-000095",
      title: "Cooling tower fill media replacement",
      state: "closed_won",
      value: { amount: 1150000, currency: "BDT" },
      summary: "Replace PVC fill media and drift eliminators on cooling towers CT-1 and CT-2.",
      category: "HVAC & Ventilation",
      workNature: ["supply", "service"],
      currentVersionNo: 1,
      deliveryLocation: "Savar plant",
      neededBy: "2026-07-31",
      createdAt: "2026-05-28T09:00:00+06:00",
      updatedAt: "2026-06-25T10:00:00+06:00",
      permittedActions: [],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-05-28T09:00:00+06:00" },
        { id: "l-2", label: "Vendors notified", at: "2026-06-02T10:00:00+06:00" },
        { id: "l-3", label: "Quotations received", at: "2026-06-10T15:30:00+06:00" },
        { id: "l-4", label: "Shortlist recorded", at: "2026-06-18T11:00:00+06:00" },
        { id: "l-5", label: "Awarded", at: "2026-06-25T10:00:00+06:00" },
      ],
      quotations: {
        items: [
          {
            id: "q-95-1",
            vendorName: "Karnaphuli HVAC Engineering",
            state: "selected",
            amount: { amount: 1120000, currency: "BDT" },
            validUntil: "2026-07-05T00:00:00+06:00",
            submittedAt: "2026-06-10T15:30:00+06:00",
          },
          {
            id: "q-95-2",
            vendorName: "Delta Cooling Solutions",
            state: "not_selected",
            amount: { amount: 1190000, currency: "BDT" },
            validUntil: "2026-07-08T00:00:00+06:00",
            submittedAt: "2026-06-11T10:10:00+06:00",
          },
        ],
        nextCursor: null,
      },
    },
    comparison: {
      rfqId: "rfq-000095",
      humanRef: "RFQ-2026-000095",
      versionNo: 1,
      generatedAt: "2026-06-12T09:00:00+06:00",
      suppliers: [
        {
          quotationId: "q-95-1",
          vendorName: "Karnaphuli HVAC Engineering",
          state: "selected",
          amount: { amount: 1120000, currency: "BDT" },
          delivery: "3 weeks from PO",
          warranty: "24 months on fill media",
          validUntil: "2026-07-05T00:00:00+06:00",
          compliance: "CTI STD-136 media",
          attachmentsCount: 2,
        },
        {
          quotationId: "q-95-2",
          vendorName: "Delta Cooling Solutions",
          state: "not_selected",
          amount: { amount: 1190000, currency: "BDT" },
          delivery: "2 weeks from PO",
          warranty: "18 months on fill media",
          validUntil: "2026-07-08T00:00:00+06:00",
          compliance: "CTI STD-136 media",
          attachmentsCount: 1,
        },
      ],
    },
  },
  {
    detail: {
      id: "rfq-000090",
      humanRef: "RFQ-2026-000090",
      title: "Diesel generator 500 kVA — supply",
      state: "closed_lost",
      value: { amount: 7800000, currency: "BDT" },
      summary: "500 kVA standby diesel generator with AMF panel; budget not approved this quarter.",
      category: "Power Generation",
      workNature: ["supply"],
      currentVersionNo: 1,
      deliveryLocation: "Tongi plant",
      neededBy: "2026-08-01",
      createdAt: "2026-05-20T09:00:00+06:00",
      updatedAt: "2026-06-20T14:00:00+06:00",
      permittedActions: [{ key: "reissue_rfq", label: "Reissue RFQ", emphasis: "primary" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-05-20T09:00:00+06:00" },
        { id: "l-2", label: "Vendors notified", at: "2026-05-26T10:00:00+06:00" },
        { id: "l-3", label: "Quotations received", at: "2026-06-04T12:00:00+06:00" },
        { id: "l-4", label: "Closed without award", at: "2026-06-20T14:00:00+06:00" },
      ],
      quotations: {
        items: [
          {
            id: "q-90-1",
            vendorName: "Bengal Power Systems",
            state: "submitted",
            amount: { amount: 7650000, currency: "BDT" },
            validUntil: "2026-07-01T00:00:00+06:00",
            submittedAt: "2026-06-04T12:00:00+06:00",
          },
        ],
        nextCursor: null,
      },
    },
  },
  {
    detail: {
      id: "rfq-000082",
      humanRef: "RFQ-2026-000082",
      title: "Conveyor belt vulcanizing — service",
      state: "expired",
      value: { amount: 240000, currency: "BDT" },
      summary:
        "Hot vulcanizing of two belt joints on the clinker conveyor; window lapsed unanswered.",
      category: "Conveyors & Transmission",
      workNature: ["service"],
      currentVersionNo: 1,
      deliveryLocation: "Chhatak works",
      neededBy: "2026-06-30",
      createdAt: "2026-05-15T09:00:00+06:00",
      updatedAt: "2026-06-15T00:00:00+06:00",
      permittedActions: [{ key: "reissue_rfq", label: "Reissue RFQ", emphasis: "primary" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-05-15T09:00:00+06:00" },
        { id: "l-2", label: "Vendors notified", at: "2026-05-20T10:00:00+06:00" },
        { id: "l-3", label: "Validity window lapsed", at: "2026-06-15T00:00:00+06:00" },
      ],
      quotations: { items: [], nextCursor: null },
    },
  },
  {
    detail: {
      id: "rfq-000075",
      humanRef: "RFQ-2026-000075",
      title: "Warehouse racking — fabricate",
      state: "cancelled",
      value: { amount: 1650000, currency: "BDT" },
      summary: "Heavy-duty pallet racking for the new finished-goods warehouse; project deferred.",
      category: "Storage & Racking",
      workNature: ["fabricate"],
      currentVersionNo: 1,
      deliveryLocation: "Narayanganj warehouse",
      neededBy: "2026-09-01",
      createdAt: "2026-05-10T09:00:00+06:00",
      updatedAt: "2026-06-01T11:00:00+06:00",
      permittedActions: [{ key: "reissue_rfq", label: "Reissue RFQ" }],
      lifecycle: [
        { id: "l-1", label: "RFQ created", at: "2026-05-10T09:00:00+06:00" },
        { id: "l-2", label: "Cancelled (reason audited)", at: "2026-06-01T11:00:00+06:00" },
      ],
      quotations: { items: [], nextCursor: null },
    },
  },
] as const;

/** The list projection (`list_rfqs`) — derived once from the universe, in last-updated order (the
 *  adapter's stand-in for the contract's governed order; the presentation never re-ranks — GI-04). */
export const BUYER_RFQ_LIST_ITEMS: readonly RfqListItem[] = BUYER_RFQ_UNIVERSE.map((r) => ({
  id: r.detail.id,
  humanRef: r.detail.humanRef,
  title: r.detail.title,
  state: r.detail.state,
  value: r.detail.value,
  category: r.detail.category,
  updatedAt: r.detail.updatedAt,
})).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Vendor universe — a coherent received-only fixture set standing in for the wired vendor-leg reads
// (owner directive 2026-07-18: the vendor RFQ Workspace shows data from the read path). Every row is
// an OWN/received fact (ND-1..ND-8 safe by construction): the vendor's own invitation + quotation
// state, plus the grant-scoped facts an invited vendor legitimately sees (buyer identity, category,
// the RFQ's estimated value). NO competitor count, rank, score, match confidence, or "why-not-invited"
// signal appears anywhere. States are the verbatim frozen Doc-4M tokens and are internally coherent
// (a `submitted` quotation implies an `accepted` invitation on a `quotations_received` RFQ, etc.).
// Outcome rows (`not_selected`/`declined`) omit the RFQ state so the vendor is never told the buyer
// awarded someone else. Ids are opaque; human refs display-only. Amounts are BDT (currency per value).
// At wiring (Wave 4) the adapter swaps to the GI-02 server layer and these fixtures fall away.
// ────────────────────────────────────────────────────────────────────────────────────────────────

/** Numeric quotation-submission quota (Doc-5I `monthly_rfq_limit`) — NEVER a plan name (Inv #10). */
export const VENDOR_QUOTA: QuotaView = {
  used: 3,
  limit: 10,
  resets_label: "Resets 1 Aug 2026",
};

// DEV/DEMO FIXTURE — all buyer names below are fictional; NOT real production RFQ data. Replaced by
// the GI-02 server read at wiring; an empty read renders the honest empty state (see sell/rfqs page).
export const VENDOR_RFQ_UNIVERSE: readonly VendorRfqRecord[] = [
  // ── New invitations (delivered — awaiting your accept/decline) ──────────────────────────────────
  {
    inbox: {
      rfq_id: "rfq-000481",
      rfq_human_ref: "RFQ-2026-000481",
      rfq_summary: "MS angle & channel — 12 ton, delivered to Kaliakoir",
      rfq_state: "vendors_notified",
      window_state: "open",
      window_deadline_label: "21 Jul 2026",
      window_urgency: "imminent",
      invitation_state: "delivered",
      buyer_org_name: "Orbitex Pharmaceuticals Ltd.",
      category_label: "Steel & Metals",
      estimated_value: 780000,
      currency: "BDT",
    },
    snapshot: {
      rfq_id: "rfq-000481",
      human_ref: "RFQ-2026-000481",
      buyer_org_name: "Orbitex Pharmaceuticals Ltd.",
      summary: "Structural MS angle and channel for the utility mezzanine, delivered to site.",
      state: "vendors_notified",
      scope_text:
        "Supply of MS angle 75×75×6 mm and channel 100 mm to BDS 1031 grade, cut to schedule.",
      work_nature: ["supply"],
      category_label: "Steel & Metals",
      estimated_value: 780000,
      currency: "BDT",
      delivery_geography: "Kaliakoir, Gazipur",
      window_state: "open",
      window_deadline_label: "21 Jul 2026",
      window_urgency: "imminent",
      item_name: "MS angle 75×75×6 & channel 100 mm",
      quantity: "12",
      unit: "ton",
    },
  },
  {
    inbox: {
      rfq_id: "rfq-000479",
      rfq_human_ref: "RFQ-2026-000479",
      rfq_summary: "Industrial ball valves — 40 pcs, CS flanged",
      rfq_state: "vendors_notified",
      window_state: "open",
      window_deadline_label: "24 Jul 2026",
      window_urgency: "soon",
      invitation_state: "delivered",
      unread_clarification: true,
      buyer_org_name: "Drivecore Automobiles Ltd.",
      category_label: "Valves & Fittings",
      estimated_value: 425000,
      currency: "BDT",
    },
    snapshot: {
      rfq_id: "rfq-000479",
      human_ref: "RFQ-2026-000479",
      buyer_org_name: "Drivecore Automobiles Ltd.",
      summary: "Carbon-steel ball valves for the compressed-air header, flanged ends.",
      state: "vendors_notified",
      scope_text: 'Supply of 2" CS ball valves, flanged, PN16, with test certificates.',
      work_nature: ["supply"],
      category_label: "Valves & Fittings",
      estimated_value: 425000,
      currency: "BDT",
      delivery_geography: "Bhaluka, Mymensingh",
      window_state: "open",
      window_deadline_label: "24 Jul 2026",
      window_urgency: "soon",
      item_name: '2" ball valve, CS, flanged PN16',
      quantity: "40",
      unit: "pcs",
    },
  },
  {
    inbox: {
      rfq_id: "rfq-000472",
      rfq_human_ref: "RFQ-2026-000472",
      rfq_summary: "PLC control panel — fabricate & install",
      rfq_state: "vendors_notified",
      window_state: "open",
      window_deadline_label: "31 Jul 2026",
      window_urgency: "normal",
      invitation_state: "delivered",
      buyer_org_name: "Freshvale Food & Beverage Ltd.",
      category_label: "Automation & Controls",
      estimated_value: 1650000,
      currency: "BDT",
    },
    snapshot: {
      rfq_id: "rfq-000472",
      human_ref: "RFQ-2026-000472",
      buyer_org_name: "Freshvale Food & Beverage Ltd.",
      summary: "Design, fabricate and install a PLC control panel for the packaging line.",
      state: "vendors_notified",
      scope_text: "Siemens S7-1200 based control panel, fabrication, wiring and on-site install.",
      work_nature: ["fabricate", "service"],
      category_label: "Automation & Controls",
      estimated_value: 1650000,
      currency: "BDT",
      delivery_geography: "Dhamrai, Dhaka",
      window_state: "open",
      window_deadline_label: "31 Jul 2026",
      window_urgency: "normal",
      item_name: "PLC control panel (Siemens S7-1200)",
      quantity: "1",
      unit: "lot",
    },
  },
  // ── Preparing quote (invitation accepted — draft or not yet started) ────────────────────────────
  {
    inbox: {
      rfq_id: "rfq-000465",
      rfq_human_ref: "RFQ-2026-000465",
      rfq_summary: "Centrifugal pump spares — impellers & seals",
      rfq_state: "vendors_notified",
      window_state: "open",
      window_deadline_label: "26 Jul 2026",
      window_urgency: "soon",
      invitation_state: "accepted",
      quotation_state: "draft",
      buyer_org_name: "Medipar Pharmaceuticals Ltd.",
      category_label: "Pumps & Compressors",
      estimated_value: 360000,
      currency: "BDT",
    },
    snapshot: {
      rfq_id: "rfq-000465",
      human_ref: "RFQ-2026-000465",
      buyer_org_name: "Medipar Pharmaceuticals Ltd.",
      summary: "Replacement impeller sets and mechanical seals for the ETP transfer pumps.",
      state: "vendors_notified",
      scope_text: "Supply of impeller sets and mechanical seals, OEM-equivalent acceptable.",
      work_nature: ["supply"],
      category_label: "Pumps & Compressors",
      estimated_value: 360000,
      currency: "BDT",
      delivery_geography: "Tongi, Gazipur",
      window_state: "open",
      window_deadline_label: "26 Jul 2026",
      window_urgency: "soon",
      item_name: "Impeller set + mechanical seals",
      quantity: "3",
      unit: "set",
    },
  },
  {
    inbox: {
      rfq_id: "rfq-000460",
      rfq_human_ref: "RFQ-2026-000460",
      rfq_summary: "HT cable 11kV 3×185mm² — 1.2 km",
      rfq_state: "vendors_notified",
      window_state: "open",
      window_deadline_label: "28 Jul 2026",
      window_urgency: "normal",
      invitation_state: "accepted",
      buyer_org_name: "Anchorstone Group",
      category_label: "Cables & Wiring",
      estimated_value: 2150000,
      currency: "BDT",
    },
    snapshot: {
      rfq_id: "rfq-000460",
      human_ref: "RFQ-2026-000460",
      buyer_org_name: "Anchorstone Group",
      summary: "11kV XLPE HT cable for the substation feeder replacement.",
      state: "vendors_notified",
      scope_text: "Supply of 1.2 km 11kV XLPE HT cable, 3×185 mm², with type-test reports.",
      work_nature: ["supply"],
      category_label: "Cables & Wiring",
      estimated_value: 2150000,
      currency: "BDT",
      delivery_geography: "Keraniganj, Dhaka",
      window_state: "open",
      window_deadline_label: "28 Jul 2026",
      window_urgency: "normal",
      item_name: "11kV XLPE HT cable 3×185 mm²",
      quantity: "1200",
      unit: "m",
    },
  },
  // ── Submitted (your quotation is with the buyer) ────────────────────────────────────────────────
  {
    inbox: {
      rfq_id: "rfq-000452",
      rfq_human_ref: "RFQ-2026-000452",
      rfq_summary: "SS316 process piping — fabricate 220 m",
      rfq_state: "quotations_received",
      window_state: "closed",
      window_deadline_label: "18 Jul 2026",
      invitation_state: "accepted",
      quotation_state: "submitted",
      buyer_org_name: "Greenfield Agro Group",
      category_label: "Piping & Fittings",
      estimated_value: 1980000,
      currency: "BDT",
    },
    snapshot: {
      rfq_id: "rfq-000452",
      human_ref: "RFQ-2026-000452",
      buyer_org_name: "Greenfield Agro Group",
      summary: "Fabrication of SS316 process piping for the beverage syrup room.",
      state: "quotations_received",
      scope_text: "Fabricate and install 220 m SS316 sch10 pipe with fittings and supports.",
      work_nature: ["fabricate"],
      category_label: "Piping & Fittings",
      estimated_value: 1980000,
      currency: "BDT",
      delivery_geography: "Palash, Narsingdi",
      window_state: "closed",
      window_deadline_label: "18 Jul 2026",
      item_name: "SS316 sch10 pipe + fittings",
      quantity: "220",
      unit: "m",
    },
  },
  {
    inbox: {
      rfq_id: "rfq-000448",
      rfq_human_ref: "RFQ-2026-000448",
      rfq_summary: "Diesel generator 250 kVA — supply",
      rfq_state: "quotations_received",
      window_state: "closed",
      window_deadline_label: "20 Jul 2026",
      invitation_state: "accepted",
      quotation_state: "submitted",
      buyer_org_name: "Voltiq Hi-Tech Industries",
      category_label: "Power Generation",
      estimated_value: 3250000,
      currency: "BDT",
    },
    snapshot: {
      rfq_id: "rfq-000448",
      human_ref: "RFQ-2026-000448",
      buyer_org_name: "Voltiq Hi-Tech Industries",
      summary: "250 kVA standby diesel generator with AMF panel and commissioning.",
      state: "quotations_received",
      scope_text: "Supply, install and commission one 250 kVA DG set with AMF changeover.",
      work_nature: ["supply", "service"],
      category_label: "Power Generation",
      estimated_value: 3250000,
      currency: "BDT",
      delivery_geography: "Chandra, Gazipur",
      window_state: "closed",
      window_deadline_label: "20 Jul 2026",
      item_name: "250 kVA DG set with AMF",
      quantity: "1",
      unit: "unit",
    },
  },
  // ── Shortlisted (the buyer is evaluating your quotation) ────────────────────────────────────────
  {
    inbox: {
      rfq_id: "rfq-000441",
      rfq_human_ref: "RFQ-2026-000441",
      rfq_summary: "Cooling tower overhaul — service",
      rfq_state: "shortlisted",
      window_state: "closed",
      window_deadline_label: "15 Jul 2026",
      invitation_state: "accepted",
      quotation_state: "shortlisted",
      buyer_org_name: "Ferrocon Industrial Group",
      category_label: "HVAC & Ventilation",
      estimated_value: 890000,
      currency: "BDT",
    },
    snapshot: {
      rfq_id: "rfq-000441",
      human_ref: "RFQ-2026-000441",
      buyer_org_name: "Ferrocon Industrial Group",
      summary: "Overhaul of two induced-draft cooling towers, including fill media.",
      state: "shortlisted",
      scope_text: "Replace fill media and drift eliminators; overhaul fans and gearboxes.",
      work_nature: ["service"],
      category_label: "HVAC & Ventilation",
      estimated_value: 890000,
      currency: "BDT",
      delivery_geography: "Sonargaon, Narayanganj",
      window_state: "closed",
      window_deadline_label: "15 Jul 2026",
      item_name: "CT fill media + fan overhaul",
      quantity: "2",
      unit: "tower",
    },
  },
  // ── Awarded (you won) ───────────────────────────────────────────────────────────────────────────
  {
    inbox: {
      rfq_id: "rfq-000433",
      rfq_human_ref: "RFQ-2026-000433",
      rfq_summary: "Boiler feed-water pump — supply & install",
      rfq_state: "closed_won",
      window_state: "closed",
      window_deadline_label: "10 Jul 2026",
      invitation_state: "accepted",
      quotation_state: "selected",
      buyer_org_name: "Metrocore Group",
      category_label: "Pumps & Compressors",
      estimated_value: 2695000,
      currency: "BDT",
    },
    snapshot: {
      rfq_id: "rfq-000433",
      human_ref: "RFQ-2026-000433",
      buyer_org_name: "Metrocore Group",
      summary: "Two centrifugal feed-water pumps for the Unit-2 boiler house, installed.",
      state: "closed_won",
      scope_text: "Supply, install and commission two 45 kW centrifugal feed-water pumps.",
      work_nature: ["supply", "service"],
      category_label: "Pumps & Compressors",
      estimated_value: 2695000,
      currency: "BDT",
      delivery_geography: "Gazipur",
      window_state: "closed",
      window_deadline_label: "10 Jul 2026",
      item_name: "45 kW feed-water pump",
      quantity: "2",
      unit: "unit",
    },
    engagement: { href: "/sell/engagements", acceptance_deadline_label: "Accept by 24 Jul 2026" },
  },
  // ── Not selected (your quotation was not chosen — carries no "why", ND-safe) ─────────────────────
  {
    inbox: {
      rfq_id: "rfq-000420",
      rfq_human_ref: "RFQ-2026-000420",
      rfq_summary: "Conveyor belt replacement — 180 m",
      window_state: "closed",
      window_deadline_label: "05 Jul 2026",
      invitation_state: "accepted",
      quotation_state: "not_selected",
      buyer_org_name: "Steelbridge Metals",
      category_label: "Conveyors & Transmission",
      estimated_value: 540000,
      currency: "BDT",
    },
    snapshot: {
      rfq_id: "rfq-000420",
      human_ref: "RFQ-2026-000420",
      buyer_org_name: "Steelbridge Metals",
      summary: "Replacement EP-500 conveyor belt for the raw-material feed line.",
      scope_text: "Supply of 180 m EP-500 conveyor belt with vulcanized joints.",
      work_nature: ["supply"],
      category_label: "Conveyors & Transmission",
      estimated_value: 540000,
      currency: "BDT",
      delivery_geography: "Sitakunda, Chattogram",
      window_state: "closed",
      window_deadline_label: "05 Jul 2026",
      item_name: "EP-500 conveyor belt",
      quantity: "180",
      unit: "m",
    },
  },
  // ── Declined (you declined the invitation — no longer active) ────────────────────────────────────
  {
    inbox: {
      rfq_id: "rfq-000415",
      rfq_human_ref: "RFQ-2026-000415",
      rfq_summary: "Warehouse racking — fabricate 800 slots",
      window_state: "closed",
      window_deadline_label: "02 Jul 2026",
      invitation_state: "declined",
      buyer_org_name: "Corvale Group",
      category_label: "Storage & Racking",
      estimated_value: 1250000,
      currency: "BDT",
    },
    snapshot: {
      rfq_id: "rfq-000415",
      human_ref: "RFQ-2026-000415",
      buyer_org_name: "Corvale Group",
      summary: "Selective pallet racking for the new finished-goods warehouse.",
      scope_text: "Fabricate and install selective pallet racking, 800 pallet positions.",
      work_nature: ["fabricate"],
      category_label: "Storage & Racking",
      estimated_value: 1250000,
      currency: "BDT",
      delivery_geography: "Rupganj, Narayanganj",
      window_state: "closed",
      window_deadline_label: "02 Jul 2026",
      item_name: "Selective pallet racking",
      quantity: "800",
      unit: "slot",
    },
  },
];
