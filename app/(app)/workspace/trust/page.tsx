import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../_components/vendor";

export const metadata: Metadata = { title: "Trust & Verification" };

export default function TrustPage() {
  return (
    <WorkspaceSectionPlaceholder
      title="Trust & Verification"
      description="Your trust, performance, verified-tier and verification standing (read-only)."
    />
  );
}
