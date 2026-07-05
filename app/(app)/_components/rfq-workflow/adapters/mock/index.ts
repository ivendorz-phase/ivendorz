// RFQ WORKFLOW — Mock adapter (the stand-in SERVER data layer).
//
// Implements `RfqWorkflowData` over the fixture universe. Everything a wired server layer would
// derive is derived HERE — counts, facets, fallback projections, ordering — never in a component
// (R7 / GI-04 / GI-10: the presentation renders what this layer supplies and computes nothing).
// Lookups by unknown id resolve to `null` ≡ genuine absence, so every page keeps its byte-identical
// not-found behaviour (GI-12 / Inv #11).

import type { RfqState } from "@/frontend/components/rfq";
import type { RfqPipelineStage } from "../../../../(buyer)/_components/view-models";
import type { JourneyBucketCount } from "../../journey";
import { BUYER_PIPELINE_BUCKETS } from "../../journey";
import type { RfqWorkflowData } from "../types";
import {
  BUYER_RFQ_LIST_ITEMS,
  BUYER_RFQ_UNIVERSE,
  VENDOR_QUOTA,
  VENDOR_RFQ_UNIVERSE,
} from "./rfq-universe";

/** Frozen lifecycle order for the per-state facet read (display order of the sourcing funnel). */
const RFQ_STATE_ORDER: readonly RfqState[] = [
  "draft",
  "pending_internal_approval",
  "submitted",
  "under_review",
  "matching",
  "vendors_notified",
  "quotations_received",
  "buyer_reviewing",
  "shortlisted",
  "closed_won",
  "closed_lost",
  "expired",
  "cancelled",
];

function findBuyerRecord(rfqId: string) {
  return BUYER_RFQ_UNIVERSE.find((r) => r.detail.id === rfqId) ?? null;
}

function findVendorRecord(rfqId: string) {
  return VENDOR_RFQ_UNIVERSE.find((r) => r.inbox.rfq_id === rfqId) ?? null;
}

/** The vendor journey buckets — own invitation/quotation facts only (ND-safe by construction). */
function vendorPipelineSummary(): JourneyBucketCount[] {
  const rows = VENDOR_RFQ_UNIVERSE.map((r) => r.inbox);
  const count = (predicate: (row: (typeof rows)[number]) => boolean) =>
    rows.filter(predicate).length;
  return [
    {
      key: "new",
      label: "New invitations",
      count: count((r) => r.invitation_state === "delivered"),
    },
    {
      key: "preparing",
      label: "Preparing quote",
      count: count(
        (r) =>
          r.invitation_state === "accepted" &&
          (r.quotation_state === undefined || r.quotation_state === "draft"),
      ),
    },
    {
      key: "submitted",
      label: "Submitted",
      count: count((r) => r.quotation_state === "submitted"),
    },
    {
      key: "shortlisted",
      label: "Shortlisted",
      count: count((r) => r.quotation_state === "shortlisted"),
    },
    { key: "won", label: "Awarded", count: count((r) => r.quotation_state === "selected") },
    {
      key: "not_selected",
      label: "Not selected",
      count: count((r) => r.quotation_state === "not_selected"),
    },
    {
      key: "closed",
      label: "Declined / expired",
      count: count(
        (r) =>
          r.invitation_state === "declined" ||
          r.invitation_state === "expired" ||
          r.quotation_state === "withdrawn" ||
          r.quotation_state === "expired",
      ),
    },
  ];
}

export const mockRfqWorkflowData: RfqWorkflowData = {
  buyer: {
    async listRfqs() {
      return {
        items: [...BUYER_RFQ_LIST_ITEMS],
        nextCursor: null,
        total: BUYER_RFQ_LIST_ITEMS.length,
      };
    },

    async getRfqPipeline(): Promise<RfqPipelineStage[]> {
      return RFQ_STATE_ORDER.map((state) => ({
        state,
        count: BUYER_RFQ_UNIVERSE.filter((r) => r.detail.state === state).length,
      })).filter((stage) => stage.count > 0);
    },

    async getPipelineSummary(): Promise<JourneyBucketCount[]> {
      return BUYER_PIPELINE_BUCKETS.map((bucket) => ({
        key: bucket.key,
        label: bucket.label,
        count: BUYER_RFQ_UNIVERSE.filter((r) => bucket.states.includes(r.detail.state)).length,
      }));
    },

    async getRfq(rfqId) {
      return findBuyerRecord(rfqId)?.detail ?? null;
    },

    async getRfqVersions(rfqId) {
      const record = findBuyerRecord(rfqId);
      if (!record) return null;
      if (record.versions) return record.versions;
      // Single-revision projection for fixtures without an amendment history (v1 = current content).
      const d = record.detail;
      return {
        id: d.id,
        humanRef: d.humanRef,
        state: d.state,
        currentVersionNo: d.currentVersionNo ?? 1,
        versions: [
          {
            versionNo: d.currentVersionNo ?? 1,
            content: {
              title: d.title,
              summary: d.summary,
              category: d.category,
              value: d.value,
              deliveryLocation: d.deliveryLocation,
              neededBy: d.neededBy,
            },
          },
        ],
      };
    },

    async getRoutingInvitations(rfqId) {
      const record = findBuyerRecord(rfqId);
      if (!record) return null;
      if (record.routing) return record.routing;
      // Honest empty log for RFQs routing has not reached (draft/approval/validation stages).
      const d = record.detail;
      return {
        id: d.id,
        humanRef: d.humanRef,
        state: d.state,
        routingLog: [],
        routingNextCursor: null,
        invitations: [],
        invitationsNextCursor: null,
      };
    },

    async getComparison(rfqId) {
      // Genuine absence before the first quotation (the statement auto-generates from it).
      return findBuyerRecord(rfqId)?.comparison ?? null;
    },

    async getAwardShortlist(rfqId) {
      const record = findBuyerRecord(rfqId);
      if (!record) return null;
      if (record.award) return record.award;
      // No shortlist yet ⇒ the award wizard's honest "shortlist first" empty (never a default winner).
      return { rfqId: record.detail.id, humanRef: record.detail.humanRef, candidates: [] };
    },

    async getQuotationDetail(rfqId, quotationId) {
      return findBuyerRecord(rfqId)?.quotationDetails?.find((q) => q.id === quotationId) ?? null;
    },
  },

  vendor: {
    async listInbox() {
      return VENDOR_RFQ_UNIVERSE.map((r) => r.inbox);
    },

    async getQuota() {
      return VENDOR_QUOTA;
    },

    async getPipelineSummary() {
      return vendorPipelineSummary();
    },

    async getRfqSnapshot(rfqId) {
      return findVendorRecord(rfqId)?.snapshot ?? null;
    },

    async getInvitation(rfqId) {
      return findVendorRecord(rfqId)?.invitation ?? null;
    },

    async getOwnQuotation(rfqId) {
      return findVendorRecord(rfqId)?.quotation ?? null;
    },

    async getEngagementHandoff(rfqId) {
      return findVendorRecord(rfqId)?.engagement ?? null;
    },

    async getQuotationDraft(rfqId) {
      return findVendorRecord(rfqId)?.builder ?? null;
    },
  },
};
