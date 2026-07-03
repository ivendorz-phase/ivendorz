// Doc-7B kit — comparison ATTRIBUTE ROWS (the descriptive rows of the transposed matrix). Promoted from
// the buyer-scoped `P-BUY-15` realization (Shared Platform Component Registry §4.2 CTO override —
// 2026-07-03). Each row knows how to render its cell from a `ComparisonSupplier` using the shared kit/
// format helpers. PRESENTATION-ONLY: pure render of already-resolved values; it computes nothing, ranks
// nothing, and surfaces no score/winner.
//
// The row SET is the Board's allowed descriptive field list (Supplier is the column identity, not a row).
// There is deliberately NO trust/performance/match score or standing-band row (firewalled signals stay
// firewalled; R6 / Doc-3 §9.1). Sealed cells explain the seal (Doc-3 §10.1) via the shared `SealedMarker`,
// never a vendor deficiency.

import * as React from "react";
import { StatusChip } from "@/frontend/components/status-chip";
import { Money, formatDate } from "@/frontend/components/format";
import { quotationStateDisplay } from "@/frontend/components/quotation-state-display";
import { SealedMarker } from "@/frontend/components/sealed-marker";
import type { ComparisonSupplier } from "./comparison-view-models";

/** An em-dash for an absent value (no fabrication). */
function Dash() {
  return <span className="text-muted-foreground">—</span>;
}

/**
 * Resolve a protected-commercial-term cell. If the value is present, show it. If ABSENT AND the supplier is
 * sealed, EXPLAIN the seal (`SealedMarker`) — mirrors the quotation detail's whole-card seal behavior so a
 * server-omitted protected term never reads as "the vendor provided nothing" (Doc-3 §10.1). Otherwise an
 * em-dash.
 */
function sealedAware(sealed: boolean | undefined, present: React.ReactNode | null) {
  if (present) return present;
  if (sealed) return <SealedMarker />;
  return <Dash />;
}

export interface ComparisonAttribute {
  /** Stable row key (also the React key). */
  key: string;
  /** Row-header label (rendered in the sticky first column as `<th scope="row">`). */
  label: string;
  /** Render this attribute's cell for one supplier — pure presentation of the resolved value. */
  cell: (supplier: ComparisonSupplier) => React.ReactNode;
}

/** The descriptive comparison rows, in a fixed presentation order (the SUPPLIER columns carry the System
 *  order; these attribute rows are a stable spec list, not a ranking). */
export const COMPARISON_ATTRIBUTES: ComparisonAttribute[] = [
  {
    key: "status",
    label: "Status",
    // R6 / Inv #12: in the COMPARISON the status tone is UNIFORMLY NEUTRAL — no column may read as a
    // winner (`selected`→success) or a soft-positive (`shortlisted`→brand) cue. The factual state LABEL is
    // still shown (Status is a Board-allowed descriptive field); only the winner/positive COLOUR is removed.
    cell: (s) => <StatusChip label={quotationStateDisplay(s.state).label} tone="neutral" />,
  },
  {
    key: "price",
    label: "Quoted price",
    cell: (s) => sealedAware(s.sealed, s.amount ? <Money value={s.amount} /> : null),
  },
  {
    key: "delivery",
    label: "Delivery",
    cell: (s) => sealedAware(s.sealed, s.delivery ? <span>{s.delivery}</span> : null),
  },
  {
    key: "warranty",
    label: "Warranty",
    cell: (s) => sealedAware(s.sealed, s.warranty ? <span>{s.warranty}</span> : null),
  },
  {
    key: "validity",
    label: "Valid until",
    cell: (s) =>
      sealedAware(s.sealed, s.validUntil ? <span>{formatDate(s.validUntil)}</span> : null),
  },
  {
    key: "compliance",
    label: "Compliance",
    cell: (s) => sealedAware(s.sealed, s.compliance ? <span>{s.compliance}</span> : null),
  },
  {
    key: "attachments",
    label: "Attachments",
    cell: (s) =>
      typeof s.attachmentsCount === "number" ? (
        <span>{s.attachmentsCount === 1 ? "1 file" : `${s.attachmentsCount} files`}</span>
      ) : (
        <Dash />
      ),
  },
];
