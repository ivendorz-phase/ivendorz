// S10 Microsite Builder — presentation-only (DP5/Invariant 9: never affects matching). Binds the
// frozen marketplace.microsites.layout_template (A–E) + the sections list. The section_type set is
// contract-owned (not a hardcoded enum); section content editing is integration-phase. Reorder is a
// visual handle only (no drag logic). Uncontrolled controls; Save disabled (no mock business logic).
//
// DS-W2B (2026-07-20): the opaque "Template A…E" select is replaced by NAMED template cards, using
// the name↔letter binding in `template-catalog.ts` (plan §3A.0). That binding is **PROPOSED — Board
// mint pending (G3 READY)**, so nothing here treats it as authoritative semantics: the written value
// is unchanged — still the frozen `layout_template` enum — and the letters stay opaque slots. Native
// radio inputs keep this Server-render-friendly (no hooks, works without JS); the vendor's choice is
// never mutated for them, and business type never restricts which templates are offered (all five
// are always selectable).
//
// DS-W0-R1 (2026-07-20, owner ruling): this surface is ALSO step 2 of the Digital Showcase authoring
// journey ("Choose Template + Arrange Sections"), composed by `/sell/company/journey?step=design`.
// It is reused, never duplicated — one editor, one implementation, two entry points. The journey
// supplies its own rail and Back/Next; this component owns only the two settings and their Save.
//
// TWO SETTINGS, TWO STATE MODELS (the plan's §3A.0 hybrid ruling in mechanical form). Template
// selection is PRESENTATION STYLE (`microsites.layout_template`); section arrangement is CONTENT
// EMPHASIS (`profile_sections.display_order` / `is_visible`). They are independent by construction
// here: they bind different fields, sit in different form controls, and neither can reset the other.
import { ArrowDown, ArrowUp, Eye, GripVertical, Plus } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { PresentationContextBanner } from "./presentation-context-banner";
import { MicrositeStatusChip, VisibilityChip } from "./status-chips";
import { TEMPLATE_CATALOG } from "./template-catalog";
import { PresentationFormNote } from "../shared";
import type { MicrositeSectionView, MicrositeView } from "./types";

// Section-arrangement presets — ✅ RULED (owner, 2026-07-20, Option B; escalation
// `governanceReviews/ESC-MKT-ARRANGEMENT-PRESETS_FlagAndHalt_v1.0.md`, now CLOSED).
//
// The Flag-and-Halt raised here was that the approved prototype named these starting points by
// BUSINESS SHAPE (manufacturer / engineering-service / catalogue-retailer / hybrid), which collides
// with Board decision FE-PUB-09 (vendor-type labels rejected as coined; vendor typing stays the
// frozen 4-flag matrix, Invariant #1), with the still-open `ESC-MKT-VENDORTYPE`, and — for "hybrid"
// — with a reserved Invariant #2 Participation term.
//
// The ruling keeps the MECHANISM and renames the labels around PRESENTATION EMPHASIS, so no vendor
// type is named, coined, inferred, or implied. Binding semantics, all of which the wiring must keep:
//
//  • a preset only reorders / toggles governed `profile_sections` rows;
//  • it never changes the selected template;
//  • it never persists or infers a vendor type — no preset name is stored, echoed publicly, or read
//    back, and none reaches a contract, event, column or URL;
//  • it never creates a Services or Departments aggregate (F7);
//  • it is user-triggered, reversible (hence "Reset to default order"), and non-binding — nothing is
//    auto-applied and every template stays selectable whichever preset was used;
//  • applying one must SHOW EXACTLY WHAT CHANGED.
//
// That last requirement is why these render DISABLED today: no sections read and no
// `update_profile_sections.v1` are wired, so there is nothing to reorder and no diff to show. They
// become interactive in the same pass that wires the sections read (see the disabled-state note in
// the card).
const SECTION_ARRANGEMENT_PRESETS = [
  "Balanced overview",
  "Lead with capabilities",
  "Lead with catalogue",
  "Lead with delivered work",
  "Lead with products and capabilities",
] as const;

export interface MicrositeBuilderProps {
  microsite?: MicrositeView;
  sections?: MicrositeSectionView[];
}

