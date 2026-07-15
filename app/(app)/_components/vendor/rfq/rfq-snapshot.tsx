// S3 RFQ Detail — SPECS & REQUIREMENTS + GRANTED DOCUMENTS (companion §6.3). Read-only view of the
// vendor-entitled RFQ snapshot (read = `rfq.get_rfq.v1`, grant-scoped via rfq_invitation_grantees,
// [ESC-7G-Q-01] CLOSED). Binds frozen rfq.rfqs / rfq_versions fields ONLY; shows NOTHING about other
// vendors or the matching decision (ND-1..ND-6). Documents are tap-to-download (file_ref only; never
// blobs through the API — §7.6). Presentation-only; RSC-friendly.
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { FileLink } from "@/frontend/components/file-link";
import { EmptyState } from "@/frontend/components/empty-state";
import { DescriptionList, type DescriptionItem } from "../shared";
import type { RfqSnapshotView, WorkNature } from "./types";

const WORK_NATURE_LABEL: Record<WorkNature, string> = {
  supply: "Supply",
  service: "Service",
  fabricate: "Fabricate",
  consult: "Consult",
};

const CONTACT_CHANNEL_LABEL: Record<"platform" | "phone" | "whatsapp" | "email", string> = {
  platform: "Platform messages",
  phone: "Phone",
  whatsapp: "WhatsApp",
  email: "Email",
};

export interface RfqSnapshotProps {
  rfq?: RfqSnapshotView;
}

export function RfqSnapshot({ rfq }: RfqSnapshotProps) {
  const documents = (rfq?.granted_documents ?? []).filter((doc) => doc.href);

  const itemLine = [rfq?.quantity, rfq?.unit].filter(Boolean).join(" ") || undefined;

  const items: DescriptionItem[] = [
    { label: "Scope", value: rfq?.scope_text },
    {
      label: "Work nature",
      value:
        rfq?.work_nature && rfq.work_nature.length > 0
          ? rfq.work_nature.map((w) => WORK_NATURE_LABEL[w]).join(" · ")
          : undefined,
    },
    { label: "Category", value: rfq?.category_label },
    {
      label: "Estimated value",
      value:
        typeof rfq?.estimated_value === "number" ? (
          <CurrencyDisplay amount={rfq.estimated_value} currency={rfq.currency ?? "BDT"} />
        ) : undefined,
    },
    {
      label: "Specification",
      value: rfq?.no_formal_spec ? "No formal specification" : undefined,
    },
    { label: "Version locked", value: rfq?.version_locked_label },
    { label: "PR #", value: rfq?.pr_number },
    { label: "Item", value: rfq?.item_name },
    { label: "Quantity", value: itemLine },
    { label: "Brand preference", value: rfq?.brand_preference },
    { label: "Alternative brand accepted", value: rfq?.alternative_brand },
    { label: "Condition", value: rfq?.product_condition },
    { label: "Standards", value: rfq?.standards },
    { label: "Certifications", value: rfq?.certifications },
  ];

  const deliveryItems: DescriptionItem[] = [
    { label: "Delivery area", value: rfq?.delivery_geography },
    { label: "Location", value: rfq?.delivery_location },
    { label: "District", value: rfq?.delivery_district },
    { label: "Requested by", value: rfq?.delivery_date_label },
    { label: "Site", value: rfq?.delivery_site },
    { label: "Instructions", value: rfq?.delivery_instructions },
    {
      label: "Preferred contact channels",
      value:
        rfq?.preferred_contact_channels && rfq.preferred_contact_channels.length > 0
          ? rfq.preferred_contact_channels.map((c) => CONTACT_CHANNEL_LABEL[c]).join(" · ")
          : undefined,
    },
    { label: "Preferred contact time", value: rfq?.preferred_contact_time_label },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Specifications &amp; requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList items={items} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList items={deliveryItems} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Granted documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.length > 0 ? (
            <ul className="space-y-2">
              {documents.map((doc, index) => (
                <li key={doc.href} className="flex items-center gap-2">
                  <FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  <FileLink href={doc.href as string} name={doc.name ?? `Document ${index + 1}`} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No documents shared"
              description="Documents the buyer grants for this RFQ appear here, ready to download."
            />
          )}
          <p className="text-xs text-muted-foreground">
            Documents open on tap — they are not downloaded automatically (low-bandwidth friendly).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
