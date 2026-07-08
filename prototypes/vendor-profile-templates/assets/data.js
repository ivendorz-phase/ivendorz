/* ==========================================================================
   SHARED VENDOR DATA MODEL — the single source all 5 layouts consume.
   ==========================================================================
   This file IS the "Content ≠ Presentation" demonstration (Invariant #9,
   Golden Rule #4). Every template (Layout 01–05), the comparison page and the
   selection screen read from THIS object. Templates change layout / hierarchy /
   emphasis ONLY — never the data. Editing content here updates all 5 layouts.

   100% MOCK. No backend, no API, no Prisma, no persistence. Non-production.
   Governance honored in the shape of the data:
     • Verified = BINARY (verified: true/false) — no fabricated sub-scores.
     • Trust indicators = band + numeric 0–100 ONLY (display-permitted, Board
       2026-07-03). NO formula, percentile, ranking, matching or fraud signal.
     • Capability = 4-flag MATRIX (can_supply/service/fabricate/consult),
       never a single label (Invariant #1).
     • "Featured" products/projects are an EDITORIAL slice, never a computed
       ranking (GI-04). Order here is curated, not scored.
     • Money is never settled on-platform — CTAs route to auth/inquiry only.
   ========================================================================== */

/* Inline SVG placeholder — a labelled industrial "photo" tile (no external
   requests). `kind` tints the gradient; `label` + `sub` print on the tile. */
