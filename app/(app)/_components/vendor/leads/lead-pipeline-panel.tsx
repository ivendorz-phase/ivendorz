// PL-2 Lead Detail — YOUR PIPELINE pane (companion §13.2). The vendor's PRIVATE CRM controls: advance
// the lead stage (`ops.update_lead_stage.v1` {expected_stage, target_stage, value_estimate?,
// next_action_at?} + idempotency), Mark won / Mark lost as first-class actions [M-2], and edit
// value_estimate + next_action_at. The "Advance to" legal targets are SERVER-DERIVED (never hard-coded);
// the "typical flow" line is shown as guidance only. Stage-advance is the only state write — and
// `won`/`lost` is PRIVATE CRM, never the RFQ award and never a governance signal (R6 firewall). Every
// action is disabled in the presentation phase. Uncontrolled controls; native interim. RSC-friendly.
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { FormField } from "@/frontend/components/form-field";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { LeadStageChip } from "./lead-stage-chip";
import { PresentationFormNote } from "../shared";
import type { LeadView } from "./types";

export interface LeadPipelinePanelProps {
  lead?: LeadView;
}

export function LeadPipelinePanel({ lead }: LeadPipelinePanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Your pipeline</CardTitle>
        <LeadStageChip stage={lead?.stage} />
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Advance stage
          </p>
          <div className="flex flex-wrap gap-2">
            {/* Legal targets are server-derived ([ESC-7G-LEAD-MACHINE]); empty + disabled in presentation. */}
            <Button type="button" variant="outline" size="sm" disabled>
              Advance to…
            </Button>
            <Button type="button" size="sm" disabled>
              Update stage
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled>
              Mark won
            </Button>
            <Button type="button" variant="outline" size="sm" disabled>
              Mark lost
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Typical flow: received → quoted → negotiation → won or lost → follow-up. The exact next
            steps are determined by the server.
          </p>
        </div>

        <div className="grid gap-4 border-t border-border pt-4">
          <FormField
            id="lead-value-estimate"
            label="Estimated value"
            description="Your own estimate for this opportunity (BDT)."
          >
            <div className="flex items-center gap-2">
              <Input id="lead-value-estimate" name="value_estimate" type="text" disabled />
              {typeof lead?.value_estimate === "number" ? (
                <span className="text-sm text-muted-foreground">
                  <CurrencyDisplay amount={lead.value_estimate} currency={lead.currency ?? "BDT"} />
                </span>
              ) : null}
            </div>
          </FormField>
          <FormField id="lead-next-action" label="Next action date">
            <Input
              id="lead-next-action"
              name="next_action_at"
              type="date"
              defaultValue=""
              disabled
            />
          </FormField>
        </div>

        <PresentationFormNote />
      </CardContent>
    </Card>
  );
}
