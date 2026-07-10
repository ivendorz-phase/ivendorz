// P-VND-14 Ad submission / status. The vendor's own view of one ad's lifecycle — mirrors the
// admin detail (P-ADM-11) in read fields but is action-DISTINCT: Approve/Reject is staff-only
// (`review_advertisement.v1`, never offered here); the vendor-side actions are Submit
// (`submit_advertisement.v1`, `draft → pending_review` only) and Pause/Resume
// (`set_advertisement_state.v1`, `active ⇄ paused` only) — `scheduled → active` and
// `active → completed` are SYSTEM-driven, never a button here. Every action is disabled in the
// presentation phase. RSC-friendly.
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { DescriptionList, type DescriptionItem, PresentationFormNote } from "../shared";
import { AdStatusChip, AD_PLACEMENT_LABEL } from "./ad-status-chip";
import type { AdStatus, AdView } from "./types";

interface StatusAction {
  label: string;
  note: string;
}

/** The single vendor-actionable affordance for a given status, if any — never a coined transition. */
function vendorAction(status?: AdStatus): StatusAction | null {
  switch (status) {
    case "draft":
      return {
        label: "Submit for review",
        note: "Submitting requires your creative to be complete and a billing purchase on file.",
      };
    case "active":
      return { label: "Pause", note: "Pausing stops the ad from showing until you resume it." };
    case "paused":
      return { label: "Resume", note: "Resuming restarts the ad on its existing schedule." };
    default:
      return null;
  }
}

function statusNote(status?: AdStatus): string | null {
  switch (status) {
    case "pending_review":
      return "Awaiting admin review. You'll be notified once it's approved or rejected.";
    case "scheduled":
      return "Approved — this ad will go live automatically on its start date.";
    case "completed":
      return "This ad's run has finished.";
    default:
      return null;
  }
}

export interface AdDetailPanelProps {
  ad?: AdView;
}

export function AdDetailPanel({ ad }: AdDetailPanelProps) {
  const action = vendorAction(ad?.status);
  const note = statusNote(ad?.status);

  const items: DescriptionItem[] = [
    { label: "Creative reference", value: ad?.creative_ref },
    { label: "Placement", value: ad?.placement ? AD_PLACEMENT_LABEL[ad.placement] : undefined },
    {
      label: "Schedule",
      value:
        ad?.schedule?.start && ad?.schedule?.end
          ? `${ad.schedule.start} – ${ad.schedule.end}`
          : undefined,
    },
    { label: "Advertised profile", value: ad?.vendor_profile_label },
    {
      label: "Billing purchase ref",
      value: ad?.platform_invoice_id ? (
        <span className="font-mono text-xs">{ad.platform_invoice_id}</span>
      ) : undefined,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Advertisement</CardTitle>
        <AdStatusChip status={ad?.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        <DescriptionList items={items} />

        {ad?.status === "rejected" ? (
          <div className="space-y-1 border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Rejection reason
            </p>
            <p className="text-sm text-foreground">
              {ad.review_reason ?? "No reason was recorded."}
            </p>
          </div>
        ) : null}

        {action ? (
          <div className="space-y-2 border-t border-border pt-4">
            <Button type="button" variant="outline" size="sm" disabled>
              {action.label}
            </Button>
            <p className="text-xs text-muted-foreground">{action.note}</p>
          </div>
        ) : note ? (
          <p className="border-t border-border pt-4 text-sm text-muted-foreground">{note}</p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          This ad governs visibility and placement only — it never affects your trust, eligibility,
          routing, or matching.
        </p>

        <PresentationFormNote />
      </CardContent>
    </Card>
  );
}
