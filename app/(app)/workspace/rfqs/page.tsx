import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../_components/vendor";

export const metadata: Metadata = { title: "RFQs & Quotations" };

export default function RfqsPage() {
  return (
    <WorkspaceSectionPlaceholder
      title="RFQs & Quotations"
      description="Your invitation inbox, RFQ details and quotation authoring."
    />
  );
}
