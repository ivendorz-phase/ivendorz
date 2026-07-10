// Engagement status chip (companion §13.3). Maps the FROZEN engagement status token (Doc-2 §3.5 /
// Doc-4F) to {tone, label}. The kit StatusChip invents nothing; THIS surface derives label + tone. The
// engagement status is a post-award OPERATIONAL state — not a governance signal and not a score
// (trust-badge is intentionally absent on every engagement surface). Presentation-only; RSC-friendly.
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import type { EngagementStatus } from "./types";

const STATUS_MAP: Record<EngagementStatus, { tone: StatusTone; label: string }> = {
  open: { tone: "info", label: "Open" },
  in_delivery: { tone: "info", label: "In delivery" },
  completed: { tone: "success", label: "Completed" },
  closed: { tone: "neutral", label: "Closed" },
};

export function EngagementStatusChip({ status }: { status?: EngagementStatus }) {
  if (!status) return null;
  const spec = STATUS_MAP[status];
  return <StatusChip tone={spec.tone} label={spec.label} />;
}
