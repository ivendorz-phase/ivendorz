import type { Metadata } from "next";
import { WorkspaceSectionPlaceholder } from "../../_components/vendor";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <WorkspaceSectionPlaceholder
      title="Settings"
      description="Your workspace settings, including language (English / Bangla)."
    />
  );
}
