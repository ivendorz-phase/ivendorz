// P-ADM-26 Identity ops — users (Doc-7H · Management · `set_user_account_status` · J-ADM-06). PRESENTATION ONLY:
// the admin user worklist. URL-driven status filter (server-rendered, deep-linkable) over the frozen `users`
// machine (Doc-2:260 active / suspended / soft_deleted). CROSS-MODULE BOUNDARY: users are owned by M1/Identity —
// Admin (M8) DECIDES a governance action but IDENTITY OWNS THE EFFECT (R5); Admin never bypasses the Identity
// domain. Suspend / Reinstate (`set_user_account_status`) are RENDERED BUT DISABLED (21.6 Admin, no active-org
// §5.6, authz `staff_super_admin` interim). A `soft_deleted` account is anonymized-on-departure — terminal. No
// PII is enriched beyond the frozen login identity. FIREWALL: no governance score here. No fabricated total
// (GI-03). Reuses the shell PageHeader + shared AdminQueueTable + kit.
import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../../_components/shell";
import {
  AdminQueueTable,
  type AdminQueueColumn,
} from "../../../_components/admin/admin-queue-table";
import {
  USER_OPS,
  USER_STATUS_META,
  type UserOpsVM,
} from "../../../_components/admin/identity/user-ops-seed";

export const metadata: Metadata = { title: "Users · Admin" };

const BASE = "/admin/identity/users";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
  { key: "soft_deleted", label: "Soft-deleted" },
] as const;

const COLUMNS: AdminQueueColumn<UserOpsVM>[] = [
  {
    key: "user",
    header: "User",
    cell: (u) => (
      <>
        <div className="font-medium text-foreground">{u.name}</div>
        <div className="text-xs text-muted-foreground">{u.email ?? "—"}</div>
      </>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (u) => {
      const m = USER_STATUS_META[u.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: (u) =>
      u.status === "soft_deleted" ? (
        <span className="text-xs text-muted-foreground">—</span>
      ) : (
        // Disabled — `set_user_account_status` is owned by M1/Identity (R5).
        <Button size="sm" variant="outline" disabled>
          {u.status === "active" ? "Suspend" : "Reinstate"}
        </Button>
      ),
  },
];

export default async function UserOpsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows = active === "all" ? USER_OPS : USER_OPS.filter((u) => u.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Platform identity operations on user accounts. Admin decides; Identity applies the effect — Admin never bypasses the Identity domain."
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
            rowKey={(u) => u.id}
            caption="User accounts for identity operations"
            minWidthClassName="min-w-[48rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} user${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Users aria-hidden="true" />}
          title="No users in this view"
          description="There are no user accounts with this status right now."
        />
      )}
    </div>
  );
}