export function MicrositeBuilder({ microsite, sections }: MicrositeBuilderProps) {
  return (
    <div className="space-y-6">
      <PresentationContextBanner />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Status</p>
        <MicrositeStatusChip status={microsite?.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Template</CardTitle>
        </CardHeader>
        <CardContent>
          <fieldset className="space-y-3">
            <legend className="sr-only">Choose a presentation template</legend>
            <p className="text-sm text-muted-foreground">
              Choose how your public showcase looks. Your content stays the same — the template
              changes only how it is presented, and you can change it at any time.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {TEMPLATE_CATALOG.map((entry) => (
                <label
                  key={entry.template}
                  htmlFor={`layout-template-${entry.template}`}
                  className="group relative flex cursor-pointer flex-col gap-1 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring has-[:checked]:border-primary"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{entry.name}</span>
                    <input
                      id={`layout-template-${entry.template}`}
                      type="radio"
                      name="layout_template"
                      value={entry.template}
                      // An UNREAD `layout_template` is an absence, never the frozen DB default
                      // dressed up as the vendor's choice: falling back to `DEFAULT_LAYOUT_TEMPLATE`
                      // here would pre-select "Corporate Classic" on a surface where step 1 says
                      // "Not chosen yet" and step 3 says "No template chosen", and would submit a
                      // choice the vendor never made once Save is wired.
                      defaultChecked={microsite?.layout_template === entry.template}
                      className="mt-0.5 size-4 shrink-0 accent-primary"
                    />
                  </span>
                  <span className="text-xs text-muted-foreground">{entry.description}</span>
                  <span className="text-xs text-muted-foreground">{entry.emphasis}</span>
                  <span className="mt-1 text-xs font-medium text-muted-foreground">
                    {entry.pageModel === "single" ? "Single page" : "Multi-page"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Arrange your sections</CardTitle>
          <Button type="button" variant="outline" size="sm" disabled>
            <Plus aria-hidden="true" className="size-4" /> Add section
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Section order + visibility is where content EMPHASIS lives (frozen
              `profile_sections.display_order` / `is_visible`) — deliberately separate from the
              template choice above. That separation is the plan's §3A.0 ruling in mechanical form:
              a vendor emphasizes what suits their business without being bound to a template. */}
          <p className="text-sm text-muted-foreground">
            Sections control what appears on your public showcase and in what order. Hidden sections
            are left out entirely. Arranging sections changes what you lead with — it never changes
            your template, and your template never changes this arrangement.
          </p>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Start from an arrangement</p>
            <div className="flex flex-wrap gap-2">
              {SECTION_ARRANGEMENT_PRESETS.map((preset) => (
                <Button key={preset} type="button" variant="outline" size="sm" disabled>
                  {preset}
                </Button>
              ))}
              <Button type="button" variant="ghost" size="sm" disabled>
                Reset to default order
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              A suggested starting order you can change afterwards — it never changes your template,
              and every template stays available whichever one you start from. Available once your
              sections are connected.
            </p>
          </div>

          {sections && sections.length > 0 ? (
            <ul className="divide-y divide-border rounded-md border border-border">
              {sections.map((section, index) => (
                <li key={section.section_id} className="flex items-center gap-3 p-3">
                  <GripVertical
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {section.order ?? index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {section.section_name ?? "Untitled section"}
                    </p>
                    {section.section_type ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {section.section_type}
                      </p>
                    ) : null}
                  </div>
                  <VisibilityChip visibility={section.visibility} />
                  {/* Order + visibility handles. Disabled until `update_profile_sections.v1` is
                      wired — a control that silently does nothing is worse than one that says so. */}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled
                      aria-label={`Move ${section.section_name ?? "section"} up`}
                    >
                      <ArrowUp aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled
                      aria-label={`Move ${section.section_name ?? "section"} down`}
                    >
                      <ArrowDown aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled
                      aria-label={`Change visibility of ${section.section_name ?? "section"}`}
                    >
                      <Eye aria-hidden="true" className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Start by adding a section"
              description="Sections make up your microsite. Add one to begin."
            />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <PresentationFormNote />
        <Button type="button" disabled>
          Save design
        </Button>
      </div>
    </div>
  );
}
