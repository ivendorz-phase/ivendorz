// S1 Profile Overview — read-only snapshot of the vendor's own profile. Composes identity/geography,
// the capability matrix (read-only), capacity, declared + verified financial tier, categories, and a
// neutral governance-bands placeholder (Trust/Performance are blocked). No context banner (read-only).
// Presentation-only; renders genuine-empty ("Not provided yet") when data is absent. RSC-friendly.
import { Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Separator } from "@/frontend/primitives/separator";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import { CapabilityMatrix } from "./capability-matrix";
import { CategoryAssignmentList } from "./category-assignment-list";
import { DescriptionList, type DescriptionItem } from "./description-list";
import { GovernanceBandsPlaceholder } from "./governance-bands-placeholder";
import { TierChip } from "./tier-chip";
import type {
  CapacityProfileView,
  CategoryAssignmentView,
  ClaimStatus,
  VendorProfileView,
  VerificationStatus,
} from "./types";

const CLAIM_TONE: Record<ClaimStatus, StatusTone> = {
  seeded: "neutral",
  invited: "info",
  claimed: "info",
  verified: "success",
};
const CLAIM_LABEL: Record<ClaimStatus, string> = {
  seeded: "Seeded",
  invited: "Invited",
  claimed: "Claimed",
  verified: "Verified",
};
const VERIFICATION_TONE: Record<VerificationStatus, StatusTone> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
};
const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
};

export interface ProfileOverviewProps {
  profile?: VendorProfileView;
  capacity?: CapacityProfileView;
  categories?: CategoryAssignmentView[];
}

export function ProfileOverview({ profile, capacity, categories }: ProfileOverviewProps) {
  const identityItems: DescriptionItem[] = [
    { label: "Company name", value: profile?.name },
    { label: "Reference", value: profile?.human_ref },
    { label: "Public handle", value: profile?.slug },
    { label: "Vendor type", value: profile?.vendor_type_preset },
    { label: "Country", value: profile?.country },
    { label: "Division", value: profile?.division },
    { label: "District", value: profile?.district },
    { label: "Industrial zone", value: profile?.industrial_zone },
  ];

  const capacityItems: DescriptionItem[] = [
    {
      label: "Max project value",
      value:
        capacity?.max_project_value != null ? (
          <CurrencyDisplay
            amount={capacity.max_project_value}
            currency={capacity.max_project_value_currency}
          />
        ) : undefined,
    },
    { label: "Monthly RFQ capacity", value: capacity?.max_monthly_rfq_capacity },
    { label: "Employees", value: capacity?.employee_count_range },
    { label: "Factory size", value: capacity?.factory_size_range },
    { label: "Annual turnover", value: capacity?.annual_turnover_range },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building aria-hidden="true" className="size-5 text-muted-foreground" />
            <span className="truncate">{profile?.name ?? "Your company"}</span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <StatusChip
              label={profile?.claim_status ? CLAIM_LABEL[profile.claim_status] : "Unclaimed"}
              tone={profile?.claim_status ? CLAIM_TONE[profile.claim_status] : "neutral"}
            />
            {profile?.verification_status ? (
              <StatusChip
                label={`Verification: ${VERIFICATION_LABEL[profile.verification_status]}`}
                tone={VERIFICATION_TONE[profile.verification_status]}
              />
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <TierChip tier={profile?.declared_tier} caption="declared" />
            <TierChip tier={profile?.verified_tier} caption="verified" readOnly />
          </div>
          <Separator />
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Governance bands
            </p>
            <GovernanceBandsPlaceholder />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity &amp; geography</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList items={identityItems} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <CapabilityMatrix flags={profile?.capability} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList items={capacityItems} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryAssignmentList assignments={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
