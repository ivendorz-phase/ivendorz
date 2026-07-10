// Document status chips + kind labels for the engagement document set (companion §13.3). Maps the
// FROZEN trade_invoice_status / payment_record_status tokens (Doc-2 §10.5) to {tone, label}, and the
// FROZEN engagement_document_kind enum to display labels. The kit StatusChip invents nothing. These are
// OPERATIONAL record states (off-platform money records), never settlement and never a governance
// signal. Presentation-only; RSC-friendly.
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import type { EngagementDocumentKind, PaymentRecordStatus, TradeInvoiceStatus } from "./types";

/** Frozen engagement_document_kind labels — exactly the four versioned kinds. */
export const DOC_KIND_LABEL: Record<EngagementDocumentKind, string> = {
  loi: "LOI",
  po: "Purchase Order",
  challan: "Challan",
  wcc: "Work Completion Certificate",
};

const TRADE_INVOICE_MAP: Record<TradeInvoiceStatus, { tone: StatusTone; label: string }> = {
  issued: { tone: "info", label: "Issued" },
  partially_paid: { tone: "warning", label: "Partially paid" },
  paid: { tone: "success", label: "Paid" },
  disputed: { tone: "danger", label: "Disputed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

const PAYMENT_MAP: Record<PaymentRecordStatus, { tone: StatusTone; label: string }> = {
  recorded: { tone: "info", label: "Recorded" },
  confirmed: { tone: "success", label: "Confirmed" },
};

export function TradeInvoiceStatusChip({ status }: { status?: TradeInvoiceStatus }) {
  if (!status) return null;
  const spec = TRADE_INVOICE_MAP[status];
  return <StatusChip tone={spec.tone} label={spec.label} />;
}

export function PaymentStatusChip({ status }: { status?: PaymentRecordStatus }) {
  if (!status) return null;
  const spec = PAYMENT_MAP[status];
  return <StatusChip tone={spec.tone} label={spec.label} />;
}
