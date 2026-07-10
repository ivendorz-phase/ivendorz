# iVendorz Admin Console — Stage-3 Hi-Fi Clickable Prototype

**Stage-3 deliverable** of the 6-stage Admin Console pipeline. Built to
[`admin_console_planning_and_design.md`](../../docs/product/requirements/admin_console_planning_and_design.md)
v0.3 (governance) and
[`admin_console_prototype_design_brief.md`](../../docs/product/requirements/admin_console_prototype_design_brief.md)
v0.2 (visual/interaction).

> **Prototype only.** No production code, no backend integration. Coins nothing — every contract,
> state, slug, and lifecycle is bound by pointer to the frozen corpus; seed data is illustrative and
> the fields shown are the frozen ones. **Next gate: Stage-4 Visual Approval.**

## Run it — the clickable prototype is the PRIMARY Stage-4 review artifact

The running prototype (not screenshots) is the product under review. Launch it with one command:

```bash
npm run prototype            # → http://localhost:8080
```

Screenshots (`_screenshots/`) are audit-trail evidence produced *after* approval, never the primary
review surface. Static, self-contained (HTML/CSS/JS, no build); Node not python (local-server lesson).

<details><summary>Alternative launchers</summary>

```bash
npx http-server prototypes/admin-console -p 8080 -c-1
```

or

```bash
node -e "const h=require('http'),f=require('fs'),p=require('path');h.createServer((q,s)=>{let u=p.join('prototypes/admin-console',q.url==='/'?'index.html':q.url);f.readFile(u,(e,d)=>{if(e){s.writeHead(404);return s.end()}s.writeHead(200,{'content-type':u.endsWith('.css')?'text/css':u.endsWith('.js')?'text/javascript':'text/html'});s.end(d)})}).listen(8080,()=>console.log('http://localhost:8080'))"
```
</details>

## What's in it

- **Shell** — navy sidebar (frozen IA groups; collapse / expand / pinned / responsive) + header
  (staff identity, non-functional global-search placeholder, notification entry, light/dark toggle).
- **Dashboard (P-ADM-01)** — KPI tiles each annotated with their frozen `list_*` read; pending
  approvals; RFQ health (counts only — no matching/ranking); recent audit; **System health as a
  visible `[ESC-7-API]` placeholder**, never real data.
- **All 29 surfaces** (`P-ADM-01…29`) rendered through shared queue / detail / editor templates
  (the "reuse the AdminQueueTable pattern" the brief calls for).
- **State switcher** (top-right of every surface) — preview **loading / empty / error / success**.
- **Interaction legend** (bottom-right) — hover any action to see its frozen contract binding.
- **Governance strip** on every surface — page ID, owner, permission slug, bound contracts, lifecycle.
- **Review-mode toggle** (header) — flags the governance strip, ESC annotations, legend, and state
  switcher **on** (review aid, default) or **off** (clean production-like preview). Per Board
  MINOR-01/02, these are review aids, not production UI.

**Version traceability (Board NIT-05):** Prototype **v1.0** ↔ Planning **v0.3** ↔ Prototype Brief
**v0.2** (stamped in the sidebar footer).

## Board rulings encoded (Stage-2)

- **E5** — P-ADM-07 renders as **Vendor Moderation** (Suspend / Reactivate); no "Approve" action;
  an explicit callout that claim approval is vendor-performed (`marketplace.claim_vendor_profile.v1`,
  User actor). No approval workflow is implied.
- **E8** — **no** review-moderation pages, **no** admin-ratings surface, **no** new nav/page IDs.
- Firewalls visualized, never breached: no score write (verification = workflow ≠ decision), no
  award/eligibility (routing = rules/read only), non-disclosure `NOT_FOUND` (link triage), ban ≠
  blacklist, `VendorBanned` as the sole event.

## Notes / honest gaps

- **Icons** are inline SVG stand-ins in the Lucide style; production uses the Doc-7B Lucide kit.
- **Design tokens** mirror the frozen Navy-dominant Doc-7B semantic system (usage, not new color).
- **Identity list surfaces (P-ADM-25/26)** carry an on-surface `[ESC-7-API]` note — no frozen
  cross-tenant list-read exists; the rows are an illustrative placeholder (§12 E4), not a query.

## Folder layout

```
prototypes/admin-console/
  index.html            # shell + header + legend
  _assets/
    styles.css          # frozen-token design system (navy shell, chips, tables, states)
    app.js              # frozen IA + 29 surface definitions + router/renderers
  README.md
```

*Naming (per Brief §7): surfaces addressed by `#P-ADM-nn` hash routes; screenshots for review as
`P-ADM-nn-<state>.png`.*
