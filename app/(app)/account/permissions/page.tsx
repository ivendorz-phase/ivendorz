// Permissions reference route (`/account/permissions`) — P-ACC-10 (Doc-7E · T-LISTING; page_inventory
// §13). A SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the
// canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: a READ-ONLY catalog of available permissions via the frozen query
// `identity.list_permissions.v1` (Doc-4C §C7). No actions (reference). Permissions are consumed by
// reference — assigned to roles by slug, never as name-strings (Invariant #10). The shell owns the
// `<main>` container + the page `<h1>` (PageHeader).
import { PageHeader } from "../../_components/shell/page-header";
import { PermissionsView } from "./permissions-view";

export const metadata = {
  title: "Permissions reference — iVendorz",
};

export default function PermissionsPage() {
  return (
    <>
      <PageHeader
        title="Permissions"
        description="A reference of the permissions you can assign to roles."
      />
      <PermissionsView />
    </>
  );
}
