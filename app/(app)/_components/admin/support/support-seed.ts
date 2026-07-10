// Support reads — presentation SEED (P-ADM-29 · Doc-7H · J-ADM · `staff_can_support` scope). A curated mock of
// the staff support-ticket read list standing in for the unwired read — NOT data, coins nothing.
// `support_tickets` are OWNED BY M6/Communication (A-04), tenant-owned WITH platform-staff access; this surface
// is a READ-ONLY staff scope (`staff_can_support`, Doc-5H) — no decision action is invoked here (R5: any
// support mutation is owned by M6). Fields bind to frozen `support_tickets` (Doc-2:816): `subject`, `priority`,
// `status(open/in_progress/resolved/closed)`, `organization_id` (the opening org, resolved to a display name).
// `priority` is a frozen field whose value set the corpus does not enumerate — the labels here are illustrative,
// not a coined enum. FIREWALL: no governance score. No fabricated total (GI-03).
import type { StatusTone } from "@/frontend/components/status-chip";

// Frozen `support_tickets` status machine (Doc-2:362/816): open → in_progress → resolved → closed.
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicketVM {
  /** `support_tickets.id` — opaque platform id (no human_ref); display only. */
  id: string;
  subject: string;
  /** Opening org (`organization_id`), resolved to a display name — staff support scope. */
  organization: string;
  /** Frozen `support_tickets.priority` — value set not enumerated in the corpus; label illustrative. */
  priority: string;
  /** When the ticket was opened (relative) — display only. */
  opened: string;
  status: TicketStatus;
}

export const TICKET_STATUS_META: Record<TicketStatus, { label: string; tone: StatusTone }> = {
  open: { label: "Open", tone: "warning" },
  in_progress: { label: "In progress", tone: "info" },
  resolved: { label: "Resolved", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
};

export const SUPPORT_TICKETS: SupportTicketVM[] = [
  {
    id: "tkt-05512",
    subject: "Cannot upload spec documents to a product",
    organization: "Rupsha Engineering Works",
    priority: "High",
    opened: "40 min ago",
    status: "open",
  },
  {
    id: "tkt-05509",
    subject: "RFQ invitation not received for open tender",
    organization: "Delta Fabrication Ltd.",
    priority: "High",
    opened: "2h ago",
    status: "in_progress",
  },
  {
    id: "tkt-05504",
    subject: "How do I change my organization slug?",
    organization: "Meghna Industrial Buyers",
    priority: "Normal",
    opened: "5h ago",
    status: "open",
  },
  {
    id: "tkt-05498",
    subject: "Quotation comparison export is blank",
    organization: "Padma Procurement Cell",
    priority: "Normal",
    opened: "1d ago",
    status: "in_progress",
  },
  {
    id: "tkt-05490",
    subject: "Verified badge not showing after approval",
    organization: "Bay Valves & Controls",
    priority: "Low",
    opened: "2d ago",
    status: "resolved",
  },
  {
    id: "tkt-05483",
    subject: "Billing invoice amount query",
    organization: "Green Power Solutions",
    priority: "Normal",
    opened: "4d ago",
    status: "closed",
  },
];
