// Company-website editorial SEED for the public vendor microsite (M2.6). This is curated EDITORIAL
// presentation content — NOT data, NOT a coined taxonomy, NOT a frozen contract. It stands in for the
// vendor's published M2 microsite content exactly as the discovery `PROFILE_EXTRAS` seed does, under the
// same registered interim. The fields here (mission/vision/values/history/management/industries/
// certifications/stats/gallery) have NO frozen public-projection columns; they coin nothing and are
// rendered as supplier-provided company-website content only.
//
// GOVERNANCE: presentation-only. NO trust/performance score, NO financial tier, NO turnover/revenue, NO
// platform-verification claim (certifications are SELF-DECLARED company info, never the binary "Verified"
// signal — that stays the M5 public projection). Industries are a presentation reference (not modeled in
// the frozen corpus — landing_page_spec §4 note). Stats are illustrative, supplier-provided, never
// computed. Every field is optional → the components render genuine-empty when absent.
import type { PublicVendorProfileVM } from "../discovery/seed";

export interface CompanyValueVM {
  title: string;
  description?: string;
}
export interface CompanyTimelineEntryVM {
  /** Optional label (e.g. a year or phase) — omitted in the generic seed to avoid fabricating dates. */
  year?: string;
  title: string;
  description?: string;
}
export interface ManagementMessageVM {
  /** Role-based attribution (the seed never fabricates an individual's name). */
  name: string;
  title: string;
  message: string;
}
export interface CompanyStatVM {
  label: string;
  /** Display string only — never computed (e.g. "15+", "30,000 sq ft"). */
  value: string;
}
export interface CertificationVM {
  name: string;
  detail?: string;
}
export interface CapabilityAreaVM {
  name: string;
  description?: string;
}
export interface GalleryItemVM {
  label: string;
  caption?: string;
}

export interface VendorCompanyContentVM {
  overview?: string;
  businessOverview?: string;
  facilities?: string;
  mission?: string;
  vision?: string;
  values?: CompanyValueVM[];
  history?: CompanyTimelineEntryVM[];
  management?: ManagementMessageVM;
  industries?: string[];
  capabilities?: CapabilityAreaVM[];
  certifications?: CertificationVM[];
  gallery?: GalleryItemVM[];
  stats?: CompanyStatVM[];
}

// ── Generic, shared editorial defaults (presentation reference; coin nothing). ──────────────────────
const DEFAULT_VALUES: CompanyValueVM[] = [
  { title: "Quality & reliability", description: "Built to specification, delivered on time." },
  { title: "Safety first", description: "Safe practices on every site and in every workshop." },
  { title: "Integrity", description: "Honest commitments and transparent dealings." },
  {
    title: "Customer partnership",
    description: "Long-term relationships over one-off transactions.",
  },
  {
    title: "Continuous improvement",
    description: "Investing in people, process, and equipment.",
  },
];

const DEFAULT_HISTORY: CompanyTimelineEntryVM[] = [
  { title: "Founded", description: "Established to serve Bangladesh's industrial sector." },
  { title: "Capacity expansion", description: "Grew workshop, supply, and service capability." },
  {
    title: "Quality systems",
    description: "Adopted ISO-aligned quality-management practices.",
  },
  { title: "Facility upgrade", description: "Upgraded machinery and in-house testing." },
  { title: "Today", description: "Trusted by industrial buyers across the country." },
];

const DEFAULT_INDUSTRIES: string[] = [
  "Pharmaceutical",
  "Food & Beverage",
  "Chemical",
  "Textile",
  "Power",
  "Cement",
  "Steel",
  "Oil & Gas",
  "Water Treatment",
  "Packaging",
  "Engineering",
];

const DEFAULT_CAPABILITIES: CapabilityAreaVM[] = [
  { name: "Manufacturing", description: "In-house production to specification." },
  { name: "Fabrication", description: "Custom fabrication and assembly." },
  { name: "Supply", description: "Sourcing and supply of equipment and spares." },
  { name: "Engineering", description: "Design and engineering support." },
  { name: "Installation", description: "On-site installation and integration." },
  { name: "Maintenance", description: "Preventive and corrective maintenance." },
  { name: "Commissioning", description: "Testing, start-up, and handover." },
  { name: "After-sales support", description: "Spares, service, and technical support." },
];

