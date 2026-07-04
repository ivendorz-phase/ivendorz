// Company-website editorial SEED for the public vendor microsite (M2.6). This is curated EDITORIAL
// presentation content — NOT data, NOT a coined taxonomy, NOT a frozen contract. It stands in for the
// vendor's published M2 microsite content exactly as the discovery `PROFILE_EXTRAS` seed does, under the
// same registered interim. The fields here (mission/vision/values/why/history/management/industries/
// certifications/stats/gallery/projects/downloads/faq/contact) have NO frozen public-projection columns;
// they coin nothing and are rendered as supplier-provided company-website content only.
//
// GOVERNANCE: presentation-only. NO trust/performance score, NO financial tier, NO turnover/revenue, NO
// platform-verification claim (certifications are SELF-DECLARED company info, never the binary "Verified"
// signal — that stays the M5 public projection). Industries are a presentation reference (not modeled in
// the frozen corpus — landing_page_spec §4 note). Stats are illustrative, supplier-provided, never
// computed. Projects stand in for the frozen `showcase_projects` entity (not wired) with sector/role
// "client" descriptors only — never a fabricated company name. Contact channels are platform-mediated
// (sign-in gated — the lead model). Every field is optional → the components render genuine-empty when
// absent.
import type { PublicVendorProfileVM } from "../discovery/seed";

export interface CompanyValueVM {
  title: string;
  description?: string;
}
export interface CompanyDifferentiatorVM {
  title: string;
  description?: string;
}
export interface CompanyTimelineEntryVM {
  /** Optional label (e.g. a milestone phase) — the seed uses phase labels, never fabricated dates. */
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
export interface ProjectShowcaseVM {
  name: string;
  industry?: string;
  /** Sector/role descriptor (list-card default) — the list cards show THIS, never a company name. */
  client?: string;
  scope?: string;
  /** Generic period label — never a fabricated exact date. */
  year?: string;
  /** Equipment/scope tags (editorial). */
  equipment?: string[];
  /** Decorative tile label (no fabricated image source). */
  imageLabel?: string;

