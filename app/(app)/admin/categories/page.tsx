// P-ADM-08 Category management (Doc-7H · Management · `marketplace.set_category_status.v1` · J-ADM-03).
// PRESENTATION ONLY: the admin-governed category taxonomy as a depth-first tree. URL-driven status filter
// (server-rendered, deep-linkable) over the FROZEN lifecycle `draft → active → retired` (Doc-2 §3.3). Per-row
// Approve / Retire (the two frozen `set_category_status` transitions, Doc-4D) are RENDERED BUT DISABLED —
// the command is owned by the taxonomy module (R5: Admin decides; the owning module owns the effect). Category
// status is a TAXONOMY-VISIBILITY state, NOT a governance signal — no Trust / Performance / Financial Tier
// appears here (firewall). No fabricated vendor/product counts (GI-03). Reuses the shell PageHeader + shared
// AdminQueueTable + kit; no new primitive, no duplication.
import type { Metadata } from "next";
import Link from "next/link";
import { Layers } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  CATEGORIES,
  CATEGORY_STATUS_META,
  type CategoryVM,
} from "../../_components/admin/categories/categories-seed";

export const metadata: Metadata = { title: "Categories · Admin" };

const BASE = "/admin/categories";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "retired", label: "Retired" },
] as const;

// Static indent classes keyed by depth (Tailwind can't see runtime-built class strings).
const INDENT: Record<number, string> = { 0: "", 1: "pl-6" };

// Disabled affordances = ONLY the frozen forward transitions of the linear `draft → active → retired`
// machine (Doc-4D): Approve (draft→active), Retire (active→retired). `retired` is TERMINAL — no forward
// action. The command is owned by the taxonomy module (R5), so every control is inert here.
const ACTIONS_BY_STATUS: Record<CategoryVM["status"], string[]> = {
  draft: ["Approve"],
  active: ["Retire"],
  retired: [],
};

const COLUMNS: AdminQueueColumn<CategoryVM>[] = [
  {
    key: "slug",
    header: "Slug",
    className: "whitespace-nowrap font-mono text-xs text-muted-foreground",
    cell: (c) => c.slug,
  },
  {
    key: "name",
    header: "Category",
    cell: (c) => (
      <div className={cn(INDENT[c.depth] ?? "")}>
        <div className="font-medium text-foreground">{c.name}</div>
        <div className="text-xs text-muted-foreground">
          {c.parent ? `In ${c.parent}` : "Root category"}
        </div>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (c) => {
      const m = CATEGORY_STATUS_META[c.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: (c) => {
      const actions = ACTIONS_BY_STATUS[c.status];
      // Terminal `retired` has no forward transition — render a neutral placeholder, not an empty control row.
      if (actions.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
      // Disabled — `set_category_status` is owned by the taxonomy module (R5). Admin decides; module applies.
      return (
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

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows = active === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="The admin-governed category taxonomy. Vendors propose categories; the taxonomy module governs the canonical tree and applies every status change."
        actions={
          // Navigation only — the editor's Create action stays disabled (P-ADM-09, R5).
          <Button asChild size="sm">
            <Link href={`${BASE}/new`}>New category</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => {
          const isActive = f.key === active;
          const href = f.key === "all" ? BASE : `${BASE}?status=${f.key}`;
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
            rowKey={(c) => c.id}
            caption="Admin-governed category taxonomy"
            minWidthClassName="min-w-[48rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} categor${rows.length === 1 ? "y" : "ies"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Layers aria-hidden="true" />}
          title="No categories in this view"
          description="There are no categories with this status right now."
        />
      )}
    </div>
  );
}
