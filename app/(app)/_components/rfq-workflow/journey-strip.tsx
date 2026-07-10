// RFQ WORKFLOW — Journey strip (NAVIGATION-NOT-STATE orientation rail).
//
// A compact horizontal rail showing where an RFQ sits on the presentation journey. It is an
// ORIENTATION/NAVIGATION aid only — lifecycle truth is the frozen state token rendered by the
// page's `RfqStateChip`/`StatusChip`; this strip never replaces or restyles it (the FE-DOC
// LifecycleStrip ruling: navigation, not state). Pure function of props — a Server Component with
// no fetch and no client state (Content ≠ Presentation, Inv #9).
//
// Terminal non-award outcomes (`closed_lost`/`expired`/`cancelled`): the rail renders with NO
// active stage and a plain "closed without award" note — an ended journey is never drawn as
// progress. Buyer-leg stage pills deep-link to each stage's primary surface for THIS RFQ (opaque
// id only — Inv #5); links are plain GET navigation.

import Link from "next/link";
import type { RfqState, InvitationState, QuotationState } from "@/frontend/components/rfq";
import { cn } from "@/frontend/lib/cn";
import {
  RFQ_JOURNEY,
  TERMINAL_RFQ_OUTCOMES,
  VENDOR_JOURNEY,
  journeyStageForRfqState,
  vendorJourneyStageFor,
} from "./journey";

const PILL_BASE =
  "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs whitespace-nowrap";
const PILL_ACTIVE = "border-transparent bg-primary font-medium text-primary-foreground";
const PILL_DONE = "border-border bg-muted text-foreground";
const PILL_UPCOMING = "border-border text-muted-foreground";

export interface RfqJourneyStripProps {
  /** Frozen Doc-4M RFQ state (buyer leg) — drives which presentation stage reads as active. */
  state: RfqState;
  /** Opaque RFQ id for the stage deep-links (never a human ref — Inv #5). */
  rfqId: string;
  className?: string;
}

/** Buyer-leg journey rail — the full authoring → post-award journey. */
export function RfqJourneyStrip({ state, rfqId, className }: RfqJourneyStripProps) {
  const active = journeyStageForRfqState(state);
  const activeIndex = active ? RFQ_JOURNEY.findIndex((s) => s.key === active.key) : -1;
  const endedWithoutAward = TERMINAL_RFQ_OUTCOMES.includes(state);

  return (
    <nav aria-label="RFQ journey (orientation)" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {RFQ_JOURNEY.map((stage, index) => {
          const tone =
            activeIndex === -1
              ? PILL_UPCOMING
              : index < activeIndex
                ? PILL_DONE
                : index === activeIndex
                  ? PILL_ACTIVE
                  : PILL_UPCOMING;
          const href = stage.buyerHref?.(rfqId);
          const pill = (
            <span
              className={cn(PILL_BASE, tone)}
              aria-current={index === activeIndex ? "step" : undefined}
            >
              {stage.label}
            </span>
          );
          return (
            <li key={stage.key} className="flex shrink-0 items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden="true" className="text-xs text-muted-foreground/60">
                  ›
                </span>
              ) : null}
              {href && !endedWithoutAward ? (
                <Link
                  href={href}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title={stage.summary}
                >
                  {pill}
                </Link>
              ) : (
                pill
              )}
            </li>
          );
        })}
        {endedWithoutAward ? (
          <li className="shrink-0 pl-1 text-xs text-muted-foreground">Closed without award</li>
        ) : null}
      </ol>
    </nav>
  );
}

export interface VendorJourneyStripProps {
  /** The vendor's OWN invitation state on this RFQ (frozen Doc-4M). */
  invitationState?: InvitationState;
  /** The vendor's OWN quotation state on this RFQ (frozen Doc-4M). */
  quotationState?: QuotationState;
  className?: string;
}

/** Vendor-leg journey rail — own invitation/quotation facts only (received-only; ND-safe). */
export function VendorJourneyStrip({
  invitationState,
  quotationState,
  className,
}: VendorJourneyStripProps) {
  const active = vendorJourneyStageFor(invitationState, quotationState);
  const activeIndex = active ? VENDOR_JOURNEY.findIndex((s) => s.key === active.key) : -1;
  const ended =
    !active &&
    (invitationState === "declined" ||
      invitationState === "expired" ||
      quotationState === "withdrawn" ||
      quotationState === "expired");

  return (
    <nav aria-label="Quotation journey (orientation)" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {VENDOR_JOURNEY.map((stage, index) => {
          const tone =
            activeIndex === -1
              ? PILL_UPCOMING
              : index < activeIndex
                ? PILL_DONE
                : index === activeIndex
                  ? PILL_ACTIVE
                  : PILL_UPCOMING;
          return (
            <li key={stage.key} className="flex shrink-0 items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden="true" className="text-xs text-muted-foreground/60">
                  ›
                </span>
              ) : null}
              <span
                className={cn(PILL_BASE, tone)}
                title={stage.summary}
                aria-current={index === activeIndex ? "step" : undefined}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
        {ended ? (
          <li className="shrink-0 pl-1 text-xs text-muted-foreground">No longer in progress</li>
        ) : null}
      </ol>
    </nav>
  );
}
