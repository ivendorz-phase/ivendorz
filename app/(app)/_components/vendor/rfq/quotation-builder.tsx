"use client";

// S4 Quote Authoring (compose) — the staged builder (companion §13.1), bound to a FIXED `rfq_version_id`
// snapshot (read = `rfq.get_rfq.v1`, grant-scoped [B-1]). The header band shows: the locked version,
// the window chip (live countdown deferred — no client clock), the Doc-5I quota, and a note that the
// frozen-required `invitation_id` + `rfq_id` are resolved server-side from the grant (not vendor-typed
// [m-4]). Draft persistence is client-local-only pending [ESC-7G-Q-DRAFT] — surfaced as an honest
// "saved on this device" note, NOT a server-persisted guarantee. The seven sections compose into the
// step rail via the shared WorkspaceTabs (M8).
//
// Owner-directed Vendor Quotation Submission workflow integration: this is now a Client Component that
// owns the in-progress draft (lines, VAT/AIT mock, terms, contact person) so price/VAT/preview/submit
// stay in sync — still client-local-only, no backend, mirrors the disclosed-mock convention used
// throughout this build (PresentationFormNote / ESC-OPS-DOC-MUSHOK doctrine).
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { WorkspaceTabs } from "../shared";
import { WindowStateChip } from "./window-state-chip";
import { QuotaMeter } from "./quota-meter";
import { PriceBreakdownTable, computeVatTotals, type MockVatRate } from "./price-breakdown-table";
import { QuotationTermsField } from "./quotation-terms-fields";
import { QuotationAttachments } from "./quotation-attachments";
import { QuotationPreview } from "./quotation-preview";
import { QuotationSubmitPanel } from "./quotation-submit-panel";
import type {
  PriceBreakdownLine,
  FileRefView,
  QuotaView,
  WindowState,
  WindowUrgency,
} from "./types";

export interface QuotationBuilderProps {
  rfqId: string;
  rfqHumanRef?: string;
  versionLockedLabel?: string;
  windowState?: WindowState;
  windowDeadlineLabel?: string;
  windowUrgency?: WindowUrgency;
  quota?: QuotaView;
  lines?: PriceBreakdownLine[];
  currency?: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  specComplianceDeclaration?: string;
  attachments?: FileRefView[];
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function QuotationBuilder({
  rfqId,
  rfqHumanRef,
  versionLockedLabel,
  windowState,
  windowDeadlineLabel,
  windowUrgency,
  quota,
  lines: initialLines,
  currency = "BDT",
  deliveryTerms: initialDeliveryTerms,
  warrantyTerms: initialWarrantyTerms,
  specComplianceDeclaration: initialSpecCompliance,
  attachments,
  basePath = "/workspace",
}: QuotationBuilderProps) {
  const router = useRouter();
  const [lines, setLines] = useState<PriceBreakdownLine[]>(initialLines ?? []);
  const [vatRate, setVatRate] = useState<MockVatRate | null>(null);
  const [aitExclude, setAitExclude] = useState(false);
  const [deliveryTerms, setDeliveryTerms] = useState(initialDeliveryTerms ?? "");
  const [warrantyTerms, setWarrantyTerms] = useState(initialWarrantyTerms ?? "");
  const [specComplianceDeclaration, setSpecComplianceDeclaration] = useState(
    initialSpecCompliance ?? "",
  );
  const [contactPerson, setContactPerson] = useState("");

  const totals = useMemo(
    () => computeVatTotals(lines, vatRate, aitExclude),
    [lines, vatRate, aitExclude],
  );

  const incompleteReasons = [
    lines.length === 0 ? "Add at least one price line." : null,
    !vatRate ? "Select a VAT rate." : null,
    deliveryTerms.trim() === "" ? "Enter delivery terms." : null,
    specComplianceDeclaration.trim() === "" ? "Enter specification compliance." : null,
    contactPerson.trim() === "" ? "Enter a contact person." : null,
  ].filter((reason): reason is string => reason !== null);
  const canSubmit = incompleteReasons.length === 0;

  function handleSubmit() {
    const bidRef = `QTN-2026-${rfqId.replace(/\D/g, "").padStart(6, "0").slice(-6)}`;
    const params = new URLSearchParams({
      ref: bidRef,
      total: String(totals.total),
      vat: vatRate ? `${vatRate}%${aitExclude ? " (AIT excluded)" : ""}` : "Not selected",
      contact: contactPerson,
    });
    router.push(`${basePath}/rfqs/${rfqId}/quotation/submitted?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Quoting {rfqHumanRef ?? "this RFQ"}
              </p>
              {versionLockedLabel ? (
                <p className="text-xs text-muted-foreground">
                  Version locked: {versionLockedLabel}
                </p>
              ) : null}
            </div>
            <WindowStateChip
              state={windowState}
              deadlineLabel={windowDeadlineLabel}
              urgency={windowUrgency}
            />
          </div>
          <QuotaMeter quota={quota} />
          <p className="text-xs text-muted-foreground">
            Your invitation and RFQ references are taken from your grant automatically — you do not
            enter them. Drafts are kept on this device until you submit.
          </p>
        </CardContent>
      </Card>

      <WorkspaceTabs
        ariaLabel="Quotation steps"
        tabs={[
          {
            value: "price",
            label: "1 · Price",
            content: (
              <PriceBreakdownTable
                lines={lines}
                currency={currency}
                editable
                onLinesChange={setLines}
                vatRate={vatRate}
                onVatRateChange={setVatRate}
                aitExclude={aitExclude}
                onAitExcludeChange={setAitExclude}
              />
            ),
          },
          {
            value: "delivery",
            label: "2 · Delivery",
            content: (
              <QuotationTermsField
                section="delivery"
                value={deliveryTerms}
                editable
                onChange={setDeliveryTerms}
              />
            ),
          },
          {
            value: "warranty",
            label: "3 · Warranty",
            content: (
              <QuotationTermsField
                section="warranty"
                value={warrantyTerms}
                editable
                onChange={setWarrantyTerms}
              />
            ),
          },
          {
            value: "compliance",
            label: "4 · Compliance",
            content: (
              <QuotationTermsField
                section="compliance"
                value={specComplianceDeclaration}
                editable
                onChange={setSpecComplianceDeclaration}
              />
            ),
          },
          {
            value: "attachments",
            label: "5 · Attachments",
            content: <QuotationAttachments attachments={attachments} />,
          },
          {
            value: "preview",
            label: "6 · Preview",
            content: (
              <QuotationPreview
                lines={lines}
                currency={currency}
                deliveryTerms={deliveryTerms}
                warrantyTerms={warrantyTerms}
                specComplianceDeclaration={specComplianceDeclaration}
                vatRate={vatRate}
                aitExclude={aitExclude}
                contactPerson={contactPerson}
              />
            ),
          },
          {
            value: "submit",
            label: "7 · Submit",
            content: (
              <QuotationSubmitPanel
                quota={quota}
                editable
                contactPerson={contactPerson}
                onContactPersonChange={setContactPerson}
                canSubmit={canSubmit}
                incompleteReasons={incompleteReasons}
                onSubmit={handleSubmit}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
