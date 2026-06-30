// SEC-SUPPLIERS — Verified Supplier Showcase (landing_page_spec §5 · Doc-7D). PRESENTATION-ONLY Server
// Component bound (by VM) to `list_vendor_directory` + `get_public_vendor_profile` + the public trust
// badge (Doc-5G). The trust centerpiece among content sections.
//
// GOVERNANCE: capability = the four-flag MATRIX (Invariant #1); "Verified" is the binary M5 public
// signal (absence = no badge, not a "pending" state). Showcase order is PRESENTATION over a contract
// result — it implies no matching/ranking/recommendation and never re-ranks M3 (GI-04). The curated
// "featured" selection is editorial, not a computed score sort. Published-only: a vendor blacklisted by
// some buyer still appears, byte-identical (Invariant #11; GI-12). One card is intentionally unverified
// to demonstrate that absence renders as absence — never a fabricated state.
import { LandingSection } from "./landing-section";
import { VendorCard, type VendorCardVM } from "../discovery";

// Curated static showcase seed (editorial selection — never a computed score sort). Presentation data.
const FEATURED_VENDORS: VendorCardVM[] = [
  {
    slug: "padma-valve-fittings",
    name: "Padma Valve & Fittings Ltd.",
    category: "Valves & Fittings",
    location: "Dhaka · Tejgaon I/A",
    verified: true,
    capability: { can_supply: true, can_service: true, can_fabricate: true, can_consult: false },
  },
  {
    slug: "bengal-steel-industries",
    name: "Bengal Steel Industries",
    category: "Steel & Metals",
    location: "Chattogram · Kalurghat",
    verified: true,
    capability: { can_supply: true, can_service: false, can_fabricate: true, can_consult: false },
  },
  {
    slug: "jamuna-electrical-drives",
    name: "Jamuna Electrical & Drives",
    category: "Electrical & Drives",
    location: "Dhaka · Tongi",
    // Intentionally unverified — demonstrates absence (no "Verified" badge), not a fabricated state.
    capability: { can_supply: true, can_service: true, can_fabricate: false, can_consult: true },
  },
  {
    slug: "meghna-pumps-motors",
    name: "Meghna Pumps & Motors",
    category: "Pumps & Motors",
    location: "Narayanganj · Fatullah",
    verified: true,
    capability: { can_supply: true, can_service: true, can_fabricate: false, can_consult: false },
  },
];

export function SupplierShowcase() {
  return (
    <LandingSection
      id="sec-suppliers"
      title="Verified suppliers"
      description="Credible industrial suppliers, with verification and capabilities you can check at a glance."
      viewAllHref="/vendors"
      viewAllLabel="Browse directory"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {FEATURED_VENDORS.map((vendor) => (
          <VendorCard key={vendor.slug} vendor={vendor} />
        ))}
      </div>
    </LandingSection>
  );
}
