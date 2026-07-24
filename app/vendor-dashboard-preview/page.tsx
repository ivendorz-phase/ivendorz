// VENDOR DASHBOARD — POPULATED VISUAL PREVIEW (throwaway, NOT a shipped app surface).
//
// Owner asked (2026-07-18) to SEE the vendor dashboard "exact like" the claude.ai/design canvas
// `Vendor Dashboard.dc.html` (design project 5852bb75-de9b-49c6-b2c6-70f1009d0af3). This is that
// canvas reproduced pixel-for-pixel INSIDE our app, populated with the design's own sample figures
// so the full look is visible at http://localhost:3000/vendor-dashboard-preview.
//
// WHY THIS IS A SEPARATE TOP-LEVEL ROUTE, NOT /sell/dashboard:
//  • It carries the design's SAMPLE DATA (RFQ counts, buyer names, ৳ figures, a chart, Trust 78).
//    The live vendor console is governed by the 2026-07-17 owner directive (no demo data —
//    placeholder/empty until real reads are wired). Keeping the populated copy on its OWN route
//    leaves that governed page untouched: this is a preview to look at, not the shipped surface.
//  • It reproduces the design's FULL CHROME (light topbar + light 5-group sidebar). The real app
//    shell renders the ratified navy chrome shared by buyer/hybrid; a top-level route escapes the
//    `(workspace)` shell so there is no double chrome and no navy/light collision.
//  • Top-level (outside `(app)`) so it is not behind the auth guard — it renders for a plain look.
//
// FIDELITY: the design was authored against our synced kit; its tokens ARE our kit's landing.css
// tokens, redeclared on `#vdp` below with their exact values, and `--font-sans/--font-mono` point at
// the app's next/font Inter + JetBrains Mono. Same tokens + same fonts ⇒ identical render.
//
// This file is deliberately self-contained (raw markup + a scoped <style>) rather than composed from
// the kit primitives — it is a visual reference, not production UI. When/if any of this becomes real,
// it gets rebuilt from the kit with wired reads; nothing here should be imported.
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vendor Dashboard — Preview" };

/* ---- icon path fragments (viewBox 0 0 24 24), matching the design's `ic` map ---- */
const IC = {
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  quote:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/>',
  po: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  bill: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  follow:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m14 15-3 3-1.5-1.5"/>',
  msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  truck:
    '<path d="M14 17V5a1 1 0 0 0-1-1H2v13"/><path d="M14 8h5l3 3v6h-8"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  up: '<path d="M18 15l-6-6-6 6"/>',
  pay: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  down: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  cert: '<circle cx="12" cy="8" r="6"/><path d="M8.5 13 7 22l5-3 5 3-1.5-9"/>',
  save: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  bolt: '<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  users:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  refresh:
    '<path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>',
  leads: '<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>',
  pipe: '<path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 5-6"/>',
  dir: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
  show: '<path d="M2 3h20v14H2z"/><path d="M8 21h8M12 17v4"/>',
  star: '<path d="m12 2 3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>',
  orders: '<path d="M9 2h6l1 4H8z"/><path d="M4 6h16l-1.5 14a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2z"/>',
  note: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15h6"/>',
  docs: '<path d="M4 4a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M13 2v5h5"/>',
  crm: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  chart:
    '<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="12" y="6" width="3" height="11"/><rect x="17" y="13" width="3" height="4"/>',
  perf: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 11 3v-.09a2 2 0 0 1 4 0V3a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a2 2 0 0 1 0 4z"/>',
} as const;

type IconName = keyof typeof IC;

/** Inner SVG at 100%×100% (icon size comes from the wrapping span), matching the design's `S()`. */
const S = (name: IconName) =>
  `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[name]}</svg>`;

/** Chevron-down / arrow-right glyphs used in the chrome + card footers. */
const CHEV_DOWN = (sw = 2.2, sz = 15) =>
  `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
const ARROW_R = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

const badge = (bg: string, fg: string) =>
  `display:flex; align-items:center; justify-content:center; min-width:20px; height:20px; padding:0 6px; border-radius:6px; font-size:11px; font-weight:700; background:${bg}; color:${fg}`;
const chip = (bg: string, fg: string) =>
  `display:inline-block; margin-top:5px; font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:6px; background:${bg}; color:${fg}`;
const stat = (bg: string, fg: string) =>
  `display:inline-block; font-size:11px; font-weight:700; padding:2px 9px; border-radius:6px; background:${bg}; color:${fg}`;
const kiw = (bg: string, fg: string) =>
  `width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:${bg}; color:${fg}`;
const roundIcon = (size: number, bg: string, fg: string) =>
  `width:${size}px; height:${size}px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:${bg}; color:${fg}`;
const upDelta = (t: string) =>
  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg><span>${t}</span>`;

