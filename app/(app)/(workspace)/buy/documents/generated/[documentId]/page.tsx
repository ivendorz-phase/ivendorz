// P-DOC-06 Generated document detail — BUYER MOUNT (FE-DOC-03). Thin route over the shared home.
import type { Metadata } from "next";
import { renderGeneratedDocumentDetailPage } from "../../../../../_components/documents";

export const metadata: Metadata = { title: "Generated document" };

export default function BuyerGeneratedDocumentDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  return renderGeneratedDocumentDetailPage("/buy", params);
}
