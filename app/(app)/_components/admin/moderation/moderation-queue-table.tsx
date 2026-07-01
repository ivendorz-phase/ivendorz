// Moderation queue table (P-ADM-02 · Doc-7H). Presentation-only, RSC. Thin column-config over the shared
// AdminQueueTable (extraction landed at the 2nd admin queue, P-ADM-04 — RV-0006/RV-0008 OBS). Render is
// equivalent to the pre-extraction table. Each row links into the case detail (P-ADM-03) where a wired command
// acts — the table itself decides nothing (R5). No governance signal, no fabricated total.
import Link from "next/link";
import { StatusChip } from "@/frontend/components/status-chip";
import { AdminQueueTable, type AdminQueueColumn } from "../admin-queue-table";
import { MODERATION_STATUS_META, type ModerationCaseVM } from "./moderation-seed";

const BASE = "/admin/moderation";

const COLUMNS: AdminQueueColumn<ModerationCaseVM>[] = [
  {
    key: "ref",
    header: "Case",
    className: "whitespace-nowrap font-mono text-xs text-muted-foreground",
    cell: (c) => c.ref,
  },
  {
    key: "subject",
    header: "Subject",
    cell: (c) => (
      <>
        <div className="font-medium text-foreground">{c.subject}</div>
        <div className="text-xs text-muted-foreground">{c.subjectType}</div>
      </>
    ),
  },
  { key: "reason", header: "Reason", className: "text-muted-foreground", cell: (c) => c.reason },
  {
    key: "priority",
    header: "Priority",
    cell: (c) => (
      <span
        className={c.priority === "High" ? "font-medium text-foreground" : "text-muted-foreground"}
      >
        {c.priority}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (c) => {
      const m = MODERATION_STATUS_META[c.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "assignee",
    header: "Assignee",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (c) => c.assignee,
  },
  {
    key: "age",
    header: "Age",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (c) => c.age,
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: (c) => (
      <Link
        href={`${BASE}/${c.id}`}
        className="rounded-sm text-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Review
        <span className="sr-only"> case {c.ref}</span>
      </Link>
    ),
  },
];

export interface ModerationQueueTableProps {
  cases: ModerationCaseVM[];
}

export function ModerationQueueTable({ cases }: ModerationQueueTableProps) {
  return (
    <AdminQueueTable
      columns={COLUMNS}
      rows={cases}
      rowKey={(c) => c.id}
      caption="Moderation cases"
    />
  );
}
