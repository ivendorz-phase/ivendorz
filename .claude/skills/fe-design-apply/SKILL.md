# fe-design-apply Skill

**Invoke:** `/fe-design-apply`

## Purpose
Apply existing frozen design patterns to new UI. Speeds up page/component design by reusing pattern templates instead of inventing new ones.

## When to Use
- "Build this page using the frozen kit"
- "Design a vendor profile card"
- "Create a dashboard dashboard layout"
- Designing a new surface → want consistency with existing pages

---

## Pattern Library

### Pattern 1: Sidebar + Content
**Use for:** Workspace/admin dashboards, settings, navigation-heavy surfaces

**Structure:**
```
[Logo]
[Primary Nav]
[Secondary Nav]
[Content Area]
[Footer]
```

**Frozen Components:** `SideBar`, `TopBar`, `Container`

**Examples in code:**
- Buyer workspace
- Vendor workspace
- Admin dashboard

**Checklist:**
- [ ] Sidebar: 256px fixed or responsive collapse
- [ ] Content area: max-width 1200px, centered
- [ ] Primary nav: 1–2 levels deep (don't nest >2)
- [ ] Logo/branding: consistent BrandLogo from kit

---

### Pattern 2: Card Grid
**Use for:** Marketplace, vendor list, product catalog, dashboard tiles

**Structure:**
```
[Title/Filter Bar]
[Grid of Cards]
  └─ [Card content with image/info/CTA]
[Pagination or Load More]
```

**Frozen Components:** `Card`, `Grid`, `Badge`, `Button`

**Examples:**
- Marketplace vendor list
- Product catalog
- RFQ list

**Checklist:**
- [ ] 12-column responsive grid (1 mobile, 2 tablet, 3–4 desktop)
- [ ] 24px gap between cards
- [ ] Card padding: 16px (small) or 24px (large)
- [ ] Border radius: 8px standard
- [ ] Image aspect ratio: 16:9 or 1:1 (be consistent)

---

### Pattern 3: Tabbed Workspace
**Use for:** Multi-section pages (RFQ tabs, vendor profiles, document workspaces)

**Structure:**
```
[Breadcrumb/Header]
[Tab Navigation Bar]
  ├─ Tab 1: [Content]
  ├─ Tab 2: [Content]
  └─ Tab 3: [Content]
[Action Bar / Footer]
```

**Frozen Components:** `WorkspaceTabs`, `Container`, `Button`

**Examples:**
- RFQ Quotation builder (steps as tabs)
- Vendor profile (overview, catalog, engagement history)
- Document workspace (LOI, PO, Challan)

**Checklist:**
- [ ] Use `WorkspaceTabs` component from kit (frozen)
- [ ] Lazy-load tab content where possible (`React.lazy`)
- [ ] Active tab state visible (underline or highlight)
- [ ] Tab count: 2–5 (max 6, or use dropdown)
- [ ] Content area: padding 16px or 24px

---

### Pattern 4: Form + Submission
**Use for:** Create/edit surfaces, wizards, settings

**Structure:**
```
[Form Title / Description]
[Form Fields]
  ├─ Input
  ├─ Select
  ├─ Textarea
  └─ Checkbox
[Button Bar: Cancel / Submit]
```

**Frozen Components:** `Input`, `Select`, `Textarea`, `Checkbox`, `Button`, `Label`

**Checklist:**
- [ ] Labels above fields (not floating labels)
- [ ] 8px spacing between label and input
- [ ] Error state: red border + error text below
- [ ] Required indicator: red `*` after label
- [ ] Buttons: primary action (Navy/Button-primary), secondary (ghost)
- [ ] Form validation: server-side + client-side feedback
- [ ] Accessibility: `<label htmlFor="id">` pairing

---

### Pattern 5: Data Table / List
**Use for:** RFQ lists, quotations, vendor database, transaction history

**Structure:**
```
[Title / Filter Bar]
[Column Headers]
[Rows of Data]
[Pagination]
```

**Frozen Components:** `Table`, `DataGrid`, `Badge`, `Avatar`

**Checklist:**
- [ ] Column width: max-content for labels, min-width for data
- [ ] Sortable columns (click header to sort)
- [ ] Row hover: slight background change (not obtrusive)
- [ ] Status column: use `Badge` component (color-coded)
- [ ] Action column: use icon buttons (`Edit`, `Delete`, `View`)
- [ ] Pagination: show rows per page dropdown + page numbers
- [ ] Responsive: scroll table on mobile (not stacked)

---

### Pattern 6: Hero / Header Section
**Use for:** Landing pages, workspace overviews, page introductions

**Structure:**
```
[Large Headline / Image]
[Subtitle / CTA]
[Supporting Content Grid]
```

**Frozen Components:** `BrandLogo`, `Button`, `Card`

**Checklist:**
- [ ] Headline: largest type size (use `text-4xl` or `text-5xl`)
- [ ] Subheading: one level smaller (use `text-2xl` or `text-3xl`)
- [ ] CTA button: Navy primary, 40–48px height
- [ ] Background: use semantic color (`--iv-navy-50` for light bg)
- [ ] Spacing: generous (48–64px padding)
- [ ] Hero image: 16:9 aspect, high quality

---

### Pattern 7: Modal / Dialog
**Use for:** Confirmations, alerts, form dialogs

**Structure:**
```
[Title]
[Content]
[Button Bar]
```

**Frozen Components:** `Modal`, `Button`, `Alert`

**Checklist:**
- [ ] Title: clear, action-oriented ("Confirm Delete?", not "Alert")
- [ ] Content: concise, one job per modal
- [ ] Primary action: Navy/Button-primary (e.g., "Delete")
- [ ] Secondary action: Ghost (e.g., "Cancel")
- [ ] Backdrop: semi-transparent (prevents interaction outside)

---

### Palette Rules (Never Vary)

**Primary:** Navy (`--iv-navy-700`, `--primary`)
- Main nav, sidebar, primary buttons, headlines

**Interactive:** Indigo (`--iv-brand-500`, `--secondary`)
- Hover states, focus rings, secondary buttons, links

**Accent:** Gold (`--iv-amber-400`, `--accent`)
- Badges, premium features, highlights, icons

**Semantic:**
- Success: `--iv-green-500`
- Warning: `--iv-yellow-500`
- Error: `--iv-red-500`
- Info: `--iv-blue-500`

**Neutrals:** Slate (`--iv-slate-*`)
- Backgrounds, borders, text hierarchy

---

## How to Use This Skill

1. **Identify the surface type:** Is it a dashboard (sidebar+content)? A list (card grid)? A form?
2. **Pick the matching pattern** from above
3. **Copy the structure** and frozen components
4. **Customize content** (text, data, colors from palette)
5. **Verify against checklist** (do all items ✓?)

---

## Example: Build a Vendor Profile Page

**Surface type:** Multi-section workspace → **Pattern 3: Tabbed Workspace**

**Structure:**
```
Tab: Overview
  ├─ Vendor info card (name, location, rating)
  ├─ Capability matrix (4 checkboxes)
  └─ Trust score badge

Tab: Catalog
  └─ Product card grid (Pattern 2)

Tab: Engagement
  └─ Document timeline (custom, but use Card components)
```

**Checklist:**
- [ ] Use `WorkspaceTabs` (frozen)
- [ ] Cards: 16px or 24px padding
- [ ] Colors: Navy headings, Indigo links, Amber badges
- [ ] Type: headlines `text-2xl`, body `text-base`
- [ ] Responsive: mobile collapse tabs to dropdown

---

## Anti-Patterns (Don't Do)

- ❌ Invent a new card layout (use Pattern 2)
- ❌ Build a custom tab component (use `WorkspaceTabs`)
- ❌ Hand-pick colors (use tokens only)
- ❌ Mix sidebar + card grid on same page (pick one pattern)
- ❌ Use more than 5 colors (use Navy, Indigo, Gold + semantics)

---

## Reference

- `/ivendorz-fe-design` — frozen palette, typography, kit
- `src/frontend/` — component exports
- **Doc-7B–7G:** Page-level UI specs (examples of applied patterns)
- **Memory:** `brand-palette-migration.md`, `frontend-foundation-frozen.md`
