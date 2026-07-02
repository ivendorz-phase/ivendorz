// P-ADM-17 Campaign detail (Doc-7H · Details/Transactional · `create/run/complete_outreach_campaign` · J-ADM-05).
// PRESENTATION ONLY: the contextual view of one outreach campaign + its contacts. Run / Complete are RENDERED
// BUT DISABLED — the transitions are owned by BC-ADM-6 (R5: Admin decides; the owning module owns the effect),
// offered per the frozen machine (Doc-4J `draft → running → completed`): Run only from `draft`, Complete only
// from `running`; `completed` is terminal. Unknown/absent campaign → byte-equivalent `notFound()` (Invariant
// #11). MOAT (Doc-4J §BC-ADM-6): outreach is informational acquisition only — no matching / routing / ranking /
// supplier-selection / award / eligibility; no score (firewall). Target vendors are Marketplace-owned
// references. Composes the shell PageHeader + generic DashboardSection / DescriptionList + shared AdminQueueTable.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../../_components/shell";
import { DashboardSection } from "../../../_components/vendor/dashboard/dashboard-section";
import { DescriptionList } from "../../../_components/vendor/shared/description-list";
import { EmptyState } from "@/frontend/components/empty-state";
import {
  AdminQueueTable,
  type AdminQueueColumn,
} from "../../../_components/admin/admin-queue-table";
import {
  getOutreachCampaign,
  getOutreachCampaignDetail,
  OUTREACH_STATUS_META,
  type OutreachContactVM,
} from "../../../_components/admin/outreach/outreach-seed";

const LIST = "/admin/outreach";

const CONTACT_COLUMNS: AdminQueueColumn<OutreachContactVM>[] = [
  {
    key: "vendor",
    header: "Target vendor",
    cell: (c) => (
      <>
        <div className="font-medium text-foreground">{c.targetName}</div>
        <div className="font-mono text-2xs text-muted-foreground">{c.targetRef}</div>
      </>
    ),
  },
  {
    key: "stage",
    header: "Invite stage",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (c) => c.inviteStage,
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}): Promise<Metadata> {
  const { campaignId } = await params;
  const campaign = getOutreachCampaign(campaignId);
  return { title: campaign ? "Outreach campaign · Admin" : "Outreach · Admin" };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const detail = getOutreachCampaignDetail(campaignId);
  if (!detail) notFound();

  const meta = OUTREACH_STATUS_META[detail.status];
  const isDraft = detail.status === "draft";
  const isRunning = detail.status === "running";

  return (
    <div className="space-y-6">
      <Link
        href={LIST}
        className="-mx-1.5 inline-flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to outreach
      </Link>

      <PageHeader
        title="Outreach campaign"
        description="Vendor-acquisition outreach — informational only; it never affects matching, routing, ranking, or supplier selection."
        meta={
          <>
            <span className="font-mono text-xs text-muted-foreground">{detail.id}</span>
            <StatusChip label={meta.label} tone={meta.tone} />
          </>
        }
        actions={
          isDraft || isRunning ? (
            // Disabled — run/complete are owned by BC-ADM-6 (R5). Admin decides; the module runs the campaign.
            <Button size="sm" disabled>
              {isDraft ? "Run campaign" : "Complete campaign"}
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="Campaign">
          <DescriptionList
            items={[
              {
                label: "Campaign",
                value: <span className="break-all font-mono text-xs">{detail.id}</span>,
              },
              { label: "Status", value: meta.label },
              { label: "Created", value: detail.created },
            ]}
          />
        </DashboardSection>

        <div className="lg:col-span-2">
          <DashboardSection title="Contacts">
            {detail.contacts.length > 0 ? (
              <AdminQueueTable
                columns={CONTACT_COLUMNS}
                rows={detail.contacts}
                rowKey={(c) => c.id}
                caption="Campaign outreach contacts"
                minWidthClassName="min-w-[36rem]"
              />
            ) : (
              <EmptyState
                title="No contacts yet"
                description="This campaign has no outreach contacts."
              />
            )}
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
