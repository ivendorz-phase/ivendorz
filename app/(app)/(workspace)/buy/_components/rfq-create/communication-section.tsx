"use client";

// P-BUY-RFQ — Communication preferences. Platform messages ALWAYS ON (system of record, M6); others
// optional & buyer-controlled. WhatsApp number shared only with vendors who receive this RFQ (Board
// ruling). CLIENT: the WhatsApp contact block is revealed only while the WhatsApp checkbox is checked
// (local UI toggle only — no fetch/mutation, still presentation-only).

import * as React from "react";
import { FormField } from "@/frontend/components/form-field";
import { CheckboxRow, RadioRow } from "../form-controls";
import { CONTACT_TIME_OPTIONS } from "./rfq-options";
import type { RfqDraftForm } from "./rfq-form-models";
import { TitledCard } from "./rfq-sections";

export function CommunicationSection({
  form,
  onChange,
}: {
  form: RfqDraftForm;
  onChange: (patch: Partial<RfqDraftForm>) => void;
}) {
  const [whatsappEnabled, setWhatsappEnabled] = React.useState(!!form.contactWhatsapp);

  return (
    <TitledCard
      title="Communication preferences"
      contentClassName="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {/* Per-RFQ contact person (owner directive 2026-07-07) — VISUALLY SEPARATED from "Your
          preferred contact method" below so the two are never confused: this block is WHO vendors
          contact about the RFQ (may be someone other than the creator); the fieldset below is how
          YOU — the RFQ creator — prefer to be reached. */}
      <div className="rounded-md border border-border p-3 sm:col-span-2">
        <p className="text-sm font-medium text-foreground">RFQ contact person</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          The person vendors should reach about this RFQ — can be someone other than you. Shared
          only with vendors who receive this RFQ.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="rfq-contact-person"
            label="Contact person"
            inputProps={{
              value: form.contactPersonName ?? "",
              onChange: (event) => onChange({ contactPersonName: event.target.value }),
              placeholder: "e.g. Engr. Kamrul Hassan",
            }}
          />
          <FormField
            id="rfq-contact-number"
            label="Contact number"
            inputProps={{
              value: form.contactPersonNumber ?? "",
              onChange: (event) => onChange({ contactPersonNumber: event.target.value }),
              type: "tel",
              inputMode: "tel",
              placeholder: "+880 1XXXXXXXXX",
            }}
          />
        </div>
      </div>

      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-medium text-foreground">
          Your preferred contact method
        </legend>
        <p className="mt-0.5 text-xs text-muted-foreground">
          How you — the person creating this RFQ — prefer to be contacted. This is separate from the
          RFQ contact person above. Platform messages stay on — the official record and audit trail.
          The rest are optional and buyer-controlled.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <CheckboxRow
            id="rfq-cm-platform"
            label="Platform messages (always on)"
            defaultChecked
            disabled
          />
          <CheckboxRow
            id="rfq-cm-phone"
            label="Phone call"
            checked={form.contactPhone ?? false}
            onChange={(event) => onChange({ contactPhone: event.target.checked })}
          />
          <CheckboxRow
            id="rfq-cm-whatsapp"
            label="WhatsApp"
            checked={whatsappEnabled}
            onChange={(event) => {
              setWhatsappEnabled(event.target.checked);
              onChange({ contactWhatsapp: event.target.checked });
            }}
          />
          <CheckboxRow
            id="rfq-cm-email"
            label="Email"
            checked={form.contactEmail ?? false}
            onChange={(event) => onChange({ contactEmail: event.target.checked })}
          />
        </div>
      </fieldset>

      {/* WhatsApp contact — shown only while "WhatsApp" is selected above. */}
      {whatsappEnabled ? (
        <div className="rounded-md border border-border p-3 sm:col-span-2">
          <p className="text-sm font-medium text-foreground">WhatsApp contact</p>
          <p className="mt-0.5 text-xs text-muted-foreground">If you allow WhatsApp:</p>
          <div className="mt-2 flex flex-col gap-2">
            <CheckboxRow
              id="rfq-wa-allow"
              label="Allow verified vendors to contact me via WhatsApp"
              checked={form.whatsappAllow ?? false}
              onChange={(event) => onChange({ whatsappAllow: event.target.checked })}
            />
            <CheckboxRow
              id="rfq-wa-useaccount"
              label="Use my account phone number"
              checked={form.whatsappUseAccount ?? false}
              onChange={(event) => onChange({ whatsappUseAccount: event.target.checked })}
            />
          </div>
          <div className="mt-3">
            <FormField
              id="rfq-wa-number"
              label="Alternative WhatsApp number"
              description="Only if different from your account number."
              inputProps={{
                value: form.whatsappNumber ?? "",
                onChange: (event) => onChange({ whatsappNumber: event.target.value }),
                type: "tel",
                inputMode: "tel",
                placeholder: "+880 1XXXXXXXXX",
              }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Your WhatsApp number is shared only with vendors who receive this RFQ.
          </p>
        </div>
      ) : null}

      {/* Preferred contact time — radio group (single choice). */}
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-medium text-foreground">
          Your preferred contact time{" "}
          <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {CONTACT_TIME_OPTIONS.map((o) => (
            <RadioRow
              key={o.value}
              id={`rfq-ct-${o.value}`}
              name="rfq-contacttime"
              value={o.value}
              label={o.label}
              checked={form.preferredContactTime === o.value}
              onChange={() => onChange({ preferredContactTime: o.value })}
            />
          ))}
        </div>
      </fieldset>
    </TitledCard>
  );
}
