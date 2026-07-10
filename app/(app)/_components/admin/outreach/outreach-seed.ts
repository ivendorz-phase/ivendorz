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

// One `outreach_contacts` child row (Doc-4J §BC-ADM-6). The target vendor is Marketplace-owned — referenced
// via `vendor_profile_id` / `vendor_claim_record_id`, never owned by Admin.
export interface OutreachContactVM {
  /** `outreach_contacts.id`. */
  id: string;
  /** Resolved display name of the target vendor (Marketplace-owned reference). */
  targetName: string;
  /** The opaque Marketplace ref (`vendor_profile_id` / `vendor_claim_record_id`) — display only. */
  targetRef: string;
  /**
   * Illustrative label for the contact's invite pipeline state. The frozen field is an unstructured
   * system-owned `jsonb` (Doc-4J:322) — NOT an enumerated status — so this is a plain descriptive string,
   * never a coined status type.
   */
  inviteStage: string;
}

/** Detail view for one campaign (P-ADM-17) — the frozen detail read model (campaign + contacts). */
export interface OutreachCampaignDetailVM extends OutreachCampaignVM {
  contacts: OutreachContactVM[];
}

const OUTREACH_DETAILS: Record<string, Omit<OutreachCampaignDetailVM, keyof OutreachCampaignVM>> = {
  "a1f7c034-9b28-4e51-8d67-2c9014ab73e5": {
    contacts: [
      {
        id: "oc-1001",
        targetName: "Jamuna Machine Tools",
        targetRef: "d90c7a11-2f64-4b83-9e05-71a3c8046b52",
        inviteStage: "Contacted",
      },
      {
        id: "oc-1002",
        targetName: "Karnaphuli Fabricators",
        targetRef: "5f21e8b0-9c47-4d16-a832-60be1740c9a3",
        inviteStage: "Responded",
      },
      {
        id: "oc-1003",
        targetName: "Shitalakshya Steel",
        targetRef: "b3470de2-8a15-49c7-90f1-2e86045a7cd1",
        inviteStage: "Queued",
      },
    ],
  },
  "7e30b915-4c86-42a9-9f13-60d8a2e15b40": {
    contacts: [
      {
        id: "oc-1010",
        targetName: "Buriganga Valves",
        targetRef: "7c02a941-3e58-4b06-8d17-90f5e2a4c163",
        inviteStage: "Contacted",
      },
    ],
  },
  "c4820d76-1a53-4be8-97c2-58e0f13d69a1": {
    contacts: [],
  },
  "9d61a208-7f42-4c93-b085-31a7e60c4f28": {
    contacts: [
      {
        id: "oc-1020",
        targetName: "Teesta Bearings",
        targetRef: "1a8d40f7-6b29-4c53-90e8-25c7a1360bf4",
        inviteStage: "Claimed",
      },
      {
        id: "oc-1021",
        targetName: "Surma Instruments",
        targetRef: "e5309c81-4f72-46a0-b1d3-8072e4a95c60",
        inviteStage: "Claimed",
      },
    ],
  },
  "3b58e41c-06d7-49a2-8e14-7c9026f5a1b3": {
    contacts: [
      {
        id: "oc-1030",
        targetName: "Halda Lubricants",
        targetRef: "9b17e6a4-30c8-4d51-8f29-64a105e7b3c2",
        inviteStage: "Claimed",
      },
    ],
  },
};

/** Lookup one campaign's summary row (P-ADM-17 header). */
export function getOutreachCampaign(id: string): OutreachCampaignVM | undefined {
  return OUTREACH_CAMPAIGNS.find((c) => c.id === id);
}

/** Lookup one campaign's detail (campaign + contacts). Returns undefined for an unknown id (Invariant #11). */
export function getOutreachCampaignDetail(id: string): OutreachCampaignDetailVM | undefined {
  const summary = getOutreachCampaign(id);
  const extra = OUTREACH_DETAILS[id];
  if (!summary || !extra) return undefined;
  return { ...summary, ...extra };
}
