// S14 Preview & Publish — presentation-only. Read-only preview + the FROZEN publish/unpublish state
// machine (Doc-4M: draft / published / unpublished). The live preview connects in the integration
// phase (no backend here). Publish consumes no quota and never affects matching (DP5). Buttons are
// disabled (no mock business logic). marketplace.publish_microsite.v1 is the distinct contract
// ([ESC-7G-06] CLOSED) — wired in integration.
//
// DS-W0-R1 (2026-07-20, owner ruling): this surface is ALSO step 3 of the Digital Showcase authoring
// journey ("Preview & Publish"), composed by `/sell/company/journey?step=publish` and reused rather
// than duplicated. Aligned to the APPROVED Stage-3 prototype (v0.2): browser-chrome preview frame,
// desktop/mobile preview widths, the structural section preview in the vendor's arranged order, and
// the trust statement beside the publication controls.
//
// The width toggle is CSS-ONLY — two native radios plus `has-[]`, the same technique the template
// picker uses. That keeps this component Server-rendered with no hooks and no client boundary. It
// switches a layout width directly rather than animating it: the motion standard permits only
// opacity/transform transitions, and `max-width` is neither.
//
// SINGLE-INSTANCE CONSTRAINT (deliberate, documented). The radio ids and the `name` are literals
// because Tailwind's JIT only compiles selectors it can see in the source — `group-has-[#id:checked]`
// cannot take a runtime-generated id. Two of these panels must therefore never mount in the same
// document: they would share one radio group and their labels would target the first instance. That
// is unreachable today — the panel renders on `/sell/company/journey?step=publish` (one step at a
// time) and inside the `/sell/microsite` "Preview & publish" tab (Radix unmounts inactive tabs), and
// those are different pages. If a surface ever needs two side by side, promote the toggle to a small
// client component with `useId()` rather than parameterising these strings.
//
// TRUST FIREWALL. The public showcase carries a BINARY Verified badge — present or absent — and
// nothing else: no score, rating, percentage, job count, or star. `verified` is an M5-owned signal
// and is therefore a panel prop, NOT a field on the M2 `MicrositeView`. Absent (the presentation
// phase) means the badge does not render; it is never assumed true. This is the standing DS-W2A-B1
// guardrail: the audited reference kits each led with a fabricated trust panel, and that panel must
// never be recreated in any template.
import { ExternalLink, Eye } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import { PresentationContextBanner } from "./presentation-context-banner";
import { MicrositeStatusChip } from "./status-chips";
import { templateEntry } from "./template-catalog";
import { PresentationFormNote } from "../shared";
import { isPubliclyVisibleSection, type MicrositeSectionView, type MicrositeView } from "./types";

export interface PreviewPublishPanelProps {
  microsite?: MicrositeView;
  /** Sections in the vendor's arranged order — the preview renders them, it does not re-sort them. */
  sections?: MicrositeSectionView[];
  /**
   * M5-owned binary verification signal. Absent ⇒ no badge. Never a score, rating, or count, and
   * never defaulted to `true` — an unread signal is an absence, not a claim.
   */
  verified?: boolean;
}

const WIDTH_LABEL_CLASS =
  "cursor-pointer rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground";

// Each option carries its OWN peer classes. Deriving them from `defaultChecked` (as this first did)
// only worked because the first entry happened to be both "desktop" and the default — flipping which
// option is pre-checked would silently point each label at the other's peer.
const WIDTH_OPTIONS = [
  {
    id: "preview-width-desktop",
    label: "Desktop",
    defaultChecked: true,
    peerClass: "peer/desktop",
    activeClass:
      "peer-checked/desktop:border-primary peer-checked/desktop:bg-primary peer-checked/desktop:text-primary-foreground peer-focus-visible/desktop:ring-2 peer-focus-visible/desktop:ring-ring",
  },
  {
    id: "preview-width-mobile",
    label: "Mobile",
    defaultChecked: false,
    peerClass: "peer/mobile",
    activeClass:
      "peer-checked/mobile:border-primary peer-checked/mobile:bg-primary peer-checked/mobile:text-primary-foreground peer-focus-visible/mobile:ring-2 peer-focus-visible/mobile:ring-ring",
  },
] as const;

