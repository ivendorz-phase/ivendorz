// S4 Quote Authoring (compose) — the quotation builder (companion §13.1), bound to a FIXED
// `rfq_version_id` snapshot (read = `rfq.get_rfq.v1`, grant-scoped [B-1]). The hero band shows: the
// invitation state, the locked version, the window chip (live countdown deferred — no client clock),
// the Doc-5I quota, and a note that the frozen-required `invitation_id` + `rfq_id` are resolved
// server-side from the grant (not vendor-typed [m-4]). Draft persistence is client-local-only pending
// [ESC-7G-Q-DRAFT] — surfaced as an honest "saved on this device" note, NOT a server-persisted note.
//
// Quotation-document format delta (owner reference format, 2026-07-06): the step rail (WorkspaceTabs)
// is replaced by a SINGLE-SCROLL stacked-card document — all seven §13.1 sections are retained
// (price / delivery / warranty / compliance / attachments / preview / submit), regrouped as: navy
// hero → buyer-parameters strip → price card → terms card (three frozen term fields) → attachments →
// preview → submit. The hero + parameters strip bind EXISTING `RfqSnapshotView` fields the vendor is
// already granted (no new read pattern, no coined field); `estimated_value` is the one frozen
// create_rfq field already vendor-shown (types.ts ND note) — no VAT/AIT or commercial-guidance
// fabrication. Server component; presentation-only, all actions disabled.
import { Badge } from "@/frontend/primitives/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { InvitationStateChip } from "./state-chips";
import { WindowStateChip } from "./window-state-chip";
import { QuotaMeter } from "./quota-meter";
import { PriceBreakdownTable } from "./price-breakdown-table";
import { QuotationTermsField } from "./quotation-terms-fields";
import { QuotationAttachments } from "./quotation-attachments";
import { QuotationPreview } from "./quotation-preview";
import { QuotationSubmitPanel } from "./quotation-submit-panel";
import type {
  InvitationView,
  PriceBreakdownLine,
  FileRefView,
  QuotaView,
  RfqSnapshotView,
  WindowState,
  WindowUrgency,
} from "./types";

export interface QuotationBuilderProps {
  rfqHumanRef?: string;
  versionLockedLabel?: string;
  windowState?: WindowState;
  windowDeadlineLabel?: string;
  windowUrgency?: WindowUrgency;
  quota?: QuotaView;
  lines?: PriceBreakdownLine[];
  currency?: string;
  subtotal?: number;
  deliveryTerms?: string;
  warrantyTerms?: string;
  specComplianceDeclaration?: string;
  attachments?: FileRefView[];
  /** The vendor-entitled RFQ snapshot (rfq.get_rfq.v1, already granted) — hero budget + parameters strip. */
  rfq?: RfqSnapshotView;
  /** The vendor's own invitation on this RFQ — hero state chip + received line. */
  invitation?: InvitationView;
}

export function QuotationBuilder({
  rfqHumanRef,
  versionLockedLabel,
  windowState,
  windowDeadlineLabel,
  windowUrgency,
  quota,
  lines,
  currency = "BDT",
  subtotal,
  deliveryTerms,
  warrantyTerms,
  specComplianceDeclaration,
  attachments,
  rfq,
  invitation,
}: QuotationBuilderProps) {
  const lineCount = lines?.length ?? 0;

  const parameterBlocks = [
    { label: "Brand preference", value: rfq?.brand_preference },
    { label: "Standards required", value: rfq?.standards },
    { label: "Site location", value: rfq?.delivery_location ?? rfq?.delivery_geography },
    { label: "Certifications", value: rfq?.certifications },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Hero — invitation state, RFQ ref, window, buyer's estimated value */}
      <Card className="overflow-hidden">
        <div className="bg-iv-navy-900 p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <InvitationStateChip state={invitation?.state} />
              <h2 className="font-mono text-2xl font-semibold leading-none tracking-tight text-white">
                {rfqHumanRef ?? "This RFQ"}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-iv-navy-200">
                {invitation?.delivered_at ? <span>Received {invitation.delivered_at}</span> : null}
                {versionLockedLabel ? <span>Version locked: {versionLockedLabel}</span> : null}
                <WindowStateChip
                  state={windowState}
                  deadlineLabel={windowDeadlineLabel}
                  urgency={windowUrgency}
                />
              </div>
            </div>
            {typeof rfq?.estimated_value === "number" ? (
              <div className="shrink-0 text-right">
                <p className="text-2xs font-semibold uppercase tracking-wide text-iv-navy-200">
                  Buyer&apos;s estimated value
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-iv-amber-400">
                  <CurrencyDisplay
                    amount={rfq.estimated_value}
                    currency={rfq.currency ?? currency}
                  />
                </p>
                <p className="text-xs text-iv-navy-200">Stated on the RFQ</p>
              </div>
            ) : null}
          </div>
        </div>
        <CardContent className="space-y-2 pt-4">
          <QuotaMeter quota={quota} />
          <p className="text-xs text-muted-foreground">
            Your invitation and RFQ references are taken from your grant automatically — you do not
            enter them. Drafts are kept on this device until you submit.
          </p>
        </CardContent>
      </Card>

      {/* Buyer parameters strip — existing granted snapshot fields only */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Buyer requirements &amp; parameters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {parameterBlocks.map((block) => (
            <div key={block.label}>
              <p className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                {block.label}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {block.value ?? <span className="text-muted-foreground">—</span>}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price breakdown — frozen `price_breakdown` jsonb (companion §13.1 section 1) */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Price breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              The line items, quantities and unit prices that make up your offer.
            </p>
          </div>
          <Badge variant="neutral">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </Badge>
        </CardHeader>
        <CardContent>
          <PriceBreakdownTable lines={lines} currency={currency} subtotal={subtotal} />
        </CardContent>
      </Card>

      {/* Terms & declarations — the three frozen term fields (sections 2–4), one card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Terms &amp; declarations</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border [&>form]:py-6 [&>form:first-child]:pt-0 [&>form:last-child]:pb-0">
          <QuotationTermsField section="delivery" value={deliveryTerms} showNote={false} />
          <QuotationTermsField section="warranty" value={warrantyTerms} showNote={false} />
          <QuotationTermsField section="compliance" value={specComplianceDeclaration} />
        </CardContent>
      </Card>

      {/* Attachments — frozen `attachments_refs` (section 5) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <QuotationAttachments attachments={attachments} />
        </CardContent>
      </Card>

      {/* Preview — own-data-only summary (section 6, skippable) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <QuotationPreview
            lines={lines}
            currency={currency}
            subtotal={subtotal}
            deliveryTerms={deliveryTerms}
            warrantyTerms={warrantyTerms}
            specComplianceDeclaration={specComplianceDeclaration}
          />
        </CardContent>
      </Card>

      {/* Submit — the only quota-consuming action (section 7) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Submit</CardTitle>
        </CardHeader>
        <CardContent>
          <QuotationSubmitPanel quota={quota} />
        </CardContent>
      </Card>
    </div>
  );
}
