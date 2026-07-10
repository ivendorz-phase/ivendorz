// Lead pipeline stage chip (companion §13.2). Maps the FROZEN vendor_leads.stage token (Doc-5F /
// Doc-2 §3.5) to {tone, label} — the kit StatusChip invents nothing; THIS surface derives label + tone.
//
// FIREWALL (R6, NIT-1): a lead's stage is the vendor's PRIVATE CRM, NEVER the RFQ award and NEVER a
// governance signal. `won` therefore uses a neutral/brand tone (NOT `success`) so the system never
// voices an affirmative award reading, and both `won`/`lost` carry an explicit "(CRM)" qualifier so the
// label can never be mistaken for the platform outcome. trust-badge is intentionally absent here.
// Presentation-only; RSC-friendly.
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import type { LeadStage } from "./types";

const STAGE_MAP: Record<LeadStage, { tone: StatusTone; label: string }> = {
  received: { tone: "info", label: "Received" },
  quoted: { tone: "info", label: "Quoted" },
  negotiation: { tone: "info", label: "Negotiation" },
  won: { tone: "brand", label: "Won (CRM)" },
  lost: { tone: "neutral", label: "Lost (CRM)" },
  follow_up: { tone: "neutral", label: "Follow-up" },
};

export function LeadStageChip({ stage }: { stage?: LeadStage }) {
  if (!stage) return null;
  const spec = STAGE_MAP[stage];
  return <StatusChip tone={spec.tone} label={spec.label} />;
}
