// P-DOC-03 Document templates — BUYER MOUNT (FE-DOC-03). Thin route: everything renders from the
// documents shared home (`_components/documents`), byte-identical with the vendor mount.
import type { Metadata } from "next";
import { renderTemplatesPage } from "../../../../_components/documents";

export const metadata: Metadata = { title: "Document templates" };

export default function BuyerTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string; status?: string }>;
}) {
  return renderTemplatesPage("/buy", searchParams);
}
