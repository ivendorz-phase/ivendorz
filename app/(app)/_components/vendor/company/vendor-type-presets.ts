// The `vendor_type_preset` register — single source for every surface that offers or renders a
// preset (the edit form's picker and the overview's read row). One list, never re-typed per surface.
//
// PROVENANCE — the six-row register is IN FORCE. `AMD-MA-VTP-1`
// (`generatedDocs/Architecture_VendorTypePreset_Amendment_v1.0.md`, owner-ruled 2026-07-22) is a
// canonical base re-freeze of Architecture §Invariant 1 from five rows to six (row 6
// `service_provider` added, rows 1 + 4 renamed), independently verified PASS 2026-07-22
// (`..._Amendment_Verification_v1.0.md`). The frozen base at `Master…FINAL.md:212–220` carries these
// six rows and their seeds.
//
// The `slug` values below are GOVERNED — `Doc-2_Patch_v1.0.13` (folded 2026-07-22) declares the closed
// six-member value domain of `vendor_type_preset` at Doc-2 §10.3, bound by pointer to these same
// re-frozen rows. This file is the vendor-workspace realization of that domain (picker + display
// lookup). Still NOT authority to render a preset label on a PUBLIC surface — that is separately gated
// (AMD-MA-VTP-1 §5.4 / FE-PUB-09); see `vendor-card.tsx`.
//
// INVARIANT 1 — a preset is a LABEL, never the capability source of truth. `seeds` below is the
// STARTING POINT the four independent flags take when a preset is chosen; the vendor then edits the
// flags freely, and a vendor whose flags diverge from its preset is valid, not an inconsistency
// ("A vendor may enable additional capability flags beyond its preset … The preset seeds the flags;
// the flags — not the preset name — drive all matching." — `Master_…_FINAL.md:212`). Matching reads
// the flags only. Nothing here derives a preset back from the flags.
import type { CapabilityFlags } from "./types";

export interface VendorTypePreset {
  /** Persisted identifier (lowercase snake_case — `Doc-4A_Content_v1.0_Pass1.md:172`). */
  slug: string;
  /** Display name, governed at the ledger row — presentation, never the key (Invariant 9). */
  label: string;
  /** Flag values the matrix starts at when this preset is chosen. Vendor-editable thereafter. */
  seeds: CapabilityFlags;
}

const flags = (
  can_supply: boolean,
  can_service: boolean,
  can_fabricate: boolean,
  can_consult: boolean,
): CapabilityFlags => ({ can_supply, can_service, can_fabricate, can_consult });

/** The six presets, in ledger order (`…Amendment_PROPOSAL_v1.1.md:106–111`). */
export const VENDOR_TYPE_PRESETS: readonly VendorTypePreset[] = [
  { slug: "consultant", label: "Consultant", seeds: flags(false, false, false, true) },
  {
    slug: "mro_retail_supplier",
    label: "MRO / Retail Supplier",
    seeds: flags(true, false, false, false),
  },
  {
    slug: "importer_equipment_seller",
    label: "Importer / Equipment Seller",
    seeds: flags(true, false, false, false),
  },
  {
    slug: "manufacturer_workshop",
    label: "Manufacturer / Workshop",
    seeds: flags(true, false, true, false),
  },
  { slug: "engineering_firm", label: "Engineering Firm", seeds: flags(true, true, true, true) },
  { slug: "service_provider", label: "Service Provider", seeds: flags(false, true, false, false) },
] as const;

/**
 * Display name for a persisted slug. Returns the raw value unchanged when it matches no preset —
 * legacy and not-yet-reconciled values render as they are stored rather than being silently dropped.
 */
export function vendorTypePresetLabel(slug?: string): string | undefined {
  if (!slug) return undefined;
  return VENDOR_TYPE_PRESETS.find((preset) => preset.slug === slug)?.label ?? slug;
}
