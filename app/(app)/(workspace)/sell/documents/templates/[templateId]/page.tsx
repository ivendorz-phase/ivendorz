// P-DOC-04 Template detail & versions — VENDOR MOUNT (FE-DOC-03). Thin route over the shared home.
import type { Metadata } from "next";
import { renderTemplateDetailPage } from "../../../../../_components/documents";

export const metadata: Metadata = { title: "Template" };

export default function VendorTemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  return renderTemplateDetailPage("/sell", params);
}
