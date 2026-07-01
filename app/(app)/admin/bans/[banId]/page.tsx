// P-ADM-06 Ban detail / issue (Doc-7H · Details/Transactional · `issue_ban` / `lift_ban` · emits `VendorBanned`).
// PRESENTATION ONLY: the contextual view of one platform ban. The enforcement actions (lift / re-issue) are
// RENDERED BUT DISABLED — `issue_ban` / `lift_ban` are owned by M8 admin and EMIT `VendorBanned` (R5: Admin
// decides; the owning module owns the effect + the event). Unknown/absent ban → byte-equivalent `notFound()`
// (Invariant #11). Platform ban, admin-visible — NOT the buyer-private blacklist. No governance signal
// (firewall); editorial stand-in for the unwired read. Composes the shell PageHeader + generic DashboardSection
// / DescriptionList / PresentationFormNote + kit; no new primitive, no duplication, no backend.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../../_components/shell";
import { DashboardSection } from "../../../_components/vendor/dashboard/dashboard-section";
import { DescriptionList } from "../../../_components/vendor/shared/description-list";
import { PresentationFormNote } from "../../../_components/vendor/shared/presentation-form-note";
import { getBan, getBanDetail, BAN_STATUS_META } from "../../../_components/admin/bans/bans-seed";

const LIST = "/admin/bans";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ banId: string }>;
}): Promise<Metadata> {
  const { banId } = await params;
  const b = getBan(banId);
  return { title: b ? `${b.ref} · Bans · Admin` : "Ban · Admin" };
}

export default async function BanDetailPage({ params }: { params: Promise<{ banId: string }> }) {
  const { banId } = await params;
  const detail = getBanDetail(banId);
  if (!detail) notFound();
  const meta = BAN_STATUS_META[detail.status];
  const isActive = detail.status === "active";

  return (
    <div className="space-y-6">
      <Link
        href={LIST}
        className="-mx-1.5 inline-flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to bans
      </Link>

      <PageHeader
        title={detail.subject}
        description={detail.reason}
        meta={
          <>
            <span className="font-mono text-xs text-muted-foreground">{detail.ref}</span>
            <Badge variant="neutral">{detail.subjectType}</Badge>
            <StatusChip label={meta.label} tone={meta.tone} />
          </>
        }
        actions={
          <Button variant="outline" size="sm" disabled>
            {isActive ? "Lift ban" : "Re-issue ban"}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="Ban record" className="lg:col-span-2">
          <DescriptionList
            items={[
              { label: "Subject", value: detail.subject },
              { label: "Type", value: detail.subjectType },
              { label: "Scope", value: detail.scope },
              { label: "Reason", value: detail.reason },
              { label: "Issued by", value: detail.issuedBy },
              { label: "Expiry", value: detail.expiry },
            ]}
          />
        </DashboardSection>

        <DashboardSection title="Enforcement">
          <p className="text-sm text-foreground">{detail.enforcement}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Platform enforcement record — not the buyer-private blacklist.
          </p>
        </DashboardSection>

        <DashboardSection title="Decision" className="lg:col-span-2">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Lift or re-issue this ban. Admin decides; the owning module applies the effect and
              emits the ban event.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled>
                {isActive ? "Lift ban" : "Re-issue ban"}
              </Button>
              <Button variant="outline" size="sm" disabled>
                Extend
              </Button>
            </div>
            <PresentationFormNote />
          </div>
        </DashboardSection>

        <DashboardSection title="Activity">
          <ol className="space-y-3">
            {detail.activity.map((a, i) => (
              <li key={`${a.label}-${i}`} className="flex items-start gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-iv-navy-700"
                />
                <div>
                  <p className="text-foreground">{a.label}</p>
                  {a.detail ? <p className="text-xs text-muted-foreground">{a.detail}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </DashboardSection>
      </div>
    </div>
  );
}
