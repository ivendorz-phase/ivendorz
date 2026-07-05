"use client";

// S4 Quote Authoring · Section 7 — SUBMIT (companion §13.1, the only quota-consuming action). Submit
// composes `rfq.submit_quotation.v1` carrying all EIGHT frozen request fields — the six vendor-authored
// (`price_breakdown`, `delivery_terms`, `warranty_terms` (opt), `spec_compliance_declaration`,
// `attachments_refs`, `rfq_version_id`) plus the two server-derived-from-grant inputs (`invitation_id`,
// `rfq_id`, resolved from rfq_invitation_grantees at S4 entry [m-4]) — with a required idempotency key.
//
// Contact person + notes below are a presentation-only mock capture (mirrors the buyer wizard's
// contact-preference pattern) — not yet a frozen submit field; kept out of the eight-field list above.
//
// `onSubmit` is invoked only after the confirm dialog is accepted — no mutation exists yet, this
// simulates the transition for the presentation-only workflow the owner requested.
import { useState } from "react";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/primitives/dialog";
import { FormField } from "@/frontend/components/form-field";
import { QuotaMeter } from "./quota-meter";
import { PresentationFormNote } from "../shared";
import type { QuotaView } from "./types";

export interface QuotationSubmitPanelProps {
  quota?: QuotaView;
  editable?: boolean;
  contactPerson?: string;
  onContactPersonChange?: (value: string) => void;
  canSubmit?: boolean;
  incompleteReasons?: string[];
  onSubmit?: () => void;
}

export function QuotationSubmitPanel({
  quota,
  editable = false,
  contactPerson,
  onContactPersonChange,
  canSubmit = false,
  incompleteReasons = [],
  onSubmit,
}: QuotationSubmitPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <QuotaMeter quota={quota} />

      {editable ? (
        <FormField
          id="contact-person"
          label="Contact person"
          description="Who should the buyer reach for this quotation?"
        >
          <Input
            id="contact-person"
            value={contactPerson ?? ""}
            onChange={(e) => onContactPersonChange?.(e.target.value)}
            placeholder="e.g. Md. Rafiqul Islam"
          />
        </FormField>
      ) : null}

      <div className="rounded-md border border-iv-warning-base bg-iv-warning-subtle px-3 py-2 text-sm text-iv-warning-text">
        <p className="font-medium">Before you can submit</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>Complete the required sections: price breakdown, delivery terms and compliance.</li>
          <li>Select a VAT rate.</li>
          <li>Upload every attachment you reference.</li>
          <li>The quotation window must still be open.</li>
        </ul>
        {editable && incompleteReasons.length > 0 ? (
          <ul className="mt-2 list-disc space-y-0.5 pl-5 font-medium">
            {incompleteReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground">
        Submitting consumes one quota unit and seals your quotation at version&nbsp;1. Afterwards
        you can revise it (a new version, no quota) or withdraw it before award. The invitation and
        RFQ references are taken from your grant automatically.
      </p>

      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <PresentationFormNote />
        {editable ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" disabled={!canSubmit}>
                Submit quotation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm submission</DialogTitle>
                <DialogDescription>
                  Once submitted, this quotation cannot be edited unless revision is allowed by the
                  buyer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSubmit?.();
                  }}
                >
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button type="button" disabled>
            Submit quotation
          </Button>
        )}
      </div>
    </div>
  );
}