export function PreviewPublishPanel({ microsite, sections, verified }: PreviewPublishPanelProps) {
  const isPublished = microsite?.status === "published";
  // DS-W3: name the template the vendor actually chose, using the same binding the builder writes
  // (`template-catalog.ts`) — preview and builder must never disagree about what is selected.
  const chosenTemplate = templateEntry(microsite?.layout_template);
  // Both axes, per the frozen public-read policy — never `publish_state` alone (see `types.ts`).
  const visibleSections = sections?.filter(isPubliclyVisibleSection) ?? [];
  const hiddenCount = (sections?.length ?? 0) - visibleSections.length;

  return (
    <div className="space-y-6">
      <PresentationContextBanner />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye aria-hidden="true" className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Preview &amp; publish</p>
        </div>
        <MicrositeStatusChip status={microsite?.status} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-2">
          {/* The preview frame is a kit Card — the browser chrome lives INSIDE it. Hand-rolling
              `rounded-lg border bg-card` here would duplicate a kit primitive. */}
          <Card className="group/preview overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted px-3 py-2">
              <span aria-hidden="true" className="flex shrink-0 items-center gap-1">
                <span className="size-2 rounded-full bg-border" />
                <span className="size-2 rounded-full bg-border" />
                <span className="size-2 rounded-full bg-border" />
              </span>
              <span className="truncate font-mono text-xs text-muted-foreground">
                {microsite?.live_url ?? "Not published yet"}
              </span>
              {/* Hidden below `sm`: on a phone the preview column is already narrower than the
                  320px "Mobile" width, so the control would light up having changed nothing. */}
              <fieldset className="ml-auto hidden shrink-0 items-center gap-1 sm:flex">
                <legend className="sr-only">Preview width</legend>
                {WIDTH_OPTIONS.map((option) => (
                  <span key={option.id} className="contents">
                    <input
                      id={option.id}
                      type="radio"
                      name="preview_width"
                      defaultChecked={option.defaultChecked}
                      className={`${option.peerClass} sr-only`}
                    />
                    <label
                      htmlFor={option.id}
                      className={`${WIDTH_LABEL_CLASS} ${option.activeClass}`}
                    >
                      {option.label}
                    </label>
                  </span>
                ))}
              </fieldset>
              <span className="shrink-0 text-xs text-muted-foreground">
                {chosenTemplate ? chosenTemplate.name : "No template chosen"}
              </span>
            </div>

            <div className="p-4">
              <div className="mx-auto w-full group-has-[#preview-width-mobile:checked]/preview:max-w-[320px]">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    Your public showcase
                  </span>
                  {verified ? <StatusChip label="Verified" tone="success" /> : null}
                </div>
                {visibleSections.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {visibleSections.map((section, index) => (
                      <li
                        key={section.section_id}
                        className={
                          // Semantic tokens, not a fixed ramp value: the lead block must stay
                          // legible in the dark theme too (`bg-iv-navy-700` + `text-white` would be
                          // dark-on-dark there).
                          index === 0
                            ? "rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                            : "rounded-sm border border-dashed border-border bg-muted px-3 py-2 text-xs text-muted-foreground"
                        }
                      >
                        {section.section_name ?? "Untitled section"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Your sections will appear here in the order you arrange them.
                  </p>
                )}
                {hiddenCount > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {hiddenCount} hidden section{hiddenCount > 1 ? "s" : ""} — left out of your
                    public page entirely.
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
          <p className="text-xs text-muted-foreground">
            Structural preview — section blocks in your chosen order. The rendered design connects
            in the integration phase.
          </p>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Publishing</CardTitle>
              {microsite?.live_url ? (
                <Button asChild variant="ghost" size="sm">
                  <a href={microsite.live_url} target="_blank" rel="noreferrer">
                    Open <ExternalLink aria-hidden="true" className="size-4" />
                  </a>
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {isPublished
                  ? "Your microsite is live. Unpublishing hides it; your content and branding are kept."
                  : "Publishing makes your microsite public. It does not affect matching and uses no quota."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled>
                  Publish microsite
                </Button>
                <Button type="button" variant="outline" disabled>
                  Unpublish
                </Button>
              </div>
              <PresentationFormNote />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trust on your public page</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your public showcase shows a Verified badge only — present or absent. No score,
                rating, percentage, or job count is ever displayed on it.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
