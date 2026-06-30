import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../_components/vendor";

export const metadata: Metadata = { title: "Engagements" };

export default function EngagementsPage() {
  return (
    <WorkspaceSectionPlaceholder
      title="Engagements"
      description="Post-award documents and finance records for your engagements."
    />
  );
}
