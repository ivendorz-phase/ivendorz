/* ============================================================================
   iVendorz Admin Console — Stage-3 Hi-Fi Prototype (config-driven)
   Follows Planning v0.3 + Brief v0.2. Coins nothing: every contract/state/slug
   is bound by pointer to the frozen corpus. Seed data is illustrative only;
   the FIELDS shown are the frozen ones. Prototype only — no backend.

   Board rulings encoded:
   - E5: P-ADM-07 = Vendor MODERATION (suspend/reactivate), not approval.
   - E8: no review-moderation pages; no admin-ratings surface; no new nav/IDs.
   ============================================================================ */

/* ---------- Lucide-style inline icons (production uses the Doc-7B Lucide kit) ---------- */
const ICONS = {
  dashboard: 'M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z',
  gavel: 'M14 13l-7 7-3-3 7-7M14 13l3 3M9.5 8.5l6 6M13 4l7 7M3 21h9',
  filesearch: 'M4 4h9l5 5v3M9.5 16.5a3 3 0 100-6 3 3 0 000 6zM14 19l-2.5-2.5',
  verify: 'M9 12l2 2 4-4M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7z',
  upload: 'M12 15V3M8 7l4-4 4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2',
  ban: 'M12 3a9 9 0 100 18 9 9 0 000-18zM5.6 5.6l12.8 12.8',
  store: 'M4 9l1-5h14l1 5M4 9h16v11H4zM4 9a2.5 2.5 0 005 0 2.5 2.5 0 005 0 2.5 2.5 0 005 0M9 20v-6h6v6',
  folder: 'M3 8V6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  ad: 'M3 11l16-7v16L3 13zM3 11v2M8 20l-1-6',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10c1 1 1.5 2 1.5 3h5c0-1 .5-2 1.5-3a6 6 0 00-4-10z',
  link: 'M9 15l6-6M10.5 6.5l1.5-1.5a4 4 0 016 6l-1.5 1.5M13.5 17.5l-1.5 1.5a4 4 0 01-6-6l1.5-1.5',
  route: 'M7 5a2 2 0 100 4 2 2 0 000-4zM17 15a2 2 0 100 4 2 2 0 000-4zM9 7h6a3 3 0 013 3v0M7 9v5a3 3 0 003 3h5',
  branch: 'M6 3v12M6 21a2 2 0 100-4 2 2 0 000 4zM6 7a2 2 0 100-4 2 2 0 000 4zM18 9a2 2 0 100-4 2 2 0 000 4zM18 7c0 4-6 4-6 8',
  card: 'M3 6h18v12H3zM3 10h18',
  building: 'M4 21V5a1 1 0 011-1h9a1 1 0 011 1v16M15 21V9h4a1 1 0 011 1v11M8 7h2M8 11h2M8 15h2',
  users: 'M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM21 20v-1a4 4 0 00-3-3.8M16 4.2a3.5 3.5 0 010 6.6',
  support: 'M12 3a9 9 0 100 18 9 9 0 000-18zM8.5 8.5l-2-2M15.5 8.5l2-2M8.5 15.5l-2 2M15.5 15.5l2 2M12 8a4 4 0 100 8 4 4 0 000-8z',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4',
  bell: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
  sun: 'M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  menu: 'M3 6h18M3 12h18M3 18h18',
  chevron: 'M9 6l6 6-6 6',
};
function icon(name, size = 18) {
  const d = ICONS[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d.split('M').filter(Boolean).map(p => `<path d="M${p}"/>`).join('')}</svg>`;
}

/* ---------- Frozen Information Architecture (Planning §3 — frozen nodes only) ---------- */
const NAV = [
  { group: 'Overview', items: [{ id: 'P-ADM-01', label: 'Dashboard', icon: 'dashboard' }] },
  { group: 'Operations', items: [
    { id: 'P-ADM-02', label: 'Moderation', icon: 'gavel', count: 7 },
    { id: 'P-ADM-04', label: 'RFQ moderation', icon: 'filesearch', count: 3 },
    { id: 'P-ADM-12', label: 'Verification', icon: 'verify', count: 5 },
    { id: 'P-ADM-14', label: 'Import', icon: 'upload' },
  ]},
  { group: 'Enforcement', items: [{ id: 'P-ADM-05', label: 'Bans', icon: 'ban', count: 2 }] },
  { group: 'Marketplace', items: [
    { id: 'P-ADM-07', label: 'Vendor moderation', icon: 'store' },
    { id: 'P-ADM-08', label: 'Categories', icon: 'folder' },
    { id: 'P-ADM-10', label: 'Ads', icon: 'ad', count: 4 },
    { id: 'P-ADM-27', label: 'Suggestions', icon: 'bulb' },
    { id: 'P-ADM-28', label: 'Link triage', icon: 'link' },
  ]},
  { group: 'RFQ Operations', items: [
    { id: 'P-ADM-19', label: 'Routing rules', icon: 'route' },
    { id: 'P-ADM-21', label: 'Matching results', icon: 'branch' },
  ]},
  { group: 'Outreach', items: [
    { id: 'P-ADM-16', label: 'Campaigns', icon: 'ad' },
    { id: 'P-ADM-18', label: 'Contacts', icon: 'users' },
  ]},
  { group: 'Billing', items: [
    { id: 'P-ADM-22', label: 'Plans', icon: 'card' },
    { id: 'P-ADM-24', label: 'Entitlements', icon: 'card' },
  ]},
  { group: 'Identity', items: [
    { id: 'P-ADM-25', label: 'Organizations', icon: 'building' },
    { id: 'P-ADM-26', label: 'Users', icon: 'users' },
  ]},
  { group: 'Support', items: [{ id: 'P-ADM-29', label: 'Support', icon: 'support' }] },
];
// Detail/editor surfaces reachable from queues (frozen, but not top-level nav):
// P-ADM-03 (case detail) · 06 (ban detail) · 09 (category editor) · 11 (ad detail)
// · 13 (verification task) · 15 (import job) · 17 (campaign detail) · 20 (rule editor) · 23 (plan editor)

const STATUS = {
  open:'info', approved:'success', rejected:'critical', escalated:'warning',
  active:'critical', lifted:'neutral', expired:'neutral',
  submitted:'info', triaged:'warning', closed:'neutral',
  suggested:'info', confirmed:'success', dismissed:'neutral',
  queued:'neutral', processing:'warning', completed:'success', failed:'critical',
  in_review:'warning', decided:'success',
  draft:'neutral', running:'warning',
  suspended:'critical', reactivated:'success',
  retired:'neutral',
  in_progress:'warning', resolved:'success',
};
const chip = (s) => `<span class="chip chip--${STATUS[s]||'neutral'}">${s.replace(/_/g,' ')}</span>`;

/* ============================================================================
   SURFACE DEFINITIONS — all 29 P-ADM surfaces (governance from Planning §6)
   ============================================================================ */
const S = {};

/* ---- G1 Overview ---- */
S['P-ADM-01'] = { group:'Overview', title:'Admin dashboard', type:'dashboard',
  owner:'M8 + owning-module reads', desc:'Fast-scan staff overview. Deep-links only — decides nothing, mutates nothing.' };

/* ---- G2 Moderation (BC-ADM-1) ---- */
S['P-ADM-02'] = { group:'Operations', title:'Moderation queue', type:'queue', owner:'M8 · BC-ADM-1',
  desc:'Staff moderation of flagged content. Approve / reject / escalate the case — never a procurement outcome.',
  contracts:['admin.list_moderation_cases.v1','admin.decide_moderation_case.v1'], permission:'staff_can_moderate_rfq',
  state:'moderation_cases: open → approved / rejected / escalated', detailId:'P-ADM-03',
  columns:['Case','Subject','State','Assignee','Opened'],
  rows:[
    ['MOD-2026-000148','Product listing — “bulk cable lot”','open','—','2h ago'],
    ['MOD-2026-000147','Vendor profile description','open','A. Rahman','5h ago'],
    ['MOD-2026-000145','Product listing — pricing text','escalated','S. Chowdhury','1d ago'],
    ['MOD-2026-000142','RFQ attachment flagged','approved','A. Rahman','2d ago'],
    ['MOD-2026-000139','Microsite banner copy','rejected','—','3d ago'],
  ], stateCol:2 };

S['P-ADM-03'] = { group:'Operations', title:'Moderation case detail', type:'detail', owner:'M8 · BC-ADM-1',
  desc:'Case MOD-2026-000148 — assign and decide.', parentId:'P-ADM-02',
  contracts:['admin.get_moderation_case.v1','admin.assign_moderation_case.v1','admin.decide_moderation_case.v1'],
  permission:'staff_can_moderate_rfq', state:'moderation_cases: open → approved / rejected / escalated',
  fields:[['Case ref','MOD-2026-000148'],['Subject','Product listing — “bulk cable lot”'],['Subject ID','prod_01HZ… (Marketplace)'],['State','open'],['Assignee','—'],['Opened','2026-07-08 09:14']],
  actions:[
    {label:'Assign to me', note:'👆 click → admin.assign_moderation_case.v1'},
    {label:'Approve', kind:'success', note:'👆 decision=approved'},
    {label:'Reject', kind:'danger', note:'👆 decision=rejected'},
    {label:'Escalate', kind:'', note:'👆 decision=escalated'},
  ],
  concurrency:true, decideNote:'Decide from <code class="inline">open</code> only. Carries <code class="inline">expected_state</code> → CONFLICT vs STATE.',
  moat:'Moderation approves/rejects/escalates the <b>case</b> — never a procurement outcome (moat).',
  timeline:[['Case opened (System auto-queue)','2026-07-08 09:14'],['Awaiting staff decision','—']] };

S['P-ADM-04'] = { group:'Operations', title:'RFQ moderation', type:'queue', owner:'M8 · BC-ADM-1 (RFQ subject, DR-ADM-RFQ)',
  desc:'BC-ADM-1 scoped to RFQ-content subjects. Same lifecycle; case ≠ award (moat).',
  contracts:['admin.list_moderation_cases.v1','admin.decide_moderation_case.v1'], permission:'staff_can_moderate_rfq',
  state:'moderation_cases: open → approved / rejected / escalated', detailId:'P-ADM-03',
  columns:['Case','RFQ ref','State','Assignee','Opened'],
  rows:[
    ['MOD-2026-000151','RFQ-2026-000212','open','—','40m ago'],
    ['MOD-2026-000150','RFQ-2026-000208','open','A. Rahman','3h ago'],
    ['MOD-2026-000149','RFQ-2026-000201','escalated','—','1d ago'],
  ], stateCol:2 };

/* ---- G3 Enforcement (BC-ADM-2) ---- */
S['P-ADM-05'] = { group:'Enforcement', title:'Bans', type:'queue', owner:'M8 · BC-ADM-2 (emits VendorBanned)',
  desc:'Platform-wide vendor bans. A ban is vendor-visible enforcement — distinct from a buyer-private blacklist.',
  contracts:['admin.list_ban_actions.v1'], permission:'staff_can_ban',
  state:'ban_actions: active → lifted → expired', detailId:'P-ADM-06',
  columns:['Ban ref','Vendor','State','Issued by','Issued'],
  rows:[
    ['BAN-2026-000031','Meghna Traders (ven_01J…)','active','S. Chowdhury','2026-07-01'],
    ['BAN-2026-000029','Delta Steel Co (ven_01H…)','active','A. Rahman','2026-06-22'],
    ['BAN-2026-000024','Unitech Supply (ven_01G…)','lifted','S. Chowdhury','2026-05-30'],
    ['BAN-2026-000018','Prime Cables (ven_01F…)','expired','System','2026-04-11'],
  ], stateCol:2 };

S['P-ADM-06'] = { group:'Enforcement', title:'Ban detail / issue', type:'detail', owner:'M8 · BC-ADM-2', parentId:'P-ADM-05',
  desc:'Issue / lift / view a ban on a vendor target by ID (never AS an org).',
  contracts:['admin.issue_ban.v1','admin.lift_ban.v1','admin.expire_ban.v1'], permission:'staff_can_ban',
  state:'ban_actions: active → lifted → expired (expiry only from lifted, System)',
  fields:[['Ban ref','BAN-2026-000031'],['Vendor target','Meghna Traders'],['Vendor ID','ven_01J8… (by ID)'],['State','active'],['Reason','Repeated listing violations'],['Issued by','S. Chowdhury'],['Issued','2026-07-01 11:20']],
  actions:[
    {label:'Issue ban', kind:'danger', note:'👆 admin.issue_ban.v1 → emits VendorBanned'},
    {label:'Lift ban', note:'👆 admin.lift_ban.v1'},
    {label:'Expire ban', disabled:true, note:'🚫 System-only (admin.expire_ban.v1)'},
  ],
  event:'<code class="inline">admin.issue_ban.v1</code> emits <b>VendorBanned</b> — the only Doc-2 §8 event M8 produces. Marketplace reflects <code class="inline">active→banned</code> (DD-3); Admin never writes vendor-profile status directly.',
  banBlacklist:true,
  timeline:[['Ban issued','2026-07-01 11:20'],['VendorBanned emitted → Marketplace/Trust/Comms consumers','2026-07-01 11:20']] };

/* ---- G4 Approvals & Suggestions ---- */
S['P-ADM-07'] = { group:'Marketplace', title:'Vendor moderation', titleAlt:'(registered: “Vendor approval”)', type:'queue',
  owner:'M2 · Doc-5D (vendor-profile moderation)',
  desc:'Board ruling E5 — this surface is vendor MODERATION (suspend / reactivate a vendor profile), NOT approval.',
  contracts:['marketplace.set_vendor_profile_status.v1'], permission:'per Doc-5D staff gating',
  state:'vendor_profile: active ⇄ suspended (moderation edges only)',
  rulingE5:true,
  columns:['Vendor','Vendor ID','State','Category','Updated'],
  rows:[
    ['Bengal Fabrication Ltd','ven_01K2…','active','Fabrication','1d ago'],
    ['Chittagong Valves','ven_01K1…','active','Valves & Fittings','4d ago'],
    ['Southern Motors','ven_01J9…','suspended','Motors & Drives','1w ago'],
  ], stateCol:2,
  rowActions:[{label:'Suspend', note:'👆 set_vendor_profile_status → suspended'},{label:'Reactivate', note:'👆 → active'}] };

S['P-ADM-08'] = { group:'Marketplace', title:'Category management', type:'queue', owner:'M2 · Doc-5D + M8 · BC-ADM-3',
  desc:'Category governance + category-suggestion decisions.',
  contracts:['marketplace.create_category.v1','marketplace.set_category_status.v1','admin.decide_category_suggestion.v1'],
  permission:'staff_can_manage_categories', state:'category_suggestions: submitted → approved / rejected',
  detailId:'P-ADM-09',
  columns:['Category / suggestion','Type','State','Submitted by','When'],
  rows:[
    ['“Hydraulic Seals” (suggestion)','suggestion','submitted','Bengal Fabrication','6h ago'],
    ['“Industrial Adhesives” (suggestion)','suggestion','submitted','—','1d ago'],
    ['Pumps & Compressors','category','approved','Staff','—'],
    ['“Generic Spares” (suggestion)','suggestion','rejected','Delta Steel','3d ago'],
  ], stateCol:2, headRight:'<button class="btn btn--primary btn--sm" data-note="👆 → category editor (P-ADM-09)" onclick="go(\'P-ADM-09\')">New category</button>' };

S['P-ADM-09'] = { group:'Marketplace', title:'Category editor', type:'editor', owner:'M2 · Doc-5D', parentId:'P-ADM-08',
  desc:'Create / update a marketplace category (Admin governance).',
  contracts:['marketplace.create_category.v1','marketplace.update_category.v1','marketplace.set_category_status.v1'],
  permission:'staff_can_manage_categories',
  form:[['Category name','text','Hydraulic Seals'],['Parent category','select','Seals & Gaskets'],['Slug','text','hydraulic-seals'],['Status','select','active']],
  actions:[{label:'Save category', kind:'primary', note:'👆 marketplace.create_category.v1'},{label:'Cancel', kind:'ghost'}] };

S['P-ADM-27'] = { group:'Marketplace', title:'Suggestion triage', type:'queue', owner:'M8 · BC-ADM-3 (missing-vendor)',
  desc:'Missing-vendor suggestion triage.',
  contracts:['admin.triage_missing_vendor_suggestion.v1','admin.close_missing_vendor_suggestion.v1','admin.list_suggestions.v1'],
  permission:'[ESC-ADM-SLUG]', state:'missing_vendor_suggestions: submitted → triaged → closed (no submitted→closed shortcut)',
  columns:['Suggested vendor','Suggested by','State','Region','When'],
  rows:[
    ['“Rangpur Bearings”','Buyer org (RFQ ctx)','submitted','Rangpur','2h ago'],
    ['“Khulna Hydraulics”','Buyer org','triaged','Khulna','1d ago'],
    ['“Sylhet Toolworks”','Staff','closed','Sylhet','4d ago'],
  ], stateCol:2,
  rowActions:[{label:'Triage', note:'👆 triage_missing_vendor_suggestion'},{label:'Close', note:'👆 close_missing_vendor_suggestion'}] };

S['P-ADM-28'] = { group:'Marketplace', title:'Link triage', type:'queue', owner:'M8 · BC-ADM-3 (link — non-disclosure)',
  desc:'Confirm / dismiss private↔public vendor link suggestions.',
  contracts:['admin.confirm_link_suggestion.v1','admin.dismiss_link_suggestion.v1'],
  permission:'[ESC-ADM-SLUG]', state:'link_suggestions: suggested → confirmed / dismissed',
  nonDisclosure:true,
  columns:['Link candidate','Confidence','State','When'],
  rows:[
    ['private_rec_01H… ↔ ven_01K2…','staff-internal','suggested','3h ago'],
    ['private_rec_01G… ↔ ven_01J8…','staff-internal','confirmed','2d ago'],
    ['private_rec_01F… ↔ ven_01H9…','staff-internal','dismissed','5d ago'],
  ], stateCol:2,
  rowActions:[{label:'Confirm', note:'👆 confirm → writes M4 columns via Operations service (A-03)'},{label:'Dismiss', note:'👆 dismiss_link_suggestion'}] };

/* ---- G5 Verification (BC-ADM-5) ---- */
S['P-ADM-12'] = { group:'Operations', title:'Verification queue', type:'queue', owner:'M8 · BC-ADM-5 (workflow)',
  desc:'The M8 verification WORKFLOW. Trust owns the decision/record/score (firewall).',
  contracts:['admin.list_verification_tasks.v1','admin.queue_verification_task.v1'], permission:'staff_can_verify',
  state:'verification_tasks: queued → in_review → decided', detailId:'P-ADM-13',
  columns:['Task','Vendor','Type','State','Assignee'],
  rows:[
    ['VTASK-2026-000091','Bengal Fabrication','Trade licence','queued','—'],
    ['VTASK-2026-000090','Chittagong Valves','Bank tier','in_review','A. Rahman'],
    ['VTASK-2026-000087','Southern Motors','Trade licence','decided','S. Chowdhury'],
  ], stateCol:3 };

S['P-ADM-13'] = { group:'Operations', title:'Verification task detail', type:'detail', owner:'M8 workflow · M5 decision', parentId:'P-ADM-12',
  desc:'Task VTASK-2026-000091 — workflow (M8) coupled to the Trust decision (M5).',
  contracts:['admin.assign_verification_task.v1','admin.decide_verification_task.v1','trust.decide_verification.v1'],
  permission:'staff_can_verify', state:'verification_tasks: queued → in_review → decided',
  fields:[['Task ref','VTASK-2026-000091'],['Vendor','Bengal Fabrication (ven_01K2…)'],['Verification type','Trade licence'],['Workflow state','queued'],['Trust record ref','trust_ver_01H… (M5, referenced)'],['Assignee','—']],
  actions:[
    {label:'Assign to me', note:'👆 admin.assign_verification_task.v1 (M8 workflow)'},
    {label:'Record decision', kind:'primary', note:'👆 trust.decide_verification.v1 (M5 owns decision)'},
  ],
  firewall:'TRUST FIREWALL — <code class="inline">verification_tasks</code> (M8) ≠ <code class="inline">trust.verification_records/decisions</code> (M5). The task holds a <b>reference</b>; the decision content is M5’s and <b>no score is written here</b> (scores auto-calculate under System). Any Trust score shown is <b>display only</b>.',
  timeline:[['Task queued','2026-07-08 08:02'],['Trust record referenced','trust_ver_01H…'],['Awaiting decision','—']] };

/* ---- G6 Ads (M2 Doc-5D) ---- */
S['P-ADM-10'] = { group:'Marketplace', title:'Ad review queue', type:'queue', owner:'M2 · Doc-5D',
  desc:'Staff review (approve / reject) of advertisements.',
  contracts:['marketplace.review_advertisement.v1'], permission:'per Doc-5D staff gating',
  state:'ad review (M2-owned)', detailId:'P-ADM-11',
  columns:['Ad','Advertiser','State','Placement','Submitted'],
  rows:[
    ['AD-2026-000077','Bengal Fabrication','pending','Category banner','1h ago'],
    ['AD-2026-000076','Chittagong Valves','pending','Search sponsor','6h ago'],
    ['AD-2026-000072','Prime Cables','approved','Homepage strip','2d ago'],
    ['AD-2026-000069','Delta Steel','rejected','Category banner','4d ago'],
  ], stateCol:2, stateMap:{pending:'info'} };

S['P-ADM-11'] = { group:'Marketplace', title:'Ad review detail', type:'detail', owner:'M2 · Doc-5D', parentId:'P-ADM-10',
  desc:'Ad AD-2026-000077 — approve / reject.',
  contracts:['marketplace.review_advertisement.v1'], permission:'per Doc-5D staff gating',
  fields:[['Ad ref','AD-2026-000077'],['Advertiser','Bengal Fabrication (ven_01K2…)'],['Placement','Category banner'],['State','pending'],['Submitted','2026-07-08 10:40']],
  actions:[{label:'Approve', kind:'success', note:'👆 review_advertisement → approved'},{label:'Reject', kind:'danger', note:'👆 review_advertisement → rejected'}],
  ownerNote:'Admin decides; <b>Marketplace owns</b> the ad store (owning-module leg).' };

/* ---- G7 Import (BC-ADM-4) ---- */
S['P-ADM-14'] = { group:'Operations', title:'Import jobs', type:'queue', owner:'M8 · BC-ADM-4',
  desc:'Seed-data import jobs (create-then-poll). Seeded categories/vendors are Marketplace-owned.',
  contracts:['admin.list_import_jobs.v1','admin.submit_import_job.v1'], permission:'[ESC-ADM-SLUG]',
  state:'import_jobs: queued → processing → completed / failed', detailId:'P-ADM-15',
  columns:['Job','Type','State','Rows','Started'],
  rows:[
    ['IMP-2026-000042','vendor_seed','processing','1,204','12m ago'],
    ['IMP-2026-000041','categories','completed','86','2h ago'],
    ['IMP-2026-000039','vendor_seed','failed','0','1d ago'],
  ], stateCol:2, headRight:'<button class="btn btn--primary btn--sm" data-note="👆 → new import (P-ADM-15)" onclick="go(\'P-ADM-15\')">Submit import</button>' };

S['P-ADM-15'] = { group:'Operations', title:'Import job — new / detail', type:'detail', owner:'M8 · BC-ADM-4', parentId:'P-ADM-14',
  desc:'Submit a job, then poll — the console never runs processing.',
  contracts:['admin.submit_import_job.v1','admin.get_import_job.v1','admin.list_import_rows.v1','admin.process_import_job.v1'],
  permission:'[ESC-ADM-SLUG]', state:'import_jobs: queued → processing → completed / failed',
  fields:[['Job ref','IMP-2026-000042'],['Type','vendor_seed'],['File','vendors_2026Q3.csv (Platform Core storage)'],['State','processing'],['Rows processed','1,204 / 1,540']],
  actions:[
    {label:'Submit job', kind:'primary', note:'👆 admin.submit_import_job.v1 (create-then-poll)'},
    {label:'Refresh (poll)', note:'👆 admin.get_import_job.v1 + list_import_rows'},
    {label:'Process job', disabled:true, note:'🚫 System-only (admin.process_import_job.v1)'},
  ],
  ownerNote:'Import loads data; it does <b>not</b> own the seeded categories/vendors — those are <b>Marketplace-owned</b>, created via the Marketplace service (seam import→M2).',
  rowsTable:{columns:['Row','Outcome','Entity','Error'], rows:[['1201','created','cat_01K… (Marketplace)','—'],['1202','created','ven_01K… (Marketplace)','—'],['1203','failed','—','RowError: missing trade_licence_no'],['1204','processing','—','—']]} };

/* ---- G8 Outreach (BC-ADM-6) ---- */
S['P-ADM-16'] = { group:'Outreach', title:'Outreach campaigns', type:'queue', owner:'M8 · BC-ADM-6 (informational — moat)',
  desc:'Informational vendor-acquisition outreach only — never procurement/matching/award.',
  contracts:['admin.list_outreach_campaigns.v1','admin.create_outreach_campaign.v1','admin.run_outreach_campaign.v1'],
  permission:'[ESC-ADM-SLUG]', state:'outreach_campaigns: draft → running → completed', detailId:'P-ADM-17', moatQueue:true,
  columns:['Campaign','Segment','State','Contacts','Updated'],
  rows:[
    ['Q3 Fabricators — Ctg','Fabrication / Chittagong','running','340','1h ago'],
    ['Valve suppliers — nationwide','Valves & Fittings','draft','0','—'],
    ['Motors OEMs','Motors & Drives','completed','512','1w ago'],
  ], stateCol:2 };

S['P-ADM-17'] = { group:'Outreach', title:'Campaign detail', type:'detail', owner:'M8 · BC-ADM-6', parentId:'P-ADM-16',
  desc:'Campaign “Q3 Fabricators — Ctg”.',
  contracts:['admin.get_outreach_campaign.v1','admin.run_outreach_campaign.v1','admin.complete_outreach_campaign.v1'],
  permission:'[ESC-ADM-SLUG]', state:'outreach_campaigns: draft → running → completed',
  fields:[['Campaign','Q3 Fabricators — Ctg'],['Segment','Fabrication / Chittagong'],['State','running'],['Contacts','340'],['Channel','Email / SMS (M6 delivery)']],
  actions:[{label:'Run campaign', kind:'primary', note:'👆 admin.run_outreach_campaign.v1'},{label:'Complete', note:'👆 admin.complete_outreach_campaign.v1'}],
  moat:'Informational acquisition only — <b>never</b> procurement routing, matching, ranking, supplier-selection, award, or eligibility (moat).' };

S['P-ADM-18'] = { group:'Outreach', title:'Outreach contacts', type:'queue', owner:'M8 · BC-ADM-6',
  desc:'Campaign contacts (target vendor referenced by UUID, Marketplace-owned).',
  contracts:['admin.add_outreach_contact.v1','admin.update_outreach_contact.v1'], permission:'[ESC-ADM-SLUG]',
  columns:['Contact','Target vendor (ref)','Status','Channel','Added'],
  rows:[
    ['Bengal Fabrication Ltd','ven_01K2… (Marketplace)','contacted','Email','2h ago'],
    ['Ctg Steel Works','off_platform_lead_01…','queued','SMS','1d ago'],
    ['Padma Engineering','ven_01J7… (Marketplace)','responded','Email','3d ago'],
  ], stateCol:2, stateMap:{contacted:'info',queued:'neutral',responded:'success'} };

/* ---- G9 Routing & Matching (M3 Doc-5E) ---- */
S['P-ADM-19'] = { group:'RFQ Operations', title:'Routing rules', type:'queue', owner:'M3 · Doc-5E §7 (moat)',
  desc:'Adjust routing rules / human-assist — never an award or winner.',
  contracts:['rfq.manage_routing_rule.v1','rfq.assist_routing.v1'], permission:'Admin control-plane (no org)',
  detailId:'P-ADM-20', moatQueue:true,
  columns:['Rule','Scope','State','Priority','Updated'],
  rows:[
    ['Fabrication → Ctg pool','Category: Fabrication','active','High','2d ago'],
    ['Valves capacity throttle','Category: Valves','active','Medium','1w ago'],
    ['Motors — assist only','Category: Motors','paused','Low','2w ago'],
  ], stateCol:2, stateMap:{active:'success',paused:'neutral'} };

S['P-ADM-20'] = { group:'RFQ Operations', title:'Routing rule editor', type:'editor', owner:'M3 · Doc-5E §7', parentId:'P-ADM-19',
  desc:'Adjust a routing rule (rules/human-assist only — no award).',
  contracts:['rfq.manage_routing_rule.v1','rfq.assist_routing.v1'], permission:'Admin control-plane (no org)',
  form:[['Rule name','text','Fabrication → Ctg pool'],['Scope (category)','select','Fabrication'],['Assist mode','select','Stage-gated human-assist'],['Priority','select','High']],
  actions:[{label:'Save rule', kind:'primary', note:'👆 rfq.manage_routing_rule.v1'},{label:'Cancel', kind:'ghost'}],
  moat:'<code class="inline">assist_routing</code> adjusts rules / human-assist (Stage-gated) — it <b>never</b> produces an award or winner. The no-auto-decision moat holds.' };

S['P-ADM-21'] = { group:'RFQ Operations', title:'Matching results (internal)', type:'queue', owner:'M3 · Doc-5E (Admin read — moat)',
  desc:'Staff-internal READ of internal matching results. No award/selection action.',
  contracts:['rfq.get_matching_results.v1'], permission:'Admin read (no org)', moatQueue:true, readonly:true,
  columns:['RFQ','Candidate pool','Routing state','Assisted','Updated'],
  rows:[
    ['RFQ-2026-000212','18 vendors','routed','—','40m ago'],
    ['RFQ-2026-000208','9 vendors','routing','human-assist','3h ago'],
  ], stateCol:2, stateMap:{routed:'success',routing:'warning'},
  moatQueue2:'Read-only observability. Explainability must not expose a protected fact (Doc-5E R5). <b>No award/winner/eligibility</b> action is rendered.' };

/* ---- G10 Monetization (M7 Doc-5I) ---- */
S['P-ADM-22'] = { group:'Billing', title:'Plan management', type:'queue', owner:'M7 · Doc-5I (BC-BILL-1)',
  desc:'Plan catalog lifecycle. Entitlements are boolean/numeric/enum, never plan-name checks.',
  contracts:['billing.create_plan.v1','billing.update_plan.v1','billing.retire_plan.v1','billing.activate_plan.v1'],
  permission:'Admin (M7)', state:'create_plan → draft · activate_plan → active · retire_plan → retired', detailId:'P-ADM-23',
  columns:['Plan','Tier','State','Price (BDT/yr)','Updated'],
  rows:[
    ['Vendor Growth','Vendor','active','24,000','1mo ago'],
    ['Vendor Pro','Vendor','active','60,000','1mo ago'],
    ['Buyer Plus','Buyer','draft','—','2d ago'],
    ['Legacy Basic','Vendor','retired','—','6mo ago'],
  ], stateCol:2, headRight:'<button class="btn btn--primary btn--sm" data-note="👆 → plan editor (P-ADM-23)" onclick="go(\'P-ADM-23\')">New plan</button>' };

S['P-ADM-23'] = { group:'Billing', title:'Plan editor', type:'editor', owner:'M7 · Doc-5I', parentId:'P-ADM-22',
  desc:'Create / update / activate a plan (activate_plan owns draft→active).',
  contracts:['billing.create_plan.v1','billing.update_plan.v1','billing.activate_plan.v1','billing.retire_plan.v1'],
  permission:'Admin (M7)',
  form:[['Plan name','text','Buyer Plus'],['Audience','select','Buyer'],['Marketing config','text','Priority support, 5 seats'],['State','select','draft']],
  actions:[{label:'Save plan', kind:'primary', note:'👆 billing.update_plan.v1 (config only)'},{label:'Activate', kind:'success', note:'👆 billing.activate_plan.v1 → active'},{label:'Retire', note:'👆 billing.retire_plan.v1'}] };

S['P-ADM-24'] = { group:'Billing', title:'Entitlements / bundles', type:'queue', owner:'M7 · Doc-5I',
  desc:'Entitlements are boolean / numeric / enum — never a plan-name check (Financial Tier ≠ plan ≠ Trust).',
  contracts:['billing.bundle_plan_entitlement.v1','billing.create_entitlement.v1'], permission:'Admin (M7)',
  columns:['Entitlement key','Type','Value','Bundled in'],
  rows:[
    ['rfq.monthly_quota','numeric','40','Vendor Growth'],
    ['microsite.enabled','boolean','true','Vendor Pro'],
    ['lead.credits','numeric','100','Vendor Pro'],
    ['support.tier','enum','priority','Buyer Plus'],
  ], stateCol:-1 };

/* ---- G11 Identity Ops (M1 Doc-5C) ---- */
S['P-ADM-25'] = { group:'Identity', title:'Identity ops — organizations', type:'queue', owner:'M1 · Doc-5C (no active-org, act ON by ID)',
  desc:'Org status governance + ownership recovery. Acts ON an org by ID — never AS an org.',
  contracts:['identity.set_organization_status.v1','identity.admin_recover_ownership.v1','identity.restore_organization.v1'],
  permission:'Admin (no active-org)', escList:'E4', state:'org status governance',
  columns:['Organization','Org ID','Status','Owner','Members'],
  rows:[
    ['Bengal Fabrication Ltd','org_01K2…','active','R. Karim','12'],
    ['Delta Steel Co','org_01H8…','suspended','—','8'],
    ['Padma Engineering','org_01J7…','active','N. Haque','5'],
  ], stateCol:2, stateMap:{active:'success',suspended:'critical'},
  rowActions:[{label:'Suspend', note:'👆 identity.set_organization_status.v1'},{label:'Recover ownership', note:'👆 identity.admin_recover_ownership.v1'}] };

S['P-ADM-26'] = { group:'Identity', title:'Identity ops — users', type:'queue', owner:'M1 · Doc-5C',
  desc:'User account status governance. Acts ON a user by ID.',
  contracts:['identity.set_user_account_status.v1'], permission:'Admin (no active-org)', escList:'E4',
  columns:['User','User ID','Status','Primary org','Last active'],
  rows:[
    ['R. Karim','usr_01K2…','active','Bengal Fabrication','2h ago'],
    ['A. Sultana','usr_01J9…','suspended','Delta Steel','2w ago'],
    ['M. Islam','usr_01J1…','active','Padma Engineering','1d ago'],
  ], stateCol:2, stateMap:{active:'success',suspended:'critical'},
  rowActions:[{label:'Suspend', note:'👆 identity.set_user_account_status.v1'},{label:'Reinstate', note:'👆 → active'}] };

/* ---- G12 Support (M6 Doc-5H) ---- */
S['P-ADM-29'] = { group:'Support', title:'Support', type:'queue', owner:'M6 · Doc-5H (staff_can_support)',
  desc:'Staff support of tenant tickets. The ticket aggregate stays M6-owned — ownership never transfers to Admin.',
  contracts:['get_ticket / list_tickets','update_ticket','add_ticket_message','close_ticket'], permission:'staff_can_support',
  state:'support tickets: open → in_progress → resolved → closed',
  columns:['Ticket','Subject','State','Tenant','Updated'],
  rows:[
    ['SUP-2026-000318','Cannot upload catalogue CSV','open','Bengal Fabrication','25m ago'],
    ['SUP-2026-000316','Microsite slug change','in_progress','Chittagong Valves','3h ago'],
    ['SUP-2026-000311','RFQ notification not received','resolved','Padma Engineering','1d ago'],
  ], stateCol:2,
  rowActions:[{label:'Reply', note:'👆 add_ticket_message'},{label:'Advance', note:'👆 update_ticket (state transition)'}],
  supportNote:'Staff drive the ticket state machine (<code class="inline">update_ticket</code> / <code class="inline">close_ticket</code>). <b>No private-RFQ read</b>; out-of-scope reads collapse to <code class="inline">NOT_FOUND</code>.' };

/* ============================================================================
   RENDERING
   ============================================================================ */
const $ = (s, r=document) => r.querySelector(s);
const el = (h) => { const t=document.createElement('template'); t.innerHTML=h.trim(); return t.content.firstChild; };
const stateChip = (s, surf) => {
  const map = surf && surf.stateMap ? surf.stateMap : {};
  const kind = map[s] || STATUS[s] || 'neutral';
  return `<span class="chip chip--${kind}">${String(s).replace(/_/g,' ')}</span>`;
};

let CURRENT = 'P-ADM-01';
let VIEWSTATE = 'success'; // loading | empty | error | success

function renderSidebar() {
  const groups = NAV.map(g => `
    <div class="nav__group">
      <div class="nav__group-label">${g.group}</div>
      ${g.items.map(it => `
        <button class="nav__item ${CURRENT===it.id?'active':''}" onclick="go('${it.id}')" title="${it.label}">
          <span class="ico">${icon(it.icon)}</span>
          <span class="txt">${it.label}</span>
          ${it.count?`<span class="badge-count">${it.count}</span>`:''}
        </button>`).join('')}
    </div>`).join('');
  $('#nav').innerHTML = groups;
}

function govStrip(surf) {
  const parts = [];
  parts.push(`<span class="gv"><b>Page</b> <code>${CURRENT}</code></span>`);
  parts.push(`<span class="gv"><b>Owner</b> <span class="tag-owner">${surf.owner||'—'}</span></span>`);
  if (surf.permission) parts.push(`<span class="gv"><b>Permission</b> ${/ESC/.test(surf.permission)?`<span class="esc-tag">${surf.permission}</span>`:`<code>${surf.permission}</code>`}</span>`);
  if (surf.contracts) parts.push(`<span class="gv"><b>Contracts</b> ${surf.contracts.map(c=>`<code>${c}</code>`).join(' ')}</span>`);
  if (surf.state) parts.push(`<span class="gv"><b>State</b> <span style="font-size:11.5px;color:var(--text-2)">${surf.state}</span></span>`);
  return `<div class="gov-strip">${parts.join('')}</div>`;
}

function stateSwitch() {
  const opts = ['loading','empty','error','success'];
  return `<div class="state-switch" title="Prototype: preview surface states">
    ${opts.map(o=>`<button class="${VIEWSTATE===o?'active':''}" onclick="setState('${o}')">${o}</button>`).join('')}
  </div>`;
}

function pageHead(surf, extraRight='') {
  return `<div class="page-head">
    <div>
      <div class="crumb">${surf.group}${surf.parentId?` · <a onclick="go('${surf.parentId}')" style="cursor:pointer;color:var(--iv-brand-600)">${S[surf.parentId].title}</a>`:''}</div>
      <h1>${surf.title} ${surf.titleAlt?`<span style="font-size:12px;color:var(--text-3);font-weight:500">${surf.titleAlt}</span>`:''}</h1>
      <div class="desc">${surf.desc||''}</div>
    </div>
    <div class="head-right">${extraRight} ${surf.headRight||''} ${stateSwitch()}</div>
  </div>`;
}

function bodyStates(innerFn) {
  if (VIEWSTATE==='loading') {
    return `<div class="card card--pad0">${Array.from({length:5}).map(()=>`
      <div class="skeleton-row"><div class="sk" style="width:14%"></div><div class="sk" style="width:26%"></div><div class="sk" style="width:12%"></div><div class="sk" style="width:16%"></div><div class="sk" style="width:12%"></div></div>`).join('')}</div>`;
  }
  if (VIEWSTATE==='empty') {
    return `<div class="card"><div class="empty-state">
      <div class="es-ico">${icon('folder',34)}</div>
      <div class="es-title">Nothing in the queue</div>
      <div>Honest empty state — no fabricated rows, no implied count.</div></div></div>`;
  }
  if (VIEWSTATE==='error') {
    return `<div class="card"><div class="error-state">
      <div class="es-ico">${icon('ban',34)}</div>
      <div class="es-title">Couldn’t load this surface</div>
      <div>A read failed. The surface degrades honestly — it never shows stale or invented data.</div>
      <button class="btn btn--sm" style="margin-top:12px" onclick="setState('success')">Retry</button></div></div>`;
  }
  return innerFn();
}

function calloutsFor(surf) {
  let h = '';
  if (surf.rulingE5) h += `<div class="callout callout--warn"><span class="c-ico">⚖️</span><div><b>Board ruling E5 — Vendor moderation, not approval.</b> Admin moderates the vendor profile (<code class="inline">active ⇄ suspended</code>). Vendor <b>claim</b> approval is performed by the vendor (<code class="inline">marketplace.claim_vendor_profile.v1</code>, User actor) — there is no Admin “approve vendor” workflow, and none is implied here.</div></div>`;
  if (surf.nonDisclosure) h += `<div class="callout callout--nd"><span class="c-ico">🔒</span><div><b>Non-disclosure (Invariant #11).</b> Link-suggestion content is staff-internal, never vendor-visible. An unauthorized read collapses to <code class="inline">NOT_FOUND</code>; a link suggestion’s existence is itself a protected fact.</div></div>`;
  if (surf.firewall) h += `<div class="callout callout--firewall"><span class="c-ico">🛡️</span><div>${surf.firewall}</div></div>`;
  if (surf.event) h += `<div class="callout callout--firewall"><span class="c-ico">📣</span><div>${surf.event}</div></div>`;
  if (surf.banBlacklist) h += `<div class="callout callout--warn"><span class="c-ico">⚠️</span><div><b>Ban ≠ blacklist.</b> A ban is platform-wide and vendor-visible. A buyer-private blacklist is undetectable (a different surface, Doc-7F/7G) — never conflated here.</div></div>`;
  if (surf.moat) h += `<div class="callout callout--firewall"><span class="c-ico">🚧</span><div><b>Procurement moat.</b> ${surf.moat}</div></div>`;
  if (surf.moatQueue2) h += `<div class="callout callout--firewall"><span class="c-ico">🚧</span><div>${surf.moatQueue2}</div></div>`;
  if (surf.supportNote) h += `<div class="callout callout--firewall"><span class="c-ico">🎫</span><div>${surf.supportNote}</div></div>`;
  if (surf.ownerNote) h += `<div class="callout callout--firewall"><span class="c-ico">🏷️</span><div>${surf.ownerNote}</div></div>`;
  if (surf.escList) h += `<div class="callout callout--warn"><span class="c-ico">🧭</span><div><b>Open escalation (§12 ${surf.escList}).</b> No frozen admin cross-tenant list-read exists (<code class="inline">list_my_organizations</code> is a User principal-scoped read; no <code class="inline">list_users</code>). This list is <b>bind-or-ESC</b> <span class="esc-tag">[ESC-7-API]</span> — the rows below are an illustrative placeholder, not a fabricated query.</div></div>`;
  if (surf.moatQueue && !surf.moatQueue2 && !surf.moat) h += `<div class="callout callout--firewall"><span class="c-ico">🚧</span><div><b>Procurement moat.</b> This surface adjusts rules / observes results — it never matches, ranks, selects, awards, or determines eligibility.</div></div>`;
  return h;
}

function renderQueue(surf) {
  const toolbar = `<div class="toolbar">
    <div class="filter">${icon('search',14)}<input placeholder="Filter…"></div>
    <div class="filter">State <select><option>All</option>${[...new Set(surf.rows.map(r=>surf.stateCol>=0?r[surf.stateCol]:null)).values()].filter(Boolean).map(s=>`<option>${s}</option>`).join('')}</select></div>
    <div class="spacer"></div>
    ${surf.readonly?'<span class="pill">read-only</span>':''}
    <span class="pill">${surf.rows.length} items</span>
  </div>`;
  const rowsHtml = surf.rows.map((r,ri)=>`
    <tr ${surf.detailId?`onclick="go('${surf.detailId}')" data-note="👆 open detail"`:''}>
      ${r.map((c,ci)=> ci===surf.stateCol ? `<td>${stateChip(c,surf)}</td>` :
        `<td class="${ci===0?'primary-cell':''} ${ci===1&&/_0|ven_|org_|usr_|RFQ-|prod_/.test(c)?'mono':''}">${c}</td>`).join('')}
      ${surf.rowActions?`<td><div class="row-actions">${surf.rowActions.map(a=>`<button class="btn btn--sm" data-note="${a.note||''}" onclick="event.stopPropagation()">${a.label}</button>`).join('')}</div></td>`:''}
    </tr>`).join('');
  return `<div class="card card--pad0">
    ${toolbar}
    <div class="tablewrap"><table class="qtable">
      <thead><tr>${surf.columns.map(c=>`<th>${c}</th>`).join('')}${surf.rowActions?'<th style="text-align:right">Actions</th>':''}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table></div>
  </div>`;
}

function renderDetail(surf) {
  const info = `<div class="card">
    <div class="card-title">Record</div>
    <dl class="dl">${surf.fields.map(([k,v])=>`<dt>${k}</dt><dd>${/_0|ven_|org_|usr_|trust_|cat_|RFQ-|MOD-|BAN-|VTASK-|AD-|IMP-/.test(v)?`<span class="mono">${v}</span>`:v}</dd>`).join('')}</dl>
    ${surf.decideNote?`<div style="margin-top:12px;font-size:12px;color:var(--text-2)">${surf.decideNote}</div>`:''}
    <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
      ${surf.actions.map(a=>`<button class="btn ${a.kind?'btn--'+a.kind:''} ${a.disabled?'is-disabled':''}" ${a.disabled?'disabled':''} data-note="${a.note||''}">${a.label}${a.disabled?' <span class="sys-note">· System</span>':''}</button>`).join('')}
    </div>
    ${surf.concurrency?`<div style="margin-top:10px;font-size:11.5px;color:var(--text-3)">Optimistic concurrency: a lost race → <code class="inline">CONFLICT</code>, distinct from <code class="inline">STATE</code> (illegal-from-state).</div>`:''}
  </div>`;
  const rowsTable = surf.rowsTable ? `<div class="card card--pad0" style="margin-top:16px">
    <div style="padding:12px 16px;font-weight:700;font-size:13px">Import rows (append-only)</div>
    <div class="tablewrap"><table class="qtable"><thead><tr>${surf.rowsTable.columns.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${surf.rowsTable.rows.map(r=>`<tr>${r.map((c,i)=> i===1?`<td>${stateChip(c,surf)}</td>`:`<td class="${i===2?'mono':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`:'';
  const side = `<div class="card">
    <div class="card-title">${icon('verify',16)} Activity</div>
    <ul class="timeline">${(surf.timeline||[]).map(([t,ts])=>`<li>${t}<div class="t-time">${ts}</div></li>`).join('')}</ul>
  </div>`;
  return `<div class="detail-grid"><div>${info}${rowsTable}</div><div>${side}</div></div>`;
}

function renderEditor(surf) {
  return `<div class="card" style="max-width:640px">
    ${surf.form.map(([label,kind,val])=>`
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:12px;color:var(--text-2);margin-bottom:5px;font-weight:600">${label}</label>
        ${kind==='select'
          ? `<select class="btn" style="width:100%;justify-content:flex-start"><option>${val}</option></select>`
          : `<input class="btn" style="width:100%;justify-content:flex-start;font-weight:400" value="${val}">`}
      </div>`).join('')}
    <div style="margin-top:8px;display:flex;gap:8px">
      ${surf.actions.map(a=>`<button class="btn ${a.kind?'btn--'+a.kind:''}" data-note="${a.note||''}">${a.label}</button>`).join('')}
    </div>
  </div>`;
}

function renderDashboard() {
  const kpis = [
    {label:'Open moderation cases', val:'7', bind:'admin.list_moderation_cases.v1', icon:'gavel', kind:'info', to:'P-ADM-02'},
    {label:'Active bans', val:'2', bind:'admin.list_ban_actions.v1', icon:'ban', kind:'critical', to:'P-ADM-05'},
    {label:'Verification queue', val:'5', bind:'admin.list_verification_tasks.v1', icon:'verify', kind:'warning', to:'P-ADM-12'},
    {label:'Pending imports', val:'1', bind:'admin.list_import_jobs.v1', icon:'upload', kind:'neutral', to:'P-ADM-14'},
  ];
  const kpiRow = `<div class="kpi-row">${kpis.map(k=>`
    <div class="card kpi" style="cursor:pointer" onclick="go('${k.to}')" data-note="👆 deep-link — no inline mutation">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="kpi-label">${k.label}</div>
        <div class="ico-box chip--${k.kind}">${icon(k.icon,16)}</div>
      </div>
      <div class="kpi-val">${k.val}</div>
      <div class="kpi-bind">↳ ${k.bind}</div>
    </div>`).join('')}</div>`;

  const approvals = `<div class="card">
    <div class="card-title">${icon('bulb',16)} Pending approvals</div>
    <div class="card-sub">Category / ad / vendor queues — deep-links only</div>
    ${[['Category suggestions','2','admin.list_suggestions.v1','P-ADM-08'],['Ad reviews','4','marketplace.review_advertisement.v1','P-ADM-10'],['Vendor moderation','1','marketplace.set_vendor_profile_status.v1','P-ADM-07']].map(([l,n,b,to])=>`
      <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border-2);cursor:pointer" onclick="go('${to}')" data-note="👆 deep-link">
        <span style="flex:1;font-size:13px">${l}</span>
        <span class="chip chip--brand">${n}</span>
        <span class="kpi-bind">${b}</span>
      </div>`).join('')}
  </div>`;

  const activity = `<div class="card">
    <div class="card-title">${icon('gavel',16)} Recent audit</div>
    <div class="card-sub">Doc-2 §9 audit reads (reads not audited)</div>
    <ul class="timeline">
      <li>Ban issued — BAN-2026-000031 <div class="t-time">11:20 · staff_can_ban</div></li>
      <li>Category suggestion approved <div class="t-time">10:55 · staff_can_manage_categories</div></li>
      <li>Moderation case escalated — MOD-…145 <div class="t-time">10:31 · staff_can_moderate_rfq</div></li>
      <li>Verification decided — VTASK-…087 <div class="t-time">09:48 · staff_can_verify</div></li>
    </ul>
  </div>`;

  const rfqHealth = `<div class="card">
    <div class="card-title">${icon('filesearch',16)} RFQ health</div>
    <div class="card-sub">Moderation / routing state counts</div>
    <div style="display:flex;gap:18px;margin-top:6px">
      <div><div class="kpi-val" style="font-size:22px">3</div><div class="kpi-bind">RFQ mod cases</div></div>
      <div><div class="kpi-val" style="font-size:22px">2</div><div class="kpi-bind">routing active</div></div>
      <div><div class="kpi-val" style="font-size:22px">18</div><div class="kpi-bind">candidate pool</div></div>
    </div>
    <div style="margin-top:8px;font-size:11px;color:var(--text-3)">Counts only — no matching/ranking/score exposed (moat + firewall).</div>
  </div>`;

  const health = `<div style="margin-top:16px"><div class="esc-placeholder">
    <span>🧭</span><div><b>System health</b> — no frozen contract exists for infra monitoring.
    Rendered as a visible <span class="esc-tag">[ESC-7-API]</span> placeholder, never as real data (§12 E6).</div></div></div>`;

  return `${kpiRow}
    <div class="section-2col">
      <div class="grid">${approvals}${rfqHealth}</div>
      <div class="grid">${activity}</div>
    </div>${health}`;
}

function render() {
  const surf = S[CURRENT];
  renderSidebar();
  $('#app').setAttribute('data-mobilenav','false');
  let body = '';
  if (surf.type==='dashboard') {
    body = pageHead(surf) + govStrip(surf) + bodyStates(renderDashboard);
  } else if (surf.type==='queue') {
    body = pageHead(surf) + govStrip(surf) + calloutsFor(surf) + bodyStates(()=>renderQueue(surf));
  } else if (surf.type==='detail') {
    body = pageHead(surf) + govStrip(surf) + calloutsFor(surf) + bodyStates(()=>renderDetail(surf));
  } else if (surf.type==='editor') {
    body = pageHead(surf) + govStrip(surf) + calloutsFor(surf) + bodyStates(()=>renderEditor(surf));
  }
  $('#content').innerHTML = body;
  window.scrollTo(0,0);
}

/* ---------- Router / controls ---------- */
window.go = (id) => { if(!S[id]) return; CURRENT=id; VIEWSTATE='success'; location.hash=id; render(); };
window.setState = (s) => { VIEWSTATE=s; render(); };

function boot() {
  const h = location.hash.replace('#','');
  if (S[h]) CURRENT = h;
  render();

  $('#collapse').onclick = () => {
    const app=$('#app');
    if (window.innerWidth<=860) { app.setAttribute('data-mobilenav', app.getAttribute('data-mobilenav')==='true'?'false':'true'); }
    else { app.setAttribute('data-collapsed', app.getAttribute('data-collapsed')==='true'?'false':'true'); }
  };
  $('#scrim').onclick = () => $('#app').setAttribute('data-mobilenav','false');
  $('#theme').onclick = () => {
    const r=document.documentElement, dark=r.getAttribute('data-theme')==='dark';
    r.setAttribute('data-theme', dark?'light':'dark');
    $('#theme').innerHTML = icon(dark?'moon':'sun');
  };
  $('#reviewmode').onclick = () => {
    const r=document.documentElement, on=r.getAttribute('data-review')!=='false';
    r.setAttribute('data-review', on?'false':'true');
    $('#rm-label').textContent = on?'Preview' : 'Review mode';
    $('#reviewmode').title = on?'Review annotations hidden — clean production-like preview' : 'Review annotations visible';
  };
  $('#legend-close').onclick = () => { $('#legend').classList.add('collapsed'); $('#legend-open').style.display='grid'; };
  $('#legend-open').onclick = () => { $('#legend').classList.remove('collapsed'); $('#legend-open').style.display='none'; };
  window.addEventListener('hashchange', ()=>{ const x=location.hash.replace('#',''); if(S[x]&&x!==CURRENT){CURRENT=x;VIEWSTATE='success';render();} });
}
document.addEventListener('DOMContentLoaded', boot);
