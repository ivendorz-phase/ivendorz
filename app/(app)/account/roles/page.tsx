// Roles route (`/account/roles`) — P-ACC-08 (Doc-7E · T-LISTING; page_inventory §13). A SERVER COMPONENT
// in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the canonical Platform Shell
// by the co-located layout.
//
// PRESENTATION ONLY: lists org roles via the frozen query `identity.list_roles.v1` (Doc-4C §C7) — a
// read; no mutation. Creating/editing a role opens the Role editor (P-ACC-09). The shell owns the
// `<main>` container + the page `<h1>` (PageHeader).
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "../../_components/shell/page-header";
import { Button } from "@/frontend/primitives/button";
import { RolesView } from "./roles-view";

export const metadata = {
  title: "Roles — iVendorz",
};

export default function RolesPage() {
  return (
    <>
      <PageHeader
        title="Roles"
        description="Roles set what members can do in your organization."
        actions={
          <Button asChild>
            <Link href="/account/roles/new">
              <Plus aria-hidden="true" />
              New role
            </Link>
          </Button>
        }
      />
      <RolesView />
    </>
  );
}
