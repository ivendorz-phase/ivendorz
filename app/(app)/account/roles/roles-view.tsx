"use client";

// Roles list — P-ACC-08 (Doc-7E · T-LISTING). Client Component holding only ephemeral filter state
// (Doc-7C §2.3). PRESENTATION-ONLY: it reads and mutates nothing.
//
// FIELD DISCIPLINE (invent nothing):
//  • Rows map to the frozen `identity.list_roles.v1` response items — `{ role_id, name,
//    is_system_bundle }` (Doc-4C §C7:465; Doc-2 §10.2). `is_system_bundle` → the "System"/"Custom"
//    scope; system bundles (Owner/Director/Manager/Officer) are platform seeds, edited via the editor
//    read-only (create/update/delete apply to custom roles only, §C7).
//  • A per-role MEMBER COUNT is intentionally OMITTED: `list_roles` returns no count (Doc-4C §C7:465),
//    so surfacing one would fabricate a field the contract can't supply (authority: the frozen contract
//    outranks the Doc-7E planning note that mentions a count). Deferred pending a count source.
//  • Opening a role navigates to the Role editor (P-ACC-09).
import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, ShieldCheck } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Input } from "@/frontend/primitives/input";
import { StatusChip } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";

interface Role {
  roleId: string;
  name: string;
  isSystemBundle: boolean;
}

// Presentation seed (a wired build resolves these from `list_roles`). System bundles are the frozen
// Org-Role seeds (Doc-2 §7); the two custom roles stand in for org-authored roles.
const ROLES: Role[] = [
  { roleId: "role_owner", name: "Owner", isSystemBundle: true },
  { roleId: "role_director", name: "Director", isSystemBundle: true },
  { roleId: "role_manager", name: "Manager", isSystemBundle: true },
  { roleId: "role_officer", name: "Officer", isSystemBundle: true },
  { roleId: "role_proc_lead", name: "Procurement Lead", isSystemBundle: false },
  { roleId: "role_wh_officer", name: "Warehouse Officer", isSystemBundle: false },
];

type ScopeFilter = "all" | "system" | "custom";
const SCOPE_OPTIONS: ScopeFilter[] = ["all", "system", "custom"];
const SCOPE_LABEL: Record<ScopeFilter, string> = {
  all: "All roles",
  system: "System",
  custom: "Custom",
};

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function RolesView() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROLES.filter((r) => {
      if (scope === "system" && !r.isSystemBundle) return false;
      if (scope === "custom" && r.isSystemBundle) return false;
      if (q && !r.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, scope]);

  return (
    <div className="space-y-4">
      {/* Toolbar — search + scope filter. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles"
            aria-label="Search roles"
            className="pl-9"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="filter-scope">
            Filter by scope
          </label>
          <select
            id="filter-scope"
            className={selectClass}
            value={scope}
            onChange={(e) => setScope(e.target.value as ScopeFilter)}
          >
            {SCOPE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {SCOPE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck aria-hidden="true" />}
          title={scope === "custom" ? "No custom roles" : "No roles match your search"}
          description={
            scope === "custom"
              ? "Create a role to tailor what specific members can do."
              : "Try a different search or scope."
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-sm">
              <caption className="sr-only">Organization roles</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Scope
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.roleId}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/account/roles/${r.roleId}`}
                        className="font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {r.isSystemBundle ? (
                        <StatusChip label="System" tone="neutral" />
                      ) : (
                        <StatusChip label="Custom" tone="info" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/account/roles/${r.roleId}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {r.isSystemBundle ? "View" : "Edit"}
                        <ChevronRight aria-hidden="true" className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <PaginationControl hasMore={false} hasPrevious={false} />
    </div>
  );
}
