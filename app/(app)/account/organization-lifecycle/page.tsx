// Organization lifecycle route (`/account/organization-lifecycle`) — P-ACC-05 (Doc-7E · T-SETTINGS;
// page_inventory §13). A SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY.
// Mounted in the canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: soft-deletes / restores the active organization via the frozen commands
// `identity.soft_delete_organization.v1` and `identity.restore_organization.v1` (Doc-4C §C5, Owner-only)
// — but this build performs NO mutation (honest interims). SOFT-DELETE ONLY, never hard-delete; the org
// is recoverable and its IDs are never reused (Invariant #8). The shell owns the `<main>` container +
// the page `<h1>` (PageHeader).
//
// The `?state=deleted` preview is a DEV/QA harness — honored ONLY outside production, so a real visitor
// is never shown a fabricated lifecycle state (mirrors the auth screens' `?state=` pattern).
import { PageHeader } from "../../_components/shell/page-header";
import { OrganizationLifecycle } from "./organization-lifecycle";

export const metadata = {
  title: "Organization lifecycle — iVendorz",
};

type SearchParams = { state?: string };

export default async function OrganizationLifecyclePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const preview = process.env.NODE_ENV !== "production" ? sp.state : undefined;
  const deleted = preview === "deleted";

  return (
    <>
      <PageHeader
        title="Organization lifecycle"
        description="Deactivate or restore this organization."
      />
      <OrganizationLifecycle deleted={deleted} />
    </>
  );
}
