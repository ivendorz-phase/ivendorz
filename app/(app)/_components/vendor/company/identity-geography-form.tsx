// S2 Identity & Geography (edit) — matching-relevant content (DP5). Presentation-only form bound to
// the FROZEN vendor_profiles fields (name + country/division/district/industrial_zone). The
// companion's extra wireframe fields (incorporation date, registration number, coordinates, operating
// regions, factory sites) are NOT in Doc-2 §10.3 and are deliberately NOT rendered (no invention).
// Controls are uncontrolled (current values via props); saving is wired in the integration phase.
import { Button } from "@/frontend/primitives/button";
import { FormField } from "@/frontend/components/form-field";
import { MatchingContextBanner } from "./matching-context-banner";
import { PresentationFormNote } from "./presentation-form-note";
import type { VendorProfileView } from "./types";

export interface IdentityGeographyFormProps {
  profile?: VendorProfileView;
}

export function IdentityGeographyForm({ profile }: IdentityGeographyFormProps) {
  return (
    <form className="space-y-5" aria-label="Identity and geography">
      <MatchingContextBanner />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="company-name"
          label="Company name"
          className="sm:col-span-2"
          inputProps={{ defaultValue: profile?.name ?? "", placeholder: "Legal company name" }}
        />
        <FormField
          id="country"
          label="Country"
          inputProps={{ defaultValue: profile?.country ?? "", placeholder: "Bangladesh" }}
        />
        <FormField
          id="division"
          label="Division"
          inputProps={{ defaultValue: profile?.division ?? "" }}
        />
        <FormField
          id="district"
          label="District"
          inputProps={{ defaultValue: profile?.district ?? "" }}
        />
        <FormField
          id="industrial-zone"
          label="Industrial zone"
          inputProps={{ defaultValue: profile?.industrial_zone ?? "" }}
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <PresentationFormNote />
        <Button type="button" disabled>
          Save changes
        </Button>
      </div>
    </form>
  );
}
