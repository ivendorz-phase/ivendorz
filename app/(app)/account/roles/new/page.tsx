// New role route (`/account/roles/new`) — P-ACC-09 (create mode; Doc-7E · T-SETTINGS). A SERVER
// COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Nested under `/account/roles`,
// so it inherits that segment's Platform Shell (one shell). Static `new` takes routing priority over the
// dynamic `[roleId]` sibling.
//
// PRESENTATION ONLY: creates a role via the frozen `identity.create_role.v1` + `set_role_permissions.v1`
// (Doc-4C §C7) — but this build performs NO mutation (honest interims).
import { PageHeader } from "../../../_components/shell/page-header";
import { RoleEditor } from "../role-editor";

export const metadata = {
  title: "New role — iVendorz",
};

export default function NewRolePage() {
  return (
    <>
      <PageHeader title="New role" description="Create a custom role and choose its permissions." />
      <RoleEditor mode="create" />
    </>
  );
}
