// Vendor Dashboard — read-only command center (companion §3; realizes Doc-7G GR1/GR12 surface).
//
// Presentation-only composition with NEUTRAL placeholders for every Board-/contract-blocked element:
//   • Standing  → governance signals are NOT rendered ([ESC-7G-SCORE-DISPLAY] / [ESC-7B-TRUSTSCORE]).
//   • Pipeline  → navigational links only, NO counts/ratios (GR11 denominator law / [ESC-7G-PIPE-CONTRACT]).
//   • Plan/quota, profile health → neutral text until the wired reads exist ([ESC-7G-ENT-01]).
//   • AI advisory (Doc-5K, non-recommending) → render-only-if-wired, so OMITTED here.
// Action-needed / activity use the canonical kit EmptyState (own-data only; byte-equivalent).
// No business logic, no backend, no invented contract fields.
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { DashboardSection } from "../../_components/vendor/dashboard/dashboard-section";
import { GovernanceStandingPlaceholder } from "../../_components/vendor/dashboard/governance-standing-placeholder";
import { PipelineLinks } from "../../_components/vendor/dashboard/pipeline-links";

export const metadata: Metadata = { title: "Dashboard" };

// Temporary mount prefix (see app/(app)/workspace/layout.tsx — dropped post-A7).
const BASE = "/workspace";

export default function VendorDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">An overview of your vendor workspace.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="Action needed" className="lg:col-span-2">
          <EmptyState
            title="Nothing needs your attention right now"
            description="Items that need a response — invitations, clarifications and document actions — appear here."
          />
        </DashboardSection>

        <DashboardSection
          title="Standing & verification"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href={`${BASE}/trust`}>View</Link>
            </Button>
          }
        >
          <GovernanceStandingPlaceholder />
        </DashboardSection>

        <DashboardSection title="Quotation pipeline">
          <PipelineLinks
            items={[
              { label: "Invitation inbox", href: `${BASE}/rfqs` },
              { label: "Active quotations", href: `${BASE}/rfqs` },
              { label: "Leads & pipeline", href: `${BASE}/leads` },
              { label: "Engagements", href: `${BASE}/engagements` },
            ]}
          />
        </DashboardSection>

        <DashboardSection
          title="Plan & quota"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href={`${BASE}/billing`}>Manage</Link>
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground">
            Your plan entitlements and usage appear here once billing is connected.
          </p>
        </DashboardSection>

        <DashboardSection
          title="Profile health"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href={`${BASE}/company`}>Open profile</Link>
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground">
            Profile completeness and readiness checks for your own data appear here.
          </p>
        </DashboardSection>

        <DashboardSection title="Recent activity">
          <EmptyState title="No recent activity yet" />
        </DashboardSection>
      </div>
    </div>
  );
}
