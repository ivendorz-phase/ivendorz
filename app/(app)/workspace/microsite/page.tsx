import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../_components/vendor";

export const metadata: Metadata = { title: "Microsite & Branding" };

export default function MicrositePage() {
  return (
    <WorkspaceSectionPlaceholder
      title="Microsite & Branding"
      description="Your public microsite — sections, branding, SEO and custom domain. Presentation only; never affects matching."
    />
  );
}