  // ── FE-PUB-11 Project Detail page fields (all optional; the list card ignores them, so its render
  //    is byte-stable). Every field is vendor-authored editorial content (coins no platform signal,
  //    R7-safe). Governance rulings from the design companion §6.9 are honored HERE:
  /** URL segment for the detail page (`/vendors/[slug]/projects/[slug]`). Absent → "View details" stays disabled. */
  slug?: string;
  /**
   * Named client — shown on the DETAIL page only (owner Board ruling R2, companion §6.9). Vendor-authored
   * + consent-responsible; coins no platform signal; never exposes a buyer-private/blacklisted relationship
   * (a vendor publishing its own reference ≠ the platform disclosing a buyer's private sourcing record).
   * The list card deliberately keeps showing the sector/role `client` above (R2 scoped to the detail page).
   */
  namedClient?: string;
  /** Project status label — rendered as a StatusChip (frozen state vocabulary, e.g. "completed"). */
  status?: string;
  /** Duration label (e.g. "6 Months") — editorial, never a computed figure. */
  durationLabel?: string;
  /** Location label (e.g. "Chittagong, Bangladesh"). */
  location?: string;
  /** Decorative hero-tile caption (no fabricated image source, R4). */
  heroCaption?: string;
  /** "The Challenge" narrative block (vendor-authored). */
  challenge?: string;
  /** "Our Solution" narrative block (vendor-authored). */
  solution?: string;
  /** Scope-of-deliverables checklist (vendor-authored editorial). */
  deliverables?: string[];
  /** Technologies & methods tags (editorial descriptors, not a coined governance signal). */
  technologies?: string[];
  /** Decorative gallery-tile captions (no fabricated image sources, R4). */
  galleryLabels?: string[];
  /** Category tags for the sidebar (e.g. ["Power", "Infrastructure"]) — labels only, no facet read. */
  tags?: string[];
}
export interface DownloadItemVM {
  label: string;
  /** File-kind hint (e.g. "PDF"). */
  fileType?: string;
  description?: string;
}
export interface FaqItemVM {
  question: string;
  answer: string;
}
export interface CompanyContactVM {
  /** Editorial location line (mirrors the discovery seed's editorial location). */
  address?: string;
  /** Business hours (editorial). */
  hours?: string;
  /** Decorative map-placeholder label (no real embed/coordinates). */
  mapLabel?: string;
}

export interface VendorCompanyContentVM {
  overview?: string;
  businessOverview?: string;
  facilities?: string;
  mission?: string;
  vision?: string;
  values?: CompanyValueVM[];
  whyChooseUs?: CompanyDifferentiatorVM[];
  history?: CompanyTimelineEntryVM[];
  management?: ManagementMessageVM;
  industries?: string[];
  capabilities?: CapabilityAreaVM[];
  certifications?: CertificationVM[];
  gallery?: GalleryItemVM[];
  stats?: CompanyStatVM[];
  projects?: ProjectShowcaseVM[];
  downloads?: DownloadItemVM[];
  faq?: FaqItemVM[];
  contact?: CompanyContactVM;
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

const DEFAULT_WHY_CHOOSE_US: CompanyDifferentiatorVM[] = [
  {
    title: "Engineering-led",
    description: "Specifications matched to your process — not just a parts list.",
  },
  {
    title: "On-time delivery",
    description: "Planned lead times with proactive updates through to handover.",
  },
  {
    title: "Quality assurance",
    description: "ISO-aligned processes with in-house inspection and testing.",
  },
  {
    title: "After-sales support",
    description: "Spares, service, and technical support beyond the sale.",
  },
  {
    title: "Sourcing strength",
    description: "In-house capability backed by a vetted supplier network.",
  },
  {
    title: "Responsive service",
    description: "A dedicated point of contact for every order.",
  },
];

const DEFAULT_HISTORY: CompanyTimelineEntryVM[] = [
  { title: "Founded", description: "Established to serve Bangladesh's industrial sector." },
  { title: "First export order", description: "Grew beyond the domestic market." },
  { title: "ISO certified", description: "Adopted ISO-aligned quality-management systems." },
  { title: "New factory", description: "Upgraded facilities, machinery, and in-house testing." },
  {
    title: "500th project delivered",
    description: "A milestone reflecting sustained industrial trust.",
  },
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
  { label: "Installation" },
  { label: "Testing" },
  { label: "Completed Projects" },
  { label: "Products" },
  { label: "Certificates" },
];

const DEFAULT_STATS: CompanyStatVM[] = [
  { label: "Years in business", value: "15+" },
  { label: "Projects completed", value: "500+" },
  { label: "Employees", value: "100+" },
  { label: "Countries served", value: "5+" },
  { label: "Workshop area", value: "30,000 sq ft" },
];

const DEFAULT_PROJECTS: ProjectShowcaseVM[] = [
  {
    name: "High Voltage Substation",
    slug: "high-voltage-substation",
    industry: "Power",
    client: "National utility",
    namedClient: "National Grid",
    scope: "132/33kV power transformers and switchgear for grid distribution.",
    year: "2022",
    status: "completed",
    durationLabel: "6 Months",
    location: "Chittagong, Bangladesh",
    heroCaption: "Precision Welding",
    challenge:
      "This project required comprehensive engineering oversight for a national grid client. The primary challenge involved retrofitting existing infrastructure with modern power capabilities while strictly maintaining operational uptime to avoid production losses.",
    solution:
      "Installation of 132/33kV power transformers and switchgear for efficient grid distribution and industrial power supply. To ensure precision, specialized teams handled the structural modifications and system integration simultaneously, using 3D modelling (BIM) to prevent clashes and ensure a seamless installation process.",
    deliverables: [
      "Structural Analysis & Design",
      "Fabrication (500 Tons)",
      "On-site Installation",
      "Procurement Grade Materials",
      "Non-Destructive Testing (NDT)",
    ],
    technologies: ["3D Modelling (BIM)", "Precision Welding", "Switchgear Integration"],
    galleryLabels: [
      "Site Preparation",
      "Transmission Towers",
      "Structural Steel Erection",
      "Crane Lift",
      "Commissioning",
      "Control Room",
    ],
    equipment: ["Power transformers", "Switchgear", "Structural steel"],
    tags: ["Power", "Infrastructure"],
    imageLabel: "Substation",
  },
  {
    name: "Process plant valve supply",
    slug: "process-plant-valve-supply",
    industry: "Chemical",
    client: "Process manufacturer",
    namedClient: "Meghna Petrochemical Ltd.",
    scope: "Supply of industrial valves, actuators, and fittings for a plant upgrade.",
    year: "2023",
    status: "completed",
    durationLabel: "4 Months",
    location: "Narayanganj, Bangladesh",
    heroCaption: "Valve Assembly",
    challenge:
      "A process plant upgrade required a phased valve and actuator replacement without shutting the line down, under strict material-traceability requirements.",
    solution:
      "Staged supply of gate valves, actuators, and flanged fittings with full material certification, sequenced around the plant's maintenance windows to keep production running.",
    deliverables: [
      "Valve & actuator supply",
      "Material traceability certificates",
      "On-site fitment support",
    ],
    technologies: ["Material Traceability", "Actuator Calibration"],
    galleryLabels: ["Valve Assembly", "Actuator Test", "Installation"],
    equipment: ["Gate valves", "Actuators", "Flanged fittings"],
    tags: ["Chemical", "Process"],
    imageLabel: "Installation",
  },
  {
    name: "Water treatment pumping",
    slug: "water-treatment-pumping",
    industry: "Water Treatment",
    client: "Municipal utility",
    namedClient: "Chattogram WASA",
    scope: "Pump supply, installation, and commissioning for a treatment facility.",
    year: "2022",
    status: "completed",
    durationLabel: "5 Months",
    location: "Chittagong, Bangladesh",
    heroCaption: "Pumping Station",
    challenge:
      "A municipal treatment facility needed additional pumping capacity commissioned within a tight civil-works schedule.",
    solution:
      "Supply, installation, and commissioning of centrifugal pumps with control panels, coordinated with the civil contractor to meet the facility's cutover date.",
    deliverables: ["Pump supply", "Control-panel integration", "Commissioning & handover"],
    technologies: ["Pump Commissioning", "Control Panel Integration"],
    galleryLabels: ["Pumping Station", "Control Panel", "Commissioning"],
    equipment: ["Centrifugal pumps", "Control panels"],
    tags: ["Water Treatment", "Utilities"],
    imageLabel: "Pumping station",
  },
  {
    name: "Food & beverage line",
    slug: "food-beverage-line",
    industry: "Food & Beverage",
    client: "FMCG manufacturer",
    namedClient: "Pran-RFL Group",
    scope: "Hygienic valves and stainless fittings for a production line.",
    year: "2021",
    status: "completed",
    durationLabel: "3 Months",
    location: "Gazipur, Bangladesh",
    heroCaption: "Production Line",
    challenge:
      "A new production line required hygienic-grade valves and stainless fittings meeting food-safety standards, delivered ahead of the line's start-up.",
    solution:
      "Supply of hygienic valves and stainless fittings to the required food-safety grade, delivered and fitted ahead of the line's commissioning date.",
    deliverables: ["Hygienic valve supply", "Stainless fitting supply", "Fitment support"],
    technologies: ["Hygienic Design", "Stainless Fabrication"],
    galleryLabels: ["Production Line", "Hygienic Valves", "Fitting"],
    equipment: ["Hygienic valves", "SS fittings"],
    tags: ["Food & Beverage", "Manufacturing"],
    imageLabel: "Production line",
  },
];

const DEFAULT_DOWNLOADS: DownloadItemVM[] = [
  {
    label: "Company Profile",
    fileType: "PDF",
    description: "Overview of the company and its capabilities.",
  },
  {
    label: "Product Catalog",
    fileType: "PDF",
    description: "Full product range and specifications.",
  },
  { label: "Brochure", fileType: "PDF", description: "Quick-reference company brochure." },
  { label: "Certificates", fileType: "PDF", description: "Quality certificates and licenses." },
  {
    label: "Technical Datasheets",
    fileType: "PDF",
    description: "Datasheets for selected products.",
  },
];

const DEFAULT_FAQ: FaqItemVM[] = [
  {
    question: "What industries do you serve?",
    answer:
      "We serve a range of industrial sectors including power, water treatment, chemical, food & beverage, textile, and general engineering.",
  },
  {
    question: "Do you manufacture, or only supply?",
    answer:
      "Our capabilities are shown in the Capabilities section — depending on the product line we supply, fabricate, service, and provide engineering support.",
  },
  {
    question: "What is the minimum order quantity (MOQ)?",
    answer:
      "MOQ varies by product. Send a quote request with your requirement and we will confirm what applies.",
  },
  {
    question: "What are typical lead times?",
    answer:
      "Lead times depend on the item and quantity. Stocked items ship faster; made-to-order and imported items take longer. We confirm a timeline with every quotation.",
  },
  {
    question: "Do you supply outside Bangladesh?",
    answer:
      "Our primary market is Bangladesh; availability outside the country depends on the product. Please enquire for specific requirements.",
  },
  {
    question: "Do products come with a warranty?",
    answer:
      "Warranty terms depend on the product and manufacturer, and are confirmed at the time of quotation.",
  },
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
      { label: "Countries served", value: "6" },
      { label: "Workshop area", value: "45,000 sq ft" },
    ],
  },
};

