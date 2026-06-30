import { redirect } from "next/navigation";

// M2.5 route stub. The frozen microsite is a SINGLE page of sections (Doc-7D §4) — there is no separate
// /products page. This URL is a thin redirect to the home-page section anchor (owner-approved Hybrid;
// see the M2.5 Flag-and-Halt). No multi-page architecture is invented; an unknown vendor 404s on the
// canonical /vendors/[slug] page.
export default async function VendorProductsStub({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/vendors/${slug}#products`);
}