const DEFAULT_CERTIFICATIONS: CertificationVM[] = [
  { name: "ISO 9001:2015", detail: "Quality management system" },
  { name: "Trade License", detail: "Registered business" },
  { name: "Business Identification (BIN)", detail: "VAT-registered" },
  { name: "Tax Identification (TIN)", detail: "Registered taxpayer" },
  { name: "Import Registration (IRC)", detail: "Authorised to import" },
  { name: "Factory License", detail: "Licensed manufacturing facility" },
  { name: "Quality Standards", detail: "Compliant with applicable standards" },
  { name: "Trade Memberships", detail: "Member of industry trade bodies" },
];

const DEFAULT_GALLERY: GalleryItemVM[] = [
  { label: "Factory" },
  { label: "Workshop" },
  { label: "Machinery" },
  { label: "Office" },
  { label: "Warehouse" },
  { label: "Production" },
  { label: "Quality Lab" },
];

const DEFAULT_STATS: CompanyStatVM[] = [
  { label: "Years in business", value: "15+" },
  { label: "Projects completed", value: "500+" },
  { label: "Employees", value: "100+" },
  { label: "Factory area", value: "30,000 sq ft" },
  { label: "Countries served", value: "5+" },
];

/** Per-slug editorial overrides (a flagship gets hand-written content; all others use the templated
 *  default). Add entries here as curated content lands — never wired to a contract. */
const OVERRIDES: Record<string, Partial<VendorCompanyContentVM>> = {
  "padma-valve-fittings": {
    mission:
      "To keep Bangladesh's power, water, and process plants running with dependable valves and fittings — engineered to specification and supported for the long term.",
    vision:
      "To be the country's most trusted partner for industrial valves and pipeline fittings, known for engineering quality and responsive service.",
    stats: [
      { label: "Years in business", value: "20+" },
      { label: "Projects completed", value: "750+" },
      { label: "Employees", value: "120+" },
      { label: "Factory area", value: "45,000 sq ft" },
      { label: "Countries served", value: "6" },
    ],
  },
};

/** Build the company-website editorial content for a vendor, personalised from its public profile. The
 *  result is a presentation stand-in only (coins nothing; binds no contract). */
export function getCompanyContent(profile: PublicVendorProfileVM): VendorCompanyContentVM {
  const { name, category } = profile;
  const base: VendorCompanyContentVM = {
    overview: profile.about,
    businessOverview: `${name} serves industrial clients across Bangladesh with ${category.toLowerCase()} solutions, combining in-house capability with responsive after-sales support.`,
    facilities: `The facility houses production, fabrication, and quality-control areas equipped for ${category.toLowerCase()} work, with capacity to scale to project demand.`,
    mission: `To deliver dependable ${category.toLowerCase()} solutions that keep Bangladesh's industries running — on time, to specification, and built to last.`,
    vision: `To be Bangladesh's most trusted partner for ${category.toLowerCase()}, recognised for engineering quality, reliability, and long-term customer relationships.`,
    values: DEFAULT_VALUES,
    history: DEFAULT_HISTORY,
    management: {
      name: "Managing Director",
      title: `${name}`,
      message: `At ${name}, our focus is simple: deliver quality ${category.toLowerCase()} solutions, on time, and stand behind them. We are grateful to the industrial partners who have grown with us, and we remain committed to earning that trust every day.`,
    },
    industries: DEFAULT_INDUSTRIES,
    capabilities: DEFAULT_CAPABILITIES,
    certifications: DEFAULT_CERTIFICATIONS,
    gallery: DEFAULT_GALLERY,
    stats: DEFAULT_STATS,
  };

  return { ...base, ...OVERRIDES[profile.slug] };
}
