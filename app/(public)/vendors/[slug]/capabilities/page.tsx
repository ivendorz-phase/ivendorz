import { redirect } from "next/navigation";

// M2.6 route stub. The frozen microsite is a SINGLE page of sections (Doc-7D §4) — there is no separate
// /capabilities page. This URL is a thin redirect to the home-page section anchor (owner-approved
// single-page model). No multi-page architecture is invented; an unknown vendor 404s on the canonical
// /vendors/[slug] page.
export default async function VendorCapabilitiesStub({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/vendors/${slug}#capabilities`);
}
