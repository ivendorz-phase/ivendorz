// P-DOC-05 Generated documents — VENDOR MOUNT (FE-DOC-03). Thin route over the shared home.
import type { Metadata } from "next";
import { renderGeneratedDocumentsPage } from "../../../../_components/documents";

export const metadata: Metadata = { title: "Generated documents" };

export default function VendorGeneratedDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  return renderGeneratedDocumentsPage("/sell", searchParams);
}
