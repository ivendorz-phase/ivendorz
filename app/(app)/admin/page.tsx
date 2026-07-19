// P-ADM-01 Admin dashboard (Doc-7H · read-only command center). PRESENTATION ONLY: a platform-operations
// landing that ROUTES into the admin queues — it invokes nothing and owns no effect (R5: a page invokes a
// wired Admin command; the OWNING MODULE owns the effect). No governance signal is rendered (no Trust /
// Performance / Tier — firewall); no counts/ratios are fabricated (GI-03 / non-disclosure) — queue volumes and
// metrics appear only once the admin reads are wired. Composes the shared shell primitives + the generic
// dashboard components + the kit; no new primitive, no duplication, no backend, no invented contract.
import type { Metadata } from "next";
import { Badge } from "@/frontend/primitives/badge";
import { EmptyState } from "@/frontend/components/empty-state";
import { PageHeader } from "../_components/shell";
import { DashboardSection } from "../_components/vendor/dashboard/dashboard-section";
import { PipelineLinks } from "../_components/vendor/dashboard/pipeline-links";

export const metadata: Metadata = { title: "Admin console" };

const BASE = "/admin";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin console"
        description="Platform operations — moderation, approvals, verification, and configuration."
        meta={<Badge variant="brand">Platform administration</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="Needs attention" className="lg:col-span-2">
          <EmptyState
            title="Nothing needs attention right now"
            description="Open moderation cases, pending approvals, and verification tasks appear here once the admin reads are wired."
          />
        </DashboardSection>

        <DashboardSection title="At a glance">
          <p className="text-sm text-muted-foreground">
            Platform operational metrics appear here once the admin reads are connected — counts are
            never fabricated.
          </p>
        </DashboardSection>

        <DashboardSection title="Moderation">
          <PipelineLinks
            items={[
              { label: "Moderation queue", href: `${BASE}/moderation` },
              { label: "RFQ moderation", href: `${BASE}/rfq-moderation` },
            ]}
          />
        </DashboardSection>

        <DashboardSection
          title="Trust & approval"
          description="Admin decides; the owning module owns the effect."
        >
          <PipelineLinks
            items={[
              { label: "Vendor approval queue", href: `${BASE}/vendor-approval` },
              { label: "Verification queue", href: `${BASE}/verification` },
              { label: "Bans", href: `${BASE}/bans` },
            ]}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Verification records the decision; the Trust module owns the score (firewall).
          </p>
        </DashboardSection>

        <DashboardSection title="Catalog & ads">
          <PipelineLinks
            items={[
              { label: "Category management", href: `${BASE}/categories` },
              { label: "Ad review queue", href: `${BASE}/ads` },
              { label: "Suggestion triage", href: `${BASE}/suggestions` },
              { label: "Link triage", href: `${BASE}/links` },
            ]}
          />
        </DashboardSection>

        <DashboardSection title="Engine">
          <PipelineLinks
            items={[
              { label: "Routing rules", href: `${BASE}/routing` },
              { label: "Matching results", href: `${BASE}/matching` },
            ]}
          />
        </DashboardSection>

        <DashboardSection title="Growth">
          <PipelineLinks
            items={[
              { label: "Import jobs", href: `${BASE}/imports` },
              { label: "Outreach campaigns", href: `${BASE}/outreach` },
              { label: "Outreach contacts", href: `${BASE}/outreach/contacts` },
            ]}
          />
        </DashboardSection>

        <DashboardSection title="Commerce & identity">
          <PipelineLinks
            items={[
              { label: "Plan management", href: `${BASE}/plans` },
              { label: "Entitlements & bundles", href: `${BASE}/entitlements` },
              { label: "Organizations", href: `${BASE}/identity/orgs` },
              { label: "Users", href: `${BASE}/identity/users` },
            ]}
          />
        </DashboardSection>

        <DashboardSection title="Support">
          <PipelineLinks items={[{ label: "Support tickets", href: `${BASE}/support` }]} />
          <p className="mt-3 text-xs text-muted-foreground">
            Read-only staff view — support tickets are owned by Communication.
          </p>
        </DashboardSection>

        <DashboardSection title="Recent activity" className="lg:col-span-3">
          <EmptyState title="No recent activity yet" />
        </DashboardSection>
      </div>
    </div>
  );
}
