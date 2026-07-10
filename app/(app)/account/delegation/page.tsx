// Delegation grants route (`/account/delegation`) — P-ACC-11 (Doc-7E · T-LISTING; page_inventory §13). A
// SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the
// canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: lists delegation grants via the frozen query `identity.list_delegation_grants.v1`
// (Doc-4C §C9) — a read; no mutation. Issuing/suspending/revoking a grant happens in the grant editor
// (P-ACC-12). The shell owns the `<main>` container + the page `<h1>` (PageHeader).
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "../../_components/shell/page-header";
import { Button } from "@/frontend/primitives/button";
import { DelegationView } from "./delegation-view";

export const metadata = {
  title: "Delegation — iVendorz",
};

export default function DelegationPage() {
  return (
    <>
      <PageHeader
        title="Delegation"
        description="Grants that let another organization act on a vendor profile on your behalf."
        actions={
          <Button asChild>
            <Link href="/account/delegation/new">
              <Plus aria-hidden="true" />
              New grant
            </Link>
          </Button>
        }
      />
      <DelegationView />
    </>
  );
}
