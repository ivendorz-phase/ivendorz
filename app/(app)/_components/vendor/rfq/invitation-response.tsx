// S3 RFQ Detail — YOUR INVITATION pane (companion §6.3/§6.5). The vendor accepts or declines the
// invitation (`delivered → {accepted | declined}` via `respond_to_invitation`) and starts a quotation.
// Decline is permanent FOR THIS INVITATION only — the vendor can still be invited to other RFQs and
// there is NO score penalty (firewall; non-leaking copy, §6.5). All actions are disabled in the
// presentation phase. The "Start quotation" CTA links to S4; one quota unit is used only at SUBMIT.
// Presentation-only; RSC-friendly.
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { InvitationStateChip } from "./state-chips";
import { QuotaMeter } from "./quota-meter";
import { PresentationFormNote } from "../shared";
import type { InvitationView, QuotaView } from "./types";

export interface InvitationResponseProps {
  rfqId: string;
  invitation?: InvitationView;
  quota?: QuotaView;
  /** True once the vendor has a quotation on this RFQ — the CTA becomes "Resume" (companion §6.5 B). */
  hasQuotation?: boolean;
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function InvitationResponse({
  rfqId,
  invitation,
  quota,
  hasQuotation,
  basePath = "/workspace",
}: InvitationResponseProps) {
  const responded =
    invitation?.state === "accepted" ||
    invitation?.state === "declined" ||
    invitation?.state === "expired";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Your invitation</CardTitle>
        <InvitationStateChip state={invitation?.state} />
      </CardHeader>
      <CardContent className="space-y-4">
        {invitation?.delivered_at ? (
          <p className="text-sm text-muted-foreground">Delivered {invitation.delivered_at}</p>
        ) : null}

        {!responded ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled>
              Accept invitation
            </Button>
            <Button type="button" variant="outline" disabled>
              Decline
            </Button>
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Declining is permanent for this invitation. You can still be invited to other RFQs, and it
          carries no score penalty.
        </p>

        <div className="border-t border-border pt-4">
          <Button asChild className="w-full sm:w-auto">
            <Link href={`${basePath}/rfqs/${rfqId}/quotation`}>
              {hasQuotation ? "Resume quotation →" : "Start quotation →"}
            </Link>
          </Button>
          <div className="mt-3">
            <QuotaMeter quota={quota} />
          </div>
        </div>

        <PresentationFormNote />
      </CardContent>
    </Card>
  );
}
