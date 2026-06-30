import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../_components/vendor";

export const metadata: Metadata = { title: "Company Profile" };

export default function CompanyPage() {
  return (
    <WorkspaceSectionPlaceholder
      title="Company Profile"
      description="Identity, capability matrix, capacity, declared tier and categories."
    />
  );
}
