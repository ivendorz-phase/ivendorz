# ivendorz-fe-design Skill

**Invoke:** `/ivendorz-fe-design`

## Purpose
Encodes frozen design decisions (palette, typography, kit, patterns) to keep new UI consistent with the platform foundation. Speeds up page/component design by anchoring to existing system instead of reaching for defaults.

## When to Use
- Designing new pages or major UI surfaces
- Building components that should match platform aesthetic
- Reviewing new UI for consistency with frozen kit/tokens
- Deciding "which existing pattern fits this?"

---

## Frozen Foundation Reference

### Brand Palette
- **Navy (dominant)**: `--iv-navy-*` (sidebar, main nav, primary actions)
- **Indigo (interactive)**: `--iv-brand-*` (secondary interactions, focus states)
- **Gold (premium)**: `--iv-amber-*` (highlights, premium features, badges)
- **Semantic**: `--iv-success/warning/error/info` (per-use status colors)
- **Neutrals**: `--iv-slate-*` (backgrounds, borders, text hierarchy)

**Token pattern:** Named tokens only, no hand-picked hex codes. Use `--primary`, `--secondary`, `--accent` mapped to the palette above.

### Typography
Source: **Doc-7B (Kit Foundation)** — never deviate without architecture approval.
- **Display face:** [check kit for serif/sans choice]
- **Body face:** [check kit for system font]
- **Type scale:** [8-step scale defined in Tailwind config]
- **Font weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold) — no intermediate weights

**Rule:** Use only `text-xs | sm | base | lg | xl | 2xl | 3xl | 4xl` size classes. Never `text-[14px]` (bypasses type scale).

### Layout Patterns

**Sidebar + Content:**
- Navy sidebar (width: 256px or responsive collapse)
- Content area with max-width container
- Stack order: logo/branding → primary nav → secondary → footer

**Card Grid:**
- 12-column grid, 24px gap
- Responsive: 1 col mobile → 2 col tablet → 3–4 col desktop
- Card padding: 16px (small) or 24px (large)
- Border radius: 8px (default, no 4px or 16px without reason)

**Tabs & Sections:**
- Use `WorkspaceTabs` from `src/frontend/shared/` (frozen component)
- Tab content: lazy-loaded where possible
- Always show active state + hover state

**Forms:**
- Use kit primitives: `Input`, `Button`, `Select`, `Textarea` from `src/frontend/`
- No raw `<input>` or `<button>` (duplication = A-lane MINOR)
- Labels above fields, 8px spacing
- Required indicator: red `*` after label text

### Component Inventory (Never Duplicate)

From `src/frontend/`:
- **Brand:** `BrandLogo`, `BrandMark`
- **Navigation:** `SideBar`, `TopBar`, `MegaMenu`, `WorkspaceTabs`
- **Forms:** `Input`, `Button`, `Select`, `Textarea`, `Checkbox`, `Radio`, `DatePicker`
- **Data:** `Table`, `DataGrid`, `Card`, `Badge`, `Avatar`
- **Feedback:** `Toast`, `Alert`, `Modal`, `Tooltip`, `Popover`
- **Layout:** `Container`, `Stack`, `Grid`, `Flex`

**Rule:** Before building a component, check `src/frontend/` — if kit primitive exists, use it. If you need a variant, extend the kit primitive, never rebuild.

---

## Design Decision Flow

1. **Anchor to subject:** What's the page's single job? (e.g., "Buyer approves POs")
2. **Pick a layout pattern:** Sidebar+content? Card grid? Tabs? (reuse from above)
3. **Select palette:** Navy primary + Indigo interactive + Amber accent? (match frozen choices)
4. **Identify components:** Which kit primitives needed? (Input, Button, Card, etc.)
5. **Review against frozen:** Does this match the kit foundation? Any invented patterns?

**When to ask for override:** If you need a pattern NOT in the frozen kit, escalate before building.

---

## Common Pitfalls (Don't Do This)

- ❌ Hand-pick hex colors (use tokens only)
- ❌ Import `MegaMenu` into vendor workspace (wrong context, use `WorkspaceTabs` instead)
- ❌ Build a `<select>` instead of using kit `Select`
- ❌ Use `text-[14px]` instead of `text-sm`
- ❌ Create custom tab component (use frozen `WorkspaceTabs`)
- ❌ Invent new border radius (use 8px standard)
- ❌ Add a 4th color to palette (Navy, Indigo, Gold only + semantics)

---

## Reference

- **Doc-7B:** Kit Foundation (TypeScript, components, tokens)
- **Doc-7C:** Public Shell (layout, typography, theme)
- **Doc-7D–7G:** Buyer, Vendor, Admin, AI UI specs (page-level use of frozen kit)
- **Memory:** `frontend-foundation-frozen.md` (kit is shared platform, extend don't duplicate)
- **Memory:** `brand-palette-migration.md` (Navy dominant, Indigo interactive, Gold premium)
- **Memory:** `official-brand-logo.md` (use `BrandLogo`/`BrandMark` from kit)
- **Token reference:** `src/frontend/theme/tokens.ts` (authoritative palette)
- **Component inventory:** `src/frontend/index.ts` (all exportable primitives)

---

## Checklist Before Submitting

- [ ] All colors use token names (`--iv-navy-700`), not hex codes
- [ ] All text sizes use Tailwind scale (`text-sm`, `text-lg`), not pixels
- [ ] No raw `<input>`, `<button>`, `<select>` — used kit primitives
- [ ] Layout matches a frozen pattern (sidebar+content, card grid, tabs)
- [ ] Used `WorkspaceTabs` where tabs needed (not custom tab component)
- [ ] Responsive breakpoints: mobile (base) → tablet (md:) → desktop (lg:)
- [ ] No unnecessary border radius or spacing (use 8px standard, 24px gaps)
- [ ] Palette: Navy primary, Indigo secondary, Gold accent only
