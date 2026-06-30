// THROWAWAY preview for P-BUY-RFQ validation (render + axe). Deleted after.
import { RfqCreateView } from "../_components/rfq-create";
import type { RfqDraftForm } from "../_components/rfq-create";

const FORM: RfqDraftForm = {
  industry: "Steel & Metals",
  categoryLabel: "MS Plate & Sheet",
  workNature: ["supply", "fabricate"],
  itemName: "MS plate 12mm",
  quantity: "40",
  unit: "ton",
  scopeText:
    "ASTM A36 · 12mm × 1500 × 6000 · mill finish · ±0.4mm tolerance · third-party inspection.",
  brandPreference: "BSRM",
  alternativeBrand: "AKS",
  productCondition: "new",
  standards: "ASTM A36",
  certifications: "EN 10204 3.1",
  attachments: [
    { id: "a1", name: "GA-drawing.pdf", sizeLabel: "248 KB", status: "ready" },
    { id: "a2", name: "huge-scan.tiff", sizeLabel: "31 MB", status: "too-large" },
  ],
  deliveryLocation: "Plant 2, Gazipur",
  district: "Gazipur",
  deliveryDate: "2026-08-15",
  budget: "1800000",
  currency: "BDT",
  paymentPreference: "lc",
  incoterm: "DDP",
  tax: "exclusive",
  routingMode: "approved_open",
  preferredVendor: "Meghna Industrial",
  manufacturerOrImporter: "manufacturer",
  financialTier: "B",
  verifiedOnly: true,
  acceptAlternatives: true,
};

export default async function PreviewRfq({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const sp = await searchParams;
  const submission = sp.s === "success" ? "success" : sp.s === "error" ? "error" : "idle";
  return <RfqCreateView data={{ form: FORM, activeStep: 2, submission }} />;
}
