// Organization profile route (`/account/organization`) — P-ACC-04 (Doc-7E · T-SETTINGS;
// page_inventory §13). A SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION
// ONLY. Mounted in the canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: edits the organization profile via the frozen commands
// `identity.update_organization_profile.v1` (Doc-4C §C5) and `identity.transfer_ownership.v1`
// (Doc-4C §C5, Owner-only) — but this build performs NO mutation (honest interims). The shell owns the
// `<main>` container + the page `<h1>` (PageHeader).
import { PageHeader } from "../../_components/shell/page-header";
import { OrganizationProfile } from "./organization-profile";

export const metadata = {
  title: "Organization — iVendorz",
};

export default function OrganizationPage() {
  return (
    <>
      <PageHeader
        title="Organization"
        description="Manage your organization's profile and ownership."
      />
      <OrganizationProfile />
    </>
  );
}
