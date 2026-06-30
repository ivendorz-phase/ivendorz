import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../_components/vendor";

export const metadata: Metadata = { title: "Leads & Pipeline" };

export default function LeadsPage() {
  return (
    <WorkspaceSectionPlaceholder
      title="Leads & Pipeline"
      description="Your received leads and pipeline stages."
    />
  );
}