function ivPlaceholder(kind, label, sub) {
  const grads = {
    product: ["#1f3154", "#375081"],
    project: ["#182643", "#283f6a"],
    gallery: ["#0b1322", "#1f3154"],
    factory: ["#283f6a", "#5a74a3"],
    cover: ["#111c33", "#23438f"],
    logo: ["#23438f", "#2f5eb8"],
    client: ["#e2e8f0", "#f1f5f9"],
  };
  const [a, b] = grads[kind] || grads.product;
  const ink = kind === "client" ? "#475569" : "#ffffff";
  const id = "g" + Math.abs(hashStr(label + kind));
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>` +
        `<defs><linearGradient id='${id}' x1='0' y1='0' x2='1' y2='1'>` +
        `<stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient>` +
        `<pattern id='p${id}' width='40' height='40' patternUnits='userSpaceOnUse'>` +
        `<path d='M0 40 L40 0 M-10 10 L10 -10 M30 50 L50 30' stroke='${ink}' stroke-opacity='0.06' stroke-width='2'/></pattern></defs>` +
        `<rect width='800' height='600' fill='url(#${id})'/>` +
        `<rect width='800' height='600' fill='url(#p${id})'/>` +
        `<text x='40' y='530' fill='${ink}' fill-opacity='0.92' font-family='Inter,sans-serif' font-size='40' font-weight='700'>${esc(label)}</text>` +
        (sub
          ? `<text x='40' y='568' fill='${ink}' fill-opacity='0.6' font-family='Inter,sans-serif' font-size='22'>${esc(sub)}</text>`
          : "") +
        `</svg>`,
    )
  );
}
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

const IV_VENDOR = {
  slug: "meghna-industrial-valves",
  name: "Meghna Industrial Valves & Fittings Ltd.",
  tagline: "Precision-engineered industrial valves, flanges & piping systems — built in Bangladesh, trusted across South Asia.",
  established: 2004,
  memberSince: "March 2022",

  logo: ivPlaceholder("logo", "MIV", ""),
  coverBanner: ivPlaceholder("cover", "Meghna Industrial", "Narayanganj · Bangladesh"),

  /* --- Hero slides (image + text) — rendered as an auto-sliding carousel --- */
  heroSlides: [
    {
      img: ivPlaceholder("cover", "Meghna Industrial", "Narayanganj · Bangladesh"),
      eyebrow: "Industrial fluid-control",
      title: "Engineered valves & piping, built in Bangladesh",
      text: "API 6D / ANSI / DIN-grade manufacturing from our ISO-certified plant in Narayanganj.",
      cta: "Request a quote",
    },
    {
      img: ivPlaceholder("factory", "45,000 m² Plant", "Forging · CNC · Hydro-test"),
      eyebrow: "Manufacturing",
      title: "A 45,000 m² integrated facility",
      text: "Forging, CNC machining, assembly and a fully instrumented hydro-test laboratory under one roof.",
      cta: "Tour the plant",
    },
    {
      img: ivPlaceholder("project", "1,800+ Projects", "Power · Water · Petrochemical"),
      eyebrow: "Proven track record",
      title: "Trusted on 1,800+ industrial projects",
      text: "From 400 MW power plants to national water networks across Bangladesh and South Asia.",
      cta: "See our projects",
    },
  ],

  /* --- Trust & verification (governance-scoped) ------------------------- */
  verified: true, // BINARY — verified engagement / KYB complete
  verificationBadges: [
    { label: "Verified Business", icon: "shield-check", tone: "success" },
    { label: "KYB Complete", icon: "badge-check", tone: "info" },
    { label: "Trade Licence on File", icon: "file-check", tone: "neutral" },
  ],
  trust: {
    band: "High", // band label — display permitted
    score: 82, // 0–100 numeric — display permitted (NOT a ranking/percentile)
    updated: "12 Jun 2026",
    // categorical pillars only (no formula, no weights exposed)
    pillars: [
      { label: "Verification", value: "Complete" },
      { label: "Responsiveness", value: "Fast" },
      { label: "Documentation", value: "Strong" },
      { label: "Tenure", value: "4+ yrs" },
    ],
  },
  financialTier: { code: "C", label: "Tier C" }, // A–E capability, not a plan

  /* --- Capability matrix (4 flags — Invariant #1) ---------------------- */
  capability: { can_supply: true, can_service: true, can_fabricate: true, can_consult: true },

  /* --- Headline stats (self-declared vendor facts, not platform scores) - */
  stats: [
    { value: "20+", label: "Years in operation", icon: "calendar" },
    { value: "1,800+", label: "Projects delivered", icon: "package-check" },
    { value: "45,000 m²", label: "Manufacturing facility", icon: "factory" },
    { value: "12", label: "Countries served", icon: "globe" },
  ],

  /* --- Narrative ------------------------------------------------------- */
  businessSummary:
    "Meghna Industrial is a leading Bangladeshi manufacturer and fabricator of industrial valves, forged flanges, and complete piping systems for the power, petrochemical, water treatment, and textile sectors. From our ISO-certified plant in Narayanganj we supply, fabricate, service, and consult across the full lifecycle of fluid-control infrastructure.",
  aboutCompany: [
    "Founded in 2004, Meghna Industrial Valves & Fittings Ltd. began as a small foundry serving the Narayanganj textile belt and has grown into one of South Asia's most trusted fluid-control manufacturers. Our 45,000 m² facility houses forging, CNC machining, assembly, and a fully instrumented hydro-test laboratory.",
    "We manufacture to API 6D, API 600, ANSI, and DIN standards, and our in-house engineering team supports custom fabrication for high-pressure, high-temperature, and corrosive-media applications. Every valve leaves the plant with a stamped hydro-test certificate and full material traceability.",
    "Beyond supply, our field-service division commissions, overhauls, and maintains installed valve assets nationwide — and our consulting practice advises EPC contractors on piping-system selection, sizing, and standards compliance.",
  ],

  /* --- Capabilities (detailed, maps to the 4 flags) -------------------- */
  capabilities: [
    { flag: "can_supply", title: "Supply", desc: "Gate, globe, ball, butterfly & check valves; forged flanges; fittings — ex-stock and made-to-order.", icon: "package" },
    { flag: "can_fabricate", title: "Fabrication", desc: "Custom valve bodies, skid-mounted manifolds & spool assemblies to client drawings and API/ANSI/DIN specs.", icon: "hammer" },
    { flag: "can_service", title: "Service & Commissioning", desc: "On-site installation, hydro-testing, overhaul and preventive maintenance of installed valve assets.", icon: "wrench" },
    { flag: "can_consult", title: "Engineering Consulting", desc: "Piping-system design review, valve sizing, material selection and standards-compliance advisory.", icon: "compass" },
  ],

  /* --- Products (curated / editorial order — NOT a ranking, GI-04) ----- */
  productCategories: [
    { id: "valves", label: "Industrial Valves", count: 48 },
    { id: "flanges", label: "Forged Flanges", count: 26 },
    { id: "fittings", label: "Pipe Fittings", count: 34 },
    { id: "actuators", label: "Actuators & Automation", count: 12 },
    { id: "spares", label: "Spares & Kits", count: 60 },
  ],
  products: [
    { id: "p1", cat: "valves", name: "API 6D Cast-Steel Gate Valve", spec: 'DN50–DN600 · Class 150–900 · WCB body', moq: "5 units", lead: "3–4 weeks", tags: ["API 6D", "Flanged"], img: ivPlaceholder("product", "Gate Valve", "API 6D · Class 300") },
    { id: "p2", cat: "valves", name: "Stainless Ball Valve, Full Bore", spec: 'DN15–DN200 · CF8M · PTFE seat', moq: "10 units", lead: "2–3 weeks", tags: ["SS316", "Full bore"], img: ivPlaceholder("product", "Ball Valve", "CF8M · Full bore") },
    { id: "p3", cat: "valves", name: "Wafer Butterfly Valve, EPDM", spec: 'DN50–DN600 · Ductile iron · Lever/gear', moq: "10 units", lead: "2 weeks", tags: ["EPDM", "Wafer"], img: ivPlaceholder("product", "Butterfly Valve", "DN50–DN600") },
    { id: "p4", cat: "flanges", name: "Weld-Neck Forged Flange", spec: 'ASME B16.5 · A105N · RF face', moq: "25 units", lead: "1–2 weeks", tags: ["ASME B16.5", "A105N"], img: ivPlaceholder("product", "WN Flange", "ASME B16.5 · RF") },
    { id: "p5", cat: "fittings", name: "Seamless Butt-Weld Elbow 90°", spec: 'ASTM A234 WPB · Sch 40/80', moq: "50 units", lead: "1 week", tags: ["A234 WPB", "Seamless"], img: ivPlaceholder("product", "90° Elbow", "A234 WPB · Sch 80") },
    { id: "p6", cat: "actuators", name: "Pneumatic Rack-&-Pinion Actuator", spec: 'Double-acting · ISO 5211 · 20–1600 Nm', moq: "5 units", lead: "4 weeks", tags: ["ISO 5211", "Pneumatic"], img: ivPlaceholder("product", "Actuator", "Rack & pinion") },
    { id: "p7", cat: "valves", name: "Cast-Steel Globe Valve, OS&Y", spec: 'DN25–DN300 · Class 150–600 · Bolted bonnet', moq: "5 units", lead: "3 weeks", tags: ["OS&Y", "Class 300"], img: ivPlaceholder("product", "Globe Valve", "OS&Y · Bolted bonnet") },
    { id: "p8", cat: "spares", name: "Valve Seat & Gland Repair Kit", spec: 'Graphite/PTFE · sizes to order', moq: "20 kits", lead: "1 week", tags: ["Repair kit", "OEM"], img: ivPlaceholder("product", "Repair Kit", "Graphite / PTFE") },
  ],

  /* --- Services -------------------------------------------------------- */
  services: [
    { title: "Hydro-Testing & Certification", desc: "In-house instrumented hydro-test lab; every valve shipped with a stamped test certificate.", icon: "gauge" },
    { title: "On-Site Commissioning", desc: "Field crews for installation, alignment and start-up of valve and piping assemblies.", icon: "hard-hat" },
    { title: "Overhaul & Maintenance", desc: "Scheduled and breakdown maintenance, reseating, and refurbishment of installed assets.", icon: "wrench" },
    { title: "Custom Fabrication", desc: "Made-to-drawing manifolds, spools and skids for non-standard process requirements.", icon: "hammer" },
  ],

  /* --- Industries served ----------------------------------------------- */
  industries: [
    { label: "Power & Energy", icon: "zap" },
    { label: "Petrochemical & Refining", icon: "flame" },
    { label: "Water & Wastewater", icon: "droplets" },
    { label: "Textile & Dyeing", icon: "shirt" },
    { label: "Cement & Building Materials", icon: "building-2" },
    { label: "Food & Beverage Processing", icon: "utensils" },
    { label: "Pharmaceutical", icon: "pill" },
    { label: "Shipbuilding & Marine", icon: "anchor" },
  ],

  /* --- Featured projects (editorial slice — NOT a ranking, GI-04) ------ */
  projects: [
    {
      id: "j1",
      name: "Ashuganj 400 MW Combined-Cycle Plant",
      client: "Bangladesh Power Development Board",
      year: 2024,
      scope: "Supply & commissioning of 620 high-pressure gate and globe valves for the steam and feedwater circuits, with on-site hydro-testing.",
      sector: "Power & Energy",
      value: "Class 600–900 · DN50–DN500",
      img: ivPlaceholder("project", "Ashuganj CCPP", "620 HP valves · 2024"),
    },
    {
      id: "j2",
      name: "Meghna Group Petrochemical Expansion",
      client: "Meghna Group of Industries",
      year: 2023,
      scope: "Fabrication of 40 skid-mounted valve manifolds and full piping spool packages for a new solvent-extraction line.",
      sector: "Petrochemical",
      value: "40 skids · CS/SS",
      img: ivPlaceholder("project", "Petrochem Expansion", "40 skids · 2023"),
    },
    {
      id: "j3",
      name: "Dhaka WASA Saidabad Phase-III",
      client: "Dhaka Water Supply & Sewerage Authority",
      year: 2023,
      scope: "Supply of 1,200 butterfly and check valves for the intake and distribution network, with 24-month maintenance support.",
      sector: "Water & Wastewater",
      value: "1,200 valves · DN300–DN1200",
      img: ivPlaceholder("project", "Saidabad WTP III", "1,200 valves · 2023"),
    },
    {
      id: "j4",
      name: "Bashundhara Cement Line-2 Retrofit",
      client: "Bashundhara Industrial Complex",
      year: 2022,
      scope: "Overhaul and replacement of process valves across the raw-mill and kiln circuits during a 21-day shutdown window.",
      sector: "Cement",
      value: "Shutdown · 310 valves",
      img: ivPlaceholder("project", "Cement Line-2", "Retrofit · 2022"),
    },
  ],

  /* --- Gallery (plant / product photography) --------------------------- */
  gallery: [
    ivPlaceholder("gallery", "Forging Shop", ""),
    ivPlaceholder("gallery", "CNC Machining", ""),
    ivPlaceholder("factory", "Assembly Line", ""),
    ivPlaceholder("gallery", "Hydro-Test Lab", ""),
    ivPlaceholder("factory", "QC Inspection", ""),
    ivPlaceholder("gallery", "Warehouse", ""),
  ],

  /* --- Certifications -------------------------------------------------- */
  certifications: [
    { name: "ISO 9001:2015", body: "Quality Management System", year: 2021, icon: "award" },
    { name: "API 6D Monogram", body: "American Petroleum Institute", year: 2022, icon: "shield-check" },
    { name: "ISO 14001:2015", body: "Environmental Management", year: 2022, icon: "leaf" },
    { name: "CE Marking (PED)", body: "Pressure Equipment Directive", year: 2023, icon: "badge-check" },
    { name: "BSTI Certified", body: "Bangladesh Standards & Testing", year: 2020, icon: "stamp" },
  ],

  /* --- Clients (logo + text — rendered as a slow auto-slide carousel) --- */
  clients: [
    { name: "Bangladesh PDB", note: "Power sector · since 2019", logo: ivPlaceholder("client", "PDB", "") },
    { name: "Meghna Group", note: "Petrochemical · 12 projects", logo: ivPlaceholder("client", "MGI", "") },
    { name: "Dhaka WASA", note: "Water & wastewater", logo: ivPlaceholder("client", "WASA", "") },
    { name: "Bashundhara", note: "Cement & building materials", logo: ivPlaceholder("client", "BIC", "") },
    { name: "Summit Power", note: "Independent power producer", logo: ivPlaceholder("client", "SPL", "") },
    { name: "Walton", note: "Manufacturing · since 2021", logo: ivPlaceholder("client", "WLT", "") },
    { name: "Akij Group", note: "Diversified industrial", logo: ivPlaceholder("client", "AKIJ", "") },
    { name: "PRAN-RFL", note: "Food & beverage processing", logo: ivPlaceholder("client", "PRAN", "") },
  ],

  /* --- Factory information --------------------------------------------- */
  factory: {
    area: "45,000 m²",
    location: "BSCIC Industrial Estate, Narayanganj",
    lines: "Forging · CNC machining · Assembly · Hydro-test lab",
    capacity: "18,000 valve units / month",
    workforce: "420 staff (65 engineers)",
    standards: "API 6D · API 600 · ANSI · DIN · ISO",
    img: ivPlaceholder("factory", "Narayanganj Plant", "45,000 m² facility"),
  },

  /* --- Team (optional section) ----------------------------------------- */
  team: [
    { name: "Engr. Rafiqul Islam", role: "Managing Director", initials: "RI" },
    { name: "Engr. Nusrat Jahan", role: "Head of Engineering", initials: "NJ" },
    { name: "Md. Kamrul Hasan", role: "Plant Manager", initials: "KH" },
    { name: "Tanvir Ahmed", role: "Head of Sales", initials: "TA" },
  ],

  /* --- Business information -------------------------------------------- */
  businessInfo: [
    { label: "Legal name", value: "Meghna Industrial Valves & Fittings Ltd." },
    { label: "Business type", value: "Private Limited Company" },
    { label: "Year established", value: "2004" },
    { label: "Trade licence", value: "On file · verified" },
    { label: "Employees", value: "420" },
    { label: "Export markets", value: "India · Nepal · Sri Lanka · UAE" },
  ],

  /* --- Contact --------------------------------------------------------- */
  contact: {
    address: "Plot 71–74, BSCIC Industrial Estate, Fatullah, Narayanganj 1421, Bangladesh",
    phone: "+880 2 7650 4210",
    email: "sales@meghna-valves.example",
    website: "www.meghna-valves.example",
    hours: "Sat–Thu · 9:00–18:00 (BST)",
  },
  social: [
    { label: "LinkedIn", icon: "linkedin", href: "#" },
    { label: "Facebook", icon: "facebook", href: "#" },
    { label: "YouTube", icon: "youtube", href: "#" },
  ],

  /* --- Related vendors (discovery cross-links) ------------------------- */
  related: [
    { name: "Padma Flanges & Forgings Ltd.", cat: "Forged flanges · fittings", verified: true, logo: ivPlaceholder("logo", "PF", "") },
    { name: "Jamuna Pumps & Systems", cat: "Centrifugal pumps · packages", verified: true, logo: ivPlaceholder("logo", "JP", "") },
    { name: "Karnaphuli Steel Fabricators", cat: "Structural & pressure fabrication", verified: false, logo: ivPlaceholder("logo", "KS", "") },
  ],
};

/* Section registry — demonstrates "sections are configurable" (enable /
   disable / reorder without changing the template). The prototype's section
   panel toggles these; each layout renders only enabled sections, in order. */
const IV_SECTIONS = [
  { id: "about", label: "About Company", enabled: true },
  { id: "capabilities", label: "Capabilities", enabled: true },
  { id: "products", label: "Products & Catalogue", enabled: true },
  { id: "services", label: "Services", enabled: true },
  { id: "industries", label: "Industries Served", enabled: true },
  { id: "projects", label: "Featured Projects", enabled: true },
  { id: "gallery", label: "Gallery", enabled: true },
  { id: "certifications", label: "Certifications", enabled: true },
  { id: "clients", label: "Clients", enabled: true },
  { id: "factory", label: "Factory Information", enabled: true },
  { id: "team", label: "Team", enabled: false },
  { id: "business", label: "Business Information", enabled: true },
  { id: "contact", label: "Contact & Location", enabled: true },
  { id: "related", label: "Related Vendors", enabled: true },
];

if (typeof window !== "undefined") {
  window.IV_VENDOR = IV_VENDOR;
  window.IV_SECTIONS = IV_SECTIONS;
  window.ivPlaceholder = ivPlaceholder;
}
