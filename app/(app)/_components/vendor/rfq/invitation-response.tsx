"use client";

// S3 RFQ Detail — YOUR INVITATION pane (companion §6.3/§6.5). The vendor accepts or declines the
// invitation (`delivered → {accepted | declined}` via `respond_to_invitation`) and starts a quotation.
// Decline is permanent FOR THIS INVITATION only — the vendor can still be invited to other RFQs and
// there is NO score penalty (firewall; non-leaking copy, §6.5). The "Start quotation" CTA links to S4;
// one quota unit is used only at SUBMIT.
//
// FE-VEN-05 delta (clearer respond/decline affordances): Decline reads as the more consequential
// action (outline + destructive-toned label, matching the kit's existing outline/destructive
// vocabulary — no new variant), and `aria-describedby` ties it directly to the no-penalty consequence
// note so the causal link ("declining does X") is announced together, not just visually adjacent.
//
// Owner-directed Vendor Quotation Submission workflow integration: Accept/Decline are now live,
// client-local-only state (no `respond_to_invitation` call exists yet — this is a presentation-only
// mock of the transition, not a wired mutation).
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { InvitationStateChip } from "./state-chips";
import { QuotaMeter } from "./quota-meter";
import { PresentationFormNote } from "../shared";
import type { InvitationState, InvitationView, QuotaView } from "./types";

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
  const [localState, setLocalState] = useState<InvitationState | undefined>(invitation?.state);
  const responded =
    localState === "accepted" || localState === "declined" || localState === "expired";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Your invitation</CardTitle>
        <InvitationStateChip state={localState} />
      </CardHeader>
      <CardContent className="space-y-4">
        {invitation?.delivered_at ? (
          <p className="text-sm text-muted-foreground">Delivered {invitation.delivered_at}</p>
        ) : null}

        {!responded && invitation ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setLocalState("accepted")}>
              Accept invitation
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:text-destructive"
              aria-describedby="invitation-decline-note"
              onClick={() => setLocalState("declined")}
            >
              Decline
            </Button>
          </div>
        ) : null}
        <p id="invitation-decline-note" className="text-xs text-muted-foreground">
          Declining is permanent for this invitation. You can still be invited to other RFQs, and it
          carries no score penalty.
        </p>

        {localState === "declined" ? (
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            You declined this invitation. It carries no score penalty and does not affect your
            standing on other RFQs.
          </div>
        ) : (
          <div className="border-t border-border pt-4">
            <Button
              asChild
              className="w-full sm:w-auto"
              disabled={!invitation || localState !== "accepted"}
            >
              <Link
                href={
                  !invitation || localState !== "accepted"
                    ? "#"
                    : `${basePath}/rfqs/${rfqId}/quotation`
                }
                aria-disabled={!invitation || localState !== "accepted"}
                tabIndex={!invitation || localState !== "accepted" ? -1 : undefined}
              >
                {hasQuotation ? "Resume quotation →" : "Start quotation →"}
              </Link>
            </Button>
            {invitation && localState !== "accepted" ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Accept the invitation to start your quotation.
              </p>
            ) : null}
            <div className="mt-3">
              <QuotaMeter quota={quota} />
            </div>
          </div>
        )}

        <PresentationFormNote />
      </CardContent>
    </Card>
  );
}
