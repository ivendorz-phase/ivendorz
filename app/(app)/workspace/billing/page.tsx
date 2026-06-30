import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../_components/vendor";

export const metadata: Metadata = { title: "Billing & Plan" };

export default function BillingPage() {
  return (
    <WorkspaceSectionPlaceholder
      title="Billing & Plan"
      description="Your plan, entitlements and quota usage."
    />
  );
}
