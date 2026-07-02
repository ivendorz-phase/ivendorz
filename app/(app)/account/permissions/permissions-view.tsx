"use client";

// Permissions reference — P-ACC-10 (Doc-7E · T-LISTING). Client Component holding only ephemeral search
// state (Doc-7C §2.3). PRESENTATION-ONLY: a read-only catalog; no actions, no mutation.
//
// FIELD DISCIPLINE (invent nothing):
//  • Rows map to the frozen `identity.list_permissions.v1` items `{ slug, description, space }`
//    (Doc-4C §C7:454; Doc-2 §10.2). Permissions are shown BY SLUG (Invariant #10 — the slug is the
//    reference used when composing roles; the description is display only).
//  • The Doc-7E note mentions a "group" column/filter, but `list_permissions` returns no group field —
//    the only frozen grouping dimension is `space` (tenant | staff). We therefore show `space` as the
//    scope and coin no semantic groups. This page lists the TENANT-space catalog (the org-assignable
//    permissions, Doc-2 §7); staff-space permissions are platform-admin scope and out of an org's view.
//  • Reuses the single presentation catalog of frozen §7 slugs shared with the Role editor (P-ACC-09) —
//    no duplicated slug list.
import { useMemo, useState } from "react";
import { KeyRound, Search } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Input } from "@/frontend/primitives/input";
import { StatusChip } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";
import { PERMISSION_CATALOG } from "../roles/role-seed";

// The org-assignable catalog is tenant-space (Doc-2 §7; confirmed tenant-only for these slugs).
const ROWS = PERMISSION_CATALOG.map((p) => ({ ...p, space: "tenant" as const }));

export function PermissionsView() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROWS;
    return ROWS.filter(
      (p) => p.slug.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        These permissions are assigned to members through their role. Manage them under{" "}
        <span className="font-medium text-foreground">Roles</span>.
      </p>

      {/* Search. */}
      <div className="relative sm:max-w-xs">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search permissions"
          aria-label="Search permissions"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<KeyRound aria-hidden="true" />}
          title="No permissions match your search"
          description="Try a different term."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <caption className="sr-only">Permission catalog</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Permission
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Scope
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.slug}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-xs text-foreground">{p.slug}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip label="Tenant" tone="neutral" />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
