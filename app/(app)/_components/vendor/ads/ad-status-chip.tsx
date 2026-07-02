// Ad status chip (P-VND-12/13/14). Maps the FROZEN `advertisements.status` token (Doc-2 §5.8) to
// {tone, label} — the kit StatusChip invents nothing; THIS surface derives label + tone, mirroring
// the already-shipped admin `AD_STATUS_META` (P-ADM-10/11) but covering the FULL vendor-visible
// machine (draft/active/paused/completed are never reached on the admin review surface, which only
// ever sees pending_review/scheduled/rejected). Presentation-only; RSC-friendly.
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import type { AdStatus } from "./types";

const STATUS_MAP: Record<AdStatus, { tone: StatusTone; label: string }> = {
  draft: { tone: "neutral", label: "Draft" },
  pending_review: { tone: "warning", label: "Pending review" },
  scheduled: { tone: "info", label: "Scheduled" },
  active: { tone: "success", label: "Active" },
  paused: { tone: "neutral", label: "Paused" },
  rejected: { tone: "neutral", label: "Rejected" },
  completed: { tone: "neutral", label: "Completed" },
};

export function AdStatusChip({ status }: { status?: AdStatus }) {
  if (!status) return null;
  const spec = STATUS_MAP[status];
  return <StatusChip tone={spec.tone} label={spec.label} />;
}

export const AD_PLACEMENT_LABEL: Record<
  "landing" | "bottom" | "search" | "vendor_profile",
  string
> = {
  landing: "Landing",
  bottom: "Bottom bar",
  search: "Search results",
  vendor_profile: "Vendor profile",
};
