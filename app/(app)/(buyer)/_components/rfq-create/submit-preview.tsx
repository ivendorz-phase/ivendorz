"use client";

// P-BUY-RFQ Phase 8 — submit action + FLOATING preview. PRESENTATION-ONLY: clicking "Submit RFQ" does
// not submit anything (the audit-backed `submit_rfq` write is Wave-4/PARKED, see rfq-create-view.tsx);
// it instead opens the Review content as a floating dialog with "Edit" (dismiss, back to the form) and
// "Confirm" (local-only acknowledgement — no write occurs). Reuses the kit `Dialog` primitive.

import * as React from "react";
import { CheckCircle2, Info, Plus, Save } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/frontend/primitives/dialog";
import { ReviewSection } from "./rfq-sections";
import type { RfqDraftForm } from "./rfq-form-models";

export function SubmitPreview({ form, submitting }: { form: RfqDraftForm; submitting?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  return (
    <>
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="size-3.5 shrink-0 text-iv-brand-600" />
          Drafts and submission connect in the integration phase.
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" disabled className="gap-1.5">
            <Save aria-hidden className="size-4" />
            Save draft
          </Button>
          <Button
            type="button"
            disabled={submitting}
            className="gap-1.5"
            onClick={() => {
              setConfirmed(false);
              setOpen(true);
            }}
          >
            <Plus aria-hidden className="size-4" />
            {submitting ? "Submitting…" : "Submit RFQ"}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          {confirmed ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 aria-hidden className="size-10 text-iv-success-base" />
              <DialogTitle>Request confirmed</DialogTitle>
              <DialogDescription>
                Your RFQ is confirmed as a draft. Submission connects to the routing engine once the
                integration phase lands.
              </DialogDescription>
              <Button type="button" onClick={() => setOpen(false)} className="mt-2">
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Review before submitting</DialogTitle>
                <DialogDescription>
                  Check every section below. You can still edit anything before confirming.
                </DialogDescription>
              </DialogHeader>
              <ReviewSection form={form} />
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Edit
                </Button>
                <Button type="button" onClick={() => setConfirmed(true)}>
                  Confirm
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
