// P-BUY-20 Buyer Engagement detail — host view (`T-DETAILS`, Doc-7F). Pure function of its view-model
// (a Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page
// resolves the data via the wired `ops.get_engagement.v1` (Doc-4F §F5.8, GI-02) and passes it here; an
// unknown/absent/non-party id is collapsed to `notFound()` BY THE PAGE (byte-identical; Inv #11 / GI-12),
// so this view always receives non-null data.
//
// REUSE: shell `Breadcrumbs` + `PageHeader`; shared `DescriptionList` + `Money`/`Ref`; kit `Card`/
// `StatusChip`/`EmptyState`. No new primitive.
//
// GOVERNANCE:
//  • Renders ONLY frozen-projected fields (Doc-4F §F5.8). `award_value_snapshot`+`currency` → `Money`
//    (currency-driven, BDT never assumed). Counterparty = OPAQUE `vendor_profile_id` ref + neutral label;
//    NO vendor display name is coined (not projected — `ESC-7G-ENG-02` class).
//  • MONEY BOUNDARY (DF-6 / R8): the value is a RECORDED figure only — the platform never holds/moves
//    funds. A standing note states this; there is no pay/settle/escrow affordance anywhere.
//  • `rfq_id` is NOT projected → the engagement→RFQ link is an interim, not a live link (`ESC-7G-ENG-01`).
//  • The engagement document LIST is not a frozen read → the Documents section is GATED, never fabricated
//    (`ESC-7G-ENG-03`).

import { Banknote, FileText, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader, Breadcrumbs } from "../../../_components/shell";
import { DescriptionList, type DescriptionItem } from "../../_components/description-list";
import { Money, Ref } from "../../_components/format";
import { engagementStateDisplay } from "../../_components/state-display";
import type { EngagementDetailData } from "../../_components/engagement-detail-view-models";

/** The counterparty as the read discloses it: an opaque party ref only — no display name is projected
 *  (`ESC-7G-ENG-02` gap; the handle stays in-code, never in user-facing copy). */
function CounterpartyValue({ vendorProfileRef }: { vendorProfileRef: string }) {
  return (
    <span className="flex flex-col gap-0.5">
      <Ref>{vendorProfileRef}</Ref>
      <span className="text-xs text-muted-foreground">
        Vendor display name isn&rsquo;t shown for this engagement.
      </span>
    </span>
  );
}

export function EngagementDetailView({ data }: { data: EngagementDetailData }) {
  const status = engagementStateDisplay(data.state);

  const details: DescriptionItem[] = [
    { label: "Awarded value", value: <Money value={data.awardValue} /> },
    {
      label: "Awarded vendor",
      value: <CounterpartyValue vendorProfileRef={data.vendorProfileRef} />,
    },
    {
      // `rfq_id` is not projected by `ops.get_engagement.v1` — interim, not a live link (`ESC-7G-ENG-01`;
      // handle stays in-code, user copy is plain-language).
      label: "Originating RFQ",
      value: <span className="text-muted-foreground">Linked RFQ not yet available</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Breadcrumbs
        items={[{ label: "Engagements", href: "/engagements" }, { label: data.humanRef }]}
        className="mb-4"
      />
      <PageHeader
        title="Engagement"
        meta={
          <>
            <Ref>{data.humanRef}</Ref>
            <StatusChip label={status.label} tone={status.tone} />
          </>
        }
      />

      <div className="mt-2 flex flex-col gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold">Engagement details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <DescriptionList items={details} />
          </CardContent>
        </Card>

        {/* Money boundary (DF-6 / R8): recorded value only; the platform never holds or moves funds. */}
        <div className="flex items-start gap-2 rounded-md border border-border bg-secondary p-3 text-sm text-secondary-foreground">
          <Banknote aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p>
            The awarded value is a <span className="font-medium">record only</span>. The platform
            never holds, escrows, or moves funds — payments are settled directly between the parties
            and are tracked as records.
          </p>
        </div>

        {/* Documents (LOI/PO/challan/WCC): no engagement-document LIST read exists yet → gated, not faked
            (`ESC-7G-ENG-03`; handle stays in-code, user copy is plain-language). */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold">Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <EmptyState
              icon={<FileText aria-hidden />}
              title="Documents open in a later milestone"
              description="The engagement document set (LOI, PO, challan, WCC) will appear here once available."
              className="py-10"
            />
          </CardContent>
        </Card>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="size-3.5 shrink-0" />
          This engagement is shared only between your organization and the awarded vendor.
        </p>
      </div>
    </div>
  );
}