/** Build the company-website editorial content for a vendor, personalised from its public profile. The
 *  result is a presentation stand-in only (coins nothing; binds no contract). */
export function getCompanyContent(profile: PublicVendorProfileVM): VendorCompanyContentVM {
  const { name, category } = profile;
  const lower = category.toLowerCase();
  const base: VendorCompanyContentVM = {
    overview: profile.about,
    businessOverview: `${name} serves industrial clients across Bangladesh with ${lower} solutions, combining in-house capability with responsive after-sales support.`,
    facilities: `The facility houses production, fabrication, and quality-control areas equipped for ${lower} work, with capacity to scale to project demand.`,
    mission: `To deliver dependable ${lower} solutions that keep Bangladesh's industries running — on time, to specification, and built to last.`,
    vision: `To be Bangladesh's most trusted partner for ${lower}, recognised for engineering quality, reliability, and long-term customer relationships.`,
    values: DEFAULT_VALUES,
    whyChooseUs: DEFAULT_WHY_CHOOSE_US,
    history: DEFAULT_HISTORY,
    management: {
      name: "Managing Director",
      title: `${name}`,
      message: `At ${name}, our focus is simple: deliver quality ${lower} solutions, on time, and stand behind them. We are grateful to the industrial partners who have grown with us, and we remain committed to earning that trust every day.`,
    },
    industries: DEFAULT_INDUSTRIES,
    capabilities: DEFAULT_CAPABILITIES,
    certifications: DEFAULT_CERTIFICATIONS,
    gallery: DEFAULT_GALLERY,
    stats: DEFAULT_STATS,
    projects: DEFAULT_PROJECTS,
    downloads: DEFAULT_DOWNLOADS,
    faq: DEFAULT_FAQ,
    contact: {
      address: profile.location ? `${profile.location}, Bangladesh` : "Bangladesh",
      hours: "Sunday – Thursday, 9:00 AM – 6:00 PM",
      mapLabel: profile.location ?? name,
    },
  };

  return { ...base, ...OVERRIDES[profile.slug] };
}

/** Resolve a single showcase project for a vendor by its slug (FE-PUB-11 detail page). Presentation
 *  stand-in for the frozen `showcase_projects` read (unwired) — returns `undefined` for an unknown
 *  slug so the route renders the byte-equivalent 404 (Invariant #11). Coins no contract. */
export function getShowcaseProject(
  profile: PublicVendorProfileVM,
  projectSlug: string,
): ProjectShowcaseVM | undefined {
  return getCompanyContent(profile).projects?.find((project) => project.slug === projectSlug);
}
