// SettingsTabs (FE-VEN-12, P-ACC-02/03/15 composition). Thin feature adapter over the shared
// WorkspaceTabs infrastructure (mirrors CompanyProfileTabs/BillingTabs/OrganizationTabs exactly):
// it only maps three named section slots to tabs and owns no tab logic. Section contents are the
// EXISTING, UNMODIFIED Account components, passed in as props — composition only, never a fork
// (Board ruling 2026-07-03, `FE-VEN-14` report §9, Option B). RSC-friendly.
import type { ReactNode } from "react";
import { WorkspaceTabs } from "../shared";

export interface SettingsTabsProps {
  profile: ReactNode;
  security: ReactNode;
  notifications: ReactNode;
}

export function SettingsTabs({ profile, security, notifications }: SettingsTabsProps) {
  return (
    <WorkspaceTabs
      ariaLabel="Settings sections"
      tabs={[
        { value: "profile", label: "Profile", content: profile },
        { value: "security", label: "Security", content: security },
        { value: "notifications", label: "Notifications", content: notifications },
      ]}
    />
  );
}
