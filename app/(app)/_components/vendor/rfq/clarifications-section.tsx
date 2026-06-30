// S8 Clarifications — the M6 clarification thread embedded in the RFQ detail (companion §6.6,
// Doc-7G §11.1 / CHK-7-005). Scope is buyer↔THIS-vendor only ([ESC-7G-Q-05] CONFIRMED, Doc-4H
// BC-COMM-1 participant-scoped); it is DELIVERY-ONLY and distinct from the Doc-7C notification center.
// An unread indicator is an own-record fact only (never an exclusion / "not matched" event — ND-4).
//
// Messaging is DEFERRED in this milestone: the thread area renders read-only and the composer is
// disabled with an honest note. Presentation-only; RSC-friendly.
import { MessageSquare } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";

export interface ClarificationsSectionProps {
  /** Own-record fact only — never an exclusion signal (§6.6 / ND-4). */
  hasUnread?: boolean;
}

export function ClarificationsSection({ hasUnread }: ClarificationsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare aria-hidden="true" className="size-4 text-muted-foreground" />
          Clarifications
        </CardTitle>
        {hasUnread ? <span className="text-xs font-medium text-iv-info-text">Unread</span> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <EmptyState
          title="No messages yet"
          description="Messages between you and the buyer about this RFQ appear here. Only you and the buyer can see this thread."
        />
        <div className="border-t border-border pt-3">
          <Button type="button" variant="outline" size="sm" disabled>
            Send a message
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Messaging connects in the integration phase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
