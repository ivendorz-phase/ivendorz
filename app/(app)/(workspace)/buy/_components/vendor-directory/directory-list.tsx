"use client";

// My Vendor Directory — the list surface (spec §4). PRESENTATION-ONLY client view.
//
// 5 NAV VIEWS (All / Marketplace / Private / ⭐ Preferred / Archived) + finer-status FILTER CHIPS
// (Verified / Claimed / Blacklisted / Archived — chips, never nav, spec §4). The ⭐ column is the
// frozen favourite gesture, gated by D1(a) (linked-only) and D4 (removing is authorized-only). Source
// = derived origin (OriginBadge). Buyer status renders buyer-side only (Inv #11); Blacklisted is
// undetectable to the vendor. No free-text search — the frozen list read has no query filter.

import Link from "next/link";
import { Star, Contact } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { cn } from "@/frontend/lib/cn";
import { buyerVendorStatusDisplay } from "../state-display";
import { DIRECTORY_CHIPS, DIRECTORY_VIEWS } from "./directory-display";
import { OriginBadge } from "./origin-badge";
import { PreferredStar } from "./preferred-star";
import type { DirectoryChip, DirectoryView } from "./vendor-directory-view-models";
import { canBePreferred, type DirectoryWorkingVendor } from "./working-model";

export interface DirectoryListProps {
  vendors: readonly DirectoryWorkingVendor[];
  view: DirectoryView;
  chips: readonly DirectoryChip[];
  counts: Record<DirectoryView, number>;
  onSelectView: (view: DirectoryView) => void;
  onToggleChip: (chip: DirectoryChip) => void;
  onSetPreferred: (vendor: DirectoryWorkingVendor) => void;
  onRequestRemovePreferred: (vendor: DirectoryWorkingVendor) => void;
}

function VerificationCell({ vendor }: { vendor: DirectoryWorkingVendor }) {
  const claim = vendor.linkedProfile?.claimState;
  if (claim === "verified") return <Badge variant="success">Verified</Badge>;
  if (claim === "claimed") return <Badge variant="info">Claimed</Badge>;
  return <span className="text-sm text-muted-foreground">—</span>;
}

export function DirectoryList({
  vendors,
  view,
  chips,
  counts,
  onSelectView,
  onToggleChip,
  onSetPreferred,
  onRequestRemovePreferred,
}: DirectoryListProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Nav views (spec §4) */}
      <div
        className="flex flex-wrap gap-1 border-b border-border"
        role="tablist"
        aria-label="Directory views"
      >
        {DIRECTORY_VIEWS.map((entry) => {
          const active = view === entry.value;
          return (
            <button
              key={entry.value}
              role="tab"
              aria-selected={active}
              onClick={() => onSelectView(entry.value)}
              className={cn(
                "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-iv-navy-600 text-iv-navy-700"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {entry.value === "preferred" ? (
                <Star
                  aria-hidden
                  className={cn("size-3.5", active && "fill-current text-iv-amber-500")}
                />
              ) : null}
              {entry.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-2xs font-bold tabular-nums",
                  active ? "bg-iv-navy-100 text-iv-navy-700" : "bg-muted text-muted-foreground",
                )}
              >
                {counts[entry.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter chips (spec §4 — refine the current view; never nav) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
          Filter
        </span>
        {DIRECTORY_CHIPS.map((entry) => {
          const active = chips.includes(entry.value);
          return (
            <button
              key={entry.value}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleChip(entry.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? entry.value === "blacklisted"
                    ? "border-iv-danger-base bg-iv-danger-base text-white"
                    : "border-iv-navy-700 bg-iv-navy-800 text-white"
                  : "border-border bg-card text-muted-foreground hover:bg-accent",
              )}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      {chips.includes("blacklisted") ? (
        <p className="text-xs text-iv-danger-muted">
          Blacklisted status is buyer-private — the vendor can never tell they are excluded
          (Invariant #11).
        </p>
      ) : null}

      {vendors.length === 0 ? (
        <EmptyState
          icon={<Contact aria-hidden />}
          title={view === "preferred" ? "No preferred vendors yet" : "No vendors in this view"}
          description={
            view === "preferred"
              ? "Star a marketplace-linked vendor to keep it here for quick access."
              : "Adjust the filter, or use Add Vendor to build your list."
          }
          className="py-16"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Vendor directory</caption>
            <thead>
              <tr className="border-b border-border">
                <th
                  scope="col"
                  className="w-12 px-2 py-2.5 text-center text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  <span className="sr-only">Preferred</span>★
                </th>
                <th
                  scope="col"
                  className="px-3 py-2.5 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Vendor
                </th>
                <th
                  scope="col"
                  className="px-3 py-2.5 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Source
                </th>
                <th
                  scope="col"
                  className="px-3 py-2.5 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Verification
                </th>
                <th
                  scope="col"
                  className="px-3 py-2.5 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  My status
                </th>
                <th
                  scope="col"
                  className="px-3 py-2.5 text-right text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => {
                const classifiable = canBePreferred(vendor);
                const status = buyerVendorStatusDisplay(vendor.currentStatus);
                return (
                  <tr
                    key={vendor.id}
                    className="border-b border-border last:border-b-0 hover:bg-accent/50"
                  >
                    <td className="px-2 py-3 text-center">
                      <PreferredStar
                        vendor={vendor}
                        onSetPreferred={onSetPreferred}
                        onRequestRemovePreferred={onRequestRemovePreferred}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/buy/saved-vendors?vendor=${vendor.id}`}
                        className="font-medium text-foreground hover:text-iv-navy-700 focus-visible:outline-none focus-visible:underline"
                      >
                        {vendor.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {vendor.linkedProfile?.category ?? vendor.details?.categories?.[0] ?? "—"}
                        {vendor.details?.city ? ` · ${vendor.details.city}` : ""}
                        {vendor.state === "archived" ? " · Archived" : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <OriginBadge origin={vendor.origin} />
                    </td>
                    <td className="px-3 py-3">
                      <VerificationCell vendor={vendor} />
                    </td>
                    <td className="px-3 py-3">
                      {classifiable ? (
                        <StatusChip label={status.label} tone={status.tone} />
                      ) : (
                        <span
                          className="text-xs text-muted-foreground"
                          title="Link to a marketplace profile to set status"
                        >
                          — link to set
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/buy/saved-vendors?vendor=${vendor.id}`}
                        className="text-xs font-semibold text-iv-navy-700 hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
