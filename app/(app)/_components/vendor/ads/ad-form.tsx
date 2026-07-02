// P-VND-13 Ad create — the draft-authoring form (`marketplace.create_advertisement.v1` request
// fields ONLY: `placement`, `creative_ref`, `schedule{start,end}` (optional), `vendor_profile_id`
// (optional — the advertised profile)). `platform_invoice_id` (the Billing purchase ref, DD-5) is
// NOT an editable field here — the purchase itself is Billing's; this form only authors the
// creative/placement, matching the frozen request shape exactly. NO `update_advertisement`
// contract exists anywhere in the frozen corpus, so this is create-only — an existing ad (draft or
// otherwise) is never re-opened here; it renders on P-VND-14 (`AdDetailPanel`) as a read-only
// status view instead. Native `<select>` for placement (no kit Select primitive; the buyer's is
// surface-scoped, so this vendor page must not import it — mirrors the admin category-editor
// precedent, RV-0029). All fields disabled in the presentation phase. RSC-friendly.
import { FormField } from "@/frontend/components/form-field";
import { Input } from "@/frontend/primitives/input";
import { PresentationFormNote } from "../shared";
import { AD_PLACEMENT_LABEL } from "./ad-status-chip";
import type { AdPlacement } from "./types";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-iv-ink-strong shadow-iv-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const PLACEMENTS: AdPlacement[] = ["landing", "bottom", "search", "vendor_profile"];

export function AdForm() {
  return (
    <form className="space-y-6">
      <FormField
        id="ad-creative-ref"
        label="Creative reference"
        required
        description="The asset reference for your ad creative (image/video ref, uploaded separately)."
      >
        <Input id="ad-creative-ref" name="creative_ref" type="text" disabled />
      </FormField>

      <FormField
        id="ad-placement"
        label="Placement"
        required
        description="Where this ad appears on the marketplace."
      >
        <select
          id="ad-placement"
          name="placement"
          className={SELECT_CLASS}
          defaultValue="landing"
          disabled
        >
          {PLACEMENTS.map((p) => (
            <option key={p} value={p}>
              {AD_PLACEMENT_LABEL[p]}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="ad-schedule-start" label="Starts" description="Optional.">
          <Input id="ad-schedule-start" name="schedule_start" type="date" disabled />
        </FormField>
        <FormField id="ad-schedule-end" label="Ends" description="Optional.">
          <Input id="ad-schedule-end" name="schedule_end" type="date" disabled />
        </FormField>
      </div>

      <FormField
        id="ad-vendor-profile"
        label="Advertised profile"
        description="Optional — leave blank to advertise your organization generally."
      >
        <Input id="ad-vendor-profile" name="vendor_profile_id" type="text" disabled />
      </FormField>

      <p className="text-xs text-muted-foreground">
        Purchasing an ad slot happens through billing — this form only saves your creative and
        placement as a draft. Placement never affects your trust, eligibility, routing, or matching.
      </p>

      <PresentationFormNote />
    </form>
  );
}
