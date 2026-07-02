// Outreach campaigns — presentation SEED (P-ADM-16 · Doc-7H · J-ADM-05 · `list_outreach_campaigns`). A curated
// mock of the vendor-outreach campaign list standing in for the unwired read — NOT data, coins nothing.
// BC-ADM-6 owns `outreach_campaigns` (+ child `outreach_contacts`); the target vendors are Marketplace-owned,
// referenced never owned. MOAT (Doc-4J §BC-ADM-6): vendor outreach is INFORMATIONAL ACQUISITION ONLY — no
// matching / routing / ranking / supplier-selection / award / eligibility, and no score (firewall). Fields bind
// to the frozen list view ONLY (Doc-4J:326 `id`, `state`, `created_at`) — `outreach_campaigns` has NO name
// field, so the id is shown opaque; nothing is coined. No fabricated contact/total counts (GI-03 — contacts
// live on the detail, P-ADM-17/18).
import type { StatusTone } from "@/frontend/components/status-chip";

// Frozen `outreach_campaigns` lifecycle (Doc-4J H.5 / §BC-ADM-6): `draft → running → completed`.
export type OutreachCampaignStatus = "draft" | "running" | "completed";

export interface OutreachCampaignVM {
  /** `outreach_campaigns.id` — a bare UUID (no name field); shown opaque. */
  id: string;
  /** `outreach_campaigns.created_at` (relative) — display only. */
  created: string;
  status: OutreachCampaignStatus;
}

export const OUTREACH_STATUS_META: Record<
  OutreachCampaignStatus,
  { label: string; tone: StatusTone }
> = {
  draft: { label: "Draft", tone: "neutral" },
  running: { label: "Running", tone: "info" },
  completed: { label: "Completed", tone: "success" },
};

export const OUTREACH_CAMPAIGNS: OutreachCampaignVM[] = [
  {
    id: "a1f7c034-9b28-4e51-8d67-2c9014ab73e5",
    created: "1h ago",
    status: "running",
  },
  {
    id: "7e30b915-4c86-42a9-9f13-60d8a2e15b40",
    created: "yesterday",
    status: "running",
  },
  {
    id: "c4820d76-1a53-4be8-97c2-58e0f13d69a1",
    created: "2d ago",
    status: "draft",
  },
  {
    id: "9d61a208-7f42-4c93-b085-31a7e60c4f28",
    created: "5d ago",
    status: "completed",
  },
  {
    id: "3b58e41c-06d7-49a2-8e14-7c9026f5a1b3",
    created: "1w ago",
    status: "completed",
  },
];
