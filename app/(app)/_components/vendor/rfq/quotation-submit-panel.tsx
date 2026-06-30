// S4 Quote Authoring · Section 7 — SUBMIT (companion §13.1, the only quota-consuming action). Submit
// composes `rfq.submit_quotation.v1` carrying all EIGHT frozen request fields — the six vendor-authored
// (`price_breakdown`, `delivery_terms`, `warranty_terms` (opt), `spec_compliance_declaration`,
// `attachments_refs`, `rfq_version_id`) plus the two server-derived-from-grant inputs (`invitation_id`,
// `rfq_id`, resolved from rfq_invitation_grantees at S4 entry [m-4]) — with a required idempotency key.
//
// Submit is enabled server-side iff: state==draft ∧ frozen-required sections ✓ (NOT warranty [m-3]) ∧
// quota>0 ∧ window OPEN ∧ attachments committed [N-Q3]. Here it is DISABLED (presentation) with a
// visible reason and a completeness summary [M-Q4]. Quota is consumed once, server-reflected (never
// client-decremented). No AI advisory in this build (render-only-if-wired → omitted). RSC-friendly.
import { Button } from "@/frontend/primitives/button";
import { QuotaMeter } from "./quota-meter";
import { PresentationFormNote } from "../company/presentation-form-note";
import type { QuotaView } from "./types";

export interface QuotationSubmitPanelProps {
  quota?: QuotaView;
}

export function QuotationSubmitPanel({ quota }: QuotationSubmitPanelProps) {
  return (
    <div className="space-y-4">
      <QuotaMeter quota={quota} />

      <div className="rounded-md border border-iv-warning-base bg-iv-warning-subtle px-3 py-2 text-sm text-iv-warning-text">
        <p className="font-medium">Before you can submit</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>Complete the required sections: price breakdown, delivery terms and compliance.</li>
          <li>Upload every attachment you reference.</li>
          <li>The quotation window must still be open.</li>
        </ul>
      </div>

      <p className="text-sm text-muted-foreground">
        Submitting consumes one quota unit and seals your quotation at version&nbsp;1. Afterwards
        you can revise it (a new version, no quota) or withdraw it before award. The invitation and
        RFQ references are taken from your grant automatically.
      </p>

      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <PresentationFormNote />
        <Button type="button" disabled>
          Submit quotation
        </Button>
      </div>
    </div>
  );
}
