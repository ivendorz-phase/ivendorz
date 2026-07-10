// Role editor route (`/account/roles/[roleId]`) — P-ACC-09 (edit mode; Doc-7E · T-SETTINGS). A SERVER
// COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Nested under `/account/roles`,
// so it inherits that segment's Platform Shell (one shell).
//
// PRESENTATION ONLY: edits a role via the frozen `update_role.v1` / `set_role_permissions.v1` /
// `delete_role.v1` (Doc-4C §C7) — but this build performs NO mutation. An unknown role id resolves to a
// genuine not-found (no fabricated role). System bundles render read-only (not renamable/deletable).
import { notFound } from "next/navigation";
import { PageHeader } from "../../../_components/shell/page-header";
import { StatusChip } from "@/frontend/components/status-chip";
import { RoleEditor } from "../role-editor";
import { getRoleSeed } from "../role-seed";

export const metadata = {
  title: "Role — iVendorz",
};

export default async function RolePage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params;
  const role = getRoleSeed(roleId);
  if (!role) notFound();

  return (
    <>
      <PageHeader
        title={role.name}
        description={
          role.isSystemBundle ? "A built-in system role." : "Edit this role's name and permissions."
        }
        meta={
          role.isSystemBundle ? (
            <StatusChip label="System" tone="neutral" />
          ) : (
            <StatusChip label="Custom" tone="info" />
          )
        }
      />
      <RoleEditor mode="edit" role={role} />
    </>
  );
}