/* ============================ SIDEBAR ============================ */
const NAV_GROUPS: {
  title: string;
  items: { label: string; icon: IconName; badge?: string; badgeStyle?: string }[];
}[] = [
  {
    title: "Marketplace",
    items: [
      {
        label: "RFQ Leads",
        icon: "leads",
        badge: "18",
        badgeStyle: badge("var(--chip-bg)", "var(--brand-2)"),
      },
      {
        label: "My Quotations",
        icon: "quote",
        badge: "12",
        badgeStyle: badge("var(--chip-bg)", "var(--brand-2)"),
      },
      { label: "Sales Pipeline", icon: "pipe" },
      { label: "Buyer Directory", icon: "dir" },
      { label: "Product Showcase", icon: "show" },
      { label: "My Microsite", icon: "globe" },
      { label: "Reviews & Ratings", icon: "star" },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Purchase Orders",
        icon: "orders",
        badge: "5",
        badgeStyle: badge("var(--chip-bg)", "var(--brand-2)"),
      },
      { label: "Challans", icon: "note" },
      { label: "Bills & Invoices", icon: "bill" },
      { label: "Delivery Notes", icon: "truck" },
      { label: "Business Documents", icon: "docs" },
    ],
  },
  {
    title: "CRM & Communication",
    items: [
      { label: "Buyer CRM", icon: "crm" },
      {
        label: "Messages",
        icon: "chat",
        badge: "6",
        badgeStyle: badge("var(--chip-bg)", "var(--brand-2)"),
      },
      { label: "Follow-ups", icon: "follow", badge: "9", badgeStyle: badge("#fef0e6", "#d97706") },
      { label: "Notifications", icon: "bell" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Analytics & Reports", icon: "chart" },
      { label: "Performance", icon: "perf" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Subscription", icon: "card" },
      { label: "My Profile", icon: "user" },
      { label: "Settings", icon: "gear" },
    ],
  },
];

type Nav = { label: string; icon: IconName; badge?: string; badgeStyle?: string };
const navItem = (it: Nav) =>
  `<a href="#" class="nav-item" style="display:flex; align-items:center; gap:12px; height:38px; padding:0 12px; border-radius:9px; font-size:14px; font-weight:500; color:var(--text)">
    <span style="width:18px; height:18px; flex-shrink:0; color:var(--muted); display:flex">${S(it.icon)}</span>
    <span style="flex:1">${it.label}</span>
    ${it.badge ? `<span style="${it.badgeStyle}">${it.badge}</span>` : ""}
  </a>`;

const SIDEBAR = `<aside class="vd-sidebar vd-scroll" style="width:248px; flex-shrink:0; background:var(--surface); border-right:1px solid var(--border); height:calc(100vh - 70px); position:sticky; top:70px; overflow-y:auto; padding:18px 14px 24px">
  <a href="#" style="display:flex; align-items:center; gap:11px; height:44px; padding:0 14px; border-radius:10px; background:var(--brand-grad); color:#fff; font-size:14.5px; font-weight:700; box-shadow:var(--shadow-sm); margin-bottom:16px">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 22V12h6v10"/></svg>
    Seller Workspace
  </a>
  ${NAV_GROUPS.map(
    (g) =>
      `<div style="font-size:10.5px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--muted); padding:12px 12px 7px">${g.title}</div>${g.items
        .map(navItem)
        .join("")}`,
  ).join("")}
  <div style="margin-top:20px; padding:16px; border:1px solid var(--border); border-radius:12px; background:var(--surface-2)">
    <div style="font-size:13.5px; font-weight:700; color:var(--heading)">Need Help?</div>
    <div style="font-size:12px; color:var(--muted); margin:3px 0 12px">Contact support team</div>
    <a href="#" class="btn-help" style="display:flex; align-items:center; justify-content:center; gap:7px; height:38px; border-radius:8px; border:1px solid var(--border-strong); background:var(--surface); color:var(--brand-2); font-size:13px; font-weight:600">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
      Contact Support
    </a>
  </div>
</aside>`;

/* ============================ TOP BAR ============================ */
const TOPBAR = `<header style="height:70px; flex-shrink:0; background:var(--surface); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:16px; padding:0 30px; position:sticky; top:0; z-index:30">
  <div style="display:flex; align-items:center; gap:11px">
    <div style="width:40px; height:40px; border-radius:11px; background:#eaf1ff; display:flex; align-items:center; justify-content:center; color:var(--brand); font-family:var(--font-mono); font-weight:700; font-size:19px; flex-shrink:0">iV</div>
    <div style="line-height:1.15">
      <div style="font-weight:800; font-size:18px; color:var(--heading); letter-spacing:-.01em">iVendorz</div>
      <div style="font-size:10.5px; color:var(--muted); letter-spacing:.01em">Industrial B2B Marketplace</div>
    </div>
  </div>
  <div style="flex:1"></div>
  <a href="#" class="btn-out" style="display:inline-flex; align-items:center; gap:8px; height:40px; padding:0 16px; border-radius:8px; border:1px solid var(--border-strong); background:var(--surface); color:var(--heading); font-size:13.5px; font-weight:600">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
    Export
  </a>
  <a href="#" class="btn-grad" style="display:inline-flex; align-items:center; gap:8px; height:40px; padding:0 16px; border-radius:8px; background:var(--brand-grad); color:#fff; font-size:13.5px; font-weight:700; box-shadow:var(--shadow-sm)">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
    New Document
    <span style="margin-left:2px; display:flex">${CHEV_DOWN(2.4, 14)}</span>
  </a>
  <button class="icon-btn" style="position:relative; width:40px; height:40px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text); cursor:pointer; display:flex; align-items:center; justify-content:center">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
    <span style="position:absolute; top:-3px; right:-3px; min-width:17px; height:17px; padding:0 4px; border-radius:9px; background:#dc2626; color:#fff; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; border:2px solid var(--surface)">3</span>
  </button>
  <div style="display:flex; align-items:center; gap:9px; padding-left:14px; border-left:1px solid var(--border); cursor:pointer">
    <div style="width:38px; height:38px; border-radius:10px; background:var(--brand-grad); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0">ME</div>
    <div style="line-height:1.2">
      <div style="font-size:13.5px; font-weight:700; color:var(--heading)">Musa Engineering</div>
      <div style="font-size:11.5px; color:var(--muted)">Vendor</div>
    </div>
    <span style="display:flex">${CHEV_DOWN(2.2, 15)}</span>
  </div>
</header>`;

/* ============================ CARD SHELL ============================ */
const CARD =
  "background:var(--surface); border:1px solid var(--border); border-radius:14px; box-shadow:var(--shadow-sm)";
const cardHead = (title: string, right: string) =>
  `<div style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px 14px; border-bottom:1px solid var(--border)"><h3 style="font-size:16px; font-weight:800; color:var(--heading)">${title}</h3>${right}</div>`;
const viewLink = (t: string) => `<a href="#" style="font-size:13px; font-weight:600">${t}</a>`;
const cardFoot = (t: string) =>
  `<a href="#" style="display:flex; align-items:center; justify-content:center; gap:7px; height:48px; margin-top:auto; border-top:1px solid var(--border); font-size:13.5px; font-weight:700">${t}${ARROW_R}</a>`;

/* ============================ ROW 1 — GREETING + KPIs ============================ */
const KPIS: {
  label: string;
  value: string;
  icon: IconName;
  iw: string;
  delta: string;
  dc: string;
}[] = [
  {
    label: "Open RFQs",
    value: "18",
    icon: "file",
    iw: kiw("#eef3fd", "#2f5eb8"),
    delta: upDelta("+5 this week"),
    dc: "var(--green)",
  },
  {
    label: "Active Quotations",
    value: "12",
    icon: "quote",
    iw: kiw("#e7f6ec", "#16a34a"),
    delta: upDelta("+3 this week"),
    dc: "var(--green)",
  },
  {
    label: "New Purchase Orders",
    value: "5",
    icon: "po",
    iw: kiw("#fef3e2", "#d97706"),
    delta: upDelta("+2 this week"),
    dc: "var(--green)",
  },
  {
    label: "Bills Receivable",
    value: "৳4.2L",
    icon: "bill",
    iw: kiw("#f0edfd", "#7c3aed"),
    delta: upDelta("+12% this month"),
    dc: "var(--green)",
  },
  {
    label: "Follow-ups Due",
    value: "9",
    icon: "follow",
    iw: kiw("#fdecec", "#dc2626"),
    delta: "<span>3 overdue</span>",
    dc: "#dc2626",
  },
  {
    label: "Unread Messages",
    value: "6",
    icon: "msg",
    iw: kiw("#eef3fd", "#2f5eb8"),
    delta: upDelta("+4 new"),
    dc: "var(--green)",
  },
];

const GREETING = `<div>
  <h1 style="font-size:26px; font-weight:800; color:var(--heading); letter-spacing:-.01em">Good morning, Musa 👋</h1>
  <p style="font-size:14.5px; color:var(--muted); margin-top:5px">Manage your RFQs, quotations, documents and grow your business with iVendorz.</p>
</div>`;

const KPI_ROW = `<div class="vd-kpi" style="display:grid; grid-template-columns:repeat(6,1fr); gap:14px">${KPIS.map(
  (k) => `<div style="${CARD}; padding:16px 15px">
    <span style="${k.iw}">${S(k.icon)}</span>
    <div style="font-size:12.5px; font-weight:600; color:var(--heading); margin-top:12px; line-height:1.25">${k.label}</div>
    <div style="font-size:28px; font-weight:800; color:var(--heading); letter-spacing:-.02em; margin:6px 0 5px; line-height:1">${k.value}</div>
    <div style="font-size:11.5px; font-weight:600; display:flex; align-items:center; gap:4px; color:${k.dc}">${k.delta}</div>
  </div>`,
).join("")}</div>`;

/* ============================ ROW 2 — PIPELINE + PRIORITIES ============================ */
const PIPELINE = [
  {
    stage: "New RFQs",
    rfqs: "18",
    value: "৳24,00,000",
    conv: "100%",
    color: "#2f5eb8",
    barW: "100%",
  },
  { stage: "Quoted", rfqs: "11", value: "৳18,20,000", conv: "61%", color: "#3b82f6", barW: "61%" },
  {
    stage: "Negotiation",
    rfqs: "6",
    value: "৳9,00,000",
    conv: "33%",
    color: "#f5a623",
    barW: "33%",
  },
  { stage: "Won", rfqs: "4", value: "৳7,50,000", conv: "22%", color: "#16a34a", barW: "22%" },
  { stage: "Lost", rfqs: "2", value: "৳2,10,000", conv: "11%", color: "#dc2626", barW: "11%" },
];
const PIPE_COLS = "display:grid; grid-template-columns:1.6fr .8fr 1fr .8fr; gap:8px";
const PIPELINE_CARD = `<div style="${CARD}; display:flex; flex-direction:column">
  ${cardHead("Sales Pipeline", viewLink("View all"))}
  <div style="padding:6px 20px 4px">
    <div style="${PIPE_COLS}; padding:10px 0; font-size:11px; font-weight:700; letter-spacing:.03em; text-transform:uppercase; color:var(--muted); border-bottom:1px solid var(--border)">
      <span>Stage</span><span>RFQs</span><span>Pipeline Value</span><span style="text-align:right">Conversion</span>
    </div>
    ${PIPELINE.map(
      (
        r,
      ) => `<div style="${PIPE_COLS}; align-items:center; padding:13px 0; border-bottom:1px solid var(--border)">
      <div>
        <div style="display:flex; align-items:center; gap:8px; font-size:13.5px; font-weight:600; color:var(--heading)"><span style="width:8px; height:8px; border-radius:50%; background:${r.color}; flex-shrink:0"></span>${r.stage}</div>
        <div style="height:5px; border-radius:4px; background:var(--surface-2); margin-top:7px; overflow:hidden"><span style="display:block; height:100%; border-radius:4px; background:${r.color}; width:${r.barW}"></span></div>
      </div>
      <span style="font-size:13.5px; font-weight:600; color:var(--heading)">${r.rfqs}</span>
      <span style="font-size:13.5px; font-family:var(--font-mono); color:var(--text)">${r.value}</span>
      <span style="font-size:13.5px; font-weight:700; color:var(--heading); text-align:right">${r.conv}</span>
    </div>`,
    ).join("")}
  </div>
  ${cardFoot("View full pipeline")}
</div>`;

const PRIORITIES = [
  {
    title: "Reply to Orion Manufacturing",
    meta: "RFQ-2507-018 · Quotation requested",
    time: "10:30 AM",
    icon: "chat" as IconName,
    bg: "#eef3fd",
    fg: "#2f5eb8",
  },
  {
    title: "Confirm delivery for Apex Infra",
    meta: "PO-2507-045 · Delivery confirmation",
    time: "11:15 AM",
    icon: "truck" as IconName,
    bg: "#e7f6ec",
    fg: "#16a34a",
  },
  {
    title: "Upload revised quotation",
    meta: "RFQ-2507-012 · Price revision",
    time: "01:00 PM",
    icon: "file" as IconName,
    bg: "#fef3e2",
    fg: "#d97706",
  },
  {
    title: "Payment follow-up",
    meta: "INV-2506-089 · ৳1,12,300 outstanding",
    time: "03:30 PM",
    icon: "pay" as IconName,
    bg: "#fdecec",
    fg: "#dc2626",
  },
];
const PRIORITIES_CARD = `<div style="${CARD}; display:flex; flex-direction:column">
  ${cardHead("Today's Priorities", viewLink("View all"))}
  <div style="padding:6px 20px; flex:1">
    ${PRIORITIES.map(
      (
        p,
      ) => `<div style="display:flex; gap:12px; padding:14px 0; border-bottom:1px solid var(--border)">
      <span style="${roundIcon(34, p.bg, p.fg)}">${S(p.icon)}</span>
      <div style="flex:1; min-width:0">
        <div style="display:flex; justify-content:space-between; gap:10px"><span style="font-size:13.5px; font-weight:700; color:var(--heading)">${p.title}</span><span style="font-size:12px; color:var(--muted); white-space:nowrap; flex-shrink:0">${p.time}</span></div>
        <div style="font-size:12.5px; color:var(--muted); margin-top:3px">${p.meta}</div>
      </div>
    </div>`,
    ).join("")}
  </div>
  ${cardFoot("View full pipeline")}
</div>`;

/* ============================ ROW 3 — RFQ LEADS + INQUIRIES ============================ */
const RFQ_LEADS = [
  {
    title: "Stainless Steel Pipe Fittings, ASTM A182",
    meta: "Orion Manufacturing · 1,200 pcs",
    time: "10m ago",
    tag: "New",
    tagStyle: chip("#eef3fd", "#2f5eb8"),
    bg: "#eef3fd",
    fg: "#2f5eb8",
  },
  {
    title: "CNC Turned Brass Components",
    meta: "Delta Textiles PLC · 8,000 pcs",
    time: "1h ago",
    tag: "New",
    tagStyle: chip("#eef3fd", "#2f5eb8"),
    bg: "#eef3fd",
    fg: "#2f5eb8",
  },
  {
    title: "Structural Steel Beams, Fabricated",
    meta: "Summit Infrastructure · 85 MT",
    time: "3h ago",
    tag: "Quoted",
    tagStyle: chip("#e7f6ec", "#16a34a"),
    bg: "#e7f6ec",
    fg: "#16a34a",
  },
  {
    title: "Custom Sheet Metal Enclosures",
    meta: "Nabil Group · 450 pcs",
    time: "5h ago",
    tag: "Viewed",
    tagStyle: chip("var(--surface-2)", "var(--muted)"),
    bg: "#fdecec",
    fg: "#dc2626",
  },
];
const RFQ_LEADS_CARD = `<div style="${CARD}; display:flex; flex-direction:column">
  ${cardHead("Latest RFQ Leads", viewLink("View all"))}
  <div style="padding:2px 20px; flex:1">
    ${RFQ_LEADS.map(
      (
        r,
      ) => `<div style="display:flex; gap:12px; align-items:flex-start; padding:14px 0; border-bottom:1px solid var(--border)">
      <span style="${roundIcon(34, r.bg, r.fg)}">${S("box")}</span>
      <div style="flex:1; min-width:0">
        <div style="font-size:13.5px; font-weight:700; color:var(--heading)">${r.title}</div>
        <div style="font-size:12.5px; color:var(--muted); margin-top:2px">${r.meta}</div>
      </div>
      <div style="text-align:right; flex-shrink:0"><div style="font-size:11.5px; color:var(--muted)">${r.time}</div><span style="${r.tagStyle}">${r.tag}</span></div>
    </div>`,
    ).join("")}
  </div>
  ${cardFoot("View all RFQ leads")}
</div>`;

const INQUIRIES = [
  {
    initials: "OM",
    name: "Orion Manufacturing",
    meta: "Viewed your product catalog",
    time: "2m ago",
    tag: "Unread",
    tagStyle: chip("#eef3fd", "#2f5eb8"),
    avBg: "#eef3fd",
    avFg: "#2f5eb8",
  },
  {
    initials: "SI",
    name: "Summit Infrastructure",
    meta: "Requested tech-spec sheet",
    time: "15m ago",
    tag: "Unread",
    tagStyle: chip("#eef3fd", "#2f5eb8"),
    avBg: "#fef3e2",
    avFg: "#d97706",
  },
  {
    initials: "DT",
    name: "Delta Textiles PLC",
    meta: "Need quotation for piping works",
    time: "1h ago",
    tag: "Replied",
    tagStyle: chip("#e7f6ec", "#16a34a"),
    avBg: "#f0edfd",
    avFg: "#7c3aed",
  },
  {
    initials: "NG",
    name: "Nabil Group",
    meta: "Interested in your services",
    time: "2h ago",
    tag: "Replied",
    tagStyle: chip("#e7f6ec", "#16a34a"),
    avBg: "#e7f6ec",
    avFg: "#16a34a",
  },
];
const INQUIRIES_CARD = `<div style="${CARD}; display:flex; flex-direction:column">
  ${cardHead("Buyer Inquiries", viewLink("View inbox"))}
  <div style="padding:2px 20px; flex:1">
    ${INQUIRIES.map(
      (
        q,
      ) => `<div style="display:flex; gap:12px; align-items:center; padding:14px 0; border-bottom:1px solid var(--border)">
      <span style="width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:12.5px; font-weight:700; background:${q.avBg}; color:${q.avFg}">${q.initials}</span>
      <div style="flex:1; min-width:0"><div style="font-size:13.5px; font-weight:700; color:var(--heading)">${q.name}</div><div style="font-size:12.5px; color:var(--muted); margin-top:2px">${q.meta}</div></div>
      <div style="text-align:right; flex-shrink:0"><div style="font-size:11.5px; color:var(--muted)">${q.time}</div><span style="${q.tagStyle}">${q.tag}</span></div>
    </div>`,
    ).join("")}
  </div>
  ${cardFoot("Open all messages")}
</div>`;

/* ============================ ROW 4 — DOCUMENTS + ENGAGEMENT ============================ */
const DOCUMENTS = [
  {
    type: "Quotation",
    number: "QT-2507-120",
    buyer: "Meher Steel",
    amount: "৳2,40,000",
    status: "Sent",
    statusStyle: stat("#eef3fd", "#2f5eb8"),
    date: "Today",
  },
  {
    type: "PO",
    number: "PO-2507-045",
    buyer: "Apex Infra",
    amount: "৳8,65,000",
    status: "Confirmed",
    statusStyle: stat("#e7f6ec", "#16a34a"),
    date: "Today",
  },
  {
    type: "Challan",
    number: "CHL-2507-032",
    buyer: "Sunrise Fab.",
    amount: "৳1,12,300",
    status: "In Transit",
    statusStyle: stat("#fef3e2", "#d97706"),
    date: "Jul 12",
  },
  {
    type: "Invoice",
    number: "INV-2507-089",
    buyer: "Sunrise Fab.",
    amount: "৳1,12,300",
    status: "Overdue",
    statusStyle: stat("#fdecec", "#dc2626"),
    date: "Jul 10",
  },
  {
    type: "Invoice",
    number: "INV-2507-088",
    buyer: "Trident Eng.",
    amount: "৳3,08,000",
    status: "Paid",
    statusStyle: stat("#e7f6ec", "#16a34a"),
    date: "Jul 09",
  },
];
const DOC_COLS = "display:grid; grid-template-columns:.85fr 1.1fr 1fr 1fr .85fr .7fr; gap:8px";
const DOCUMENTS_CARD = `<div style="${CARD}; display:flex; flex-direction:column">
  ${cardHead("Recent Business Documents", viewLink("View all"))}
  <div style="padding:2px 20px">
    <div style="${DOC_COLS}; padding:11px 0; font-size:11px; font-weight:700; letter-spacing:.03em; text-transform:uppercase; color:var(--muted); border-bottom:1px solid var(--border)">
      <span>Type</span><span>Number</span><span>Buyer</span><span>Amount</span><span>Status</span><span>Date</span>
    </div>
    ${DOCUMENTS.map(
      (
        d,
      ) => `<div style="${DOC_COLS}; align-items:center; padding:13px 0; border-bottom:1px solid var(--border); font-size:13px">
      <span style="color:var(--heading); font-weight:600">${d.type}</span>
      <a href="#" style="font-family:var(--font-mono); font-size:12px; font-weight:600">${d.number}</a>
      <span style="color:var(--text)">${d.buyer}</span>
      <span style="font-family:var(--font-mono); font-size:12px; color:var(--heading); font-weight:600">${d.amount}</span>
      <span><span style="${d.statusStyle}">${d.status}</span></span>
      <span style="color:var(--muted); font-size:12px">${d.date}</span>
    </div>`,
    ).join("")}
  </div>
  ${cardFoot("View all documents")}
</div>`;

const ENGAGEMENT: { label: string; count: string; icon: IconName; bg: string; fg: string }[] = [
  { label: "Viewed Company Profile", count: "12", icon: "user", bg: "#eef3fd", fg: "#2f5eb8" },
  { label: "Viewed Product", count: "18", icon: "eye", bg: "#fef3e2", fg: "#d97706" },
  { label: "Downloaded Catalog", count: "6", icon: "down", bg: "#e7f6ec", fg: "#16a34a" },
  { label: "Downloaded ISO Certificate", count: "4", icon: "cert", bg: "#f0edfd", fg: "#7c3aed" },
  { label: "Saved to Buyer CRM", count: "3", icon: "save", bg: "#eef3fd", fg: "#2f5eb8" },
  { label: "Requested RFQ", count: "2", icon: "bolt", bg: "#fdecec", fg: "#dc2626" },
  { label: "Visited Microsite", count: "35", icon: "globe", bg: "#e7f6ec", fg: "#16a34a" },
];
const ENGAGEMENT_CARD = `<div style="${CARD}; display:flex; flex-direction:column">
  <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px 14px; border-bottom:1px solid var(--border)">
    <h3 style="font-size:16px; font-weight:800; color:var(--heading)">Buyer Engagement</h3>
    <span style="display:inline-flex; align-items:center; gap:5px; font-size:12.5px; color:var(--muted)">This week ${CHEV_DOWN(2.4, 13)}</span>
  </div>
  <div style="padding:6px 20px; flex:1">
    ${ENGAGEMENT.map(
      (
        e,
      ) => `<div style="display:flex; align-items:center; gap:11px; padding:11px 0; border-bottom:1px solid var(--border)">
      <span style="width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:${e.bg}; color:${e.fg}">${S(e.icon)}</span>
      <span style="flex:1; font-size:13px; color:var(--text)">${e.label}</span>
      <span style="font-family:var(--font-mono); font-size:14px; font-weight:700; color:var(--heading)">${e.count}</span>
    </div>`,
    ).join("")}
  </div>
  ${cardFoot("View full engagement")}
</div>`;

/* ============================ ROW 5 — FINANCE + CHART ============================ */
const FINANCE = [
  {
    label: "Outstanding",
    value: "৳4.20L",
    sub: "9 invoices",
    bg: "#fdecec",
    border: "#f8d7d7",
    fg: "#dc2626",
  },
  {
    label: "Paid This Month",
    value: "৳2.85L",
    sub: "6 invoices",
    bg: "#e7f6ec",
    border: "#c8ebd4",
    fg: "#16a34a",
  },
  {
    label: "Pending Bills",
    value: "৳1.35L",
    sub: "3 Invoices",
    bg: "#fef6e8",
    border: "#f7e4bf",
    fg: "#d97706",
  },
  {
    label: "Overdue",
    value: "৳0.65L",
    sub: "2 invoices",
    bg: "#fdf0ef",
    border: "#f8d9d5",
    fg: "#e05a3d",
  },
];
const FINANCE_CARD = `<div style="${CARD}; padding:18px 20px 20px">
  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px">
    <h3 style="font-size:16px; font-weight:800; color:var(--heading)">Financial Snapshot</h3>
    <span style="display:inline-flex; align-items:center; gap:5px; font-size:12.5px; color:var(--muted)">This month ${CHEV_DOWN(2.4, 13)}</span>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px">
    ${FINANCE.map(
      (
        f,
      ) => `<div style="border:1px solid ${f.border}; background:${f.bg}; border-radius:12px; padding:15px">
      <div style="font-size:12.5px; font-weight:600; color:${f.fg}">${f.label}</div>
      <div style="font-size:23px; font-weight:800; color:${f.fg}; letter-spacing:-.01em; margin:6px 0 4px; line-height:1">${f.value}</div>
      <div style="font-size:11.5px; color:var(--muted)">${f.sub}</div>
    </div>`,
    ).join("")}
  </div>
</div>`;

const CHART_SERIES = [
  { label: "RFQs Received", color: "#2f5eb8" },
  { label: "Quotes Sent", color: "#16a34a" },
  { label: "PO Received", color: "#f5a623" },
  { label: "Bills Generated", color: "#7c3aed" },
];
const CHART_RAW: Record<string, number[]> = {
  Jan: [55, 40, 20, 12],
  Feb: [78, 32, 24, 16],
  Mar: [60, 46, 30, 26],
  Apr: [72, 54, 22, 18],
  May: [46, 66, 34, 22],
  Jun: [84, 40, 28, 20],
  Jul: [92, 58, 44, 30],
};
const CHART_CARD = `<div style="${CARD}; padding:18px 22px 20px">
  <h3 style="font-size:16px; font-weight:800; color:var(--heading); margin-bottom:14px">Monthly Activity Overview</h3>
  <div style="display:flex; flex-wrap:wrap; gap:16px; margin-bottom:18px">
    ${CHART_SERIES.map(
      (s) =>
        `<span style="display:inline-flex; align-items:center; gap:7px; font-size:12px; color:var(--text)"><span style="width:10px; height:10px; border-radius:3px; background:${s.color}"></span>${s.label}</span>`,
    ).join("")}
  </div>
  <div style="display:flex; gap:14px">
    <div style="display:flex; flex-direction:column; justify-content:space-between; height:200px; padding-bottom:22px; font-size:10.5px; color:var(--muted); font-family:var(--font-mono); text-align:right">
      <span>100</span><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
    </div>
    <div style="flex:1; display:flex; align-items:flex-end; justify-content:space-between; height:200px; border-left:1px solid var(--border); border-bottom:1px solid var(--border); padding:0 4px 0 10px">
      ${Object.entries(CHART_RAW)
        .map(
          ([
            name,
            vals,
          ]) => `<div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex:1">
        <div style="display:flex; align-items:flex-end; gap:2.5px; height:178px">${vals
          .map(
            (v, i) =>
              `<span style="width:6px; border-radius:2px 2px 0 0; background:${CHART_SERIES[i].color}; height:${v * 1.7}px"></span>`,
          )
          .join("")}</div>
        <span style="font-size:11px; color:var(--muted)">${name}</span>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</div>`;

/* ============================ ROW 6 — TRUST + SUBSCRIPTION + QUICK ACTIONS ============================ */
const TRUST_CARD = `<div style="${CARD}; display:flex; flex-direction:column">
  <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px 4px">
    <h3 style="font-size:16px; font-weight:800; color:var(--heading)">Trust Score</h3>
    <span style="font-size:11.5px; font-weight:700; color:var(--green); background:#e7f6ec; border-radius:7px; padding:3px 9px">Good</span>
  </div>
  <div style="flex:1; display:flex; flex-direction:column; align-items:center; padding:14px 20px 18px">
    <div style="position:relative; width:130px; height:130px">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r="56" fill="none" stroke="var(--surface-2)" stroke-width="12"></circle>
        <circle cx="65" cy="65" r="56" fill="none" stroke="var(--brand-2)" stroke-width="12" stroke-linecap="round" stroke-dasharray="352" stroke-dashoffset="77" transform="rotate(-90 65 65)"></circle>
      </svg>
      <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center">
        <span style="font-size:34px; font-weight:800; color:var(--heading); line-height:1">78</span>
        <span style="font-size:12px; color:var(--muted)">/100</span>
      </div>
    </div>
    <div style="display:flex; align-items:center; gap:6px; margin-top:14px; font-size:12.5px; font-weight:600; color:var(--green)">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
      Profile Verified
    </div>
  </div>
  ${cardFoot("Improve Score")}
</div>`;

const SUB_ROWS = [
  { k: "RFQs Remaining", v: "18 / 30", last: false },
  { k: "Lead Balance", v: "12", last: false },
  { k: "Renewal Date", v: "Aug 15, 2025", last: true },
];
const SUBSCRIPTION_CARD = `<div style="${CARD}; display:flex; flex-direction:column">
  <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px 4px">
    <h3 style="font-size:16px; font-weight:800; color:var(--heading)">Subscription</h3>
    <span style="font-size:11.5px; font-weight:700; color:var(--brand-2); background:var(--chip-bg); border-radius:7px; padding:3px 9px">Growth Plan</span>
  </div>
  <div style="flex:1; padding:14px 20px 8px">
    ${SUB_ROWS.map(
      (r) =>
        `<div style="display:flex; justify-content:space-between; align-items:center; padding:11px 0; ${r.last ? "" : "border-bottom:1px solid var(--border); "}font-size:13px"><span style="color:var(--muted)">${r.k}</span><span style="font-family:var(--font-mono); font-weight:700; color:var(--heading)">${r.v}</span></div>`,
    ).join("")}
  </div>
  ${cardFoot("Manage Subscription")}
</div>`;

const QUICK_ACTIONS: { label: string; icon: IconName }[] = [
  { label: "Submit New Quote", icon: "plus" },
  { label: "Upload Product", icon: "up" },
  { label: "Create Challan", icon: "note" },
  { label: "Create Invoice", icon: "bill" },
  { label: "Add New Buyer", icon: "users" },
  { label: "Update Showcase", icon: "refresh" },
];
const QUICK_ACTIONS_CARD = `<div style="${CARD}; padding:18px 20px 20px">
  <h3 style="font-size:16px; font-weight:800; color:var(--heading); margin-bottom:14px">Quick Actions</h3>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
    ${QUICK_ACTIONS.map(
      (a) =>
        `<a href="#" class="qa-item" style="display:flex; align-items:center; gap:11px; padding:13px 14px; border:1px solid var(--border); border-radius:10px; background:var(--surface); font-size:13px; font-weight:600; color:var(--heading)"><span style="width:20px; height:20px; flex-shrink:0; color:var(--brand-2); display:flex">${S(a.icon)}</span>${a.label}</a>`,
    ).join("")}
  </div>
</div>`;

/* ============================ COMPOSE ============================ */
const MAIN = `<div style="flex:1; min-width:0; display:flex; flex-direction:column">
  <div style="padding:28px 30px 40px; display:flex; flex-direction:column; gap:20px; max-width:1180px; width:100%">
    ${GREETING}
    ${KPI_ROW}
    <div class="vd-two" style="display:grid; grid-template-columns:1fr 1fr; gap:20px">${PIPELINE_CARD}${PRIORITIES_CARD}</div>
    <div class="vd-two" style="display:grid; grid-template-columns:1fr 1fr; gap:20px">${RFQ_LEADS_CARD}${INQUIRIES_CARD}</div>
    <div class="vd-two" style="display:grid; grid-template-columns:1.25fr .75fr; gap:20px">${DOCUMENTS_CARD}${ENGAGEMENT_CARD}</div>
    <div class="vd-fin" style="display:grid; grid-template-columns:.82fr 1.18fr; gap:20px">${FINANCE_CARD}${CHART_CARD}</div>
    <div class="vd-three" style="display:grid; grid-template-columns:1fr 1fr 1.35fr; gap:20px">${TRUST_CARD}${SUBSCRIPTION_CARD}${QUICK_ACTIONS_CARD}</div>
  </div>
</div>`;

const MARKUP = `<div style="display:flex; flex-direction:column; min-height:100vh; background:var(--bg); font-family:var(--font-sans); color:var(--text)">
  ${TOPBAR}
  <div style="display:flex; flex:1; min-height:0">${SIDEBAR}${MAIN}</div>
</div>`;

const CSS = `
#vdp{
  --font-sans: var(--iv-font-sans), Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: var(--iv-font-mono), "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --brand:#23438f; --brand-2:#2f5eb8; --brand-grad:linear-gradient(135deg,#23438f,#2f5eb8);
  --amber:#f5a623; --green:#16a34a;
  --bg:#f6f8fa; --bg-alt:#ffffff; --surface:#ffffff; --surface-2:#f8fafc;
  --border:#e6e9ee; --border-strong:#d4d9e0;
  --ink:#14213d; --heading:#1a2b52; --text:#4a5568; --muted:#7a8699;
  --chip-bg:#eef3fd; --chip-fg:#2f5eb8;
  --shadow-sm:0 1px 2px rgba(16,24,40,.05),0 1px 3px rgba(16,24,40,.07);
  --shadow-md:0 10px 26px rgba(16,24,40,.10),0 2px 8px rgba(16,24,40,.05);
  --shadow-lg:0 24px 60px rgba(16,24,40,.16),0 4px 12px rgba(16,24,40,.06);
  font-family:var(--font-sans); color:var(--text); background:var(--bg);
}
#vdp *{box-sizing:border-box}
#vdp h1,#vdp h2,#vdp h3,#vdp h4{margin:0}
#vdp a{color:var(--brand-2);text-decoration:none}
#vdp a:hover{color:var(--brand)}
#vdp .vd-scroll::-webkit-scrollbar{width:8px}
#vdp .vd-scroll::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:8px}
#vdp .nav-item:hover{background:var(--surface-2);color:var(--heading)}
#vdp .qa-item:hover{background:var(--surface-2);border-color:var(--border-strong)}
#vdp .btn-out:hover{background:var(--surface-2)}
#vdp .btn-grad:hover{filter:brightness(1.06)}
#vdp .icon-btn:hover{background:var(--surface-2)}
#vdp .btn-help:hover{background:#eef3fd}
@media(max-width:1180px){
  #vdp .vd-two{grid-template-columns:1fr !important}
  #vdp .vd-three{grid-template-columns:1fr !important}
  #vdp .vd-fin{grid-template-columns:1fr !important}
  #vdp .vd-kpi{grid-template-columns:repeat(3,1fr) !important}
}
@media(max-width:920px){
  #vdp .vd-kpi{grid-template-columns:repeat(2,1fr) !important}
  #vdp .vd-sidebar{display:none !important}
}
`;

export default function VendorDashboardPreviewPage() {
  return (
    <div id="vdp">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: MARKUP }} />
    </div>
  );
}
