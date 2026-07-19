// Vendor Workspace — Buyer CRM (VX-03, owner directive 2026-07-17; matches the design's Selling
// "Buyer CRM"). PRESENTATION-ONLY SHELL.
//
// GOVERNANCE (read before wiring — flagged for owner ruling, NOT resolved here):
//  • A vendor-side "Buyer CRM" is the sell-side MIRROR of the buyer's M4 "Vendor CRM" (private,
//    per-buyer vendor status). The buyer side is frozen (BC-OPS / Inv: "M4 CRM holds private
//    per-buyer vendor status"); the SYMMETRIC vendor-side buyer CRM is NOT a confirmed frozen
//    concept. Its data model, ownership, and — critically — what a vendor may privately store about
//    a buyer (privacy / firewall) need a ruling before any read/write is wired.
//  • Therefore this surface COINS NO status vocabulary and shows NO fabricated buyers/rows/counts.
//    KPI tiles render the neutral "—" placeholder (structure now, data after the ruling). The
//    design's status-filter tabs + row-detail drawer + Log-activity modal mount only once the model
//    is ruled and a read exists.
// Server Component; no hooks, no fetch (Content ≠ Presentation).
import { Users, Pencil, Info } from "lucide-react";
import { PageHeader } from "../../shell";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { VendorKpiStatCard } from "../dashboard/vendor-kpi-stat-card";

// Neutral, non-count-coining tile labels — each renders "—" until the CRM read is wired and the
// governance ruling (above) confirms what may be shown.
const KPI_TILES = [
  { label: "Buyers", caption: "In your private relationship list" },
  { label: "Active", caption: "Relationships you're currently working" },
  { label: "RFQs received", caption: "Invitations from these buyers" },
  { label: "Engagements", caption: "Awarded work in progress" },
];

export function BuyerCrmView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer CRM"
        description="Your private relationship record for the buyers you work with — separate from public marketplace data."
        actions={
          // Disabled until the CRM write command is wired (the Log-activity modal mounts then).
          <Button disabled>
            <Pencil aria-hidden className="size-4" />
            Log activity
          </Button>
        }
      />

      {/* Pending-ruling disclosure — this surface's data model + privacy rules are not yet frozen. */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-iv-info-subtle p-4 text-sm text-iv-info-muted">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        <p>
          Buyer CRM is a private, per-vendor relationship surface — the sell-side mirror of the
          buyer&apos;s Vendor CRM. Its data model and privacy rules are pending a governance ruling,
          so nothing is wired here yet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_TILES.map((k) => (
          <VendorKpiStatCard key={k.label} label={k.label} caption={k.caption} />
        ))}
      </div>

      <Card className="p-2">
        <EmptyState
          icon={<Users aria-hidden />}
          title="No buyers yet"
          description="Buyers you engage with through RFQs and orders will appear here as private relationship records."
          className="py-12"
        />
      </Card>
    </div>
  );
}
