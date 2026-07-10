// P-ADM-03 Moderation case detail (Doc-7H · Details/Workflow · J-ADM-01 · create/assign/decide_moderation_case).
// PRESENTATION ONLY: the contextual view of one reported case. The decision affordances (assign / approve /
// reject / escalate / dismiss) are RENDERED BUT DISABLED — the wired commands are owned by the module that
// applies the effect (R5: Admin decides; the owning module owns the effect — e.g. an RFQ passes to matching or
// returns to draft). Unknown/absent case → byte-equivalent `notFound()` (Invariant #11). No governance signal
// (Trust/Performance/Tier — firewall); the detail is an editorial stand-in for the unwired read. Composes the
// shared shell PageHeader + generic DashboardSection / DescriptionList / PresentationFormNote + kit; no new
// primitive, no duplication, no backend, no invented contract.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../../_components/shell";
import { DashboardSection } from "../../../_components/vendor/dashboard/dashboard-section";
import { DescriptionList } from "../../../_components/vendor/shared/description-list";
import { PresentationFormNote } from "../../../_components/vendor/shared/presentation-form-note";
import {
  getModerationCase,
  getModerationCaseDetail,
  MODERATION_STATUS_META,
} from "../../../_components/admin/moderation/moderation-seed";

const QUEUE = "/admin/moderation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ caseId: string }>;
}): Promise<Metadata> {
  const { caseId } = await params;
  const c = getModerationCase(caseId);
  return { title: c ? `${c.ref} · Moderation · Admin` : "Moderation case · Admin" };
}

export default async function ModerationCaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const detail = getModerationCaseDetail(caseId);
  if (!detail) notFound();
  const meta = MODERATION_STATUS_META[detail.status];

  return (
    <div className="space-y-6">
      <Link
        href={QUEUE}
        className="-mx-1.5 inline-flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to queue
      </Link>

      <PageHeader
        title={detail.subject}
        description={detail.reason}
        meta={
          <>
            <span className="font-mono text-xs text-muted-foreground">{detail.ref}</span>
            <Badge variant="neutral">{detail.subjectType}</Badge>
            <StatusChip label={meta.label} tone={meta.tone} />
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" disabled>
              Assign to me
            </Button>
            <Button variant="outline" size="sm" disabled>
              Escalate
            </Button>
            <Button size="sm" disabled>
              Record decision
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="Report" className="lg:col-span-2">
          <div className="space-y-4">
            <p className="text-sm text-foreground">{detail.description}</p>
            <DescriptionList
              items={[
                { label: "Subject", value: detail.subject },
                { label: "Type", value: detail.subjectType },
                { label: "Reason", value: detail.reason },
                { label: "Priority", value: detail.priority },
                { label: "Reported by", value: detail.reportedBy },
                { label: "Reported", value: detail.age },
              ]}
            />
          </div>
        </DashboardSection>

        <DashboardSection title="Assignment">
          <DescriptionList
            items={[
              { label: "Status", value: <StatusChip label={meta.label} tone={meta.tone} /> },
              { label: "Priority", value: detail.priority },
              {
                label: "Assignee",
                value: detail.assignee === "Unassigned" ? undefined : detail.assignee,
              },
            ]}
          />
        </DashboardSection>

        <DashboardSection title="Decision" className="lg:col-span-2">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Record the moderation outcome. Admin decides; the owning module applies the effect —
              for example, an RFQ passes to matching or returns to draft.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled>
                Approve
              </Button>
              <Button variant="outline" size="sm" disabled>
                Reject
              </Button>
              <Button variant="outline" size="sm" disabled>
                Escalate
              </Button>
              <Button variant="outline" size="sm" disabled>
                Dismiss
              </Button>
            </div>
            <PresentationFormNote />
          </div>
        </DashboardSection>

        <DashboardSection title="Activity">
          <ol className="space-y-3">
            {detail.activity.map((a, i) => (
              <li key={`${a.label}-${i}`} className="flex items-start gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-iv-navy-700"
                />
                <div>
                  <p className="text-foreground">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.at}</p>
                </div>
              </li>
            ))}
          </ol>
        </DashboardSection>
      </div>
    </div>
  );
}
