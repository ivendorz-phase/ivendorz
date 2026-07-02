// P-ADM-27 Suggestion triage (Doc-7H · Management · `decide_category_suggestion` /
// `triage/close_missing_vendor_suggestion` · J-ADM-07). PRESENTATION ONLY: the BC-ADM-3 triage queue for the two
// non-link suggestion roots. URL-driven KIND filter (server-rendered, deep-linkable). Decisions are owned by
// BC-ADM-3 Admin (R5): category via `decide_category_suggestion`, missing-vendor via
// `triage/close_missing_vendor_suggestion` — the per-row affordances are RENDERED BUT DISABLED, offered only on
// the frozen edges (Doc-4J H.5: category submitted→approved/rejected; missing-vendor submitted→triaged→closed).
// NON-DISCLOSURE (§7.5): suggestion reads are platform-staff-only. FIREWALL: no governance score here. No
// fabricated total (GI-03). Reuses the shell PageHeader + shared AdminQueueTable + kit.
import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  SUGGESTIONS,
  SUGGESTION_STATUS_META,
  SUGGESTION_KIND_LABEL,
  suggestionActions,
  type SuggestionVM,
} from "../../_components/admin/suggestions/suggestions-seed";

export const metadata: Metadata = { title: "Suggestion triage · Admin" };

const BASE = "/admin/suggestions";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "category", label: "Category" },
  { key: "missing_vendor", label: "Missing vendor" },
] as const;

const COLUMNS: AdminQueueColumn<SuggestionVM>[] = [
  {
    key: "kind",
    header: "Kind",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (s) => SUGGESTION_KIND_LABEL[s.kind],
  },
  {
    key: "suggestion",
    header: "Suggestion",
    cell: (s) => (
      <>
        <div className="font-medium text-foreground">{s.summary}</div>
        {s.detail ? <div className="text-xs text-muted-foreground">{s.detail}</div> : null}
      </>
    ),
  },
  {
    key: "suggestedBy",
    header: "Suggested by",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (s) => s.suggestedBy,
  },
  {
    key: "submitted",
    header: "Submitted",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (s) => s.submitted,
  },
  {
    key: "status",
    header: "Status",
    cell: (s) => {
      const m = SUGGESTION_STATUS_META[s.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: (s) => {
      const actions = suggestionActions(s);
      if (actions.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        // Disabled — the decision is owned by BC-ADM-3 Admin (R5). Admin decides; the module applies.
        <div className="flex justify-end gap-2">
          {actions.map((label) => (
            <Button key={label} size="sm" variant="outline" disabled>
              {label}
            </Button>
          ))}
        </div>
      );
    },
  },
];

export default async function SuggestionTriagePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const active = FILTERS.some((f) => f.key === kind) ? (kind as string) : "all";
  const rows = active === "all" ? SUGGESTIONS : SUGGESTIONS.filter((s) => s.kind === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suggestion triage"
        description="Category and missing-vendor suggestions from the network. Admin decides each one; the owning module applies the effect. Suggestions are visible to platform staff only."
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by kind">
        {FILTERS.map((f) => {
          const isActive = f.key === active;
          const href = f.key === "all" ? BASE : `${BASE}?kind=${f.key}`;
          return (
            <Button key={f.key} asChild size="sm" variant={isActive ? "secondary" : "ghost"}>
              <Link href={href} aria-current={isActive ? "page" : undefined}>
                {f.label}
              </Link>
            </Button>
          );
        })}
      </div>

      {rows.length > 0 ? (
        <>
          <AdminQueueTable
            columns={COLUMNS}
            rows={rows}
            rowKey={(s) => s.id}
            caption="Category and missing-vendor suggestions"
            minWidthClassName="min-w-[64rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} suggestion${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Lightbulb aria-hidden="true" />}
          title="No suggestions in this view"
          description="There are no suggestions of this kind right now."
        />
      )}
    </div>
  );
}
