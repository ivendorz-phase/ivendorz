// P-ADM-15 (detail) Import job — detail (Doc-7H · `get_import_job` / `list_import_rows` · J-ADM-05). PRESENTATION
// ONLY: the create-then-poll view of one import job. A job is submitted (`submit_import_job`, queued) and
// processed asynchronously by System (`process_import_job`); this page reflects the latest state (Doc-4J
// `queued → processing → completed / failed`). Read surface — no action is invoked here (R5; System advances the
// job). `stats` binds to the frozen `import_jobs.stats_jsonb` detail field (Doc-4J:228) and per-row outcomes to
// `list_import_rows` (the RowError value object). Unknown/absent job → byte-equivalent `notFound()` (Invariant
// #11). Import LOADS data; seeded records are Marketplace-owned (no score, no procurement — firewall + moat).
// Composes the shell PageHeader + generic DashboardSection / DescriptionList + shared AdminQueueTable + kit.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../../_components/shell";
import { DashboardSection } from "../../../_components/vendor/dashboard/dashboard-section";
import { DescriptionList } from "../../../_components/vendor/shared/description-list";
import {
  AdminQueueTable,
  type AdminQueueColumn,
} from "../../../_components/admin/admin-queue-table";
import {
  getImportJob,
  getImportJobDetail,
  IMPORT_STATUS_META,
  IMPORT_TYPE_LABEL,
  type ImportRowVM,
} from "../../../_components/admin/imports/imports-seed";

const LIST = "/admin/imports";

const ROW_COLUMNS: AdminQueueColumn<ImportRowVM>[] = [
  {
    key: "row",
    header: "Row",
    className: "whitespace-nowrap font-mono text-xs text-muted-foreground",
    cell: (r) => `#${r.row}`,
  },
  {
    key: "outcome",
    header: "Outcome",
    cell: (r) => (
      <StatusChip
        label={r.outcome === "ok" ? "OK" : "Error"}
        tone={r.outcome === "ok" ? "success" : "danger"}
      />
    ),
  },
  {
    key: "detail",
    header: "Detail",
    className: "text-muted-foreground",
    cell: (r) => r.detail,
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ jobId: string }>;
}): Promise<Metadata> {
  const { jobId } = await params;
  const job = getImportJob(jobId);
  return { title: job ? `${IMPORT_TYPE_LABEL[job.jobType]} import · Admin` : "Import job · Admin" };
}

export default async function ImportJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const detail = getImportJobDetail(jobId);
  if (!detail) notFound();

  const meta = IMPORT_STATUS_META[detail.status];
  const isActive = detail.status === "queued" || detail.status === "processing";

  return (
    <div className="space-y-6">
      <Link
        href={LIST}
        className="-mx-1.5 inline-flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to import jobs
      </Link>

      <PageHeader
        title={`${IMPORT_TYPE_LABEL[detail.jobType]} import`}
        description="Import jobs run asynchronously. This view reflects the job’s latest recorded state."
        meta={
          <>
            <span className="font-mono text-xs text-muted-foreground">{detail.id}</span>
            <StatusChip label={meta.label} tone={meta.tone} />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="Job" className="lg:col-span-2">
          <DescriptionList
            items={[
              { label: "Type", value: IMPORT_TYPE_LABEL[detail.jobType] },
              {
                label: "Source file",
                value: <span className="break-all font-mono text-xs">{detail.fileRef}</span>,
              },
              { label: "Initiated by", value: detail.initiatedBy },
              { label: "Created", value: detail.created },
              { label: "Status", value: meta.label },
            ]}
          />
          {isActive ? (
            <p className="mt-3 text-xs text-muted-foreground">
              This job is still running — the result updates as System processes it.
            </p>
          ) : null}
        </DashboardSection>

        <DashboardSection title="Results">
          {detail.stats ? (
            <DescriptionList
              items={[
                { label: "Rows processed", value: String(detail.stats.total) },
                { label: "Succeeded", value: String(detail.stats.succeeded) },
                { label: "Failed", value: String(detail.stats.failed) },
              ]}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Not started — results appear once the job begins processing.
            </p>
          )}
        </DashboardSection>

        {detail.rows.length > 0 ? (
          <div className="lg:col-span-3">
            <DashboardSection title="Row errors">
              <AdminQueueTable
                columns={ROW_COLUMNS}
                rows={detail.rows}
                rowKey={(r) => String(r.row)}
                caption="Per-row import errors"
                minWidthClassName="min-w-[40rem]"
              />
            </DashboardSection>
          </div>
        ) : null}
      </div>
    </div>
  );
}
