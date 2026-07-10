// E2 Engagement overview (companion §13.3 → (app)/engagements/[engagementId]). Read =
// `ops.get_engagement.v1` (8-field projection). The awarded-RFQ reference is NOT projected by the read
// ([ESC-7G-ENG-01]) — shown as "pending projection", never a live ref (even though the table has an
// rfq_id column). The buyer is a known party but only buyer_organization_id (UUID) is returned; a
// display name needs M1 resolution ([ESC-7G-ENG-02]) — absent → a neutral label. Lifecycle shows only
// the single next legal edge; in_delivery → completed is irreversible (confirm) [m-2]. All actions
// disabled in the presentation phase. Presentation-only; RSC-friendly.
//
// FE-VEN-08 delta (P-VND-24 — frozen-conformance fix): the lifecycle control previously rendered the
// SAME hardcoded "Mark delivered → completed" button regardless of the engagement's actual status —
// wrong on 3 of 4 statuses. The FROZEN machine (companion, quoted verbatim: "open → in_delivery →
// completed → closed; only the single next legal edge is shown; closed reached only via
// ops.close_engagement.v1 on completed → closed; open→closed/in_delivery→closed not offered; closed
// terminal") is now honored per-status: only the real next edge is ever shown.
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { DescriptionList, type DescriptionItem, PresentationFormNote } from "../shared";
import { EngagementStatusChip } from "./engagement-status-chip";
import type { EngagementStatus, EngagementView } from "./types";

interface LifecycleEdge {
  label: string;
  note: string;
}

/** The single next legal edge for a given status — FROZEN machine, never a coined transition. */
function nextLegalEdge(status?: EngagementStatus): LifecycleEdge | null {
  switch (status) {
    case "open":
      return {
        label: "Mark in delivery",
        note: "Moves the engagement into delivery.",
      };
    case "in_delivery":
      return {
        label: "Mark delivered → completed",
        note: "Marking complete is one-way and cannot be reopened.",
      };
    case "completed":
      return {
        label: "Close engagement",
        note: "Closing is final.",
      };
    case "closed":
    default:
      return null;
  }
}

export interface EngagementOverviewProps {
  engagement?: EngagementView;
}

export function EngagementOverview({ engagement }: EngagementOverviewProps) {
  const edge = nextLegalEdge(engagement?.status);
  const items: DescriptionItem[] = [
    // Awarded-RFQ ref is not projected by get_engagement ([ESC-7G-ENG-01]) — never a live ref.
    { label: "Awarded from RFQ", value: <span className="text-muted-foreground">Pending</span> },
    { label: "Buyer", value: engagement?.buyer_label ?? "Buyer organization" },
    {
      label: "Award value",
      value:
        typeof engagement?.award_value_snapshot === "number" ? (
          <CurrencyDisplay
            amount={engagement.award_value_snapshot}
            currency={engagement.currency ?? "BDT"}
          />
        ) : undefined,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Overview</CardTitle>
        <EngagementStatusChip status={engagement?.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        <DescriptionList items={items} />

        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lifecycle
          </p>
          {edge ? (
            <>
              <Button type="button" variant="outline" size="sm" disabled>
                {edge.label}
              </Button>
              <p className="text-xs text-muted-foreground">{edge.note}</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">This engagement is closed.</p>
          )}
        </div>

        <PresentationFormNote />
      </CardContent>
    </Card>
  );
}
