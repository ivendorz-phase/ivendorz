import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../_components/vendor";

export const metadata: Metadata = { title: "Team & Organization" };

export default function OrganizationPage() {
  return (
    <WorkspaceSectionPlaceholder
      title="Team & Organization"
      description="Your team, roles and organization details."
    />
  );
}
