// Window sub-state chip (companion §7.1, Invariant 4) — a SECOND, independent chip orthogonal to the
// Doc-4M RFQ/quotation state. This is a UI-derived affordance ([ESC-7B-WINDOW-CHIP], pending kit
// addition); it is NOT backed by a coined Doc-4M token. The deadline is a server-formatted label
// (Asia/Dhaka / BST) and any urgency tier is caller/server-supplied — there is no client clock in the
// presentation phase (no live countdown). Presentation-only; RSC-friendly.
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import type { WindowState, WindowUrgency } from "./types";

const BASE: Record<WindowState, { tone: StatusTone; label: string }> = {
  open: { tone: "info", label: "Open" },
  open_late: { tone: "warning", label: "Open · late" },
  closed: { tone: "neutral", label: "Closed" },
};

// Urgency only escalates the tone of an OPEN window (companion: warning <24h, danger <2h).
const URGENCY_TONE: Record<WindowUrgency, StatusTone> = {
  normal: "info",
  soon: "warning",
  imminent: "danger",
};

export interface WindowStateChipProps {
  state?: WindowState;
  deadlineLabel?: string;
  urgency?: WindowUrgency;
}

export function WindowStateChip({ state, deadlineLabel, urgency }: WindowStateChipProps) {
  if (!state) return null;
  const base = BASE[state];
  const tone = state === "open" && urgency ? URGENCY_TONE[urgency] : base.tone;
  const label = deadlineLabel ? `${base.label} — ${deadlineLabel}` : base.label;
  return <StatusChip tone={tone} label={label} />;
}
